import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types/sales";

interface CustomerSelectProps {
  value?: number;
  customers: Customer[];
  onChange: (customerId?: number) => void;
}

export function CustomerSelect({ value, customers, onChange }: CustomerSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="customer">Cliente</Label>
      <Select
        value={value?.toString() || '0'}
        onValueChange={(value) => onChange(value !== '0' ? parseInt(value) : undefined)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Sin cliente</SelectItem>
          {customers.map(customer => (
            <SelectItem
              key={customer.id}
              value={customer.id.toString()}
            >
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}