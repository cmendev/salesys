// hooks/useSale.ts
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import { Sale, SaleData, CartItem } from '@/types/sales';
import { v4 as uuidv4 } from 'uuid';

export function useSale() {
  const processSale = async (cart: CartItem[], saleData: SaleData) => {
    if (cart.length === 0) {
      toast.error('Agrega productos a la venta');
      return null;
    }

    if (!saleData.payment_method) {
      toast.error('Selecciona un método de pago');
      return null;
    }

    try {
      // 1. Primero creamos la venta
      const sale: Sale = await invoke('create_sale', {
        sale: {
          customer_id: saleData.customer_id || null,
          subtotal: calculateSubtotal(cart),
          taxes: calculateTaxes(cart),
          total: calculateTotal(cart),
          payment_method: saleData.payment_method,
          status: 'completed'
        }
      });

      // 2. Verificamos que la venta se creó correctamente y tiene un ID
      if (!sale?.id) {
        throw new Error('No se pudo obtener el ID de la venta creada');
      }

      // 3. Creamos los detalles de venta
      const detailPromises = cart.map(item => 
        invoke('add_sale_detail', {
          detail: {
            sale_id: sale.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price,
            discount: 0,
            tax_percentage: 16
          }
        })
      );

      // 4. Esperamos a que todos los detalles se procesen
      await Promise.all(detailPromises);

      // 5. Creamos la factura en la base de datos
      const invoiceId = await invoke('create_invoice', {
        invoice: {
          sale_id: sale.id,
          uuid: uuidv4(),
          file_path: '', // Dejamos vacío ya que no generaremos archivo
          status: 'active'
        }
      });

      toast.success(`Venta #${sale.id} procesada correctamente`);
      return { sale, invoiceId };
    } catch (error) {
      console.error('Error completo al procesar venta:', error);
      toast.error('Error al procesar la venta');
      return null;
    }
  };

  const calculateSubtotal = (cart: CartItem[]) => 
    cart.reduce((sum, item) => sum + item.subtotal, 0);

  const calculateTaxes = (cart: CartItem[]) => 
    calculateSubtotal(cart) * 0.16;

  const calculateTotal = (cart: CartItem[]) => 
    calculateSubtotal(cart) + calculateTaxes(cart);

  return {
    processSale,
    calculateSubtotal,
    calculateTaxes,
    calculateTotal
  };
}