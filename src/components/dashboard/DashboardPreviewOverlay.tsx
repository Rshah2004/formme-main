import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';

const DashboardPreviewOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      
      {/* Sign up card */}
      <div className="relative z-10 pointer-events-auto">
        <div className="bg-card border border-border shadow-2xl rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
            Sign up to access your dashboard
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Create an account to start managing your designs, connect with manufacturers, and track your production orders.
          </p>
          
          <div className="space-y-3">
            <Link to="/auth" className="block">
              <Button size="lg" className="w-full gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreviewOverlay;
