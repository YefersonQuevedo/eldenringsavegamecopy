import { useContext } from 'react';
// Fix: Import LanguageContextType from '../types' as it's defined there.
import { LanguageContext } from '../contexts/LanguageContext';
import type { LanguageContextType } from '../types';

export const useTranslations = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }
  return context;
};