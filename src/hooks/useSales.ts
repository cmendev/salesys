// hooks/useSales.ts
import { invoke } from '@tauri-apps/api/core';
import { DateRange } from 'react-day-picker';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { Sale, SaleDetailWithProduct } from '@/types/sales';

export interface SaleWithCustomer extends Sale {
  customer_name?: string;
}

export function useSales() {
  const getSale = async (id: number): Promise<SaleWithCustomer> => {
    return await invoke('get_sale', { id });
  };

  const getSalesByDateRange = async (range: DateRange): Promise<Sale[]> => {
    try {
      if (!range.from || !range.to) return [];
      
      const start = format(startOfDay(range.from), 'yyyy-MM-dd HH:mm:ss');
      const end = format(endOfDay(range.to), 'yyyy-MM-dd HH:mm:ss');
      
      const sales = await invoke<Sale[]>('get_sales_by_date_range', { 
        start, 
        end 
      });
      
      return sales || [];
    } catch (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
  };

  const cancelSale = async (id: number): Promise<void> => {
    await invoke('cancel_sale', { id });
  };

  const getSaleDetails = async (saleId: number): Promise<SaleDetailWithProduct[]> => {
    return await invoke('get_sale_details', { saleId });
  };

  const getTodaySales = async (): Promise<Sale[]> => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return await invoke('get_sales_by_date_range', {
      start: `${today} 00:00:00`,
      end: `${today} 23:59:59`
    });
  };

  const getMonthSales = async (): Promise<Sale[]> => {
    const now = new Date();
    const start = format(startOfMonth(now), 'yyyy-MM-dd 00:00:00');
    const end = format(endOfMonth(now), 'yyyy-MM-dd 23:59:59');
    return await invoke('get_sales_by_date_range', { start, end });
  };

  return {
    getSale,
    getSalesByDateRange,
    cancelSale,
    getSaleDetails,
    getTodaySales,
    getMonthSales
  };
}