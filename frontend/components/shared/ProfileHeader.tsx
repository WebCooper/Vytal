import Link from 'next/link'
import React from 'react'
import { FaBell } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md';
import { ProfileHeaderProps } from '../types';

const ProfileHeader: React.FC<ProfileHeaderProps> = ({user}) => {

  return (
    <div>
      <header className="bg-white/80 backdrop-blur-md border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                  Vytal
                </h1>
              </Link>
              {/* <span className="text-gray-400">|</span>
              <span className="text-emerald-700 font-semibold">Dashboard</span> */}
            </div>
            
            <div className="flex items-center space-x-6">
              {/* <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input 
                  type="text" 
                  placeholder="Search posts..." 
                  className="pl-10 pr-4 py-2 rounded-lg border border-emerald-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 bg-white/80"
                />
              </div> */}
              <FaBell className="text-2xl text-emerald-600 hover:text-emerald-500 cursor-pointer" />
              <Link href="/me">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-emerald-700">{user.name}</span>
                      {user.verified && <MdVerified className="text-emerald-500 text-sm" />}
                    </div>
                    {/* <span className="text-sm text-gray-600">Recipient</span> */}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

export default ProfileHeader