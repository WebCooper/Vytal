'use client';

import React from "react";
import Header from "@/components/shared/Header";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Footer from "@/components/shared/Footer";
import About from "@/components/home/About";
import Testimonials from "@/components/home/Testimonials";
import Contact from "@/components/home/Contact";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-white to-emerald-700">
      <Header />

      <Hero />
      <Services />
      <About />
      <Testimonials />
      <Contact />

      <Footer />
    </div>
  )
} 