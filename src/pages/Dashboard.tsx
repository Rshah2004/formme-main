import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDesigns } from '@/hooks/useDesigns';
import { useUserRole } from '@/hooks/useUserRole';
import { Plus, Clock, Package, Factory, FileCheck, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { designs, loading } = useDesigns();
  const { role, loading: roleLoading } = useUserRole();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Redirect to manufacturer dashboard if user is a manufacturer
  useEffect(() => {
    if (!roleLoading && role === 'manufacturer') {
      navigate('/manufacturer');
    }
  }, [role, roleLoading, navigate]);

  if (isAuthenticated === null || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-6 mt-20 max-w-7xl">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  // Show sign-up prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-6 mt-20 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full border-border">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Sign up to access your dashboard
                </h2>
                <p className="text-muted-foreground mb-8">
                  You need to create an account or sign in to view your production dashboard and manage your designs.
                </p>
                <Link to="/auth">
                  <Button size="lg" className="w-full">
                    Sign up or Sign in
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }
  
  const activeDesigns = designs.filter(d => d.status !== 'completed').length;
  const inSampling = designs.filter(d => d.status === 'sample_development').length;
  const inProduction = designs.filter(d => 
    d.status === 'production_approval' || d.status === 'in_production'
  ).length;

  const getStatusBadge = (status: string | null) => {
    if (!status) return 'default';
    if (status.includes('draft')) return 'outline';
    if (status.includes('completed') || status.includes('delivered')) return 'default';
    return 'secondary';
  };

  const getStatusDisplay = (status: string | null) => {
    if (!status) return 'Draft';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredDesigns = designs;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 mt-20 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Your Production Dashboard</h1>
              <p className="text-muted-foreground">Track your designs from concept to delivery</p>
            </div>
            <div className="flex gap-3">
              <Link to="/new-design">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  New Design
                </Button>
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Active</CardDescription>
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">{activeDesigns}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Sampling</CardDescription>
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">{inSampling}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Review stage</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Production</CardDescription>
                  <Factory className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">{inProduction}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Manufacturing</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl">View recent designs</CardTitle>
                <CardDescription>Monitor and manage all designs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Hover Button Tabs */}
            <div className="flex gap-2 mb-6 pb-4 border-b">
              {[
                { value: 'all', label: 'All' },
                { value: 'on-track', label: 'On Track' },
                { value: 'action-required', label: 'Urgent' },
                { value: 'delayed', label: 'Delayed' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  onMouseEnter={() => setHoveredTab(tab.value)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`relative px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                    activeTab === tab.value
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {(hoveredTab === tab.value || activeTab === tab.value) && (
                    <span
                      className={`absolute inset-0 rounded-lg transition-all ${
                        activeTab === tab.value
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-muted border-2 border-border'
                      }`}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50 animate-spin" />
                  <p>Loading designs...</p>
                </div>
              ) : filteredDesigns.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No designs found</p>
                  <p className="text-sm mt-2">Create your first design to get started</p>
                </div>
              ) : (
                filteredDesigns.map((design) => (
                  <Card 
                    key={design.id} 
                    className="border-border hover:border-primary/50 transition-all hover:shadow-sm cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = '/workflow?designId=' + design.id;
                      console.log('Navigating to:', url);
                      window.location.href = url;
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FileCheck className="w-4 h-4" />
                            <h3 className="font-semibold text-foreground">{design.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {getStatusDisplay(design.status)}
                          </p>
                          {design.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {design.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={getStatusBadge(design.status)}>
                            {getStatusDisplay(design.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(design.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
