import React from 'react';
import { Languages } from 'lucide-react';
import { LanguageCode } from '../types';
import { useI18n } from '../services/i18n';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, languages, setLanguage } = useI18n();

  if (compact) {
    return (
      <label className="inline-flex h-10 items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-brand-olive transition-colors">
        <Languages size={16} className="text-brand-olive" />
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as LanguageCode)}
          className="bg-transparent outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-olive/30 rounded-md py-1"
          aria-label="Language"
        >
          {(Object.entries(languages) as Array<[LanguageCode, string]>).map(([code, name]) => (
            <option key={code} value={code}>
              {code.toUpperCase()}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-bold text-gray-500 shadow-sm">
      <Languages size={16} className="text-brand-olive" />
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        className="bg-transparent outline-hidden"
        aria-label="Language"
      >
        {(Object.entries(languages) as Array<[LanguageCode, string]>).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
};
