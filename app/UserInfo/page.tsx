"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  ArrowLeft,
  User,
  Mail,
  Shield,
  Building,
  MapPin,
  Calendar,
  Phone,
  Download,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Settings,
  Star,
  Activity,
  Sparkles
} from "lucide-react";
import TopBarSearch from "@/components/ui/TopBarSearch";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  bank?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function UserInfo() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [language, setLanguage] = useState("English (US)");
  const [flag, setFlag] = useState("/flags/us.png");
  const [notifications, setNotifications] = useState<string[]>([
    "Hania Requested Access",
    "Alex Branch performance updated!"
  ]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  
  // UI state
  const [showUserId, setShowUserId] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  // Add state for password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStep, setPasswordStep] = useState<'verify' | 'set'>("verify");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const changeLanguage = (lang: string) => {
    if (lang.includes("Eng")) {
      setLanguage("English (US)");
      setFlag("/flags/us.png");
    } else {
      setLanguage("Arabic");
      setFlag("/flags/eg.png");
    }
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Shield className="w-5 h-5 text-yellow-400" />;
      case 'manager':
        return <Star className="w-5 h-5 text-blue-400" />;
      case 'employee':
        return <User className="w-5 h-5 text-green-400" />;
      default:
        return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
      case 'manager':
        return 'from-blue-500/20 to-indigo-500/20 border-blue-400/30';
      case 'employee':
        return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-400/30';
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Loading user profile...");

        const response = await fetch("http://localhost:5000/api/user", {
          credentials: "include",
        });
        
        setLoadingMessage("Processing user data...");
        
        const data = await response.json();
        const user = data?.data?.user;
        
        if (user) {
          setUserData(user);
          const [first, ...rest] = (user.fullName || "").split(" ");
          setFirstName(first);
          setLastName(rest.join(" "));
          setRole(user.role || "User");
        }

        setLoadingMessage("Finalizing profile...");

        setTimeout(() => {
          setLoading(false);
        }, 500);

      } catch (err) {
        console.error("❌ Failed to fetch user data:", err);
        setLoadingMessage("Error loading user profile");
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchUserData();
  }, []);

  // Enhanced Loading Screen Component
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 text-center">
          {/* Animated Logo */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-purple-300/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-4 rounded-full bg-purple-500/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-12 h-12 text-purple-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Loading User Profile
            </h2>
            <p className="text-white/70 text-lg animate-pulse">
              {loadingMessage}
            </p>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="w-96 mx-auto mb-6">
            <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-3 border border-white/20">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-3 rounded-full animate-pulse shadow-lg"></div>
            </div>
          </div>

          {/* Loading Steps */}
          <div className="flex justify-center space-x-3 mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className="w-4 h-4 rounded-full animate-bounce bg-gradient-to-r from-purple-400 to-pink-400"
                  style={{
                    animationDelay: `${step * 0.2}s`,
                    animationDuration: '1s'
                  }}
                ></div>
                <div className="w-1 h-8 bg-gradient-to-b from-purple-400/50 to-transparent mt-2"></div>
              </div>
            ))}
          </div>

          {/* Sub Text */}
          <p className="text-sm text-white/60 max-w-lg mx-auto leading-relaxed">
            Retrieving your account information, permissions, and profile details from secure servers.
            Setting up personalized dashboard experience.
          </p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <p className="text-white/70 mb-8">Unable to load user information</p>
          <Button onClick={() => router.back()} className="bg-purple-600 hover:bg-purple-700 cursor-pointer">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-yellow-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Enhanced Top Bar */}
        <div className="flex justify-between items-center bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl mb-6">
          {/* Back Button and Title */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">User Profile</h1>
              <p className="text-sm text-white/70">Personal account information</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer text-white hover:text-white/80 transition-colors bg-white/5 px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10">
                <Image src={flag} alt="flag" width={24} height={24} className="rounded-full" />
                <span className="font-medium text-sm">{language}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-lg p-2">
                <DropdownMenuItem onClick={() => changeLanguage("Eng (US)")} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/10 rounded px-3 py-2">
                  <Image src="/flags/us.png" alt="English" width={20} height={20} className="rounded-full" />
                  Eng (US)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("Arabic")} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/10 rounded px-3 py-2">
                  <Image src="/flags/eg.png" alt="Arabic" width={20} height={20} className="rounded-full" />
                  Arabic
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative cursor-pointer p-2 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-colors">
                <Bell className="text-white" size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-lg p-2 w-80">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <DropdownMenuItem key={index} className="p-3 text-white hover:bg-white/10 rounded mb-1 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <span className="text-sm">{notif}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem className="p-3 text-white/70 text-center">
                    No new notifications
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Profile Section */}
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/20">
              <Avatar className="w-8 h-8 border-2 border-white/30">
                <AvatarImage src="/flags/logo.png" />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-bold text-white">{role}</p>
                <p className="text-xs text-white/70">{firstName} {lastName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header with Profile Picture */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <Avatar className="relative w-32 h-32 border-4 border-white/20">
                <AvatarImage src="/flags/logo.png" />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-4xl font-bold">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-2 -right-2 p-2 rounded-full bg-gradient-to-r ${getRoleColor(role)} border backdrop-blur-sm`}>
                {getRoleIcon(role)}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              {userData.fullName}
            </h1>
            <p className="text-xl text-white/80 mb-2">{userData.role}</p>
            <p className="text-white/60">{userData.email}</p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
          </div>

          {/* User Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Personal Information Card */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="w-7 h-7 text-blue-400" />
                    Personal Information
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {/* Full Name */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Full Name</p>
                        <p className="text-lg font-semibold text-white">{userData.fullName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Email Address</p>
                        <p className="text-lg font-semibold text-white">{userData.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCopy('email', userData.email)}
                      className="bg-white/10 hover:bg-white/20 p-2 cursor-pointer"
                    >
                      {copiedField === 'email' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white" />
                      )}
                    </Button>
                  </div>

                  {/* Role */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(userData.role)}
                      <div>
                        <p className="text-sm text-white/60">Role</p>
                        <p className="text-lg font-semibold text-white">{userData.role}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRoleColor(userData.role)} text-sm font-medium text-white`}>
                      {userData.role}
                    </div>
                  </div>

                  {/* User ID */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">User ID</p>
                        <p className="text-lg font-semibold text-white font-mono">
                          {showUserId ? userData.id : '••••••••-••••-••••-••••-••••••••••••'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowUserId(!showUserId)}
                        className="bg-white/10 hover:bg-white/20 p-2 cursor-pointer"
                      >
                        {showUserId ? (
                          <EyeOff className="w-4 h-4 text-white" />
                        ) : (
                          <Eye className="w-4 h-4 text-white" />
                        )}
                      </Button>
                      <Button
                        onClick={() => handleCopy('userId', userData.id)}
                        className="bg-white/10 hover:bg-white/20 p-2 cursor-pointer"
                      >
                        {copiedField === 'userId' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization Information Card */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Building className="w-7 h-7 text-green-400" />
                  Organization
                </h2>
                
                <div className="space-y-6">
                  {/* Bank */}
                  {userData.bank && (
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-white/60" />
                        <div>
                          <p className="text-sm text-white/60">Bank</p>
                          <p className="text-lg font-semibold text-white">{userData.bank.name}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCopy('bankId', userData.bank!.id)}
                        className="bg-white/10 hover:bg-white/20 p-2 cursor-pointer"
                      >
                        {copiedField === 'bankId' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Branch */}
                  {userData.branch && (
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-white/60" />
                        <div>
                          <p className="text-sm text-white/60">Branch</p>
                          <p className="text-lg font-semibold text-white">{userData.branch.name}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCopy('branchId', userData.branch!.id)}
                        className="bg-white/10 hover:bg-white/20 p-2 cursor-pointer"
                      >
                        {copiedField === 'branchId' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Account Dates */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Account Created</p>
                        <p className="text-lg font-semibold text-white">{formatDate(userData.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-white/60" />
                      <div>
                        <p className="text-sm text-white/60">Last Updated</p>
                        <p className="text-lg font-semibold text-white">{formatDate(userData.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Change Password Card */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Shield className="w-7 h-7 text-purple-400" />
                  Change Password
                </h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPasswordError("");
                    setPasswordSuccess("");
                    if (passwordStep === "verify") {
                      setIsVerifying(true);
                      try {
                        const res = await fetch("http://localhost:5000/api/user/verify-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ password: oldPassword })
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                          setPasswordError(data.message || "Old password is incorrect");
                        } else {
                          setPasswordStep("set");
                          setPasswordSuccess("");
                        }
                      } catch (err) {
                        setPasswordError("Failed to verify password. Try again.");
                      } finally {
                        setIsVerifying(false);
                      }
                    } else if (passwordStep === "set") {
                      if (!newPassword || !confirmPassword) {
                        setPasswordError("Please fill in all fields.");
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        setPasswordError("Passwords do not match.");
                        return;
                      }
                      setIsSaving(true);
                      try {
                        const res = await fetch("http://localhost:5000/api/user/change-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ oldPassword, newPassword })
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                          setPasswordError(data.message || "Failed to change password");
                        } else {
                          setPasswordSuccess("Password changed successfully!");
                          setOldPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordStep("verify");
                        }
                      } catch (err) {
                        setPasswordError("Failed to change password. Try again.");
                      } finally {
                        setIsSaving(false);
                      }
                    }
                  }}
                  className="space-y-6"
                >
                  {passwordStep === "verify" && (
                    <div className="space-y-4">
                      <label className="block text-white/80 font-medium">Old Password</label>
                      <Input
                        type="password"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        className="bg-white/5 border border-white/20 text-white"
                        required
                      />
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white py-4 px-8 rounded-xl font-bold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg w-full mt-2"
                        disabled={isVerifying}
                      >
                        {isVerifying ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  )}
                  {passwordStep === "set" && (
                    <div className="space-y-4">
                      <label className="block text-white/80 font-medium">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="bg-white/5 border border-white/20 text-white"
                        required
                      />
                      <label className="block text-white/80 font-medium">Confirm New Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="bg-white/5 border border-white/20 text-white"
                        required
                      />
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700 w-full mt-2" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                  {passwordError && <div className="text-red-400 font-medium mt-2">{passwordError}</div>}
                  {passwordSuccess && <div className="text-green-400 font-medium mt-2">{passwordSuccess}</div>}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Account Summary Card */}
          <Card className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 backdrop-blur-xl mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-indigo-500/30 rounded-xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-indigo-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-4">Account Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-300 mb-1">
                        {Math.floor((new Date().getTime() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-sm text-indigo-200">Days Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-300 mb-1">
                        {userData.role}
                      </div>
                      <div className="text-sm text-purple-200">Access Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-pink-300 mb-1">
                        Active
                      </div>
                      <div className="text-sm text-pink-200">Account Status</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Button
              onClick={() => {
                const data = {
                  ...userData,
                  exportedAt: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `user-profile-${userData.fullName.replace(/\s+/g, '-').toLowerCase()}.json`;
                a.click();
              }}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-white h-16 flex flex-col gap-2 cursor-pointer"
            >
              <Download className="w-6 h-6" />
              <span className="font-medium">Export Profile</span>
            </Button>

            <Button
              onClick={() => router.push('/settings')}
              className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 text-white h-16 flex flex-col gap-2 cursor-pointer"
            >
              <Settings className="w-6 h-6" />
              <span className="font-medium">Account Settings</span>
            </Button>

            <Button
              onClick={() => router.push('/GiveAccess')}
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-white h-16 flex flex-col gap-2 cursor-pointer"
            >
              <Shield className="w-6 h-6" />
              <span className="font-medium">Manage Access</span>
            </Button>
          </div>

          {/* Security & Privacy Section */}
          <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-red-500/30 rounded-xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-red-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-4">Security & Privacy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Security Status */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold text-red-200 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Account Security
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-sm">Password Protection</span>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-sm">Account Verified</span>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-sm">Email Confirmed</span>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-200 mb-3 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Privacy Settings
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-sm">Profile Visibility</span>
                          <span className="text-orange-300 text-sm">Internal Only</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-sm">Data Sharing</span>
                          <span className="text-orange-300 text-sm">Restricted</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-sm">Activity Tracking</span>
                          <span className="text-orange-300 text-sm">Enabled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}