import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateDayMenu, updateBreakfast } from '../services/menuService';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };

const parseItems = (text) => text.split('\n').map((i) => i.trim()).filter(Boolean);

const MenuEditor = ({ messId, menu, onMenuChange }) => {
  const [activeDay, setActiveDay] = useState('monday');
  const [breakfastText, setBreakfastText] = useState(menu.breakfast.join('\n'));
  const [dayText, setDayText] = useState({
    lunch: menu.weeklyMenu[activeDay].lunch.join('\n'),
    dinner: menu.weeklyMenu[activeDay].dinner.join('\n'),
  });
  const [isSaving, setIsSaving] = useState(false);

  const switchDay = (day) => {
    setActiveDay(day);
    setDayText({
      lunch: menu.weeklyMenu[day].lunch.join('\n'),
      dinner: menu.weeklyMenu[day].dinner.join('\n'),
    });
  };

  const handleSaveDay = async () => {
    setIsSaving(true);
    try {
      const { data } = await updateDayMenu(messId, activeDay, {
        lunch: parseItems(dayText.lunch),
        dinner: parseItems(dayText.dinner),
      });
      onMenuChange(data.data.menu);
      toast.success(`${DAY_LABELS[activeDay]}'s menu saved`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save menu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBreakfast = async () => {
    setIsSaving(true);
    try {
      const { data } = await updateBreakfast(messId, parseItems(breakfastText));
      onMenuChange(data.data.menu);
      toast.success('Breakfast menu saved');
    } catch (error) {
      toast.error('Could not save breakfast menu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-2xl p-5">
        <label className="text-xs font-bold text-text-primary block mb-2">
          Breakfast (same every day)
        </label>
        <textarea
          value={breakfastText}
          onChange={(e) => setBreakfastText(e.target.value)}
          rows={3}
          placeholder={'One item per line\ne.g. Poha\nTea'}
          className="w-full px-3 py-2 bg-surface border border-border text-text-primary placeholder:text-text-muted rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={handleSaveBreakfast}
          disabled={isSaving}
          className="text-xs bg-surface border border-border hover:border-primary text-text-primary font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
        >
          Save Breakfast
        </button>
      </div>

      <div>
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => switchDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeDay === day ? 'bg-primary text-white shadow-xs' : 'bg-background text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {DAY_LABELS[day].slice(0, 3)}
            </button>
          ))}
        </div>

        <h4 className="text-sm font-extrabold font-heading text-text-primary mb-3">{DAY_LABELS[activeDay]} Menu</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">Lunch</label>
            <textarea
              value={dayText.lunch}
              onChange={(e) => setDayText({ ...dayText, lunch: e.target.value })}
              rows={4}
              placeholder={'One item per line'}
              className="w-full px-3 py-2 bg-background border border-border text-text-primary placeholder:text-text-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">Dinner</label>
            <textarea
              value={dayText.dinner}
              onChange={(e) => setDayText({ ...dayText, dinner: e.target.value })}
              rows={4}
              placeholder={'One item per line'}
              className="w-full px-3 py-2 bg-background border border-border text-text-primary placeholder:text-text-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <button
          onClick={handleSaveDay}
          disabled={isSaving}
          className="text-xs bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md"
        >
          Save {DAY_LABELS[activeDay]}'s Menu
        </button>
      </div>
    </div>
  );
};

export default MenuEditor;