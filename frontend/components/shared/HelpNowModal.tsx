'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHeart, FaDollarSign, FaHandHoldingHeart, FaMapMarkerAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { Post, Category } from '../types';
import { getCategoryIcon, getCategoryColor } from '../utils';
import FundraiserProgressbar from './FundraiserProgressbar';
import { sendMessage, CreateMessageRequest } from '../../lib/messages';

interface HelpNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  currentUserId?: number; // Add this prop for the logged-in user ID
}

const HelpNowModal: React.FC<HelpNowModalProps> = ({ isOpen, onClose, post, currentUserId }) => {
  const [selectedHelpType, setSelectedHelpType] = useState<string>('');
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [helperName, setHelperName] = useState('');
  const [helperEmail, setHelperEmail] = useState('');
  const [helperPhone, setHelperPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CategoryIcon = getCategoryIcon(post.category);
  const predefinedAmounts = ['25', '50', '100', '250', '500'];

  const helpTypes = {
    'donation': {
      icon: FaDollarSign,
      title: 'Make a Donation',
      description: 'Contribute financially to this cause'
    },
    'volunteer': {
      icon: FaHandHoldingHeart,
      title: 'Volunteer Help',
      description: 'Offer your time and skills'
    },
    'resource': {
      icon: FaHeart,
      title: 'Provide Resources',
      description: 'Supply needed items or materials'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      alert('Please log in to offer help');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const helpAmount = selectedHelpType === 'donation' ? (customAmount || donationAmount) : null;
      const helpSubject = selectedHelpType === 'donation' 
        ? `Donation Offer: ${helpAmount} for ${post.title}`
        : `${helpTypes[selectedHelpType as keyof typeof helpTypes].title} for ${post.title}`;
      
      const helpContent = `
Type: ${helpTypes[selectedHelpType as keyof typeof helpTypes].title}
${helpAmount ? `Amount: ${helpAmount}` : ''}

Helper Information:
Name: ${helperName}
Email: ${helperEmail}
Phone: ${helperPhone}

Message:
${message}
      `;
      
      const messageData: CreateMessageRequest = {
        sender_id: currentUserId,
        receiver_id: post.user.id,
        post_id: post.id,
        subject: helpSubject,
        content: helpContent.trim(),
        message_type: 'help_offer'
      };
      
      await sendMessage(messageData);
      
      alert('Help offer sent successfully!');
      onClose();
      
      // Reset form
      setSelectedHelpType('');
      setDonationAmount('');
      setCustomAmount('');
      setHelperName('');
      setHelperEmail('');
      setHelperPhone('');
      setMessage('');
    } catch (error) {
      console.error('Error sending help offer:', error);
      alert('Failed to send help offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${getCategoryColor(post.category)} p-6 rounded-t-3xl text-white`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <CategoryIcon className="text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Help Now</h2>
                    <p className="text-white/90">{post.title}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                        {post.category.toUpperCase()}
                      </span>
                      <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                        {post.urgency.toUpperCase()} PRIORITY
                      </span>
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

            {/* Post Details */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                  {post.user.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-gray-800">{post.user.name}</span>
                    {post.user.verified && <MdVerified className="text-emerald-500" />}
                  </div>
                  <p className="text-sm text-gray-500">Requesting help</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{post.content}</p>
              
              {post.category === Category.FUNDRAISER && post.fundraiserDetails && (
                <div className="mb-4">
                  <FundraiserProgressbar {...post} />
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FaClock />
                  <span>Posted {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                {post.location && (
                  <div className="flex items-center space-x-1">
                    <FaMapMarkerAlt />
                    <span>{post.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Help Options */}
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">How would you like to help?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(helpTypes).map(([type, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedHelpType(type)}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        selectedHelpType === type
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <IconComponent className={`text-2xl mb-2 ${
                        selectedHelpType === type ? 'text-emerald-600' : 'text-gray-400'
                      }`} />
                      <h4 className="font-semibold text-gray-800 mb-1">{config.title}</h4>
                      <p className="text-sm text-gray-600">{config.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Donation Amount Selection */}
              {selectedHelpType === 'donation' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-3">Select donation amount</h4>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                    {predefinedAmounts.map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setDonationAmount(amount);
                          setCustomAmount('');
                        }}
                        className={`py-2 px-4 border-2 rounded-lg font-semibold transition-all ${
                          donationAmount === amount
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-emerald-300'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setDonationAmount('');
                        }}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Helper Information */}
              {selectedHelpType && (
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-gray-800">Your information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={helperName}
                        onChange={(e) => setHelperName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={helperEmail}
                        onChange={(e) => setHelperEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={helperPhone}
                      onChange={(e) => setHelperPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-gray-900 bg-white"
                      placeholder="Any additional information or questions..."
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedHelpType || isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <FaCheckCircle className="mr-2" />
                      {selectedHelpType === 'donation' ? 'Send Donation' : 'Offer Help'}
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

export default HelpNowModal;