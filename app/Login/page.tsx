"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    console.log("📤 Attempting login with:", { email, password });

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("📥 Parsed response data:", data);

      if (!response.ok) {
        console.error("❌ Login failed:", data);
        throw new Error(data?.error?.message || data.message || "Login failed");
      }

      console.log("✅ Login success. Navigating to welcome...");
      
      setTimeout(() => {
        router.push("/Welcome");
      }, 1000);
    } catch (err) {
      console.error("❌ Login error caught in catch:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError("Login Failed: " + errorMessage);
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
          
          {/* Animated Particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Main Container */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <div className="flex flex-col lg:flex-row bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              
              {/* Left Section - Login Form */}
              <div className="flex-1 p-8 lg:p-12 relative">
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl opacity-30"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-2xl opacity-30"></div>
                
                <div className="relative z-10">
                  {/* Logo Section */}
                  <div className="text-center mb-8">
                    <div className="inline-block relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                      <div className="relative ">
                        <Image src="/flags/3bs.png" alt="3bs Logo" width={200} height={250} className="mx-auto" />
                      </div>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mt-6 mb-2">
                      Welcome Back
                    </h1>
                    <p className="text-white/70 text-lg">
                      Sign in to your 3Bs Performance Dashboard
                    </p>
                  </div>

                  {/* Login Form */}
                  <form className="space-y-6" onSubmit={handleLogin}>
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${focusedField === 'email' ? 'opacity-30' : ''}`}></div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField('')}
                            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-white/90 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </label>
                      <div className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${focusedField === 'password' ? 'opacity-30' : ''}`}></div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField('')}
                            className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full relative group cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform group-hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing In...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 text-red-200 text-sm animate-shake">
                        {error}
                      </div>
                    )}
                  </form>

                  {/* Footer Links */}
                  <div className="mt-8 text-center">
                    <button 
                      type="button"
                      className="text-white/70 hover:text-white text-sm font-medium hover:underline transition-colors"
                    >
                      {/* Can't log in? Get help */}
                    </button>
                  </div>

                  {/* Security Warning */}
                  <div className="mt-8 p-4 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-yellow-200 text-xs font-medium">Security Notice</p>
                        <p className="text-yellow-300/80 text-xs mt-1">
                          For authorized use only. Accessing this system constitutes consent to monitoring.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Visual */}
              <div className="flex-1 relative min-h-[500px] lg:min-h-[700px] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                {/* Video Background */}
                <div className="absolute inset-0 overflow-hidden rounded-r-3xl">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-60"
                  >
                    <source src="/flags/moving.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50"></div>
                </div>

                {/* Overlay Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                  {/* Animated Logo */}
                  <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>

                  {/* Main Text */}
                  <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                    Welcome to{" "}
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      3Bs'
                    </span>
                  </h2>
                  
                  <p className="text-xl lg:text-2xl text-white/80 mb-8">
                    Performance Dashboard
                  </p>

                  {/* Feature Highlights */}
                  <div className="space-y-4 max-w-md">
                    {[
                      "Real-time Analytics",
                      "Advanced Reporting", 
                      "Secure Access Control",
                      "Performance Insights"
                    ].map((feature, index) => (
                      <div 
                        key={feature}
                        className="flex items-center gap-3 text-white/90 animate-fade-in"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Floating Stats */}
                  <div className="mt-12 grid grid-cols-2 gap-6 max-w-sm">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                      <div className="text-2xl font-bold text-white">99.9%</div>
                      <div className="text-xs text-white/70">Uptime</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-xs text-white/70">Support</div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}