// src/features/sales/components/SaleSummary.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SaleSummaryProps {
  subtotal: number;
  taxes: number;
  total: number;
  notes: string;
  onNotesChange: (notes: string) => void;
  onProcessSale: () => void;
  isProcessing: boolean;
  isDisabled: boolean;
}

export function SaleSummary({
  subtotal,
  taxes,
  total,
  notes,
  onNotesChange,
  onProcessSale,
  isProcessing,
  isDisabled
}: SaleSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Input
          id="notes"
          placeholder="Observaciones"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA (16%):</span>
          <span>${taxes.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={onProcessSale}
        className="w-full mt-4"
        disabled={isDisabled || isProcessing}
      >
        {isProcessing ? 'Procesando...' : 'Finalizar Venta'}
      </Button>
    </div>
  );
}