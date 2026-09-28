import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, BookOpen, CheckCircle2, RefreshCw, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useConfirmOrderPaymentMutation,
  useGetCoursePaymentsQuery,
  useGetCourseStudentsQuery,
  useRequestRefundMutation,
  useSyncCoursePaymentsMutation,
} from '@/services/apis/userApi';
import { DataTable } from '@/admin/components/DataTable';
import { Field, PageHeader, RowActions, SearchInput, SimpleSelect, Spinner, StatusBadge, formatDate, includesText } from '@/admin/components/common';
import { errorMessage } from '@/admin/lib/api';
import { useInstructor } from '../layout/InstructorLayout';
import { ENROLLMENT_STATUS, PAYMENT_STATUS, formatMoney } from '../lib/constants';

const asList = (d) => (Array.isArray(d) ? d : []);

function RefundDialog({ payment, onClose }) {
  const [requestRefund, { isLoading }] = useRequestRefundMutation();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (payment) setReason('');
  }, [payment]);

  const submit = async () => {
    try {
      const res = await requestRefund({ paymentId: payment.id, reason: reason.trim() }).unwrap();
      toast.success(res?.message || 'Sifariş ləğv edildi, məbləğ tələbəyə qaytarılır.');
      onClose();
    } catch (err) {
      toast.error(errorMessage(err, 'Ləğv etmək mümkün olmadı.'));
    }
  };

  return (
    <AlertDialog open={!!payment} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ödəniş ləğv edilsin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tələbənin kursa girişi dayandırılacaq və{' '}
            <strong className="text-foreground">{payment && formatMoney(payment.amount, payment.currency || 'AZN')}</strong> ePoint vasitəsilə kartına qaytarılacaq.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {payment && (
          <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5 rounded-lg bg-muted/60 p-3 text-sm">
            <dt className="text-muted-foreground">Tələbə</dt>
            <dd className="truncate text-foreground">{payment.studentName || payment.userEmail}</dd>
            <dt className="text-muted-foreground">Sifariş ID</dt>
            <dd className="truncate font-mono text-xs text-foreground">{payment.epointOrderId || '—'}</dd>
          </dl>
        )}
        <Field label="Səbəb" hint="İstəyə bağlı, qeyd kimi saxlanılır.">
          {(p) => <Input {...p} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Məs: tələbənin müraciəti ilə" disabled={isLoading} />}
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>İmtina</AlertDialogCancel>
          <Button variant="destructive" onClick={submit} disabled={isLoading}>
            {isLoading && <Spinner />}
            Ləğv et və pulu qaytar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConfirmPaymentDialog({ payment, onClose }) {
  const [confirmOrder, { isLoading }] = useConfirmOrderPaymentMutation();

  const submit = async () => {
    try {
      await confirmOrder({ orderId: payment.epointOrderId, paymentId: payment.id, status: 'success' }).unwrap();
      toast.success('Ödəniş təsdiqləndi, tələbə kursa əlavə olundu.');
      onClose();
    } catch (err) {
      toast.error(errorMessage(err, 'Ödəniş təsdiqlənmədi.'));
    }
  };

  return (
    <AlertDialog open={!!payment} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ödəniş əl ilə təsdiqlənsin?</AlertDialogTitle>
          <AlertDialogDescription>
            Bunu yalnız ePoint kabinetində ödənişin həqiqətən keçdiyini gördükdən sonra edin. Tələbə dərhal kursa əlavə olunacaq.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>İmtina</AlertDialogCancel>
          <Button onClick={submit} disabled={isLoading}>
            {isLoading && <Spinner />}
            Təsdiqlə
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function StudentsPage() {
  const { email, courses, coursesQuery } = useInstructor();
  const [params, setParams] = useSearchParams();
  const courseId = params.get('course') || courses[0]?.id || '';
  const [tab, setTab] = useState('students');
  const [search, setSearch] = useState('');
  const [refundTarget, setRefundTarget] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const studentsQuery = useGetCourseStudentsQuery({ courseId, email }, { skip: !courseId });
  const paymentsQuery = useGetCoursePaymentsQuery({ courseId, email }, { skip: !courseId });
  const [syncPayments, { isLoading: syncing }] = useSyncCoursePaymentsMutation();

  const students = asList(studentsQuery.data).filter((s) => !search || [s.studentName, s.studentEmail].some((f) => includesText(f, search)));
  const payments = asList(paymentsQuery.data).filter((p) => !search || [p.studentName, p.userEmail, p.epointOrderId].some((f) => includesText(f, search)));

  const sync = async () => {
    try {
      await syncPayments(courseId).unwrap();
      toast.success('Ödəniş statusları ePoint ilə yeniləndi.');
      paymentsQuery.refetch();
    } catch (err) {
      toast.error(errorMessage(err, 'Sinxronlaşdırma alınmadı.'));
    }
  };

  if (!coursesQuery.isLoading && courses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tələbələr və ödənişlər" />
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
          <BookOpen className="size-6 text-muted-foreground" />
          <p className="font-medium text-foreground">Hələ kursunuz yoxdur</p>
          <p className="text-sm text-muted-foreground">Tələbələr kursa yazıldıqdan sonra burada görünəcək.</p>
          <Button asChild size="sm">
            <Link to="/instructor-portal/courses/new">Kurs yarat</Link>
          </Button>
        </div>
      </div>
    );
  }

  const studentColumns = [
    {
      key: 'name',
      header: 'Tələbə',
      cell: (s) => (
        <div className="min-w-0">
          <p className="max-w-60 truncate font-medium text-foreground">{s.studentName || '—'}</p>
          <p className="max-w-60 truncate text-xs text-muted-foreground">{s.studentEmail}</p>
        </div>
      ),
    },
    { key: 'date', header: 'Qoşulma tarixi', cell: (s) => <span className="tabular-nums text-muted-foreground">{formatDate(s.enrolledAt)}</span> },
    {
      key: 'progress',
      header: 'İrəliləyiş',
      cell: (s) => (
        <div className="flex w-36 items-center gap-2">
          <Progress value={s.progress || 0} aria-label="İrəliləyiş" className="h-1.5" />
          <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{Math.round(s.progress || 0)}%</span>
        </div>
      ),
    },
    { key: 'paid', header: 'Ödənilib', className: 'tabular-nums', cell: (s) => formatMoney(s.pricePaid) },
    {
      key: 'status',
      header: 'Status',
      cell: (s) => {
        const m = ENROLLMENT_STATUS[s.status] || { label: s.status || '—', tone: 'neutral' };
        return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>;
      },
    },
  ];

  const paymentColumns = [
    {
      key: 'student',
      header: 'Tələbə',
      cell: (p) => (
        <div className="min-w-0">
          <p className="max-w-56 truncate font-medium text-foreground">{p.studentName || '—'}</p>
          <p className="max-w-56 truncate text-xs text-muted-foreground">{p.userEmail}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Məbləğ',
      cell: (p) => (
        <div>
          <p className="font-medium tabular-nums text-foreground">{formatMoney(p.amount, p.currency || 'AZN')}</p>
          <p className="max-w-40 truncate font-mono text-xs text-muted-foreground" title={p.epointOrderId}>{p.epointOrderId || '—'}</p>
        </div>
      ),
    },
    { key: 'date', header: 'Tarix', cell: (p) => <span className="tabular-nums text-muted-foreground">{formatDate(p.paidAt || p.createdDate)}</span> },
    {
      key: 'status',
      header: 'Status',
      cell: (p) => {
        if (p.refundStatus === 'Refunded') return <StatusBadge tone="danger">Geri qaytarılıb</StatusBadge>;
        if (p.refundStatus === 'Requested') return <StatusBadge tone="warning">Qaytarma gözləyir</StatusBadge>;
        const m = PAYMENT_STATUS[p.status] || { label: p.status || '—', tone: 'neutral' };
        return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>;
      },
    },
    {
      key: 'actions',
      header: <span className="sr-only">Əməliyyatlar</span>,
      headClassName: 'w-12',
      className: 'text-right',
      cell: (p) =>
        p.refundStatus === 'Refunded' ? null : (
          <RowActions
            items={[
              p.status === 'Pending' && { label: 'Əl ilə təsdiqlə', icon: CheckCircle2, onSelect: () => setConfirmTarget(p) },
              { label: 'Ləğv et və qaytar', icon: Undo2, destructive: true, onSelect: () => setRefundTarget(p) },
            ]}
          />
        ),
    },
  ];

  const pendingCount = asList(paymentsQuery.data).filter((p) => p.status === 'Pending' && p.refundStatus !== 'Refunded').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Tələbələr və ödənişlər" description="Kurslarınıza yazılan tələbələr və ePoint ödənişləri." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SimpleSelect
          value={courseId}
          onValueChange={(v) => setParams({ course: v }, { replace: true })}
          options={courses.map((c) => ({ value: c.id, label: c.title }))}
          placeholder="Kurs seçin"
          ariaLabel="Kurs seçin"
          className="sm:w-80"
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Ad, email və ya sifariş ID…" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="students" className="px-3">
              Tələbələr
              <span className="text-xs text-muted-foreground tabular-nums">{asList(studentsQuery.data).length}</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="px-3">
              Ödənişlər
              <span className="text-xs text-muted-foreground tabular-nums">{asList(paymentsQuery.data).length}</span>
            </TabsTrigger>
          </TabsList>
          {tab === 'payments' && (
            <Button variant="outline" size="sm" onClick={sync} disabled={syncing || !courseId}>
              {syncing ? <Spinner /> : <RefreshCw />}
              ePoint ilə yoxla
            </Button>
          )}
        </div>

        <TabsContent value="students" className="mt-4">
          <DataTable
            caption="Tələbələr"
            columns={studentColumns}
            rows={students}
            loading={studentsQuery.isFetching && !studentsQuery.data}
            error={studentsQuery.error ? errorMessage(studentsQuery.error, 'Tələbələr yüklənmədi.') : null}
            onRetry={studentsQuery.refetch}
            resetKey={`${courseId}|${search}`}
            getRowKey={(s) => s.id}
            empty={search ? { title: 'Uyğun tələbə tapılmadı' } : { title: 'Bu kursa hələ tələbə yazılmayıb' }}
          />
        </TabsContent>

        <TabsContent value="payments" className="mt-4 space-y-3">
          {pendingCount > 0 && (
            <div className="flex gap-3 rounded-lg border border-warning/20 bg-warning-soft px-4 py-3 text-sm text-warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>
                {pendingCount} ödəniş gözləmədədir. Statusu yeniləmək üçün «ePoint ilə yoxla» düyməsini basın.
              </p>
            </div>
          )}
          <DataTable
            caption="Ödənişlər"
            columns={paymentColumns}
            rows={payments}
            loading={paymentsQuery.isFetching && !paymentsQuery.data}
            error={paymentsQuery.error ? errorMessage(paymentsQuery.error, 'Ödənişlər yüklənmədi.') : null}
            onRetry={paymentsQuery.refetch}
            resetKey={`${courseId}|${search}`}
            empty={search ? { title: 'Uyğun ödəniş tapılmadı' } : { title: 'Bu kurs üçün hələ ödəniş yoxdur' }}
          />
        </TabsContent>
      </Tabs>

      <RefundDialog
        payment={refundTarget}
        onClose={() => {
          setRefundTarget(null);
          paymentsQuery.refetch();
          studentsQuery.refetch();
        }}
      />
      <ConfirmPaymentDialog
        payment={confirmTarget}
        onClose={() => {
          setConfirmTarget(null);
          paymentsQuery.refetch();
          studentsQuery.refetch();
        }}
      />
    </div>
  );
}
