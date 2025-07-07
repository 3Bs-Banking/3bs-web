"use client";

import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Building, 
  Shield,
  Settings,
  BarChart3,
  ArrowRight
} from "lucide-react";
import TopBarSearch from "@/components/ui/TopBarSearch";

const slideshowItems = [
  { 
    src: "/flags/bankk.jpg", 
    path: "/BankPerformance", 
    alt: "Bank Performance",
    title: "Bank Performance Analytics",
    description: "Comprehensive overview of your bank's financial metrics and KPIs",
    icon: Building,
    gradient: "from-blue-600 to-purple-600",
    stats: "99.2% Accuracy"
  },
  { 
    src: "/flags/branchh.png", 
    path: "/BranchPerformance", 
    alt: "Branch Performance",
    title: "Branch Performance Insights",
    description: "Track and analyze individual branch performance across all locations",
    icon: BarChart3,
    gradient: "from-green-600 to-blue-600",
    stats: "50+ Branches"
  },
  { 
    src: "/flags/s5.png", 
    path: "/EmployeePerformance", 
    alt: "Employee Performance",
    title: "Employee Performance Management",
    description: "Monitor and enhance employee productivity and engagement",
    icon: Users,
    gradient: "from-purple-600 to-pink-600",
    stats: "500+ Employees"
  },
  { 
    src: "/flags/s6.png", 
    path: "/GiveAccess", 
    alt: "Give Access",
    title: "Access Control Management",
    description: "Secure user access management and permission controls",
    icon: Shield,
    gradient: "from-red-600 to-orange-600",
    stats: "Bank-Grade Security"
  },
  { 
    src: "/flags/s1.jpg", 
    path: "/settings", 
    alt: "Settings",
    title: "System Configuration",
    description: "Customize and configure your dashboard preferences",
    icon: Settings,
    gradient: "from-gray-600 to-slate-600",
    stats: "Full Customization"
  },
];

