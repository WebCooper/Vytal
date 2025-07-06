"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50">
      <div className="w-full max-w-5xl bg-white/80 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Left: Form */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8">
            <Image src="/next.svg" alt="Logo" width={40} height={40} />
            <span className="text-2xl font-bold text-gray-800">Airspace</span>
          </div>
          <form className="flex flex-col gap-4">
            <label className="text-gray-700 font-medium">Email or Phone Number</label>
            <input
              type="text"
              placeholder="Enter your email or phone number"
              className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <label className="text-gray-700 font-medium mt-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition"
            >
              Sign In
            </button>
            <div className="flex items-center my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="mx-2 text-gray-400 text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <p className="text-center text-gray-600 text-sm mb-2">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">Sign up</Link>
            </p>
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg py-2 font-medium shadow-sm hover:bg-gray-50 transition">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /> Sign in with Google
            </button>
            <button className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2 font-medium shadow-sm hover:bg-blue-700 transition">
              <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-5 h-5 bg-white rounded-full" /> Sign in with Facebook
            </button>
            <button className="flex items-center justify-center gap-2 bg-black text-white rounded-lg py-2 font-medium shadow-sm hover:bg-gray-900 transition">
              <img src="https://www.svgrepo.com/show/448255/apple.svg" alt="Apple" className="w-5 h-5" /> Sign in with Apple
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-8">&copy; 2023 Airspace Corporation</p>
        </div>
        {/* Right: Illustration and Heading */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center leading-snug">
            Securely Upload And Store<br />Your Important Documents<br />With <span className="text-blue-500">Airspace!</span>
          </h2>
          <Image src="/globe.svg" alt="Cloud Illustration" width={300} height={200} />
        </div>
      </div>
    </div>
  );
}
