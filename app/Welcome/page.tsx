"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import TopBarSearch from "@/components/ui/TopBarSearch";

const slideshowItems = [
  { src: "/flags/bankk.jpg", path: "/BankPerformance", alt: "Bank Performance" },
  { src: "/flags/branchh.png", path: "/BranchPerformance", alt: "Branch Performance" },
  { src: "/flags/s5.png", path: "/EmployeePerformance", alt: "Employee Performance" },
  { src: "/flags/s6.png", path: "/GiveAccess", alt: "Give Access" },
  { src: "/flags/s1.jpg", path: "/settings", alt: "Settings" },
];

export default function Welcome() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("User");
  const [language, setLanguage] = useState("English (US)");
  const [flag, setFlag] = useState("/flags/us.png");
  const [notifications, setNotifications] = useState([
    "Hania Requested Access",
    "Alex Branch performance updated!",
  ]);
  const [slideIndex, setSlideIndex] = useState(0);

  const nextSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % slideshowItems.length);
  };

  const prevSlide = () => {
    setSlideIndex((prevIndex) =>
      prevIndex === 0 ? slideshowItems.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/user", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data?.data?.user;
        if (user?.fullName) {
          const [first, ...rest] = user.fullName.split(" ");
          setFirstName(first);
          setLastName(rest.join(" "));
        }
        if (user?.role) setRole(user.role);
      })
      .catch((err) => console.error("❌ Failed to fetch user", err));
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

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      

      {/* Overlay Content */}
      <div className="relative z-10 p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center bg-white bg-opacity-80 p-4 rounded-lg shadow-md mb-6">
          <div className="w-72">
            <TopBarSearch />
          </div>
          <div className="flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">
                <Image src={flag} alt="flag" width={30} height={30} className="rounded-full" />
                <span className="text-gray-700 font-medium">{language}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changeLanguage("Eng (US)")}>🇺🇸 Eng (US)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("Arabic")}>🇪🇬 Arabic</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="relative cursor-pointer">
                <Bell className="text-gray-700" size={24} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {notifications.length > 0 ? (
                  notifications.map((notif, i) => (
                    <DropdownMenuItem key={i}>{notif}</DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem>No new notifications</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10 border">
                <AvatarImage src="/flags/logo.png" />
                <AvatarFallback>CEO</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{role}</p>
                <p className="text-xs text-gray-600">{firstName} {lastName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Slideshow Controls and Slide */}
        <div className="flex justify-center items-center mt-16 gap-6">
          <button onClick={prevSlide} className=" cursor-pointer bg-white/80 p-2 rounded-full shadow-md hover:bg-white">
            <ChevronLeft size={32} />
          </button>

          <div className="relative cursor-pointer max-w-4xl w-full h-[400px] border-4 border-white rounded-xl overflow-hidden shadow-xl" onClick={() => router.push(slideshowItems[slideIndex].path)}>
            <Image
              src={slideshowItems[slideIndex].src}
              alt={slideshowItems[slideIndex].alt}
              width={1200}
              height={400}
              className="w-full h-full object-cover cursor-pointer"
            />
            
          </div>
          <div className="absolute bottom-1 w-full flex justify-center cursor-pointer">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(slideshowItems[slideIndex].path);
                }}
                className=" cursor-pointer bg-gray-300 text-gray-800 px-6 py-2 rounded-md shadow-md hover:bg-indigo-100"
              >
                {slideshowItems[slideIndex].alt}
              </button>
            </div>

          <button onClick={nextSlide} className=" cursor-pointer bg-white/80 p-2 rounded-full shadow-md hover:bg-white">
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}
