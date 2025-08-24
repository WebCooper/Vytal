// components/DonorCardActions.tsx
import React from 'react';
import { FaDownload, FaShare } from 'react-icons/fa';

interface DonorCardActionsProps {
  onDownload: () => void;
  onShare: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
}

export const DonorCardActions: React.FC<DonorCardActionsProps> = ({
  onDownload,
  onShare,
  isGenerating,
  isDisabled
}) => {
  return (
    <div className="w-full max-w-sm mx-auto space-y-2">
      <button
        onClick={onDownload}
        disabled={isDisabled}
        className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <FaDownload className="mr-2" />
        {isGenerating ? 'Generating PNG...' : 'Download Donor Card'}
      </button>
      
      <button
        onClick={onShare}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
      >
        <FaShare className="mr-2" />
        Share Donor Details
      </button>
      
      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-sm text-emerald-800 text-center font-semibold">
          <strong>Perfect Match:</strong> The downloaded PNG will look exactly like the preview above - professional, clean, and ready for sharing your donation offer!
        </p>
      </div>
    </div>
  );
};