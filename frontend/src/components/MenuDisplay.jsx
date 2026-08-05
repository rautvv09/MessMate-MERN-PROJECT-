import { useState } from 'react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

const MealList = ({ items }) =>
  items.length > 0 ? (
    <ul className="text-sm text-gray-600 space-y-1">
      {items.map((item, i) => <li key={i}>• {item}</li>)}
    </ul>
  ) : (
    <p className="text-sm text-gray-400 italic">Not set</p>
  );

const MenuDisplay = ({ menu }) => {
  const todayKey = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [activeDay, setActiveDay] = useState(todayKey);

  if (!menu) return <p className="text-gray-400">Menu not available yet.</p>;

  const dayData = menu.weeklyMenu[activeDay];

  return (
    <div>
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Breakfast (Every Day)</h4>
        <MealList items={menu.breakfast} />
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium shrink-0 ${
              activeDay === day
                ? 'bg-emerald-500 text-white'
                : day === todayKey
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {DAY_LABELS[day]}
            {day === todayKey && <span className="ml-1">•</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Lunch</h4>
          <MealList items={dayData.lunch} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Dinner</h4>
          <MealList items={dayData.dinner} />
        </div>
      </div>
    </div>
  );
};

export default MenuDisplay;