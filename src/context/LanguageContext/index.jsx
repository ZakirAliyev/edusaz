import { createContext, useContext, useState, useEffect } from 'react';
import i18n from "../../locales/i18n.js";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(i18n.language || 'en');

    useEffect(() => {
        const handleLanguageChange = (lng) => {
            setLanguage(lng);
            document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = lng;
        };

        // Listen to i18n language change events (including async GeoIP detection)
        i18n.on('languageChanged', handleLanguageChange);
        const currentLng = i18n.language || 'en';
        setLanguage(currentLng);
        document.documentElement.dir = currentLng === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLng;

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, []);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
    };


    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);

