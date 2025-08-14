import React from 'react'
import { MdBloodtype, MdLocalHospital, MdMedication } from "react-icons/md";
import { motion } from 'framer-motion';

const Services = () => {
  return (
    <div>
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              Our Services
            </h3>
            <p className="text-xl text-emerald-800 max-w-3xl mx-auto">
              Comprehensive medical support across three vital categories
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MdLocalHospital,
                title: "Organ Donation",
                description: "Connect with life-saving organ donors and recipients through our secure, verified platform.",
                color: "from-yellow-400 to-yellow-600"
              },
              {
                icon: MdMedication,
                title: "Medicine Support",
                description: "Share unused medications and find essential medicines through our community network.",
                color: "from-blue-400 to-blue-600"
              },
              {
                icon: MdBloodtype,
                title: "Blood Donation",
                description: "Promote blood-donation camps and connect with donors in your area for emergency needs.",
                color: "from-red-400 to-red-600"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 hover:scale-105 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                  <service.icon className="text-3xl text-white" />
                </div>
                <h4 className="text-2xl font-bold text-emerald-700 mb-4 text-center">{service.title}</h4>
                <p className="text-gray-600 text-center leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services