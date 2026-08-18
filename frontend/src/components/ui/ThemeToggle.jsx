import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
        theme === 'dark'
          ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:border-slate-600'
          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
      } ${className}`}
      aria-label="Toggle light/dark theme"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      {theme === 'dark' ? (
        <FaSun className="text-amber-400 text-sm animate-in spin-in-90 duration-300" />
      ) : (
        <FaMoon className="text-emerald-700 text-sm animate-in spin-in-90 duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;
