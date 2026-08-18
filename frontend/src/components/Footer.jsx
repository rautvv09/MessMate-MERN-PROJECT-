import { Link } from 'react-router-dom';
import { FaUtensils, FaHeart, FaInstagram, FaTwitter, FaFacebook, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border pt-16 pb-12 text-text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg">
                <FaUtensils size={16} />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight">
                Mess<span className="text-primary">Mate</span>
              </span>
            </Link>
            <p className="text-xs text-text-secondary leading-relaxed">
              Connecting students with verified local mess & tiffin providers for hassle-free daily meals.
            </p>
            <div className="flex items-center gap-3 text-text-secondary pt-2">
              <a href="#" className="p-2 rounded-full bg-background hover:text-primary transition-colors">
                <FaInstagram size={14} />
              </a>
              <a href="#" className="p-2 rounded-full bg-background hover:text-primary transition-colors">
                <FaTwitter size={14} />
              </a>
              <a href="#" className="p-2 rounded-full bg-background hover:text-primary transition-colors">
                <FaFacebook size={14} />
              </a>
              <a href="#" className="p-2 rounded-full bg-background hover:text-primary transition-colors">
                <FaLinkedin size={14} />
              </a>
            </div>
          </div>

          {/* Col 2: For Students */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary font-heading">
              FOR STUDENTS
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary font-medium">
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Find Messes Near Me</Link></li>
              <li><Link to="/my-attendance" className="hover:text-primary transition-colors">Track Daily Attendance</Link></li>
              <li><Link to="/my-bills" className="hover:text-primary transition-colors">Monthly Bills & Payments</Link></li>
              <li><Link to="/bookings/me" className="hover:text-primary transition-colors">My Subscriptions</Link></li>
            </ul>
          </div>

          {/* Col 3: For Mess Owners */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary font-heading">
              FOR MESS OWNERS
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary font-medium">
              <li><Link to="/register?role=owner" className="hover:text-primary transition-colors">List Your Mess</Link></li>
              <li><Link to="/owner/dashboard" className="hover:text-primary transition-colors">Owner Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Manage Attendance & Bills</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Revenue & Analytics</Link></li>
            </ul>
          </div>

          {/* Col 4: Watermark Quote */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary font-heading">
              MESSMATE PHILOSOPHY
            </h4>
            <p className="text-xs text-text-secondary italic leading-relaxed">
              "Good food creates better study routines, better health, and memorable college years."
            </p>
            <div className="pt-2 text-[11px] text-primary font-bold">
              ★ 100% Verified Quality Messes
            </div>
          </div>
        </div>

        {/* Large Brand Watermark Typography */}
        <div className="border-t border-border pt-8 text-center">
          <p className="font-heading font-black text-4xl sm:text-6xl text-text-muted/10 tracking-widest uppercase select-none">
            GOOD FOOD • BETTER ROUTINE
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs text-text-secondary">
            <p>© {new Date().getFullYear()} MessMate Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Crafted with <FaHeart className="text-status-danger" size={12} /> for college students & mess owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
