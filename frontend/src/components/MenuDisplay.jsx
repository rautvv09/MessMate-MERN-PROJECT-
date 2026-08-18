import { useState } from 'react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

const MealList = ({ items }) =>
  items.length > 0 ? (
    <ul className="text-xs font-medium text-text-secondary space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-xs text-text-muted italic">Not set</p>
  );

const MenuDisplay = ({ menu }) => {
  const todayKey = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [activeDay, setActiveDay] = useState(todayKey);

  if (!menu) return <p className="text-text-muted text-xs">Menu not available yet.</p>;

  const dayData = menu.weeklyMenu[activeDay];

  return (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-2xl p-4">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">Breakfast (Every Day)</h4>
        <MealList items={menu.breakfast} />
      </div>

      <div>
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeDay === day
                  ? 'bg-primary text-white shadow-xs'
                  : day === todayKey
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-background text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {DAY_LABELS[day]}
              {day === todayKey && <span className="ml-1 text-xs">•</span>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-background border border-border rounded-2xl p-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">Lunch</h4>
            <MealList items={dayData.lunch} />
          </div>
          <div className="bg-background border border-border rounded-2xl p-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">Dinner</h4>
            <MealList items={dayData.dinner} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDisplay;