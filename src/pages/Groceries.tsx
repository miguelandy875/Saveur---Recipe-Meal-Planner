import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Circle, Plus, Trash2, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Groceries: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', name: 'Gorgonzola Cheese', amount: '150g', checked: false, category: 'Dairy' },
    { id: '2', name: 'Fresh Tagliatelle', amount: '250g', checked: true, category: 'Pasta' },
    { id: '3', name: 'Walnuts', amount: '50g', checked: false, category: 'Pantry' },
    { id: '4', name: 'Greek Yogurt', amount: '500g', checked: false, category: 'Dairy' },
    { id: '5', name: 'Blueberries', amount: '125g', checked: false, category: 'Produce' },
  ]);

  const toggleCheck = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif">Grocery List</h1>
          <p className="text-gray-500 text-sm mt-1">{items.filter(i => !i.checked).length} items remaining</p>
        </div>
        <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-brand-olive">
          <Printer size={20} />
        </button>
      </header>

      <div className="bg-brand-olive/5 border border-brand-olive/10 p-4 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-olive flex items-center justify-center text-white">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg leading-none">Smart Shopping</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Synced with meal plan</p>
          </div>
        </div>
        <button className="bg-white px-4 py-2 rounded-xl text-[10px] font-bold text-brand-olive uppercase tracking-widest shadow-sm">
          Update
        </button>
      </div>

      <div className="space-y-8">
        {categories.map(cat => (
          <section key={cat} className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-2">{cat}</h3>
            <div className="bg-white rounded-[32px] border border-gray-50 shadow-xs overflow-hidden">
              <AnimatePresence>
                {items.filter(i => i.category === cat).map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 group select-none transition-colors ${item.checked ? 'bg-gray-50/50' : ''}`}
                  >
                    <div 
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                      onClick={() => toggleCheck(item.id)}
                    >
                      {item.checked ? (
                        <CheckCircle2 size={24} className="text-brand-olive fill-brand-olive/10" />
                      ) : (
                        <Circle size={24} className="text-gray-200" />
                      )}
                      <div className="flex flex-col">
                        <span className={`font-semibold text-sm transition-all ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] font-bold text-brand-olive/60 uppercase tracking-widest leading-none mt-0.5">
                          {item.amount}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))}
      </div>

      <button className="w-full h-16 bg-dashed border-2 border-gray-100 bg-white rounded-[32px] flex items-center justify-center gap-3 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:border-brand-olive/30 hover:text-brand-olive transition-all">
        <Plus size={20} />
        Add custom item
      </button>
    </div>
  );
};
