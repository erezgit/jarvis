import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../../lib/types';
import { BaseRepository } from '../../../lib/services/repository.base';
import { createServerSupabase } from '../../../lib/supabase/server';
import { DbResult } from '../../../lib/db/types';
import { CreatePaymentParams, DbPayment, IPaymentRepository, PaymentStatus } from '../types';

@injectable()
export class PaymentRepository extends BaseRepository implements IPaymentRepository {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger
  ) {
    super(logger, 'PaymentRepository');
  }

  async createPayment(payment: CreatePaymentParams): Promise<DbResult<DbPayment>> {
    return this.executeQuery('createPayment', async () => {
      const supabase = createServerSupabase();
      
      const { data, error } = await supabase
        .from('payments')
        .insert({
          user_id: payment.userId,
          payment_provider: payment.paymentProvider,
          payment_id: payment.paymentId,
          order_id: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          tokens_purchased: payment.tokensPurchased,
          package_id: payment.packageId,
          metadata: payment.metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data as DbPayment;
    });
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus, metadata?: any): Promise<DbResult<DbPayment>> {
    return this.executeQuery('updatePaymentStatus', async () => {
      const supabase = createServerSupabase();
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      if (metadata) {
        updateData.metadata = metadata;
      }
      
      const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data as DbPayment;
    });
  }

  async getPaymentByOrderId(orderId: string): Promise<DbResult<DbPayment>> {
    return this.executeQuery('getPaymentByOrderId', async () => {
      const supabase = createServerSupabase();
      
      const { data, error } = await supabase
        .from('payments')
        .select()
        .eq('order_id', orderId)
        .single();

      if (error) throw error;
      return data as DbPayment;
    });
  }

  async getUserPayments(userId: string, limit?: number, offset?: number): Promise<DbResult<DbPayment[]>> {
    return this.executeQuery('getUserPayments', async () => {
      const supabase = createServerSupabase();
      
      let query = supabase
        .from('payments')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      return data as DbPayment[];
    });
  }
} 