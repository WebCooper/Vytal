import React from 'react'
import { motion } from "framer-motion";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

const Testimonials = () => {

  const testimonials = [
    {
      name: "Shanthi Rathnayaka",
      role: "Organ Recipient",
      text: "Vytal gave me a second chance at life. The community here is incredible.",
      rating: 5
    },
    {
      name: "Dr. Pubudu Silva",
      role: "Medical Professional",
      text: "The platform streamlines the donation process beautifully. Highly recommended.",
      rating: 5
    },
    {
      name: "Saman Kumara",
      role: "Blood Donor",
      text: "Making regular donations has never been easier. The impact tracking is amazing.",
      rating: 5
    }
  ];  
  
  return (
    <div>
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              Stories of Hope
            </h3>
            <p className="text-xl text-emerald-800 max-w-3xl mx-auto">
              Real stories from our community members
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 relative"
              >
                <FaQuoteLeft className="text-3xl text-teal-400 mb-4" />
                <p className="text-gray-700 mb-6 italic leading-relaxed">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm mr-1" />
                  ))}
                </div>
                <div>
                  <h5 className="font-bold text-teal-700">{testimonial.name}</h5>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Testimonials