// components/DonorCardPreview.tsx
import React, { RefObject } from 'react';
import { DonorCardData } from '../types/donorCard';
import { CardHeader, CardBody, ContactSection, CardFooter } from './card';

interface DonorCardPreviewProps {
  cardData: DonorCardData;
  cardRef: RefObject<HTMLDivElement | null>;
}

export const DonorCardPreview: React.FC<DonorCardPreviewProps> = ({ cardData, cardRef }) => {
  return (
    <div className="w-full max-w-sm mx-auto mb-4">
      <div 
        ref={cardRef}
        className="bg-white rounded-xl shadow-xl overflow-hidden border-4 border-white transform hover:scale-105 transition-transform duration-300"
        style={{ aspectRatio: '4/5' }}
      >
        <CardHeader />
        <CardBody cardData={cardData} />
        <div className="px-3 pb-3">
          <ContactSection cardData={cardData} />
        </div>
        <CardFooter />
      </div>
    </div>
  );
};