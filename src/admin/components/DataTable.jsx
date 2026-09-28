import { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * columns: [{ key, header, cell: (row) => node, className, headClassName }]
 * The caller resets `resetKey` (e.g. the search term) so paging jumps back to page 1.
 */
export function DataTable({
  columns,
  rows,
  loading,
  error,
  onRetry,
  getRowKey = (r) => r.id,
  pageSize = 15,
  resetKey,
  empty = {},
  caption,
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => setPage(0), [resetKey]);
  useEffect(() => {
    if (page > pageCount - 1) setPage(pageCount - 1);
  }, [page, pageCount]);

  const visible = rows.slice(page * pageSize, page * pageSize + pageSize);
  const showSkeleton = loading && rows.length === 0;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHeader className="bg-muted/60">
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={c.key} className={cn('h-10 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase', c.headClassName)}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {showSkeleton &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`s-${i}`} className="hover:bg-transparent">
                {columns.map((c) => (
                  <TableCell key={c.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!showSkeleton && error && rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="px-4 py-14">
                <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-red-50 text-destructive">
                    <AlertCircle className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Məlumatlar yüklənmədi</p>
                    <p className="text-sm whitespace-normal text-muted-foreground">{error}</p>
                  </div>
                  {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Yenidən cəhd et</Button>}
                </div>
              </TableCell>
            </TableRow>
          )}

          {!showSkeleton && !(error && rows.length === 0) && rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="px-4 py-14">
                <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Inbox className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{empty.title || 'Heç nə tapılmadı'}</p>
                    {empty.description && <p className="text-sm whitespace-normal text-muted-foreground">{empty.description}</p>}
                  </div>
                  {empty.action}
                </div>
              </TableCell>
            </TableRow>
          )}

          {visible.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((c) => (
                <TableCell key={c.key} className={cn('px-4 py-3', c.className)}>
                  {c.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {rows.length > pageSize && (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {page * pageSize + 1}–{Math.min(rows.length, (page + 1) * pageSize)} / {rows.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0} aria-label="Əvvəlki səhifə">
              <ChevronLeft />
              <span className="hidden sm:inline">Əvvəlki</span>
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {page + 1} / {pageCount}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= pageCount - 1} aria-label="Növbəti səhifə">
              <span className="hidden sm:inline">Növbəti</span>
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
