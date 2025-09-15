import { NextRequest, NextResponse } from 'next/server';
import { withStandardMiddleware } from '@/lib/api-middleware';
import { redis } from '@/lib/redis';
import type { LogEntry } from '@/lib/structured-logging';

interface LogQuery {
  level?: string;
  context?: string;
  correlationId?: string;
  userId?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
  offset?: number;
}

// Store logs in Redis for short-term querying
async function storeLog(log: LogEntry): Promise<void> {
  try {
    const key = `logs:${new Date(log.timestamp).toISOString().split('T')[0]}`;
    const logData = JSON.stringify(log);

    // Store in a sorted set with timestamp as score for efficient querying
    await redis.zadd(key, Date.parse(log.timestamp), logData);

    // Set expiration for log data (7 days)
    await redis.expire(key, 7 * 24 * 60 * 60);

    // Also store in level-specific sets for filtering
    const levelKey = `logs:level:${log.level}`;
    await redis.zadd(levelKey, Date.parse(log.timestamp), logData);
    await redis.expire(levelKey, 7 * 24 * 60 * 60);

    // Store in context-specific sets
    const contextKey = `logs:context:${log.context}`;
    await redis.zadd(contextKey, Date.parse(log.timestamp), logData);
    await redis.expire(contextKey, 7 * 24 * 60 * 60);

    // Store correlation ID mapping for distributed tracing
    if (log.correlationId) {
      const correlationKey = `logs:correlation:${log.correlationId}`;
      await redis.zadd(correlationKey, Date.parse(log.timestamp), logData);
      await redis.expire(correlationKey, 24 * 60 * 60); // 1 day for correlation
    }

  } catch (error) {
    console.error('Failed to store log entry:', error);
  }
}

async function queryLogs(query: LogQuery): Promise<{ logs: LogEntry[]; total: number }> {
  try {
    const {
      level,
      context,
      correlationId,
      userId,
      startTime,
      endTime,
      limit = 100,
      offset = 0
    } = query;

    let baseKey = 'logs:*';
    let useIntersection = false;
    const keys: string[] = [];

    // Determine which keys to query based on filters
    if (correlationId) {
      keys.push(`logs:correlation:${correlationId}`);
      useIntersection = true;
    } else {
      if (level) {
        keys.push(`logs:level:${level}`);
        useIntersection = true;
      }

      if (context) {
        keys.push(`logs:context:${context}`);
        useIntersection = true;
      }

      // If no specific filters, query by date
      if (!useIntersection) {
        const today = new Date().toISOString().split('T')[0];
        keys.push(`logs:${today}`);
      }
    }

    // Determine time range
    const start = startTime ? Date.parse(startTime) : '-inf';
    const end = endTime ? Date.parse(endTime) : '+inf';

    let logData: string[] = [];

    if (useIntersection && keys.length > 1) {
      // Use intersection for multiple filters
      const tempKey = `temp:query:${Date.now()}`;
      await redis.zinterstore(tempKey, keys.length, ...keys);
      logData = await redis.zrevrangebyscore(tempKey, end, start, 'LIMIT', offset, limit);
      await redis.del(tempKey);
    } else {
      // Simple query on single key
      const key = keys[0] || `logs:${new Date().toISOString().split('T')[0]}`;
      logData = await redis.zrevrangebyscore(key, end, start, 'LIMIT', offset, limit);
    }

    // Parse log entries and apply additional filters
    let logs: LogEntry[] = logData.map(data => JSON.parse(data));

    // Apply client-side filters for fields not indexed
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    // Get total count (approximate for performance)
    const totalKey = keys[0] || `logs:${new Date().toISOString().split('T')[0]}`;
    const total = await redis.zcard(totalKey);

    return { logs, total };

  } catch (error) {
    console.error('Failed to query logs:', error);
    return { logs: [], total: 0 };
  }
}

