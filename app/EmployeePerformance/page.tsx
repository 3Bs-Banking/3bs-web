"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Badge component removed - using custom styling instead
import { Bell, Search, TrendingUp, TrendingDown, Clock, CheckCircle, Filter, Download, Eye, Shield, BarChart3, Activity, Zap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/utils/fetchAPI"; 
import { useEffect, useState } from "react";
import TopBarSearch from "@/components/ui/TopBarSearch";

const ITEMS_PER_PAGE = 8;

export default function EnhancedEmployeePerformance() {
  const router = useRouter();
 
  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState(["Hania Requested Access", "Alex Branch performance updated!"]);
  const [flag, setFlag] = useState("/flags/us.png");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [bankName, setBankName] = useState("Loading...");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "tasks" | "time">("tasks");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<"all" | "high" | "medium" | "low">("all");

  type Employee = {
    id: string;
    name: string;
    tasks: number;
    time: string;
    timeMinutes: number;
    image: string;
    performance: "high" | "medium" | "low";
    efficiency: number;
    trend: "up" | "down" | "stable";
  };
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  // Performance thresholds
  const getPerformanceLevel = (tasks: number, avgMinutes: number): "high" | "medium" | "low" => {
    if (tasks >= 15 && avgMinutes <= 35) return "high";
    if (tasks >= 5 && avgMinutes <= 50) return "medium";
    return "low";
  };

  const getEfficiencyScore = (tasks: number, avgMinutes: number): number => {
    if (tasks === 0) return 0;
    const baseScore = Math.min(tasks * 10, 100);
    const timeBonus = Math.max(0, 60 - avgMinutes);
    return Math.min(baseScore + timeBonus, 100);
  };

  const getTrendDirection = (): "up" | "down" | "stable" => {
    const trends = ["up", "down", "stable"] as const;
    return trends[Math.floor(Math.random() * trends.length)];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Loading user profile...");

        // Fetch user data
        const userRes = await fetch("http://localhost:5000/api/user", {
          credentials: "include",
        });
        const userData = await userRes.json();
        const user = userData?.data?.user;
        
        if (user?.fullName) {
          const [first, ...rest] = user.fullName.split(" ");
          setFirstName(first);
          setLastName(rest.join(" "));
        }
        if (user?.role) setRole(user.role);

        setLoadingMessage("Loading bank information...");

        // Fetch bank data
        const bankRes = await fetchAPI("bank");
        const bank = bankRes.data?.banks?.[0]?.name || "Unnamed Bank";
        setBankName(bank);

        setLoadingMessage("Loading employee data...");

        // Fetch employees and appointments
        const [empRes, apptRes] = await Promise.all([
          fetchAPI("employee"),
          fetchAPI("appointment"),
        ]);
        
        const employees = empRes.data?.employees || [];
        const appointments = apptRes.data?.appointments || [];

        setLoadingMessage("Processing performance metrics...");

        const calculated = employees.map((emp: any) => {
          const completedAppts = appointments.filter(
            (appt: any) => appt.employee?.id === emp.id && appt.status === "Completed"
          );

          const taskCount = completedAppts.length;
          const totalMinutes = completedAppts.reduce((sum: number, appt: any) => {
            if (!appt.appointmentStartTime || !appt.appointmentEndTime) return sum;
            const start = new Date(`1970-01-01T${appt.appointmentStartTime}`);
            const end = new Date(`1970-01-01T${appt.appointmentEndTime}`);
            const diff = (end.getTime() - start.getTime()) / 60000;
            return sum + (diff > 0 ? diff : 0);
          }, 0);

          const avgMinutes = taskCount > 0 ? Math.round(totalMinutes / taskCount) : 0;
          const performance = getPerformanceLevel(taskCount, avgMinutes);
          const efficiency = getEfficiencyScore(taskCount, avgMinutes);
          const trend = getTrendDirection();
          
          return {
            id: emp.id,
            name: emp.fullName,
            tasks: taskCount,
            time: `${avgMinutes} min`,
            timeMinutes: avgMinutes,
            image: "/flags/logo.png",
            performance,
            efficiency,
            trend,
          };
        });

        setLoadingMessage("Finalizing dashboard...");
        setEmployees(calculated);

        // Add a delay for smooth transition
        setTimeout(() => {
          setLoading(false);
        }, 500);

      } catch (error) {
        console.error("❌ Failed to load performance data:", error);
        setLoadingMessage("Error loading data");
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    loadData();
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

  // Filter and sort employees
  const filteredEmployees = employees
    .filter((employee) => {
      const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterBy === "all" || employee.performance === filterBy;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "tasks":
          comparison = a.tasks - b.tasks;
          break;
        case "time":
          comparison = a.timeMinutes - b.timeMinutes;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const displayedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Performance statistics
  const totalEmployees = employees.length;
  const highPerformers = employees.filter(e => e.performance === "high").length;
  const avgTasks = employees.length > 0 ? Math.round(employees.reduce((sum, e) => sum + e.tasks, 0) / employees.length) : 0;
  const avgEfficiency = employees.length > 0 ? Math.round(employees.reduce((sum, e) => sum + e.efficiency, 0) / employees.length) : 0;

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
                <BarChart3 className="w-12 h-12 text-purple-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Loading Employee Performance Dashboard
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
            Analyzing employee performance metrics and generating comprehensive reports. 
            Processing task completion rates, efficiency scores, and productivity trends.
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
                        Empolyee Performance Portal
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
                      <button className="text-left bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
                       <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                         👨‍💼
                       </div>
                       <span className="font-bold">Employee Perfomance</span>
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
                       className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3"
                       onClick={() => router.push("/TempAcess")}
                     >
                       <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                         ⏰
                       </div>
                       <span className="font-medium">Temporary Access</span>
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

          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <Activity className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              Employee Performance Analytics
            </h1>
            <p className="text-white/70 text-lg">Monitor productivity, efficiency, and performance trends</p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </div>

          {/* Enhanced Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm font-medium">Total Employees</p>
                    <p className="text-3xl font-bold">{totalEmployees}</p>
                  </div>
                  <div className="p-3 bg-blue-500/30 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm font-medium">High Performers</p>
                    <p className="text-3xl font-bold">{highPerformers}</p>
                  </div>
                  <div className="p-3 bg-green-500/30 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm font-medium">Avg Tasks/Employee</p>
                    <p className="text-3xl font-bold">{avgTasks}</p>
                  </div>
                  <div className="p-3 bg-purple-500/30 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-medium">Avg Efficiency</p>
                    <p className="text-3xl font-bold">{avgEfficiency}%</p>
                  </div>
                  <div className="p-3 bg-orange-500/30 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Employee Table */}
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="border-b border-white/20 bg-white/5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <CardTitle className="text-2xl font-bold text-white">Employee Performance Dashboard</CardTitle>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search employees..."
                      className="pl-10 w-64 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/50 focus:border-blue-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Filter className="w-4 h-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border border-white/20">
                      <DropdownMenuItem onClick={() => setFilterBy("all")} className="text-white hover:bg-white/10">All Employees</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy("high")} className="text-white hover:bg-white/10">High Performers</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy("medium")} className="text-white hover:bg-white/10">Average Performers</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterBy("low")} className="text-white hover:bg-white/10">Needs Improvement</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Export */}
                  <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/20">
                    <tr>
                      <th 
                        className="p-4 text-left text-white/90 font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => {
                          setSortBy("name");
                          setSortOrder(sortBy === "name" && sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Employee Name
                      </th>
                      <th 
                        className="p-4 text-left text-white/90 font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => {
                          setSortBy("tasks");
                          setSortOrder(sortBy === "tasks" && sortOrder === "desc" ? "asc" : "desc");
                        }}
                      >
                        Tasks Completed
                      </th>
                      <th 
                        className="p-4 text-left text-white/90 font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => {
                          setSortBy("time");
                          setSortOrder(sortBy === "time" && sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        Avg Handling Time
                      </th>
                      <th className="p-4 text-left text-white/90 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedEmployees.map((employee, index) => (
                      <tr key={employee.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12 border-2 border-white/20">
                              <AvatarImage src={employee.image} alt={employee.name} />
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-white">{employee.name}</p>
                              <p className="text-sm text-white/60">ID: {employee.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">{employee.tasks}</span>
                            <span className="text-sm text-white/60">tasks</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-white/60" />
                            <span className="font-medium text-white">{employee.time}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-indigo-500/20 hover:border-indigo-300 transition-colors"
                            onClick={() => {
                              localStorage.setItem("selectedEmployee", JSON.stringify(employee));
                              router.push("/SpecEmp");
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-white/20 bg-white/5">
                <div className="text-sm text-white/70 mb-2 sm:mb-0">
                  Showing {Math.min(ITEMS_PER_PAGE, filteredEmployees.length)} of {filteredEmployees.length} employees
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum 
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0" 
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Performance Insights Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Distribution */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Performance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">High Performers</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${totalEmployees > 0 ? (highPerformers / totalEmployees) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold">{highPerformers}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Average Performers</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                          style={{ width: `${totalEmployees > 0 ? (employees.filter(e => e.performance === "medium").length / totalEmployees) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold">{employees.filter(e => e.performance === "medium").length}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Needs Improvement</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-red-400"
                          style={{ width: `${totalEmployees > 0 ? (employees.filter(e => e.performance === "low").length / totalEmployees) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold">{employees.filter(e => e.performance === "low").length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-white transition-all duration-300"
                    onClick={() => setFilterBy("high")}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Top Performers
                  </Button>
                  <Button 
                    className="w-full justify-start bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-white transition-all duration-300"
                    onClick={() => setFilterBy("low")}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Review Low Performers
                  </Button>
                  <Button 
                    className="w-full justify-start bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-white transition-all duration-300"
                    onClick={() => setSortBy("tasks")}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Sort by Task Count
                  </Button>
                  <Button 
                    className="w-full justify-start bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-white transition-all duration-300"
                    onClick={() => router.push("/GiveAccess")}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Manage Access Rights
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Footer Notice */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-blue-200 mb-2">📊 Performance Analytics</p>
                <p className="text-blue-300 leading-relaxed">
                  This dashboard provides real-time insights into employee performance metrics including task completion rates, 
                  average handling times, and efficiency scores. Data is automatically calculated based on completed appointments 
                  and updated in real-time to help you make informed decisions about your workforce.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}