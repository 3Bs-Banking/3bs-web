"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TopBarSearch from "@/components/ui/TopBarSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  Download, 
  TrendingUp, 
  Users, 
  Shield, 
  Building, 
  BarChart3, 
  Sparkles, 
  Zap, 
  Activity, 
  DollarSign, 
  AlertTriangle 
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchAPI } from "@/utils/fetchAPI";

// ----- Types & Helpers -----
interface Customer {
  id: string;
  preferred_branch_id: string;
  created_at: string;
  createdAt?: string;
}

interface Feedback {
  id: string;
  satisfaction_rating: number;
  satisfactionRating?: number;
  created_at: string;
  appointment?: { id: string };
  comment?: string;
  branchId?: string;
}

interface Branch { 
  id: string; 
  name: string;
}

interface Appointment {
  id: string;
  status: string;
  branch?: { id: string };
}

type Timeframe = "Day" | "Month" | "FirstQ" | "SecondQ" | "ThirdQ" | "FourthQ";

const monthNames = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function getGroupKey(date: Date, tf: Timeframe): string {
  if (tf === "Day")   return `${date.getHours()}:00`;
  if (tf === "Month") return `Week ${Math.ceil(date.getDate()/7)}`;
  return monthNames[date.getMonth()];
}

// ----- Component -----
export default function BankDashboard() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [bankName, setBankName] = useState("Loading...");
  const [language, setLanguage] = useState("English (US)");
  const [flag, setFlag] = useState("/flags/us.png");
  const [notifications, setNotifications] = useState<string[]>([
    "Hania Requested Access",
    "Alex Branch performance updated!"
  ]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  function changeLanguage(lang: string) {
    if (lang.includes("Eng")) {
      setLanguage("English (US)");
      setFlag("/flags/us.png");
    } else {
      setLanguage("Arabic");
      setFlag("/flags/eg.png");
    }
  }

  async function fetchArray(endpoint: string, key: string) {
    const res = await fetchAPI(endpoint);
    const arr = res.data?.[key];
    return Array.isArray(arr) ? arr : [];
  }

  const [timeframe, setTimeframe] = useState<Timeframe>("Month");
  const [reviewsCount, setReviewsCount] = useState(0);
  const [satisfactionRate, setSatisfactionRate] = useState(0);
  const [fraudRate, setFraudRate] = useState(0);
  const [churnRate, setChurnRate] = useState(0);
  const [customersServed, setCustomersServed] = useState(0);
  const [newBankCustomers, setNewBankCustomers] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadingMessage("Loading user profile...");

        // B. Fetch User Info
        const userRes = await fetch("http://localhost:5000/api/user", {
          credentials: "include",
        });
        const userJson = await userRes.json();
        const u = userJson.data?.user;
        if (u) {
          const [first, ...rest] = (u.fullName || "").split(" ");
          setFirstName(first);
          setLastName(rest.join(" "));
          setRole(u.role || "User");
        }

        setLoadingMessage("Loading bank information...");

        // A. Fetch Bank Info
        const bankRes = await fetchAPI("bank");
        setBankName(bankRes.data?.banks?.[0]?.name || "Unnamed Bank");

        setLoadingMessage("Loading branch data...");

        // C. Fetch Branches
        const branchList = await fetchArray("branch", "branches");
        setBranches(branchList);
        const activeBranch = branchList.find(b => b.name === selectedBranch) || branchList[0];
        const branchId = activeBranch?.id || "";
        setSelectedBranch(activeBranch?.name || "");

        setLoadingMessage("Analyzing customer data...");

        // D. Fetch Customers
        const customers = await fetchArray("customer", "customers");
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = customers.filter((c: Customer) => {
          const created = new Date(c.createdAt || c.created_at);
          return created >= monthStart && created <= now;
        }).length;
        setNewBankCustomers(newThisMonth);

        setLoadingMessage("Processing appointments...");

        // E. Fetch Appointments
        const appointments = await fetchArray("appointment", "appointments");
        const servedAppointments = appointments.filter(
          (appt: Appointment) => appt.branch?.id === branchId && appt.status === "Completed"
        );
        setCustomersServed(servedAppointments.length);

        setLoadingMessage("Calculating satisfaction metrics...");

        // F. Fetch Feedback
        const feedbacks = await fetchArray("feedback", "feedbacks");
        const feedbackWithBranch = feedbacks.map((f: Feedback) => {
          const appt = appointments.find((a: Appointment) => a.id === f.appointment?.id);
          return { ...f, branchId: appt?.branch?.id };
        });
        const branchFeedback = feedbackWithBranch.filter((f: Feedback) => f.branchId === branchId);
        setReviewsCount(branchFeedback.length);

        if (branchFeedback.length > 0) {
          const total = branchFeedback.reduce((sum, f) => {
            const r = typeof (f.satisfactionRating || f.satisfaction_rating) === "number" 
              ? (f.satisfactionRating || f.satisfaction_rating) 
              : 0;
            return sum + r;
          }, 0);
          const avg = total / branchFeedback.length;
          setSatisfactionRate(Math.round((avg / 5) * 100));
        } else {
          setSatisfactionRate(0);
        }

        setLoadingMessage("Analyzing fraud patterns...");

        // G. Fraud Stats
        const fraudRes = await fetchAPI("fraud-predictions");
        const frauds = Array.isArray(fraudRes.data?.fraud_prediction)
          ? fraudRes.data.fraud_prediction
          : Array.isArray(fraudRes.data?.fraudPredictions)
          ? fraudRes.data.fraudPredictions
          : Array.isArray(fraudRes.data)
          ? fraudRes.data
          : [];
        const fraudCount = frauds.filter((r: { prediction: string; }) => r.prediction === "Fraud").length;
        const fraudRateCalc = frauds.length ? Math.round((fraudCount / frauds.length) * 100) : 0;
        setFraudRate(fraudRateCalc);

        setLoadingMessage("Processing churn predictions...");

        // H. Churn Stats
        const churnRes = await fetchAPI("churn-predictions");
        const churns = Array.isArray(churnRes.data?.churn_prediction)
          ? churnRes.data.churn_prediction
          : Array.isArray(churnRes.data?.churnPredictions)
          ? churnRes.data.churnPredictions
          : Array.isArray(churnRes.data)
          ? churnRes.data
          : [];
        const churnCount = churns.filter((r: { prediction: string; }) => r.prediction === "Churn").length;
        const churnRateCalc = churns.length ? Math.round((churnCount / churns.length) * 100) : 0;
        setChurnRate(churnRateCalc);

        setLoadingMessage("Finalizing dashboard...");

        // Add a small delay to show the final message
        setTimeout(() => {
          setLoading(false);
        }, 500);

      } catch (err) {
        console.error("❌ Failed to load dashboard data:", err);
        setLoadingMessage("Error loading dashboard data");
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    })();
  }, [timeframe, selectedBranch]);

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
              Loading Bank Performance Dashboard
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
            Analyzing bank performance data, customer satisfaction metrics, fraud detection patterns,
            and generating comprehensive insights for strategic decision making.
          </p>
        </div>
      </div>
    );
  }

  // Prepare for UI
  const summaryCards = [
    {
      icon: <Users className="w-8 h-8" />, 
      value: customersServed, 
      label:'Customers Served', 
      trend: "+8% from last month",
      bgColor: "from-red-500/20 to-pink-500/20",
      borderColor: "border-red-400/30",
      iconColor: "text-red-300"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />, 
      value: reviewsCount, 
      label: "Reviews",
      trend: "+5% from last month",
      bgColor: "from-yellow-500/20 to-orange-500/20",
      borderColor: "border-yellow-400/30",
      iconColor: "text-yellow-300"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />, 
      value:`${satisfactionRate}%`, 
      label: "Satisfaction",
      trend: "+1.2% from last month",
      bgColor: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-400/30",
      iconColor: "text-green-300"
    },
    {
      icon: <Users className="w-8 h-8" />, 
      value: newBankCustomers, 
      label: "New Customers",
      trend: "+0.5% from last month",
      bgColor: "from-purple-500/20 to-indigo-500/20",
      borderColor: "border-purple-400/30",
      iconColor: "text-purple-300"
    },
  ];

  const pieDataFraud = [
    { name: 'Fraudulent', value: fraudRate, color: '#F87171' },
    { name: 'Legitimate', value: 100 - fraudRate, color: '#34D399' },
  ];

  const pieDataChurn = [
    { name: 'Predicted to churn', value: churnRate, color: '#F87171' },
    { name: 'Loyal', value: 100 - churnRate, color: '#34D399' },
  ];

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
                       Bank Perfomance Portal
                     </p>
                   </div>
       
                   <div className="flex flex-col space-y-3">
                     {role !== "Manager" && (
                       <button className="text-left bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3">
                         <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                           🏦
                         </div>
                         <span className="font-bold">Bank Perfomance</span>
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
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-red-500 rounded-full" />
                  <span className="font-medium text-sm">{language}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-lg p-2">
                  <DropdownMenuItem onClick={() => changeLanguage("Eng (US)")} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/10 rounded px-3 py-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-red-500 rounded-full" />
                    Eng (US)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("Arabic")} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/10 rounded px-3 py-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-red-500 rounded-full" />
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Bank Performance Dashboard
            </h1>
            <p className="text-white/70 text-lg">Comprehensive banking analytics and strategic insights</p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
          </div>

          {/* Enhanced Controls */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="w-full">
              <Dropdown
                label="Branch:"
                options={branches.map(b => b.name)}
                selected={selectedBranch}
                onSelect={setSelectedBranch}
              />
            </div>
          </div>

          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryCards.map((c, i) => (
              <Card key={i} className={`bg-gradient-to-br ${c.bgColor} border ${c.borderColor} backdrop-blur-xl hover:scale-105 transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${c.iconColor}`}>
                      {c.icon}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{c.value}</p>
                  <p className="text-white/80 text-lg font-medium mb-2">{c.label}</p>
                  <p className="text-sm text-white/60">{c.trend}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Enhanced Fraud Pie */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center">
              <h3 className="font-bold mb-6 text-white text-xl flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Fraudulent Transactions
              </h3>
              <ResponsiveContainer width={250} height={250}>
                <PieChart>
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name]} 
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white"
                    }}
                  />
                  <Pie
                    data={pieDataFraud}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={120}
                    startAngle={180}
                    endAngle={-180}
                    paddingAngle={5}
                    cornerRadius={8}
                  >
                    {pieDataFraud.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-8 mt-6">
                {pieDataFraud.map((slice, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="text-white/80 text-sm">{slice.name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-red-400">{fraudRate}%</p>
                <p className="text-sm text-white/60">Fraud Detection Rate</p>
              </div>
            </Card>

            {/* Enhanced Churn Pie */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 flex flex-col items-center">
              <h3 className="font-bold mb-6 text-white text-xl flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                Customer Churn
              </h3>
              <ResponsiveContainer width={250} height={250}>
                <PieChart>
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name]} 
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white"
                    }}
                  />
                  <Pie
                    data={pieDataChurn}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={120}
                    startAngle={180}
                    endAngle={-180}
                    paddingAngle={5}
                    cornerRadius={8}
                  >
                    {pieDataChurn.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-8 mt-6">
                {pieDataChurn.map((slice, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="text-white/80 text-sm">{slice.name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{churnRate}%</p>
                <p className="text-sm text-white/60">Churn Prediction Rate</p>
              </div>
            </Card>
          </div>

          {/* Enhanced Performance Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/30 rounded-xl">
                    <DollarSign className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Revenue Impact</h3>
                    <p className="text-sm text-blue-200">
                      {satisfactionRate >= 80 
                        ? "High satisfaction driving revenue growth"
                        : satisfactionRate >= 60
                        ? "Moderate satisfaction levels maintained"
                        : "Satisfaction improvement needed for revenue"
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
                    <Shield className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Security Status</h3>
                    <p className="text-sm text-green-200">
                      {fraudRate <= 5 
                        ? "Excellent fraud detection performance"
                        : fraudRate <= 10
                        ? "Good security measures in place"
                        : "Enhanced security protocols recommended"
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
                    <h3 className="font-semibold text-white">Customer Retention</h3>
                    <p className="text-sm text-purple-200">
                      {churnRate <= 10
                        ? "Excellent customer retention rates"
                        : churnRate <= 20
                        ? "Good customer loyalty maintained"
                        : "Focus on retention strategies needed"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Key Metrics Summary */}
          <Card className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 backdrop-blur-xl mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-indigo-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">📊 Bank Performance Summary</h3>
                  <p className="text-indigo-200 leading-relaxed">
                    The {selectedBranch || 'selected'} branch has served <strong>{customersServed} customers</strong> with 
                    a <strong>{satisfactionRate}% satisfaction rate</strong> and <strong>{reviewsCount} reviews</strong> collected. 
                    Security systems maintain a <strong>{fraudRate}% fraud detection rate</strong> while customer retention 
                    shows a <strong>{churnRate}% churn prediction</strong>. This month welcomed{' '}
                    <strong>{newBankCustomers} new customers</strong>, indicating{' '}
                    {satisfactionRate >= 80 && churnRate <= 10 ? 'excellent' : 
                     satisfactionRate >= 60 && churnRate <= 20 ? 'good' : 'developing'} overall performance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer rounded-lg"
              onClick={() => router.push("/BranchPerformance")}
            >
              <Building className="w-6 h-6 mx-auto" />
              <span className="font-medium">Branch Analysis</span>
              <span className="text-xs text-blue-200">Detailed branch metrics</span>
            </button>
            
            <button 
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer rounded-lg"
              onClick={() => router.push("/EmployeePerformance")}
            >
              <Users className="w-6 h-6 mx-auto" />
              <span className="font-medium">Employee Insights</span>
              <span className="text-xs text-green-200">Individual performance</span>
            </button>
            
            <button 
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-white transition-all duration-300 p-4 h-auto flex flex-col gap-2 cursor-pointer rounded-lg"
              onClick={() => {
                // Export functionality
                const data = {
                  customersServed,
                  reviewsCount,
                  satisfactionRate,
                  newBankCustomers,
                  fraudRate,
                  churnRate,
                  branch: selectedBranch,
                  timestamp: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bank-performance-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
            >
              <Download className="w-6 h-6 mx-auto" />
              <span className="font-medium">Export Data</span>
              <span className="text-xs text-purple-200">Download reports</span>
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

          {/* Enhanced Risk Assessment */}
          <Card className="mt-8 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500/30 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">🚨 Risk Assessment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold text-red-200 mb-2">Fraud Risk Level</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                            style={{ width: `${fraudRate}%` }}
                          ></div>
                        </div>
                        <span className="text-red-300 font-bold">{fraudRate}%</span>
                      </div>
                      <p className="text-xs text-red-200/80 mt-1">
                        {fraudRate <= 5 ? 'Low risk' : fraudRate <= 15 ? 'Moderate risk' : 'High risk'}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-200 mb-2">Churn Risk Level</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
                            style={{ width: `${churnRate}%` }}
                          ></div>
                        </div>
                        <span className="text-orange-300 font-bold">{churnRate}%</span>
                      </div>
                      <p className="text-xs text-orange-200/80 mt-1">
                        {churnRate <= 10 ? 'Low risk' : churnRate <= 25 ? 'Moderate risk' : 'High risk'}
                      </p>
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