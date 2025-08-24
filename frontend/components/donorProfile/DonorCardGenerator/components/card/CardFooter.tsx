// components/card/CardFooter.tsx
import React from 'react';

export const CardFooter: React.FC = () => {
  return (
    <div className="bg-gray-50 p-2 border-t border-gray-200 flex justify-between items-center text-xs">
      <div className="flex items-center">
        <div className="bg-emerald-600 text-white rounded w-6 h-6 flex items-center justify-center mr-1.5 font-bold shadow-sm">
          V
        </div>
        <p className="text-gray-700 font-bold">Powered by Vytal</p>
      </div>
      <p className="text-gray-600 font-semibold">ID: DON-{Math.floor(Math.random() * 10000)}</p>
    </div>
  );
};