async function getLogStats(): Promise<{
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsByContext: Record<string, number>;
  recentErrors: LogEntry[];
}> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get total logs for today
    const totalLogs = await redis.zcard(`logs:${today}`);

    // Get logs by level
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
    const logsByLevel: Record<string, number> = {};

    for (const level of levels) {
      const count = await redis.zcard(`logs:level:${level}`);
      logsByLevel[level] = count;
    }

    // Get logs by context
    const contexts = ['api', 'auth', 'business', 'system', 'user', 'payment', 'order', 'product'];
    const logsByContext: Record<string, number> = {};

    for (const context of contexts) {
      const count = await redis.zcard(`logs:context:${context}`);
      logsByContext[context] = count;
    }

    // Get recent errors (last 24 hours)
    const errorLogs = await redis.zrevrangebyscore(
      'logs:level:error',
      '+inf',
      Date.now() - 24 * 60 * 60 * 1000,
      'LIMIT',
      0,
      10
    );

    const recentErrors: LogEntry[] = errorLogs.map(data => JSON.parse(data));

    return {
      totalLogs,
      logsByLevel,
      logsByContext,
      recentErrors,
    };

  } catch (error) {
    console.error('Failed to get log stats:', error);
    return {
      totalLogs: 0,
      logsByLevel: {},
      logsByContext: {},
      recentErrors: [],
    };
  }
}

async function handleGet(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'query';

  try {
    switch (action) {
      case 'stats':
        const stats = await getLogStats();
        return NextResponse.json({
          success: true,
          data: stats,
        });

      case 'query':
      default:
        const query: LogQuery = {
          level: searchParams.get('level') || undefined,
          context: searchParams.get('context') || undefined,
          correlationId: searchParams.get('correlationId') || undefined,
          userId: searchParams.get('userId') || undefined,
          startTime: searchParams.get('startTime') || undefined,
          endTime: searchParams.get('endTime') || undefined,
          limit: parseInt(searchParams.get('limit') || '100'),
          offset: parseInt(searchParams.get('offset') || '0'),
        };

        const result = await queryLogs(query);

        return NextResponse.json({
          success: true,
          data: result.logs,
          total: result.total,
          query,
        });
    }
  } catch (error) {
    console.error('Failed to handle GET request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve logs',
      },
      { status: 500 }
    );
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle single log entry or array of entries
    const logEntries: LogEntry[] = Array.isArray(body) ? body : [body];

    // Validate log entries
    for (const entry of logEntries) {
      if (!entry.timestamp || !entry.level || !entry.message || !entry.context) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid log entry format',
          },
          { status: 400 }
        );
      }
    }

    // Store each log entry
    const storePromises = logEntries.map(entry => storeLog(entry));
    await Promise.all(storePromises);

    return NextResponse.json({
      success: true,
      message: `Stored ${logEntries.length} log entries`,
    });

  } catch (error) {
    console.error('Failed to handle POST request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to store log entries',
      },
      { status: 500 }
    );
  }
}

async function handleDelete(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const days = parseInt(searchParams.get('days') || '7');

  try {
    switch (action) {
      case 'cleanup':
        // Clean up logs older than specified days
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

        // Get all log keys
        const keys = await redis.keys('logs:*');

        for (const key of keys) {
          await redis.zremrangebyscore(key, '-inf', cutoffTime);
        }

        return NextResponse.json({
          success: true,
          message: `Cleaned up logs older than ${days} days`,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to handle DELETE request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clean up logs',
      },
      { status: 500 }
    );
  }
}

export const GET = withStandardMiddleware(handleGet, {
  rateLimit: 120, // 120 requests per minute for log queries
  logRequests: false, // Don't log the log API to avoid recursion
  validationOptions: {
    methods: ['GET'],
  },
});

export const POST = withStandardMiddleware(handlePost, {
  rateLimit: 1000, // High rate limit for log ingestion
  logRequests: false, // Don't log the log API to avoid recursion
  validationOptions: {
    methods: ['POST'],
    contentTypes: ['application/json'],
    maxBodySize: 10 * 1024 * 1024, // 10MB for batch log submissions
  },
});

export const DELETE = withStandardMiddleware(handleDelete, {
  rateLimit: 10, // Low rate limit for cleanup operations
  logRequests: true,
  validationOptions: {
    methods: ['DELETE'],
  },
});