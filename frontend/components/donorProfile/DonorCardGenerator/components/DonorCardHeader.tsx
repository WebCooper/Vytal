// components/DonorCardHeader.tsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface DonorCardHeaderProps {
  onClose: () => void;
}

export const DonorCardHeader: React.FC<DonorCardHeaderProps> = ({ onClose }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-4 text-white flex-shrink-0">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Donor Card Generator</h2>
          <p className="text-emerald-100 text-sm">Create professional donor offer cards to share your willingness to help</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>
    </div>
  );
};