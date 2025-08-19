import { motion } from 'framer-motion';
import { MdBloodtype, MdVerified } from 'react-icons/md';
import { 
  FaTrophy, FaMedal, FaHeart, FaFire, FaStar, FaGift,
  FaUsers, FaShareAlt, FaCrown
} from 'react-icons/fa';
import { Badges as Badge } from '@/components/types';

// Define BadgeArray type as an array of Badge objects
type BadgeArray = Badge[];

const BadgesTab = ({ badges }: { badges: BadgeArray }) => {
    // Define icon props interface with common props used by react-icons
    interface IconProps {
      className?: string;
      size?: string | number;
      color?: string;
      title?: string;
    }
    
    const iconMap: Record<string, React.ComponentType<IconProps>> = {
    FaHeart,
    FaMedal, 
    FaFire,
    FaGift,
    FaCrown,
    FaTrophy,
    FaStar,
    FaUsers,
    FaShareAlt,
    MdBloodtype,
    MdVerified
    };

  const getRarityColor = (rarity: Badge['rarity']) => {
    const colors: Record<Badge['rarity'], string> = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600', 
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-orange-500'
    };
    return colors[rarity];
  };

  const getRarityBorder = (rarity: Badge['rarity']) => {
    const colors: Record<Badge['rarity'], string> = {
      common: 'border-gray-300',
      rare: 'border-blue-300',
      epic: 'border-purple-300', 
      legendary: 'border-yellow-300'
    };
    return colors[rarity];
  };

  // Function to get icon component from string name
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || FaHeart; // fallback to FaHeart
  };

  return (
    <div>
        <motion.div
        key="badges"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
        {badges.map((badge: Badge, index: number) => {
            // Get the icon component from the string name
            const IconComponent = getIconComponent(badge.icon);
            
            return (
            <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/80 backdrop-blur-md rounded-2xl p-6 border-2 ${getRarityBorder(badge.rarity)} 
                ${badge.earned ? 'shadow-xl' : 'opacity-50 grayscale'} hover:scale-105 transition-all duration-300`}
            >
                <div className="text-center">
                <div className={`w-20 h-20 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-2xl 
                    flex items-center justify-center mx-auto mb-4 ${badge.earned ? 'shadow-lg' : ''}`}>
                    <IconComponent className="text-3xl text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{badge.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{badge.description}</p>
                <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                    badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                    badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                    }`}>
                    {badge.rarity.toUpperCase()}
                    </span>
                    <span className="text-emerald-600 font-bold">{badge.points} pts</span>
                </div>
                {badge.earned && (
                    <div className="mt-3 flex justify-center">
                    <MdVerified className="text-emerald-500 text-xl" />
                    </div>
                )}
                </div>
            </motion.div>
            );
        })}
        </motion.div>
    </div>
  )
}

export default BadgesTab