"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Bell, Search } from "lucide-react";
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
const [selectedBranch, setSelectedBranch] = useState<string>(""); // holds selected name
const [tasksCompleted, setTasksCompleted] = useState(0);
const [strongestEmployees, setStrongestEmployees] = useState<{ name: string; score: number }[]>([]);
const [weakestEmployees, setWeakestEmployees] = useState<{ name: string; score: number }[]>([]);
const [activityData, setActivityData] = useState(
  [
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
  ]

);
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

      // 2. Fetch bank
      const bankRes = await fetchAPI("bank");
      const bank = bankRes.data?.banks?.[0]?.name || "Unnamed Bank";
      setBankName(bank);

      // 3. Fetch branches
      const branchRes = await fetchAPI("branch");
      const branchList: Branch[] = branchRes.data?.branches ?? [];
      setBranches(branchList);
      const branchObj = branchList.find(b => b.name === selectedBranch) || branchList[0];
      if (!branchObj) return;
      const branchId = branchObj.id;
      setSelectedBranch(branchObj.name);

      // 4. Fetch appointment, feedback, employee
      const [apptRes, fbRes, empRes] = await Promise.all([
        fetchAPI("appointment"),
        fetchAPI("feedback"),
        fetchAPI("employee"),
      ]);

      const appointments: Appointment[] = apptRes.data?.appointments ?? [];
      const feedbacks: Feedback[] = fbRes.data?.feedbacks ?? [];
      const employees: Employee[] = empRes.data?.employees ?? [];

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const today = now.getDate();

      const completed = appointments.filter(a =>
        a.status === "Completed" &&
        a.branch?.id === branchId &&
        new Date(a.createdAt) >= monthStart &&
        new Date(a.createdAt) <= now
      );

      // 5. Metrics calculations

      // Total Tasks
      setTasksCompleted(completed.length);

      // Footfall
      setFootfall(today > 0 ? Math.round(completed.length / today) : 0);

      // Avg Queue Time
      let totalMs = 0;
      completed.forEach(appt => {
        const start = new Date(`1970-01-01T${appt.appointmentStartTime || "00:00:00"}`);
        const end = new Date(`1970-01-01T${appt.appointmentEndTime || "00:00:00"}`);
        totalMs += end.getTime() - start.getTime();
      });
      const avgMs = completed.length ? totalMs / completed.length : 0;
      const avgMins = Math.floor(avgMs / 60000);
      const avgSecs = Math.floor((avgMs % 60000) / 1000);
      setAvgQueueTime(`${avgMins}m ${avgSecs}s`);

      // Service Deviation
      const deviations = completed.map(appt => {
        const start = new Date(`1970-01-01T${appt.appointmentStartTime || "00:00:00"}`);
        const end = new Date(`1970-01-01T${appt.appointmentEndTime || "00:00:00"}`);
        const actual = (end.getTime() - start.getTime()) / 60000;
        const benchmark = appt.service?.benchmarkTime ?? 0;
        return benchmark > 0 ? ((actual - benchmark) / benchmark) * 100 : 0;
      });
      const avgDeviation = deviations.length > 0 ? deviations.reduce((a, b) => a + b, 0) / deviations.length : 0;
      setServiceDeviation(Math.round(avgDeviation));

      // Time Resolution Rating
      const timeRatings = completed.map(appt => {
        const fb = feedbacks.find(f => f.appointment?.id === appt.id);
        return fb?.timeResolutionRating ?? 0;
      });
      const avgTimeRating = timeRatings.reduce((a, b) => a + b, 0) / (timeRatings.length || 1);
      setTimeResolutionRating(Math.round(avgTimeRating * 20));

      // Efficiency Score
      let totalNorm = 0, totalSat = 0, totalRes = 0;
      completed.forEach(a => {
        const start = new Date(`${a.appointmentStartDate}T${a.appointmentStartTime}`);
        const end = new Date(`${a.appointmentEndDate}T${a.appointmentEndTime}`);
        const duration = (end.getTime() - start.getTime()) / 1000 / 60;
        const benchmark = a.service?.benchmarkTime ?? 0;
        const fb = feedbacks.find(f => f.appointment?.id === a.id);
        const sat = fb?.satisfactionRating ?? 0;
        const res = fb?.timeResolutionRating ?? 0;
        const norm = Math.min(Math.max(benchmark / duration, 0.5), 1);
        totalNorm += norm;
        totalSat += sat;
        totalRes += res;
      });
      const count = completed.length;
      const eff = count ? 0.4 * (totalNorm / count) + 0.3 * (totalSat / count / 5) + 0.3 * (totalRes / count / 5) : 0;
      setEfficiencyScore(Math.round(eff * 100));

      // Activity Chart
      const monthlyCounts = Array(12).fill(0);
      completed.forEach(appt => {
        const month = new Date(appt.createdAt).getMonth();
        monthlyCounts[month]++;
      });
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      setActivityData(months.map((name, i) => ({ name, value: monthlyCounts[i] })));

      // Strongest/Weakest Employees
      const empScores = employees
        .filter(e => e.branch?.id === branchId)
        .map(emp => {
          const empAppts = completed.filter(a => a.employee?.id === emp.id);
          let normSum = 0, satSum = 0, resSum = 0;
          empAppts.forEach(a => {
            const start = new Date(`${a.appointmentStartDate}T${a.appointmentStartTime}`);
            const end = new Date(`${a.appointmentEndDate}T${a.appointmentEndTime}`);
            const duration = (end.getTime() - start.getTime()) / 1000 / 60;
            const fb = feedbacks.find(f => f.appointment?.id === a.id);
            const sat = fb?.satisfactionRating ?? 0;
            const res = fb?.timeResolutionRating ?? 0;
            const benchmark = a.service?.benchmarkTime ?? 0;
            const norm = Math.min(Math.max(benchmark / duration, 0.5), 1);
            normSum += norm;
            satSum += sat;
            resSum += res;
          });
          const c = empAppts.length;
          const score = c ? 0.4 * (normSum / c) + 0.3 * (satSum / c / 5) + 0.3 * (resSum / c / 5) : 0;
          const name = emp.fullName.split(" ").slice(0, 2).join(" ");
          return { name, score: Math.round(score * 100) };
        });

      const sorted = [...empScores].sort((a, b) => b.score - a.score);
      setStrongestEmployees(sorted.slice(0, 5));
      setWeakestEmployees(sorted.slice(-5).reverse());
    } catch (err) {
      console.error("❌ Dashboard Load Error:", err);
    }
  }

  fetchData();
}, [selectedBranch]);

  return (
    <div className="flex  shadow-md">
      {/* Sidebar */}
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
                   className="text-left hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                   onClick={() => router.push("/BankPerformance")}
                 >
                   🏦 Bank Performance
                 </button>
                 <button
                   className="text-left bg-indigo-600 text-white p-2 rounded-md cursor-pointer"
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
            
      
      
      
            <div className="flex-1 p-6 bg-white-100">
              {/* Top Bar */}
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-4">
                  
            {/* Search Bar */}
            <div className="relative w-72">
              <TopBarSearch />
            </div>
            <div className="flex items-center gap-6">
              {/* Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">
                  <Image src={flag} alt="flag" width={30} height={30} className="rounded-full" />
                  <span className="text-gray-700 font-medium">{language}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white shadow-lg rounded-md p-2">
                  <DropdownMenuItem onClick={() => changeLanguage("Eng (US)")} className="flex items-center gap-2">
                    <Image src="/flags/us.png" alt="English" width={30} height={30} className="rounded-full" />
                    Eng (US)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("Arabic")} className="flex items-center gap-2">
                    <Image src="/flags/eg.png" alt="Arabic" width={30} height={30} className="rounded-full" />
                    Arabic
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
      
              {/* Notification Bell */}
              <DropdownMenu>
                  <DropdownMenuTrigger className="relative cursor-pointer">
                    <Bell className="text-gray-700" size={24} />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white shadow-lg rounded-md p-2">
                    {notifications.length > 0 ? (
                      notifications.map((notif, index) => (
                        <DropdownMenuItem key={index} className="p-2 text-gray-700">
                          {notif}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem className="p-2 text-gray-500">
                        No new notifications
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
      
              
      
              {/* Profile Avatar & Role */}
              <div className="flex items-center gap-2">
                <Avatar className="w-10 h-10 border border-gray-300">
                  <AvatarImage src="/flags/logo.png" />
                  <AvatarFallback>CEO</AvatarFallback>
                </Avatar>
                <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{role}</p>
                <p className="text-xs text-gray-500">{firstName} {lastName}</p>
                </div>
              </div>
            </div>
              </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
      
              
                
               <div className="w-80 gap-2 mt-2">
  <Dropdown
    label="Branch:"
    options={branches.map(b => b.name)}
    selected={selectedBranch}
    onSelect={setSelectedBranch}
  />
</div>

      </div>

       {/* Cards & Charts */}
<div className=" grid grid-cols-2  items-start mt-2" >
  {/* Smaller Cards */}
  <div className=" grid grid-cols-3 gap-1">
  <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">Total Tasks Completed</p>
      <p className="text-2xl font-bold">{tasksCompleted}</p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-4" />
      </CardContent>
    </Card>  
    <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">Average Queue Handling Time</p>
      <p className="text-2xl font-bold">{avgQueueTime}</p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-4" />
      </CardContent>
    </Card>  
    <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">Footfall (Customer Traffic)</p>
      <p className="text-2xl font-bold">{footfall}/day</p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-4" />
      </CardContent>
    </Card>  
    <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000"> Average Service Deviation </p>
      <p className="text-2xl font-bold">{serviceDeviation}%</p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-4" />
      </CardContent>
    </Card>  
    <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">Time Resolution Rating</p>
      <p className="text-2xl font-bold">{timeResolutionRating}%</p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-4" />
      </CardContent>
    </Card>  
    <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">Employee Efficiency Score</p>
      <p className="text-2xl font-bold">{efficiencyScore}% </p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-4" />
      </CardContent>
    </Card>  

    
  </div>

  {/* Graph with More Space */}
  <div className=" grid w-[520px] h-[160px]" >
  <Card className="p-4">
  <h3 className="text-center font-bold">Peak Activity Analysis</h3>
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={activityData}>
      {/* Gradient for Bars */}
      <defs>
        <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
        </linearGradient>
      </defs>
      <XAxis dataKey="name" tick={{ fill: "#666", fontSize: 12 }} />
      <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "10px", padding: "10px" }} />
      <Bar dataKey="value" fill="url(#barColor)" radius={[10, 10, 10, 10]} barSize={11} />
    </BarChart>
  </ResponsiveContainer>
</Card>
  </div>


</div>


        {/* Employees Ranking */}
        
        <div className="grid grid-cols-2 gap-4 mt-4">
        <Card className="p-6 shadow-md border border-gray-300 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-600 font-semibold">Weakest Employees</h3>
        </div>
        {weakestEmployees.map((emp) => (
          <div key={emp.name} className="flex items-center justify-between my-2">
            <div className="flex items-center gap-3">
              <Image src="/flags/logo.png" alt="Avatar" width={30} height={30} className="rounded-full" />
              <span className="font-medium text-gray-900">{emp.name}</span>
            </div>
            <div className="relative w-1/2 h-2 bg-gray-200 rounded-full overflow-hidden bg-gradient-to-r to-red-200 via-orange-200 to-red-200">
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  width: `${emp.score}%`,
                  background: "linear-gradient(to right, #F4AB73, #F55900)",
                }}
              ></div>
            </div>
            <span className="text-gray-600 text-sm font-medium">{emp.score}%</span>
          </div>
        ))}
      </Card>

      {/* Strongest Employees */}
      <Card className="p-6 shadow-md border border-gray-300 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-600 font-semibold">Strongest Employees</h3>
        </div>
        {strongestEmployees.map((emp) => (
          <div key={emp.name} className="flex items-center justify-between my-2">
            <div className="flex items-center gap-3">
              <Image src="/flags/logo.png" alt="Avatar" width={30} height={30} className="rounded-full" />
              <span className="font-medium text-gray-900">{emp.name}</span>
            </div>
            <div className="relative w-1/2 h-2 bg-gray-200 rounded-full overflow-hidden  bg-gradient-to-r to-grean-100 via-teal-100 to-green-100">
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  width: `${emp.score}%`,
                  background: "linear-gradient(to right,rgb(91, 230, 105), #18F548, #19BF49)",
                }}
              ></div>
            </div>
            <span className="text-gray-600 text-sm font-medium">{emp.score}%</span>
          </div>
        ))}
      </Card>
        </div>

      </div>
    </div>
  );
}
