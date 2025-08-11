import React from 'react'
import { FaFilter } from 'react-icons/fa';
import { FilterSectionProps } from '../types';

const FilterSection: React.FC<FilterSectionProps> = ({filterCategory, setFilterCategory, filterUrgency, setFilterUrgency, filteredPosts}) => {
  return (
    <div>
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <FaFilter className="text-emerald-500 text-xl" />
                <span className="font-semibold text-emerald-700">Filter by:</span>
                
                {/* Category Filter */}
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-emerald-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 bg-white/80"
                >
                  <option value="all">All Categories</option>
                  <option value="blood">Blood</option>
                  <option value="organs">Organs</option>
                  <option value="medicines">Medicines</option>
                </select>

                {/* Urgency Filter */}
                <select 
                  value={filterUrgency} 
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-emerald-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 bg-white/80"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <span className="text-gray-500 ml-auto">
                  {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
    </div>
  )
}

export default FilterSection