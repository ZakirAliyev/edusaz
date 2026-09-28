import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, ImagePlus, Link2, Trash2, Upload, X } from 'lucide-react';
import { resolveMediaUrl } from '@/config/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { errorMessage, uploadFile, uploadFiles } from '../lib/api';
import { PLACEHOLDER_IMAGE } from '../lib/constants';
import { Spinner } from './common';

const MAX_SIZE_MB = 10;

const validImages = (files) => {
  const images = files.filter((f) => f.type.startsWith('image/'));
  if (images.length !== files.length) toast.error('Yalnız şəkil faylları (PNG, JPG, WEBP) qəbul olunur.');
  const small = images.filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024);
  if (small.length !== images.length) toast.error(`Hər şəkil ən çox ${MAX_SIZE_MB} MB ola bilər.`);
  return small;
};

const fallbackImg = (e) => {
  if (e.currentTarget.src !== PLACEHOLDER_IMAGE) e.currentTarget.src = PLACEHOLDER_IMAGE;
};

/** Single image: upload from computer or paste a URL. */
export function ImageField({ id, value, onChange, folder, disabled, aspect = 'aspect-video', onBusyChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const setBusy = (b) => {
    setUploading(b);
    onBusyChange?.(b);
  };

  const handleFile = async (e) => {
    const [file] = validImages(Array.from(e.target.files || []));
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadFile(file, folder));
      toast.success('Şəkil yükləndi.');
    } catch (err) {
      toast.error(errorMessage(err, 'Şəkil yüklənmədi.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className={`relative w-full shrink-0 overflow-hidden rounded-lg border bg-muted sm:w-44 ${aspect}`}>
        {value ? (
          <img src={resolveMediaUrl(value)} alt="Seçilmiş şəkil" onError={fallbackImg} className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImagePlus className="size-6" />
            <span className="text-xs">Şəkil yoxdur</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Spinner className="size-5 text-primary" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} tabIndex={-1} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled || uploading}>
            <Upload />
            {uploading ? 'Yüklənir…' : value ? 'Şəkli dəyiş' : 'Kompüterdən yüklə'}
          </Button>
          {value && !uploading && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')} disabled={disabled} className="text-muted-foreground">
              <X />
              Sil
            </Button>
          )}
        </div>
        <div className="relative">
          <Link2 aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={id}
            type="url"
            inputMode="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="və ya şəkil linkini yapışdırın (https://…)"
            disabled={disabled || uploading}
            className="bg-card pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPG və ya WEBP · maksimum {MAX_SIZE_MB} MB</p>
      </div>
    </div>
  );
}

/** Multiple gallery images. */
export function GalleryField({ value, onChange, folder, disabled, onBusyChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = validImages(Array.from(e.target.files || []));
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    onBusyChange?.(true);
    try {
      const urls = await uploadFiles(files, folder);
      onChange([...(value || []), ...urls]);
      toast.success(`${urls.length} şəkil əlavə olundu.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Şəkillər yüklənmədi.'));
    } finally {
      setUploading(false);
      onBusyChange?.(false);
    }
  };

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} tabIndex={-1} />
      {value?.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((url, idx) => (
            <li key={`${url}-${idx}`} className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
              <img src={resolveMediaUrl(url)} alt={`Qalereya şəkli ${idx + 1}`} onError={fallbackImg} className="size-full object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                disabled={disabled}
                aria-label={`${idx + 1}-ci şəkli sil`}
                className="absolute top-1.5 right-1.5 bg-white/90 shadow-sm hover:bg-white"
              >
                <X />
              </Button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-sm text-muted-foreground hover:border-primary hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              {uploading ? <Spinner /> : <ImagePlus className="size-5" />}
              {uploading ? 'Yüklənir…' : 'Əlavə et'}
            </button>
          </li>
        </ul>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center hover:border-primary hover:bg-accent disabled:opacity-50"
        >
          {uploading ? <Spinner className="size-5 text-primary" /> : <ImagePlus className="size-6 text-muted-foreground" />}
          <span className="text-sm font-medium text-foreground">{uploading ? 'Şəkillər yüklənir…' : 'Kampus şəkillərini seçin'}</span>
          <span className="text-xs text-muted-foreground">Birdən çox şəkil seçə bilərsiniz</span>
        </button>
      )}
    </div>
  );
}

const isHttpUrl = (s) => /^https?:\/\/\S+\.\S+/i.test(s);

/** List of video links (YouTube, Vimeo…). */
export function VideoLinksField({ id, value, onChange, disabled }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const add = () => {
    const url = draft.trim();
    if (!isHttpUrl(url)) {
      setError('Düzgün link daxil edin (https:// ilə başlamalıdır).');
      return;
    }
    if ((value || []).includes(url)) {
      setError('Bu link artıq əlavə olunub.');
      return;
    }
    onChange([...(value || []), url]);
    setDraft('');
    setError('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          id={id}
          type="url"
          inputMode="url"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="https://www.youtube.com/watch?v=…"
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          className="bg-card"
        />
        <Button type="button" variant="outline" onClick={add} disabled={disabled || !draft.trim()}>
          Əlavə et
        </Button>
      </div>
      {error && <p className="text-xs font-medium text-destructive" role="alert">{error}</p>}
      {value?.length > 0 && (
        <ul className="divide-y rounded-lg border">
          {value.map((url, idx) => (
            <li key={url} className="flex items-center gap-2 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm text-foreground" title={url}>{url}</span>
              <Button asChild variant="ghost" size="icon-sm" aria-label="Videonu yeni pəncərədə aç">
                <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink /></a>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                disabled={disabled}
                aria-label="Linki sil"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
