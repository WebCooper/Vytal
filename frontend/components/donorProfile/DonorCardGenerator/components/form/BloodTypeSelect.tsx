// components/form/BloodTypeSelect.tsx
import React from 'react';
import { MdBloodtype } from 'react-icons/md';
import { BLOOD_TYPES } from '../../utils/constants';

interface BloodTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const BloodTypeSelect: React.FC<BloodTypeSelectProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type *</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none text-gray-900 font-medium"
        >
          {BLOOD_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <MdBloodtype className="text-lg text-emerald-500" />
        </div>
      </div>
    </div>
  );
};