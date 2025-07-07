"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Bell, Mail, Search, ChevronDown, Phone, User, Lock, Eye, EyeOff, Camera, Shield, CheckCircle, Upload, FileImage } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TopBarSearch from "@/components/ui/TopBarSearch";
import { fetchAPI } from "@/utils/fetchAPI";

const searchOptions = [
  { label: "Bank Performance", path: "/BankPerformance" },
  { label: "Branch Performance", path: "/BranchPerformance" },
  { label: "Employee Performance", path: "/EmployeePerformance" },
  { label: "Settings", path: "/settings" },
  { label: "View All Employees", path: "/ViewAll" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [language, setLanguage] = useState("English (US)");
  const [profileImage, setProfileImage] = useState("/user-avatar.png");
  const [notifications, setNotifications] = useState(["Hania Requested Access ", "Alex Branch peformance as been updated!"]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [flag, setFlag] = useState("/flags/us.png");
  const [bankName, setBankName] = useState("Loading...");
  const [currentEmail, setCurrentEmail] = useState(""); // Email from database

  // Enhanced form states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [profileData, setProfileData] = useState({
    newEmail: "",
    oldPhone: "",
    newPhone: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Password validation states
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Check password requirements
  const checkPasswordRequirements = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const changeLanguage = (lang: string) => {
    if (lang === "Eng (US)") {
      setLanguage("Eng (US)");
      setFlag("/flags/us.png");
    } else {
      setLanguage("Arabic");
      setFlag("/flags/eg.png");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file upload logic here
  };

  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Check password requirements when new password changes
    if (field === 'newPassword') {
      checkPasswordRequirements(value);
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/user", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data?.data?.user;
        console.log("✅ User from session:", user);

        if (user?.fullName) {
          const [first, ...rest] = user.fullName.split(" ");
          setFirstName(first);
          setLastName(rest.join(" "));
        }

        if (user?.role) {
          setRole(user.role);
        }

        // Set current email from database
        if (user?.email) {
          setCurrentEmail(user.email);
        }
      })
      .catch((err) => console.error("❌ Failed to fetch user from session", err));
  }, []);

  useEffect(() => {
    fetchAPI("bank")
      .then(res => {
        const bank = res.data?.banks?.[0]?.name || "Unnamed Bank";
        console.log("🏦 Bank name:", bank);
        setBankName(bank);
      })
      .catch(err => {
        console.error("❌ Failed to fetch bank name:", err);
        setBankName("Error loading bank");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 text-white p-3 h-screen flex flex-col justify-between">
          <div>
            <div className="flex-col flex items-center mb-4">
              <Image src="/flags/3bs.png" alt="3B's Logo" width={100} height={100} className="space-y-1 mb-2 mt-8" />
              <p className="leading-none text-xl text-sm font-semibold text-center text-white">
                {bankName}
              </p>
              <p className="mt-0 text-sm font-semibold text-center text-white/70 mb-5">
                Dashboard
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                className="text-left hover:bg-white/10 p-2 rounded-md cursor-pointer transition-all duration-200 text-white/90 hover:text-white"
                onClick={() => router.push("/BankPerformance")}
              >
                🏦 Bank Performance
              </button>
              <button
                className="text-left hover:bg-white/10 p-2 rounded-md cursor-pointer transition-all duration-200 text-white/90 hover:text-white"
                onClick={() => router.push("/BranchPerformance")}
              >
                🏢 Branch Performance
              </button>
              <button
                className="text-left hover:bg-white/10 p-2 rounded-md cursor-pointer transition-all duration-200 text-white/90 hover:text-white"
                onClick={() => router.push("/EmployeePerformance")}
              >
                👨‍💼 Employee Performance
              </button>
              <button
                className="text-left hover:bg-white/10 p-2 rounded-md cursor-pointer transition-all duration-200 text-white/90 hover:text-white"
                onClick={() => router.push("/GiveAccess")}
              >
                🔓 Give Access
              </button>
              <button
                className="text-left bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-md cursor-pointer shadow-lg"
                onClick={() => router.push("/settings")}
              >
                ⚙️ Settings
              </button>
            </div>
            <button
              onClick={async () => {
                try {
                  await fetch("http://localhost:5000/api/auth/logout", {
                    method: "POST",
                    credentials: "include",
                  });
                  router.push("/Login");
                } catch (err) {
                  console.error("Logout failed:", err);
                }
              }}
              className="mt-4 w-full text-left p-2 text-red-400 hover:bg-red-500/20 rounded-md cursor-pointer transition-all duration-200"
            >
              🔓 Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 p-6">
          {/* Top Bar */}
          <div className="flex justify-between items-center bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-lg shadow-xl mb-4">
            <div className="relative w-72">
              <TopBarSearch />
            </div>
            <div className="flex items-center gap-6">
              {/* Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer text-white hover:text-white/80 transition-colors">
                  <Image src={flag} alt="flag" width={30} height={30} className="rounded-full" />
                  <span className="font-medium">{language}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-md p-2">
                  <DropdownMenuItem onClick={() => changeLanguage("Eng (US)")} className="flex items-center gap-2 text-white hover:bg-white/10 rounded">
                    <Image src="/flags/us.png" alt="English" width={30} height={30} className="rounded-full" />
                    Eng (US)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("Arabic")} className="flex items-center gap-2 text-white hover:bg-white/10 rounded">
                    <Image src="/flags/eg.png" alt="Arabic" width={30} height={30} className="rounded-full" />
                    Arabic
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notification Bell */}
              <DropdownMenu>
                <DropdownMenuTrigger className="relative cursor-pointer text-white hover:text-white/80 transition-colors">
                  <Bell size={24} />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-md p-2">
                  {notifications.length > 0 ? (
                    notifications.map((notif, index) => (
                      <DropdownMenuItem key={index} className="p-2 text-white hover:bg-white/10 rounded">
                        {notif}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem className="p-2 text-white/70">
                      No new notifications
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Avatar & Role */}
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 border border-white/30">
                  <AvatarImage src="/flags/logo.png" />
                  <AvatarFallback className="bg-white/20 text-white">CEO</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{role}</p>
                  <p className="text-xs text-white/70">{firstName} {lastName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {/* Enhanced Tabs */}
            <Tabs defaultValue="Edit" className="">
              <TabsList className="flex space-x-1 p-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl mb-8">
                <TabsTrigger 
                  value="Edit" 
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:shadow-lg data-[state=active]:text-white cursor-pointer text-white/70 hover:text-white"
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="password" 
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:shadow-lg data-[state=active]:text-white cursor-pointer text-white/70 hover:text-white"
                >
                  <Lock className="w-4 h-4" />
                  Password
                </TabsTrigger>
              </TabsList>

              {/* Enhanced Edit Profile Tab */}
              <TabsContent value="Edit" className="space-y-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-blue-400/30">
                      <User className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
                    <p className="text-white/70">Update your profile details and preferences</p>
                  </div>

                  {/* Name Fields - Read Only */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        First Name
                      </Label>
                      <div className="relative group">
                        <Input
                          value={firstName}
                          readOnly
                          className="px-4 py-3 border-2 border-white/20 rounded-lg bg-white/5 text-white/60 cursor-not-allowed backdrop-blur-sm"
                          placeholder="Enter your first name"
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          <div className="relative">
                            🚫 Name changes are prohibited for security reasons
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-600"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Last Name
                      </Label>
                      <div className="relative group">
                        <Input
                          value={lastName}
                          readOnly
                          className="px-4 py-3 border-2 border-white/20 rounded-lg bg-white/5 text-white/60 cursor-not-allowed backdrop-blur-sm"
                          placeholder="Enter your last name"
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          <div className="relative">
                            🚫 Name changes are prohibited for security reasons
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-600"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-400" />
                      Update Email Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative space-y-2">
                        <Label className="text-sm font-medium text-white/90">Current Email</Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                          <Input
                            type="email"
                            value={currentEmail}
                            readOnly
                            placeholder="Loading current email..."
                            className="pl-10 pr-4 py-3 border-2 border-white/20 rounded-lg bg-white/5 text-white/60 cursor-not-allowed backdrop-blur-sm"
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            <div className="relative">
                              🚫 Current email cannot be modified for security
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-600"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative space-y-2">
                        <Label className="text-sm font-medium text-white/90">New Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                          <Input
                            type="email"
                            value={profileData.newEmail}
                            onChange={(e) => handleInputChange('newEmail', e.target.value)}
                            placeholder="Enter new email address"
                            className="pl-10 pr-4 py-3 border-2 border-white/20 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-green-400" />
                      Update Phone Number
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative space-y-2">
                        <Label className="text-sm font-medium text-white/90">Current Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                          <Input
                            type="tel"
                            value={profileData.oldPhone}
                            onChange={(e) => handleInputChange('oldPhone', e.target.value)}
                            placeholder="Enter current phone"
                            className="pl-10 pr-4 py-3 border-2 border-white/20 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/50"
                          />
                        </div>
                      </div>
                      <div className="relative space-y-2">
                        <Label className="text-sm font-medium text-white/90">New Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                          <Input
                            type="tel"
                            value={profileData.newPhone}
                            onChange={(e) => handleInputChange('newPhone', e.target.value)}
                            placeholder="Enter new phone"
                            className="pl-10 pr-4 py-3 border-2 border-white/20 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Upload Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-purple-400" />
                      Profile Picture
                    </h3>
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer group backdrop-blur-sm ${
                        dragActive 
                          ? 'border-purple-400 bg-purple-500/20' 
                          : 'border-white/30 hover:border-purple-400 hover:bg-white/5'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-colors border border-purple-400/30">
                          <Upload className="w-8 h-8 text-purple-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">Upload Profile Picture</h4>
                        <p className="text-white/70 mb-2">Drag and drop your image here, or click to browse</p>
                        <p className="text-sm text-white/50">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        accept="image/*"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-center pt-6">
                    <Button className="px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer">
                      <CheckCircle className="w-5 h-5" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Enhanced Password Tab */}
              <TabsContent value="password" className="space-y-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-red-400/30">
                      <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Security Settings</h2>
                    <p className="text-white/70">Update your password to keep your account secure</p>
                  </div>

                  {/* Old Password */}
                  <div className="mb-8">
                    <Label className="text-sm font-semibold text-white/90 flex items-center gap-2 mb-3">
                      <Lock className="w-4 h-4" />
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        value={profileData.oldPassword}
                        onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                        placeholder="Enter your current password"
                        className="pl-10 pr-12 py-3 border-2 border-white/20 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={profileData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          placeholder="Enter new password"
                          className="pl-10 pr-12 py-3 border-2 border-white/20 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-green-400 transition-colors cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={profileData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirm new password"
                          className="pl-10 pr-12 py-3 border-2 border-white/20 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-white/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-green-400 transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Password Requirements */}
                  {profileData.newPassword && (
                    <div className="mb-8 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">Password Requirements:</h4>
                      <ul className="text-sm space-y-1">
                        {!passwordRequirements.length && (
                          <li className="flex items-center text-red-400">
                            <span className="mr-2">✗</span>
                            At least 8 characters long
                          </li>
                        )}
                        {!passwordRequirements.uppercase && (
                          <li className="flex items-center text-red-400">
                            <span className="mr-2">✗</span>
                            Contains uppercase letters (A-Z)
                          </li>
                        )}
                        {!passwordRequirements.lowercase && (
                          <li className="flex items-center text-red-400">
                            <span className="mr-2">✗</span>
                            Contains lowercase letters (a-z)
                          </li>
                        )}
                        {!passwordRequirements.number && (
                          <li className="flex items-center text-red-400">
                            <span className="mr-2">✗</span>
                            Includes at least one number (0-9)
                          </li>
                        )}
                        {!passwordRequirements.special && (
                          <li className="flex items-center text-red-400">
                            <span className="mr-2">✗</span>
                            Contains at least one special character (!@#$%^&*)
                          </li>
                        )}
                        {Object.values(passwordRequirements).every(req => req) && (
                          <li className="flex items-center text-green-400 font-medium">
                            <span className="mr-2">✓</span>
                            All requirements met! Password is strong.
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Update Password Button */}
                  <div className="flex justify-center pt-6">
                    <Button className="px-8 py-3 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-700 hover:via-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer">
                      <Shield className="w-5 h-5" />
                      Update Password
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}