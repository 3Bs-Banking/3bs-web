"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Clock, Bell, Search, User, Lock, Shield, Eye, EyeOff, 
  CheckCircle, AlertTriangle, Info, Calendar, Timer, 
  UserCheck, Sparkles
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TopBarSearch from "@/components/ui/TopBarSearch";
import { fetchAPI } from "@/utils/fetchAPI";

// Real API functions for temporary access
const temporaryAccessAPI = {
  checkEmployee: async (employeeId: string) => {
    const response = await fetch(`http://localhost:5000/api/user/employee/${employeeId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check employee');
    }
    
    return response.json();
  },

  grantTemporaryAccess: async (data: any) => {
    const response = await fetch('http://localhost:5000/api/temporary-access/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to grant temporary access');
    }
    
    return response.json();
  }
};

// Update the checkEmployeeExists function to use the access-management API and EmployeeInfo structure from GiveAccess
const accessAPI = {
  checkEmployee: async (employeeId: string) => {
    const response = await fetch(`http://localhost:5000/api/access-management/check/${employeeId}`, {
      credentials: 'include'
    });
    return response.json();
  }
};

// Update EmployeeInfo interface to match GiveAccess
interface EmployeeInfo {
  id: string;
  fullName: string;
  email: string;
  role: string;
  bankId: string;
  bankName: string;
  branchId: string;
  branchName: string;
}

