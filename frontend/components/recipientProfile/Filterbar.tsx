import { filterbarProps } from '@/components/types';
import React from 'react'
import { MdBloodtype, MdLocalHospital, MdMedication } from 'react-icons/md'

const Filterbar: React.FC<filterbarProps> = ({ posts, filterCategory, setFilterCategory}) => {
  return (
    <div>
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-emerald-100">
        <button
            onClick={() => setFilterCategory("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            filterCategory === "all"
                ? "bg-emerald-500 text-white shadow-md"
                : "bg-white/80 text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
            }`}
        >
            All Posts ({posts.length})
        </button>
        <button
            onClick={() => setFilterCategory("organs")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${
            filterCategory === "organs"
                ? "bg-red-500 text-white shadow-md"
                : "bg-white/80 text-red-700 border border-red-200 hover:bg-red-50"
            }`}
        >
            <MdBloodtype className="mr-1" />
            Organs
        </button>
        <button
            onClick={() => setFilterCategory("fundraiser")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${
            filterCategory === "fundraiser"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white/80 text-blue-700 border border-blue-200 hover:bg-blue-50"
            }`}
        >
            <MdLocalHospital className="mr-1" />
            Fundraiser
        </button>
        <button
            onClick={() => setFilterCategory("medicines")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${
            filterCategory === "medicines"
                ? "bg-yellow-500 text-white shadow-md"
                : "bg-white/80 text-yellow-700 border border-yellow-200 hover:bg-yellow-50"
            }`}
        >
            <MdMedication className="mr-1" />
            Medicines
        </button>
        </div>
    </div>
  )
}

export default Filterbar