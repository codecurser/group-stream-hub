import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Shield, Smartphone } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { useRef } from 'react';

// Floating icons for hero
const floatingIcons = [
  { src: '/placeholder.svg', alt: 'Netflix', style: 'top-8 left-8 animate-float-slow' },
  { src: '/placeholder.svg', alt: 'Spotify', style: 'top-20 right-16 animate-float-medium' },
  { src: '/placeholder.svg', alt: 'Disney+', style: 'bottom-12 left-24 animate-float-fast' },
  { src: '/placeholder.svg', alt: 'Amazon', style: 'bottom-20 right-32 animate-float-slow' },
];

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [featuresInView, setFeaturesInView] = useState(false);
  const [howItWorksInView, setHowItWorksInView] = useState(false);
  const howItWorksRef = useRef<HTMLDivElement>(null);

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

  // Intersection Observer for features section
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setFeaturesInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (featuresRef.current) observer.observe(featuresRef.current);
    return () => observer.disconnect();
  }, []);

  // Intersection Observer for how it works section
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setHowItWorksInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    return () => observer.disconnect();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-x-hidden">
      {/* Animated SVG Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[400px] opacity-40 animate-pulse">
          <ellipse cx="600" cy="200" rx="600" ry="200" fill="url(#paint0_linear)" />
          <defs>
            <linearGradient id="paint0_linear" x1="0" y1="0" x2="1200" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a5b4fc" />
              <stop offset="1" stopColor="#c4b5fd" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-lg border-b sticky top-0 z-50 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <img src="/placeholder.svg" alt="PlayForm Logo" width={36} height={36} className="rounded" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PlayForm</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#how-it-works" className="text-gray-700 font-medium px-3 py-2 rounded transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400">How it Works</a>
            <Button variant="ghost" onClick={() => setShowAuthModal(true)} aria-label="Sign In">Sign In</Button>
            <Button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Get Started">Get Started</Button>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative pt-28 pb-36 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
        {/* Floating icons */}
        {floatingIcons.map((icon, i) => (
          <img key={i} src={icon.src} alt={icon.alt} width={48} height={48} className={`absolute ${icon.style} opacity-70`} style={{zIndex: 1}} />
        ))}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 text-lg text-blue-500 font-semibold tracking-wide animate-fade-in-up">Share More. Save More.</div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              Share Subscriptions,<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Split the Cost</span>
            </h1>
            <div className="inline-block mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <span className="bg-white/80 border border-blue-200 text-blue-700 px-4 py-1 rounded-full shadow font-medium text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                Trusted by 1,000+ users
              </span>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto md:mx-0 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              Join groups to share Netflix, Spotify, and other subscriptions. Save money while enjoying premium content with friends and family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <Button size="lg" onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3 shadow-xl transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 animate-pulse-once">Start Sharing Now</Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-2 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}>Learn More</Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center md:justify-end relative">
            <img src="/placeholder.svg" alt="Sharing Illustration" width={340} height={340} className="rounded-xl shadow-2xl border border-gray-200 bg-white/70 animate-float-hero" />
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-white/60 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose PlayForm?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">The smart way to manage shared subscriptions with transparency and security.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className={`text-center transition-all duration-700 border-0 bg-white/90 backdrop-blur-sm ${featuresInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'} hover:scale-105 hover:shadow-2xl hover:border-blue-400 border-t-4 border-transparent`}>
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Easy Group Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Create and join subscription groups with simple invite codes. Manage members and track participation effortlessly.</CardDescription>
              </CardContent>
            </Card>
            <Card className={`text-center transition-all duration-700 border-0 bg-white/90 backdrop-blur-sm ${featuresInView ? 'animate-fade-in-up delay-100' : 'opacity-0 translate-y-10'} hover:scale-105 hover:shadow-2xl hover:border-green-400 border-t-4 border-transparent`}>
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Smart Payment Splitting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Automatically calculate and track payments. Transparent cost breakdown with secure payment processing.</CardDescription>
              </CardContent>
            </Card>
            <Card className={`text-center transition-all duration-700 border-0 bg-white/90 backdrop-blur-sm ${featuresInView ? 'animate-fade-in-up delay-200' : 'opacity-0 translate-y-10'} hover:scale-105 hover:shadow-2xl hover:border-purple-400 border-t-4 border-transparent`}>
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Bank-level security for all transactions. Your data is encrypted and never shared with third parties.</CardDescription>
              </CardContent>
            </Card>
            <Card className={`text-center transition-all duration-700 border-0 bg-white/90 backdrop-blur-sm ${featuresInView ? 'animate-fade-in-up delay-300' : 'opacity-0 translate-y-10'} hover:scale-105 hover:shadow-2xl hover:border-orange-400 border-t-4 border-transparent`}>
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Mobile Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Access your groups and manage payments from anywhere. Optimized for all devices and screen sizes.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-purple-50 z-10">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get started in just a few steps. Sharing subscriptions has never been easier!</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-1/2 top-16 h-64 w-1 -translate-x-1/2 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-40"></div>
          {/* Steps */}
          <div className={`flex-1 flex flex-col items-center md:items-end ${howItWorksInView ? 'animate-fade-in-left' : 'opacity-0 -translate-x-10'} transition-all duration-700`}>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border-t-4 border-blue-400 w-64">
              <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-lg mb-2">Create or Join a Group</div>
              <div className="text-gray-600">Start a new group or join an existing one with a simple invite code.</div>
            </div>
          </div>
          <div className={`flex-1 flex flex-col items-center ${howItWorksInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'} transition-all duration-700`}>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border-t-4 border-green-400 w-64">
              <div className="w-12 h-12 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-lg mb-2">Split the Cost</div>
              <div className="text-gray-600">Easily manage payments and see a transparent breakdown for everyone.</div>
            </div>
          </div>
          <div className={`flex-1 flex flex-col items-center md:items-start ${howItWorksInView ? 'animate-fade-in-right' : 'opacity-0 translate-x-10'} transition-all duration-700`}>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border-t-4 border-purple-400 w-64">
              <div className="w-12 h-12 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-lg mb-2">Enjoy Premium Content</div>
              <div className="text-gray-600">Access your favorite services at a fraction of the price, securely and privately.</div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonial Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-100 to-purple-100 z-10">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          <div className="inline-block bg-white/80 rounded-xl px-8 py-6 shadow-lg border border-blue-200">
            <p className="text-lg text-gray-700 italic mb-4">“PlayForm made it so easy to split my Netflix and Spotify with friends. We all save money and it's super simple to manage!”</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">A</div>
              <span className="font-semibold text-gray-900">Alex P.</span>
              <span className="text-gray-400">/ Early User</span>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl animate-glow-border">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Saving?</h2>
              <p className="text-xl mb-8 opacity-90">Join thousands of users who are already sharing subscriptions and saving money.</p>
              <Button size="lg" onClick={() => setShowAuthModal(true)} className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3 font-semibold shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 animate-pulse-once">Create Your First Group</Button>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-lg border-t py-8 px-4 sm:px-6 lg:px-8 text-center shadow-inner animate-fade-in-up">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <img src="/placeholder.svg" alt="PlayForm Logo" width={28} height={28} className="rounded" />
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PlayForm</span>
          </div>
          <div className="flex gap-6 text-gray-600 text-sm">
            <a href="#" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">About</a>
            <a href="#" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">Contact</a>
          </div>
          <div className="flex gap-4">
            <a href="#" aria-label="Twitter" className="hover:text-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.916 4.916 0 0 0 16.616 3c-2.72 0-4.924 2.206-4.924 4.924 0 .386.044.763.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.724-.666 1.562-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg></a>
            <a href="#" aria-label="GitHub" className="hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.578.688.48A10.025 10.025 0 0 0 22 12.021C22 6.484 17.523 2 12 2z"/></svg></a>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-400">&copy; {new Date().getFullYear()} PlayForm. All rights reserved.</div>
      </footer>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

