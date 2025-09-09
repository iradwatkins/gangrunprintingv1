'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, Globe, Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface VendorAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  orderEmail?: string;
  phone?: string;
  website?: string;
  address?: VendorAddress;
  supportedCarriers: string[];
  isActive: boolean;
  notes?: string;
  turnaroundDays: number;
  minimumOrderAmount?: number;
  shippingCostFormula?: string;
  n8nWebhookUrl?: string;
  _count?: {
    orders: number;
    vendorProducts: number;
    vendorPaperStocks: number;
  };
}

const CARRIER_OPTIONS = ['FEDEX', 'UPS', 'SOUTHWEST_CARGO'];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    orderEmail: '',
    phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    },
    supportedCarriers: [] as string[],
    turnaroundDays: 3,
    minimumOrderAmount: 0,
    shippingCostFormula: '',
    n8nWebhookUrl: '',
    notes: '',
    isActive: true
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      } else {
        toast.error('Failed to fetch vendors');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name,
        contactEmail: vendor.contactEmail,
        orderEmail: vendor.orderEmail || '',
        phone: vendor.phone || '',
        website: vendor.website || '',
        address: vendor.address || {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'USA'
        },
        supportedCarriers: vendor.supportedCarriers || [],
        turnaroundDays: vendor.turnaroundDays,
        minimumOrderAmount: vendor.minimumOrderAmount || 0,
        shippingCostFormula: vendor.shippingCostFormula || '',
        n8nWebhookUrl: vendor.n8nWebhookUrl || '',
        notes: vendor.notes || '',
        isActive: vendor.isActive
      });
    } else {
      setEditingVendor(null);
      setFormData({
        name: '',
        contactEmail: '',
        orderEmail: '',
        phone: '',
        website: '',
        address: {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'USA'
        },
        supportedCarriers: [],
        turnaroundDays: 3,
        minimumOrderAmount: 0,
        shippingCostFormula: '',
        n8nWebhookUrl: '',
        notes: '',
        isActive: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const url = editingVendor ? '/api/vendors' : '/api/vendors';
      const method = editingVendor ? 'PUT' : 'POST';
      const body = editingVendor 
        ? { id: editingVendor.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(`Vendor ${editingVendor ? 'updated' : 'created'} successfully`);
        fetchVendors();
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save vendor');
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error('Failed to save vendor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this vendor?')) return;

    try {
      const response = await fetch(`/api/vendors?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Vendor deactivated successfully');
        fetchVendors();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to deactivate vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to deactivate vendor');
    }
  };

  const toggleCarrier = (carrier: string) => {
    setFormData(prev => ({
      ...prev,
      supportedCarriers: prev.supportedCarriers.includes(carrier)
        ? prev.supportedCarriers.filter(c => c !== carrier)
        : [...prev.supportedCarriers, carrier]
    }));
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground">Manage print vendors and fulfillment partners</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Vendors</CardTitle>
          <CardDescription>
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Carriers</TableHead>
                <TableHead>Turnaround</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{vendor.name}</div>
                      {vendor.website && (
                        <a 
                          href={vendor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {vendor.contactEmail}
                      </div>
                      {vendor.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {vendor.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {vendor.supportedCarriers.map(carrier => (
                        <Badge key={carrier} variant="secondary" className="text-xs">
                          {carrier}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{vendor.turnaroundDays} days</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{vendor._count?.orders || 0} orders</div>
                      <div className="text-xs text-muted-foreground">
                        {vendor._count?.vendorProducts || 0} products
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={vendor.isActive ? 'default' : 'secondary'}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(vendor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(vendor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
            </DialogTitle>
            <DialogDescription>
              Configure vendor details and integration settings
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Vendor Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orderEmail">Order Email (for n8n)</Label>
                  <Input
                    id="orderEmail"
                    type="email"
                    value={formData.orderEmail}
                    onChange={(e) => setFormData({ ...formData, orderEmail: e.target.value })}
                    placeholder="orders@vendor.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://vendor-website.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Street Address"
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="City"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="State"
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="ZIP Code"
                    value={formData.address.zip}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, zip: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active Vendor</Label>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="turnaroundDays">Turnaround Days</Label>
                  <Input
                    id="turnaroundDays"
                    type="number"
                    value={formData.turnaroundDays}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      turnaroundDays: parseInt(e.target.value) || 3 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="minimumOrderAmount">Minimum Order Amount</Label>
                  <Input
                    id="minimumOrderAmount"
                    type="number"
                    step="0.01"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      minimumOrderAmount: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Supported Carriers</Label>
                <div className="space-y-2 mt-2">
                  {CARRIER_OPTIONS.map(carrier => (
                    <div key={carrier} className="flex items-center space-x-2">
                      <Checkbox
                        id={carrier}
                        checked={formData.supportedCarriers.includes(carrier)}
                        onCheckedChange={() => toggleCarrier(carrier)}
                      />
                      <Label htmlFor={carrier} className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {carrier}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="shippingCostFormula">Shipping Cost Formula/Notes</Label>
                <Textarea
                  id="shippingCostFormula"
                  value={formData.shippingCostFormula}
                  onChange={(e) => setFormData({ ...formData, shippingCostFormula: e.target.value })}
                  placeholder="e.g., Base rate $10 + $0.50 per pound"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <div>
                <Label htmlFor="n8nWebhookUrl">n8n Webhook URL</Label>
                <Input
                  id="n8nWebhookUrl"
                  type="url"
                  value={formData.n8nWebhookUrl}
                  onChange={(e) => setFormData({ ...formData, n8nWebhookUrl: e.target.value })}
                  placeholder="https://n8n.example.com/webhook/vendor-orders"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This URL will receive order notifications for automated fulfillment
                </p>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any internal notes about this vendor..."
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingVendor ? 'Update' : 'Create'} Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}