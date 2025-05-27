import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Shield, Smartphone } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          if (session?.user?.email_confirmed_at) {
            toast({
              title: "Welcome!",
              description: "You've been successfully logged in.",
            });
          } else {
            toast({
              title: "Please verify your email",
              description: "Check your email and click the verification link to complete registration.",
              variant: "destructive"
            });
          }
        }

        if (event === 'USER_UPDATED' && session?.user?.email_confirmed_at) {
          toast({
            title: "Email verified!",
            description: "Your email has been verified successfully.",
          });
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if user is authenticated and email is verified
  if (user && session && user.email_confirmed_at) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Show email verification message if user is signed in but email not verified
  if (user && session && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PlayForm
                </h1>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Verify Your Email
              </CardTitle>
              <CardDescription>
                We've sent a verification link to {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Please check your email and click the verification link to complete your registration.
              </p>
              <Button 
                variant="outline" 
                onClick={() => supabase.auth.resend({ type: 'signup', email: user.email! })}
                className="w-full"
              >
                Resend Verification Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PlayForm
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Share Subscriptions,
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Split the Cost
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join groups to share Netflix, Spotify, and other subscriptions. 
            Save money while enjoying premium content with friends and family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
            >
              Start Sharing Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3 border-2"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PlayForm?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The smart way to manage shared subscriptions with transparency and security.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Easy Group Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create and join subscription groups with simple invite codes. 
                  Manage members and track participation effortlessly.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Smart Payment Splitting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatically calculate and track payments. 
                  Transparent cost breakdown with secure payment processing.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Bank-level security for all transactions. 
                  Your data is encrypted and never shared with third parties.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Mobile Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access your groups and manage payments from anywhere. 
                  Optimized for all devices and screen sizes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Saving?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of users who are already sharing subscriptions and saving money.
              </p>
              <Button 
                size="lg" 
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
              >
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Index;
