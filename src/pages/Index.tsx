import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Shield, Smartphone, GraduationCap, MapPin, Code2 } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { useRef } from 'react';
import GDPRModal from "@/components/GDPRModal";

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
    timer: NodeJS.Timeout | null;
    isInitialized: boolean;
  }>({
    currentIndex: 0,
    timer: null,
    isInitialized: false
  });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [showGDPRModal, setShowGDPRModal] = useState(false);

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

  // Initialize animation on mount
  useEffect(() => {
    const startAnimation = () => {
      const randomIndex = Math.floor(Math.random() * 3);
      animationRef.current.currentIndex = randomIndex;
      setExpandedStep(randomIndex);
      setIsAutoAnimating(true);
    };

    // Start animation immediately
    startAnimation();

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Main animation control
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const cycleCards = () => {
      if (!isAutoAnimating) return;

      // First collapse current card
      setExpandedStep(null);

      // After collapse, move to next card with delay
      timeoutId = setTimeout(() => {
        if (!isAutoAnimating) return;
        animationRef.current.currentIndex = (animationRef.current.currentIndex + 1) % 3;
        setExpandedStep(animationRef.current.currentIndex);
      }, 500);
    };

    // Start animation cycle with longer interval
    if (isAutoAnimating) {
      intervalId = setInterval(cycleCards, 6000);
      animationRef.current.timer = intervalId;
    }

    // Cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAutoAnimating]);

  // Intersection Observer for how it works section
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setHowItWorksInView(isIntersecting);
        if (isIntersecting) {
          setIsAutoAnimating(true);
        } else {
          setExpandedStep(null);
          if (animationRef.current.timer) {
            clearInterval(animationRef.current.timer);
          }
        }
      },
      { threshold: 0.2 }
    );

    if (howItWorksRef.current) {
      observer.observe(howItWorksRef.current);
    }

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
      // Add delay before closing
      const timeoutId = setTimeout(() => {
        // Resume animation
        setIsAutoAnimating(true);
        if (animationRef.current.timer) {
          clearInterval(animationRef.current.timer);
        }
      }, 2000); // 2 second delay after typing completes

      // Cleanup timeout on unmount
      return () => clearTimeout(timeoutId);
    } else {
      // Pause animation and expand clicked card
      setExpandedStep(idx);
      setIsAutoAnimating(false);
      if (animationRef.current.timer) {
        clearInterval(animationRef.current.timer);
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowAboutModal(true)} className="text-gray-700 hover:text-blue-600">About Us</Button>
              <Button variant="ghost" onClick={() => setShowFeaturesModal(true)} className="text-gray-700 hover:text-blue-600">Features</Button>
              {user ? (
                <Button variant="ghost" onClick={() => setShowAuthModal(true)} aria-label="Sign In">Sign In</Button>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Get Started">Get Started</Button>
              )}
            </div>
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
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white/50 text-white hover:bg-white/20 text-lg px-8 py-6 font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[200px] relative overflow-hidden group bg-white/5 backdrop-blur-sm"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Learn More
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center md:justify-end relative min-h-[340px]">
            {/* Blurred curved background */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[380px] md:h-[380px] rounded-[70%_30%_40%_60%/30%_70%_60%_40%] bg-gradient-to-br from-blue-100 via-purple-100 to-white/80 blur-2xl opacity-70 z-0 animate-float-slow"></div>
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
            <Card className={`text-center transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm ${hasAnimatedFeatures ? 'animate-fade-in-up' : ''} hover:shadow-2xl hover:border-blue-400 border-t-4 border-transparent group hover:animate-glow-card`}>
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-blue-200/50 transition-all duration-500">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Easy Group Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Create and join subscription groups with simple invite codes. Manage members and track participation effortlessly.</CardDescription>
              </CardContent>
            </Card>
            <Card className={`text-center transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm ${hasAnimatedFeatures ? 'animate-fade-in-up delay-50' : ''} hover:shadow-2xl hover:border-green-400 border-t-4 border-transparent group hover:animate-glow-card`}>
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-green-200/50 transition-all duration-500">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Smart Payment Splitting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Automatically calculate and track payments. Transparent cost breakdown with secure payment processing.</CardDescription>
              </CardContent>
            </Card>
            <Card className={`text-center transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm ${hasAnimatedFeatures ? 'animate-fade-in-up delay-100' : ''} hover:shadow-2xl hover:border-purple-400 border-t-4 border-transparent group hover:animate-glow-card`}>
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-purple-200/50 transition-all duration-500">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Bank-level security for all transactions. Your data is encrypted and never shared with third parties.</CardDescription>
              </CardContent>
            </Card>
            <Card className={`text-center transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm ${hasAnimatedFeatures ? 'animate-fade-in-up delay-150' : ''} hover:shadow-2xl hover:border-orange-400 border-t-4 border-transparent group hover:animate-glow-card`}>
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:shadow-orange-200/50 transition-all duration-500">
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
        {/* Enhanced background with multiple gradients */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-indigo-100 to-purple-100 opacity-70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/50 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-4 animate-fade-in-up">How It Works</h2>
          <p className="text-xl text-indigo-600 max-w-2xl mx-auto animate-fade-in-up delay-100">Get started in just a few steps. Sharing subscriptions has never been easier!</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 relative z-10 px-4">
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
              className={`relative bg-gradient-to-br from-white via-violet-50/50 to-indigo-50/50 backdrop-blur-sm rounded-2xl shadow-lg p-10 mb-8 border-t-4 ${
                idx === 0 ? 'border-blue-400' : idx === 1 ? 'border-purple-400' : 'border-indigo-400'
              } w-80 cursor-pointer hover:shadow-2xl transition-all duration-700 ease-in-out group ${
                expandedStep === idx ? 'ring-2 ring-violet-400 shadow-2xl scale-105' : ''
              }`}
              onClick={() => handleHowItWorksCardClick(idx)}
            >
              {/* Enhanced decorative background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-indigo-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-400/20 to-indigo-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Enhanced icon container */}
              <div className={`relative z-10 w-20 h-20 mx-auto bg-gradient-to-br ${
                idx === 0 ? 'from-blue-500 via-indigo-500 to-purple-500' :
                idx === 1 ? 'from-purple-500 via-indigo-500 to-blue-500' :
                'from-indigo-500 via-blue-500 to-purple-500'
              } rounded-2xl flex items-center justify-center mb-8 transition-all duration-700 ease-in-out shadow-lg group-hover:scale-110 ${
                expandedStep === idx ? 'scale-110' : ''
              }`}>
                {step.icon}
              </div>
              
              <div className="relative z-10">
                <div className={`font-bold text-2xl mb-4 bg-gradient-to-r ${
                  idx === 0 ? 'from-blue-600 to-indigo-600' :
                  idx === 1 ? 'from-purple-600 to-indigo-600' :
                  'from-indigo-600 to-blue-600'
                } bg-clip-text text-transparent transition-colors duration-700`}>
                  {step.title}
                </div>
                <div className="text-violet-600/90 text-lg leading-relaxed transition-colors duration-700 mb-6">
                  {step.description}
                </div>
                <div
                  className={`transition-all duration-700 ease-in-out overflow-hidden ${
                    expandedStep === idx ? 'max-h-48 mt-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className={`text-base text-violet-700 bg-gradient-to-br ${
                    idx === 0 ? 'from-blue-50 via-indigo-50 to-purple-50' :
                    idx === 1 ? 'from-purple-50 via-indigo-50 to-blue-50' :
                    'from-indigo-50 via-blue-50 to-purple-50'
                  } rounded-xl p-6 border border-violet-100/50 shadow-inner backdrop-blur-sm`}>
                    <div className={`${expandedStep === idx ? 'text-animation' : ''}`}>
                      {step.details}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced hover effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-400/0 via-indigo-400/0 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur"></div>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Enhanced background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-70"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-medium"></div>
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-2xl animate-float-fast"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl overflow-hidden relative group">
            {/* Enhanced animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-indigo-400/30 animate-gradient-x"></div>
            
            {/* Animated shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine"></div>
            </div>
            
            {/* Content */}
            <div className="relative p-12 md:p-16">
              {/* Enhanced decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-float-slow"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-float-medium"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent animate-gradient-x">
                  Ready to Start Saving?
                </h2>
                <p className="text-xl md:text-2xl mb-10 text-blue-50/90 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of users who are already sharing subscriptions and saving money.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    onClick={() => setShowAuthModal(true)} 
                    className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 animate-pulse-once min-w-[200px] relative overflow-hidden group"
                  >
                    <span className="relative z-10">Create Your First Group</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-white/50 text-white hover:bg-white/20 text-lg px-8 py-6 font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[200px] relative overflow-hidden group bg-white/5 backdrop-blur-sm"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Learn More
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-t py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[400px] h-[400px] bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 group">
                <div className="relative">
                  <img src="/images/Untitled design (1).png" alt="PlayForm Logo" width={36} height={36} className="rounded shadow-lg transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">PlayForm</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Making subscription sharing simple, secure, and fair for everyone. Join our community today.
              </p>
              <div className="flex gap-4">
                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-gray-600 hover:text-blue-500 hover:shadow-md transition-all duration-300 hover:scale-110 hover:bg-blue-50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.916 4.916 0 0 0 16.616 3c-2.72 0-4.924 2.206-4.924 4.924 0 .386.044.763.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.724-.666 1.562-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
                </a>
                <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-gray-600 hover:text-blue-700 hover:shadow-md transition-all duration-300 hover:scale-110 hover:bg-blue-50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-gray-600 hover:text-pink-600 hover:shadow-md transition-all duration-300 hover:scale-110 hover:bg-pink-50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => setShowAboutModal(true)} 
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    About Us
                  </button>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowPricingModal(true); }} className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowFeaturesModal(true); }} className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <ul className="space-y-3">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/gdpr" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    GDPR
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowCookieModal(true); }} className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:aryansharma35x@gmail.com" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                    <svg className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    aryansharma35x@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+919876543210" className="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                    <svg className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +91 98765 43210
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} PlayForm. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors hover:scale-105 inline-block">Privacy</a>
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors hover:scale-105 inline-block">Terms</a>
                <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors hover:scale-105 inline-block">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">About PlayForm</h2>
                <Button variant="ghost" onClick={() => setShowAboutModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              <div className="space-y-8">
                {/* Project Overview */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h3>
                  <p className="text-gray-600 leading-relaxed">
                    PlayForm is a B.Tech project developed by students at Sharda University. 
                    Our mission is to make subscription sharing simple, secure, and fair for everyone.
                  </p>
                </div>

                {/* Team Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-gray-900">B.Tech Students</CardTitle>
                          <CardDescription>Sharda University</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        We are a team of passionate B.Tech students from Sharda University working on innovative solutions to everyday problems.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-gray-900">Location</CardTitle>
                          <CardDescription>Greater Noida, Uttar Pradesh</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        Based in the heart of Greater Noida at Sharda University, we're part of a vibrant tech community.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Project Vision */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    At PlayForm, we envision a world where premium digital content is accessible to everyone. 
                    Our platform makes it possible for people to enjoy their favorite streaming services without 
                    breaking the bank, while maintaining security and transparency.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Mission</h4>
                      <p className="text-gray-600 text-sm">
                        To revolutionize subscription sharing by making it simple, secure, and fair for everyone.
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Values</h4>
                      <p className="text-gray-600 text-sm">
                        Innovation, transparency, and user-centric design drive everything we do.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Future Plans */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Future Plans</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Expansion</h4>
                      <p className="text-gray-600 text-sm">
                        Adding support for more streaming platforms and subscription services.
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                      <p className="text-gray-600 text-sm">
                        Introducing advanced group management and payment tracking features.
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-2">Community</h4>
                      <p className="text-gray-600 text-sm">
                        Building a strong community of users and implementing feedback-driven improvements.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="text-center space-y-4">
                  <div className="bg-white/80 rounded-xl p-6 border border-blue-100 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Get in Touch</h3>
                    <p className="text-gray-600 mb-4">Have questions or want to collaborate? Reach out to us!</p>
                    <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href="mailto:aryansharma35x@gmail.com" className="hover:text-blue-700 transition-colors">
                        aryansharma35x@gmail.com
                      </a>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => window.location.href = 'mailto:aryansharma35x@gmail.com'}
                  >
                    Send us an Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Terms and Conditions</h2>
                <Button variant="ghost" onClick={() => setShowTermsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-8">Last updated: 12/06/2025</p>
                
                <p className="mb-6">
                  Welcome to Playform Technologies Pvt. Ltd. ("Playform", "we", "us", or "our"). These Terms and Conditions ("Terms") constitute a binding legal agreement between you ("you", "user", or "member") and Playform regarding your use of our services, mobile applications, websites, software platforms, and any associated content or functionality (collectively, the "Platform").
                </p>
                <p className="mb-6">
                  By registering, accessing, or using the Platform, you agree to comply with and be legally bound by these Terms, whether or not you become a registered user of the Platform.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Platform Overview</h2>
                <p>Playform is a digital platform that facilitates:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Time-bound digital access to premium third-party software and entertainment services.</li>
                  <li>Collaborative consumption via verified group purchases.</li>
                  <li>Secure account sharing, hosting, and management through smart session and access control.</li>
                </ul>
                <p>We do not own, resell, or redistribute third-party services. We act solely as a technology facilitator between verified hosts and users.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Eligibility & Account Registration</h2>
                <ul className="list-disc pl-6 mb-6">
                  <li>You must be at least 18 years old to create an account.</li>
                  <li>You are responsible for maintaining the confidentiality of your credentials.</li>
                  <li>Playform reserves the right to verify your identity before providing access to specific services.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Use of the Platform</h2>
                <h3 className="text-xl font-semibold mt-4 mb-2">Permitted Use:</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Access and utilize premium tools or services made available by verified hosts on a per-hour or per-day rental basis.</li>
                  <li>Create or join shared groups for collaborative subscription ownership.</li>
                </ul>
                <h3 className="text-xl font-semibold mt-4 mb-2">Prohibited Use:</h3>
                <ul className="list-disc pl-6 mb-6">
                  <li>Tampering with account settings (e.g., password, email, linked devices).</li>
                  <li>Hosting unauthorized or pirated accounts.</li>
                  <li>Engaging in bot-driven activity, fraud, or bypassing Playform's billing system.</li>
                  <li>Violating the terms of service of any third-party platform.</li>
                </ul>
                <p>Violation of this section may result in immediate termination and potential legal action.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Payments, Billing & Refunds</h2>
                <ul className="list-disc pl-6 mb-6">
                  <li>All transactions are processed through our secure payment partners.</li>
                  <li>Billing is determined based on actual usage or group plan participation.</li>
                  <li>No refund will be issued for completed or active sessions.</li>
                  <li>Users may request a refund only in the case of technical failure, verified service inaccessibility, or accidental overbilling, subject to Playform's sole discretion.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">5. Group Subscriptions</h2>
                <ul className="list-disc pl-6 mb-6">
                  <li>Playform enables users to create or join subscription-sharing groups.</li>
                  <li>Group admins ("hosts") are responsible for the setup and ongoing access of the service.</li>
                  <li>Auto-splitting of fees and roles is handled by the Playform system.</li>
                  <li>Playform is not liable for disputes arising between group members.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">6. Account Hosting Responsibilities</h2>
                <p>If you list a digital service for shared access:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>You represent that you are the lawful owner or authorized user of the account.</li>
                  <li>You agree to maintain uninterrupted access during the user's rental window.</li>
                  <li>You will not share Playform-provided session links externally.</li>
                  <li>You are solely responsible for ensuring compliance with the third-party service's usage policy.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">7. Security and Trust</h2>
                <ul className="list-disc pl-6 mb-6">
                  <li>All sessions are sandboxed with access time limits and monitoring.</li>
                  <li>Our platform uses industry-grade encryption, anonymized credentials, and scheduled logout systems.</li>
                  <li>Any suspicious activity is automatically flagged and may lead to account suspension.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">8. Intellectual Property</h2>
                <ul className="list-disc pl-6 mb-6">
                  <li>All software, branding, content, and source code used by Playform is owned by Playform or its licensors.</li>
                  <li>Users may not replicate, clone, or reverse engineer any part of the platform.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">9. Data Privacy</h2>
                <p className="mb-6">Your personal data is protected under applicable privacy laws and governed by our Privacy Policy. Playform does not sell or rent your personal data to third parties.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">10. Limitation of Liability</h2>
                <p>To the maximum extent permitted by law:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Playform is not responsible for losses arising from use or misuse of the Platform.</li>
                  <li>We do not guarantee uninterrupted access to third-party services, nor are we liable for third-party policy changes.</li>
                  <li>Your use of shared accounts is at your own risk.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">11. Termination & Suspension</h2>
                <p>Playform reserves the right to:</p>
                <ul className="list-disc pl-6 mb-6">
                  <li>Suspend or terminate any user account that violates these Terms.</li>
                  <li>Withhold access or disable listings due to policy breaches, fraudulent activity, or third-party complaints.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">12. Modifications</h2>
                <p className="mb-6">We may update these Terms at any time. Material changes will be communicated via email or push notification. Continued use of the Platform after such updates constitutes acceptance.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">13. Governing Law</h2>
                <p className="mb-6">These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Delhi NCR.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contact Us</h2>
                <p>For support, legal inquiries, or partnership opportunities:</p>
                <ul className="list-none pl-6 mb-6">
                  <li>📧 legal@playform.tech</li>
                  <li>🌐 www.playform.tech</li>
                </ul>

                <p className="mt-8 font-semibold">🔒 By using Playform, you confirm that you have read, understood, and agreed to these Terms.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Features Modal */}
      {showFeaturesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features – What Makes Playform Unique</h2>
                <Button variant="ghost" onClick={() => setShowFeaturesModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-8">
                  Playform is not just another platform. It's a powerful, real-time, secure sharing system designed for the digital age — where users can access premium tools, apps, and subscriptions affordably, and even earn from the assets they already own.
                </p>

                <div className="space-y-8">
                  {/* Pay-Per-Use Access */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Pay-Per-Use Access</h3>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">💸</span>
                        <span>Hourly or Daily Pricing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">⏱️</span>
                        <span>Access high-value software or subscriptions without monthly commitments.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">💼</span>
                        <span>Ideal for freelancers, students, and part-time users.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Group Buy & Shared Subscriptions */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Group Buy & Shared Subscriptions</h3>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🤝</span>
                        <span>Join or create verified user groups to co-own premium plans.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">💳</span>
                        <span>Auto-split billing, manage renewals, and avoid overpaying.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🧠</span>
                        <span>Smart sharing algorithms ensure fair and secure access for all members.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Instant Access Delivery */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Access Delivery</h3>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🚀</span>
                        <span>Get real-time credentials or sessions seconds after payment.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🔐</span>
                        <span>Encrypted delivery system ensures 100% security and anonymity.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">📦</span>
                        <span>Track access duration, renewal dates, and usage time from your dashboard.</span>
                      </li>
                    </ul>
                  </div>

                  {/* One Dashboard. Total Control. */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">One Dashboard. Total Control.</h3>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">📊</span>
                        <span>View your active subscriptions, group status, and shared earnings.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🧾</span>
                        <span>Download invoices and track payment history.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🔔</span>
                        <span>Real-time notifications for usage limits, renewals, and group invites.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Bank-Grade Security */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Bank-Grade Security</h3>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🛡️</span>
                        <span>256-bit encryption across sessions and credentials.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🔁</span>
                        <span>Auto-timeout and auto-logout features to protect all shared IDs.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🚨</span>
                        <span>Fraud detection, misuse alerts, and identity-verification system.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Become a Host */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Become a Host</h3>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">💰</span>
                        <span>Share your unused accounts with verified users.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">📈</span>
                        <span>Set your price, duration, and control access.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🔄</span>
                        <span>Fully automated sharing and payment management.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Multi-Platform Support */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Platform Support</h3>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">📱</span>
                        <span>Available on Web, Android, and iOS</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🖥️</span>
                        <span>Optimized for Desktop and Mobile interfaces</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🧩</span>
                        <span>Browser plugins & app integration (Coming soon)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Smart Support */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Support</h3>
                    <ul className="list-none space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🤖</span>
                        <span>24/7 AI-Powered Helpdesk + Live Agent Support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">📝</span>
                        <span>Guided onboarding for new users</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-2xl">🔄</span>
                        <span>Automated support for common issues</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">💰 Pricing – Simple, Transparent, Flexible</h2>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-8">
                Pay only for what you need. Whether you're a student using tools for a few hours or a team looking to co-own premium software, Playform offers pricing that adapts to your needs.
              </p>

              <div className="space-y-8">
                {/* Pay-Per-Use Plans */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Pay-Per-Use Plans</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Hourly</h4>
                      <p className="text-sm text-gray-600 mb-2">Short tasks, quick access</p>
                      <p className="text-2xl font-bold text-blue-600 mb-4">₹19/hr</p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Instant login</li>
                        <li>• Secure session</li>
                        <li>• Flexible exit</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Daily</h4>
                      <p className="text-sm text-gray-600 mb-2">One-time projects or binge days</p>
                      <p className="text-2xl font-bold text-blue-600 mb-4">₹49/day</p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• 24-hour full access</li>
                        <li>• No auto-renewals</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Weekly</h4>
                      <p className="text-sm text-gray-600 mb-2">Extended access on budget</p>
                      <p className="text-2xl font-bold text-blue-600 mb-4">₹199/week</p>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• 7-day validity</li>
                        <li>• Priority slots</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Group Sharing Plans */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Group Sharing Plans (Split Cost)</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Join Group</h4>
                      <p className="text-sm text-gray-600 mb-2">Join existing verified groups</p>
                      <p className="text-2xl font-bold text-blue-600 mb-4">As low as ₹59/mo</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Create Group</h4>
                      <p className="text-sm text-gray-600 mb-2">Start your own shareable plan with friends</p>
                      <p className="text-2xl font-bold text-blue-600 mb-4">Custom — you set the share</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Auto-Match</h4>
                      <p className="text-sm text-gray-600 mb-2">We match you with others based on preferences</p>
                      <p className="text-2xl font-bold text-blue-600 mb-4">From ₹79/mo</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>🔁</span> Auto-renew & notify
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🔐</span> Fully managed by Playform
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📤</span> Cancel or leave group anytime
                    </div>
                  </div>
                </div>

                {/* Premium Services Marketplace */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Premium Services Marketplace</h3>
                  <p className="text-sm text-gray-600 mb-4">Access top-tier subscriptions on-demand:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span>🎨</span> Canva Pro <span className="text-blue-600">from ₹15/hour</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📺</span> Netflix Premium <span className="text-blue-600">from ₹25/hour</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💬</span> ChatGPT Plus <span className="text-blue-600">from ₹20/hour</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🧠</span> Grammarly, Adobe CC, VS Code Plugins <span className="text-blue-600">from ₹10/hour</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">💡 Prices may vary by region and availability. Bulk discounts available.</p>
                </div>

                {/* Hosting & Earnings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Hosting & Earnings (For Providers)</h3>
                  <p className="text-sm text-gray-600 mb-4">Want to earn from your unused accounts?</p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Basic Host</h4>
                      <p className="text-2xl font-bold text-blue-600 mb-4">75% Host / 25% Platform</p>
                      <p className="text-sm text-gray-600">Share verified IDs, get paid instantly</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Verified Host</h4>
                      <p className="text-2xl font-bold text-blue-600 mb-4">85% Host / 15% Platform</p>
                      <p className="text-sm text-gray-600">KYC badge, featured listing, fast payouts</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-2">Enterprise Host</h4>
                      <p className="text-2xl font-bold text-blue-600 mb-4">Custom</p>
                      <p className="text-sm text-gray-600">API access, dedicated support, brand control</p>
                    </div>
                  </div>
                </div>

                {/* Teams & Institutions */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Teams & Institutions (Coming Soon)</h3>
                  <p className="text-sm text-gray-600 mb-4">Special packages for:</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span>🏫</span> Schools / Colleges
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🧑‍💼</span> Remote Teams & Startups
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👪</span> Families
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">📦 Includes team billing, user seats, centralized dashboard, shared vault.</p>
                </div>

                {/* What's Always Included */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">What's Always Included</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span>✓</span> Secure access
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span> Real-time session management
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span> Transparent billing
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span> Smart usage reminders
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span> 24/7 support
                    </div>
                  </div>
                </div>

                {/* Trial & Offers */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Trial & Offers</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span>🎁</span> First Hour Free on Selected Services
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🎉</span> ₹100 Credit on Signup
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👥</span> Refer & Earn up to ₹500 per user
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💡</span> 20% Off on First Group Purchase
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">🎯 No hidden fees. Cancel anytime. You're always in control.</p>
                </div>

                <div className="text-center text-gray-600">
                  <p>Need help choosing a plan? Contact us: support@playform.tech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Privacy Policy – Playform Technologies Pvt. Ltd.</h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-600 mb-6">
                <p>Effective Date: 12/06/2025</p>
                <p>Last Updated: 12/06/2025</p>
              </div>
              <p className="text-gray-600 mb-8">
                Welcome to Playform ("Company", "we", "our", or "us"). Your privacy is of utmost importance to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, mobile application, or use any of our services (collectively, the "Platform").
              </p>

              <div className="space-y-8">
                {/* 1. Information We Collect */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">1. Information We Collect</h3>
                  <p className="text-gray-600 mb-4">We collect the following categories of personal and usage data:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">a. Personal Identifiable Information (PII)</h4>
                      <ul className="list-disc pl-6 text-gray-600 space-y-1">
                        <li>Full name</li>
                        <li>Email address</li>
                        <li>Mobile number</li>
                        <li>Payment information (processed via third-party gateways)</li>
                        <li>Government ID (only if needed for account verification)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">b. Non-Personal Data</h4>
                      <ul className="list-disc pl-6 text-gray-600 space-y-1">
                        <li>IP address</li>
                        <li>Browser and device type</li>
                        <li>Operating system</li>
                        <li>Access times and referring URLs</li>
                        <li>Usage behavior and feature interactions</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">c. Optional Data</h4>
                      <ul className="list-disc pl-6 text-gray-600 space-y-1">
                        <li>Profile photo, social links, or preferences (if you choose to provide)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 2. How We Use Your Information */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">2. How We Use Your Information</h3>
                  <p className="text-gray-600 mb-4">We use your information to:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Provide and maintain our services</li>
                    <li>Process transactions and facilitate payments</li>
                    <li>Personalize your experience on the platform</li>
                    <li>Facilitate account sharing and group access scheduling</li>
                    <li>Detect fraud, abuse, and suspicious activity</li>
                    <li>Communicate platform updates, promotions, and policy changes</li>
                    <li>Fulfill legal obligations under applicable laws</li>
                  </ul>
                </div>

                {/* 3. Data Sharing and Disclosure */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">3. Data Sharing and Disclosure</h3>
                  <p className="text-gray-600 mb-4">We do not sell your personal information. We may share your data with:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Service providers (payment processors, SMS/email providers, analytics)</li>
                    <li>Legal authorities, if required under law or to protect rights and safety</li>
                    <li>Affiliates and partners, under strict confidentiality, for operational reasons</li>
                  </ul>
                  <p className="text-gray-600 mt-4">All third parties are contractually obligated to protect your data and comply with this policy.</p>
                </div>

                {/* 4. Cookies and Tracking Technologies */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">4. Cookies and Tracking Technologies</h3>
                  <p className="text-gray-600 mb-4">We use cookies, pixels, and similar technologies to:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Maintain session state</li>
                    <li>Analyze site usage patterns</li>
                    <li>Deliver targeted advertisements (opt-out available)</li>
                  </ul>
                  <p className="text-gray-600 mt-4">You may disable cookies via your browser settings, but some features may not function correctly.</p>
                </div>

                {/* 5. Data Security */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">5. Data Security</h3>
                  <p className="text-gray-600">We implement bank-grade encryption (AES-256), SSL/TLS protocols, and access control mechanisms to protect your data. However, no system is 100% secure, and we encourage strong password practices.</p>
                </div>

                {/* 6. User Rights */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">6. User Rights</h3>
                  <p className="text-gray-600 mb-4">Depending on your jurisdiction, you may have the right to:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Access your personal data</li>
                    <li>Rectify incorrect or outdated data</li>
                    <li>Delete your data ("Right to be Forgotten")</li>
                    <li>Withdraw consent for data processing</li>
                    <li>Request data portability</li>
                  </ul>
                  <p className="text-gray-600 mt-4">To exercise any of these rights, contact us at: privacy@playform.tech</p>
                </div>

                {/* 7. Data Retention */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">7. Data Retention</h3>
                  <p className="text-gray-600 mb-4">We retain your data:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>As long as your account is active</li>
                    <li>As needed to fulfill the purposes outlined in this policy</li>
                    <li>For a limited period after account deletion (for audit and fraud control)</li>
                  </ul>
                </div>

                {/* 8. Children's Privacy */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">8. Children's Privacy</h3>
                  <p className="text-gray-600">Playform is not intended for users under the age of 18. We do not knowingly collect data from minors. If we learn that we have, we will delete such data immediately.</p>
                </div>

                {/* 9. Cross-Border Data Transfers */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">9. Cross-Border Data Transfers</h3>
                  <p className="text-gray-600">By using our platform, you acknowledge that your data may be processed and stored in countries outside your own. We ensure such transfers meet applicable data protection standards.</p>
                </div>

                {/* 10. Third-Party Services */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">10. Third-Party Services</h3>
                  <p className="text-gray-600">Our platform may include links or integrations with third-party tools (e.g., Google, Razorpay, Firebase). We are not responsible for the privacy practices of these external platforms. Please review their policies independently.</p>
                </div>

                {/* 11. Policy Updates */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">11. Policy Updates</h3>
                  <p className="text-gray-600">We may revise this Privacy Policy periodically. You will be notified of significant changes via email or in-app alerts. Continued use of the platform after changes implies acceptance.</p>
                </div>

                {/* 12. Contact Us */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">12. Contact Us</h3>
                  <p className="text-gray-600 mb-2">For data-related inquiries or complaints:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>📧 privacy@playform.tech</li>
                    <li>📍 Playform Technologies Pvt. Ltd.</li>
                  </ul>
                </div>

                <div className="text-center text-gray-600 mt-8">
                  <p>By using Playform, you consent to the practices outlined in this Privacy Policy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Cookie Policy Modal */}
      {showCookieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Cookie Policy – Playform Technologies Pvt. Ltd.</h2>
                <button
                  onClick={() => setShowCookieModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-600 mb-6">
                <p>Effective Date: 12/06/2025</p>
                <p>Last Updated: 12/06/2025</p>
              </div>
              <p className="text-gray-600 mb-8">
                This Cookie Policy explains how Playform Technologies Pvt. Ltd. ("Playform", "we", "us", or "our") uses cookies and similar tracking technologies when you visit or interact with our website, mobile app, or services ("Platform").
              </p>
              <p className="text-gray-600 mb-8">
                By continuing to use our Platform, you consent to the use of cookies as outlined in this policy, unless you disable them in your browser or settings.
              </p>

              <div className="space-y-8">
                {/* 1. What Are Cookies? */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">1. What Are Cookies?</h3>
                  <p className="text-gray-600 mb-4">Cookies are small text files stored on your device (computer, smartphone, tablet) when you access or interact with a website or application. They help remember your preferences, login sessions, and provide a smoother user experience.</p>
                  <p className="text-gray-600 mb-4">We also use similar technologies like:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Web beacons / pixels</li>
                    <li>HTML5 local storage</li>
                    <li>SDK tracking (in-app analytics)</li>
                  </ul>
                </div>

                {/* 2. Why We Use Cookies */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">2. Why We Use Cookies</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✅</span>
                      <div>
                        <h4 className="font-semibold mb-2">Ensure Platform Functionality</h4>
                        <p className="text-gray-600">Allow core features like login sessions, account switching, group joining, and real-time sharing to work correctly.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✅</span>
                      <div>
                        <h4 className="font-semibold mb-2">Personalize User Experience</h4>
                        <p className="text-gray-600">Remember user preferences, preferred language, and selected themes.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✅</span>
                      <div>
                        <h4 className="font-semibold mb-2">Analytics & Performance</h4>
                        <p className="text-gray-600">Track how users interact with the platform to improve design, navigation, and user satisfaction (e.g., Google Analytics, Firebase).</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✅</span>
                      <div>
                        <h4 className="font-semibold mb-2">Marketing & Retargeting</h4>
                        <p className="text-gray-600">Show you relevant ads across the internet based on your usage behavior (e.g., Meta Pixel, Google Ads).</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✅</span>
                      <div>
                        <h4 className="font-semibold mb-2">Security</h4>
                        <p className="text-gray-600">Detect and prevent fraudulent activity, unusual logins, or abuse.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Types of Cookies We Use */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">3. Types of Cookies We Use</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 border">Type</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 border">Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-600 border">Strictly Necessary</td>
                          <td className="px-4 py-2 text-sm text-gray-600 border">Essential for core features like login and transactions. Cannot be disabled.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-600 border">Functional</td>
                          <td className="px-4 py-2 text-sm text-gray-600 border">Remembers choices you make (like language or session timeout).</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-600 border">Performance</td>
                          <td className="px-4 py-2 text-sm text-gray-600 border">Helps us improve performance and UX by tracking user interaction.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-600 border">Targeting / Advertising</td>
                          <td className="px-4 py-2 text-sm text-gray-600 border">Delivers personalized ads based on your interests and platform use.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Third-Party Cookies */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">4. Third-Party Cookies</h3>
                  <p className="text-gray-600 mb-4">Some cookies are set by third-party services that we integrate with. These may include:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>Google Analytics</li>
                    <li>Google Ads</li>
                    <li>Meta (Facebook) Pixel</li>
                    <li>Hotjar / Mixpanel</li>
                    <li>Razorpay / Stripe SDKs</li>
                  </ul>
                  <p className="text-gray-600 mt-4">We do not control these cookies directly. Please refer to their respective privacy and cookie policies.</p>
                </div>

                {/* 5. Managing Your Cookie Preferences */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">5. Managing Your Cookie Preferences</h3>
                  <p className="text-gray-600 mb-4">You have full control over cookie usage.</p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🔧</span>
                      <div>
                        <h4 className="font-semibold mb-2">Browser Settings</h4>
                        <p className="text-gray-600">Most browsers let you manage or disable cookies via settings. However, disabling essential cookies may limit functionality.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🌐</span>
                      <div>
                        <h4 className="font-semibold mb-2">Do Not Track (DNT)</h4>
                        <p className="text-gray-600">Our platform honors DNT signals where supported.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">⚙️</span>
                      <div>
                        <h4 className="font-semibold mb-2">In-App Preferences</h4>
                        <p className="text-gray-600">On mobile apps, you can manage tracking permissions under app settings.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📣</span>
                      <div>
                        <h4 className="font-semibold mb-2">Cookie Consent Banner</h4>
                        <p className="text-gray-600">When you first visit Playform, a consent popup will appear allowing you to accept or manage cookies. You can change your preferences anytime.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Data Retention */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">6. Data Retention</h3>
                  <p className="text-gray-600 mb-4">Cookies may remain stored on your browser for:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>A single session (session cookies)</li>
                    <li>Up to 12 months (persistent cookies), unless manually deleted</li>
                  </ul>
                  <p className="text-gray-600 mt-4">Analytics cookies expire within a 90–365 day period depending on service provider settings.</p>
                </div>

                {/* 7. Updates to This Policy */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">7. Updates to This Policy</h3>
                  <p className="text-gray-600">We may update this Cookie Policy to reflect legal, technical, or operational changes. Material updates will be notified via banner or in-app alert.</p>
                </div>

                {/* 8. Contact Us */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">8. Contact Us</h3>
                  <p className="text-gray-600 mb-2">For questions or concerns about cookies or privacy practices:</p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-1">
                    <li>📧 privacy@playform.tech</li>
                    <li>🌍 www.playform.tech</li>
                    <li>📍 Playform Technologies Pvt. Ltd.</li>
                  </ul>
                </div>

                <div className="text-center text-gray-600 mt-8">
                  <p>✅ By using our platform, you consent to our use of cookies and tracking technologies in accordance with this Cookie Policy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* GDPR Modal */}
      <GDPRModal isOpen={showGDPRModal} onClose={() => setShowGDPRModal(false)} />
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
  @keyframes glow-card {
    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.2); }
    50% { box-shadow: 0 0 20px 4px rgba(99,102,241,0.3); }
  }
  .animate-glow-card { animation: glow-card 2s ease-in-out infinite; }
  @keyframes gradient-x {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes shine {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
  }
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
  .animate-gradient-x {
    animation: gradient-x 15s ease infinite;
    background-size: 200% 200%;
  }
  .animate-shine {
    animation: shine 3s ease-in-out infinite;
  }
  .animate-pulse-slow {
    animation: pulse-slow 4s ease-in-out infinite;
  }
  @keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
  }
  @keyframes blink {
    50% { border-color: transparent; }
  }
  .animate-typewriter {
    display: inline-block;
    overflow: hidden;
    white-space: normal;
    width: 100%;
    animation: typewriter 4s steps(20, end) forwards;
  }
  .animate-typewriter::after {
    content: '|';
    animation: blink 0.7s infinite;
    margin-left: 2px;
  }
  @keyframes fadeIn {
    0% { 
      opacity: 0; 
      transform: translateY(10px);
    }
    100% { 
      opacity: 1; 
      transform: translateY(0);
    }
  }

  .text-animation {
    opacity: 0;
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('playform-animations')) {
  style.id = 'playform-animations';
  document.head.appendChild(style);
}

export default Index;
