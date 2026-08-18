import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaStar, FaMapMarkerAlt, FaUtensils, FaShieldAlt, FaCalendarCheck, FaChartLine, FaCheck, FaArrowRight, FaClock, FaHeart, FaChevronRight } from 'react-icons/fa';
import Footer from '../components/Footer';

const POPULAR_MESSES_PREVIEW = [
  {
    id: '1',
    name: 'Shree Krishna Veg Mess',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 124,
    cuisine: 'Pure Veg • North & South Indian',
    location: 'Near COEP College, Shivajinagar',
    monthlyPrice: 3200,
    dailyPrice: 120,
    tag: 'Popular',
  },
  {
    id: '2',
    name: 'Annapurna Tiffin & Mess Services',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 198,
    cuisine: 'Veg & Non-Veg • Maharashtrian',
    location: 'FC Road, Deccan Gymkhana',
    monthlyPrice: 3800,
    dailyPrice: 140,
    tag: 'Top Rated',
  },
  {
    id: '3',
    name: 'Royal Student Dining',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 86,
    cuisine: 'North Indian • Unlimited Thali',
    location: 'Kothrud, Near MIT College',
    monthlyPrice: 3500,
    dailyPrice: 130,
    tag: 'Budget Friendly',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary selection:text-white overflow-hidden">
      {/* ===================================================================
          1. HERO SECTION (Editorial Layout with Overlapping Floating Cards)
         =================================================================== */}
      <section className="relative pt-8 pb-20 md:pt-16 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background Watermark */}
        <span className="editorial-watermark text-[14vw] top-10 -left-10 opacity-5 pointer-events-none">
          MESSMATE
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              YOUR DAILY FOOD, MADE SIMPLE.
            </div>

            <h1 className="text-display-2xl text-text-primary">
              FIND YOUR <br />
              <span className="text-primary underline decoration-accent/60 underline-offset-8">PERFECT MESS.</span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary max-w-xl font-normal leading-relaxed">
              Discover trusted messes near your college, compare monthly plans, track daily attendance, and manage hassle-free meal subscriptions in one place.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                EXPLORE MESSES <FaArrowRight size={14} />
              </Link>
              <Link
                to="/register?role=owner"
                className="px-8 py-4 rounded-2xl bg-surface border-2 border-border hover:border-primary text-text-primary hover:text-primary font-bold text-sm transition-all"
              >
                LIST YOUR MESS
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-border/80">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary font-heading">50+</p>
                <p className="text-xs text-text-secondary font-medium">Verified Messes</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary font-heading">2,400+</p>
                <p className="text-xs text-text-secondary font-medium">Active Students</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-text-primary font-heading">4.9★</p>
                <p className="text-xs text-text-secondary font-medium">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Right Hero Column (Asymmetric Overlapping Cards Visual Composition) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Visual Image Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-surface aspect-[4/3] sm:aspect-[14/11]">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"
                  alt="Delicious Mess Meal"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-secondary px-2.5 py-1 rounded-full">
                    Fresh Daily Thali
                  </span>
                  <h3 className="font-heading font-extrabold text-xl mt-1">Unlimited Meals Plan</h3>
                </div>
              </div>

              {/* Floating Rating Badge */}
              <div className="absolute -top-6 -left-6 bg-surface p-4 rounded-2xl shadow-xl border border-border flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <FaStar size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">4.9 / 5.0 Rating</p>
                  <p className="text-[10px] text-text-secondary">Verified Student Reviews</p>
                </div>
              </div>

              {/* Floating Attendance Tracker Mockup Card */}
              <div className="absolute -bottom-8 -right-4 sm:-right-8 bg-surface p-4 sm:p-5 rounded-2xl shadow-2xl border border-border w-64 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <FaCalendarCheck className="text-primary" /> Today's Attendance
                  </span>
                  <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    PRESENT
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary pt-1 border-t border-border">
                  <span>Breakfast: Present</span>
                  <span>Lunch: Present</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. MARQUEE SECTION (Animated Infinite Brand Text Ticker)
         =================================================================== */}
      <section className="bg-primary text-white py-4 overflow-hidden shadow-inner">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 font-heading font-extrabold text-sm sm:text-base tracking-widest uppercase">
          <span>★ MESSMATE</span>
          <span>GOOD FOOD</span>
          <span>SMART CHOICES</span>
          <span>HAPPY STUDENTS</span>
          <span>AUTOMATED BILLING</span>
          <span>DAILY ATTENDANCE</span>
          <span>★ MESSMATE</span>
          <span>GOOD FOOD</span>
          <span>SMART CHOICES</span>
          <span>HAPPY STUDENTS</span>
          <span>AUTOMATED BILLING</span>
          <span>DAILY ATTENDANCE</span>
        </div>
      </section>

      {/* ===================================================================
          3. SEARCH SECTION
         =================================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto -mt-6 relative z-20">
        <div className="bg-surface border-2 border-border p-6 sm:p-8 rounded-3xl shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-center mb-6 text-text-primary">
            WHERE ARE YOU EATING TODAY?
          </h2>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search mess name, college, or area (e.g. Shivajinagar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-background border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              SEARCH MESSES
            </button>
          </form>
        </div>
      </section>

      {/* ===================================================================
          4. HOW IT WORKS SECTION (Large Numbered Cards)
         =================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-editorial-sub">SIMPLE 4-STEP PROCESS</span>
          <h2 className="text-display-xl text-text-primary mt-2">
            HOW MESSMATE WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'DISCOVER',
              desc: 'Browse verified messes near your college campus with full pricing & menu details.',
            },
            {
              step: '02',
              title: 'COMPARE',
              desc: 'Compare ratings, thali photos, veg/non-veg options, and monthly subscription costs.',
            },
            {
              step: '03',
              title: 'BOOK',
              desc: 'Choose your plan (Full Day, Lunch, or Dinner) and book instantly online.',
            },
            {
              step: '04',
              title: 'ENJOY & TRACK',
              desc: 'Mark daily attendance, monitor missed meals, and view automated monthly bills.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-surface border border-border p-8 rounded-3xl hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md relative overflow-hidden group"
            >
              <span className="text-5xl font-extrabold font-heading text-primary/15 group-hover:text-primary/30 transition-colors block mb-4">
                {item.step}
              </span>
              <h3 className="text-xl font-bold font-heading text-text-primary mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================
          5. POPULAR MESSES PREVIEW SECTION
         =================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-surface/50 rounded-3xl border border-border">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-editorial-sub">TOP RATED NEAR COLLEGES</span>
            <h2 className="text-display-xl text-text-primary mt-1">
              POPULAR MESSES
            </h2>
          </div>
          <Link
            to="/register"
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1.5"
          >
            VIEW ALL MESSES <FaChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {POPULAR_MESSES_PREVIEW.map((mess) => (
            <div
              key={mess.id}
              className="bg-surface border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={mess.image}
                    alt={mess.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">
                    {mess.tag}
                  </span>
                  <div className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-text-primary shadow-sm">
                    <FaStar className="text-amber-400" /> {mess.rating} ({mess.reviewsCount})
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-heading font-extrabold text-lg text-text-primary group-hover:text-primary transition-colors">
                    {mess.name}
                  </h3>
                  <p className="text-xs text-text-secondary flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-primary shrink-0" /> {mess.location}
                  </p>
                  <p className="text-xs text-text-muted">{mess.cuisine}</p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-text-secondary">Monthly Plan</span>
                  <p className="text-lg font-extrabold font-heading text-text-primary">
                    ₹{mess.monthlyPrice.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] font-normal text-text-secondary">/mo</span>
                  </p>
                </div>
                <Link
                  to="/register"
                  className="px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================
          6. EDITORIAL STORYTELLING BANNER
         =================================================================== */}
      <section className="my-20 bg-text-primary text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <span className="editorial-watermark text-[16vw] top-1/2 -translate-y-1/2 left-0 text-white/5 pointer-events-none">
          DELICIOUS
        </span>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <span className="text-accent text-xs font-bold tracking-widest uppercase">
            THE MESSMATE PROMISE
          </span>
          <h2 className="text-display-2xl text-white">
            GOOD FOOD. <br />
            <span className="text-primary">GOOD ROUTINE.</span> GOOD LIFE.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We empower students to enjoy clean, healthy meals near their hostels while helping local mess owners modernize attendance, billing, and meal operations.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-xl"
            >
              JOIN MESSMATE TODAY <FaArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
