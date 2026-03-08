import { Link } from 'react-router-dom';
import { Shield, TrendingUp, MapPin, FileText, Users, ShieldCheck, AlertTriangle, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const navLinks = [
    { to: '/home', label: 'Home', icon: TrendingUp },
    { to: '/home?filter=trending', label: 'Trending', icon: TrendingUp },
    { to: '/nearby', label: 'Nearby', icon: MapPin },
  ];

  const legalLinks = [
    { to: '/privacy', label: 'Privacy Policy', icon: Shield },
    { to: '/terms', label: 'Terms of Service', icon: FileText },
    { to: '/guidelines', label: 'Community Guidelines', icon: Users },
    { to: '/content-policy', label: 'Content Policy', icon: ShieldCheck },
    { to: '/disclaimer', label: 'Disclaimer', icon: AlertTriangle },
    { to: '/contact', label: 'Contact', icon: Mail },
  ];

  return (
    <footer className="relative z-10 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-accent-cyan/20 rounded-lg">
                <Shield className="w-5 h-5 text-accent-cyan" />
              </div>
              <span className="text-lg font-bold tracking-tighter gradient-text">AnonTruth</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              A safe space for anonymous expression. Share your truth without fear.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Navigate</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.slice(0, 3).map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Support</h4>
            <ul className="space-y-3">
              {legalLinks.slice(3).map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; 2026 AnonTruth. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            Designed and developed by <a href="https://aronjoji.netlify.app" target="_blank" rel="noopener noreferrer" className="text-accent-cyan font-semibold hover:underline">Aron Joji</a>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
