import React from 'react'

const Footer = () => {
  return (
    <div>
      <footer className="bg-emerald-800/80 backdrop-blur-md text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold mb-4">Vytal</h1>
          <p className="text-emerald-200 mb-8">Building bridges between those who can help and those who need help.</p>
          <div className="border-t border-emerald-600 pt-8">
            <p className="text-emerald-300">© 2025 Vytal. All rights reserved. | Saving lives, one connection at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer