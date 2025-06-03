"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {  Bell, Search, } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/utils/fetchAPI"; 
import { useEffect, useState } from "react";
import TopBarSearch from "@/components/ui/TopBarSearch";

  const ITEMS_PER_PAGE = 10

export default function ViewAll() {
  const router = useRouter();
 
  const [language, setLanguage] = useState("English (US)");
  const [notifications, setNotifications] = useState(["Hania Requested Access ", "Alex Branch peformance as been updated!"]);
  const [flag, setFlag] = useState("/flags/us.png"); // Default flag
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");

  type Employee = {
    id:string;
    name: string;
    tasks: number;
    time: string;
    image: string;
  };
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  useEffect(() => {
    localStorage.clear();

  const loadData = async () => {
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
    try {
      console.log("⏳ Fetching employees and appointments...");
      const [empRes, apptRes] = await Promise.all([
        fetchAPI("employee"),
        fetchAPI("appointment"),
      ]);
      const employees = empRes.data?.employees || [];
      const appointments = apptRes.data?.appointments || [];
      console.log("✅ Raw employee response:", empRes);
      console.log("🧍 Full Employee Names From API:", employees.map((e: any) => e.fullName));

      console.log("✅ Raw appointment response:", apptRes);

     
      console.log("👥 Employees fetched:", employees.length);
      console.log("📅 Appointments fetched:", appointments.length);

      

      const calculated = employees.map((emp: any) => {
        const completedAppts = appointments.filter(
          (appt: any) => appt.employee?.id === emp.id && appt.status === "Completed"
        );

        console.log(`🧮 Employee: ${emp.fullName} | Completed Appointments:`, completedAppts.length);

        const taskCount = completedAppts.length;

        const totalMinutes = completedAppts.reduce((sum: number, appt: any) => {
          const start = new Date(`1970-01-01T${appt.appointmentStartTime}`);
          const end = new Date(`1970-01-01T${appt.appointmentEndTime}`);
          const diff = (end.getTime() - start.getTime()) / 60000;
          console.log(`⏱️ Time for appt ${appt.id}:`, diff, "minutes");
          return sum + diff;
        }, 0);

        const avgMinutes = taskCount > 0 ? Math.round(totalMinutes / taskCount) : 0;

        
        return {
          id: emp.id,                     
          name: emp.fullName,
          tasks: taskCount,
          time: `${avgMinutes} minutes`,
          image: "/flags/logo.png",
        };
        
      });

      setEmployees(calculated);
    } catch (error) {
      console.error("❌ Failed to load performance data:", error);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) =>
    (employee.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
);

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const displayedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
                    className="text-left hover:bg-gray-100 p-2 rounded-md"
                    onClick={() => router.push("/BranchPerformance")}
                  >
                    🏢 Branch Performance
                  </button>
                  <button
                    className="text-left bg-indigo-600 text-white p-2 rounded-md"
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
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 border border-gray-300">
                  <AvatarImage src="/flags/logo.png" alt="avatar"/>
                  <AvatarFallback>CEO</AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{role}</p>
                  <p className="text-xs text-gray-500">{firstName} {lastName}</p>
                </div>
              </div>
            </div>
              </div>

      

        {/* Main Content */}
      
           

        <div className="bg-white p-6 shadow-md rounded-lg">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search employee..."
          className="pl-10 border-gray-300 rounded-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Employee Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr >
            <th className="p-3 text-left text-gray-600 ">Employee Name</th>
            <th className="p-3 text-left text-gray-600">Tasks Completed</th>
            <th className="p-3 text-left text-gray-600">Average Handling Time</th>

          </tr>
        </thead>
        <tbody>
          {displayedEmployees.map((employee, index) => (
            <tr key={index} className="border-b">
             <td className="p-3 flex items-center space-x-3">
             <Image src={employee.image} alt={employee.name || "employee"} 
             width={40} height={40} className="rounded-full" />
                <span>{employee.name}</span></td>
              <td className="p-3 text-left">{employee.tasks}</td>
              <td className="p-3 text-left">{employee.time}</td>
              <td className="p-3">
              <Button
                 className="items-right bg-indigo-200"
                 variant="outline"
                 onClick={() => {
                  localStorage.setItem("selectedEmployee", JSON.stringify(employee)); // Save selected emp
                  router.push("/SpecEmp"); // Navigate
                       }}
                        >
                          View Performance
                        </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <span  className="text-gray-500 text-sm">
          Showing {Math.min(ITEMS_PER_PAGE, filteredEmployees.length)} of {filteredEmployees.length} records
        </span>
        
        <div className="flex space-x-2">
        <button 
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    className="px-3 py-1  rounded-md text-gray-700 hover:bg-gray-200"
  >
    {"<"}
  </button>
        {Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => setCurrentPage(i + 1)}
      className={`px-3 py-1 border rounded-md ${
        currentPage === i + 1
          ? "border-purple-500 text-purple-600 font-bold"
          : "text-gray-700"
      }`}
    >
      {i + 1}
    </button>
    
  ))}
   <button 
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    className="px-3 py-1  rounded-md text-gray-700 hover:bg-gray-200"
  >
    {">"}
  </button>
        </div>
      </div>
    </div>

           
      </div>
    </div>
  );
}
