import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-sky-700 focus:shadow-md focus:m-4 focus:rounded-md focus:border focus:border-sky-300"
      >
        Skip to main content
      </a>
      <header className="bg-white border-b border-slate-200">
        <nav aria-label="Main Navigation" className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md p-1">
            Carbon Tracker
          </Link>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="text-slate-600 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md p-1">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/activities" className="text-slate-600 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md p-1">
                Activities
              </Link>
            </li>
            <li>
              <Link to="/goals" className="text-slate-600 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md p-1">
                Goals
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Carbon Footprint Tracker. All estimates are based on documented assumptions and reported activity.
        </div>
      </footer>
    </div>
  );
}
