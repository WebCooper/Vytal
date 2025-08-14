import React from 'react'
import { motion } from "framer-motion";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import Link from 'next/link';

const Contact = () => {
  return (
    <div>
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-12 text-center"
          >
            <h3 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              Get in Touch
            </h3>
            <p className="text-xl text-gray-700 mb-8">
              Ready to make a difference? Join our community today.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center">
                <FaPhone className="text-3xl text-emerald-500 mb-4" />
                <h4 className="font-bold text-emerald-700 mb-2">Call Us</h4>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
              <div className="flex flex-col items-center">
                <FaEnvelope className="text-3xl text-emerald-500 mb-4" />
                <h4 className="font-bold text-emerald-700 mb-2">Email Us</h4>
                <p className="text-gray-600">support@vytal.com</p>
              </div>
              <div className="flex flex-col items-center">
                <FaMapMarkerAlt className="text-3xl text-emerald-500 mb-4" />
                <h4 className="font-bold text-emerald-700 mb-2">Visit Us</h4>
                <p className="text-gray-600">123 Health St, Medical City</p>
              </div>
            </div>

            <Link href="/community" passHref>
              <button className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200">
                Join Vytal Today
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Contact