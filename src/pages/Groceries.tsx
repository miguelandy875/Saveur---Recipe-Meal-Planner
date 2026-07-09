import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChefHat, Circle, Plus, Printer, RefreshCw, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../services/AuthContext';
import { getSmartGroceryList } from '../services/groceryService';
import { GroceryItem } from '../types';

function currentMonday() {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

export const Groceries: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState('');
  const [weekStart] = useState(currentMonday());

  const fetchGroceries = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const generated = await getSmartGroceryList(weekStart);
      setItems(generated);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroceries();
  }, [user]);

  const toggleCheck = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const addCustomItem = () => {
    const name = customName.trim();
    if (!name) return;

    setItems([
      ...items,
      {
        id: `custom-${Date.now()}`,
        name,
        quantity: 1,
        unit: 'unit',
        checked: false,
        category: 'Custom',
      },
    ]);
    setCustomName('');
  };

  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category || 'Other'))), [items]);
  const remaining = items.filter((item) => !item.checked).length;

  if (!user) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm space-y-4">
        <ChefHat size={42} className="mx-auto text-brand-olive" />
        <h1 className="text-3xl font-serif">Sign in for groceries</h1>
        <p className="text-sm text-gray-500">
          The smart shopping list is generated from your own weekly meal plan.
        </p>
        <Link to="/profile" className="btn-olive inline-flex items-center justify-center h-12 px-6">
          Go to account
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">Grocery List</h1>
          <p className="text-gray-500 text-sm mt-1">
            {remaining} items remaining for the week of {weekStart}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchGroceries}
            className="h-11 px-4 bg-white rounded-xl shadow-sm border border-gray-100 text-brand-olive flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Generate
          </button>
          <button className="h-11 w-11 bg-white rounded-xl shadow-sm border border-gray-100 text-brand-olive flex items-center justify-center">
            <Printer size={20} />
          </button>
        </div>
      </header>

      <div className="bg-brand-olive/5 border border-brand-olive/10 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-olive flex items-center justify-center text-white">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg leading-none">Smart Shopping</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Built from planned recipes</p>
          </div>
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center space-y-3">
          <ShoppingBag size={42} className="mx-auto text-gray-300" />
          <h3 className="text-2xl font-serif">No groceries yet</h3>
          <p className="text-sm text-gray-500">Add recipes to your weekly planner, then generate the shopping list.</p>
          <Link to="/plan" className="text-[10px] font-bold uppercase tracking-widest text-brand-olive underline">
            Open planner
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <section key={category} className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-2">{category}</h3>
              <div className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden">
                <AnimatePresence>
                  {items
                    .filter((item) => (item.category || 'Other') === category)
                    .map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0 group select-none transition-colors ${
                          item.checked ? 'bg-gray-50/70' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleCheck(item.id)}>
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
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                          aria-label="Remove item"
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
      )}

      <div className="grid sm:grid-cols-[1fr_auto] gap-3 bg-white border border-gray-100 p-3 rounded-2xl">
        <input
          value={customName}
          onChange={(event) => setCustomName(event.target.value)}
          placeholder="Add custom item"
          className="h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden"
        />
        <button
          onClick={addCustomItem}
          className="h-12 px-5 rounded-xl bg-brand-olive text-white flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <Plus size={18} />
          Add
        </button>
      </div>
    </div>
  );
};
