// src/features/sales/NewSalePage.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCart } from '@/hooks/useCart';
import { useSale } from '@/hooks/useSale';
import { ProductSearch } from '@/components/ProductSearch';
import { CartTable } from '@/components/CartTable';
import { CustomerSelect } from '@/components/CustomerSelect';
import { PaymentMethodSelect } from '@/components/PaymentMethodSelect';
import { SaleSummary } from '@/components/SaleSummary';
import { SaleData } from '@/types/sales';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function NewSalePage() {
  const { products } = useProducts();
  const { customers } = useCustomers();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateSubtotal,
    calculateTaxes,
    calculateTotal
  } = useCart();
  const { processSale } = useSale();

  const [searchTerm, setSearchTerm] = useState('');
  const [saleData, setSaleData] = useState<SaleData>({
    customer_id: undefined,
    payment_method: '',
    notes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);

  const searchProduct = () => {
    if (!searchTerm) return;

    const term = searchTerm.toLowerCase();
    const product = products.find(p =>
      p.code.toLowerCase() === term || p.name.toLowerCase().includes(term)
    );

    if (product) {
      addToCart(product);
      setSearchTerm('');
    } else {
      toast.error('Producto no encontrado');
    }
  };

  const handleProcessSale = async () => {
    setIsProcessing(true);
    const result = await processSale(cart, saleData);
    if (result) {
      setLastSaleId(result.sale.id);
      setShowInvoiceModal(true);
      clearCart();
      setSaleData({
        customer_id: undefined,
        payment_method: '',
        notes: ''
      });
    }
    setIsProcessing(false);
  };

  const handlePrintInvoice = () => {
    // Aquí puedes implementar la lógica para imprimir la factura más adelante
    toast.success('Factura generada (simulación)');
    setShowInvoiceModal(false);
  };

  const handleCancelInvoice = () => {
    setShowInvoiceModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Título con mejor espaciado */}
      <header className="mb-8 px-2">
        <h1 className="text-3xl font-bold">Nueva Venta</h1>
      </header>

      {/* Grid principal con márgenes laterales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2">
        {/* Sección de productos - margen derecho en desktop */}
        <div className="lg:col-span-2 space-y-6 lg:pr-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Agregar Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductSearch 
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                onSearch={searchProduct}
              />
              <CartTable 
                items={cart}
                onRemoveItem={removeFromCart}
                onUpdateQuantity={updateQuantity}
              />
            </CardContent>
          </Card>
        </div>

        {/* Resumen de venta - margen izquierdo en desktop */}
        <div className="space-y-6 lg:pl-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Datos de la Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <CustomerSelect 
                  value={saleData.customer_id}
                  customers={customers}
                  onChange={(customerId) => setSaleData({...saleData, customer_id: customerId})}
                />

                <PaymentMethodSelect 
                  value={saleData.payment_method}
                  onChange={(method) => setSaleData({...saleData, payment_method: method})}
                />

                <SaleSummary
                  subtotal={calculateSubtotal()}
                  taxes={calculateTaxes()}
                  total={calculateTotal()}
                  notes={saleData.notes}
                  onNotesChange={(notes) => setSaleData({...saleData, notes})}
                  onProcessSale={handleProcessSale}
                  isProcessing={isProcessing}
                  isDisabled={cart.length === 0}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de factura */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Factura</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Deseas imprimir la factura para la venta #{lastSaleId}?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelInvoice}>
              Cancelar
            </Button>
            <Button onClick={handlePrintInvoice}>
              Imprimir Factura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}