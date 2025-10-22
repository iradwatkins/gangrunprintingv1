# Cache Invalidation Guide
**Date**: October 22, 2025
**Project**: GangRun Printing

---

## Overview

The cache invalidation system ensures cached data is refreshed when underlying data changes. This guide documents the patterns and implementation.

## Cache Invalidation API

### Endpoint

**POST** `/api/cache/invalidate`

**Authentication**: Admin only

**Request Body**:
```json
{
  "patterns": ["products:*", "categories:*"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Cleared 245 cache entries",
  "results": {
    "products:*": 230,
    "categories:*": 15
  },
  "patterns": ["products:*", "categories:*"]
}
```

### Getting Available Patterns

**GET** `/api/cache/invalidate`

Returns documentation of all available cache patterns with descriptions and examples.

---

## Cache Patterns

### Product Data
- `products:*` - All product caches
- `products:simple:list` - Simple product list
- `products:category:*` - Products by category
- `categories:*` - All category caches
- `categories:active:list` - Active categories

### Configuration Options
- `coating:options:list` - Coating options
- `sides:options:list` - Sides options
- `turnaround:times:list` - Turnaround times
- `turnaround:sets:list` - Turnaround time sets
- `sizes:list:*` - Size groups (all or active)
- `paper:stocks:list` - Paper stocks

### Theme Settings
- `themes:*` - All theme caches
- `themes:list` - Theme list
- `themes:active` - Active theme

### Design & Addon Sets
- `design:set:*` - All design sets
- `design:set:{id}` - Specific design set
- `addon:set:*` - All addon sets
- `addon:set:{id}` - Specific addon set

### Shipping
- `shipping:rates:*` - All shipping rate calculations

### Metrics
- `metrics:*` - All metrics
- `metrics:production:*` - Production metrics
- `metrics:system` - System health metrics

---

## Automatic Invalidation

### Product Creation/Update

**Location**: `src/app/api/products/route.ts:555-556`

```typescript
// Invalidate product and category caches after successful creation
await cache.clearPattern('products:*')
await cache.clearPattern('categories:*')
```

**Triggers**: After successful product creation in POST endpoint

---

## Manual Invalidation

### Using curl

```bash
# Invalidate product caches
curl -X POST https://gangrunprinting.com/api/cache/invalidate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patterns": ["products:*", "categories:*"]}'

# Invalidate specific design set
curl -X POST https://gangrunprinting.com/api/cache/invalidate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patterns": ["design:set:abc123"]}'

# Clear all caches
curl -X POST https://gangrunprinting.com/api/cache/invalidate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patterns": ["*"]}'
```

### Using Admin Panel (Future)

Create an admin UI for cache management:
- View cached keys and sizes
- Clear specific patterns
- Clear all caches
- View cache hit/miss rates

---

## Adding Invalidation to New Endpoints

### Pattern

When creating/updating/deleting data that affects cached endpoints:

```typescript
import { cache } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    // ... validation and data processing ...

    // Perform database operation
    const result = await prisma.model.create({...})

    // Invalidate affected caches
    await cache.clearPattern('resource:*')
    await cache.clearPattern('related:*')

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    // ... error handling ...
  }
}
```

### Recommended Patterns by Operation

**Product CRUD**:
- Clear: `products:*`, `categories:*`

**Category CRUD**:
- Clear: `categories:*`, `products:*`

**Configuration Changes (coatings, sides, paper stocks, etc.)**:
- Clear specific pattern: `coating:*`, `sides:*`, `paper:*`

**Design/Addon Set Changes**:
- Clear specific set: `design:set:{id}` or `addon:set:{id}`
- Or clear all: `design:set:*` or `addon:set:*`

**Theme Changes**:
- Clear: `themes:*`

---

## Monitoring Cache Performance

### Check Cache Hit Rates

```bash
# Connect to Redis
docker exec -it gangrunprinting-redis redis-cli

# View all keys
KEYS *

# Get key info
INFO keyspace

# Check specific key
GET "products:simple:list"
TTL "products:simple:list"
```

### Performance Metrics

**Target Metrics**:
- Cache hit rate: >85%
- Cached response time: <10ms
- Uncached response time: <150ms
- Database load reduction: 60-70%

---

## Troubleshooting

### Cache Not Clearing

**Check Redis Connection**:
```bash
docker ps | grep redis
docker logs gangrunprinting-redis
```

**Verify Pattern Match**:
```bash
docker exec -it gangrunprinting-redis redis-cli KEYS "products:*"
```

### Stale Data in Cache

**Manual Clear**:
```bash
# Clear specific pattern
docker exec -it gangrunprinting-redis redis-cli --eval "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" , "products:*"

# Clear all caches
docker exec -it gangrunprinting-redis redis-cli FLUSHDB
```

### High Cache Miss Rate

**Possible Causes**:
1. Cache keys not matching patterns
2. TTL too short
3. Frequent data updates triggering invalidation
4. Redis memory limit reached

**Solutions**:
1. Review cache key generation
2. Adjust TTL values (currently 3600s for config, 300s for shipping, 900s for metrics)
3. Implement more granular invalidation (specific IDs instead of wildcards)
4. Increase Redis memory allocation

---

## Best Practices

1. **Granular Invalidation**: Clear only affected caches, not everything
2. **Async Invalidation**: Don't block responses waiting for cache clear
3. **Pattern Consistency**: Use consistent naming conventions for cache keys
4. **Monitor Performance**: Track cache hit rates and response times
5. **Documentation**: Document when adding new cached endpoints

---

## Related Files

- **Cache Library**: `/src/lib/redis.ts`
- **Invalidation API**: `/src/app/api/cache/invalidate/route.ts`
- **Product Creation**: `/src/app/api/products/route.ts:555-556`
- **Performance Docs**: `/docs/PERFORMANCE-OPTIMIZATION-COMPLETE-2025-10-22.md`

---

## Future Enhancements

1. **Admin UI**: Visual cache management interface
2. **Cache Analytics**: Track hit rates, sizes, and patterns
3. **Selective Invalidation**: Clear only specific product/category IDs
4. **Webhooks**: Trigger invalidation from external systems
5. **Cache Warming**: Pre-populate caches after invalidation
6. **Time-based Invalidation**: Schedule invalidation during low traffic

---

**Last Updated**: October 22, 2025
**Maintained By**: Development Team
