import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '../services/translationService';

/**
 * Custom React hook that automatically translates any text to the current active language (31 languages supported).
 * Uses multi-layer cache for instant render with zero UI lag.
 *
 * @param {string} text - The dynamic text from backend to translate.
 * @param {string} [sourceLang='auto'] - Source language (defaults to 'auto' / 'az').
 * @returns {string} - Translated text in the active language.
 */
export function useAutoTranslate(text, sourceLang = 'auto') {
  const { i18n } = useTranslation();
  const targetLang = (i18n.language || 'az').split('-')[0].toLowerCase();
  const [translated, setTranslated] = useState(text || '');

  useEffect(() => {
    if (!text || typeof text !== 'string' || !text.trim()) {
      setTranslated(text || '');
      return;
    }

    let isMounted = true;

    // Call translateText
    translateText(text, sourceLang === 'auto' ? 'auto' : sourceLang, targetLang)
      .then((res) => {
        if (isMounted && res) {
          setTranslated(res);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslated(text);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, targetLang, sourceLang]);

  return translated || text || '';
}

/**
 * AutoTranslate component for declarative dynamic text translation.
 * Usage: <AutoTranslate text={uni.description} />
 */
export function AutoTranslate({ text, sourceLang = 'auto', className = '' }) {
  const translated = useAutoTranslate(text, sourceLang);
  return className ? <span className={className}>{translated}</span> : <>{translated}</>;
}

export default useAutoTranslate;
