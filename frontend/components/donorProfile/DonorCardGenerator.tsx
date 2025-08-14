import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaShare, FaTimes, FaHeartbeat, FaMapMarkerAlt, FaPhone, FaCopy, FaWhatsapp, FaQrcode, FaGift } from 'react-icons/fa';
import { MdBloodtype, MdLocalHospital, MdMedication, MdVolunteerActivism } from 'react-icons/md';

interface DonorCardGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'donor' | 'recipient';
  userData: unknown;
}

const DonorCardGenerator: React.FC<DonorCardGeneratorProps> = ({ isOpen, onClose }) => {
  const [cardData, setCardData] = useState({
    donorName: 'Rangana Viranin',
    bloodType: 'B+',
    donationType: 'Blood Donation',
    availability: 'Available Now',
    location: 'Kalutara, Sri Lanka',
    contactPerson: 'Rangana Viranin',
    primaryPhone: '094-869-624',
    secondaryPhone: '078-471-7407',
    relationship: 'Self',
    message: 'Willing to donate blood to help save lives. Available for emergency donations.',
    lastDonation: '3 months ago',
    donationCount: '12',
    urgency: 'available'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const generateDonorCard = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas not supported');
      }
      
      const scale = 3;
      canvas.width = 400 * scale;
      canvas.height = 500 * scale;
      
      ctx.scale(scale, scale);
      
      await drawDonorCard(ctx);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `donor-card-${cardData.donorName.replace(/\s+/g, '-')}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        setIsGenerating(false);
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Error generating donor card:', error);
      setIsGenerating(false);
      alert('Error generating card. Please try taking a screenshot instead.');
    }
  };

  const drawDonorCard = async (ctx: CanvasRenderingContext2D) => {
    const width = 400;
    const height = 500;
    
    // Main card background (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle card shadow/border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Header section (Green gradient for donor)
    const headerGradient = ctx.createLinearGradient(0, 0, width, 80);
    headerGradient.addColorStop(0, '#059669');
    headerGradient.addColorStop(1, '#047857');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, 80);
    
    // Header donor icon (white circle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(35, 40, 18, 0, 2 * Math.PI);
    ctx.fill();
    
    // Donor icon (heart symbol)
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('♥', 35, 47);
    
    // Gift icon (top right)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(365, 40, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('🎁', 365, 46);
    
    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Donation Offer Available', 65, 35);
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('Ready to Help & Save Lives', 65, 52);
    
    // Donor name (large, bold)
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(cardData.donorName, 25, 125);
    
    // Blood type badge (circular, green for donor)
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(350, 115, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DONOR', 350, 105);
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText(cardData.bloodType, 350, 125);
    
    // Message text
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(cardData.message, 25, 150);
    
    // Info grid section
    let currentY = 185;
    
    // Donation type (with icon)
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('🎁', 25, currentY);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Offering', 45, currentY);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(cardData.donationType, 45, currentY + 15);
    
    // Location info (with icon)
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('📍', 220, currentY);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Location', 240, currentY);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(cardData.location, 240, currentY + 15);
    
    currentY += 50;
    
    // Availability (with icon)
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('🕐', 25, currentY);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Availability', 45, currentY);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(cardData.availability, 45, currentY + 15);
    
    // Donation count (with icon)
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('🏆', 220, currentY);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Donations Made', 240, currentY);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(`${cardData.donationCount} times`, 240, currentY + 15);
    
    // Contact section background (green box)
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(15, 280, width - 30, 130);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1;
    ctx.strokeRect(15, 280, width - 30, 130);
    
    // Contact header
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📞 Contact for Donation', 25, 305);
    
    // Contact person
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Contact Person', 25, 330);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(cardData.contactPerson, 25, 345);
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial, sans-serif';
    ctx.fillText(`(${cardData.relationship})`, 25, 358);
    
    // Primary phone
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Primary Phone', 200, 330);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(cardData.primaryPhone, 200, 345);
    
    // Secondary phone
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Secondary Phone', 25, 380);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(cardData.secondaryPhone, 25, 395);
    
    // QR code area
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(310, 360, 50, 40);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(310, 360, 50, 40);
    ctx.setLineDash([]);
    
    // QR code icon and text
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⬜', 335, 380);
    ctx.font = '8px Arial, sans-serif';
    ctx.fillText('Scan to contact', 335, 395);
    
    // Footer section
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 420, width, 80);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 420, width, 80);
    
    // Vytal logo
    ctx.fillStyle = '#059669';
    ctx.fillRect(15, 435, 35, 35);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('V', 32.5, 457);
    
    // Footer text
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Powered by Vytal', 60, 447);
    ctx.font = '9px Arial, sans-serif';
    ctx.fillText(`ID: DON-${Math.floor(Math.random() * 10000)}`, 60, 460);
    
    // Watermark (subtle)
    ctx.fillStyle = 'rgba(5, 150, 105, 0.03)';
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(width/2, height/2);
    ctx.rotate(-Math.PI/6);
    ctx.fillText('DONOR', 0, 0);
    ctx.restore();
  };

  const generateCardBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      const scale = 3;
      canvas.width = 400 * scale;
      canvas.height = 500 * scale;
      ctx.scale(scale, scale);
      
      await drawDonorCard(ctx);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error generating card blob:', error);
      return null;
    }
  };

  const generateShareContent = () => {
    return {
      title: `${cardData.bloodType} Blood Donor Available - ${cardData.donorName}`,
      text: `*BLOOD DONOR AVAILABLE*

*Donor:* ${cardData.donorName}
*Blood Type:* ${cardData.bloodType}
*Location:* ${cardData.location}
*Offering:* ${cardData.donationType}
*Availability:* ${cardData.availability}
*Previous Donations:* ${cardData.donationCount} times
*Last Donation:* ${cardData.lastDonation}

*Contact Information:*
${cardData.contactPerson} (${cardData.relationship})
Primary: ${cardData.primaryPhone}
Secondary: ${cardData.secondaryPhone}

*Message:* ${cardData.message}

Ready to help save lives! Contact me if you need blood donation.

#BloodDonor #SaveALife #${cardData.bloodType}Blood #Vytal #LifeSaver

Generated via Vytal - Community Donation Platform`
    };
  };

  const copyToClipboard = async () => {
    const shareContent = generateShareContent();
    try {
      await navigator.clipboard.writeText(shareContent.text);
      alert('Donor card details copied to clipboard!');
      setShowShareMenu(false);
    } catch (error) {
      alert(`Please copy the details manually - ERROR: ${error}`);
      setShowShareMenu(false);
    }
  };

  const shareToWhatsApp = async () => {
    const cardBlob = await generateCardBlob();
    if (cardBlob) {
      const url = URL.createObjectURL(cardBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `donor-card-${cardData.donorName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      const shareContent = generateShareContent();
      try {
        await navigator.clipboard.writeText(shareContent.text);
        
        alert(`✅ READY FOR WHATSAPP!\n\n📥 Donor card image downloaded\n📋 Text copied to your clipboard\n\nNow:\n1. Open WhatsApp\n2. Select a chat or group\n3. Paste the text (Ctrl/Cmd+V)\n4. Click the attachment button (📎)\n5. Select the downloaded image\n6. Send both together!\n\nImage name: donor-card-${cardData.donorName.replace(/\s+/g, '-')}.png`);
        
      } catch (error) {
        alert(`✅ Image downloaded!\n\nImage saved as: donor-card-${cardData.donorName.replace(/\s+/g, '-')}.png\n\nFor WhatsApp:\n1. Copy the text from the form\n2. Open WhatsApp\n3. Paste text and attach the downloaded image ERROR : ${error}`);
      }
    } else {
      const shareContent = generateShareContent();
      const message = encodeURIComponent(shareContent.text);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
    setShowShareMenu(false);
  };

  const shareImageAndText = async () => {
    const cardBlob = await generateCardBlob();
    if (cardBlob) {
      const url = URL.createObjectURL(cardBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `donor-card-${cardData.donorName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      const shareContent = generateShareContent();
      try {
        await navigator.clipboard.writeText(shareContent.text);
        
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
          background: rgba(0,0,0,0.8); display: flex; align-items: center; 
          justify-content: center; z-index: 10000; font-family: system-ui;
        `;
        
        modal.innerHTML = `
          <div style="background: white; padding: 30px; border-radius: 20px; max-width: 500px; text-align: center;">
            <h2 style="color: #059669; margin-bottom: 20px;">🎉 Ready to Share!</h2>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              <p style="margin: 0; font-weight: bold; color: #0369a1;">✅ Donor card image downloaded</p>
              <p style="margin: 5px 0 0 0; font-weight: bold; color: #0369a1;">✅ Text copied to clipboard</p>
            </div>
            <div style="text-align: left; background: #f9fafb; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              <p style="font-weight: bold; margin: 0 0 10px 0;">📱 How to share on WhatsApp:</p>
              <p style="margin: 5px 0;">1. Open WhatsApp on your phone/computer</p>
              <p style="margin: 5px 0;">2. Select the contact or group</p>
              <p style="margin: 5px 0;">3. Paste the text (Ctrl+V or Cmd+V)</p>
              <p style="margin: 5px 0;">4. Click the attachment button (📎)</p>
              <p style="margin: 5px 0;">5. Choose "Photos & Media"</p>
              <p style="margin: 5px 0;">6. Select the downloaded donor card image</p>
              <p style="margin: 5px 0;">7. Send both message and image together!</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #059669; color: white; padding: 12px 24px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">
              Got it! 👍
            </button>
          </div>
        `;
        
        document.body.appendChild(modal);
        
      } catch (error) {
        alert(`📥 Donor card image downloaded!\n\nCheck your Downloads folder for the image file.\nThen manually copy the text and share both on WhatsApp. ERROR : ${error}`);
      }
    }
    setShowShareMenu(false);
  };

  const quickWhatsAppText = () => {
    const shareContent = generateShareContent();
    const message = encodeURIComponent(shareContent.text);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setShowShareMenu(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden max-h-[95vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-4 text-white flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Donor Card Generator</h2>
                <p className="text-emerald-100 text-sm">Create professional donor offer cards to share your willingness to help</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Form Section */}
            <div className="lg:w-2/5 p-4 overflow-y-auto border-r border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Donor Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name *</label>
                  <input
                    type="text"
                    value={cardData.donorName}
                    onChange={(e) => setCardData({...cardData, donorName: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Rangana Viranin"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type *</label>
                    <div className="relative">
                      <select
                        value={cardData.bloodType}
                        onChange={(e) => setCardData({...cardData, bloodType: e.target.value})}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <MdBloodtype className="text-lg text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Donation Count</label>
                    <input
                      type="text"
                      value={cardData.donationCount}
                      onChange={(e) => setCardData({...cardData, donationCount: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., 12"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donation Type *</label>
                  <select
                    value={cardData.donationType}
                    onChange={(e) => setCardData({...cardData, donationType: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Blood Donation">Blood Donation</option>
                    <option value="Platelet Donation">Platelet Donation</option>
                    <option value="Plasma Donation">Plasma Donation</option>
                    <option value="Organ Donation">Organ Donation</option>
                    <option value="Bone Marrow">Bone Marrow</option>
                    <option value="Financial Support">Financial Support</option>
                    <option value="Medical Equipment">Medical Equipment</option>
                    <option value="Medicine Donation">Medicine Donation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    value={cardData.message}
                    onChange={(e) => setCardData({...cardData, message: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    placeholder="e.g., Willing to donate blood to help save lives. Available for emergency donations."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardData.location}
                        onChange={(e) => setCardData({...cardData, location: e.target.value})}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pl-8"
                        placeholder="e.g., Kalutara, Sri Lanka"
                      />
                      <FaMapMarkerAlt className="absolute left-2 top-2.5 text-gray-500 text-sm" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <select
                      value={cardData.availability}
                      onChange={(e) => setCardData({...cardData, availability: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="Available Now">Available Now</option>
                      <option value="Available This Week">Available This Week</option>
                      <option value="Available Weekends">Available Weekends</option>
                      <option value="Emergency Only">Emergency Only</option>
                      <option value="By Appointment">By Appointment</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation</label>
                  <input
                    type="text"
                    value={cardData.lastDonation}
                    onChange={(e) => setCardData({...cardData, lastDonation: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., 3 months ago"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={cardData.contactPerson}
                    onChange={(e) => setCardData({...cardData, contactPerson: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Rangana Viranin"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={cardData.primaryPhone}
                        onChange={(e) => setCardData({...cardData, primaryPhone: e.target.value})}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pl-8"
                        placeholder="094-869-624"
                      />
                      <FaPhone className="absolute left-2 top-2.5 text-gray-500 text-sm" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={cardData.secondaryPhone}
                        onChange={(e) => setCardData({...cardData, secondaryPhone: e.target.value})}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pl-8"
                        placeholder="078-471-7407"
                      />
                      <FaPhone className="absolute left-2 top-2.5 text-gray-500 text-sm" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <select
                    value={cardData.relationship}
                    onChange={(e) => setCardData({...cardData, relationship: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Self">Self</option>
                    <option value="Family Member">Family Member</option>
                    <option value="Husband">Husband</option>
                    <option value="Wife">Wife</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Friend">Friend</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:w-3/5 p-4 bg-gradient-to-br from-emerald-50 to-gray-50 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">Professional Donor Card</h3>
                <div className="text-xs text-gray-500">
                  High-Quality PNG Download
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="w-full max-w-sm mx-auto mb-4">
                  <div 
                    ref={cardRef}
                    className="bg-white rounded-xl shadow-xl overflow-hidden border-4 border-white transform hover:scale-105 transition-transform duration-300"
                    style={{ aspectRatio: '4/5' }}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-3 relative">
                      <div className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-full">
                        <FaGift className="text-white text-lg" />
                      </div>
                      <div className="flex items-center">
                        <div className="bg-white p-1.5 rounded-lg mr-2">
                          <MdVolunteerActivism className="text-emerald-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm">Donation Offer Available</h3>
                          <p className="text-emerald-100 text-xs">Ready to Help & Save Lives</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-3 relative">
                      {/* Subtle watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <FaHeartbeat className="text-6xl text-emerald-500" />
                      </div>
                      
                      {/* Donor Info */}
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-2">
                            <h2 className="text-lg font-bold text-gray-800 leading-tight">{cardData.donorName}</h2>
                            <p className="text-gray-600 text-xs mt-1">{cardData.message}</p>
                          </div>
                          
                          {/* Blood Type Badge */}
                          <div className="bg-emerald-500 text-white rounded-full w-12 h-12 flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold">DONOR</span>
                            <span className="text-sm font-bold">{cardData.bloodType}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="flex items-start">
                            <FaGift className="text-emerald-600 mt-0.5 mr-1 flex-shrink-0" />
                            <div>
                              <p className="text-gray-500 font-medium">Offering</p>
                              <p className="font-semibold text-gray-800 leading-tight">{cardData.donationType}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <FaMapMarkerAlt className="text-emerald-600 mt-0.5 mr-1 flex-shrink-0" />
                            <div>
                              <p className="text-gray-500 font-medium">Location</p>
                              <p className="font-semibold text-gray-800 leading-tight">{cardData.location}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <FaHeartbeat className="text-emerald-500 mt-0.5 mr-1 flex-shrink-0" />
                            <div>
                              <p className="text-gray-500 font-medium">Availability</p>
                              <p className="font-semibold text-emerald-600">{cardData.availability}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <MdVolunteerActivism className="text-emerald-500 mt-0.5 mr-1 flex-shrink-0" />
                            <div>
                              <p className="text-gray-500 font-medium">Donations Made</p>
                              <p className="font-semibold text-emerald-600">{cardData.donationCount} times</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Contact Section */}
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                          <h4 className="font-bold text-emerald-700 mb-2 flex items-center text-sm">
                            <FaPhone className="mr-1.5 text-xs" />
                            Contact for Donation
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-600 font-medium">Contact Person</p>
                              <p className="font-semibold text-gray-800 leading-tight">{cardData.contactPerson}</p>
                              <p className="text-gray-500 text-xs">({cardData.relationship})</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-600 font-medium">Primary Phone</p>
                              <p className="font-semibold text-gray-800">{cardData.primaryPhone}</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-600 font-medium">Secondary Phone</p>
                              <p className="font-semibold text-gray-800">{cardData.secondaryPhone}</p>
                            </div>
                            
                            <div className="flex items-end justify-end">
                              <div className="bg-white p-1.5 rounded border">
                                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded w-10 h-10 flex items-center justify-center">
                                  <FaQrcode className="text-gray-400 text-lg" />
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5 text-center">Scan</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="bg-gray-50 p-2 border-t border-gray-200 flex justify-between items-center text-xs">
                      <div className="flex items-center">
                        <div className="bg-emerald-600 text-white rounded w-6 h-6 flex items-center justify-center mr-1.5 font-bold">
                          V
                        </div>
                        <p className="text-gray-600 font-medium">Powered by Vytal</p>
                      </div>
                      <p className="text-gray-500">ID: DON-{Math.floor(Math.random() * 10000)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="w-full max-w-sm mx-auto space-y-2">
                  <button
                    onClick={generateDonorCard}
                    disabled={isGenerating || !cardData.donorName || !cardData.primaryPhone}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <FaDownload className="mr-2" />
                    {isGenerating ? 'Generating PNG...' : 'Download Donor Card'}
                  </button>
                  
                  <button
                    onClick={() => setShowShareMenu(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  >
                    <FaShare className="mr-2" />
                    Share Donor Details
                  </button>
                </div>
                
                {/* Instructions */}
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg max-w-sm mx-auto">
                  <p className="text-sm text-emerald-800 text-center">
                    <strong>✨ Perfect Match:</strong> The downloaded PNG will look exactly like the preview above - professional, clean, and ready for sharing your donation offer!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Share Menu Modal */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl border border-white/30 p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Share Donor Offer</h3>
              <button
                onClick={() => setShowShareMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={shareImageAndText}
                className="w-full flex items-center space-x-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border-2 border-emerald-200"
              >
                <div className="flex items-center space-x-1">
                  <FaDownload className="text-emerald-600 text-sm" />
                  <FaCopy className="text-emerald-600 text-sm" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-emerald-800 block">Download Image + Copy Text</span>
                  <span className="text-emerald-600 text-xs">Best for WhatsApp sharing</span>
                </div>
              </button>

              <button
                onClick={shareToWhatsApp}
                className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
              >
                <FaWhatsapp className="text-green-600 text-lg" />
                <div className="text-left">
                  <span className="font-medium text-green-800 block">WhatsApp Ready</span>
                  <span className="text-green-600 text-xs">Image + text with instructions</span>
                </div>
              </button>

              <button
                onClick={quickWhatsAppText}
                className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <FaShare className="text-blue-600 text-lg" />
                <div className="text-left">
                  <span className="font-medium text-blue-800 block">Quick Text Share</span>
                  <span className="text-blue-600 text-xs">Text only to WhatsApp</span>
                </div>
              </button>

              <button
                onClick={copyToClipboard}
                className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FaCopy className="text-gray-600 text-lg" />
                <span className="font-medium text-gray-800">Copy Text to Clipboard</span>
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Pro Tip:</strong> Use "Download Image + Copy Text" → Follow the step-by-step instructions → Share both image and text on WhatsApp to let people know you're available to help!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default DonorCardGenerator;