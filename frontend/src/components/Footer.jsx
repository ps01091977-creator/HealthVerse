import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-12 mt-20 md:mt-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-sm">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50">HealthVerse</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
            HealthVerse is a next-generation healthcare coordination and diagnostics support platform. We connect patients with top clinical specialists, integrated with smart symptom screening utilities.
          </p>
        </div>

        {/* Company Links */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Company</h4>
          <ul className="space-y-2.5 text-zinc-500 dark:text-zinc-400">
            <li className="hover:text-primary transition-colors cursor-pointer">Home</li>
            <li className="hover:text-primary transition-colors cursor-pointer">About Us</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Contact</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* Get in touch Links */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Get in Touch</h4>
          <ul className="space-y-2.5 text-zinc-500 dark:text-zinc-400">
            <li className="hover:text-primary transition-colors cursor-pointer">
              <a href="tel:+919000090000">+91-90000-90000</a>
            </li>
            <li className="hover:text-primary transition-colors cursor-pointer">
              <a href="mailto:support@healthverse.ai">support@healthverse.ai</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 py-6 text-center text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 sm:px-8 gap-4">
        <p>© 2026 HealthVerse. All Rights Reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for healthy communities.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
