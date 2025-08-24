// components/card/CardHeader.tsx
import React from 'react';
import { FaGift } from 'react-icons/fa';
import { MdVolunteerActivism } from 'react-icons/md';

export const CardHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-3 relative">
      <div className="absolute top-3 right-3 bg-white/20 p-1.5 rounded-full">
        <FaGift className="text-white text-lg" />
      </div>
      <div className="flex items-center">
        <div className="bg-white p-1.5 rounded-lg mr-2">
          <MdVolunteerActivism className="text-emerald-600 text-xl" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm drop-shadow-sm">Donation Offer Available</h3>
          <p className="text-white text-xs font-semibold drop-shadow-sm">Ready to Help & Save Lives</p>
        </div>
      </div>
    </div>
  );
};