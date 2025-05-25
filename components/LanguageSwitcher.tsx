import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import type { Language } from '../types';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useTranslations();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as Language);
  };

  return (
    <div className="flex items-center">
      <label htmlFor="language-select" className="sr-only">{t('languageSwitcherLabel')}</label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="bg-slate-700 text-slate-200 py-1.5 px-3 rounded-md text-xs hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
        aria-label={t('languageSwitcherLabel')}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
};