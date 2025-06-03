"use client"; // Enables React Server Components in Next.js

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend ,Area } from "recharts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dropdown } from "@/components/ui/Dropdown";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TopBarSearch from "@/components/ui/TopBarSearch";


// Sample data for line chart based on timeframe
const dataByTimeframe = {
  Day: [
    { name: "10 AM", value: 4000 },
    { name: "11 AM", value: 4200 },
    { name: "12 PM", value: 3900 },
    { name: "01 PM", value: 3000 },
  ],
  Month: [
    { name: "Week 1", value: 4000 },
    { name: "Week 2", value: 4200 },
    { name: "Week 3", value: 3900 },
    { name: "Week 4", value: 3000 },
  ],
  FirstQ: [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 5000 },
    { name: "Mar", value: 3900 },

  ],
  SecondQ:[
    { name: "Apr", value: 2000 },
    { name: "May", value: 3500 },
    { name: "Jun", value: 1000 },
  ],
  ThirdQ:[
    { name: "Jul", value: 3900 },
    { name: "Aug", value: 4200 },
    { name: "Sep", value: 6000 },
  ],
  FourthQ:[
    { name: "Oct", value: 2800 },
    { name: "Nov", value: 4000 },
    { name: "Dec", value: 2000 },
  ]
};

// Sample data for pie chart
const pieData = [
  { name: "Churn Rate", value: 15, color: "#F7D3AE" },
  { name: "Complaint Rate", value: 20, color: "#fda4af" },
  { name: "Fraud Transaction Detected", value: 10, color: "#DACEF7" },
  { name: "Customer Satisfaction", value: 65, color: "#A6FAE5" },
];
const bankPerformanceData = [
    {
      icon: "📊",
      value: "1000",
      label: "Customers served",
      trend: "+8% from last month",
      bgColor: "bg-red-100",
      textColor: "text-red-600"
    },
    {
      icon: "📝",
      value: "300",
      label: "Reviews",
      trend: "+5% from last month",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600"
    },
    {
      icon: "✅",
      value: "90%",
      label: "Satisfaction",
      trend: "+1.2% from last month",
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      icon: "👤",
      value: "8",
      label: "New Customers",
      trend: "+0.5% from last month",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    }
  ];
// Main Dashboard Component
export default function BankDashboard() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");

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
  const router = useRouter();

  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState([
    "Hania Requested Access",
    "Alex Branch performance updated!",
  ]);
  const [flag, setFlag] = useState("/flags/us.png");
  const [timeframe, setTimeframe] = useState<"Day" | "Month" | "FirstQ" | "SecondQ" | "ThirdQ" | "FourthQ">("Month"); // Explicit type
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
              className="text-left bg-indigo-600 text-white p-2 rounded-md"
              onClick={() => router.push("/BankPerformance")}
            >
              🏦 Bank Performance
            </button>
            <button
              className="text-left hover:bg-gray-100 p-2 rounded-md"
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
              className="text-left hover:bg-gray-100   p-2 rounded-md"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">

        <div className="w-64">
            
            <Dropdown
              label={`Timeline: `}
              options={["Day" , "Month" , "FirstQ" , "SecondQ" , "ThirdQ" , "FourthQ"]}
              selected={timeframe}
              onSelect={(value) => setTimeframe(value as "Day" | "Month" | "FirstQ" | "SecondQ" | "ThirdQ" | "FourthQ")}
              
            />
          </div>
          <div className="w-64">
            <Dropdown
              label={`Branch:`}
              options={["Smouha Branch", "Louran Branch" , "Kafr Abdo Branch"]}
              selected={branch}
              onSelect={(value) => setBranch(value)}
              
            />
          </div>
</div>


        {/* Bank Overview Container */}
        <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bank Overview</h2>
          <p className="text-gray-500">Operational Insights</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={16} /> Export
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {bankPerformanceData.map((item, index) => (
          <Card key={index} className={`p-4 rounded-lg shadow-sm ${item.bgColor}`}>
            <CardContent className="flex flex-col items-start text-left">
              <div className="text-2xl mb-2">{item.icon}</div> 
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-gray-700">{item.label}</p>
              <p className={`text-sm ${item.textColor}`}>{item.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex-1 p-6 bg-white-100  flex-col gap-6">
    <h3 className="text-start font-bold text-xl mb-4">Customer & Operational Insights</h3>

        {/* Graph and Pie Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 ">
          {/* Graph Section */}
          <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dataByTimeframe[timeframe]}>
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
          <XAxis 
        dataKey="name" 
        interval={0} 
        tick={{ fill: '#000', fontSize: 14 }} 
        padding={{ left: 20, right: 20 }} // Adds space for first/last label
      />          <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px", padding: "8px" }} />
          <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#colorUv)" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>

          {/* Pie Chart Section */}
          {/* Pie Chart Section */}
<Card className="bg-white p-6 rounded-lg shadow-md flex flex-col w-full">
  <CardContent className="flex-grow flex flex-col items-center">
    <ResponsiveContainer width={250} height={250}>
      <PieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value, name) => [`${value}%`, name]}
        />
        
        {/* Outer Pie - Colored Segments */}
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          innerRadius={60} 
          outerRadius={100} 
          startAngle={180}
          endAngle={-180}
          paddingAngle={5}
          cornerRadius={8} // Rounded corners
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={3} />
          ))}
        </Pie>

        {/* Inner Pie - Transparent Overlay */}
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          innerRadius={20}
          outerRadius={70}
          startAngle={180}
          endAngle={-180}
          paddingAngle={5}
          cornerRadius={8} // Rounded corners
          fill="white" // Overlay color
          opacity={0.3} // Transparent effect
        />
      </PieChart>
    </ResponsiveContainer>

    {/* Legend Below */}
    <div className="grid grid-cols-2 gap-4 mt-4 w-full justify-center">
      {pieData.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
          <span className="text-gray-700 text-sm">{item.name}</span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

        </div>
      </div>
    </div>
        </div>
        </div>
    
  );
}
