
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Language, Translations, LanguageContextType } from '../types';

// Default empty translations to avoid errors before loading
const defaultTranslationsRecord: Record<Language, Translations> = {
  en: {},
  es: {},
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem('eldenRingSaveUtil_lang') as Language | null : null;
    return (storedLang === 'en' || storedLang === 'es') ? storedLang : 'en';
  });

  const [translations, setTranslationsData] = useState<Record<Language, Translations>>(defaultTranslationsRecord);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(true);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoadingTranslations(true);
      setTranslationError(null);
      try {
        // Use root-relative paths for fetch
        const enPromise = fetch('/locales/en.json').then(res => {
          if (!res.ok) throw new Error(`Failed to load en.json: ${res.status} ${res.statusText}`);
          return res.json();
        });
        const esPromise = fetch('/locales/es.json').then(res => {
          if (!res.ok) throw new Error(`Failed to load es.json: ${res.status} ${res.statusText}`);
          return res.json();
        });

        const [enData, esData] = await Promise.all([enPromise, esPromise]);
        
        setTranslationsData({ en: enData, es: esData });

        const storedLang = typeof window !== 'undefined' ? localStorage.getItem('eldenRingSaveUtil_lang') as Language | null : null;
        if (storedLang && (storedLang === 'en' || storedLang === 'es')) {
            setLanguageState(storedLang);
        } else {
            setLanguageState('en'); 
        }

      } catch (error) {
        console.error('Failed to load translations:', error);
        setTranslationError(error instanceof Error ? error.message : String(error));
        setTranslationsData(defaultTranslationsRecord); 
      } finally {
        setIsLoadingTranslations(false);
      }
    };

    fetchTranslations();
  }, []);

  useEffect(() => {
    if (!isLoadingTranslations && typeof window !== 'undefined') { 
        localStorage.setItem('eldenRingSaveUtil_lang', language);
        document.documentElement.lang = language;
    }
  }, [language, isLoadingTranslations]);

  const setLanguage = (lang: Language) => {
    if (translations[lang] && Object.keys(translations[lang]).length > 0) {
      setLanguageState(lang);
    } else if (translations[lang]) { 
      setLanguageState(lang);
      console.warn(`Translations for language "${lang}" might be empty. Switching anyway.`);
    }
    else {
      console.warn(`Language "${lang}" not supported or translations not loaded. Defaulting to 'en'.`);
      setLanguageState('en');
    }
  };

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    if (isLoadingTranslations) {
      return key; 
    }
    if (translationError && !(translations[language] && Object.keys(translations[language]).length > 0) ){
        // If there was an error and current bundle is empty, return key
        return key;
    }

    const langBundle = translations[language] || translations.en; // Fallback to English bundle
    
    const keys = key.split('.');
    let result: string | Translations | undefined = langBundle;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        if (language !== 'en' && translations.en) { // Try English if not current and English is loaded
            let fallbackResult: string | Translations | undefined = translations.en;
            for (const enK of keys) {
                 if (fallbackResult && typeof fallbackResult === 'object' && enK in fallbackResult) {
                    fallbackResult = fallbackResult[enK];
                 } else {
                    console.warn(`Translation key "${key}" not found in "${language}" or fallback "en".`);
                    return key; 
                 }
            }
            result = fallbackResult;
            break; 
        } else { // Key not found in current (which might be 'en') or 'en' fallback is not applicable/available
            console.warn(`Translation key "${key}" not found for language "${language}". Current bundle:`, langBundle);
            return key;
        }
      }
    }
    
    if (typeof result === 'string') {
      if (replacements) {
        return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
          return acc.replace(new RegExp(`{${placeholder}}`, 'g'), String(value));
        }, result);
      }
      return result;
    }

    console.warn(`Translation key "${key}" did not resolve to a string in language "${language}". Value is: `, result);
    return key;
  }, [language, translations, isLoadingTranslations, translationError]);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
