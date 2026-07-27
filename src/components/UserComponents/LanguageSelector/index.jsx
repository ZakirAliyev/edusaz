import { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetLanguagesQuery } from '../../../services/apis/userApi';
import './index.scss';

const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// Fallback list of 31 supported languages
const fallbackLanguages = [
  { code: 'az', flag: '🇦🇿', name: 'Azərbaycanca' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
  { code: 'se', flag: '🇸🇪', name: 'Svenska' },
  { code: 'no', flag: '🇳🇴', name: 'Norsk' },
  { code: 'fi', flag: '🇫🇮', name: 'Suomi' },
  { code: 'dk', flag: '🇩🇰', name: 'Dansk' },
  { code: 'gr', flag: '🇬🇷', name: 'Ελληνικά' },
  { code: 'hu', flag: '🇭🇺', name: 'Magyar' },
  { code: 'cz', flag: '🇨🇿', name: 'Čeština' },
  { code: 'ro', flag: '🇷🇴', name: 'Română' },
  { code: 'bg', flag: '🇧🇬', name: 'Български' },
  { code: 'hr', flag: '🇭🇷', name: 'Hrvatski' },
  { code: 'sk', flag: '🇸🇰', name: 'Slovenčina' },
  { code: 'ua', flag: '🇺🇦', name: 'Українська' },
  { code: 'ge', flag: '🇬🇪', name: 'ქართული' },
  { code: 'am', flag: '🇦🇲', name: 'Հայերեն' },
  { code: 'kz', flag: '🇰🇿', name: 'Қазақша' },
  { code: 'uz', flag: '🇺🇿', name: 'Oʻzbekcha' },
  { code: 'jp', flag: '🇯🇵', name: '日本語' },
  { code: 'kr', flag: '🇰🇷', name: '한국어' }
];


export function LanguageSelector({ isMobile = false }) {
  const { language, changeLanguage } = useLanguage();
  const { data: backendLanguages = [] } = useGetLanguagesQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Guarantee all 31 languages are always present even if DB only returned 3 initial rows
  const supportedLanguages = useMemo(() => {
    const map = new Map();
    fallbackLanguages.forEach(l => map.set(l.code.toLowerCase(), l));
    backendLanguages.forEach(b => {
      if (b && b.code) {
        const existing = map.get(b.code.toLowerCase());
        map.set(b.code.toLowerCase(), {
          code: b.code,
          name: existing?.name || b.name,
          flag: (b.flag && b.flag !== '🌐') ? b.flag : (existing?.flag || '🌐')
        });
      }
    });
    return Array.from(map.values());
  }, [backendLanguages]);

  const currentLangObj = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return supportedLanguages;
    const query = searchQuery.toLowerCase();
    return supportedLanguages.filter(
      l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query)
    );
  }, [searchQuery, supportedLanguages]);


  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`lang-selector-component ${isMobile ? 'is-mobile' : ''}`} ref={dropdownRef}>
      <button 
        type="button"
        className="lang-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <GlobeIcon />
        <span className="lang-flag">{currentLangObj?.flag || '🌐'}</span>
        <span className="lang-code">{(currentLangObj?.code || 'EN').toUpperCase()}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu">
          {supportedLanguages.length > 5 && (
            <div className="lang-search-box">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="lang-list">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map(l => (
                <button
                  key={l.code}
                  type="button"
                  className={`lang-option ${l.code === language ? 'active' : ''}`}
                  onClick={() => handleSelect(l.code)}
                >
                  <span className="opt-flag">{l.flag || '🌐'}</span>
                  <span className="opt-name">{l.name}</span>
                  <span className="opt-code">{l.code.toUpperCase()}</span>
                  {l.code === language && <span className="opt-check"><CheckIcon /></span>}
                </button>
              ))
            ) : (
              <div className="no-lang-found">No language found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