export default function Welcome() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [language, setLanguage] = useState("English (US)");
  const [flag, setFlag] = useState("/flags/us.png");
  const [notifications, setNotifications] = useState([
    "Hania Requested Access",
    "Alex Branch performance updated!",
  ]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-play slideshow
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slideshowItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const nextSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % slideshowItems.length);
  };

  const prevSlide = () => {
    setSlideIndex((prevIndex) =>
      prevIndex === 0 ? slideshowItems.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: SetStateAction<number>) => {
    setSlideIndex(index);
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/user", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data?.data?.user;
        if (user?.fullName) {
          const [first, ...rest] = user.fullName.split(" ");
          setFirstName(first);
          setLastName(rest.join(" "));
        }
        if (user?.role) setRole(user.role);
      })
      .catch((err) => console.error("❌ Failed to fetch user", err));
  }, []);

  const changeLanguage = (lang: string) => {
    if (lang === "Eng (US)") {
      setLanguage("Eng (US)");
      setFlag("/flags/us.png");
    } else {
      setLanguage("Arabic");
      setFlag("/flags/eg.png");
    }
  };

  const currentSlide = slideshowItems[slideIndex];
  const IconComponent = currentSlide.icon;

  if (!mounted) return null;

  return (
    <>
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
          }
        }
        
        .slide-in {
          animation: slideIn 0.8s ease-out;
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .float {
          animation: float 3s ease-in-out infinite;
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 p-6">
          {/* Enhanced Top Bar */}
          <div className="flex justify-between items-center bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-2xl shadow-2xl mb-8">
            <div className="w-72">
              <TopBarSearch />
            </div>
            
            {/* Welcome Message */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1">
                Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{firstName}</span>
              </h1>
              <p className="text-white/70 text-sm">Ready to explore your dashboard</p>
            </div>

            <div className="flex items-center gap-6">
              {/* Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Image src={flag} alt="flag" width={30} height={30} className="rounded-full" />
                  <span className="text-white font-medium">{language}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border border-white/20">
                  <DropdownMenuItem onClick={() => changeLanguage("Eng (US)")} className="text-white hover:bg-white/20">
                    🇺🇸 Eng (US)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("Arabic")} className="text-white hover:bg-white/20">
                    🇪🇬 Arabic
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger className="relative cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Bell className="text-white" size={24} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                      {notifications.length}
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border border-white/20 min-w-64">
                  {notifications.length > 0 ? (
                    notifications.map((notif, i) => (
                      <DropdownMenuItem key={i} className="text-white hover:bg-white/20 p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                          <span className="text-sm">{notif}</span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem className="text-white/70">No new notifications</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <Avatar className="w-12 h-12 border-2 border-white/20">
                  <AvatarImage src="/flags/logo.png" />
                  <AvatarFallback className="bg-purple-600 text-white font-bold">{firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{role}</p>
                  <p className="text-xs text-white/70">{firstName} {lastName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Slideshow Section */}
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 fade-in">
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                <h2 className="text-4xl font-bold text-white">Explore Your Dashboard</h2>
                <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
              </div>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Discover powerful analytics and insights across all areas of your banking operations
              </p>
            </div>

            {/* Main Slideshow Container */}
            <div className="relative">
              {/* Slideshow Controls and Main Slide */}
              <div className="flex justify-center items-center gap-8 mb-8">
                {/* Previous Button */}
                <button 
                  onClick={prevSlide} 
                  onMouseEnter={() => setIsAutoPlay(false)}
                  onMouseLeave={() => setIsAutoPlay(true)}
                  className="group bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-full shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft size={32} className="text-white group-hover:text-purple-300 transition-colors" />
                </button>

                {/* Main Slide Container */}
                <div className="relative w-full max-w-5xl">
                  {/* Slide Image with Enhanced Styling */}
                  <div 
                    className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 cursor-pointer group slide-in"
                    onClick={() => router.push(currentSlide.path)}
                  >
                    {/* Background Image */}
                    <Image
                      src={currentSlide.src}
                      alt={currentSlide.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent`}></div>
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                      <div className="text-white space-y-4 fade-in">
                        {/* Icon and Stats */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${currentSlide.gradient} shadow-lg float`}>
                              <IconComponent className="w-8 h-8 text-white" />
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                              <span className="text-sm font-medium text-white">{currentSlide.stats}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Title and Description */}
                        <div className="space-y-2">
                          <h3 className="text-3xl font-bold">{currentSlide.title}</h3>
                          <p className="text-lg text-white/90 max-w-2xl">{currentSlide.description}</p>
                        </div>
                        
                        {/* Action Button */}
                        <button className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${currentSlide.gradient} rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg pulse-glow`}>
                          <Play className="w-5 h-5" />
                          Explore {currentSlide.alt}
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>

                {/* Next Button */}
                <button 
                  onClick={nextSlide}
                  onMouseEnter={() => setIsAutoPlay(false)}
                  onMouseLeave={() => setIsAutoPlay(true)}
                  className="group bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-full shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight size={32} className="text-white group-hover:text-purple-300 transition-colors" />
                </button>
              </div>

              {/* Enhanced Slide Indicators */}
              <div className="flex justify-center items-center gap-4 mb-8">
                {slideshowItems.map((item, index) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
                        index === slideIndex 
                          ? 'bg-white/20 backdrop-blur-sm border border-white/30 scale-110' 
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} ${index === slideIndex ? 'animate-pulse' : ''}`}>
                        <ItemIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-xs font-medium transition-colors ${
                        index === slideIndex ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                      }`}>
                        {item.alt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Auto-play Control */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                    isAutoPlay 
                      ? 'bg-green-600/20 border-green-500/30 text-green-300' 
                      : 'bg-white/10 border-white/20 text-white/70 hover:text-white'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isAutoPlay ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">
                    {isAutoPlay ? 'Auto-play ON' : 'Auto-play OFF'}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {[
                { icon: TrendingUp, title: "Performance Trends", desc: "View latest analytics", color: "from-green-600 to-emerald-600" },
                { icon: Users, title: "Team Overview", desc: "Monitor your team", color: "from-blue-600 to-cyan-600" },
                { icon: Shield, title: "Security Status", desc: "System protection", color: "from-red-600 to-pink-600" }
              ].map((card, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer group fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                  <p className="text-white/70 text-sm">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}