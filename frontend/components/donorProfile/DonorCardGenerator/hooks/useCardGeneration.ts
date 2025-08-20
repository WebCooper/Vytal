// hooks/useCardGeneration.ts
import { useState, RefObject } from 'react';
import { DonorCardData } from '../types/donorCard';
import { DonorCardCanvas } from '../utils/cardCanvas';

export const useCardGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDonorCard = async (cardData: DonorCardData, cardRef?: RefObject<HTMLDivElement | null>) => {
    if (!cardRef?.current) {
      alert('Card preview not available');
      return;
    }
    
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
      
      await DonorCardCanvas.drawDonorCard(ctx, cardData);
      
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
      return await DonorCardCanvas.generateCardBlob(cardData);
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