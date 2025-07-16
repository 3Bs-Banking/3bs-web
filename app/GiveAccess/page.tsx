"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Bell, Mail, Search, ChevronDown, User, Lock, Building, MapPin, Shield, Eye, EyeOff, Copy, CheckCircle, AlertTriangle, Info, TrendingUp, UserPlus, Zap, Sparkles } from "lucide-react";
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
];

// Access API functions
const accessAPI = {
  createAccess: async (data: any) => {
    const response = await fetch('http://localhost:5000/api/access-management', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  checkEmployee: async (employeeId: string) => {
    const response = await fetch(`http://localhost:5000/api/access-management/check/${employeeId}`, {
      credentials: 'include'
    });
    return response.json();
  }
};

// Type definitions
interface EmployeeInfo {
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  bankId: string;
  bankName: string;
  branchId: string;
  branchName: string;
}

interface FormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  password: string;
  bankId: string;
  branchId: string;
  notes: string;
}

export default function GiveAccessPage() {
  const router = useRouter();
  
  // All useState hooks must be at the top, before any useEffect
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [language, setLanguage] = useState("English (US)");
  const [profileImage, setProfileImage] = useState("/user-avatar.png");
  const [notifications, setNotifications] = useState(["Hania Requested Access ", "Alex Branch peformance as been updated!"]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [flag, setFlag] = useState("/flags/us.png");
  const [isClient, setIsClient] = useState(false);
  const [bankName, setBankName] = useState("Loading...");
  
  // Enhanced form state variables
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  const [currentUserBank, setCurrentUserBank] = useState<string>('');
  const [currentUserBranch, setCurrentUserBranch] = useState<string>('');
  const [checkingEmployee, setCheckingEmployee] = useState<boolean>(false);
  
  // Main form state
  const [accessType, setAccessType] = useState<'new' | 'escalation'>('new');
  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    firstName: '',
    lastName: '',
    role: 'Manager',
    email: '',
    password: '',
    bankId: '',
    branchId: '',
    notes: ''
  });

  const changeLanguage = (lang: string) => {
    if (lang === "Eng (US)") {
      setLanguage("Eng (US)");
      setFlag("/flags/us.png");
    } else {
      setLanguage("Arabic");
      setFlag("/flags/eg.png");
    }
  };

  // Enhanced functions
  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const generateRandomId = (field: keyof FormData) => {
    const randomId = Math.random().toString(36).substr(2, 9).toUpperCase();
    setFormData(prev => ({ ...prev, [field]: randomId }));
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      firstName: '',
      lastName: '',
      role: 'Manager',
      email: '',
      password: '',
      bankId: accessType === 'new' ? currentUserBank : '',
      branchId: accessType === 'new' ? currentUserBranch : '',
      notes: ''
    });
    setShowPassword(false);
    setCopiedField('');
    setError('');
    setSuccess('');
    setEmployeeInfo(null);
  };

  // Handle access type change
  const handleAccessTypeChange = (type: 'new' | 'escalation') => {
    setAccessType(type);
    setError('');
    setSuccess('');
    setEmployeeInfo(null);
    
    // Reset form with appropriate defaults
    setFormData({
      employeeId: '',
      firstName: '',
      lastName: '',
      role: 'Manager',
      email: '',
      password: '',
      bankId: type === 'new' ? currentUserBank : '',
      branchId: type === 'new' ? currentUserBranch : '',
      notes: ''
    });
  };

  // Check employee when employeeId changes (only for escalation)
  const checkEmployeeExists = async (employeeId: string) => {
    if (!employeeId || accessType !== 'escalation') {
      setEmployeeInfo(null);
      return;
    }

    setCheckingEmployee(true);
    try {
      const result = await accessAPI.checkEmployee(employeeId);
      if (result.success && result.data.exists) {
        const employee: EmployeeInfo = result.data.user;
        setEmployeeInfo(employee);
        
        // Auto-fill data from existing employee
        setFormData(prev => ({
          ...prev,
          firstName: employee.fullName.split(' ')[0],
          lastName: employee.fullName.split(' ').slice(1).join(' '),
          bankId: employee.bankId,
          branchId: employee.branchId,
          email: '' // Will be auto-generated based on new role
        }));
        
        setError('');
      } else {
        setEmployeeInfo(null);
        setError('Employee ID not found in the system');
        
        // Reset auto-filled data
        setFormData(prev => ({
          ...prev,
          firstName: '',
          lastName: '',
          bankId: '',
          branchId: '',
          email: ''
        }));
      }
    } catch (err) {
      console.error('Error checking employee:', err);
      setEmployeeInfo(null);
      setError('Failed to check employee. Please try again.');
    } finally {
      setCheckingEmployee(false);
    }
  };

  // Generate email preview based on role and names
