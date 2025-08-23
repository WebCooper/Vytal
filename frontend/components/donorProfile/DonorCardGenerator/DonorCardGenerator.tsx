// DonorCardGenerator.tsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaShare, FaTimes, FaCamera, FaPaintBrush, FaDesktop } from 'react-icons/fa';
import { DonorCardGeneratorProps } from './types/donorCard';
import { useDonorCard } from './hooks/useDonorCard';
import { useCardGeneration } from './hooks/useCardGeneration';
import { DonorCardForm } from './components/DonorCardForm';
import { DonorCardPreview } from './components/DonorCardPreview';
import { DonorCardShareMenu } from './components/DonorCardShareMenu';

const DonorCardGenerator: React.FC<DonorCardGeneratorProps> = ({ isOpen, onClose }) => {
  const { cardData, updateCardData, isValid } = useDonorCard();
  const { 
    generateDonorCard, 
    generateDonorCardScreenshot, 
    generateDonorCardCanvas,
    isGenerating 
  } = useCardGeneration();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrimaryDownload = () => {
    generateDonorCard(cardData, cardRef);
  };

  const handleScreenshot = () => {
    generateDonorCardScreenshot(cardData, cardRef);
  };

  const handleCanvasDownload = () => {
    generateDonorCardCanvas(cardData);
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
                <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                  Multiple download options available
                </div>
              </div>
              
              {/* Card Preview Container */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Card Preview */}
                <div className="flex-1 flex items-center justify-center overflow-y-auto py-4">
                  <div className="w-full max-w-sm">
                    <DonorCardPreview cardData={cardData} cardRef={cardRef} />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="w-full max-w-sm mx-auto space-y-3 flex-shrink-0 pt-4 border-t border-gray-200">
                  {/* Primary Download Button */}
                  <button
                    onClick={handlePrimaryDownload}
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
                        <FaDesktop className="text-sm" />
                        <span>Download Card</span>
                      </>
                    )}
                  </button>

                  {/* Download Options Toggle */}
                  <button
                    onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                    disabled={!isValid()}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !isValid()
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showDownloadOptions ? 'Hide' : 'Show'} More Download Options
                  </button>

                  {/* Additional Download Options */}
                  {showDownloadOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <button
                        onClick={handleScreenshot}
                        disabled={!isValid() || isGenerating}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                          !isValid() || isGenerating
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <FaCamera className="text-sm" />
                        <span>Manual Screenshot Guide</span>
                      </button>
                      
                      <button
                        onClick={handleCanvasDownload}
                        disabled={!isValid() || isGenerating}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                          !isValid() || isGenerating
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                      >
                        <FaPaintBrush className="text-sm" />
                        <span>Canvas Recreation</span>
                      </button>
                    </motion.div>
                  )}

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
                  
                  {/* Help Text */}
                  <div className="text-center text-xs text-gray-500 mt-2 p-3 bg-gray-50 rounded-lg space-y-1">
                    <p><strong>Screen Capture:</strong> Best quality, captures exact preview</p>
                    <p><strong>Screenshot Guide:</strong> Manual instructions for your OS</p>
                    <p><strong>Canvas Recreation:</strong> Generated image (may differ from preview)</p>
                  </div>
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