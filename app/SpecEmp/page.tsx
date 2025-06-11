"use client";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Star } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar } from "recharts";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend ,Area } from "recharts";
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
    benchmarkTime: number; // ← add this
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
};



export default function EmpPerformance() {
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
    const [chartType, setChartType] = useState<"Bar Chart" | "Radar Chart">("Bar Chart");

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
  fetch("http://localhost:5000/api/user", {
    credentials: "include", // to send cookies for session
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
    })
    .catch((err) =>
      console.error("❌ Failed to fetch user from session", err)
    );
}, []);

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
    
    console.log("Loaded from localStorage:", JSON.parse(localStorage.getItem("selectedEmployee") || "{}"));

    const emp = JSON.parse(localStorage.getItem("selectedEmployee") || "{}");
    if (!emp?.id) return;

    // filtering
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
  const feedback = feedbacks.find(
  fb => fb.appointment?.id.trim() === appt.id.trim()
);


  console.log("appt.id:", appt.id);
  console.log("matched feedback:", feedback);
  const start = new Date(`1970-01-01T${appt.appointmentStartTime}`);
  const end = new Date(`1970-01-01T${appt.appointmentEndTime}`);
  const handlingMinutes = (end.getTime() - start.getTime()) / 60000;




        return {
          id: appt.id,
          time: `${handlingMinutes} minutes`,
          service: appt.service?.serviceName || "Unknown",
          rating: feedback?.satisfactionRating ?? "N/A",
benchmarkTime: appt.service?.benchmarkTime ?? 0,
        };
      });

      setEmployeeData(enriched);
      setSelectedEmployee(emp);

      const ratings = enriched
        .map((e) => (typeof e.rating === "number" ? e.rating : null))
        .filter((r) => r !== null) as number[];

      const threshold = 2.5; /// a3la men el nos helw , awta mesh helw
      const satisfied = ratings.filter((r) => r > threshold).length;
      const dissatisfied = ratings.filter((r) => r <= threshold).length;
      const average = ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;

      setAvgRating(Number(average.toFixed(2)));
      setPieData([
        { name: "Customer Dissatisfaction Score", value: dissatisfied, color: "#DACEF7" },
        { name: "Customer Satisfaction Score", value: satisfied, color: "#A6FAE5" },
      ]);


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
        idealTime: calculateIdealTime(stats.count, filteredAppointments), // new line
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

  loadPerformanceData();
}, [timeframe, customStartDate, customEndDate]);


    const [bankName, setBankName] = useState("Loading...");

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
    
    
  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState([
    "Hania Requested Access",
    "Alex Branch performance updated!",
  ]);
  const [flag, setFlag] = useState("/flags/us.png");
  

 

  interface CustomLegendProps {
    color: string;
    label: string;
  }
  
  const CustomLegend: React.FC<CustomLegendProps> = ({ color, label }) => (
    <div className="flex items-center gap-2">
      <span className="w-4 h-2 rounded-md" style={{ backgroundColor: color }}></span>
      <span className="text-gray-600 text-sm font-medium">{label}</span>
    </div>
  );
  
  
  const [showNotifications, setShowNotifications] = useState(false);
  const changeLanguage = (lang: string) => {
    if (lang === "Eng (US)") {
      setLanguage("Eng (US)");
      setFlag("/flags/us.png");
    } else {
      setLanguage("Arabic");
      setFlag("/flags/eg.png");
    }
  };

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
                    className="text-left hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                    onClick={() => router.push("/BranchPerformance")}
                  >
                    🏢 Branch Performance
                  </button>
                  <button
                    className="text-left bg-indigo-600 text-white  p-2 rounded-md cursor-pointer"
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
                    className="text-left hover:bg-gray-100 p-2 rounded-md cursor-pointer"
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
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-1">
                  
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
              
      </div>
       
      <div className="flex flex-col p-6 bg-white-100 min-h-screen">
      <div className="flex justify-between items-center px-4 mt-4">
  <div className="w-60">
    <Dropdown
      label="Timeline:"
      options={["Current Month", "Last Month", "Custom Range"]}
      selected={timeframe}
      onSelect={(value) => setTimeframe(value as "Current Month" | "Last Month" | "Custom Range")}
    />
  </div>
  <div className="w-90">
    
  </div>
