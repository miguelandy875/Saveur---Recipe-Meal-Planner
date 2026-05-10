import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, ChefHat, Clock } from 'lucide-react';

export const Plan: React.FC = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [selectedDay, setSelectedDay] = useState(0);

  const meals = {
    'breakfast': { title: 'Greek Yogurt Bowl', time: '10 min', img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&fit=crop' },
    'lunch': { title: 'Quinoa Buddha Bowl', time: '15 min', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&fit=crop' },
    'dinner': null,
    'snack': { title: 'Apple & Almonds', time: '5 min', img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=200&fit=crop' }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif">Meal Planner</h1>
          <p className="text-gray-500 text-sm mt-1">Week of May 10 - May 16</p>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 italic font-serif text-brand-olive text-sm">
          May 2026
        </div>
      </header>

      {/* Date Picker */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {days.map((day, i) => (
          <button 
            key={day}
            onClick={() => setSelectedDay(i)}
            className={`flex flex-col items-center gap-2 min-w-[64px] py-4 rounded-3xl transition-all ${selectedDay === i ? 'bg-brand-olive text-white shadow-lg shadow-brand-olive/20' : 'bg-white text-gray-500 border border-gray-100'}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{day}</span>
            <span className={`text-xl font-serif ${selectedDay === i ? 'text-white' : 'text-gray-900'}`}>{10 + i}</span>
            {selectedDay === i && <div className="w-1 h-1 rounded-full bg-white animate-bounce" />}
          </button>
        ))}
      </div>

      {/* Meal Selection */}
      <div className="space-y-6">
        {Object.entries(meals).map(([type, meal]) => (
          <div key={type} className="space-y-3">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{type}</h3>
              {!meal && <span className="text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase">Empty Slot</span>}
            </div>
            
            {meal ? (
              <motion.div 
                whileHover={{ x: 5 }}
                className="bg-white p-3 rounded-[28px] border border-gray-100 shadow-xs flex items-center gap-4 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                  <img src={meal.img} className="w-full h-full object-cover" alt={meal.title} />
                </div>
                <div className="flex-1">
                  <h4 className="font-serif text-lg leading-tight">{meal.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    <Clock size={12} />
                    <span>{meal.time}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ) : (
              <button className="w-full bg-dashed border-2 border-gray-100 bg-white p-6 rounded-[28px] flex flex-col items-center justify-center gap-2 text-gray-400 group hover:border-brand-olive/30 hover:text-brand-olive transition-all">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-olive/10 group-hover:text-brand-olive transition-colors">
                  <Plus size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Pick a recipe</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-brand-olive rounded-[32px] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <h3 className="text-xl font-serif mb-2 relative z-10 text-brand-cream">Nutritional Insight</h3>
        <p className="text-sm opacity-80 leading-relaxed relative z-10">
          Your current plan for Monday is well-balanced. You're meeting 85% of your recommended protein intake.
        </p>
        <div className="mt-4 flex gap-4 relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase opacity-60">Calories</span>
            <span className="text-sm font-bold">1,840 kcal</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase opacity-60">Protein</span>
            <span className="text-sm font-bold">65g</span>
          </div>
        </div>
      </div>
    </div>
  );
};