// Global animation styles
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in-up {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in-left {
    0% { opacity: 0; transform: translateX(-40px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  @keyframes fade-in-right {
    0% { opacity: 0; transform: translateX(40px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  @keyframes float-hero {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-16px); }
  }
  @keyframes float-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes float-medium {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  @keyframes float-fast {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-30px); }
  }
  @keyframes glow-border {
    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5), 0 0 0 0 rgba(168,85,247,0.5); }
    50% { box-shadow: 0 0 24px 8px rgba(99,102,241,0.3), 0 0 32px 12px rgba(168,85,247,0.3); }
  }
  @keyframes pulse-once {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.23, 1, 0.32, 1) both; }
  .animate-fade-in-left { animation: fade-in-left 1s cubic-bezier(0.23, 1, 0.32, 1) both; }
  .animate-fade-in-right { animation: fade-in-right 1s cubic-bezier(0.23, 1, 0.32, 1) both; }
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .animate-float-hero { animation: float-hero 4s ease-in-out infinite; }
  .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
  .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
  .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
  .animate-glow-border { animation: glow-border 2.5s ease-in-out infinite; }
  .animate-pulse-once { animation: pulse-once 0.7s cubic-bezier(0.23, 1, 0.32, 1) 1; }
`;
if (typeof document !== 'undefined' && !document.getElementById('playform-animations')) {
  style.id = 'playform-animations';
  document.head.appendChild(style);
}

export default Index;
