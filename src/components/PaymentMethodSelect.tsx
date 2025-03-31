import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PaymentMethod } from "@/types/sales";

interface PaymentMethodSelectProps {
  value: PaymentMethod | '';
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelect({ value, onChange }: PaymentMethodSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="payment">Método de Pago</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar método" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cash">Efectivo</SelectItem>
          <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
          <SelectItem value="debit">Tarjeta de Débito</SelectItem>
          <SelectItem value="transfer">Transferencia</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}