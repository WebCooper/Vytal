// components/DonorCardShareMenu.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaDownload, FaCopy, FaWhatsapp, FaShare } from 'react-icons/fa';
import { DonorCardData } from '../types/donorCard';
import { ShareUtils } from '../utils/shareUtils';
import { useCardGeneration } from '../hooks/useCardGeneration';

interface DonorCardShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: DonorCardData;
}

export const DonorCardShareMenu: React.FC<DonorCardShareMenuProps> = ({ 
  isOpen, 
  onClose, 
  cardData 
}) => {
  const { generateCardBlob } = useCardGeneration();

  if (!isOpen) return null;

  const copyToClipboard = async () => {
    const shareContent = ShareUtils.generateShareContent(cardData);
    try {
      await ShareUtils.copyToClipboard(shareContent.text);
      alert('Donor card details copied to clipboard!');
      onClose();
    } catch (error) {
      alert(`Please copy the details manually - ERROR: ${error}`);
      onClose();
    }
  };

  const shareToWhatsApp = async () => {
    const cardBlob = await generateCardBlob(cardData);
    if (cardBlob) {
      const filename = `donor-card-${cardData.donorName.replace(/\s+/g, '-')}.png`;
      ShareUtils.downloadImage(cardBlob, filename);
      
      const shareContent = ShareUtils.generateShareContent(cardData);
      try {
        await ShareUtils.copyToClipboard(shareContent.text);
        
        alert(`✅ READY FOR WHATSAPP!\n\n📥 Donor card image downloaded\n📋 Text copied to your clipboard\n\nNow:\n1. Open WhatsApp\n2. Select a chat or group\n3. Paste the text (Ctrl/Cmd+V)\n4. Click the attachment button (📎)\n5. Select the downloaded image\n6. Send both together!\n\nImage name: ${filename}`);
        
      } catch (error) {
        alert(`✅ Image downloaded!\n\nImage saved as: ${filename}\n\nFor WhatsApp:\n1. Copy the text from the form\n2. Open WhatsApp\n3. Paste text and attach the downloaded image ERROR : ${error}`);
      }
    } else {
      const shareContent = ShareUtils.generateShareContent(cardData);
      ShareUtils.shareToWhatsApp(shareContent.text);
    }
    onClose();
  };

  const shareImageAndText = async () => {
    const cardBlob = await generateCardBlob(cardData);
    if (cardBlob) {
      const filename = `donor-card-${cardData.donorName.replace(/\s+/g, '-')}.png`;
      ShareUtils.downloadImage(cardBlob, filename);
      
      const shareContent = ShareUtils.generateShareContent(cardData);
      try {
        await ShareUtils.copyToClipboard(shareContent.text);
        ShareUtils.showWhatsAppInstructions();
      } catch (error) {
        alert(`📥 Donor card image downloaded!\n\nCheck your Downloads folder for the image file.\nThen manually copy the text and share both on WhatsApp. ERROR : ${error}`);
      }
    }
    onClose();
  };

  const quickWhatsAppText = () => {
    const shareContent = ShareUtils.generateShareContent(cardData);
    ShareUtils.shareToWhatsApp(shareContent.text);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl border border-white/30 p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Share Donor Offer</h3>
          <button
            onClick={onClose}
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
            <strong>Pro Tip:</strong> Use &apos;Download Image + Copy Text&apos; → Follow the step-by-step instructions → Share both image and text on WhatsApp to let people know you&apos;re available to help!
          </p>
        </div>
      </motion.div>
    </div>
  );
};