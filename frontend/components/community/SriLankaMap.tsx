import { useState } from "react";
import { sriLankaMapPath } from "./sriLankaMapPath";
import { SriLankaMapProps } from "../types";

function projectSriLanka(lat: number, lng: number): [number, number] {
  const minLat = 5.7;
  const maxLat = 10.0;
  const minLng = 79.4;
  const maxLng = 81.9;

//   const viewBoxWidth = 1000;
  const viewBoxHeight = 1000;

  // These define the actual bounding box of Sri Lanka *inside* the SVG
  const svgMinX = 180;  // left padding in pixels
  const svgMaxX = 770;  // right padding in pixels

  const usableWidth = svgMaxX - svgMinX;

  const x = svgMinX + ((lng - minLng) / (maxLng - minLng)) * usableWidth;
  const y = viewBoxHeight - ((lat - minLat) / (maxLat - minLat)) * viewBoxHeight;

  return [x, y];
}
const SriLankaMap: React.FC<SriLankaMapProps> = ({bloodCamps, setSelectedCamp}) => {
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

    return (
      <div className="relative w-full h-150 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl overflow-y-scroll border border-emerald-200">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
            <path
            d={sriLankaMapPath}
            fill="rgba(16, 185, 129, 0.1)"
            stroke="rgba(16, 185, 129, 0.3)"
            strokeWidth="2"
            className="hover:fill-emerald-200 transition-all duration-300 cursor-pointer"
            />
            
            {/* Blood camp markers */}
            {bloodCamps.map((camp) => {
            const [x, y] = projectSriLanka(camp.coordinates[0], camp.coordinates[1]);
            
            return (
              <g key={camp.id}>
                <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={camp.status === "active" ? "#ef4444" : "#f59e0b"}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:r-12 cursor-pointer transition-all duration-200 animate-pulse"
                    onClick={() => setSelectedCamp(camp)}
                    onMouseEnter={() => setHoveredRegion(camp.name)}
                    onMouseLeave={() => setHoveredRegion(null)}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Map Legend */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h4 className="font-bold text-teal-700 text-sm mb-2">Legend</h4>
            <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-teal-800">Active Camps</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-teal-800">Upcoming Camps</span>
            </div>
            </div>
        </div>

        {hoveredRegion && (
            <div className="absolute bottom-4 left-4 bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-semibold">
            {hoveredRegion}
            </div>
        )}
      </div>
    );
};

export default SriLankaMap;