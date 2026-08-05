import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateDayMenu, updateBreakfast } from '../services/menuService';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };

// Converts a newline-separated textarea value into a clean array of items,
// mirroring the same "text field <-> array" conversion used for Tags on the Mess Form
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
    <div>
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-800 block mb-2">
          Breakfast (same every day)
        </label>
        <textarea
          value={breakfastText}
          onChange={(e) => setBreakfastText(e.target.value)}
          rows={3}
          placeholder={'One item per line\ne.g. Poha\nTea'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
        />
        <button
          onClick={handleSaveBreakfast}
          disabled={isSaving}
          className="text-sm bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-4 py-1.5 rounded-lg"
        >
          Save Breakfast
        </button>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => switchDay(day)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium shrink-0 ${
              activeDay === day ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {DAY_LABELS[day].slice(0, 3)}
          </button>
        ))}
      </div>

      <p className="text-sm font-semibold text-gray-800 mb-2">{DAY_LABELS[activeDay]}</p>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Lunch</label>
          <textarea
            value={dayText.lunch}
            onChange={(e) => setDayText({ ...dayText, lunch: e.target.value })}
            rows={4}
            placeholder={'One item per line'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Dinner</label>
          <textarea
            value={dayText.dinner}
            onChange={(e) => setDayText({ ...dayText, dinner: e.target.value })}
            rows={4}
            placeholder={'One item per line'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleSaveDay}
        disabled={isSaving}
        className="text-sm bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white px-4 py-1.5 rounded-lg"
      >
        Save {DAY_LABELS[activeDay]}'s Menu
      </button>
    </div>
  );
};

export default MenuEditor;