const generateEmailPreview = (): string => {
  if (accessType === 'escalation' && employeeInfo) {
    const firstName = employeeInfo.fullName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const lastName = employeeInfo.fullName.split(' ').slice(1).join(' ').toLowerCase().replace(/[^a-z]/g, '');
    
    if (formData.role === 'Admin') {
      return `${firstName}.${lastName}@bbb.admin.com`;  // NEW FORMAT
    } else if (formData.role === 'Manager') {
      const randomNumber = Math.floor(Math.random() * 10);
      return `${firstName}.${lastName}${randomNumber}@bbb.manager.com`;  // NEW FORMAT
    }
  } else if (accessType === 'new' && formData.firstName && formData.lastName) {
    const firstName = formData.firstName.toLowerCase().replace(/[^a-z]/g, '');
    const lastName = formData.lastName.toLowerCase().replace(/[^a-z]/g, '');
    
    if (formData.role === 'Admin') {
      return `${firstName}.${lastName}@bbb.admin.com`;  // NEW FORMAT
    } else if (formData.role === 'Manager') {
      const randomNumber = Math.floor(Math.random() * 10);
      return `${firstName}.${lastName}${randomNumber}@bbb.manager.com`;  // NEW FORMAT
    }
  }
  return 'Email will be auto-generated based on role and name';
};

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.role || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (accessType === 'escalation') {
        if (!formData.employeeId || !employeeInfo) {
          throw new Error('Please enter a valid Employee ID for privilege escalation');
        }
      } else {
        if (!formData.firstName || !formData.lastName || !formData.bankId || !formData.branchId) {
          throw new Error('Please fill in all required fields for new employee');
        }
      }

      // Prepare data for API
      const submitData: any = {
        role: formData.role,
        password: formData.password, // Send plain password - backend will handle encryption
        notes: formData.notes,
        accessType: accessType
      };

      if (accessType === 'escalation') {
        // For privilege escalation
        submitData.employeeId = formData.employeeId;
        submitData.firstName = employeeInfo!.fullName.split(' ')[0];
        submitData.lastName = employeeInfo!.fullName.split(' ').slice(1).join(' ');
        submitData.bankId = employeeInfo!.bankId;
        submitData.branchId = employeeInfo!.branchId;
      } else {
        // For new employee - don't send employeeId, let backend generate it
        submitData.firstName = formData.firstName;
        submitData.lastName = formData.lastName;
        submitData.bankId = formData.bankId;
        submitData.branchId = formData.branchId;
        // Don't send employeeId for new employees - it will be auto-generated
      }

      const result = await accessAPI.createAccess(submitData);

      if (result.success) {
        setSuccess(
          accessType === 'escalation'
            ? `Privilege escalation request created successfully for Employee ID: ${formData.employeeId}. The request is pending approval.`
            : `New employee access request created successfully! Employee ID: ${result.data.employeeId}. The request is pending approval.`
        );
        
        // Reset form after success
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to create access request');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the access request';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'employeeId' && accessType === 'escalation') {
      checkEmployeeExists(value);
    }
  };

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Loading user profile...");
        
        setIsClient(true);
        const response = await fetch("http://localhost:5000/api/user", {
          credentials: "include",
        });
        
        setLoadingMessage("Processing user data...");
        
        const data = await response.json();
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

        // Store current user's bank and branch
        if (user?.bank?.id && user?.branch?.id) {
          setCurrentUserBank(user.bank.id);
          setCurrentUserBranch(user.branch.id);
          
          // Set default bank and branch in form for new employees
          setFormData(prev => ({
            ...prev,
            bankId: user.bank.id,
            branchId: user.branch.id
          }));
        }

        setLoadingMessage("Loading bank information...");

        // Fetch bank data
        const bankRes = await fetchAPI("bank");
        const bank = bankRes.data?.banks?.[0]?.name || "Unnamed Bank";
        console.log("🏦 Bank name:", bank);
        setBankName(bank);

        setLoadingMessage("Finalizing setup...");

        setTimeout(() => {
          setLoading(false);
        }, 500);

      } catch (err) {
        console.error("❌ Failed to fetch user from session", err);
        setLoadingMessage("Error loading application");
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    initializeApp();
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
                <Shield className="w-12 h-12 text-purple-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Loading Give Access Portal
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
            Setting up user access management and security protocols for your organization. 
            Initializing secure authentication systems and permission frameworks.
          </p>
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
                        Give Access Portal
                      </p>
                    </div>
        
                    <div className="flex flex-col space-y-3">
                      {role !== "Manager" && (
                      <button 
                        className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3 cursor-pointer"
                        onClick={() => router.push("/BankPerformance")}
                      >
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                          🏦
                        </div>
                        <span className="font-medium">Bank Performance</span>
                      </button>
                      )}
                      <button 
                        className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3 cursor-pointer"
                        onClick={() => router.push("/BranchPerformance")}
                      >
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                          🏢
                        </div>
                        <span className="font-medium">Branch Performance</span>
                      </button>
                      <button 
                        className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3 cursor-pointer"
                        onClick={() => router.push("/EmployeePerformance")}
                      >
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                          👨‍💼
                        </div>
                        <span className="font-medium">Employee Performance</span>
                      </button>


                      {role !== "Manager" && (
                        <button 
                        className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3 cursor-pointer"
                        onClick={() => router.push("/GiveAccess")}
                      >
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                          🔓
                        </div>
                        <span className="font-medium">Give Access</span>
                        </button>
                      )}
                      {/* <button className="text-left bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 cursor-pointer">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  ⏰
                </div>
                <span className="font-bold">Give Access</span>
              </button> */}
                      <button 
                       className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3 cursor-pointer"
                       onClick={() => router.push("/TempAcess")}
                     >
                       <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                         🏦
                       </div>
                       <span className="font-medium">Temporary Access</span>
                     </button>  
                      <button 
                        className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3 cursor-pointer"
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
                      className="mt-6 w-full text-left p-3 text-red-400 hover:bg-red-500/20 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-3 group cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                        🔓
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </aside>

        <div className="flex-1 p-6">
          {/* Enhanced Top Bar */}
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
              <div 
                className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/20 cursor-pointer hover:bg-white/10 transition-all duration-200"
                onClick={() => router.push("/UserInfo")}
                title="View User Info"
                style={{ userSelect: 'none' }}
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

          {/* Enhanced Main Content */}
          <main className="flex-1 p-8">
            <Tabs defaultValue="Edit" className="mt-2">
              <TabsContent value="Edit" className="p-0">
                <form onSubmit={handleSubmit}>
                  <div className="max-w-6xl mx-auto">
                    {/* Enhanced Header */}
                    <div className="text-center mb-12">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                          <Shield className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                        Grant System Access
                      </h1>
                      <p className="text-white/70 text-lg">Securely manage user credentials and permissions</p>
                      <div className="mt-4 h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
                    </div>

                    {/* Enhanced Access Type Selection */}
                    <div className="mb-10">
                      <Label className="text-lg font-bold text-white flex items-center gap-3 mb-6">
                        <TrendingUp className="w-6 h-6 text-yellow-400" />
                        Choose Access Type
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                          type="button"
                          onClick={() => handleAccessTypeChange('escalation')}
                          className={`group p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            accessType === 'escalation'
                              ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-xl shadow-purple-500/25'
                              : 'border-white/20 bg-white/5 hover:border-purple-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              accessType === 'escalation' 
                                ? 'bg-purple-500/30 text-purple-200' 
                                : 'bg-white/10 text-white/70 group-hover:bg-purple-500/20 group-hover:text-purple-300'
                            }`}>
                              <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-xl font-bold text-white mb-1">Privilege Escalation</h3>
                              <p className="text-white/70 text-sm">Promote existing employee to higher role</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <ul className="text-sm text-white/60 space-y-1">
                              <li>• 🔍 Auto-retrieve employee data</li>
                              <li>• ⚡ Quick role promotion</li>
                              <li>• 🎯 Targeted access upgrade</li>
                            </ul>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAccessTypeChange('new')}
                          className={`group p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            accessType === 'new'
                              ? 'border-green-400 bg-gradient-to-br from-green-500/20 to-blue-500/20 shadow-xl shadow-green-500/25'
                              : 'border-white/20 bg-white/5 hover:border-green-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              accessType === 'new' 
                                ? 'bg-green-500/30 text-green-200' 
                                : 'bg-white/10 text-white/70 group-hover:bg-green-500/20 group-hover:text-green-300'
                            }`}>
                              <UserPlus className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-xl font-bold text-white mb-1">New Employee</h3>
                              <p className="text-white/70 text-sm">Add new employee to the system</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <ul className="text-sm text-white/60 space-y-1">
                              <li>• 🆔 Auto-generate Employee ID</li>
                              <li>• 📧 Smart email creation</li>
                              <li>• 🔐 Complete profile setup</li>
                            </ul>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Enhanced Error/Success Messages */}
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

                    {/* Enhanced Employee Info Display (for escalation) */}
                    {accessType === 'escalation' && employeeInfo && (
                      <div className="mb-8 p-6 bg-blue-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                            <Info className="w-6 h-6 text-blue-300" />
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-bold text-blue-200 mb-2">Employee Found - Privilege Escalation Mode</p>
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

                    {/* Enhanced Form Fields */}
                    <div className="space-y-8">
                      {/* Row 1 - Employee ID (only for escalation) and Role */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Employee ID - Only show for escalation */}
                        {accessType === 'escalation' && (
                          <div className="space-y-3">
                            <Label className="text-lg font-bold text-white flex items-center gap-2">
                              <User className="w-5 h-5 text-blue-400" />
                              Employee ID *
                            </Label>
                            <div className="relative group">
                              <Input
                                placeholder="Enter existing Employee ID (e.g., EMP-1234-ABCD)"
                                value={formData.employeeId}
                                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                className="pl-4 pr-12 py-4 border-2 border-white/20 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-lg"
                                required
                              />
                              {checkingEmployee && (
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Employee ID Info for New Employees */}
                        {accessType === 'new' && (
                          <div className="space-y-3">
                            <Label className="text-lg font-bold text-white flex items-center gap-2">
                              <Zap className="w-5 h-5 text-yellow-400" />
                              Employee ID
                            </Label>
                            <div className="relative">
                              <Input
                                placeholder="🎯 Auto-generated by system (EMP-XXXX-XXXX)"
                                value="🤖 Will be auto-generated"
                                className="pl-4 pr-4 py-4 border-2 border-white/20 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-white/80 transition-all duration-300 text-lg cursor-not-allowed"
                                readOnly
                              />
                            </div>
                            <p className="text-sm text-white/60 bg-white/5 rounded-lg p-3 border border-white/10">
                              💡 A unique Employee ID will be automatically generated for this new employee
                            </p>
                          </div>
                        )}

                        {/* Enhanced Role */}
                        <div className="space-y-3">
                          <Label className="text-lg font-bold text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-400" />
                            {accessType === 'escalation' ? 'New Role *' : 'Role *'}
                          </Label>
                          <select 
                            className="w-full px-4 py-4 border-2 border-white/20 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white cursor-pointer text-lg font-medium"
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            required
                          >
                            <option value="Manager" className="bg-slate-800 text-blue-300 py-2">👨‍💼 Manager - Branch Operations</option>
                            <option value="Admin" className="bg-slate-800 text-red-300 py-2">🔧 Admin - Full System Access</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2 - Names (only for new employees) */}
                      {accessType === 'new' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label className="text-lg font-bold text-white flex items-center gap-2">
                              <User className="w-5 h-5 text-green-400" />
                              First Name *
                            </Label>
                            <Input
                              placeholder="Enter employee's first name"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              className="pl-4 pr-4 py-4 border-2 border-white/20 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-lg"
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-lg font-bold text-white flex items-center gap-2">
                              <User className="w-5 h-5 text-green-400" />
                              Last Name *
                            </Label>
                            <Input
                              placeholder="Enter employee's last name"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              className="pl-4 pr-4 py-4 border-2 border-white/20 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-lg"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Row 3 - Email and Password */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Enhanced Email Preview */}
                        <div className="space-y-3">
                          <Label className="text-lg font-bold text-white flex items-center gap-2">
                            <Mail className="w-5 h-5 text-cyan-400" />
                            Email (Auto-generated)
                          </Label>
                          <div className="relative">
                            <Input
                              type="email"
                              placeholder="Email will be auto-generated"
                              value={generateEmailPreview()}
                              className="pl-12 pr-4 py-4 border-2 border-white/20 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-white/90 transition-all duration-300 text-lg cursor-not-allowed"
                              readOnly
                            />
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                          </div>
                          <div className="text-sm text-white/60 bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="font-semibold text-cyan-300 mb-1">📧 Email Generation Rules:</p>
                            <p><strong>Admin:</strong> firstname.lastname@admin.com</p>
                            <p><strong>Manager:</strong> firstname{"{0-9}"}@manager.com</p>
                          </div>
                        </div>

                        {/* Enhanced Password */}
                        <div className="space-y-3">
                          <Label className="text-lg font-bold text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-orange-400" />
                            Password *
                          </Label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Set secure password (min 6 characters)"
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              className="pl-12 pr-12 py-4 border-2 border-white/20 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-lg"
                              minLength={6}
                              required
                            />
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-orange-400 transition-colors cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <p className="text-sm text-white/60 bg-white/5 rounded-lg p-3 border border-white/10">
                            🔐 Password will be encrypted automatically when stored
                          </p>
                        </div>
                      </div>

                      {/* Row 4 - Bank and Branch (only for new employees) */}
                      {accessType === 'new' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Enhanced Bank ID */}
                          <div className="space-y-3">
                            <Label className="text-lg font-bold text-white flex items-center gap-2">
                              <Building className="w-5 h-5 text-indigo-400" />
                              Bank ID *
                            </Label>
                            <div className="relative">
                              <Input
                                placeholder="Enter Bank UUID or use generator"
                                value={formData.bankId}
                                onChange={(e) => handleInputChange('bankId', e.target.value)}
                                className="pl-12 pr-16 py-4 border-2 border-white/20 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-lg"
                                required
                              />
                              <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
                              <button
                                type="button"
                                onClick={() => generateRandomId('bankId')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-indigo-400 transition-colors cursor-pointer bg-white/10 p-1 rounded"
                                title="Generate Random ID"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Enhanced Branch ID */}
                          <div className="space-y-3">
                            <Label className="text-lg font-bold text-white flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-pink-400" />
                              Branch ID *
                            </Label>
                            <div className="relative">
                              <Input
                                placeholder="Enter Branch UUID or use generator"
                                value={formData.branchId}
                                onChange={(e) => handleInputChange('branchId', e.target.value)}
                                className="pl-12 pr-16 py-4 border-2 border-white/20 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-lg"
                                required
                              />
                              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5" />
                              <button
                                type="button"
                                onClick={() => generateRandomId('branchId')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-pink-400 transition-colors cursor-pointer bg-white/10 p-1 rounded"
                                title="Generate Random ID"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Notes */}
                      <div className="space-y-3">
                        <Label className="text-lg font-bold text-white flex items-center gap-2">
                          <Info className="w-5 h-5 text-teal-400" />
                          Notes (Optional)
                        </Label>
                        <textarea
                          placeholder="Add any additional notes about this access request..."
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          className="w-full px-4 py-4 border-2 border-white/20 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 resize-none bg-white/10 backdrop-blur-sm text-white placeholder-white/50 text-lg"
                          rows={4}
                        />
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-6 pt-8">
                        <Button 
                          type="submit"
                          disabled={submitting}
                          className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white py-4 px-8 rounded-xl font-bold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                        >
                          {submitting ? (
                            <>
                              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Processing Request...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-6 h-6" />
                              {accessType === 'escalation' ? 'Request Privilege Escalation' : 'Grant System Access'}
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

                    {/* Enhanced Security Notice */}
                    <div className="mt-12 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                          <Shield className="w-6 h-6 text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-blue-200 mb-2">🔒 Security Notice</p>
                          <p className="text-blue-300 leading-relaxed">
                            {accessType === 'escalation' 
                              ? "Privilege escalation request will be sent for approval. The employee's role and email will be updated after approval."
                              : "New employee access request will be created with auto-generated Employee ID. User credentials will be generated after approval and password will be encrypted automatically."
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Usage Instructions */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-white/20 rounded-xl backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <Info className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-white mb-4">📚 How to Use This System</p>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {accessType === 'escalation' ? (
                              <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-400/30">
                                <p className="font-bold text-purple-200 mb-3 flex items-center gap-2">
                                  <TrendingUp className="w-5 h-5" />
                                  🔼 Privilege Escalation Mode
                                </p>
                                <ul className="text-white/80 space-y-2 text-sm">
                                  <li className="flex items-start gap-2">
                                    <span className="text-purple-400">•</span>
                                    Enter existing Employee ID to promote
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-purple-400">•</span>
                                    System auto-retrieves employee data from database
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-purple-400">•</span>
                                    Names, Bank ID, and Branch ID filled automatically
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-purple-400">•</span>
                                    Email generated based on new role
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-purple-400">•</span>
                                    Only set new password and role
                                  </li>
                                </ul>
                              </div>
                            ) : (
                              <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
                                <p className="font-bold text-green-200 mb-3 flex items-center gap-2">
                                  <UserPlus className="w-5 h-5" />
                                  ➕ New Employee Mode
                                </p>
                                <ul className="text-white/80 space-y-2 text-sm">
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-400">•</span>
                                    Fill in employee's first and last name
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-400">•</span>
                                    <strong>Employee ID auto-generated by system</strong>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-400">•</span>
                                    Enter Bank ID and Branch ID manually
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-400">•</span>
                                    Email auto-generated based on role and name
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-400">•</span>
                                    Set password (encrypted automatically)
                                  </li>
                                </ul>
                              </div>
                            )}
                            
                            <div className="space-y-4">
                              <div className="bg-cyan-500/20 rounded-lg p-4 border border-cyan-400/30">
                                <p className="font-bold text-cyan-200 mb-2 flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  📧 Email Generation Rules
                                </p>
                                <ul className="text-white/80 space-y-1 text-sm">
                                  <li><strong className="text-cyan-300">Admin:</strong> firstname.lastname@admin.com</li>
                                  <li><strong className="text-cyan-300">Manager:</strong> firstname{"{random0-9}"}@manager.com</li>
                                </ul>
                              </div>
                              
                              <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-400/30">
                                <p className="font-bold text-yellow-200 mb-2 flex items-center gap-2">
                                  <Zap className="w-4 h-4" />
                                  🆔 Employee ID Generation
                                </p>
                                <ul className="text-white/80 space-y-1 text-sm">
                                  <li><strong className="text-yellow-300">Format:</strong> EMP-XXXX-XXXX (auto-generated)</li>
                                  <li><strong className="text-yellow-300">Unique:</strong> Each employee gets unique identifier</li>
                                  <li><strong className="text-yellow-300">No manual input needed</strong> for new employees</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}