// components/form/AvailabilitySelect.tsx
import React from 'react';
import { AVAILABILITY_OPTIONS } from '../../utils/constants';

interface AvailabilitySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const AvailabilitySelect: React.FC<AvailabilitySelectProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
      >
        {AVAILABILITY_OPTIONS.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};