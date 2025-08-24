// components/form/RelationshipSelect.tsx
import React from 'react';
import { RELATIONSHIP_OPTIONS } from '../../utils/constants';

interface RelationshipSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const RelationshipSelect: React.FC<RelationshipSelectProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
      >
        {RELATIONSHIP_OPTIONS.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};