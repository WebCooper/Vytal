"use client";
import Link from "next/link";
import React, { useState } from "react";
import { FaUser, FaLock, FaGoogle, FaFacebookF, FaLinkedinIn, FaPhone } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function SignUp() {
  const [role, setRole] = useState("");
  const [category, setCategory] = useState("");
  const pathname = usePathname();
  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-white to-emerald-700 px-2" style={{ perspective: 1200 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full max-w-2xl min-h-[550px] flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/30"
          >
            {/* Green Accent Panel */}
            <div className="relative bg-emerald-700/80 backdrop-blur-md flex flex-col justify-center items-center p-10 md:w-1/2 w-full text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/60 rounded-bl-[80px] hidden md:block" />
              <h2 className="text-3xl font-extrabold tracking-wide mb-2 text-center font-sans">Welcome!</h2>
              <p className="mb-6 text-center text-emerald-100 font-sans">Already have an account?</p>
              <Link href="/auth/signin" className="border border-white rounded-lg px-6 py-2 font-semibold hover:bg-white hover:text-emerald-700 transition font-sans">Login</Link>
            </div>
            {/* Form Panel */}
            <div className="flex-1 flex flex-col justify-center p-8 bg-white/80 backdrop-blur-md">
              <h2 className="text-3xl font-extrabold mb-6 text-center tracking-wider font-sans bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent drop-shadow-lg">Sign Up</h2>
              <form className="flex flex-col gap-3">
                <div className="relative">
                  <input type="text" placeholder="Name" className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 text-base text-black placeholder-gray-700 bg-white/80 transition-all duration-200 shadow-sm focus:shadow-md" required />
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                </div>
                <div className="relative">
                  <input type="tel" placeholder="Phone Number" className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 text-base text-black placeholder-gray-700 bg-white/80 transition-all duration-200 shadow-sm focus:shadow-md" required />
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                </div>
                <div className="relative">
                  <input type="email" placeholder="Email" className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 text-base text-black placeholder-gray-700 bg-white/80 transition-all duration-200 shadow-sm focus:shadow-md" required />
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                </div>
                <div className="relative">
                  <input type="password" placeholder="Password" className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 text-base text-black placeholder-gray-700 bg-white/80 transition-all duration-200 shadow-sm focus:shadow-md" required />
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                </div>
                <div className="flex gap-2">
                  <select className="flex-1 px-3 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 text-base text-black bg-white/80 transition-all duration-200 shadow-sm focus:shadow-md" value={role} onChange={e => setRole(e.target.value)} required>
                    <option value="" disabled>Role</option>
                    <option value="donor">Donor</option>
                    <option value="receiver">Receiver</option>
                  </select>
                  <select className="flex-1 px-3 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 text-base text-black bg-white/80 transition-all duration-200 shadow-sm focus:shadow-md" value={category} onChange={e => setCategory(e.target.value)} required>
                    <option value="" disabled>Category</option>
                    <option value="organs">Organs</option>
                    <option value="medicines">Medicines</option>
                    <option value="blood">Blood</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200">Register</button>
                <div className="flex items-center my-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="mx-2 text-gray-400 text-xs">or register with social platforms</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="flex gap-2 justify-center">
                  <button type="button" className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow hover:ring-2 hover:ring-emerald-400 hover:scale-110 transition-all duration-200"><FaGoogle className="text-emerald-500 text-lg" /></button>
                  <button type="button" className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow hover:ring-2 hover:ring-emerald-400 hover:scale-110 transition-all duration-200"><FaFacebookF className="text-emerald-500 text-lg" /></button>
                  <button type="button" className="flex items-center justify-center bg-white rounded-full w-10 h-10 shadow hover:ring-2 hover:ring-emerald-400 hover:scale-110 transition-all duration-200"><FaLinkedinIn className="text-emerald-500 text-lg" /></button>
                </div>
              </form>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 