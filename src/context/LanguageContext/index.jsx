import { createContext, useContext, useState, useEffect } from 'react';
import i18n from "../../locales/i18n.js";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(i18n.language || 'en');

    useEffect(() => {
        const handleLanguageChange = (lng) => {
            setLanguage(lng);
        };

        // Listen to i18n language change events (including async GeoIP detection)
        i18n.on('languageChanged', handleLanguageChange);
        setLanguage(i18n.language);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, []);

    const changeLanguage = (lang) => {
        setLanguage(lang);
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

