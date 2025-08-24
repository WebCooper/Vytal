"use client";
import Link from "next/link";
import React, { useState } from "react";
import { FaUser, FaLock, FaShieldAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { axiosInstance, setAdminAuthorizationToken } from "@/lib/axiosInstance";

export default function AdminLogin() {
  const pathname = usePathname();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const [localLoading, setLocalLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLocalLoading(true);

    try {
      const res = await axiosInstance.post("/login", formData, { withCredentials: true });
      const user = res?.data?.data?.user;
      const token = res?.data?.data?.token;
      if (!user || user.role !== 'admin') {
        setError("Not authorized");
        setLocalLoading(false);
        return;
      }
      // Store user and token for authenticated admin API calls
      localStorage.setItem('vytal_admin_user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('vytal_admin_token', token);
        setAdminAuthorizationToken(token);
      }
      window.location.replace("/admin/dashboard");
  } catch (err: unknown) {
      console.error("Error during admin login:", err);
      setError("Invalid credentials");
      setLocalLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-white to-blue-700 px-2" style={{ perspective: 1200 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full max-w-2xl min-h-[550px] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/30"
          >
            {/* Blue Accent Panel */}
            <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 flex flex-col justify-center items-center p-10 md:w-1/2 w-full text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/40 rounded-bl-[80px] hidden md:block" />
              <FaShieldAlt className="text-6xl mb-4 text-white" />
              <h2 className="text-3xl font-extrabold tracking-wide mb-2 text-center font-sans">Admin Portal</h2>
              <p className="mb-6 text-center text-blue-100 font-sans">Secure administrative access</p>
              <Link href="/" className="border border-white/50 rounded-lg px-6 py-2 font-semibold hover:bg-white/20 hover:text-white transition backdrop-blur-md font-sans">Back to Site</Link>
            </div>
            {/* Form Panel */}
            <div className="flex-1 flex flex-col justify-center p-8 bg-white/50 backdrop-blur-md">
              <h2 className="text-3xl font-extrabold mb-6 text-center tracking-wider font-sans bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent drop-shadow-lg">Admin Login</h2>
              {error && <div className="text-red-600 text-sm mb-4 text-center bg-red-100/80 p-3 rounded-lg border border-red-300/50 backdrop-blur-sm">{error}</div>}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Admin Email"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-base text-gray-700 placeholder-black bg-white/60 backdrop-blur-sm transition-all duration-200 shadow-sm focus:shadow-md"
                    required
                  />
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                </div>
                <div className="relative">
                  <input 
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Admin Password"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-white/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-base text-gray-700 placeholder-black bg-white/60 backdrop-blur-sm transition-all duration-200 shadow-sm focus:shadow-md"
                    required
                  />
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                </div>
                <div className="flex justify-between items-center mt-1 mb-2">
                  <div className="flex items-center text-xs text-blue-600">
                    <FaShieldAlt className="mr-1" />
                    Secure Access
                  </div>
                  <Link href="#" className="text-blue-600 text-xs hover:underline transition">Need help?</Link>
                </div>
                <button 
                  type="submit" 
                  disabled={localLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-xl hover:from-blue-600 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md border border-blue-400/30"
                >
                  {localLoading ? "Signing In..." : "Admin Login"}
                </button>
              </form>
                <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  This is a secure administrative portal. <br />
                  Unauthorized access is prohibited.
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
