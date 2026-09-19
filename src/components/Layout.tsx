import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Activities', path: '/activities' },
    { name: 'Goals', path: '/goals' },
    { name: 'Methodology', path: '/methodology' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-sky-700 focus:shadow-md focus:m-4 focus:rounded-md focus:border focus:border-sky-300"
      >
        Skip to main content
      </a>

      {/* Apple-grade Sticky Frosted Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-slate-200/60 shadow-2xs transition-all">
        <nav aria-label="Main Navigation" className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center space-x-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-xl p-1.5 transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">Carbon Tracker</span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase mt-0.5">Verified Impact</span>
            </div>
          </Link>

          <ul className="flex items-center space-x-1 sm:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      active
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {children}
      </main>

      <footer className="bg-white/80 border-t border-slate-200/60 py-8 mt-auto backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-medium text-slate-700">Carbon Footprint Tracker &bull; Verified Calculation Engine</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} All calculations based on transparent emission factors and reported activity data.
          </div>
        </div>
      </footer>
    </div>
  );
}
