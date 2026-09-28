import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetCountriesQuery, useGetScholarshipsQuery, useGetUniversitiesQuery } from '../../../services/apis/userApi';
import BrandLogo from '../../Common/BrandLogo.jsx';
import '../../../landing/i18n';
import './index.scss';

function Footer() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: universities } = useGetUniversitiesQuery(language);
  const { data: countries } = useGetCountriesQuery(language);
  const { data: scholarships } = useGetScholarshipsQuery(language);

  // Real counts from the API (the same queries the pages use, so they come from cache).
  const stats = [
    [universities?.length, t('footer.stats.universities')],
    [countries?.length, t('footer.stats.countries')],
    [scholarships?.length, t('footer.stats.scholarships')],
  ].filter(([value]) => value > 0);

  const columns = [
    {
      title: t('landing.footer.students'),
      links: [
        ['/universities', t('nav.browseUniversities')],
        ['/scholarships', t('nav.scholarships')],
        ['/courses', t('nav.courses', { defaultValue: 'Kurslar' })],
        ['/destinations', t('nav.destinations')],
        ['/ai-discovery', t('landing.features.match.title')],
      ],
    },
    {
      title: t('landing.footer.partners'),
      links: [
        ['/for-universities', t('nav.forUniversities')],
        ['/register', t('landing.partners.teach.cta')],
        ['/talents', t('nav.talents', { defaultValue: 'Gizli Bacarıqlar' })],
        ['/university-portal', t('footer.universityDashboard')],
      ],
    },
    {
      title: t('landing.footer.account'),
      links: [
        ['/signin', t('nav.signIn')],
        ['/register', t('landing.footer.signUp')],
        ['/profile', t('nav.profile')],
      ],
    },
  ];

  return (
    <footer id="footer" className="sf">
      <div className="sf__inner">
        <div className="sf__top">
          <div className="sf__brand">
            <Link to="/" className="sf__logo" aria-label="Edusaz">
              <BrandLogo size={30} />
            </Link>
            <p className="sf__tagline">{t('landing.footer.tagline')}</p>
            {stats.length > 0 && (
              <dl className="sf__stats">
                {stats.map(([value, label]) => (
                  <div key={label}>
                    <dt>{value}</dt>
                    <dd>{label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <nav className="sf__cols" aria-label="Footer">
            {columns.map((col) => (
              <div key={col.title} className="sf__col">
                <h2 className="sf__col-title">{col.title}</h2>
                <ul>
                  {col.links.map(([to, label]) => (
                    <li key={`${to}-${label}`}>
                      <Link to={to}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="sf__bottom">
          <p>
            © {new Date().getFullYear()} Edusaz. {t('footer.rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
