"use client";
import React from "react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export default function AdminPostModal({ title, onClose, children, actions }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.6 }}
      >
        <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4 text-white flex items-center justify-between flex-shrink-0">
            <h4 className="text-lg sm:text-xl font-semibold tracking-wide">{title}</h4>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6">{children}</div>
          </div>
          
          {/* Actions */}
          {actions && (
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              {actions}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
