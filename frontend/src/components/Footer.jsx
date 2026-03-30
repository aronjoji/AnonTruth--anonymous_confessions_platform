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
    <footer className="relative z-10 border-t border-[#343536] mt-12 bg-[#1a1a1b]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#FF4500] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-[#d7dadc]">
                anon<span className="text-[#FF4500]">truth</span>
              </span>
            </Link>
            <p className="text-[#818384] text-sm leading-relaxed">
              A safe space for anonymous expression. Share your truth without fear.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#818384] mb-3">Navigate</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-[#818384] hover:text-[#d7dadc] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#818384] mb-3">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.slice(0, 3).map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-[#818384] hover:text-[#d7dadc] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#818384] mb-3">Support</h4>
            <ul className="space-y-2">
              {legalLinks.slice(3).map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-[#818384] hover:text-[#d7dadc] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#343536] mb-6" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-20 lg:pb-0">
          <p className="text-xs text-[#818384]">
            &copy; 2026 AnonTruth. All rights reserved.
          </p>
          <p className="text-xs text-[#818384] flex items-center gap-1.5">
            Built by <a href="https://aronjoji.netlify.app" target="_blank" rel="noopener noreferrer" className="text-[#FF4500] font-semibold hover:underline">Aron Joji</a>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
