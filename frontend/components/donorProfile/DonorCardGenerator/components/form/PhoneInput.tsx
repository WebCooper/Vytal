// components/form/PhoneInput.tsx
import React from 'react';
import { FaPhone } from 'react-icons/fa';

interface PhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  required = false 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pl-8 text-gray-900 font-medium"
          placeholder={placeholder}
        />
        <FaPhone className="absolute left-2 top-2.5 text-gray-500 text-sm" />
      </div>
    </div>
  );
};