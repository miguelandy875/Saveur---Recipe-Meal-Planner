import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChefHat, Circle, Plus, Printer, RefreshCw, ShoppingBag, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../services/AuthContext';
import {
  addCustomGroceryItem,
  getSmartGroceryList,
  removeGroceryItem,
  updateGroceryItemChecked,
} from '../services/groceryService';
import { useI18n } from '../services/i18n';
import { GroceryItem, ShoppingCategory } from '../types';
import { SHOPPING_CATEGORY_ORDER, suggestShoppingCategory } from '../utils/shoppingCategories';

function currentMonday() {
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

export const Groceries: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingCustom, setSavingCustom] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customQuantity, setCustomQuantity] = useState(1);
  const [customUnit, setCustomUnit] = useState('unit');
  const [customCategory, setCustomCategory] = useState<ShoppingCategory>('OTHER');
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

  const categoryLabel = (category: ShoppingCategory) => t(`shoppingCategory.${category}` as any);

  const toggleCheck = async (id: string) => {
    const item = items.find((currentItem) => currentItem.id === id);
    if (!item) return;

    const nextChecked = !item.checked;
    setItems(items.map((currentItem) => (currentItem.id === id ? { ...currentItem, checked: nextChecked } : currentItem)));

    try {
      await updateGroceryItemChecked(id, weekStart, nextChecked);
    } catch (error) {
      console.error(error);
      setItems(items);
    }
  };

  const removeItem = async (id: string) => {
    const previous = items;
    setItems(items.filter((item) => item.id !== id));

    try {
      const nextItems = await removeGroceryItem(id, weekStart);
      setItems(nextItems);
    } catch (error) {
      console.error(error);
      setItems(previous);
    }
  };

  const openCustomForm = () => {
    setCustomName('');
    setCustomQuantity(1);
    setCustomUnit('unit');
    setCustomCategory('OTHER');
    setCustomOpen(true);
  };

  const handleCustomNameChange = (name: string) => {
    setCustomName(name);
    const suggestion = suggestShoppingCategory(name);
    if (suggestion !== 'OTHER') {
      setCustomCategory(suggestion);
    }
  };

  const addCustomItem = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = customName.trim();
    if (!name) return;

    setSavingCustom(true);
    try {
      const nextItems = await addCustomGroceryItem({
        weekStart,
        name,
        quantity: customQuantity,
        unit: customUnit,
        category: customCategory,
      });
      setItems(nextItems);
      setCustomOpen(false);
      setCustomName('');
    } finally {
      setSavingCustom(false);
    }
  };

  const groupedItems = useMemo(
    () =>
      SHOPPING_CATEGORY_ORDER.map((category) => ({
        category,
        items: items.filter((item) => (item.category || 'OTHER') === category),
      })).filter((group) => group.items.length > 0),
    [items]
  );
  const remaining = items.filter((item) => !item.checked).length;
  const suggestedCategory = suggestShoppingCategory(customName);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm space-y-4">
        <ChefHat size={42} className="mx-auto text-brand-olive" />
        <h1 className="text-3xl font-serif">{t('groceries.signInTitle')}</h1>
        <p className="text-sm text-gray-500">{t('groceries.signInText')}</p>
        <Link to="/profile" className="btn-olive inline-flex items-center justify-center h-12 px-6">
          {t('create.goToAccount')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">{t('groceries.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('groceries.remaining', { count: remaining })}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="h-12 w-12 bg-white rounded-xl shadow-sm border border-gray-100 text-brand-olive flex items-center justify-center"
          aria-label={t('common.print')}
        >
          <Printer size={20} />
        </button>
      </header>

      <div className="bg-brand-olive/5 border border-brand-olive/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-olive flex items-center justify-center text-white">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="font-serif text-lg leading-none">{t('groceries.smart')}</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{t('groceries.synced')}</p>
          </div>
        </div>
        <button
          onClick={fetchGroceries}
          className="h-10 px-5 bg-white rounded-xl shadow-sm border border-gray-100 text-brand-olive flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {t('common.update')}
        </button>
      </div>

      {items.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center space-y-3">
          <ShoppingBag size={42} className="mx-auto text-gray-300" />
          <h3 className="text-2xl font-serif">{t('groceries.noGroceries')}</h3>
          <p className="text-sm text-gray-500">{t('groceries.noGroceriesText')}</p>
          <Link to="/plan" className="text-[10px] font-bold uppercase tracking-widest text-brand-olive underline">
            {t('groceries.openPlanner')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupedItems.map(({ category, items: categoryItems }) => (
            <section key={category} className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-2">{categoryLabel(category)}</h3>
              <div className="bg-white rounded-2xl border border-gray-50 shadow-sm overflow-hidden min-h-16">
                <AnimatePresence>
                  {categoryItems.map((item) => (
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
                      <button className="flex items-center gap-4 flex-1 text-left" onClick={() => toggleCheck(item.id)}>
                        {item.checked ? (
                          <CheckCircle2 size={25} className="text-brand-olive fill-brand-olive/10 shrink-0" />
                        ) : (
                          <Circle size={25} className="text-gray-200 shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className={`font-semibold text-sm transition-all ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] font-bold text-brand-olive/60 uppercase tracking-widest leading-none mt-1">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                        aria-label={t('groceries.removeItem')}
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

      <button
        onClick={openCustomForm}
        className="w-full h-16 rounded-full bg-white border border-gray-100 shadow-sm text-brand-olive flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest hover:border-brand-olive/30 transition-colors"
      >
        <Plus size={20} />
        {t('groceries.addCustomAction')}
      </button>

      <AnimatePresence>
        {customOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setCustomOpen(false)}
            />
            <motion.form
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 32, opacity: 0 }}
              onSubmit={addCustomItem}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl">{t('groceries.customDialogTitle')}</h2>
                <button type="button" onClick={() => setCustomOpen(false)} className="text-gray-400 hover:text-brand-olive">
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="grid gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('groceries.itemName')}</span>
                  <input
                    value={customName}
                    onChange={(event) => handleCustomNameChange(event.target.value)}
                    className="h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden focus:ring-2 focus:ring-brand-olive"
                    required
                  />
                </label>

                {customName.trim() && (
                  <p className="text-xs text-gray-500">
                    {t('groceries.suggestedCategory', { category: categoryLabel(suggestedCategory) })}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('groceries.quantity')}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customQuantity}
                      onChange={(event) => setCustomQuantity(Number(event.target.value))}
                      className="h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden focus:ring-2 focus:ring-brand-olive"
                      required
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('groceries.unit')}</span>
                    <input
                      value={customUnit}
                      onChange={(event) => setCustomUnit(event.target.value)}
                      className="h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden focus:ring-2 focus:ring-brand-olive"
                      required
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('groceries.category')}</span>
                  <select
                    value={customCategory}
                    onChange={(event) => setCustomCategory(event.target.value as ShoppingCategory)}
                    className="h-12 bg-gray-50 rounded-xl px-4 text-sm outline-hidden focus:ring-2 focus:ring-brand-olive"
                  >
                    {SHOPPING_CATEGORY_ORDER.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setCustomOpen(false)} className="flex-1 h-12 rounded-full border border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-widest">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={savingCustom} className="flex-1 h-12 rounded-full bg-brand-olive text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50">
                  {savingCustom ? t('common.loading') : t('groceries.saveCustom')}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
