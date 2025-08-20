// hooks/useDonorCard.ts
import { useState } from 'react';
import { DonorCardData } from '../types/donorCard';
import { DEFAULT_CARD_DATA } from '../utils/constants';

export const useDonorCard = () => {
  const [cardData, setCardData] = useState<DonorCardData>(DEFAULT_CARD_DATA);

  const updateCardData = (updates: Partial<DonorCardData>) => {
    setCardData(prev => ({ ...prev, ...updates }));
  };

  const resetCardData = () => {
    setCardData(DEFAULT_CARD_DATA);
  };

  const isValid = () => {
    return cardData.donorName.trim() !== '' && cardData.primaryPhone.trim() !== '';
  };

  return {
    cardData,
    updateCardData,
    resetCardData,
    isValid
  };
};