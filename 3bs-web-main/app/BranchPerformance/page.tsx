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


const activityData = [
  { name: "JAN", value: 100 },
  { name: "FEB", value: 150 },
  { name: "MAR", value: 200 },
  { name: "APR", value: 300 },
  { name: "MAY", value: 400 },
  { name: "JUN", value: 200 },
  { name: "JUL", value: 100 },
  { name: "AUG", value: 250 },
  { name: "SEP", value: 350 },
  { name: "OCT", value: 450 },
  { name: "NOV", value: 300 },
  { name: "DEC", value: 400 },
];

const weakestEmployees = [
  { name: "Mohamed Ayman", score: 30 },
  { name: "Youssef Oraby", score: 50 },
  { name: "Mahmoud Haitham", score: 36 },
  { name: "Aly Abdelrahman", score: 20 },
  { name: "Mazen Alaa", score: 30 },
];

const strongestEmployees = [
  { name: "Hania Helmy", score: 95 },
  { name: "Seif Mansour", score: 92 },
  { name: "Laila Labib", score: 89 },
  { name: "Yasser Omar", score: 86 },
  { name: "Doaa Mohamed", score: 83 },
];

export default function BranchPerformance() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5000/api/user", {
      credentials: "include", // required for cookies
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
      .catch((err) => console.error("❌ Failed to fetch user from session", err));
  }, []);
  

  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState([
    "Hania Requested Access",
    "Alex Branch performance updated!",
  ]);
  const [flag, setFlag] = useState("/flags/us.png");
  const [timeframe, setTimeframe] = useState<"Day" | "Month" | "Year" >("Month"); // Explicit type
  const [branch, setBranch] = useState("Branch");

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
            <aside className="w-64 bg-white text-gray-800 p-6 h-screen flex flex-col justify-between">
                      <div>
               <div className="flex items-center mb-6">
                 <Image src="/flags/3bs.png" alt="3B's Logo" width={100} height={100} />
               </div>
           
               <div className="flex flex-col space-y-4">
                 <button
                   className="text-left hover:bg-gray-100 p-2 rounded-md"
                   onClick={() => router.push("/BankPerformance")}
                 >
                   🏦 Bank Performance
                 </button>
                 <button
                   className="text-left bg-indigo-600 text-white p-2 rounded-md"
                   onClick={() => router.push("/BranchPerformance")}
                 >
                   🏢 Branch Performance
                 </button>
                 <button
                   className="text-left hover:bg-gray-100 p-2 rounded-md"
                   onClick={() => router.push("/EmployeePerformance")}
                 >
                   👨‍💼 Employee Performance
                 </button>
                 <button
                    className="text-left hover:bg-gray-100 p-2 rounded-md"
                    onClick={() => router.push("/GiveAccess")}
                  >
                    🔓 Give Access
                  </button>
                 <button
                   className="text-left hover:bg-gray-100  p-2 rounded-md"
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
                 className=" mt-4 w-full text-left p-2 text-red-600 hover:bg-red-50 rounded-md"
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
      
              <div className="w-80 p-4">
                  
                  <Dropdown
                    label={`Timeline: `}
                    options={["Day" , "Month" , "Year" ]}
                    selected={timeframe}
                    onSelect={(value) => setTimeframe(value as "Day" | "Month" | "Year" )}
                    
                  />
                </div>
                
                <div className="w-80 p-4">
                  <Dropdown
                    label={`Branch:`}
                    options={["Smouha Branch", "Louran Branch" , "Kafr Abdo Branch"]}
                    selected={branch}
                    onSelect={(value) => setBranch(value)}
                    
                  />
                </div>
      </div>

       {/* Cards & Charts */}
<div className=" grid grid-cols-2  items-start">
  {/* Smaller Cards */}
  <div className=" grid grid-cols-3 gap-1">
  <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">Total Tasks Completed</p>
      <p className="text-2xl font-bold">1,250</p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-4" />
      </CardContent>
    </Card>  
    <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">Average Queue Handling Time</p>
      <p className="text-2xl font-bold">4m 20s</p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-4" />
      </CardContent>
    </Card>  
    <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">Footfall (Customer Traffic)</p>
      <p className="text-2xl font-bold">500/day</p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-4" />
      </CardContent>
    </Card>  
    <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">CSAT/branch</p>
      <p className="text-2xl font-bold">64%</p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-9" />
      </CardContent>
    </Card>  
    <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">Churn Rate</p>
      <p className="text-2xl font-bold">86%</p>
      <Image src="/flags/time.png" alt="Queue Time" width={250} height={90} className=" pt-9" />
      </CardContent>
    </Card>  
    <Card className="w-[160px] h-[160px] shadow-sm border">
      <CardContent className="flex flex-col justify-center items-start">
      <p className="text-sm text-gray-1000">Employee Efficiency Score</p>
      <p className="text-2xl font-bold">34% </p>
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
          <span className="text-indigo-600 font-medium cursor-pointer">View All</span>
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
          <span className="text-indigo-600 font-medium cursor-pointer">View All</span>
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
