import { useEffect, useId } from 'react';
import { Loader2, MoreHorizontal, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const TONES = {
  success: 'border-transparent bg-success-soft text-success',
  warning: 'border-transparent bg-warning-soft text-warning',
  danger: 'border-transparent bg-red-50 text-destructive',
  info: 'border-transparent bg-info-soft text-info',
  brand: 'border-transparent bg-accent text-accent-foreground',
  neutral: 'border-transparent bg-muted text-muted-foreground',
};

export function StatusBadge({ tone = 'neutral', dot = true, className, children }) {
  return (
    <Badge variant="outline" className={cn('gap-1.5 rounded-full font-medium', TONES[tone], className)}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </Badge>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Axtar…', className }) {
  return (
    <div className={cn('relative w-full sm:w-72', className)}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="bg-card pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Axtarışı təmizlə"
          className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** Radix Select can't hold an empty string, so "nothing selected" is mapped to a sentinel. */
const NONE = '__none__';

export function SimpleSelect({ id, value, onValueChange, options, groups, placeholder, noneLabel, disabled, className, invalid, ariaLabel }) {
  const handleChange = (v) => onValueChange(v === NONE ? '' : v);
  const current = value === '' || value == null ? (noneLabel ? NONE : undefined) : String(value);
  const renderItem = (o) => (
    <SelectItem key={o.value} value={String(o.value)}>
      {o.label}
    </SelectItem>
  );
  return (
    <Select value={current} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger id={id} aria-invalid={invalid || undefined} aria-label={ariaLabel} className={cn('w-full bg-card', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {noneLabel && <SelectItem value={NONE}>{noneLabel}</SelectItem>}
        {options?.map(renderItem)}
        {groups?.map((g) => (
          <SelectGroup key={g.label}>
            <SelectLabel>{g.label}</SelectLabel>
            {g.options.map(renderItem)}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Field({ label, required, hint, error, className, children, id: idProp }) {
  const autoId = useId();
  const id = idProp || autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control = typeof children === 'function' ? children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined }) : children;
  return (
    <div className={cn('grid gap-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && <span aria-hidden className="text-destructive">*</span>}
        </Label>
      )}
      {control}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive" role="alert">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormSection({ title, description, children, className }) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-0.5">
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function RowActions({ label = 'Əməliyyatlar', items }) {
  const visible = items.filter(Boolean);
  const normal = visible.filter((i) => !i.destructive);
  const destructive = visible.filter((i) => i.destructive);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} className="text-muted-foreground data-[state=open]:bg-muted">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {normal.map(({ label: l, icon: Icon, onSelect }) => (
          <DropdownMenuItem key={l} onSelect={onSelect}>
            {Icon && <Icon />}
            {l}
          </DropdownMenuItem>
        ))}
        {normal.length > 0 && destructive.length > 0 && <DropdownMenuSeparator />}
        {destructive.map(({ label: l, icon: Icon, onSelect }) => (
          <DropdownMenuItem key={l} variant="destructive" onSelect={onSelect}>
            {Icon && <Icon />}
            {l}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Spinner({ className }) {
  return <Loader2 aria-hidden className={cn('size-4 animate-spin', className)} />;
}

export const includesText = (haystack, needle) =>
  (haystack || '').toString().toLocaleLowerCase('az').includes(needle.trim().toLocaleLowerCase('az'));

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  // Formatted by hand: browsers ship different (or no) az-AZ locale data.
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

/**
 * Dialogs, sheets and menus portal into <body>, which the public site styles dark.
 * While any admin screen is mounted, body gets the admin colors instead.
 */
export function useAdminBody() {
  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => document.body.classList.remove('admin-body');
  }, []);
}
