import React from 'react'
import { motion } from "framer-motion";
import { FaHeart, FaUsers, FaShieldAlt } from "react-icons/fa";

const About = () => {
  return (
    <div>
      <section id="about" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                  About Vytal
                </h3>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Vytal is more than a platform—it&apos;s a movement. We&apos;re building Sri Lanka&apos;s largest medical support community, where generosity meets genuine need.
                </p>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Our secure, verified system ensures that every donation reaches those who need it most, creating a network of hope that spans the island.
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl hover:scale-105 hover:shadow-lg transition-all duration-200">
                  Learn More
                </button>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-teal-200 to-teal-400 rounded-3xl h-80 flex items-center justify-center">
                  <FaHeart className="text-6xl text-emerald-700" />
                </div>
                <div className="absolute -top-4 -right-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                  <FaShieldAlt className="text-2xl text-emerald-500" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                  <FaUsers className="text-2xl text-emerald-500" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About