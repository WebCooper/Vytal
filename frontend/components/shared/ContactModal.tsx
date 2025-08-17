'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPhone, FaEnvelope, FaUser, FaPaperPlane } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { Post } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, post }) => {
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Here you would typically send the message to your backend
    console.log('Contact message:', {
      postId: post.id,
      recipientId: post.user.id,
      senderName,
      senderEmail,
      senderPhone,
      message
    });
    
    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setMessage('');
    setSenderName('');
    setSenderEmail('');
    setSenderPhone('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-6 rounded-t-3xl text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Contact Recipient</h2>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                      {post.user.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold">{post.user.name}</span>
                        {post.user.verified && <MdVerified className="text-white" />}
                      </div>
                      <p className="text-emerald-100 text-sm">{post.user.email}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            {/* Post Info */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-emerald-700 mb-2">About this request:</h3>
              <p className="text-gray-600 mb-3">{post.title}</p>
              <p className="text-sm text-gray-500">{post.content.substring(0, 150)}...</p>
              
              {post.contact && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl">
                  <h4 className="font-semibold text-emerald-700 mb-2 flex items-center">
                    <FaPhone className="mr-2" />
                    Direct Contact Information
                  </h4>
                  <p className="text-emerald-600">{post.contact}</p>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Send a Message</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline mr-1" />
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-1" />
                      Your Email *
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-1" />
                    Your Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-gray-900 bg-white"
                    placeholder="How can you help with this request? Please provide details about your offer..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;