"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Bell, Search, Building, TrendingUp, Clock, Users, Activity, Shield, BarChart3, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Dropdown } from "@/components/ui/Dropdown";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TopBarSearch from "@/components/ui/TopBarSearch";
import { fetchAPI } from "@/utils/fetchAPI";

interface Branch {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  fullName: string;
  branch?: { id: string };
}

interface Feedback {
  appointment?: { id: string };
  satisfactionRating?: number;
  timeResolutionRating?: number;
}

interface Appointment {
  id: string;
  status: string;
  createdAt: string;
  appointmentStartDate?: string;
  appointmentEndDate?: string;
  appointmentStartTime?: string;
  appointmentEndTime?: string;
  employee?: { id: string };
  branch?: { id: string };
  service?: { benchmarkTime?: number };
}

export default function BranchPerformance() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [strongestEmployees, setStrongestEmployees] = useState<{ name: string; score: number }[]>([]);
  const [weakestEmployees, setWeakestEmployees] = useState<{ name: string; score: number }[]>([]);
  const [activityData, setActivityData] = useState([
    { name: "JAN", value: 0 },
    { name: "FEB", value: 0 },
    { name: "MAR", value: 0 },
    { name: "APR", value: 0 },
    { name: "MAY", value: 0 },
    { name: "JUN", value: 0 },
    { name: "JUL", value: 0 },
    { name: "AUG", value: 0 },
    { name: "SEP", value: 0 },
    { name: "OCT", value: 0 },
    { name: "NOV", value: 0 },
    { name: "DEC", value: 0 }
  ]);
  const [footfall, setFootfall] = useState(0);
  const [serviceDeviation, setServiceDeviation] = useState(0);
  const [timeResolutionRating, setTimeResolutionRating] = useState(0);
  const router = useRouter();
  const [bankName, setBankName] = useState("Loading...");
  const [avgQueueTime, setAvgQueueTime] = useState("0m 0s");
  const [efficiencyScore, setEfficiencyScore] = useState(0);
  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState([
    "Hania Requested Access",
    "Alex Branch performance updated!",
  ]);
  const [flag, setFlag] = useState("/flags/us.png");
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  const changeLanguage = (lang: string) => {
    if (lang === "Eng (US)") {
      setLanguage("Eng (US)");
      setFlag("/flags/us.png");
    } else {
      setLanguage("Arabic");
      setFlag("/flags/eg.png");
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setLoadingMessage("Loading user profile...");
        
        // 1. Fetch user
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
        
        // 2. Fetch bank
        const bankRes = await fetchAPI("bank");
        const bank = bankRes.data?.banks?.[0]?.name || "Unnamed Bank";
        setBankName(bank);

        setLoadingMessage("Loading branch data...");
        
        // 3. Fetch branches
        const branchRes = await fetchAPI("branch");
        const branchList: Branch[] = branchRes.data?.branches ?? [];
        setBranches(branchList);
        const branchObj = branchList.find(b => b.name === selectedBranch) || branchList[0];
        if (!branchObj) {
          setLoading(false);
          return;
        }
        const branchId = branchObj.id;
        setSelectedBranch(branchObj.name);

        setLoadingMessage("Fetching performance data...");
        
        // 4. Fetch appointment, feedback, employee
        const [apptRes, fbRes, empRes] = await Promise.all([
          fetchAPI("appointment"),
          fetchAPI("feedback"),
          fetchAPI("employee"),
        ]);

        const appointments: Appointment[] = apptRes.data?.appointments ?? [];
        const feedbacks: Feedback[] = fbRes.data?.feedbacks ?? [];
        const employees: Employee[] = empRes.data?.employees ?? [];

        setLoadingMessage("Calculating performance metrics...");

        // ✅ Get ALL completed appointments for the selected YEAR and branch
        const yearCompleted = appointments.filter(a =>
          a.status === "Completed" &&
          a.branch?.id === branchId &&
          new Date(a.createdAt).getFullYear() === selectedYear
        );

        // ✅ ALL METRICS NOW USE YEAR-WIDE DATA

        // 1. Total Tasks Completed (WHOLE YEAR)
        setTasksCompleted(yearCompleted.length);

        // 2. Footfall (WHOLE YEAR - average per day)
        const isLeapYear = selectedYear % 4 === 0 && (selectedYear % 100 !== 0 || selectedYear % 400 === 0);
        const daysInYear = isLeapYear ? 366 : 365;
        const workingDaysInYear = Math.floor(daysInYear * 5/7); // Approximate working days (5/7 of year)
        setFootfall(workingDaysInYear > 0 ? Math.round(yearCompleted.length / workingDaysInYear) : 0);

        // 3. Average Queue Handling Time (WHOLE YEAR)
        let totalMs = 0;
        let validTimeCount = 0;
        yearCompleted.forEach(appt => {
          if (appt.appointmentStartTime && appt.appointmentEndTime) {
            const start = new Date(`1970-01-01T${appt.appointmentStartTime}`);
            const end = new Date(`1970-01-01T${appt.appointmentEndTime}`);
            const duration = end.getTime() - start.getTime();
            if (duration > 0) {
              totalMs += duration;
              validTimeCount++;
            }
          }
        });
        const avgMs = validTimeCount > 0 ? totalMs / validTimeCount : 0;
        const avgMins = Math.floor(avgMs / 60000);
        const avgSecs = Math.floor((avgMs % 60000) / 1000);
        setAvgQueueTime(`${avgMins}m ${avgSecs}s`);

        // 4. Average Service Deviation (WHOLE YEAR)
        const deviations = yearCompleted
          .map(appt => {
            if (!appt.appointmentStartTime || !appt.appointmentEndTime) return null;
            const start = new Date(`1970-01-01T${appt.appointmentStartTime}`);
            const end = new Date(`1970-01-01T${appt.appointmentEndTime}`);
            const actual = (end.getTime() - start.getTime()) / 60000; // minutes
            const benchmark = appt.service?.benchmarkTime ?? 0;
            return benchmark > 0 ? ((actual - benchmark) / benchmark) * 100 : null;
          })
          .filter((dev): dev is number => dev !== null);
        
        const avgDeviation = deviations.length > 0 ? deviations.reduce((a, b) => a + b, 0) / deviations.length : 0;
        setServiceDeviation(Math.round(Math.abs(avgDeviation)));

        // 5. Time Resolution Rating (WHOLE YEAR)
        const timeRatings = yearCompleted
          .map(appt => {
            const fb = feedbacks.find(f => f.appointment?.id === appt.id);
            return fb?.timeResolutionRating ?? 0;
          })
          .filter(rating => rating > 0);
        
        const avgTimeRating = timeRatings.length > 0 ? timeRatings.reduce((a, b) => a + b, 0) / timeRatings.length : 0;
        setTimeResolutionRating(Math.round(avgTimeRating * 20)); // Convert to percentage

        // 6. Employee Efficiency Score (WHOLE YEAR)
        let totalNorm = 0, totalSat = 0, totalRes = 0, validScoreCount = 0;
        
        yearCompleted.forEach(a => {
          if (a.appointmentStartDate && a.appointmentStartTime && a.appointmentEndDate && a.appointmentEndTime) {
            const start = new Date(`${a.appointmentStartDate}T${a.appointmentStartTime}`);
            const end = new Date(`${a.appointmentEndDate}T${a.appointmentEndTime}`);
            const duration = (end.getTime() - start.getTime()) / 1000 / 60; // minutes
            
            if (duration > 0) {
              const benchmark = a.service?.benchmarkTime ?? 0;
              const fb = feedbacks.find(f => f.appointment?.id === a.id);
              const sat = fb?.satisfactionRating ?? 0;
              const res = fb?.timeResolutionRating ?? 0;
              
              // Normalize efficiency (benchmark/actual, capped between 0.5 and 1)
              const norm = benchmark > 0 ? Math.min(Math.max(benchmark / duration, 0.5), 1) : 0.7;
              
              totalNorm += norm;
              totalSat += sat;
              totalRes += res;
              validScoreCount++;
            }
          }
        });
        
        const efficiency = validScoreCount > 0 ? 
          0.4 * (totalNorm / validScoreCount) + 
          0.3 * (totalSat / validScoreCount / 5) + 
          0.3 * (totalRes / validScoreCount / 5) : 0;
        
        setEfficiencyScore(Math.round(efficiency * 100));

        setLoadingMessage("Generating activity charts...");

        // ✅ Activity Chart (WHOLE YEAR)
        const monthlyCounts = Array(12).fill(0);
        yearCompleted.forEach(appt => {
          const month = new Date(appt.createdAt).getMonth();
          monthlyCounts[month]++;
        });
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        setActivityData(months.map((name, i) => ({ name, value: monthlyCounts[i] })));

        setLoadingMessage("Analyzing employee performance...");

        // ✅ Employee Rankings (WHOLE YEAR)
        const empScores = employees
          .filter(e => e.branch?.id === branchId)
          .map(emp => {
            const empAppts = yearCompleted.filter(a => a.employee?.id === emp.id);
            
            let normSum = 0, satSum = 0, resSum = 0, empValidCount = 0;
            
            empAppts.forEach(a => {
              if (a.appointmentStartDate && a.appointmentStartTime && a.appointmentEndDate && a.appointmentEndTime) {
                const start = new Date(`${a.appointmentStartDate}T${a.appointmentStartTime}`);
                const end = new Date(`${a.appointmentEndDate}T${a.appointmentEndTime}`);
                const duration = (end.getTime() - start.getTime()) / 1000 / 60;
                
                if (duration > 0) {
                  const fb = feedbacks.find(f => f.appointment?.id === a.id);
                  const sat = fb?.satisfactionRating ?? 0;
                  const res = fb?.timeResolutionRating ?? 0;
                  const benchmark = a.service?.benchmarkTime ?? 0;
                  const norm = benchmark > 0 ? Math.min(Math.max(benchmark / duration, 0.5), 1) : 0.7;
                  
                  normSum += norm;
                  satSum += sat;
                  resSum += res;
                  empValidCount++;
                }
              }
            });
            
            const score = empValidCount > 0 ? 
              0.4 * (normSum / empValidCount) + 
              0.3 * (satSum / empValidCount / 5) + 
              0.3 * (resSum / empValidCount / 5) : 0;
            
            const name = emp.fullName.split(" ").slice(0, 2).join(" ");
            return { name, score: Math.round(score * 100) };
          })
          .filter(emp => emp.score > 0); // Only include employees with actual performance data

        const sorted = [...empScores].sort((a, b) => b.score - a.score);
        setStrongestEmployees(sorted.slice(0, 5));
        setWeakestEmployees(sorted.slice(-5).reverse());

        setLoadingMessage("Finalizing dashboard...");
        
        // Add a small delay to show the final message
        setTimeout(() => {
          setLoading(false);
        }, 500);
        
      } catch (err) {
        console.error("❌ Dashboard Load Error:", err);
        setLoadingMessage("Error loading dashboard data");
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    }

    fetchData();
  }, [selectedBranch, selectedYear]);

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
                <Building className="w-12 h-12 text-purple-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Loading Branch Performance Dashboard
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
            Analyzing branch performance metrics, employee efficiency, and customer satisfaction data
            to provide comprehensive insights for operational excellence.
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
                        Branch Performance Portal
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
                      <button className="text-left bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
                       <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                         🏢
                       </div>
                       <span className="font-bold">Branch Perfomance</span>
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
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <Building className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent">
              Branch Performance Analytics
            </h1>
            <p className="text-white/70 text-lg">Comprehensive branch metrics and operational insights</p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto"></div>
          </div>

          {/* Enhanced Year and Branch Selectors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow mb-6">
            <div className="w-80 gap-2 mt-2">
              <Dropdown
                label="Year:"
                options={["2025", "2024", "2023", "2022"]}
                selected={selectedYear.toString()}
                onSelect={(value) => setSelectedYear(parseInt(value))}
              />
            </div>
            
            <div className="w-80 gap-2 mt-2">
              <Dropdown
                label="Branch:"
                options={branches.map(b => b.name)}
                selected={selectedBranch}
                onSelect={setSelectedBranch}
              />
            </div>
          </div>

          {/* Enhanced Performance Summary */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-xl mb-6">
            <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              {selectedBranch} - {selectedYear} Performance Summary
            </h4>
            <p className="text-white/70">
              All metrics below reflect year-wide performance for {selectedYear}
            </p>
          </div>

          {/* Enhanced Cards & Charts */}
          <div className="grid grid-cols-2 items-start gap-6">
            {/* Enhanced Metrics Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-sm text-white/80 font-medium">Total Tasks Completed</p>
                  <p className="text-3xl font-bold text-blue-400 my-2">{tasksCompleted}</p>
                  <p className="text-xs text-white/60">Whole year {selectedYear}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-sm text-white/80 font-medium">Average Queue Time</p>
                  <p className="text-3xl font-bold text-green-400 my-2">{avgQueueTime}</p>
                  <p className="text-xs text-white/60">Year average</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-sm text-white/80 font-medium">Customer Traffic</p>
                  <p className="text-3xl font-bold text-purple-400 my-2">{footfall}/day</p>
                  <p className="text-xs text-white/60">Daily average</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-sm text-white/80 font-medium">Service Deviation</p>
                  <p className="text-3xl font-bold text-orange-400 my-2">{serviceDeviation}%</p>
                  <p className="text-xs text-white/60">Year average</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-sm text-white/80 font-medium">Resolution Rating</p>
                  <p className="text-3xl font-bold text-red-400 my-2">{timeResolutionRating}%</p>
                  <p className="text-xs text-white/60">Year average</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-sm text-white/80 font-medium">Efficiency Score</p>
                  <p className="text-3xl font-bold text-indigo-400 my-2">{efficiencyScore}%</p>
                  <p className="text-xs text-white/60">Year average</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Chart */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardContent className="p-6">
                <h3 className="text-center font-bold text-xl mb-4 text-white flex items-center justify-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  Peak Activity Analysis ({selectedYear})
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={activityData}>
                    <defs>
                      <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: "white", fontSize: 12 }} 
                      interval={0} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.8)", 
                        borderRadius: "10px", 
                        padding: "10px", 
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "white"
                      }}
                      formatter={(value) => [`${value} tasks`, 'Completed Tasks']}
                    />
                    <Bar dataKey="value" fill="url(#barColor)" radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Employee Rankings */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
                  Improvement Needed ({selectedYear})
                </h3>
              </div>
              {weakestEmployees.length > 0 ? weakestEmployees.map((emp) => (
                <div key={emp.name} className="flex items-center justify-between my-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border-2 border-white/20">
                      <AvatarImage src="/flags/logo.png" alt="Avatar" />
                      <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-white">{emp.name}</span>
                  </div>
                  <div className="relative w-1/2 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{
                        width: `${emp.score}%`,
                        background: "linear-gradient(to right, #F4AB73, #F55900)",
                      }}
                    ></div>
                  </div>
                  <span className="text-white/80 text-sm font-medium">{emp.score}%</span>
                </div>
              )) : (
                <p className="text-white/60">No employee data available for {selectedYear}</p>
              )}
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top Performers ({selectedYear})
                </h3>
              </div>
              {strongestEmployees.length > 0 ? strongestEmployees.map((emp) => (
                <div key={emp.name} className="flex items-center justify-between my-3 p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border-2 border-white/20">
                      <AvatarImage src="/flags/logo.png" alt="Avatar" />
                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-white">{emp.name}</span>
                  </div>
                  <div className="relative w-1/2 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{
                        width: `${emp.score}%`,
                        background: "linear-gradient(to right, rgb(91, 230, 105), #18F548, #19BF49)",
                      }}
                    ></div>
                  </div>
                  <span className="text-white/80 text-sm font-medium">{emp.score}%</span>
                </div>
              )) : (
                <p className="text-white/60">No employee data available for {selectedYear}</p>
              )}
            </Card>
          </div>

          {/* Enhanced Performance Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/30 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Peak Performance</h3>
                    <p className="text-sm text-blue-200">
                      {Math.max(...activityData.map(d => d.value)) > 0 
                        ? `Highest activity in ${activityData.find(d => d.value === Math.max(...activityData.map(d => d.value)))?.name}`
                        : "Analyzing peak periods"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/30 rounded-xl">
                    <Users className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Customer Satisfaction</h3>
                    <p className="text-sm text-green-200">
                      {timeResolutionRating >= 80 
                        ? "Excellent customer service delivery"
                        : timeResolutionRating >= 60
                        ? "Good customer satisfaction levels"
                        : "Focus on improving service quality"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/30 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Efficiency Trend</h3>
                    <p className="text-sm text-purple-200">
                      {efficiencyScore >= 80
                        ? "Branch operating at high efficiency"
                        : efficiencyScore >= 60
                        ? "Steady operational performance"
                        : "Improvement opportunities identified"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Analytics Summary */}
          <Card className="mt-6 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-indigo-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">📊 Branch Performance Summary</h3>
                  <p className="text-indigo-200 leading-relaxed">
                    {selectedBranch} processed <strong>{tasksCompleted} tasks</strong> in {selectedYear} with an 
                    average queue time of <strong>{avgQueueTime}</strong> and serves approximately{' '}
                    <strong>{footfall} customers daily</strong>. The branch maintains an efficiency score of{' '}
                    <strong>{efficiencyScore}%</strong> with a <strong>{timeResolutionRating}% resolution rating</strong>,
                    indicating{' '}
                    {efficiencyScore >= 80 ? 'excellent' : 
                     efficiencyScore >= 60 ? 'good' : 'developing'} operational performance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer rounded-lg"
              onClick={() => router.push("/EmployeePerformance")}
            >
              <Users className="w-6 h-6 mx-auto" />
              <span className="font-medium">View Employees</span>
              <span className="text-xs text-blue-200">Individual performance</span>
            </button>
            
            <button 
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer rounded-lg"
              onClick={() => setSelectedYear(selectedYear - 1)}
            >
              <Clock className="w-6 h-6 mx-auto" />
              <span className="font-medium">Previous Year</span>
              <span className="text-xs text-green-200">Historical comparison</span>
            </button>
            
            <button 
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer rounded-lg"
              onClick={() => router.push("/BankPerformance")}
            >
              <Building className="w-6 h-6 mx-auto" />
              <span className="font-medium">Bank Overview</span>
              <span className="text-xs text-purple-200">System-wide metrics</span>
            </button>
            
            <button 
              className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer rounded-lg"
              onClick={() => router.push("/GiveAccess")}
            >
              <Shield className="w-6 h-6 mx-auto" />
              <span className="font-medium">Manage Access</span>
              <span className="text-xs text-yellow-200">User permissions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}