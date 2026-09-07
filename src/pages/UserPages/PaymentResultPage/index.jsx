import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PaymentSuccessPage from '../PaymentSuccessPage';
import PaymentFailPage from '../PaymentFailPage';

function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = (searchParams.get('status') || searchParams.get('result') || '').toLowerCase();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If gateway sends status=fail, error, or cancelled
  if (status === 'fail' || status === 'failed' || status === 'error' || status === 'cancelled') {
    return <PaymentFailPage />;
  }

  // By default or on status=success / approved
  return <PaymentSuccessPage />;
}

export default PaymentResultPage;
