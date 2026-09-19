import React from 'react';
import * as motion from "motion/react-client";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <nav aria-label="Main Navigation" className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md p-1">
            Carbon Tracker
          </a>
          <ul className="flex space-x-6">
            <li>
              <a href="/" className="text-slate-600 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md p-1">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/activities" className="text-slate-600 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md p-1">
                Activities
              </a>
            </li>
            <li>
              <a href="/goals" className="text-slate-600 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md p-1">
                Goals
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <motion.main 
        id="main-content" 
        className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Carbon Footprint Tracker. All estimates are based on documented assumptions and reported activity.
        </div>
      </footer>
    </div>
  );
}
