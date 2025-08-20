// components/form/DonationTypeSelect.tsx
import React from 'react';
import { DONATION_TYPES } from '../../utils/constants';

interface DonationTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const DonationTypeSelect: React.FC<DonationTypeSelectProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Donation Type *</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
      >
        {DONATION_TYPES.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  );
};