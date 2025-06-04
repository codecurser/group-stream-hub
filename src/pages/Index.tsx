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

// Carousel brand logos (public SVG URLs)
const heroImages = [
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    alt: 'Netflix Logo',
    bg: 'bg-white',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
    alt: 'Spotify Logo',
    bg: 'bg-white',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    alt: 'Disney+ Logo',
    bg: 'bg-white',
  },
  {
    src: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
    alt: 'Amazon Prime Video Logo',
    bg: 'bg-white',
  },
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
  const [heroImageIdx, setHeroImageIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasAnimatedFeatures, setHasAnimatedFeatures] = useState(false);
  const [hasAnimatedHowItWorks, setHasAnimatedHowItWorks] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [hasAnimatedRandomCard, setHasAnimatedRandomCard] = useState(false);
  const [isAutoAnimating, setIsAutoAnimating] = useState(true);
  const animationRef = useRef<{
    currentIndex: number;
    lastUpdate: number;
    frameId: number | null;
    isAnimating: boolean;
    timeoutId: number | null;
    isExpanding: boolean;
  }>({
    currentIndex: 0,
    lastUpdate: 0,
    frameId: null,
    isAnimating: false,
    timeoutId: null,
    isExpanding: false
  });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  const testimonials = [
    {
      text: "PlayForm made it so easy to split my Netflix and Spotify with friends. We all save money and it's super simple to manage!",
      author: "Alex P.",
      role: "Early User",
      initial: "A"
    },
    {
      text: "Finally, a solution that makes sharing subscriptions fair and transparent. The payment splitting feature is brilliant!",
      author: "Sarah M.",
      role: "Power User",
      initial: "S"
    },
    {
      text: "I've saved over $200 this year by sharing my streaming services with friends. The interface is intuitive and secure.",
      author: "Mike R.",
      role: "Verified User",
      initial: "M"
    }
  ];

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
      ([entry]) => {
        setFeaturesInView(entry.isIntersecting);
        if (entry.isIntersecting) setHasAnimatedFeatures(true);
      },
      { threshold: 0.2 }
    );
    if (featuresRef.current) observer.observe(featuresRef.current);
    return () => observer.disconnect();
  }, []);

  // Animation control using requestAnimationFrame
  useEffect(() => {
    const ANIMATION_INTERVAL = 4000; // 4 seconds between transitions
    const EXPAND_DURATION = 2000; // 2 seconds expanded state

    const animate = (timestamp: number) => {
      if (!howItWorksInView || !isAutoAnimating) {
        animationRef.current.isAnimating = false;
        return;
      }

      // Initialize animation if not started
      if (!animationRef.current.isAnimating) {
        animationRef.current.lastUpdate = timestamp;
        animationRef.current.isAnimating = true;
        animationRef.current.isExpanding = true;
        setExpandedStep(animationRef.current.currentIndex);
      }

      const elapsed = timestamp - animationRef.current.lastUpdate;

      // Handle expansion and collapse phases
      if (animationRef.current.isExpanding) {
        if (elapsed >= EXPAND_DURATION) {
          animationRef.current.isExpanding = false;
          animationRef.current.lastUpdate = timestamp;
          setExpandedStep(null);
        }
      } else {
        if (elapsed >= ANIMATION_INTERVAL - EXPAND_DURATION) {
          animationRef.current.currentIndex = (animationRef.current.currentIndex + 1) % 3;
          animationRef.current.isExpanding = true;
          animationRef.current.lastUpdate = timestamp;
          setExpandedStep(animationRef.current.currentIndex);
        }
      }

      animationRef.current.frameId = requestAnimationFrame(animate);
    };

    // Start animation if section is in view
    if (howItWorksInView && isAutoAnimating) {
      // Clear any existing animations
      if (animationRef.current.frameId) {
        cancelAnimationFrame(animationRef.current.frameId);
      }
      if (animationRef.current.timeoutId) {
        window.clearTimeout(animationRef.current.timeoutId);
      }
      
      // Reset animation state
      animationRef.current.currentIndex = 0;
      animationRef.current.isAnimating = false;
      animationRef.current.isExpanding = false;
      
      // Start new animation
      animationRef.current.frameId = requestAnimationFrame(animate);
    }

    // Cleanup function
    return () => {
      if (animationRef.current.frameId) {
        cancelAnimationFrame(animationRef.current.frameId);
      }
      if (animationRef.current.timeoutId) {
        window.clearTimeout(animationRef.current.timeoutId);
      }
    };
  }, [howItWorksInView, isAutoAnimating]);

  // Intersection Observer for how it works section
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setHowItWorksInView(isIntersecting);
        if (isIntersecting) {
          setHasAnimatedHowItWorks(true);
          setIsAutoAnimating(true);
          // Reset animation state when section comes into view
          animationRef.current.currentIndex = 0;
          animationRef.current.isAnimating = false;
          animationRef.current.isExpanding = false;
          if (animationRef.current.timeoutId) {
            window.clearTimeout(animationRef.current.timeoutId);
          }
        }
      },
      { threshold: 0.2 }
    );
    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    return () => observer.disconnect();
  }, []);

  // Carousel effect for hero image
  useEffect(() => {
    if (isTransitioning) return;
    const interval = setInterval(() => {
      setFade(false);
      setIsTransitioning(true);
      setTimeout(() => {
        setHeroImageIdx((idx) => (idx + 1) % heroImages.length);
        setFade(true);
        setTimeout(() => setIsTransitioning(false), 1000);
      }, 400); // fade out duration
    }, 3500);
    return () => clearInterval(interval);
  }, [heroImageIdx, isTransitioning]);

  // Dot click handler
  const handleDotClick = (idx: number) => {
    if (idx === heroImageIdx || isTransitioning) return;
    setFade(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setHeroImageIdx(idx);
      setFade(true);
      setTimeout(() => setIsTransitioning(false), 1000);
    }, 400);
  };

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

  const scrollToHowItWorks = () => {
    const targetPosition = howItWorksRef.current?.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 2000; // Duration in milliseconds
    let start = null;

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    const ease = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };

    requestAnimationFrame(animation);
  };

  const handleHowItWorksCardClick = (idx: number) => {
    if (expandedStep === idx) {
      setExpandedStep(null);
      setIsAutoAnimating(true);
      animationRef.current.currentIndex = idx;
      animationRef.current.isAnimating = false;
      animationRef.current.isExpanding = false;
      if (animationRef.current.timeoutId) {
        window.clearTimeout(animationRef.current.timeoutId);
      }
    } else {
      setExpandedStep(idx);
      setIsAutoAnimating(false);
      // Clear any ongoing animations
      if (animationRef.current.frameId) {
        cancelAnimationFrame(animationRef.current.frameId);
      }
      if (animationRef.current.timeoutId) {
        window.clearTimeout(animationRef.current.timeoutId);
      }
    }
  };

  // Add auto-sliding effect for testimonials
  useEffect(() => {
    if (!isAutoSliding) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoSliding, testimonials.length]);

  // Pause auto-sliding when user interacts with navigation
  const handleTestimonialChange = (index: number) => {
    setCurrentTestimonial(index);
    setIsAutoSliding(false);
    // Resume auto-sliding after 10 seconds of inactivity
    setTimeout(() => {
      setIsAutoSliding(true);
    }, 10000);
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
            <img src="/images/Untitled design (1).png" alt="PlayForm Logo" width={36} height={36} className="rounded" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PlayForm</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#how-it-works" className="text-gray-700 font-medium px-3 py-2 rounded transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={(e) => { e.preventDefault(); scrollToHowItWorks(); }}>How it Works</a>
            <Button variant="ghost" onClick={() => setShowAuthModal(true)} aria-label="Sign In">Sign In</Button>
            <Button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Get Started">Get Started</Button>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative pt-28 pb-36 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
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
          <div className="flex-1 flex flex-col items-center justify-center md:justify-end relative min-h-[340px]">
            {/* Blurred circular background */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[380px] md:h-[380px] rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-white/80 blur-2xl opacity-70 z-0"></div>
            {/* Ken Burns + crossfade image */}
            <div className="relative w-[220px] h-[220px] md:w-[340px] md:h-[340px] flex items-center justify-center overflow-hidden">
              <img
                src={heroImages[heroImageIdx].src}
                alt={heroImages[heroImageIdx].alt}
                width={340}
                height={340}
                className={`absolute inset-0 w-full h-full object-contain rounded-xl border border-blue-200 shadow-2xl bg-white/90 transition-all duration-1000 z-20
                  ${fade ? 'opacity-100 animate-kenburns' : 'opacity-0'}
                  cursor-pointer
                `}
                style={{padding: '2rem'}}
                draggable={false}
                onClick={(e) => {
                  if (isTransitioning) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const isLeftSide = x < rect.width / 2;
                  setFade(false);
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setHeroImageIdx((idx) => (isLeftSide ? (idx - 1 + heroImages.length) % heroImages.length : (idx + 1) % heroImages.length));
                    setFade(true);
                    setTimeout(() => setIsTransitioning(false), 1000);
                  }, 400);
                }}
              />
            </div>
            {/* Carousel dots */}
            <div className="flex gap-2 mt-6 justify-center" role="tablist" aria-label="Brand carousel navigation">
              {heroImages.map((img, idx) => (
                <button
                  key={img.alt}
                  className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${heroImageIdx === idx ? 'bg-blue-500 border-blue-500 scale-125 shadow' : 'bg-gray-200 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  aria-label={`Show ${img.alt}`}
                  aria-selected={heroImageIdx === idx}
                  tabIndex={0}
                  onClick={() => handleDotClick(idx)}
                  disabled={isTransitioning}
                />
              ))}
            </div>
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
            <Card className={`text-center transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm ${hasAnimatedFeatures ? 'animate-fade-in-up' : ''} hover:scale-105 hover:shadow-2xl hover:border-blue-400 border-t-4 border-transparent`}>
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
            <Card className={`text-center transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm ${hasAnimatedFeatures ? 'animate-fade-in-up delay-50' : ''} hover:scale-105 hover:shadow-2xl hover:border-green-400 border-t-4 border-transparent`}>
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
            <Card className={`text-center transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm ${hasAnimatedFeatures ? 'animate-fade-in-up delay-100' : ''} hover:scale-105 hover:shadow-2xl hover:border-purple-400 border-t-4 border-transparent`}>
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
            <Card className={`text-center transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm ${hasAnimatedFeatures ? 'animate-fade-in-up delay-150' : ''} hover:scale-105 hover:shadow-2xl hover:border-orange-400 border-t-4 border-transparent`}>
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
      <section ref={howItWorksRef} className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-50 animate-pulse"></div>
        <div className="max-w-5xl mx-auto text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-4 animate-fade-in-up">How It Works</h2>
          <p className="text-xl text-indigo-600 max-w-2xl mx-auto animate-fade-in-up delay-100">Get started in just a few steps. Sharing subscriptions has never been easier!</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative z-10">
          {/* Steps */}
          {[
            {
              icon: <Users className="w-7 h-7 text-white" />,
              title: "Create or Join a Group",
              description: "Start a new group or join an existing one with a simple invite code.",
              details: "Invite friends with a code, manage group members, and keep everything organized in one place."
            },
            {
              icon: <DollarSign className="w-7 h-7 text-white" />,
              title: "Split the Cost",
              description: "Easily manage payments and see a transparent breakdown for everyone.",
              details: "Automatic payment calculations, reminders, and secure transactions for peace of mind."
            },
            {
              icon: <Shield className="w-7 h-7 text-white" />,
              title: "Enjoy Premium Content",
              description: "Access your favorite services at a fraction of the price, securely and privately.",
              details: "Get instant access to premium content and manage your subscriptions with ease."
            }
          ].map((step, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/50 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border-t-4 border-indigo-400 w-64 cursor-pointer hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${
                expandedStep === idx ? 'ring-2 ring-indigo-400 scale-105 shadow-2xl' : ''
              }`}
              onClick={() => handleHowItWorksCardClick(idx)}
            >
              <div className={`w-14 h-14 mx-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 transition-transform duration-500 shadow-lg ${
                expandedStep === idx ? 'scale-110 rotate-12' : ''
              }`}>
                {step.icon}
              </div>
              <div className="font-bold text-lg mb-2 bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent transition-colors duration-300">
                {step.title}
              </div>
              <div className="text-indigo-600/90 transition-colors duration-300">
                {step.description}
              </div>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  expandedStep === idx ? 'max-h-40 mt-4 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="text-sm text-indigo-700 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-lg p-4 border border-indigo-100/50 shadow-inner backdrop-blur-sm">
                  {step.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Testimonial Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 z-10 relative overflow-hidden min-h-[600px]">
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-indigo-100/40 to-purple-100/40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/50 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Trusted by Users Worldwide
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-xl mx-auto text-sm">
            Join thousands of satisfied users who are already saving money with PlayForm
          </p>
          
          <div className="relative">
            {/* Main testimonial container */}
            <div className="relative max-w-5xl mx-auto">
              {/* Navigation arrows */}
              <button 
                onClick={() => handleTestimonialChange((currentTestimonial - 1 + testimonials.length) % testimonials.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={() => handleTestimonialChange((currentTestimonial + 1) % testimonials.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Testimonials slider */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(calc(-${currentTestimonial * 33.333}% + 33.333%))` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div 
                      key={index} 
                      className="w-1/3 flex-shrink-0 px-3 transition-all duration-500"
                    >
                      <div className={`bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-6 relative overflow-hidden transition-all duration-500 ${
                        currentTestimonial === index 
                          ? 'scale-100 opacity-100 shadow-xl' 
                          : 'scale-95 opacity-60'
                      }`}>
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-100/30 to-pink-100/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl opacity-50"></div>

                        {/* Content wrapper */}
                        <div className="relative z-10">
                          {/* Header with rating and quote */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className="w-4 h-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <svg className="w-6 h-6 text-indigo-200" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                          </div>

                          {/* Testimonial text */}
                          <div className="mb-6">
                            <p className="text-base text-gray-700 leading-relaxed">
                              {testimonial.text}
                            </p>
                          </div>

                          {/* Author info with enhanced styling */}
                          <div className="flex items-center gap-3 pt-4 border-t border-white/50">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/90 to-purple-500/90 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                {testimonial.initial}
                              </div>
                              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/50 to-purple-500/50 rounded-full blur opacity-30"></div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm">{testimonial.author}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">{testimonial.role}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300/50"></span>
                                <span className="text-xs text-indigo-600 font-medium">Verified User</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleTestimonialChange(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentTestimonial === index 
                        ? 'bg-indigo-600 scale-125' 
                        : 'bg-gray-300/50 hover:bg-gray-400/50'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
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
            <img src="/images/Untitled design (1).png" alt="PlayForm Logo" width={28} height={28} className="rounded" />
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
  .transition-opacity { transition-property: opacity; }
  .duration-400 { transition-duration: 400ms; }
  .duration-600 { transition-duration: 600ms; }
  .animate-kenburns { animation: kenburns 3.5s ease-in-out both; }
  @keyframes kenburns { 0% { transform: scale(1) translateY(0); } 100% { transform: scale(1.08) translateY(-8px); } }
  .duration-300 { transition-duration: 300ms; }
  .delay-50 { animation-delay: 0.05s; }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('playform-animations')) {
  style.id = 'playform-animations';
  document.head.appendChild(style);
}

export default Index;
