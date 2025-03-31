// src/features/sales/SalesDashboard.tsx
import { useState, useEffect } from 'react';
import { useSales } from '@/hooks/useSales';
import { DateRange } from 'react-day-picker';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CalendarDateRangePicker } from "@/components/CalendarDateRangePicker";
import { Sale, SaleDetailWithProduct } from '@/types/sales';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SalesDashboard() {
  const { 
    getSalesByDateRange, 
    cancelSale, 
    getSaleDetails,
    getTodaySales,
    getMonthSales
  } = useSales();
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleDetails, setSaleDetails] = useState<SaleDetailWithProduct[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [todayStats, setTodayStats] = useState({
    count: 0,
    total: 0,
    taxes: 0,
    net: 0
  });
  const [monthStats, setMonthStats] = useState({
    count: 0,
    total: 0,
    taxes: 0,
    net: 0
  });

  // Cargar ventas iniciales
  useEffect(() => {
    loadSales();
    loadStats();
  }, [dateRange]);

  const loadSales = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    try {
      const salesData = await getSalesByDateRange(dateRange);
      setSales(salesData);
      setFilteredSales(salesData);
    } catch (error) {
      toast.error('Error al cargar ventas');
      console.error(error);
    }
  };

  const loadStats = async () => {
    try {
      // Estadísticas del día
      const todaySales = await getTodaySales();
      const activeTodaySales = todaySales.filter(s => s.status !== 'canceled');
      const todayTotal = activeTodaySales.reduce((sum, sale) => sum + sale.total, 0);
      const todayTaxes = activeTodaySales.reduce((sum, sale) => sum + sale.taxes, 0);
      
      setTodayStats({
        count: activeTodaySales.length,
        total: todayTotal,
        taxes: todayTaxes,
        net: todayTotal - todayTaxes
      });

      // Estadísticas del mes
      const monthSales = await getMonthSales();
      const activeMonthSales = monthSales.filter(s => s.status !== 'canceled');
      const monthTotal = activeMonthSales.reduce((sum, sale) => sum + sale.total, 0);
      const monthTaxes = activeMonthSales.reduce((sum, sale) => sum + sale.taxes, 0);
      
      setMonthStats({
        count: activeMonthSales.length,
        total: monthTotal,
        taxes: monthTaxes,
        net: monthTotal - monthTaxes
      });
    } catch (error) {
      toast.error('Error al cargar estadísticas');
      console.error(error);
    }
  };

  // Filtrar ventas
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSales(sales);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = sales.filter(sale => 
        sale.id.toString().includes(term) ||
        (sale.customer_id && sale.customer_id.toString().includes(term)) ||
        sale.payment_method.toLowerCase().includes(term) ||
        sale.total.toString().includes(term)
      );
      setFilteredSales(filtered);
    }
  }, [searchTerm, sales]);

  const handleViewDetails = async (sale: Sale) => {
    try {
      const details = await getSaleDetails(sale.id);
      setSelectedSale(sale);
      setSaleDetails(details);
      setShowDetailsDialog(true);
    } catch (error) {
      toast.error('Error al cargar detalles');
      console.error(error);
    }
  };

  const handleCancelSale = async () => {
    if (!selectedSale) return;
    
    try {
      await cancelSale(selectedSale.id);
      toast.success(`Venta #${selectedSale.id} cancelada`);
      loadSales();
      loadStats();
      setShowCancelDialog(false);
      setSelectedSale(null);
    } catch (error) {
      toast.error('Error al cancelar venta');
      console.error(error);
    }
  };

  // Datos para gráficos
  const chartData = [
    {
      name: 'Hoy',
      Ventas: todayStats.count,
      Total: todayStats.total,
      Impuestos: todayStats.taxes,
      Neto: todayStats.net,
    },
    {
      name: 'Este Mes',
      Ventas: monthStats.count,
      Total: monthStats.total,
      Impuestos: monthStats.taxes,
      Neto: monthStats.net,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        <h1 className="text-3xl font-bold">Dashboard de Ventas</h1>
        
        {/* Estadísticas y gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Ventas" fill="#8884d8" />
                    <Bar dataKey="Total" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles Financieros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Impuestos" fill="#ffc658" />
                    <Bar dataKey="Neto" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y tabla de ventas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Historial de Ventas</CardTitle>
            <div className="flex items-center space-x-4">
              <CalendarDateRangePicker 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
              <Input
                placeholder="Buscar venta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Método Pago</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>#{sale.id}</TableCell>
                    <TableCell>
                      {new Date(sale.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {sale.customer_id ? `Cliente ${sale.customer_id}` : 'Sin cliente'}
                    </TableCell>
                    <TableCell>{sale.payment_method}</TableCell>
                    <TableCell>${sale.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sale.status === 'canceled' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {sale.status === 'canceled' ? 'Cancelada' : 'Completada'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(sale)}
                        >
                          Detalles
                        </Button>
                        {sale.status !== 'canceled' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowCancelDialog(true);
                            }}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de detalles */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Venta #{selectedSale?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p>{selectedSale && new Date(selectedSale.date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className={`inline-flex items-center ${
                  selectedSale?.status === 'canceled' 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {selectedSale?.status === 'canceled' ? 'Cancelada' : 'Completada'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Método de Pago</p>
                <p>{selectedSale?.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p>${selectedSale?.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Precio Unitario</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <div>
                          <p>{detail.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {detail.product_code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{detail.quantity}</TableCell>
                      <TableCell>${detail.unit_price.toFixed(2)}</TableCell>
                      <TableCell>${detail.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de cancelación */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Venta #{selectedSale?.id}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de que deseas cancelar esta venta? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
            >
              Volver
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSale}
            >
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}