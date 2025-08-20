// DonorCardGenerator.tsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { DonorCardGeneratorProps } from './types/donorCard';
import { useDonorCard } from './hooks/useDonorCard';
import { useCardGeneration } from './hooks/useCardGeneration';
import { DonorCardHeader } from './components/DonorCardHeader';
import { DonorCardForm } from './components/DonorCardForm';
import { DonorCardPreview } from './components/DonorCardPreview';
import { DonorCardActions } from './components/DonorCardActions';
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
          <DonorCardHeader onClose={onClose} />
          
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            <DonorCardForm cardData={cardData} onUpdate={updateCardData} />
            
            <div className="lg:w-3/5 p-4 bg-gradient-to-br from-emerald-50 to-gray-50 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800">Professional Donor Card</h3>
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center">
                <DonorCardPreview cardData={cardData} cardRef={cardRef} />
                <DonorCardActions 
                  onDownload={handleDownload}
                  onShare={handleShare}
                  isGenerating={isGenerating}
                  isDisabled={!isValid()}
                />
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