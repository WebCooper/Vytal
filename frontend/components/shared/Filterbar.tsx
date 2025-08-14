import React from 'react'
import { FilterbarProps } from '../types'
import { MdBloodtype, MdLocalHospital, MdMedication } from 'react-icons/md'

const Filterbar:React.FC<FilterbarProps> = ({posts, filterCategory, setFilterCategory, urgencyFilter, setUrgencyFilter}) => {
  return (
    <div>
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-emerald-100">
            <button
                onClick={() => setFilterCategory("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${filterCategory === "all"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-white/80 text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                    }`}
            >
                All Needs ({posts.length})
            </button>
            <button
                onClick={() => setFilterCategory("organs")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "organs"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-white/80 text-red-700 border border-red-200 hover:bg-red-50"
                    }`}
            >
                <MdBloodtype className="mr-1" />
                Organs ({posts.filter(p => p.category === "organs").length})
            </button>
            <button
                onClick={() => setFilterCategory("fundraiser")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "fundraiser"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white/80 text-blue-700 border border-blue-200 hover:bg-blue-50"
                    }`}
            >
                <MdLocalHospital className="mr-1" />
                Fundraisers ({posts.filter(p => p.category === "fundraiser").length})
            </button>
            <button
                onClick={() => setFilterCategory("medicines")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center ${filterCategory === "medicines"
                    ? "bg-yellow-500 text-white shadow-md"
                    : "bg-white/80 text-yellow-700 border border-yellow-200 hover:bg-yellow-50"
                    }`}
            >
                <MdMedication className="mr-1" />
                Medicines ({posts.filter(p => p.category === "medicines").length})
            </button>
        </div>

        {/* Urgency Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm font-medium text-gray-600 mr-2">Priority:</span>
            {['all', 'high', 'medium', 'low'].map((urgency) => (
                <button
                    key={urgency}
                    onClick={() => setUrgencyFilter(urgency)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${urgencyFilter === urgency
                        ? urgency === 'high' ? 'bg-red-100 text-red-700 border border-red-200'
                            : urgency === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                : urgency === 'low' ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    {urgency === 'all' ? 'All' : `${urgency}`.toUpperCase()}
                </button>
            ))}
        </div>
    </div>
  )
}

export default Filterbar