</div>

 
  {timeframe === "Custom Range" && (
  <div className="flex gap-4 mt-2">
    <div>
      <label className="mt-2 text-sm font-medium">Start Date:  </label>
      <input
        type="date"
        value={customStartDate}
        onChange={(e) => setCustomStartDate(e.target.value)}
        className="border rounded px-2 py-1"
      />
    </div>
    <div>
      <label className="text-sm font-medium">End Date: </label>
      <input
        type="date"
        value={customEndDate}
        onChange={(e) => setCustomEndDate(e.target.value)}
        className="border rounded px-2 py-1"
      />
    </div>
  </div>
)}

      <Card className=" mt-3 p-4 shadow-md">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="/flags/logo.png" />
            <AvatarFallback>logo</AvatarFallback>
          </Avatar>
          <div>
          <h2 className="text-lg font-semibold">{selectedEmployee?.name || "Unknown"}</h2>
          </div>
        </div>
        <div className="mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="p-2">Appointment ID</th>
                <th className="p-2">Handling Time</th>
                <th className="p-2">Service Name</th>
                <th className="p-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {employeeData.map((entry, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{entry.id}</td>
                  <td className="p-2">{entry.time}</td>
                  <td className="p-2">{entry.service}</td>
                  <td className="p-2 flex items-center">
                    <Star className="text-yellow-500 fill-current"  size={16} /> {entry.rating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 shadow-md col-span-2">
        <h3 className="text-md font-semibold mb-3">Response Time Analysis</h3>
        <div className="flex items-start  gap-6 ">
        <CustomLegend color="#ffb400" label="Service Time" />
        </div>
          <ResponsiveContainer width="100%" height={250}>
          
            <LineChart data={responseTimeData}>
            <XAxis
  dataKey="date"
  type="category"
  interval={0}
  tickFormatter={(dateStr: any) => {
    if (!dateStr) return "";
  
    // Handle week format like "2025-W21"
    if (typeof dateStr === "string" && /^(\d{4})-W(\d{2})$/.test(dateStr)) {
      const [, , weekStr] = dateStr.match(/^(\d{4})-W(\d{2})$/)!;
      return `W${weekStr}`;
    }
  
    // Fallback for other formats
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
  }}
  
  padding={{ left: 20, right: 20 }}
/>

  
  

              <Tooltip />
              <Line type="monotone" dataKey="serviceTime" stroke="#ffb400" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 shadow-md rounded-lg w-full">
            <h3 className="text-lg font-semibold text-center ">Average Customer Satisfaction</h3>
            <div className="flex flex-col items-center">
                <ResponsiveContainer width={250} height={200}>
                    <PieChart>
                    <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "10px",
                      boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
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
                <div className="flex items-center  mt-4">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#A6FAE5]"></span>
                        <span className="text-sm text-gray-600"> Satisfaction Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#DACEF7]"></span>
                        <span className="text-sm text-gray-600"> Dissatisfaction Score</span>
                    </div>
                </div>
                <div className="border-t w-full mt-4 pt-4 flex justify-center items-center gap-2">
                    <span className="text-md font-semibold text-gray-700">Average Satisfaction</span>
                    <Star className="text-yellow-500 fill-current" size={18} />
                    <span className="text-md font-semibold text-gray-700">{avgRating}</span>
                </div>
            </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 shadow-md">
        <CustomLegend color="#ff6384" label="Service Volume" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={responseTimeData}>
                
            <XAxis
  dataKey="date"
  tickFormatter={(dateStr: any) => {
    if (!dateStr) return "";
  
    // Handle week format like "2025-W21"
    if (typeof dateStr === "string" && /^(\d{4})-W(\d{2})$/.test(dateStr)) {
      const [, , weekStr] = dateStr.match(/^(\d{4})-W(\d{2})$/)!;
      return `W${weekStr}`;
    }
  
    // Fallback for other formats
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
  }}
  
  
  
  
  padding={{ left: 20, right: 20 }}
/>

              <Tooltip />
              <Bar dataKey="serviceVolume" fill="#ff6384" radius={[10, 10, 0, 0]} barSize={11} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

      <Card className="p-4 shadow-md">
        <CustomLegend color="#A6FAE5" label="CSAT" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={responseTimeData}>
                
            <XAxis
  dataKey="date"
  tickFormatter={(dateStr: any) => {
    if (!dateStr) return "";
  
    // Handle week format like "2025-W21"
    if (typeof dateStr === "string" && /^(\d{4})-W(\d{2})$/.test(dateStr)) {
      const [, , weekStr] = dateStr.match(/^(\d{4})-W(\d{2})$/)!;
      return `W${weekStr}`;
    }

    // Fallback for other formats
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
  }}
  
  
  
  padding={{ left: 20, right: 20 }}
/>
  <Tooltip />
              <Bar dataKey="csat" fill="#A6FAE5" radius={[10, 10, 0, 0]} barSize={11} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        

        <Card className="p-4 shadow-md">
        

  <CustomLegend  color="#4caf50" label="Avg Handling Time" />
  
  <ResponsiveContainer width="100%" height={250}>
  <BarChart
    data={employeeData.reduce((acc: any[], entry) => {
      const initials = entry.service
        .split(" ")
        .map((word: string) => word[0])
        .join("")
        .toUpperCase();

      const existing = acc.find((item) => item.service === initials);
      const time = parseFloat(entry.time); // ← this should be numeric

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
    <XAxis dataKey="service" />
    <Tooltip />
    <Bar dataKey="actualTime" fill="#8884d8" name="Actual Time" barSize={20} />
    <Bar dataKey="benchmarkTime" fill="#4caf50" name="Benchmark Time" barSize={20} />
  </BarChart>
</ResponsiveContainer>


</Card>

      </div>
    </div>
     </div>
     
    </div>
  );
}
