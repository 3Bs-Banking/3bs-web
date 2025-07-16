"use client";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Star, Calendar, Clock, TrendingUp, Award, Target, ArrowLeft, Download, Filter, Eye, Shield, Activity, BarChart3, Sparkles, Zap, User } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar } from "recharts";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, Area, AreaChart, ComposedChart } from "recharts";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/utils/fetchAPI"; 
import { Dropdown } from "@/components/ui/Dropdown";
import TopBarSearch from "@/components/ui/TopBarSearch";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

type Appointment = {
  id: string;
  appointmentStartTime: string;
  appointmentEndTime: string;
  appointmentStartDate: string;
  service?: {
    serviceName: string;
    benchmarkTime: number;
  };
  status: string;
  employee?: { id: string };
};

type Feedback = {
  satisfactionRating: number;
  appointment: {
    id: string;
  };
};

type Entry = {
  id: string;
  time: string;
  service: string;
  rating: number | string;
  benchmarkTime: number;
  handlingMinutes: number;
};

export default function EnhancedSpecEmp() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<"Current Month" | "Last Month" | "Custom Range">("Current Month");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employeeData, setEmployeeData] = useState<Entry[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<any[]>([]);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [displayCount, setDisplayCount] = useState(10);
  const [filterType, setFilterType] = useState<"all" | "excellent" | "good" | "needs-improvement">("all");
  const [bankName, setBankName] = useState("Loading...");
  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState([
    "Performance Review Scheduled",
    "New Training Available",
  ]);
  const [flag, setFlag] = useState("/flags/us.png");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalTasks: 0,
    avgHandlingTime: 0,
    efficiencyScore: 0,
    completionRate: 100,
    trend: "stable" as "up" | "down" | "stable"
  });

  const getTimeUnit = () => {
    let fromDate: Date, toDate: Date;
    const today = new Date();
    if (timeframe === "Current Month") {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (timeframe === "Last Month") {
      fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      toDate = new Date(today.getFullYear(), today.getMonth(), 0);
    } else {
      fromDate = new Date(customStartDate);
      toDate = new Date(customEndDate);
    }
    const diffInMs = toDate.getTime() - fromDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    const diffInMonths = diffInDays / 30;
    const diffInYears = diffInMonths / 12;
    if (diffInDays <= 31) return "day";
    if (diffInMonths <= 6) return "week";
    if (diffInYears <= 2) return "month";
    return "year";
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Loading user profile...");

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

        const bankRes = await fetchAPI("bank");
        const bank = bankRes.data?.banks?.[0]?.name || "Unnamed Bank";
        setBankName(bank);

        setLoadingMessage("Loading employee data...");

        // Check if employee is selected
        const emp = JSON.parse(localStorage.getItem("selectedEmployee") || "{}");
        if (!emp?.id) {
          setLoadingMessage("No employee selected");
          setTimeout(() => {
            router.push("/EmployeePerformance");
          }, 2000);
          return;
        }

        setSelectedEmployee(emp);
        setLoadingMessage("Finalizing dashboard...");

        // Add a delay for smooth transition
        setTimeout(() => {
          setLoading(false);
        }, 1000);

      } catch (err) {
        console.error("❌ Failed to initialize app", err);
        setLoadingMessage("Error loading application");
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    initializeApp();
  }, [router]);

  useEffect(() => {
    const formatGroupingKey = (date: Date, unit: string) => {
      if (unit === "year") return `${date.getFullYear()}`;
      if (unit === "month") return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (unit === "day") return date.toISOString().split("T")[0];
      if (unit === "week") {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
      }
      return date.toISOString();
    };
    
    const loadPerformanceData = async () => {
      const emp = JSON.parse(localStorage.getItem("selectedEmployee") || "{}");
      if (!emp?.id || loading) return;

      const today = new Date();
      let fromDate: Date, toDate: Date;

      if (timeframe === "Current Month") {
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      } else if (timeframe === "Last Month") {
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        toDate = new Date(today.getFullYear(), today.getMonth(), 0);
      } else {
        fromDate = new Date(customStartDate);
        toDate = new Date(customEndDate);
      }

      try {
        const [apptRes, feedbackRes] = await Promise.all([
          fetchAPI("appointment"),
          fetchAPI("feedback"),
        ]);

        const appointments: Appointment[] = apptRes.data?.appointments || [];
        const feedbacks: Feedback[] = feedbackRes.data?.feedbacks || [];

        const filteredAppointments = appointments.filter((appt) => {
          const apptDate = new Date(`${appt.appointmentStartDate}T${appt.appointmentStartTime}`);
          return (
            appt.employee?.id === emp.id &&
            appt.status === "Completed" &&
            apptDate >= fromDate &&
            apptDate <= toDate
          );
        });

        const enriched: Entry[] = filteredAppointments.map((appt) => {
          const feedback = feedbacks.find(fb => fb.appointment?.id.trim() === appt.id.trim());
          const start = new Date(`1970-01-01T${appt.appointmentStartTime}`);
          const end = new Date(`1970-01-01T${appt.appointmentEndTime}`);
          const handlingMinutes = (end.getTime() - start.getTime()) / 60000;

          return {
            id: appt.id,
            time: `${handlingMinutes} minutes`,
            service: appt.service?.serviceName || "Unknown",
            rating: feedback?.satisfactionRating ?? "N/A",
            benchmarkTime: appt.service?.benchmarkTime ?? 0,
            handlingMinutes: handlingMinutes,
          };
        });

        setEmployeeData(enriched);

        // Calculate performance metrics
        const totalTasks = enriched.length;
        const avgHandlingTime = enriched.reduce((sum, e) => sum + e.handlingMinutes, 0) / totalTasks || 0;
        const validRatings = enriched.filter(e => typeof e.rating === "number").map(e => e.rating as number);
        const avgRatingCalc = validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length || 0;
        const efficiencyScore = Math.min(100, Math.round(((5 - avgRatingCalc) * 20) + (Math.max(0, 60 - avgHandlingTime) * 2)));

        setPerformanceMetrics({
          totalTasks,
          avgHandlingTime: Math.round(avgHandlingTime),
          efficiencyScore: Math.max(0, efficiencyScore),
          completionRate: 100,
          trend: avgRatingCalc > 3.5 ? "up" : avgRatingCalc < 2.5 ? "down" : "stable"
        });

        const ratings = enriched
          .map((e) => (typeof e.rating === "number" ? e.rating : null))
          .filter((r) => r !== null) as number[];

        const threshold = 2.5;
        const satisfied = ratings.filter((r) => r > threshold).length;
        const dissatisfied = ratings.filter((r) => r <= threshold).length;
        const average = ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;

        setAvgRating(Number(average.toFixed(2)));
        setPieData([
          { name: "Dissatisfaction", value: dissatisfied, color: "#FF6B6B" },
          { name: "Satisfaction", value: satisfied, color: "#4ECDC4" },
        ]);

        // Group data for charts
        const groupedByDate: Record<string, {
          totalDuration: number;
          totalRating: number;
          count: number;
          ratings: number[];
        }> = {};
        
        filteredAppointments.forEach((appt) => {
          const feedback = feedbacks.find(fb => fb.appointment?.id === appt.id);
          const start = new Date(`1970-01-01T${appt.appointmentStartTime}`);
          const end = new Date(`1970-01-01T${appt.appointmentEndTime}`);
          const duration = (end.getTime() - start.getTime()) / 60000;
        
          const apptDate = new Date(`${appt.appointmentStartDate}T${appt.appointmentStartTime}`);
          const groupKey = formatGroupingKey(apptDate, getTimeUnit());

          if (!groupedByDate[groupKey]) {
            groupedByDate[groupKey] = {
              totalDuration: 0,
              totalRating: 0,
              count: 0,
              ratings: [],
            };
          }

          groupedByDate[groupKey].totalDuration += duration;
          if (typeof feedback?.satisfactionRating === "number") {
            groupedByDate[groupKey].ratings.push(feedback.satisfactionRating);
            groupedByDate[groupKey].totalRating += feedback.satisfactionRating;
          }
          groupedByDate[groupKey].count += 1;
        });

        const calculateIdealTime = (count: number, appts: Appointment[]) => {
          const benchmarks: number[] = appts
            .map((appt) => appt.service?.benchmarkTime)
            .filter((v): v is number => typeof v === "number");

          const total = benchmarks.reduce((a, b) => a + b, 0);
          return parseFloat((total / benchmarks.length || 0).toFixed(2));
        };

        const responseTime = Object.entries(groupedByDate).map(([date, stats]) => ({
          date: date,
          serviceTime: parseFloat(stats.totalDuration.toFixed(2)),
          serviceVolume: stats.count,
          csat: parseFloat((stats.totalRating / stats.ratings.length || 0).toFixed(2)),
          avgHandlingTime: parseFloat((stats.totalDuration / stats.count || 0).toFixed(2)),
          idealTime: calculateIdealTime(stats.count, filteredAppointments),
        }));

        responseTime.sort((a, b) => {
          const weekA = a.date.match(/^(\d{4})-W(\d{2})$/);
          const weekB = b.date.match(/^(\d{4})-W(\d{2})$/);
        
          if (weekA && weekB) {
            const yearA = parseInt(weekA[1], 10);
            const weekNumA = parseInt(weekA[2], 10);
            const yearB = parseInt(weekB[1], 10);
            const weekNumB = parseInt(weekB[2], 10);
            return yearA !== yearB ? yearA - yearB : weekNumA - weekNumB;
          }
        
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        setResponseTimeData(responseTime);
      } catch (err) {
        console.error("Error fetching performance data", err);
      }
    };

    if (!loading) {
      loadPerformanceData();
    }
  }, [timeframe, customStartDate, customEndDate, loading]);

  const changeLanguage = (lang: string) => {
    if (lang === "Eng (US)") {
      setLanguage("Eng (US)");
      setFlag("/flags/us.png");
    } else {
      setLanguage("Arabic");
      setFlag("/flags/eg.png");
    }
  };

  const CustomLegend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-4 h-3 rounded-md" style={{ backgroundColor: color }}></span>
      <span className="text-white/70 text-sm font-medium">{label}</span>
    </div>
  );

  // Filter data based on performance
  const getFilteredData = () => {
    return employeeData.filter(entry => {
      if (filterType === "all") return true;
      
      const isExcellent = typeof entry.rating === "number" && entry.rating >= 4 && entry.handlingMinutes <= 35;
      const isGood = typeof entry.rating === "number" && entry.rating >= 3 && entry.handlingMinutes <= 50;
      
      if (filterType === "excellent") return isExcellent;
      if (filterType === "good") return isGood && !isExcellent;
      if (filterType === "needs-improvement") return !isExcellent && !isGood;
      
      return true;
    });
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (trend === "down") return <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />;
    return <div className="w-5 h-5 bg-gray-400 rounded-full"></div>;
  };

  const filteredData = getFilteredData();

  const getPerformanceColor = (rating: number | string) => {
    if (typeof rating !== "number") return "text-white/60";
    if (rating >= 4) return "text-green-400";
    if (rating >= 3) return "text-yellow-400";
    return "text-red-400";
  };

  const formatXAxisTick = (dateStr: any) => {
    if (!dateStr) return "";
    
    if (typeof dateStr === "string" && /^(\d{4})-W(\d{2})$/.test(dateStr)) {
      const [, , weekStr] = dateStr.match(/^(\d{4})-W(\d{2})$/)!;
      return `W${weekStr}`;
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    
    const unit = getTimeUnit();
    if (unit === "day") {
      return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
    } else if (unit === "month") {
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    } else if (unit === "year") {
      return date.getFullYear().toString();
    }
    
    return "";
  };

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
              Loading Employee Performance Analysis
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
            Analyzing individual employee performance metrics, customer satisfaction scores, 
            and productivity trends to provide comprehensive insights.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedEmployee?.name) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <User className="w-16 h-16 mx-auto mb-4 text-white/60" />
          <p className="text-lg font-semibold mb-2">No employee selected</p>
          <p className="text-white/70 mb-4">Redirecting to employee list...</p>
          <Button onClick={() => router.push("/EmployeePerformance")} className="bg-purple-600 hover:bg-purple-700 cursor-pointer">
            Go to Employee List
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
                      <button className="text-left bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 cursor-pointer">
                       <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                         👨‍💼
                       </div>
                       <span className="font-bold">Employee Perfomance</span>
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
                       <button 
                       className="text-left hover:bg-white/10 p-3 rounded-xl cursor-pointer transition-all duration-300 text-white/90 hover:text-white group flex items-center gap-3 cursor-pointer"
                       onClick={() => router.push("/TempAcess")}
                     >
                       <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                         ⏰
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
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push("/EmployeePerformance")}
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Employees
              </Button>
              <div className="relative w-72">
                <TopBarSearch />
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
                <User className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              Individual Performance Analysis
            </h1>
            <p className="text-white/70 text-lg">Detailed performance metrics and insights</p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </div>

          {/* Enhanced Employee Header Card */}
          <Card className="mb-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20 border-4 border-white/30 shadow-xl">
                    <AvatarImage src="/flags/logo.png" alt={selectedEmployee.name} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold">{selectedEmployee.name}</h1>
                    <p className="text-white/70 mb-2">Employee ID: {selectedEmployee.id?.slice(0, 8)}...</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(performanceMetrics.trend)}
                        <span className="capitalize">{performanceMetrics.trend} Performance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-300" />
                        <span>{avgRating}/5.0 Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{performanceMetrics.efficiencyScore}%</div>
                  <div className="text-white/70">Efficiency Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Filters */}
          <Card className="mb-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-60">
                    <Dropdown
                      label="Timeline:"
                      options={["Current Month", "Last Month", "Custom Range"]}
                      selected={timeframe}
                      onSelect={(value) => setTimeframe(value as "Current Month" | "Last Month" | "Custom Range")}
                    />
                  </div>
                  {timeframe === "Custom Range" && (
                    <div className="flex gap-6 items-end">
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-white/90 mb-2">Start Date</label>
                        <div className="relative group">
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="border border-white/20 rounded-xl px-4 py-3 text-sm font-medium bg-white/10 text-white shadow-sm hover:border-purple-300 focus:ring-4 focus:ring-purple-100/20 focus:border-purple-500 transition-all duration-200 cursor-pointer min-w-[150px] backdrop-blur-sm"
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 group-hover:text-purple-400 w-5 h-5 pointer-events-none transition-colors duration-200" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-white/90 mb-2">End Date</label>
                        <div className="relative group">
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="border border-white/20 rounded-xl px-4 py-3 text-sm font-medium bg-white/10 text-white shadow-sm hover:border-purple-300 focus:ring-4 focus:ring-purple-100/20 focus:border-purple-500 transition-all duration-200 cursor-pointer min-w-[150px] backdrop-blur-sm"
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 group-hover:text-purple-400 w-5 h-5 pointer-events-none transition-colors duration-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm font-medium">Total Tasks</p>
                    <p className="text-3xl font-bold">{performanceMetrics.totalTasks}</p>
                    <p className="text-blue-200 text-xs">Completed</p>
                  </div>
                  <Target className="w-12 h-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm font-medium">Avg Handling Time</p>
                    <p className="text-3xl font-bold">{performanceMetrics.avgHandlingTime}</p>
                    <p className="text-green-200 text-xs">Minutes</p>
                  </div>
                  <Clock className="w-12 h-12 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm font-medium">Customer Rating</p>
                    <p className="text-3xl font-bold">{avgRating}</p>
                    <p className="text-purple-200 text-xs">Out of 5.0</p>
                  </div>
                  <Star className="w-12 h-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-medium">Time resolution rating</p>
                    <p className="text-3xl font-bold">{performanceMetrics.efficiencyScore}%</p>
                    <p className="text-orange-200 text-xs">Overall</p>
                  </div>
                  <Award className="w-12 h-12 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Response Time Analysis */}
            <Card className="col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5" />
                  Response Time Analysis
                </CardTitle>
                <CustomLegend color="#ffb400" label="Service Time" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={responseTimeData}>
                    <XAxis 
                      dataKey="date"
                      tickFormatter={formatXAxisTick}
                      interval={0}
                      padding={{ left: 20, right: 20 }}
                      tick={{ fill: 'white', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "white"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="serviceTime" 
                      stroke="#ffb400" 
                      strokeWidth={2}
                      dot={{ fill: '#ffb400', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Satisfaction Pie Chart */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white">Average Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ResponsiveContainer width={250} height={200}>
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        borderRadius: "8px",
                        padding: "10px",
                        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.2)"
                      }}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      startAngle={180}
                      endAngle={-180}
                      paddingAngle={3}
                      cornerRadius={5}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-4 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#4ECDC4]"></span>
                      <span className="text-sm text-white/70">Satisfaction</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{pieData[1]?.value || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#FF6B6B]"></span>
                      <span className="text-sm text-white/70">Dissatisfaction</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{pieData[0]?.value || 0}</span>
                  </div>
                </div>
                <div className="border-t border-white/20 w-full mt-4 pt-4 flex justify-center items-center gap-2">
                  <span className="text-md font-semibold text-white/90">Average</span>
                  <Star className="text-yellow-400 fill-current" size={18} />
                  <span className="text-md font-semibold text-white">{avgRating}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Service Volume */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white">Service Volume</CardTitle>
                <CustomLegend color="#ff6384" label="Tasks Completed" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={responseTimeData}>
                    <XAxis 
                      dataKey="date"
                      tickFormatter={formatXAxisTick}
                      padding={{ left: 20, right: 20 }}
                      tick={{ fill: 'white', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                    <Tooltip contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white"
                    }} />
                    <Bar 
                      dataKey="serviceVolume" 
                      fill="#ff6384" 
                      radius={[4, 4, 0, 0]} 
                      barSize={20} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* CSAT Trends */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white">CSAT Trends</CardTitle>
                <CustomLegend color="#4ECDC4" label="Customer Satisfaction" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={responseTimeData}>
                    <XAxis 
                      dataKey="date"
                      tickFormatter={formatXAxisTick}
                      padding={{ left: 20, right: 20 }}
                      tick={{ fill: 'white', fontSize: 12 }}
                    />
                    <YAxis domain={[0, 5]} tick={{ fill: 'white', fontSize: 12 }} />
                    <Tooltip contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white"
                    }} />
                    <Line 
                      type="monotone" 
                      dataKey="csat" 
                      stroke="#4ECDC4" 
                      strokeWidth={3}
                      dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Handling Time vs Benchmark */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white">Performance vs Benchmark</CardTitle>
                <div className="flex gap-4">
                  <CustomLegend color="#8884d8" label="Actual Time" />
                  <CustomLegend color="#4caf50" label="Benchmark" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={employeeData.reduce((acc: any[], entry) => {
                      const initials = entry.service
                        .split(" ")
                        .map((word: string) => word[0])
                        .join("")
                        .toUpperCase();

                      const existing = acc.find((item) => item.service === initials);
                      const time = entry.handlingMinutes;

                      if (existing) {
                        existing.totalTime += time;
                        existing.totalBenchmark += entry.benchmarkTime ?? 0;
                        existing.count += 1;
                      } else {
                        acc.push({
                          service: initials,
                          totalTime: time,
                          totalBenchmark: entry.benchmarkTime ?? 0,
                          count: 1,
                        });
                      }

                      return acc;
                    }, []).map((item) => ({
                      service: item.service,
                      actualTime: parseFloat((item.totalTime / item.count).toFixed(2)),
                      benchmarkTime: parseFloat((item.totalBenchmark / item.count).toFixed(2)),
                    }))}
                  >
                    <XAxis dataKey="service" tick={{ fill: 'white', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                    <Tooltip contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white"
                    }} />
                    <Bar dataKey="actualTime" fill="#8884d8" name="Actual Time" barSize={15} />
                    <Bar dataKey="benchmarkTime" fill="#4caf50" name="Benchmark Time" barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Detailed Performance Table */}
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer">
            <CardHeader className="border-b border-white/20">
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Detailed Performance Records</CardTitle>
                <div className="flex gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer">
                        <Filter className="w-4 h-4" />
                        Filter: {filterType === "all" ? "All Records" : 
                                 filterType === "excellent" ? "Excellent" :
                                 filterType === "good" ? "Good" : "Needs Improvement"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-lg">
                      <DropdownMenuItem 
                        onClick={() => setFilterType("all")}
                        className="cursor-pointer text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          All Records
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setFilterType("excellent")}
                        className="cursor-pointer text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Excellent Performance
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setFilterType("good")}
                        className="cursor-pointer text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          Good Performance
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setFilterType("needs-improvement")}
                        className="cursor-pointer text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          Needs Improvement
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/20">
                    <tr>
                      <th className="p-4 text-left text-white/90 font-semibold">Appointment ID</th>
                      <th className="p-4 text-left text-white/90 font-semibold">Service</th>
                      <th className="p-4 text-left text-white/90 font-semibold">Handling Time</th>
                      <th className="p-4 text-left text-white/90 font-semibold">Customer Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, displayCount).map((entry, index) => (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <span className="text-sm text-white/70 font-mono">
                            {entry.id.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                            <span className="font-medium text-white">{entry.service}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-white/60" />
                            <span className="font-medium text-white">{entry.time}</span>
                            {entry.handlingMinutes <= 30 && (
                              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-400/30">Fast</span>
                            )}
                            {entry.handlingMinutes > 60 && (
                              <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full border border-orange-400/30">Slow</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {typeof entry.rating === "number" ? (
                              <>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < (entry.rating as number)
                                          ? "text-yellow-400 fill-current"
                                          : "text-white/30"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className={`font-medium ${getPerformanceColor(entry.rating)}`}>
                                  {(entry.rating as number).toFixed(1)}
                                </span>
                              </>
                            ) : (
                              <span className="text-white/60">N/A</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredData.length > displayCount && (
                <div className="p-6 border-t border-white/20 bg-white/5 text-center">
                  <p className="text-sm text-white/70 mb-4 font-medium">
                    Showing {displayCount} of {filteredData.length} records
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setDisplayCount(prev => Math.min(prev + 10, filteredData.length));
                    }}
                    className="bg-white/10 border-white/20 text-white hover:bg-indigo-500/20 hover:border-indigo-400 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-105 px-6 py-2"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Load More ({Math.min(10, filteredData.length - displayCount)} remaining)
                  </Button>
                </div>
              )}
              {filteredData.length === 0 && (
                <div className="p-8 text-center text-white/60">
                  <Filter className="w-12 h-12 text-white/40 mx-auto mb-3" />
                  <p className="font-medium">No records found</p>
                  <p className="text-sm">Try adjusting your filter settings</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Performance Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 backdrop-blur-xl cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/30 rounded-xl">
                    <Award className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Key Strengths</h3>
                    <p className="text-sm text-blue-200">
                      {avgRating >= 4 
                        ? "Excellent customer satisfaction scores"
                        : performanceMetrics.avgHandlingTime <= 35
                        ? "Fast and efficient service delivery"
                        : "Consistent task completion rate"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-orange-400/30 backdrop-blur-xl cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/30 rounded-xl">
                    <Target className="w-6 h-6 text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Improvement Areas</h3>
                    <p className="text-sm text-orange-200">
                      {performanceMetrics.avgHandlingTime > 45
                        ? "Focus on reducing service time"
                        : avgRating < 3.5
                        ? "Work on customer satisfaction"
                        : "Continue maintaining high standards"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 backdrop-blur-xl cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/30 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Performance Trend</h3>
                    <p className="text-sm text-green-200">
                      {performanceMetrics.trend === "up"
                        ? "Performance is improving over time"
                        : performanceMetrics.trend === "down"
                        ? "Performance needs attention"
                        : "Performance is stable and consistent"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Analytics Summary */}
          <Card className="mt-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-xl cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">📊 Performance Summary</h3>
                  <p className="text-purple-200 leading-relaxed">
                    {selectedEmployee.name} has completed <strong>{performanceMetrics.totalTasks} tasks</strong> with an 
                    average handling time of <strong>{performanceMetrics.avgHandlingTime} minutes</strong> and maintains a 
                    customer satisfaction rating of <strong>{avgRating}/5.0</strong>. The overall efficiency score of{' '}
                    <strong>{performanceMetrics.efficiencyScore}%</strong> indicates{' '}
                    {performanceMetrics.efficiencyScore >= 80 ? 'excellent' : 
                     performanceMetrics.efficiencyScore >= 60 ? 'good' : 'developing'} performance levels.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer"
              onClick={() => setFilterType("excellent")}
            >
              <Award className="w-6 h-6" />
              <span className="font-medium">View Excellent Work</span>
              <span className="text-xs text-blue-200">High-performing tasks</span>
            </Button>
            
            <Button 
              className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer"
              onClick={() => setFilterType("needs-improvement")}
            >
              <Target className="w-6 h-6" />
              <span className="font-medium">Review Areas</span>
              <span className="text-xs text-yellow-200">Improvement opportunities</span>
            </Button>
            
            <Button 
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer"
              onClick={() => setTimeframe("Last Month")}
            >
              <Calendar className="w-6 h-6" />
              <span className="font-medium">Compare Periods</span>
              <span className="text-xs text-green-200">Historical analysis</span>
            </Button>
            
            <Button 
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer"
              onClick={() => router.push("/EmployeePerformance")}
            >
              <Activity className="w-6 h-6" />
              <span className="font-medium">Back to Overview</span>
              <span className="text-xs text-purple-200">All employees</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}