export default function TemporaryAccessPage() {
  const router = useRouter();

  // User state
const [firstName, setFirstName] = useState<string>("");
const [lastName, setLastName] = useState<string>("");
const [role, setRole] = useState<string>("");
  const [language, setLanguage] = useState<string>("English (US)");
  const [notifications, setNotifications] = useState<string[]>(["Temporary access request pending", "New security alert"]);
  const [flag, setFlag] = useState<string>("/flags/us.png");
  const [bankName, setBankName] = useState<string>("Loading...");

  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Initializing...");
  const [checkingEmployee, setCheckingEmployee] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form states
  const [employeeId, setEmployeeId] = useState<string>("");
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [expirationTime, setExpirationTime] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Feedback states
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Add state for password verification
  const [passwordVerified, setPasswordVerified] = useState<boolean>(false);
  const [verifyingPassword, setVerifyingPassword] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle");
  const [verificationMessage, setVerificationMessage] = useState<string>("");

  const changeLanguage = (lang: string) => {
    if (lang === "Eng (US)") {
      setLanguage("Eng (US)");
      setFlag("/flags/us.png");
    } else {
      setLanguage("Arabic");
      setFlag("/flags/eg.png");
    }
  };

  // Replace the checkEmployeeExists function
  const checkEmployeeExists = async (empId: string) => {
    if (!empId || empId.length < 3) {
      setEmployeeInfo(null);
      return;
    }
    setCheckingEmployee(true);
    setError("");
    try {
      const result = await accessAPI.checkEmployee(empId);
      if (result.success && result.data.exists) {
        const user = result.data.user;
        if (user.role !== "Employee") {
          setEmployeeInfo(null);
          setError(`Please write the ID of an employee, not a ${user.role}.`);
        } else {
          setEmployeeInfo(user);
        setError("");
        }
      } else {
        setEmployeeInfo(null);
        setError("Employee ID not found in the system");
      }
    } catch (err) {
      setEmployeeInfo(null);
      setError('Failed to check employee. Please try again.');
    } finally {
      setCheckingEmployee(false);
    }
  };

  // Form submission with real API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeInfo) {
      setError("Please enter a valid Employee ID");
      return;
    }

    if (!expirationDate || !expirationTime) {
      setError("Please set expiration date and time");
      return;
    }

    if (!adminPassword) {
      setError("Please enter your password for authorization");
      return;
    }

    // Validate expiration is in the future
    const expirationDateTime = new Date(`${expirationDate}T${expirationTime}`);
    if (expirationDateTime <= new Date()) {
      setError("Expiration date and time must be in the future");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const submitData = {
  userId: employeeInfo.id,
  newRole: role,
        expiresAt: expirationDateTime.toISOString(),
  password: adminPassword
      };

      const result = await temporaryAccessAPI.grantTemporaryAccess(submitData);
      
      if (result.success) {
        setSuccess(`Temporary access granted successfully! The employee ${employeeInfo.fullName} now has ${role} access until ${expirationDateTime.toLocaleString()}.`);
        setTimeout(() => {
          resetForm();
        }, 5000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to grant temporary access. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmployeeId("");
    setEmployeeInfo(null);
    setExpirationDate("");
    setExpirationTime("");
    setAdminPassword("");
    setShowPassword(false);
    setError("");
    setSuccess("");
    setPasswordVerified(false);
    setVerificationStatus("idle");
    setVerificationMessage("");
  };

  // Add password verification API call
  const verifyPassword = async () => {
    setVerifyingPassword(true);
    setVerificationStatus("idle");
    setVerificationMessage("");
    try {
      const response = await fetch("http://localhost:5000/api/user/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: adminPassword })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setPasswordVerified(true);
        setVerificationStatus("success");
        setVerificationMessage("Password verified successfully!");
      } else {
        setPasswordVerified(false);
        setVerificationStatus("error");
        setVerificationMessage(result.message || "Incorrect password");
      }
    } catch (err) {
      setPasswordVerified(false);
      setVerificationStatus("error");
      setVerificationMessage("Failed to verify password. Please try again.");
    } finally {
      setVerifyingPassword(false);
    }
  };

  // Replace the initialization useEffect with this updated version

useEffect(() => {
  const initializeApp = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Loading user profile...");
      
      const response = await fetch("http://localhost:5000/api/user", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      setLoadingMessage("Processing user data...");
      
      const data = await response.json();
      const user = data?.data?.user;

      if (user) {
        // Set first name and last name from database
        if (user.firstName && user.lastName) {
          setFirstName(user.firstName);
          setLastName(user.lastName);
        } else if (user.fullName) {
          // Fallback: split fullName if firstName/lastName not available
          const [first, ...rest] = user.fullName.split(" ");
          setFirstName(first);
          setLastName(rest.join(" "));
        }

        // Set role from database
        if (user.role) {
          setRole(user.role);
        }
      }

      setLoadingMessage("Loading bank information...");

      const bankRes = await fetchAPI("bank");
      const bank = bankRes.data?.banks?.[0]?.name || "Unnamed Bank";
      setBankName(bank);

      setLoadingMessage("Finalizing setup...");

      setTimeout(() => {
        setLoading(false);
      }, 500);

    } catch (err) {
      console.error("Failed to fetch user from session", err);
      setLoadingMessage("Error loading application");
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  initializeApp();
}, []);



  // Auto-check employee when ID changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkEmployeeExists(employeeId);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [employeeId]);

  // Generate minimum date (current date)
  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Generate minimum time for today
  const getMinTime = () => {
    const now = new Date();
    if (expirationDate === getMinDate()) {
      const currentTime = new Date(now.getTime() + 5 * 60000);
      return currentTime.toTimeString().slice(0, 5);
    }
    return "00:00";
  };

  // Enhanced Loading Screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-purple-300/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-4 rounded-full bg-purple-500/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="w-12 h-12 text-purple-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Loading Temporary Access Portal
            </h2>
            <p className="text-white/70 text-lg animate-pulse">
              {loadingMessage}
            </p>
          </div>

          <div className="w-96 mx-auto mb-6">
            <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-3 border border-white/20">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-3 rounded-full animate-pulse shadow-lg"></div>
            </div>
          </div>

          <p className="text-sm text-white/60 max-w-lg mx-auto leading-relaxed">
            Configuring temporary access management system with advanced security protocols 
            and time-based permission controls.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 text-white p-3 min-h-screen flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex-col flex items-center mb-6">
              <div className="relative mb-4 mt-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Image 
                    src="/flags/3bs.png" 
                    alt="3B's Logo" 
                    width={80} 
                    height={80} 
                    className="mx-auto cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => window.location.reload()}
                    title="Refresh Page"
                  />
                </div>
              </div>
              <p className="leading-none text-lg font-bold text-center text-white">
                {bankName}
              </p>
              <p className="mt-1 text-sm font-medium text-center text-white/70 mb-6">
                Temporary Access Portal
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              {role !== "Manager" && (
              <button 
                className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3"
                onClick={() => router.push("/BankPerformance")}
              >
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  🏦
                </div>
                <span className="font-medium">Bank Performance</span>
              </button>
              )}
              <button 
                className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3"
                onClick={() => router.push("/BranchPerformance")}
              >
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  🏢
                </div>
                <span className="font-medium">Branch Performance</span>
              </button>
              <button 
                className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3"
                onClick={() => router.push("/EmployeePerformance")}
              >
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                  👨‍💼
                </div>
                <span className="font-medium">Employee Performance</span>
              </button>
              {role !== "Manager" && (
              <button 
                className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3"
                onClick={() => router.push("/GiveAccess")}
              >
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  🔓
                </div>
                <span className="font-medium">Give Access</span>
              </button>
              )}
              <button 
                className="text-left bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                onClick={() => router.push("/TemporaryAccess")}
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  ⏰
                </div>
                <span className="font-bold">Temporary Access</span>
              </button>
              <button 
                className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3"
                onClick={() => router.push("/settings")}
              >
                <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center group-hover:bg-gray-500/30 transition-colors">
                  ⚙️
                </div>
                <span className="font-medium">Settings</span>
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
              className="mt-6 w-full text-left p-3 text-red-400 hover:bg-red-500/20 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                🔓
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 p-6">
          {/* Top Bar */}
          <div className="flex justify-between items-center bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl mb-6">
            <div className="relative w-72">
              <TopBarSearch />
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

              {/* Notification Bell */}
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

              {/* Profile Section */}
              <div
                className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => router.push("/UserInfo")}
              >
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
          <main className="flex-1 p-8">
            <form onSubmit={handleSubmit}>
              <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                      <Clock className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent">
                    Grant Temporary Access
                  </h1>
                  <p className="text-white/70 text-lg">Provide time-limited elevated permissions with enhanced security</p>
                  <div className="mt-4 h-1 w-32 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto"></div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-8 p-4 bg-red-500/20 border border-red-400/30 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                    <div className="w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-200">Error</p>
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-8 p-4 bg-green-500/20 border border-green-400/30 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                    <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-200">Success</p>
                      <p className="text-sm text-green-300">{success}</p>
                    </div>
                  </div>
                )}

                {/* Step 1: Employee Lookup */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <Label className="text-lg font-bold text-white flex items-center gap-3">
                      <User className="w-6 h-6 text-blue-400" />
                      Employee Lookup
                    </Label>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative group">
                      <Input
                        placeholder="Enter Employee ID or start typing name..."
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="pl-4 pr-12 py-4 border-2 border-white/20 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-lg"
                      />
                      {checkingEmployee && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-white/60">
                      💡 Enter a valid Employee ID from your system
                    </p>
                  </div>
                </div>

                {/* Employee Info Display */}
                {employeeInfo && (
                  <div className="mb-10 p-6 bg-blue-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-blue-200 mb-4">Employee Found - Ready for Temporary Access</p>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-white/70">Name:</p>
                              <p className="text-white font-semibold">{employeeInfo.fullName}</p>
                            </div>
                            <div>
                              <p className="text-white/70">Current Role:</p>
                              <p className="text-white font-semibold">{employeeInfo.role}</p>
                            </div>
                            <div>
                              <p className="text-white/70">Email:</p>
                              <p className="text-white font-semibold">{employeeInfo.email}</p>
                            </div>
                            <div>
                              <p className="text-white/70">Location:</p>
                              <p className="text-white font-semibold">{employeeInfo.bankName} | {employeeInfo.branchName}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Temporary Access Settings */}
                {employeeInfo && (
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <Label className="text-lg font-bold text-white flex items-center gap-3">
                        <Timer className="w-6 h-6 text-orange-400" />
                        Configure Temporary Access
                      </Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* New Role Display (read-only) */}
                      <div className="space-y-3">
                        <Label className="text-lg font-bold text-white flex items-center gap-2">
                          <Shield className="w-5 h-5 text-purple-400" />
                          Temporary Role *
                        </Label>
                        <div className="w-full px-4 py-4 border-2 border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white text-lg font-medium flex items-center gap-2">
                          {role === "Manager" && <>👨‍💼 Manager - Branch Operations</>}
                          {role === "Admin" && <>🔧 Admin - Full System Access</>}
                          {role !== "Manager" && role !== "Admin" && <>{role}</>}
                        </div>
                      </div>

                      {/* Expiration Date */}
                      <div className="space-y-3">
                        <Label className="text-lg font-bold text-white flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-green-400" />
                          Expiration Date *
                        </Label>
                        <Input
                          type="date"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          min={getMinDate()}
                          className="pl-4 pr-4 py-4 border-2 border-white/20 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white text-lg"
                          required
                        />
                      </div>

                      {/* Expiration Time */}
                      <div className="space-y-3">
                        <Label className="text-lg font-bold text-white flex items-center gap-2">
                          <Clock className="w-5 h-5 text-cyan-400" />
                          Expiration Time *
                        </Label>
                        <Input
                          type="time"
                          value={expirationTime}
                          onChange={(e) => setExpirationTime(e.target.value)}
                          min={getMinTime()}
                          className="pl-4 pr-4 py-4 border-2 border-white/20 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white text-lg"
                          required
                        />
                      </div>
                    </div>

                    {/* Access Preview */}
                    {role && expirationDate && expirationTime && employeeInfo && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-xl backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-orange-500/30 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-orange-300" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-orange-200 mb-2">⏰ Access Summary</p>
                            <div className="text-sm text-orange-300">
                              <p><strong>{employeeInfo.fullName}</strong> will receive <strong>{role}</strong> privileges</p>
                              <p>Valid until: <strong>{new Date(expirationDate + 'T' + expirationTime).toLocaleString()}</strong></p>
                              <p>Current role (<strong>{employeeInfo.role}</strong>) will be restored automatically after expiration</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Password Verification */}
                {employeeInfo && expirationDate && expirationTime && (
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <Label className="text-lg font-bold text-white flex items-center gap-3">
                        <Lock className="w-6 h-6 text-red-400" />
                        Security Verification
                      </Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                      {/* Password Input */}
                      <div className="space-y-3">
                        <Label className="text-lg font-bold text-white flex items-center gap-2">
                          <Lock className="w-5 h-5 text-red-400" />
                          Your Password *
                        </Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your admin password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="pl-12 pr-12 py-4 border-2 border-white/20 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-lg"
                            required
                          />
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      {/* Verify Button */}
                      <div className="space-y-3">
                        <Label className="text-lg font-bold text-white">
                          Verification Status
                        </Label>
                        <div className="flex flex-col gap-3">
                          <Button
                            type="button"
                            onClick={verifyPassword}
                            disabled={!adminPassword || verifyingPassword || passwordVerified}
                            className={`py-4 px-8 rounded-xl font-bold transition-all duration-300 text-lg ${
                              passwordVerified 
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {verifyingPassword ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Verifying...
                              </>
                            ) : passwordVerified ? (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Password Verified ✓
                              </>
                            ) : (
                              <>
                                <Shield className="w-5 h-5 mr-2" />
                                Verify Password
                              </>
                            )}
                          </Button>
                          {passwordVerified && (
                            <div className="p-3 bg-green-500/20 border border-green-400/30 rounded-lg flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-300" />
                              <span className="text-green-300 text-sm font-medium">Authentication successful - Ready to grant access</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final Confirmation */}
                {passwordVerified && adminPassword && employeeInfo && expirationDate && expirationTime && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        4
                      </div>
                      <Label className="text-lg font-bold text-white flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        Final Confirmation
                      </Label>
                    </div>

                    {/* Final Summary */}
                    <div className="p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-xl backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-green-200 mb-4">🚀 Ready to Grant Temporary Access</p>
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-white/70">Employee:</p>
                                <p className="text-white font-semibold">{employeeInfo.fullName} ({employeeInfo.id})</p>
                              </div>
                              <div>
                                <p className="text-white/70">Current → New Role:</p>
                                <p className="text-white font-semibold">{employeeInfo.role} → {role}</p>
                              </div>
                              <div>
                                <p className="text-white/70">Access Expires:</p>
                                <p className="text-white font-semibold">{new Date(expirationDate + 'T' + expirationTime).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-white/70">Granted By:</p>
                                <p className="text-white font-semibold">{firstName} {lastName} ({role})</p>
                              </div>
                              <div>
                                <p className="text-white/70">Bank:</p>
                                <p className="text-white font-semibold">{employeeInfo.bankName}</p>
                              </div>
                              <div>
                                <p className="text-white/70">Branch:</p>
                                <p className="text-white font-semibold">{employeeInfo.branchName}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 pt-4">
                      <Button 
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-bold shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                      >
                        {submitting ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Granting Access...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-6 h-6" />
                            Grant Temporary Access
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        disabled={submitting}
                        className="flex-1 border-2 border-white/30 text-white bg-white/5 hover:bg-white/10 py-4 px-8 rounded-xl font-bold transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-lg backdrop-blur-sm"
                      >
                        Reset Form
                      </Button>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="mt-12 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-blue-200 mb-2">🔒 Security & Compliance Notice</p>
                      <p className="text-blue-300 leading-relaxed mb-3">
                        Temporary access grants are automatically tracked and logged for audit purposes. 
                        The employee's original role will be restored immediately upon expiration.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="font-semibold text-blue-200 mb-1">🔄 Auto-Restoration</p>
                          <p className="text-blue-300">Original permissions restored automatically</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="font-semibold text-blue-200 mb-1">📊 Audit Trail</p>
                          <p className="text-blue-300">All actions logged for compliance</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="font-semibold text-blue-200 mb-1">⚡ Real-time Monitoring</p>
                          <p className="text-blue-300">Access usage tracked in real-time</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="font-semibold text-blue-200 mb-1">🛡️ Secure Authentication</p>
                          <p className="text-blue-300">Multi-layer security verification</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Instructions */}
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-white/20 rounded-xl backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white mb-4">📚 Temporary Access System Guide</p>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                          <p className="font-bold text-blue-200 mb-3 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            🔍 Step 1: Employee Lookup
                          </p>
                          <ul className="text-white/80 space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400">•</span>
                              Enter valid Employee ID or name to search
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400">•</span>
                              System validates employee exists in database
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-400">•</span>
                              Auto-displays current role and details
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-orange-500/20 rounded-lg p-4 border border-orange-400/30">
                          <p className="font-bold text-orange-200 mb-3 flex items-center gap-2">
                            <Timer className="w-5 h-5" />
                            ⏰ Step 2: Configure Access
                          </p>
                          <ul className="text-white/80 space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400">•</span>
                              Select temporary role (Manager/Admin)
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400">•</span>
                              Set precise expiration date and time
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-orange-400">•</span>
                              Review access summary before proceeding
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-red-500/20 rounded-lg p-4 border border-red-400/30">
                          <p className="font-bold text-red-200 mb-3 flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            🔐 Step 3: Security Verification
                          </p>
                          <ul className="text-white/80 space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              Enter your password for authorization
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              System validates your credentials
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-400">•</span>
                              Final confirmation required to grant access
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}