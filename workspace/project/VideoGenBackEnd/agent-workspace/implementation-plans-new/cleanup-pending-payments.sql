-- Update old pending payments to FAILED status
UPDATE public.payments
SET status = 'FAILED', 
    updated_at = NOW(),
    metadata = jsonb_build_object('error', 'Payment timed out')
WHERE status = 'PENDING' 
AND created_at < NOW() - INTERVAL '1 hour';

-- Check for any payments that are still in PENDING status
SELECT id, user_id, order_id, amount, status, created_at
FROM public.payments
WHERE status = 'PENDING'
ORDER BY created_at DESC; 