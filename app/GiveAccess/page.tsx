"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Bell, Mail, Search, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TopBarSearch from "@/components/ui/TopBarSearch";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchAPI } from "@/utils/fetchAPI";

const searchOptions = [
  { label: "Bank Performance", path: "/BankPerformance" },
  { label: "Branch Performance", path: "/BranchPerformance" },
  { label: "Employee Performance", path: "/EmployeePerformance" },
  { label: "Settings", path: "/settings" },
];


export default function GiveAccessPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [language, setLanguage] = useState("English (US)");
  const [profileImage, setProfileImage] = useState("/user-avatar.png");
  const [notifications, setNotifications] = useState(["Hania Requested Access ", "Alex Branch peformance as been updated!"]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [flag, setFlag] = useState("/flags/us.png"); // Default flag
  const [isClient, setIsClient] = useState(false);


  const changeLanguage = (lang: string) => {
    if (lang === "Eng (US)") {
      setLanguage("Eng (US)");
      setFlag("/flags/us.png");
    } else {
      setLanguage("Arabic");
      setFlag("/flags/eg.png");
    }
  };

// inside SettingsPage component:
useEffect(() => {
    setIsClient(true);
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

  return (

   < div className="flex min-h-screen w-full"> 
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
        className="text-left hover:bg-gray-100 p-2 rounded-md cursor-pointer"
        onClick={() => router.push("/EmployeePerformance")}
      >
        👨‍💼 Employee Performance
      </button>
      <button
       className="text-left bg-indigo-600 text-white p-2 rounded-md cursor-pointer"
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
                  <DropdownMenuItem onClick={() => changeLanguage("Eng (US)")} className="flex items-center gap-2 cursor-pointer">
                    <Image src="/flags/us.png" alt="English" width={30} height={30} className="rounded-full" />
                    Eng (US)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("Arabic")} className="flex items-center gap-2 cursor-pointer">
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
                  <AvatarImage src="/flags/logo.png" />
                  <AvatarFallback>USER</AvatarFallback>
                </Avatar>
                <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{role}</p>
                <p className="text-xs text-gray-500">{firstName} {lastName}</p>
                </div>
              </div>
            </div>
              </div>

      

        {/* Main Content */}
        <main className="flex-1 p-8">
       
       




          {/* Tabs */}
          <Tabs defaultValue="Edit" className=" mt-7">
           

            {/* My Details Tab */}
            <TabsContent value="Edit" className="p-4 bg-white rounded-lg shadow-md">
  <div className="max-w-3xl mx-auto space-y-6">
    {/* Your form grid starts here */}
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <Label className="mb-1 block">Employee ID</Label>
        <Input placeholder="Enter ID" className="pl-3 mt-1" />
      </div>

      <div className="space-y-4">
        <Label className="mb-1 block">Role</Label>
        <Input placeholder="Admin / Manager / User" className="pl-3 mt-1" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div>
        <Label className="mb-1 block">Email</Label>
        <Input type="email" placeholder="Enter email address" className="pl-3 mt-1" />
      </div>
      <div>
        <Label className="mb-1 block">Password</Label>
        <Input type="password" placeholder="Set password" className="pl-3 mt-1" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div>
        <Label className="mb-1 block">Bank ID</Label>
        <Input placeholder="Enter Bank UUID" className="pl-3 mt-1" />
      </div>
      <div>
        <Label className="mb-1 block">Branch ID</Label>
        <Input placeholder="Enter Branch UUID" className="pl-3 mt-1" />
      </div>
    </div>

    <div>
      <Button className="  w-full bg-indigo-600 text-white">Give Access</Button>
    </div>
  </div>
</TabsContent>


           


          </Tabs>
        </main>
      </div>
    </div>
  );
}
