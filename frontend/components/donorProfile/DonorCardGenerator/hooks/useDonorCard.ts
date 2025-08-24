// hooks/useDonorCard.ts
import { useState, useCallback } from 'react';
import { DonorCardData, DonorCardCategory } from '../types/donorCard';
import { DEFAULT_CARD_DATA } from '../utils/constants';

export const useDonorCard = () => {
  const [cardData, setCardData] = useState<DonorCardData>(() => {
    // Deep clone the default data to avoid mutations
    return JSON.parse(JSON.stringify(DEFAULT_CARD_DATA[DonorCardCategory.BLOOD]));
  });

  const updateCardData = useCallback((updates: Partial<DonorCardData>) => {
    setCardData(prevData => {
      // If category is being changed, switch to the default data for that category
      // but preserve the basic user information
      if (updates.category && updates.category !== prevData.category) {
        const newCategoryDefaults = JSON.parse(JSON.stringify(DEFAULT_CARD_DATA[updates.category]));
        return {
          ...newCategoryDefaults,
          // Preserve user-entered basic information
          donorName: prevData.donorName || newCategoryDefaults.donorName,
          location: prevData.location || newCategoryDefaults.location,
          contactPerson: prevData.contactPerson || newCategoryDefaults.contactPerson,
          primaryPhone: prevData.primaryPhone || newCategoryDefaults.primaryPhone,
          secondaryPhone: prevData.secondaryPhone || newCategoryDefaults.secondaryPhone,
          relationship: prevData.relationship || newCategoryDefaults.relationship,
          message: newCategoryDefaults.message, // Use category-specific default message
          urgency: newCategoryDefaults.urgency,
          availability: newCategoryDefaults.availability,
          ...updates
        };
      }

      // For non-category updates, merge normally
      return {
        ...prevData,
        ...updates
      };
    });
  }, []);

  const isValid = useCallback(() => {
    // Basic validation for all categories
    const hasBasicInfo = !!(
      cardData.donorName?.trim() &&
      cardData.location?.trim() &&
      cardData.contactPerson?.trim() &&
      cardData.primaryPhone?.trim() &&
      cardData.message?.trim()
    );

    if (!hasBasicInfo) return false;

    // Category-specific validation
    switch (cardData.category) {
      case DonorCardCategory.BLOOD:
        return !!(cardData.bloodOffering?.bloodType);
        
      case DonorCardCategory.ORGANS:
        return !!(cardData.organOffering?.organType);
        
      case DonorCardCategory.FUNDRAISER:
        return !!(
          cardData.fundraiserOffering?.maxAmount &&
          !isNaN(Number(cardData.fundraiserOffering.maxAmount)) &&
          Number(cardData.fundraiserOffering.maxAmount) > 0
        );
        
      case DonorCardCategory.MEDICINES:
        return !!(
          cardData.medicineOffering?.medicineTypes?.some(type => type.trim() !== '')
        );
        
      case DonorCardCategory.SUPPLIES:
        return !!(cardData.suppliesOffering?.suppliesType);
        
      default:
        return hasBasicInfo;
    }
  }, [cardData]);

  const resetToDefaults = useCallback((category?: DonorCardCategory) => {
    const targetCategory = category || DonorCardCategory.BLOOD;
    setCardData(JSON.parse(JSON.stringify(DEFAULT_CARD_DATA[targetCategory])));
  }, []);

  return {
    cardData,
    updateCardData,
    isValid,
    resetToDefaults
  };
};