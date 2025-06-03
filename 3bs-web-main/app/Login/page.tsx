"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📤 Attempting login with:", { email, password });

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("📥 Parsed response data:", data);

      if (!response.ok) {
        console.error("❌ Login failed:", data);
        throw new Error(data?.error?.message || data.message || "Login failed");
      }

      // No need to store in localStorage anymore
      console.log("✅ Login success. Navigating to settings...");
      router.push("/settings");
    } catch (err: any) {
      console.error("❌ Login error caught in catch:", err);
      setError("Login Failed: " + (err.message || ""));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="flex w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Section */}
        <div className="w-1/2 bg-white p-10">
          <div className="flex justify-center items-center">
            <Image src="/flags/3bs.png" alt="3bs Logo" width={150} height={150} />
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="example@gmail.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="******** "
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-md"
            >
              Log In
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>

          <div className="mt-6 text-sm text-right text-indigo-600 cursor-pointer hover:underline">
            Can’t log in?
          </div>
          <div className="text-xs text-gray-400 mt-16">
            Warning: For authorized use only. Accessing or using this system constitutes consent to monitoring.
          </div>
        </div>

        {/* Right Section */}
        <div className="w-1/2 relative bg-gradient-to-tr from-purple-800 via-indigo-700 to-pink-500 text-white flex items-center justify-center p-10">
          <div className="absolute inset-0 opacity-20">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="/flags/moving.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl">Welcome to <span className="font-bold">3Bs'</span></h1>
            <p className="mt-2 text-xl text-white/75">Performance Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
