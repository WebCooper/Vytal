'use client';
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaHandsHelping, FaUsers, FaShieldAlt, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

const Hero = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const stats = [
    { number: "10,000+", label: "Lives Saved", icon: FaHeart },
    { number: "25,000+", label: "Active Members", icon: FaUsers },
    { number: "50,000+", label: "Donations Made", icon: FaHandsHelping },
    { number: "99.9%", label: "Success Rate", icon: FaShieldAlt }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <section className="pt-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent leading-tight">
              Save Lives<br />Build Hope
            </h2>
            <p className="text-xl md:text-2xl text-emerald-800 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join Sri Lanka&apos;s largest medical support community. Connect donors and recipients for organs, medicines, and blood donations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/community?tab=requests">
              <button className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer">
                Start Donating <FaArrowRight className="ml-2" />
              </button>
            </Link>

            <Link href="/community?tab=donations">
              <button className="px-8 py-4 bg-white/80 backdrop-blur-md text-teal-700 font-bold rounded-xl border border-emerald-200 hover:bg-white hover:scale-105 transition-all duration-200 cursor-pointer">
                Find Support
              </button>
            </Link>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <AnimatePresence key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: currentStat === index ? 1 : 0.6, 
                      y: 0,
                      scale: currentStat === index ? 1.1 : 1
                    }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <stat.icon className={`text-4xl mx-auto mb-2 ${currentStat === index ? 'text-emerald-500' : 'text-emerald-400'}`} />
                    <div className={`text-3xl font-bold ${currentStat === index ? 'text-emerald-700' : 'text-emerald-600'} mb-1`}>
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </motion.div>
                </AnimatePresence>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Hero