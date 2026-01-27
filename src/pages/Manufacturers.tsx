import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Factory, MapPin, Package, Clock, Shield, Search, SlidersHorizontal, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Placeholder manufacturer data for UI preview
const placeholderManufacturers = [
  {
    id: '1',
    name: 'Textile Innovations',
    location: 'Portugal',
    region: 'Europe',
    specialties: ['Cut & Sew', 'Knitwear', 'Premium Finishes'],
    moqRange: '200-500',
    leadTime: '4-6 weeks',
    verified: true,
    categories: ['T-Shirts', 'Outerwear'],
  },
  {
    id: '2',
    name: 'EcoFab Studio',
    location: 'India',
    region: 'Asia',
    specialties: ['Organic Cotton', 'Sustainable', 'Fair Trade'],
    moqRange: '100-300',
    leadTime: '6-8 weeks',
    verified: true,
    categories: ['Dresses', 'Basics'],
  },
  {
    id: '3',
    name: 'GreenStitch',
    location: 'Turkey',
    region: 'Europe',
    specialties: ['Denim', 'Embroidery', 'Washing'],
    moqRange: '300-1000',
    leadTime: '5-7 weeks',
    verified: true,
    categories: ['Jeans', 'Denim Jackets'],
  },
  {
    id: '4',
    name: 'Pacific Apparel Co.',
    location: 'Vietnam',
    region: 'Asia',
    specialties: ['Activewear', 'Technical Fabrics'],
    moqRange: '500-2000',
    leadTime: '8-10 weeks',
    verified: true,
    categories: ['Sportswear', 'Athleisure'],
  },
];

const Manufacturers = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Check auth status
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const isLoggedIn = !!user;

  // Filter manufacturers (placeholder logic)
  const filteredManufacturers = placeholderManufacturers.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || m.categories.some(c => c.toLowerCase().includes(categoryFilter.toLowerCase()));
    const matchesRegion = regionFilter === 'all' || m.region.toLowerCase() === regionFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-medium tracking-widest text-[#C8956C] uppercase">
              Manufacturing Partners
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-serif font-normal text-foreground">
              Manufacturer Directory
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our curated network of vetted, sustainable manufacturing partners.
            </p>
          </motion.div>

          {/* Unauthenticated banner */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">
                  Sign up to view full manufacturer profiles and request feasibility
                </span>
              </div>
              <Button onClick={() => navigate('/auth')} size="sm" className="gap-2">
                Sign up
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-4 mb-8"
          >
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search manufacturers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="t-shirts">T-Shirts</SelectItem>
                <SelectItem value="outerwear">Outerwear</SelectItem>
                <SelectItem value="dresses">Dresses</SelectItem>
                <SelectItem value="denim">Denim</SelectItem>
                <SelectItem value="sportswear">Sportswear</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
                <SelectItem value="north-america">North America</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Manufacturer grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredManufacturers.length > 0 ? (
              filteredManufacturers.map((manufacturer, index) => (
                <motion.div
                  key={manufacturer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Card className={`h-full bg-card border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group ${!isLoggedIn ? 'relative overflow-hidden' : ''}`}>
                    {/* Blur overlay for unauthenticated users */}
                    {!isLoggedIn && (
                      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => navigate('/auth')} size="sm" className="gap-2">
                          <Lock className="w-4 h-4" />
                          Sign up to view
                        </Button>
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Factory className="w-6 h-6 text-primary" />
                        </div>
                        {manufacturer.verified && (
                          <Badge className="bg-primary/10 text-primary border-0 gap-1">
                            <Shield className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      {/* Name & Location */}
                      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {manufacturer.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {manufacturer.location}
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {manufacturer.specialties.slice(0, 3).map((specialty) => (
                          <Badge 
                            key={specialty} 
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="w-4 h-4" />
                          <span>MOQ: {manufacturer.moqRange}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{manufacturer.leadTime}</span>
                        </div>
                      </div>

                      {/* View Profile button */}
                      <Button
                        variant="outline"
                        className="w-full mt-4 gap-2"
                        onClick={() => isLoggedIn ? navigate(`/manufacturers/${manufacturer.id}`) : navigate('/auth')}
                      >
                        View Profile
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              // Empty state - skeleton cards
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-full bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <Skeleton className="w-16 h-5 rounded-full" />
                      </div>
                      <Skeleton className="w-3/4 h-5 mb-2" />
                      <Skeleton className="w-1/2 h-4 mb-4" />
                      <div className="flex gap-2 mb-4">
                        <Skeleton className="w-16 h-5 rounded-full" />
                        <Skeleton className="w-20 h-5 rounded-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">
                    Manufacturers will appear here once available
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* Coming soon note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Card className="inline-block bg-muted/50 border-0">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This is a preview of the manufacturer directory. 
                  Full profiles and feasibility requests will be available soon.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Manufacturers;
