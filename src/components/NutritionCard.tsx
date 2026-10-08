import React from 'react';
import { Flame } from 'lucide-react';
import { useI18n } from '../services/i18n';
import { RecipeNutrition } from '../types';

const formatAllergen = (code: string) => code.charAt(0) + code.slice(1).toLowerCase();

/** Nutrition card of a recipe (values come from the legacy nutritional database through the Saveur API). */
export const NutritionCard: React.FC<{ nutrition?: RecipeNutrition | null }> = ({ nutrition }) => {
  const { t } = useI18n();

  // Recipes created before the feature have no nutrition: show nothing rather than fake zeros.
  if (!nutrition) return null;

  if (nutrition.status === 'unavailable') {
    return (
      <section className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm" data-testid="nutrition-card">
        <h3 className="font-serif text-xl mb-2">{t('nutrition.title')}</h3>
        <p className="text-sm text-gray-400">{t('nutrition.unavailable')}</p>
      </section>
    );
  }

  // "≈" marks values that rely on converted quantities (pieces, spoons, estimated weights).
  const approx = nutrition.approximate ? '≈ ' : '';
  const rows: { label: string; unit: string; serving?: number; total: number | null }[] = [
    { label: t('nutrition.calories'), unit: 'kcal', serving: nutrition.perServing?.calories, total: nutrition.totalCalories },
    { label: t('nutrition.proteins'), unit: 'g', serving: nutrition.perServing?.proteins, total: nutrition.totalProteins },
    { label: t('nutrition.carbs'), unit: 'g', serving: nutrition.perServing?.carbs, total: nutrition.totalCarbs },
    { label: t('nutrition.fats'), unit: 'g', serving: nutrition.perServing?.fats, total: nutrition.totalFats },
  ];

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm space-y-4" data-testid="nutrition-card">
      <div className="flex items-center gap-2">
        <Flame size={18} className="text-brand-olive" />
        <h3 className="font-serif text-xl">{t('nutrition.title')}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">
              <th className="text-left py-1" />
              <th className="py-1">{t('nutrition.perServing')}</th>
              <th className="py-1">{t('nutrition.total')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-gray-50 text-right">
                <td className="text-left py-2 font-semibold text-gray-700">{row.label}</td>
                <td className="py-2 font-bold text-brand-olive">{row.serving == null ? '–' : `${approx}${row.serving}`} {row.unit}</td>
                <td className="py-2 text-gray-500">{row.total == null ? '–' : `${approx}${row.total}`} {row.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('nutrition.allergens')}</p>
        {nutrition.allergens.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {nutrition.allergens.map((allergen) => (
              <span key={allergen} className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100" data-testid="allergen-badge">
                {formatAllergen(allergen)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">{t('nutrition.noAllergens')}</p>
        )}
      </div>

      {nutrition.status === 'partial' && (
        <p className="text-xs text-amber-700" title={nutrition.skippedIngredients.map((item) => item.name).join(', ')}>
          {t('nutrition.partial', { count: nutrition.skippedIngredients.length })}
        </p>
      )}
      {nutrition.approximate && (
        <p className="text-xs text-gray-500" data-testid="nutrition-approximate-note">{t('nutrition.approximate')}</p>
      )}
      <p className="text-[10px] text-gray-400">{t('nutrition.source')}</p>
    </section>
  );
};
