// hooks/useCardGeneration.ts
import { useState } from 'react';
import { DonorCardData } from '../types/donorCard';
import { EnhancedDonorCardCanvas } from '../utils/enhancedCardCanvas'; // Import the new enhanced canvas

export const useCardGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDonorCard = async (cardData: DonorCardData) => {
    setIsGenerating(true);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas not supported');
      }
      
      const scale = 3;
      canvas.width = 384 * scale; // Match the preview dimensions
      canvas.height = 480 * scale;
      
      ctx.scale(scale, scale);
      
      // Use the enhanced canvas drawer
      await EnhancedDonorCardCanvas.drawDonorCard(ctx, cardData);
      
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

  const generateCardBlob = async (cardData: DonorCardData): Promise<Blob | null> => {
    try {
      return await EnhancedDonorCardCanvas.generateCardBlob(cardData);
    } catch (error) {
      console.error('Error generating card blob:', error);
      return null;
    }
  };

  return {
    isGenerating,
    generateDonorCard,
    generateCardBlob
  };
};