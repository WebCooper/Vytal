import React from 'react'
import { FilterbarProps } from '@/components/types';
import { MdBloodtype, MdLocalHospital, MdMedication, MdLocationOn, MdAccessTime } from 'react-icons/md'

const Filterbar: React.FC<FilterbarProps> = ({ posts, filterCategory, setFilterCategory}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            filterCategory === "all"
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-white/80 text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
          }`}
        >
          All Opportunities ({posts.length})
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
      
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select className="appearance-none pl-10 pr-8 py-2 bg-white/80 border border-emerald-200 rounded-lg font-medium text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300">
            <option>Any Distance</option>
            <option>Within 1 km</option>
            <option>Within 5 km</option>
            <option>Within 10 km</option>
          </select>
          <MdLocationOn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 text-xl" />
        </div>
        
        <div className="relative">
          <select className="appearance-none pl-10 pr-8 py-2 bg-white/80 border border-emerald-200 rounded-lg font-medium text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300">
            <option>Any Urgency</option>
            <option>High Priority</option>
            <option>Medium Priority</option>
            <option>Low Priority</option>
          </select>
          <MdAccessTime className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 text-xl" />
        </div>
        
        <button className="px-4 py-2 bg-emerald-100 text-emerald-700 font-semibold rounded-lg border border-emerald-200 hover:bg-emerald-200 transition-all duration-200">
          Apply Filters
        </button>
      </div>
    </div>
  )
}

export default Filterbar;