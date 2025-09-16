'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from '@/lib/date';
import { 
  Package, 
  RefreshCw, 
  Eye, 
  Filter, 
  Search,
  Calendar,
  FileText,
  Download,
  ChevronRight
} from 'lucide-react';
import { TrackingButton } from '@/components/tracking/tracking-button';
import { type Carrier } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { type DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import { getStatusInfo } from '@/lib/order-management';
import { OrderStatus } from '@prisma/client';

interface Order {
  id: string;
  referenceNumber?: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  carrier?: Carrier;
  OrderItem: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  File?: Array<{
    id: string;
    filename: string;
    fileUrl: string;
  }>;
}

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  validUntil: string;
  pricing: any;
  createdAt: string;
  productDetails: any;
}

export default function OrderHistory() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } else if (activeTab === 'quotes') {
        const response = await fetch('/api/quotes');
        if (response.ok) {
          const data = await response.json();
          setQuotes(data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const response = await fetch('/api/orders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: 'Order data loaded. Redirecting to cart...'
        });
        // Store reorder data in session storage
        sessionStorage.setItem('reorderData', JSON.stringify(data.reorderData));
        // Redirect to cart or product page
        router.push('/cart');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load order data',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error reordering:', error);
      toast({
        title: 'Error',
        description: 'Failed to process reorder',
        variant: 'destructive'
      });
    }
  };

  const handleConvertQuote = async (quoteId: string) => {
    try {
      const response = await fetch('/api/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quoteId, convertToOrder: true })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `Quote converted to order ${data.orderNumber}`
        });
        router.push(`/orders/${data.orderId}`);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to convert quote',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error converting quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert quote',
        variant: 'destructive'
      });
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.OrderItem.some(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const orderDate = new Date(order.createdAt);
    const matchesDate = !dateRange || (
      dateRange.from && orderDate >= dateRange.from &&
      (!dateRange.to || orderDate <= dateRange.to)
    );
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const quoteDate = new Date(quote.createdAt);
    const matchesDate = !dateRange || (
      dateRange.from && quoteDate >= dateRange.from &&
      (!dateRange.to || quoteDate <= dateRange.to)
    );
    
    return matchesSearch && matchesDate;
  });

  const getQuoteStatusBadge = (quote: Quote) => {
    const isExpired = new Date(quote.validUntil) < new Date();
    if (isExpired && quote.status !== 'CONVERTED') {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    const statusColors: Record<string, string> = {
      'DRAFT': 'secondary',
      'SENT': 'default',
      'VIEWED': 'default',
      'ACCEPTED': 'success',
      'REJECTED': 'destructive',
      'EXPIRED': 'destructive',
      'CONVERTED': 'success'
    };
    
    return (
      <Badge variant={statusColors[quote.status] as any || 'default'}>
        {quote.status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order History</h1>
        <p className="text-muted-foreground">View and manage your orders and quotes</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8 w-[250px]"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {activeTab === 'orders' && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.values(OrderStatus).map(status => (
                      <SelectItem key={status} value={status}>
                        {getStatusInfo(status).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button className="gap-2" variant="outline">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button size="icon" variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="orders">
                Orders ({filteredOrders.length})
              </TabsTrigger>
              <TabsTrigger value="quotes">
                Quotes ({filteredQuotes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent className="mt-4" value="orders">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <div>
                            {order.referenceNumber || order.orderNumber}
                            {order.trackingNumber && order.carrier && (
                              <div className="mt-1">
                                <TrackingButton
                                  carrier={order.carrier}
                                  size="sm"
                                  trackingNumber={order.trackingNumber}
                                  variant="outline"
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.OrderItem.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-sm">
                                {item.quantity}x {item.productName}
                              </div>
                            ))}
                            {order.OrderItem.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{order.OrderItem.length - 2} more
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusInfo.color} ${statusInfo.bgColor}`}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          {order.File && order.File.length > 0 ? (
                            <Badge variant="outline">
                              {order.File.length} files
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/orders/${order.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.status === 'DELIVERED' && (
                              <Button
                                size="sm"
                                title="Re-order"
                                variant="ghost"
                                onClick={() => handleReorder(order.id)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              title="Download Invoice"
                              variant="ghost"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found
                </div>
              )}
            </TabsContent>

            <TabsContent className="mt-4" value="quotes">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">
                        {quote.quoteNumber}
                      </TableCell>
                      <TableCell>
                        {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(quote.validUntil), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {getQuoteStatusBadge(quote)}
                      </TableCell>
                      <TableCell>
                        ${quote.pricing?.total?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/quotes/${quote.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {quote.status === 'SENT' && 
                           new Date(quote.validUntil) > new Date() && (
                            <Button
                              size="sm"
                              title="Convert to Order"
                              variant="ghost"
                              onClick={() => handleConvertQuote(quote.id)}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredQuotes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No quotes found
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Retention Policy</CardTitle>
          <CardDescription>
            Your uploaded files are retained for 1 year from the order date. 
            Files older than 1 year are automatically removed from our servers.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}