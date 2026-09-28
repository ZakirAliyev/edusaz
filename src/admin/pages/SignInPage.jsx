import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import '../admin.css';
import { env } from '@/config/env';
import BrandLogo from '@/components/Common/BrandLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoginUserMutation } from '@/services/apis/userApi';
import { Field, Spinner, useAdminBody } from '../components/common';
import { isSuperAdminSession, saveSuperAdminSession } from '../lib/auth';

const safeNext = (next) => (next && next.startsWith('/superadmin') && !next.startsWith('/superadmin/login') ? next : '/superadmin');

export default function SignInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const next = safeNext(params.get('next'));
  useAdminBody();

  if (isSuperAdminSession()) return <Navigate to={next} replace />;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    const nextErrors = {};
    if (!email) nextErrors.email = 'Email daxil edin.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Email formatı düzgün deyil.';
    if (!form.password) nextErrors.password = 'Şifrə daxil edin.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      const response = await loginUser({ email, password: form.password }).unwrap();
      const tokenData = response?.data || response;
      const token = tokenData?.accessToken || tokenData?.token || (typeof tokenData === 'string' ? tokenData : '');
      const role = (tokenData?.role || '').toLowerCase();

      if (!token) {
        setFormError('Server giriş tokeni qaytarmadı. Yenidən cəhd edin.');
        return;
      }
      if (role !== 'superadmin') {
        setFormError('Bu panelə yalnız SuperAdmin hesabı ilə daxil olmaq olar.');
        return;
      }
      saveSuperAdminSession(token, email);
      navigate(next, { replace: true });
    } catch (err) {
      setFormError(
        err?.status === 'FETCH_ERROR'
          ? `API-yə qoşulmaq mümkün olmadı (${env.apiBaseUrl}). Backend-in işlədiyini yoxlayın.`
          : err?.data?.message || 'Email və ya şifrə yanlışdır.'
      );
    }
  };

  return (
    <div className="admin-root flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 py-10">
      <BrandLogo size={34} />

      <Card className="w-full max-w-sm gap-6 shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full bg-accent text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <CardTitle className="text-xl">İdarəetmə panelinə giriş</CardTitle>
          <CardDescription>SuperAdmin hesabınızın məlumatlarını daxil edin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="grid gap-5">
            {formError && (
              <div role="alert" className="rounded-lg border border-destructive/20 bg-red-50 px-3 py-2.5 text-sm text-destructive">
                {formError}
              </div>
            )}

            <Field label="Email" error={errors.email}>
              {(p) => (
                <Input
                  {...p}
                  type="email"
                  autoComplete="username"
                  autoFocus
                  value={form.email}
                  onChange={set('email')}
                  placeholder="ad@edusaz.com"
                  disabled={isLoading}
                />
              )}
            </Field>

            <Field label="Şifrə" error={errors.password}>
              {(p) => (
                <div className="relative">
                  <Input
                    {...p}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
                    aria-pressed={showPassword}
                    className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              )}
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading && <Spinner />}
              {isLoading ? 'Daxil olunur…' : 'Daxil ol'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Button asChild variant="link" className="text-muted-foreground">
        {/* Full page load so the admin stylesheet isn't carried over to the public site. */}
        <a href="/">
          <ArrowLeft />
          Əsas sayta qayıt
        </a>
      </Button>

      {!env.isProduction && (
        <p className="text-xs text-muted-foreground">
          {env.mode} · {env.apiBaseUrl}
        </p>
      )}
    </div>
  );
}
