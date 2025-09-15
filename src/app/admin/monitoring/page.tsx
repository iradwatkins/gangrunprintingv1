'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Monitor,
  Server,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Target,
  Zap,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface MonitoringData {
  system: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
    cpu: number;
    memory: number;
    activeUsers: number;
  };
  business: {
    todayRevenue: number;
    todayOrders: number;
    conversionRate: number;
    cartAbandonmentRate: number;
    averageOrderValue: number;
  };
  performance: {
    pageLoadTime: number;
    apiResponseTime: number;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  errors: Array<{
    id: string;
    message: string;
    count: number;
    lastOccurred: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  alerts: Array<{
    id: string;
    title: string;
    description: string;
    type: 'info' | 'warning' | 'error';
    timestamp: string;
  }>;
}

// Mock data - in real implementation, this would come from your monitoring APIs
const mockData: MonitoringData = {
  system: {
    status: 'healthy',
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.12,
    cpu: 34,
    memory: 68,
    activeUsers: 142,
  },
  business: {
    todayRevenue: 15420,
    todayOrders: 89,
    conversionRate: 3.4,
    cartAbandonmentRate: 68.2,
    averageOrderValue: 173.2,
  },
  performance: {
    pageLoadTime: 1.8,
    apiResponseTime: 245,
    coreWebVitals: {
      lcp: 2.1,
      fid: 0.08,
      cls: 0.05,
    },
  },
  errors: [
    {
      id: '1',
      message: 'Payment gateway timeout',
      count: 12,
      lastOccurred: '2025-01-15T10:30:00Z',
      severity: 'high',
    },
    {
      id: '2',
      message: 'Database connection pool exhausted',
      count: 3,
      lastOccurred: '2025-01-15T09:15:00Z',
      severity: 'critical',
    },
    {
      id: '3',
      message: 'Image upload failed',
      count: 45,
      lastOccurred: '2025-01-15T11:45:00Z',
      severity: 'medium',
    },
  ],
  alerts: [
    {
      id: '1',
      title: 'High CPU Usage',
      description: 'CPU usage exceeded 80% threshold',
      type: 'warning',
      timestamp: '2025-01-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'New Error Spike',
      description: 'Payment errors increased by 200% in the last hour',
      type: 'error',
      timestamp: '2025-01-15T10:15:00Z',
    },
  ],
};

// Sample data for charts
const performanceData = [
  { time: '00:00', responseTime: 200, errorRate: 0.1, users: 45 },
  { time: '04:00', responseTime: 180, errorRate: 0.08, users: 23 },
  { time: '08:00', responseTime: 250, errorRate: 0.15, users: 89 },
  { time: '12:00', responseTime: 300, errorRate: 0.2, users: 156 },
  { time: '16:00', responseTime: 280, errorRate: 0.18, users: 203 },
  { time: '20:00', responseTime: 220, errorRate: 0.12, users: 178 },
];

const revenueData = [
  { hour: '00:00', revenue: 520, orders: 3 },
  { hour: '04:00', revenue: 230, orders: 1 },
  { hour: '08:00', revenue: 1850, orders: 12 },
  { hour: '12:00', revenue: 3200, orders: 18 },
  { hour: '16:00', revenue: 4500, orders: 25 },
  { hour: '20:00', revenue: 5120, orders: 30 },
];

const errorDistribution = [
  { name: 'API Errors', value: 35, color: '#ef4444' },
  { name: 'Payment Issues', value: 25, color: '#f97316' },
  { name: 'Database', value: 20, color: '#eab308' },
  { name: 'Frontend', value: 15, color: '#3b82f6' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

export default function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData>(mockData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData(mockData);
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
          <p className="text-gray-600">Real-time system and business metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Monitor className={`h-4 w-4 ${getStatusColor(data.system.status)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{data.system.status}</div>
            <p className="text-xs text-gray-600">
              Uptime: {formatPercentage(data.system.uptime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.system.responseTime}ms</div>
            <p className="text-xs text-gray-600">
              Error rate: {formatPercentage(data.system.errorRate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.system.activeUsers}</div>
            <p className="text-xs text-gray-600">
              CPU: {data.system.cpu}% | Memory: {data.system.memory}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.business.todayRevenue)}</div>
            <p className="text-xs text-gray-600">
              {data.business.todayOrders} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {data.alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
          <div className="space-y-2">
            {data.alerts.map((alert) => (
              <Alert key={alert.id} className={getAlertColor(alert.type)}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription className="mt-1">
                  {alert.description}
                  <span className="block text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Monitoring Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time & Error Rate</CardTitle>
                <CardDescription>24-hour performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Response Time (ms)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="errorRate"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Error Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>User experience metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Largest Contentful Paint (LCP)</span>
                  <span className={`text-sm font-bold ${data.performance.coreWebVitals.lcp <= 2.5 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {data.performance.coreWebVitals.lcp}s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">First Input Delay (FID)</span>
                  <span className={`text-sm font-bold ${data.performance.coreWebVitals.fid <= 0.1 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {data.performance.coreWebVitals.fid}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cumulative Layout Shift (CLS)</span>
                  <span className={`text-sm font-bold ${data.performance.coreWebVitals.cls <= 0.1 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {data.performance.coreWebVitals.cls}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue & Orders</CardTitle>
                <CardDescription>24-hour business performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Revenue"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stackId="2"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Business performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatPercentage(data.business.conversionRate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cart Abandonment</span>
                    <span className="text-sm font-bold text-orange-600">
                      {formatPercentage(data.business.cartAbandonmentRate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Order Value</span>
                    <span className="text-sm font-bold text-blue-600">
                      {formatCurrency(data.business.averageOrderValue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
                <CardDescription>Most recent system errors and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.errors.map((error) => (
                    <div key={error.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(error.severity)}>
                            {error.severity}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {error.count} occurrences
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-1">{error.message}</p>
                        <p className="text-xs text-gray-500">
                          Last occurred: {new Date(error.lastOccurred).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Distribution</CardTitle>
                <CardDescription>Breakdown by error type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errorDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {errorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Server performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm font-bold">{data.system.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${data.system.cpu}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm font-bold">{data.system.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${data.system.memory}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uptime</span>
                    <span className="text-sm font-bold">{formatPercentage(data.system.uptime)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${data.system.uptime}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Connections</CardTitle>
                <CardDescription>Real-time user activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>Recent system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {alert.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}