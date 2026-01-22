import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Factory, CheckCircle, XCircle, Clock, ClipboardList, TrendingUp, Timer, Search, Filter, ArrowUpRight } from 'lucide-react';
import NavBar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useManufacturerOrders } from '@/hooks/useManufacturerOrders';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ManufacturerMessaging } from '@/components/manufacturer/ManufacturerMessaging';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ManufacturerDashboard = () => {
  const navigate = useNavigate();
  const [profileCreated, setProfileCreated] = useState(true);
  const { orders, loading } = useManufacturerOrders();
  const { role, loading: roleLoading } = useUserRole();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to designer dashboard if user is a designer
  useEffect(() => {
    if (!roleLoading && role === 'designer') {
      navigate('/dashboard');
    }
  }, [role, roleLoading, navigate]);

  // Fetch pending order requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      setLoadingRequests(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get manufacturer ID for current user
        const { data: manufacturer } = await supabase
          .from('manufacturers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!manufacturer) {
          console.log('No manufacturer profile found for user');
          return;
        }

        // Fetch pending manufacturer matches with proper join
        const { data: matches, error } = await supabase
          .from('manufacturer_matches')
          .select(`
            *,
            designs!manufacturer_matches_design_id_fkey (
              id,
              name,
              category,
              user_id
            )
          `)
          .eq('manufacturer_id', manufacturer.id)
          .eq('status', 'pending');

        if (error) {
          console.error('Error fetching matches:', error);
          throw error;
        }

        // Fetch designer profiles for each design
        if (matches && matches.length > 0) {
          const matchesWithDesigners = await Promise.all(
            matches.map(async (match) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, company_name')
                .eq('user_id', match.designs.user_id)
                .maybeSingle();
              
              return {
                ...match,
                designs: {
                  ...match.designs,
                  designer_name: profile?.full_name || profile?.company_name || 'Unknown Designer'
                }
              };
            })
          );
          
          setPendingRequests(matchesWithDesigners);
        } else {
          setPendingRequests([]);
        }
      } catch (error: any) {
        console.error('Error fetching pending requests:', error);
      } finally {
        setLoadingRequests(false);
      }
    };

    if (!roleLoading && role === 'manufacturer') {
      fetchPendingRequests();
    }
  }, [role, roleLoading]);

  const handleApprove = async (matchId: string, designId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get manufacturer ID
      const { data: manufacturer } = await supabase
        .from('manufacturers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!manufacturer) throw new Error('Manufacturer profile not found');

      // Update match status to accepted
      const { error: matchError } = await supabase
        .from('manufacturer_matches')
        .update({ status: 'accepted' })
        .eq('id', matchId);

      if (matchError) throw matchError;

      // Update order status AND manufacturer_id
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'manufacturer_review',
          manufacturer_id: manufacturer.id 
        })
        .eq('design_id', designId);

      if (orderError) throw orderError;

      toast.success('Order approved successfully!');
      
      // Refresh pending requests and refetch orders
      setPendingRequests(prev => prev.filter(req => req.id !== matchId));
      window.location.reload(); // Refresh to show new order in current orders tab
    } catch (error: any) {
      console.error('Error approving order:', error);
      toast.error(error.message || 'Failed to approve order');
    }
  };

  const handleReject = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('manufacturer_matches')
        .update({ status: 'rejected' })
        .eq('id', matchId);

      if (error) throw error;

      toast.success('Order rejected');
      
      // Refresh pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== matchId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject order');
    }
  };

  const activeOrders = orders.length;
  const inProduction = orders.filter(o => 
    o.status === 'sample_development' || o.status === 'in_production'
  ).length;
  const pendingApproval = orders.filter(o => 
    o.status === 'manufacturer_review' || o.status === 'production_approval'
  ).length;
  const completedToday = orders.filter(o => {
    if (!o.updated_at) return false;
    const today = new Date();
    const updateDate = new Date(o.updated_at);
    return o.status === 'delivered' && 
      updateDate.toDateString() === today.toDateString();
  }).length;

  // Filter orders based on search
  const filteredOrders = orders.filter(order => 
    order.designs?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto p-8 pt-32 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const kpiData = [
    { 
      title: 'ACTIVE ORDERS', 
      value: activeOrders, 
      icon: ClipboardList,
    },
    { 
      title: 'IN PRODUCTION', 
      value: inProduction, 
      icon: TrendingUp,
    },
    { 
      title: 'PENDING APPROVAL', 
      value: pendingApproval, 
      icon: Timer,
    },
    { 
      title: 'COMPLETED TODAY', 
      value: completedToday, 
      icon: CheckCircle,
    },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'DR';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatStageBadge = (status: string) => {
    const formatted = status?.replace(/_/g, ' ').toUpperCase() || 'PENDING';
    return formatted;
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-6 pt-28 pb-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary mb-1">Manufacturing Hub</h1>
            <p className="text-muted-foreground">
              Manage active manufacturing pipelines and designer requests.
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white border-border"
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiData.map((kpi) => (
            <Card key={kpi.title} className="bg-white border-border shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <kpi.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground tracking-wide">{kpi.title}</p>
                  <p className="text-2xl font-bold text-primary">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for Orders and Opportunities */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="bg-white border border-border mb-6">
            <TabsTrigger value="current" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Current Orders
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Find Orders
            </TabsTrigger>
          </TabsList>

          {/* Current Orders Tab */}
          <TabsContent value="current">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xl font-serif italic text-primary">Active Production Orders</CardTitle>
                <Button variant="link" className="text-accent gap-1 p-0 h-auto">
                  View History
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-t border-border hover:bg-transparent">
                      <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4 pl-6">DESIGN NAME</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4">DESIGNER</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4">RECEIVED</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4">STAGE</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4">STATUS</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4 pr-6 text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
                          <p className="text-muted-foreground">Loading orders...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Factory className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-muted-foreground">No orders yet</p>
                          <p className="text-sm text-muted-foreground mt-1">Check the "Find Orders" tab for opportunities</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/30 border-border">
                          <TableCell className="font-medium text-foreground py-5 pl-6">
                            {order.designs?.name || 'Unknown Design'}
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 bg-muted">
                                <AvatarFallback className="text-xs font-medium text-muted-foreground bg-muted">
                                  {getInitials(order.profiles?.full_name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-foreground">
                                {order.profiles?.full_name || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground py-5">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'}
                          </TableCell>
                          <TableCell className="py-5">
                            <Badge className="bg-accent/15 text-accent border-0 font-medium text-xs uppercase tracking-wide px-2.5 py-1">
                              {formatStageBadge(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-sm font-medium text-emerald-600">On Track</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 pr-6 text-right">
                            <Link to={`/manufacturer/order/${order.id}`}>
                              <Button variant="outline" size="sm" className="text-foreground border-border hover:bg-muted">
                                View Order
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Order Requests Tab */}
          <TabsContent value="opportunities">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-serif italic text-primary">Pending Order Requests</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Review designer requests and accept orders that match your capabilities
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {loadingRequests ? (
                  <div className="text-center py-12">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
                    <p className="text-muted-foreground">Loading requests...</p>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Factory className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pending order requests</p>
                    <p className="text-sm mt-2">Check back later for new opportunities</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-t border-border hover:bg-transparent">
                        <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4 pl-6">DESIGN NAME</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4">DESIGNER</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4">CATEGORY</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4">MATCH SCORE</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground tracking-wide py-4 pr-6 text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.filter(request => request.designs).map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/30 border-border">
                          <TableCell className="font-medium text-foreground py-5 pl-6">
                            {request.designs?.name || 'Unknown Design'}
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 bg-muted">
                                <AvatarFallback className="text-xs font-medium text-muted-foreground bg-muted">
                                  {getInitials(request.designs?.designer_name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-foreground">
                                {request.designs?.designer_name || 'Unknown Designer'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <Badge variant="outline" className="border-border text-muted-foreground">
                              {request.designs?.category || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-5">
                            <Badge className="bg-accent/15 text-accent border-0 font-medium">
                              {request.score || 0}% match
                            </Badge>
                          </TableCell>
                          <TableCell className="py-5 pr-6 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(request.id)}
                                className="gap-1 border-border"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(request.id, request.designs?.id || '')}
                                className="gap-1"
                                disabled={!request.designs?.id}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Messaging Widget */}
      <ManufacturerMessaging />
    </div>
  );
};

export default ManufacturerDashboard;
