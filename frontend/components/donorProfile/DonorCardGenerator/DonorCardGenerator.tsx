// DonorCardGenerator.tsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaShare, FaTimes } from 'react-icons/fa';
import { DonorCardGeneratorProps } from './types/donorCard';
import { useDonorCard } from './hooks/useDonorCard';
import { useCardGeneration } from './hooks/useCardGeneration';
import { DonorCardForm } from './components/DonorCardForm';
import { DonorCardPreview } from './components/DonorCardPreview';
import { DonorCardShareMenu } from './components/DonorCardShareMenu';

const DonorCardGenerator: React.FC<DonorCardGeneratorProps> = ({ isOpen, onClose }) => {
  const { cardData, updateCardData, isValid } = useDonorCard();
  const { generateDonorCard, isGenerating } = useCardGeneration();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    generateDonorCard(cardData, cardRef);
  };

  const handleShare = () => {
    setShowShareMenu(true);
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
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-6 text-white flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Donor Card Generator</h2>
                <p className="text-emerald-100">Create professional donor offer cards to share your willingness to help</p>
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
            <DonorCardForm cardData={cardData} onUpdate={updateCardData} />
            
            {/* Preview Section */}
            <div className="lg:w-3/5 p-6 bg-gradient-to-br from-emerald-50 to-gray-50 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Professional Donor Card</h3>
              </div>
              
              {/* Card Preview Container - Fixed height with scroll */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Card Preview */}
                <div className="flex-1 flex items-center justify-center overflow-y-auto py-4">
                  <div className="w-full max-w-sm">
                    <DonorCardPreview cardData={cardData} cardRef={cardRef} />
                  </div>
                </div>
                
                {/* Action Buttons - Always visible */}
                <div className="w-full max-w-sm mx-auto space-y-3 flex-shrink-0 pt-4 border-t border-gray-200">
                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={!isValid() || isGenerating}
                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                      !isValid() || isGenerating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FaDownload className="text-sm" />
                        <span>Download Donor Card</span>
                      </>
                    )}
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    disabled={!isValid()}
                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                      !isValid()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 hover:shadow-lg'
                    }`}
                  >
                    <FaShare className="text-sm" />
                    <span>Share Donor Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <DonorCardShareMenu 
        isOpen={showShareMenu}
        onClose={() => setShowShareMenu(false)}
        cardData={cardData}
      />
    </>
  );
};

export default DonorCardGenerator;