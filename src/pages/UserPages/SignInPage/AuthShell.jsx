import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BadgeCheck, Eye, EyeOff, Languages, Loader2, Wallet } from 'lucide-react';
import '../../../landing/i18n';
import './auth.scss';

// Benefit bullets reuse the landing "Why Edusaz" copy, which is translated in every language.
const BENEFITS = [
  { key: 'free', icon: Wallet },
  { key: 'verified', icon: BadgeCheck },
  { key: 'languages', icon: Languages },
];

/** Shared layout for /signin, /register and /register/details: form card + calm benefits column. */
export function AuthShell({ children, className = '' }) {
  const { t } = useTranslation();

  return (
    <main className={`ds-page au-page ${className}`.trim()}>
      <div className="ds-container au-grid">
        <div className="au-main" data-reveal>
          <div className="ds-card au-card">{children}</div>
        </div>

        <aside className="au-aside" aria-labelledby="au-aside-title" data-reveal style={{ '--delay': '120ms' }}>
          <p className="ds-eyebrow">{t('landing.why.title')}</p>
          <h2 id="au-aside-title" className="au-aside__title">{t('auth.subtitle')}</h2>
          <ul className="au-benefits">
            {BENEFITS.map(({ key, icon: Icon }) => (
              <li key={key} className="au-benefit">
                <span className="au-benefit__icon" aria-hidden>
                  <Icon />
                </span>
                <div>
                  <h3 className="au-benefit__title">{t(`landing.why.${key}.title`)}</h3>
                  <p className="au-benefit__desc">{t(`landing.why.${key}.desc`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}

/** Two-step progress indicator for the registration flow. */
export function AuthSteps({ current, total = 2 }) {
  const { t } = useTranslation();
  const label = t('pages.auth.step', { defaultValue: 'Addım {{current}} / {{total}}', current, total });

  return (
    <div className="au-steps">
      <span className="au-steps__label">{label}</span>
      <div
        className="au-steps__bar"
        role="progressbar"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} data-done={i < current ? 'true' : 'false'} />
        ))}
      </div>
    </div>
  );
}

/** Labelled input with optional leading icon, trailing slot and inline error. */
export function AuthField({ id, label, error, icon: Icon, trailing, inputRef, ...inputProps }) {
  const errorId = `${id}-error`;

  return (
    <div className="ds-field au-field">
      <label className="ds-label" htmlFor={id}>{label}</label>
      <div className="au-input" data-icon={Icon ? 'true' : 'false'} data-trailing={trailing ? 'true' : 'false'}>
        {Icon && <Icon className="au-input__icon" aria-hidden />}
        <input
          id={id}
          ref={inputRef}
          className="ds-input"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} className="ds-error au-field__error">{error}</p>
      )}
    </div>
  );
}

/** Password input with an accessible show/hide toggle. */
export function PasswordField(props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const toggleLabel = visible
    ? t('pages.auth.hidePassword', 'Şifrəni gizlət')
    : t('pages.auth.showPassword', 'Şifrəni göstər');

  return (
    <AuthField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={(
        <button
          type="button"
          className="au-input__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={toggleLabel}
          aria-pressed={visible}
          title={toggleLabel}
        >
          {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
        </button>
      )}
    />
  );
}

/** Primary submit button with an inline loading state. */
export function AuthSubmit({ loading, children }) {
  return (
    <button type="submit" className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block au-submit" disabled={loading} aria-busy={loading}>
      {loading ? <Loader2 className="au-spin" aria-hidden /> : null}
      <span>{children}</span>
      {!loading && <ArrowRight className="au-submit__arrow" aria-hidden />}
    </button>
  );
}
