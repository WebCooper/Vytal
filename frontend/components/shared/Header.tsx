import Link from 'next/link';
import React from 'react'

const Header = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" passHref>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent cursor-pointer">
              Vytal
            </h1>
          </Link>
          <div className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('about')} className="text-emerald-700 hover:text-emerald-500 font-semibold transition">About</button>
            <button onClick={() => scrollToSection('services')} className="text-emerald-700 hover:text-emerald-500 font-semibold transition">Services</button>
            <button onClick={() => scrollToSection('testimonials')} className="text-emerald-700 hover:text-emerald-500 font-semibold transition">Stories</button>
            <button onClick={() => scrollToSection('contact')} className="text-emerald-700 hover:text-emerald-500 font-semibold transition">Contact</button>
            <Link href="/community" className="text-emerald-700 hover:text-emerald-500 font-semibold transition">Community</Link>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/signin" passHref>
              <button className="px-4 py-2 text-emerald-700 font-semibold hover:bg-emerald-50 rounded-lg transition cursor-pointer">
              Login
              </button>
            </Link>
            <Link href="/auth/signup" passHref>
              <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer">Join Now</button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Header