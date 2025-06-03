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
import { Phone } from "lucide-react";

const searchOptions = [
  { label: "Bank Performance", path: "/BankPerformance" },
  { label: "Branch Performance", path: "/BranchPerformance" },
  { label: "Employee Performance", path: "/EmployeePerformance" },
  { label: "Settings", path: "/settings" },
  { label: "View All Employees", path: "/ViewAll" },
  // add more as needed
];


export default function SettingsPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [language, setLanguage] = useState("English (US)");
  const [profileImage, setProfileImage] = useState("/user-avatar.png");
  const [notifications, setNotifications] = useState(["Hania Requested Access ", "Alex Branch peformance as been updated!"]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [flag, setFlag] = useState("/flags/us.png"); // Default flag



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
        className="text-left bg-indigo-600 text-white p-2 rounded-md"
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
                  <AvatarImage src="/flags/logo.png" />
                  <AvatarFallback>CEO</AvatarFallback>
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
        <div className="h-65 rounded-lg bg-cover bg-center bg-[url('/flags/bg.png')]"></div>
        <div className="relative -top-10 flex flex-col items-start ml-6">
        <Avatar className=" items-start w-30 h-30 border-5 border-white">
              <AvatarImage src="/flags/logo.png" />
              <AvatarFallback>CEO</AvatarFallback>
            </Avatar>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="Edit" className=" -mt-7">
            <TabsList className="flex space-x-4  pb-2 bg-white">
              <TabsTrigger value="Edit">Edit Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              
            </TabsList>

            {/* My Details Tab */}
            <TabsContent value="Edit" className="p-4 bg-white rounded-lg shadow-md">
              <div className="grid grid-cols-2 gap-9">
                <div className="space-y-4">
                  <Label className="mb-1 block ">First name</Label>
                  <Input
  value={firstName}
  onChange={(e) => setFirstName(e.target.value)}
  className="pl-3 mt-3"
/>


                </div>
                <div className="space-y-4">
                <Label className="mb-1 block">Last name</Label>
                <Input
  value={lastName}
  onChange={(e) => setLastName(e.target.value)}
  className="pl-3 mt-3"
/>                </div>
              </div>

           {/* Change Email Section */}
<div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="relative">
    <Label className="mb-1 block">Old Email</Label>
    <Mail className=" mt-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
    <Input
      type="email"
      placeholder="Confirm old email"
      className="pl-9 mt-2"
      // onChange or value handling here
    />
  </div>
  <div className="relative">
    <Label className="mb-1 block">New Email</Label>
    <Mail className=" mt-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
    <Input
      type="email"
      placeholder="Enter new email"
      className="pl-9 mt-2"
      // onChange or value handling here
    />
  </div>
</div>

{/* Change Phone Section */}
<div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="relative">
    <Label className="mb-1 block">Old Phone Number</Label>
    <Phone className=" mt-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
    <Input
      type="tel"
      placeholder="Confirm old phone"
      className="pl-9 mt-2"
      // onChange or value handling here
    />
  </div>
  <div className="relative">
    <Label className="mb-1 block">New Phone Number</Label>
    <Phone className="mt-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
    <Input
      type="tel"
      placeholder="Enter new phone"
      className="pl-9 mt-2"
      // onChange or value
      />
      </div>
    </div>

              {/* Upload Profile Image */}
              <div className="mt-7">
                <Label className="mb-1 block">Upload Profile Picture</Label>
                <div className="border-dashed border-2 border-gray-300 p-6 flex flex-col items-center justify-center cursor-pointer">
                  <UploadCloud className="text-gray-400 mt-3" />
                  <p className="text-gray-500 text-sm">Click to upload or drag and drop</p>
                  <p className="text-gray-400 text-xs">SVG, PNG, JPG or GIF (max, 800x400px)</p>

                </div>
              </div>

             
             

              {/* Save Button */}
              <div className="mt-6 items-center justify-center ">
                <Button className="w-full bg-indigo-600 text-white">Save Changes</Button>
              </div>
            </TabsContent>
            <TabsContent value="password" className="p-4 bg-white rounded-lg shadow-md">
  {/* Old Password - full width row */}
  <div className="mb-6">
    <Label className="mb-1 block">Old Password</Label>
    <Input type="password" placeholder="Enter old password" className="mt-2" />
  </div>

  {/* New and Re-enter Password - side by side */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <Label className="mb-1 block">New Password</Label>
      <Input type="password" placeholder="New password" className="mt-2" />
    </div>
    <div>
      <Label className="mb-1 block">Re-enter New Password</Label>
      <Input type="password" placeholder="Confirm new password" className="mt-2" />
    </div>
  </div>
</TabsContent>


          </Tabs>
        </main>
      </div>
    </div>
  );
}
