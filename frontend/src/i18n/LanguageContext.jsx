import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { languages, translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguageState] = useState(() => {
    try {
      return localStorage.getItem('tutormind_language') || localStorage.getItem('mathlingo_language') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((langCode) => {
    if (translations[langCode]) {
      setCurrentLanguageState(langCode);
      try {
        localStorage.setItem('tutormind_language', langCode);
        localStorage.setItem('mathlingo_language', langCode);
      } catch (err) {
        console.error('Failed to save language preference to localStorage', err);
      }
    }
  }, []);

  const t = useCallback((key, params = {}) => {
    if (!key) return '';

    const keys = key.split('.');
    const getNestedValue = (obj) => {
      let curr = obj;
      for (const k of keys) {
        if (curr && typeof curr === 'object' && k in curr) {
          curr = curr[k];
        } else {
          return null;
        }
      }
      return typeof curr === 'string' ? curr : null;
    };

    // Attempt target language lookup
    let str = getNestedValue(translations[currentLanguage]);

    // Fallback to English if key is missing in current language
    if (str === null && currentLanguage !== 'en') {
      str = getNestedValue(translations.en);
    }

    if (str === null) {
      return key; // return key as ultimate fallback
    }

    // Replace {placeholder} parameters
    if (params && Object.keys(params).length > 0) {
      return str.replace(/\{(\w+)\}/g, (match, paramName) => {
        return paramName in params ? params[paramName] : match;
      });
    }

    return str;
  }, [currentLanguage]);

  const activeLangMeta = languages.find((l) => l.code === currentLanguage) || languages[0];

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages, activeLangMeta }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
