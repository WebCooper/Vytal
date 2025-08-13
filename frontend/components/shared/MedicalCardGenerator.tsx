import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaShare, FaTimes, FaHeartbeat, FaMapMarkerAlt, FaPhone, FaCopy, FaWhatsapp, FaQrcode } from 'react-icons/fa';
import { MdBloodtype, MdLocalHospital, MdMedication, MdVerified, MdEmergency } from 'react-icons/md';

interface MedicalCardGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'donor' | 'recipient';
  userData: any;
}

const MedicalCardGenerator: React.FC<MedicalCardGeneratorProps> = ({ isOpen, onClose, userType, userData }) => {
  const [cardData, setCardData] = useState({
    patientName: 'Rangana Viranin',
    bloodType: 'B+',
    condition: 'Surgery requiring blood transfusion',
    hospital: 'Kalutara Base Hospital',
    location: 'Kalutara, Sri Lanka',
    contactPerson: 'Sunil Wijeratne',
    primaryPhone: '094-869-624',
    secondaryPhone: '078-471-7407',
    relationship: 'Family Member',
    unitsNeeded: '2',
    requiredDate: 'ASAP - Today',
    urgency: 'high'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const generateMedicalCard = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    
    try {
      // Create canvas with exact dimensions matching the preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas not supported');
      }
      
      // Set canvas size to match preview card (higher resolution)
      const scale = 3;
      canvas.width = 400 * scale;
      canvas.height = 500 * scale;
      
      // Scale context for high resolution
      ctx.scale(scale, scale);
      
      // Draw the medical card to exactly match the preview
      await drawPreviewMatchingCard(ctx);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `medical-card-${cardData.patientName.replace(/\s+/g, '-')}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        setIsGenerating(false);
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Error generating medical card:', error);
      setIsGenerating(false);
      alert('Error generating card. Please try taking a screenshot instead.');
    }
  };

  const drawPreviewMatchingCard = async (ctx: CanvasRenderingContext2D) => {
    const width = 400;
    const height = 500;
    
    // Main card background (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle card shadow/border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Header section (Teal gradient)
    const headerGradient = ctx.createLinearGradient(0, 0, width, 80);
    headerGradient.addColorStop(0, '#14b8a6');
    headerGradient.addColorStop(1, '#0f766e');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, 80);
    
    // Header hospital icon (white circle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(35, 40, 18, 0, 2 * Math.PI);
    ctx.fill();
    
    // Hospital icon (cross symbol)
    ctx.fillStyle = '#14b8a6';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+', 35, 47);
    
    // Emergency icon (top right)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(365, 40, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText('!', 365, 46);
    
    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Medical Donation Request', 65, 35);
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('Urgent Blood Donation Needed', 65, 52);
    
    // Patient name (large, bold)
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(cardData.patientName, 25, 125);
    
    // Blood type badge (circular, red)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(350, 115, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BLOOD', 350, 105);
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText(cardData.bloodType, 350, 125);
    
    // Condition text
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(cardData.condition, 25, 150);
    
    // Info grid section
    let currentY = 185;
    
    // Hospital info (with icon)
    ctx.fillStyle = '#14b8a6';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('🏥', 25, currentY);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Hospital', 45, currentY);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(cardData.hospital, 45, currentY + 15);
    
    // Location info (with icon)
    ctx.fillStyle = '#14b8a6';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('📍', 220, currentY);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Location', 240, currentY);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(cardData.location, 240, currentY + 15);
    
    currentY += 50;
    
    // Units needed (with icon)
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('💓', 25, currentY);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Units Needed', 45, currentY);
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(`${cardData.unitsNeeded} units`, 45, currentY + 15);
    
    // Required by (with icon)
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('⏰', 220, currentY);
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Required By', 240, currentY);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(cardData.requiredDate, 240, currentY + 15);
    
    // Contact section background (teal box)
    ctx.fillStyle = '#f0fdfa';
    ctx.fillRect(15, 280, width - 30, 130);
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 1;
    ctx.strokeRect(15, 280, width - 30, 130);
    
    // Contact header
    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📞 Contact Information', 25, 305);
    
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
    ctx.fillText('Scan for contact', 335, 395);
    
    // Footer section
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 420, width, 80);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 420, width, 80);
    
    // Vytal logo
    ctx.fillStyle = '#14b8a6';
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
    ctx.fillText(`ID: MED-${Math.floor(Math.random() * 10000)}`, 60, 460);
    
    // Watermark (subtle)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.03)';
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(width/2, height/2);
    ctx.rotate(-Math.PI/6);
    ctx.fillText('URGENT', 0, 0);
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
      
      await drawPreviewMatchingCard(ctx);
      
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
      title: `URGENT ${cardData.bloodType} Blood Needed - ${cardData.patientName}`,
      text: `*URGENT BLOOD DONATION NEEDED*

*Patient:* ${cardData.patientName}
*Hospital:* ${cardData.hospital}
*Location:* ${cardData.location}
*Blood Type:* ${cardData.bloodType}
*Units Needed:* ${cardData.unitsNeeded}
*Required By:* ${cardData.requiredDate}

*Contact Information:*
${cardData.contactPerson} (${cardData.relationship})
Primary: ${cardData.primaryPhone}
Secondary: ${cardData.secondaryPhone}

*Medical Condition:* ${cardData.condition}

This is a genuine medical emergency. Please share to help save a life!

#BloodDonation #SaveALife #${cardData.bloodType}Blood #Vytal

Generated via Vytal - Community Donation Platform`
    };
  };

  const shareCard = async () => {
    const shareContent = generateShareContent();
    const cardBlob = await generateCardBlob();
    
    if (navigator.share && cardBlob) {
      try {
        const file = new File([cardBlob], `medical-card-${cardData.patientName.replace(/\s+/g, '-')}.png`, { 
          type: 'image/png' 
        });
        
        await navigator.share({
          title: shareContent.title,
          text: shareContent.text,
          files: [file]
        });
        return;
      } catch (error: any) {
        console.log('Native share with file failed, trying text only:', error);
        // Fallback to text-only sharing
        try {
          await navigator.share(shareContent);
          return;
        } catch (textError: any) {
          if (textError.name !== 'AbortError') {
            setShowShareMenu(true);
          }
        }
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const copyToClipboard = async () => {
    const shareContent = generateShareContent();
    try {
      await navigator.clipboard.writeText(shareContent.text);
      alert('Medical card details copied to clipboard!');
      setShowShareMenu(false);
    } catch (error) {
      alert('Please copy the details manually');
      setShowShareMenu(false);
    }
  };

  const shareToWhatsApp = async () => {
    // First, generate and download the image
    const cardBlob = await generateCardBlob();
    if (cardBlob) {
      // Download the image first
      const url = URL.createObjectURL(cardBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medical-card-${cardData.patientName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Copy text to clipboard
      const shareContent = generateShareContent();
      try {
        await navigator.clipboard.writeText(shareContent.text);
        
        // Show success message with instructions
        alert(`✅ READY FOR WHATSAPP!\n\n📥 Medical card image downloaded\n📋 Text copied to your clipboard\n\nNow:\n1. Open WhatsApp\n2. Select a chat or group\n3. Paste the text (Ctrl/Cmd+V)\n4. Click the attachment button (📎)\n5. Select the downloaded image\n6. Send both together!\n\nImage name: medical-card-${cardData.patientName.replace(/\s+/g, '-')}.png`);
        
      } catch (error) {
        alert(`✅ Image downloaded!\n\nImage saved as: medical-card-${cardData.patientName.replace(/\s+/g, '-')}.png\n\nFor WhatsApp:\n1. Copy the text from the form\n2. Open WhatsApp\n3. Paste text and attach the downloaded image`);
      }
    } else {
      // Fallback to text only
      const shareContent = generateShareContent();
      const message = encodeURIComponent(shareContent.text);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
    setShowShareMenu(false);
  };

  const shareImageAndText = async () => {
    const cardBlob = await generateCardBlob();
    if (cardBlob) {
      // Download the image
      const url = URL.createObjectURL(cardBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medical-card-${cardData.patientName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Copy text to clipboard
      const shareContent = generateShareContent();
      try {
        await navigator.clipboard.writeText(shareContent.text);
        
        // Show detailed instructions
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
              <p style="margin: 0; font-weight: bold; color: #0369a1;">✅ Medical card image downloaded</p>
              <p style="margin: 5px 0 0 0; font-weight: bold; color: #0369a1;">✅ Text copied to clipboard</p>
            </div>
            <div style="text-align: left; background: #f9fafb; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              <p style="font-weight: bold; margin: 0 0 10px 0;">📱 How to share on WhatsApp:</p>
              <p style="margin: 5px 0;">1. Open WhatsApp on your phone/computer</p>
              <p style="margin: 5px 0;">2. Select the contact or group</p>
              <p style="margin: 5px 0;">3. Paste the text (Ctrl+V or Cmd+V)</p>
              <p style="margin: 5px 0;">4. Click the attachment button (📎)</p>
              <p style="margin: 5px 0;">5. Choose "Photos & Media"</p>
              <p style="margin: 5px 0;">6. Select the downloaded medical card image</p>
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
        alert('📥 Medical card image downloaded!\n\nCheck your Downloads folder for the image file.\nThen manually copy the text and share both on WhatsApp.');
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden max-h-[95vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Medical Donation Card Generator</h2>
                <p className="text-teal-100">Create professional medical donation request cards</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Form Section */}
            <div className="lg:w-2/5 p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Patient & Contact Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
                  <input
                    type="text"
                    value={cardData.patientName}
                    onChange={(e) => setCardData({...cardData, patientName: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., Rangana Virani"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type *</label>
                    <div className="relative">
                      <select
                        value={cardData.bloodType}
                        onChange={(e) => setCardData({...cardData, bloodType: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none"
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
                        <MdBloodtype className="text-xl text-red-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Units Needed</label>
                    <input
                      type="text"
                      value={cardData.unitsNeeded}
                      onChange={(e) => setCardData({...cardData, unitsNeeded: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Condition *</label>
                  <textarea
                    value={cardData.condition}
                    onChange={(e) => setCardData({...cardData, condition: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                    placeholder="e.g., Surgery requiring blood transfusion"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardData.hospital}
                      onChange={(e) => setCardData({...cardData, hospital: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pl-10"
                      placeholder="e.g., Kalutara Base Hospital"
                    />
                    <MdLocalHospital className="absolute left-3 top-3 text-gray-500 text-xl" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardData.location}
                        onChange={(e) => setCardData({...cardData, location: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pl-10"
                        placeholder="e.g., Kalutara"
                      />
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Required Date</label>
                    <input
                      type="text"
                      value={cardData.requiredDate}
                      onChange={(e) => setCardData({...cardData, requiredDate: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., ASAP - Today"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                  <input
                    type="text"
                    value={cardData.contactPerson}
                    onChange={(e) => setCardData({...cardData, contactPerson: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., Sunil Wijeratne"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Phone *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={cardData.primaryPhone}
                        onChange={(e) => setCardData({...cardData, primaryPhone: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pl-10"
                        placeholder="094-869-624"
                      />
                      <FaPhone className="absolute left-3 top-3 text-gray-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Phone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={cardData.secondaryPhone}
                        onChange={(e) => setCardData({...cardData, secondaryPhone: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 pl-10"
                        placeholder="078-471-7407"
                      />
                      <FaPhone className="absolute left-3 top-3 text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <select
                    value={cardData.relationship}
                    onChange={(e) => setCardData({...cardData, relationship: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
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
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:w-3/5 p-6 bg-gradient-to-br from-teal-50 to-gray-100 border-l border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Professional Medical Card</h3>
                <div className="text-xs text-gray-500">
                  High-Quality PNG Download
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <div 
                  ref={cardRef}
                  className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border-8 border-white transform rotate-1"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 relative">
                    <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-full">
                      <MdEmergency className="text-white text-xl" />
                    </div>
                    <div className="flex items-center">
                      <div className="bg-white p-2 rounded-lg mr-3">
                        <MdLocalHospital className="text-teal-600 text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Medical Donation Request</h3>
                        <p className="text-teal-100 text-sm">Urgent Blood Donation Needed</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5 relative">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                      <div className="grid grid-cols-3 gap-8">
                        {[...Array(9)].map((_, i) => (
                          <MdBloodtype key={i} className="text-5xl text-red-500" />
                        ))}
                      </div>
                    </div>
                    
                    {/* Patient Info */}
                    <div className="relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">{cardData.patientName}</h2>
                          <p className="text-gray-600">{cardData.condition}</p>
                        </div>
                        
                        {/* Blood Type Badge */}
                        <div className="bg-red-500 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center">
                          <span className="text-xs">BLOOD</span>
                          <span className="text-xl font-bold">{cardData.bloodType}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-start">
                          <MdLocalHospital className="text-teal-600 mt-1 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Hospital</p>
                            <p className="font-medium">{cardData.hospital}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <FaMapMarkerAlt className="text-teal-600 mt-1 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{cardData.location}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <FaHeartbeat className="text-red-500 mt-1 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Units Needed</p>
                            <p className="font-medium">{cardData.unitsNeeded} units</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <MdEmergency className="text-red-500 mt-1 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Required By</p>
                            <p className="font-medium text-red-600">{cardData.requiredDate}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Section */}
                      <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-100">
                        <h4 className="font-bold text-teal-700 mb-2 flex items-center">
                          <FaPhone className="mr-2" />
                          Contact Information
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">Contact Person</p>
                            <p className="font-medium">{cardData.contactPerson}</p>
                            <p className="text-xs text-gray-500">({cardData.relationship})</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Primary Phone</p>
                            <p className="font-medium">{cardData.primaryPhone}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Secondary Phone</p>
                            <p className="font-medium">{cardData.secondaryPhone}</p>
                          </div>
                          
                          <div className="flex items-end justify-end">
                            <div className="bg-white p-2 rounded border">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                                <FaQrcode className="text-gray-400 text-2xl" />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Scan for contact</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Footer */}
                  <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-teal-600 text-white rounded w-8 h-8 flex items-center justify-center mr-2">
                        V
                      </div>
                      <p className="text-sm text-gray-600">Powered by Vytal</p>
                    </div>
                    <p className="text-xs text-gray-500">ID: MED-{Math.floor(Math.random() * 10000)}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={generateMedicalCard}
                  disabled={isGenerating || !cardData.patientName || !cardData.primaryPhone}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaDownload className="mr-2" />
                  {isGenerating ? 'Generating PNG...' : 'Download Medical Card'}
                </button>
                <button
                  onClick={() => setShowShareMenu(true)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  <FaShare className="mr-2" />
                  Share Details
                </button>
              </div>
              
              {/* Instructions */}
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800">
                  <strong>✨ Perfect Match:</strong> The downloaded PNG will look exactly like the preview above - professional, clean, and ready for sharing!
                </p>
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
              <h3 className="text-xl font-bold text-gray-800">Share Medical Request</h3>
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
                <strong>💡 Pro Tip:</strong> Use "Download Image + Copy Text" → Follow the step-by-step instructions → Share both image and text on WhatsApp for maximum impact!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default MedicalCardGenerator;