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
import { Bell, Download } from "lucide-react";
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
}
interface Feedback {
  id: string;
  satisfaction_rating: number;
  created_at: string;
  appointment?: { id: string };
  comment?: string;
}
interface Branch { id: string; name: string }

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
  const [branches,       setBranches]       = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [role,      setRole]      = useState("User");
  const [bankName, setBankName] = useState("Loading...");
  const [language,      setLanguage]      = useState("English (US)");
  const [flag,          setFlag]          = useState("/flags/us.png");
  const [notifications, setNotifications] = useState<string[]>([
    "Hania Requested Access",
    "Alex Branch performance updated!"
  ]);
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
  const [reviewsCount,     setReviewsCount]     = useState(0);
  const [satisfactionRate, setSatisfactionRate] = useState(0);
  const [fraudRate,        setFraudRate]        = useState(0);
  const [churnRate,        setChurnRate]        = useState(0);
  const [customersServed, setCustomersServed] = useState(0);
  const [newBankCustomers, setNewBankCustomers] = useState(0);


useEffect(() => {
  (async () => {
    try {
      // A. Fetch Bank Info
      const bankRes = await fetchAPI("bank");
      setBankName(bankRes.data?.banks?.[0]?.name || "Unnamed Bank");

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

      // C. Fetch Branches
      const branchList = await fetchArray("branch", "branches");
      setBranches(branchList);
      const activeBranch = branchList.find(b => b.name === selectedBranch) || branchList[0];
      const branchId = activeBranch?.id || "";
      setSelectedBranch(activeBranch?.name || "");

      // D. Fetch Customers
      const customers = await fetchArray("customer", "customers");
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const newThisMonth = customers.filter(c => {
        const created = new Date(c.createdAt);
        return created >= monthStart && created <= now;
      }).length;
      setNewBankCustomers(newThisMonth);

      // E. Fetch Appointments
      const appointments = await fetchArray("appointment", "appointments");
      const servedAppointments = appointments.filter(
        appt => appt.branch?.id === branchId && appt.status === "Completed"
      );
      setCustomersServed(servedAppointments.length);

      // F. Fetch Feedback
      const feedbacks = await fetchArray("feedback", "feedbacks");
      const feedbackWithBranch = feedbacks.map(f => {
        const appt = appointments.find(a => a.id === f.appointment?.id);
        return { ...f, branchId: appt?.branch?.id };
      });
      const branchFeedback = feedbackWithBranch.filter(f => f.branchId === branchId);
      setReviewsCount(branchFeedback.length);

      if (branchFeedback.length > 0) {
        const total = branchFeedback.reduce((sum, f) => {
          const r = typeof f.satisfactionRating === "number" ? f.satisfactionRating : 0;
          return sum + r;
        }, 0);
        const avg = total / branchFeedback.length;
        setSatisfactionRate(Math.round((avg / 5) * 100));
      } else {
        setSatisfactionRate(0);
      }

      // G. Fraud Stats
      const fraudRes = await fetchAPI("fraud-predictions");
      const frauds = Array.isArray(fraudRes.data?.fraud_prediction)
        ? fraudRes.data.fraud_prediction
        : Array.isArray(fraudRes.data?.fraudPredictions)
        ? fraudRes.data.fraudPredictions
        : Array.isArray(fraudRes.data)
        ? fraudRes.data
        : [];
      const fraudCount = frauds.filter(r => r.prediction === "Fraud").length;
      const fraudRateCalc = frauds.length ? Math.round((fraudCount / frauds.length) * 100) : 0;
      setFraudRate(fraudRateCalc);

      // H. Churn Stats
      const churnRes = await fetchAPI("churn-predictions");
      const churns = Array.isArray(churnRes.data?.churn_prediction)
        ? churnRes.data.churn_prediction
        : Array.isArray(churnRes.data?.churnPredictions)
        ? churnRes.data.churnPredictions
        : Array.isArray(churnRes.data)
        ? churnRes.data
        : [];
      const churnCount = churns.filter(r => r.prediction === "Churn").length;
      const churnRateCalc = churns.length ? Math.round((churnCount / churns.length) * 100) : 0;
      setChurnRate(churnRateCalc);
    } catch (err) {
      console.error("❌ Failed to load dashboard data:", err);
    }
  })();
}, [timeframe, selectedBranch]);


  // Prepare for UI
  const summaryCards = [
    {icon:'📊', value: customersServed, label:'Customers Served', trend: "+8% from last month",
      bgColor: "bg-red-100",
      textColor: "text-red-600"},
    {icon:'📝', value: reviewsCount,                  label: "Reviews",
      trend: "+5% from last month",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600"},
    {icon:'✅', value:`${satisfactionRate}%`,             label: "Satisfaction",
    trend: "+1.2% from last month",
    bgColor: "bg-green-100",
    textColor: "text-green-600"},
    {icon:'👤', value: newBankCustomers,                     label: "New Customers",
      trend: "+0.5% from last month",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"},
  ];
  const pieDataFraud = [
    { name: 'Fraudulent',      value: fraudRate,  color: '#DACEF7' },
    { name: 'Legitimate',      value: 100 - fraudRate, color: '#A6FAE5' },
  ];
  const pieDataChurn = [
    { name: 'Predicted to churn',         value: churnRate,  color: '#DACEF7' },
    { name: 'Loyal',        value: 100 - churnRate, color: '#A6FAE5' },
  ];

  return (
    <div className="flex shadow-md">
      {/* … your sidebar here … */}
<aside className="w-64 bg-white text-gray-800 p-3 h-screen flex flex-col justify-between">
                      <div>
               <div className="flex-col flex items-center mb-4 ">
                 <Image src="/flags/3bs.png" alt="3B's Logo" width={100} height={100} className="space-y-1 mb-2 mt-8"  />
                  <p className=" leading-none text-xl  text-sm font-semibold text-center text-darkblue-700">
    {bankName}
  </p>
   <p className="mt-0 text-sm font-semibold text-center text-gray-700 mb-5">
    Dashboard
  </p>
               </div>
           
               <div className="flex flex-col space-y-2">
                 <button
                   className="text-left bg-indigo-600 text-white p-2 rounded-md cursor-pointer"
                   onClick={() => router.push("/BankPerformance")}
                 >
                   🏦 Bank Performance
                 </button>
                 <button
                                    className="text-left hover:bg-gray-100 p-2 rounded-md cursor-pointer"

                   onClick={() => router.push("/BranchPerformance")}
                 >
                   🏢 Branch Performance
                 </button>
                 <button
                   className="text-left hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                   onClick={() => router.push("/EmployeePerformance")}
                 >
                   👨‍💼 Employee Performance
                 </button>
                 <button
                    className="text-left hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                    onClick={() => router.push("/GiveAccess")}
                  >
                    🔓 Give Access
                  </button>
                 <button
                   className="text-left hover:bg-gray-100  p-2 rounded-md cursor-pointer"
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
                 className=" mt-4 w-full text-left p-2 text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
               >
                 🔓 Logout
               </button>
             </div>
           
             
             
           </aside>
      <div className="flex-1 p-6 bg-gray-50">
        {/* Top‐bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="relative w-72">
            <TopBarSearch />
          </div>
          <div className="flex items-center gap-6">
            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">
                <Image src={flag} alt="flag" width={30} height={30} className="rounded-full"/>
                <span className="text-gray-700 font-medium">{language}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={()=>changeLanguage("Eng (US)")}>
                  English (US)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={()=>changeLanguage("Arabic")}>
                  Arabic
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative cursor-pointer">
                <Bell size={24} className="text-gray-700"/>
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"/>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {notifications.length > 0
                  ? notifications.map((n,i)=>(
                      <DropdownMenuItem key={i}>{n}</DropdownMenuItem>
                    ))
                  : <DropdownMenuItem>No new notifications</DropdownMenuItem>
                }
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Avatar */}
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="/flags/logo.png"/>
                <AvatarFallback>CEO</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-semibold">{role}</p>
                <p className="text-xs text-gray-500">{firstName} {lastName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          
          <Dropdown
  label="Branch:"
  options={branches.map(b => b.name)}
  selected={selectedBranch}
  onSelect={setSelectedBranch}
/>
        </div>

        {/* Summary Cards */}
        <div className=" gap-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {summaryCards.map((c,i)=>(
            <Card key={i} className={`p-4 rounded-lg shadow-sm ${c.bgColor}`}>
            <CardContent className="flex flex-col items-start text-left">
              <div className="text-2xl mb-2">{c.icon}</div> 
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-gray-700">{c.label}</p>
              <p className={`text-sm ${c.textColor}`}>{c.trend}</p>
            </CardContent>
          </Card>
          
          ))}
        </div>

        {/* Charts */}
        <div className=" mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10 ">
        {/* Fraud Pie */}
      <Card className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
        <h3 className="font-bold mb-4">Fraudulent Transactions</h3>
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Tooltip formatter={(value, name) => [`${value}%`, name]} />
            <Pie
              data={pieDataFraud}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
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
        <div className="grid grid-cols-2 gap-20 mt-4">
          {pieDataFraud.map((slice, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-gray-700 text-sm">{slice.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Churn Pie */}
      <Card className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
        <h3 className="font-bold mb-4">Customer Churn</h3>
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Tooltip formatter={(value, name) => [`${value}%`, name]} />
            <Pie
              data={pieDataChurn}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
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
        <div className="grid grid-cols-2 gap-20 mt-4">
          {pieDataChurn.map((slice, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-gray-700 text-sm">{slice.name}</span>
            </div>
          ))}
        </div>
      </Card>

    
    
  
        </div>
      </div>
    </div>   

  );
}
