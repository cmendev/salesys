import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Search } from "lucide-react";
import { toast } from 'sonner';
import { PaymentMethod, CartItem, Product, Customer, Sale } from '@/types/sales';

export default function NewSalePage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Datos de la venta
    const [saleData, setSaleData] = useState({
        customer_id: undefined as number | undefined,
        payment_method: '' as PaymentMethod | '',
        notes: '',
    });

    // Cargar productos y clientes al iniciar
    useEffect(() => {
        loadProducts();
        loadCustomers();
    }, []);

    const loadProducts = async () => {
        try {
            const data: Product[] = await invoke('get_all_products');
            setProducts(data);
        } catch (error) {
            toast.error('Error al cargar productos');
            console.error(error);
        }
    };

    const loadCustomers = async () => {
        try {
            const data: Customer[] = await invoke('get_all_customers');
            setCustomers(data);
        } catch (error) {
            toast.error('Error al cargar clientes');
            console.error(error);
        }
    };

    // Buscar producto por código o nombre
    const searchProduct = () => {
        if (!searchTerm) return;

        const term = searchTerm.toLowerCase();
        const product = products.find(p =>
            p.code.toLowerCase() === term || p.name.toLowerCase().includes(term)
        );

        if (product) {
            addToCart(product);
            setSearchTerm('');
            toast.success(`Producto ${product.name} agregado`);
        } else {
            toast.error('Producto no encontrado');
        }
    };

    // Manejo del carrito
    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product_id === product.id);

            if (existingItem) {
                return prevCart.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
                        : item
                );
            } else {
                return [
                    ...prevCart,
                    {
                        product_id: product.id,
                        name: product.name,
                        code: product.code,
                        price: product.price,
                        quantity: 1,
                        subtotal: product.price
                    }
                ];
            }
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity < 1) return;

        setCart(prevCart =>
            prevCart.map(item =>
                item.product_id === productId
                    ? { ...item, quantity, subtotal: quantity * item.price }
                    : item
            )
        );
    };

    // Cálculos
    const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.subtotal, 0);
    const calculateTaxes = () => calculateSubtotal() * 0.16;
    const calculateTotal = () => calculateSubtotal() + calculateTaxes();

    // Procesar la venta
    const processSale = async () => {
        if (cart.length === 0) {
            toast.error('Agrega productos a la venta');
            return;
        }

        if (!saleData.payment_method) {
            toast.error('Selecciona un método de pago');
            return;
        }

        setLoading(true);

        try {
            const sale: Sale = await invoke('create_sale', {
                sale: {
                    customer_id: saleData.customer_id || null,
                    subtotal: calculateSubtotal(),
                    taxes: calculateTaxes(),
                    total: calculateTotal(),
                    payment_method: saleData.payment_method,
                    status: 'completed'
                }
            });

            for (const item of cart) {
                await invoke('add_sale_detail', {
                    detail: {
                        sale_id: sale.id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        unit_price: item.price,
                        discount: 0,
                        tax_percentage: 16
                    }
                });
            }

            toast.success(`Venta #${sale.id} procesada correctamente`);
            setCart([]);
            setSaleData({
                customer_id: undefined,
                payment_method: '',
                notes: ''
            });
        } catch (error) {
            toast.error('Error al procesar la venta');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Nueva Venta</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sección de productos */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agregar Productos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar producto por nombre o código..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                searchProduct();
                                            }
                                        }}
                                    />
                                </div>
                                <Button onClick={searchProduct}>Buscar</Button>
                            </div>

                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-right">Precio</TableHead>
                                            <TableHead className="text-right">Cantidad</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cart.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No hay productos en la venta
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            cart.map((item) => (
                                                <TableRow key={item.product_id}>
                                                    <TableCell>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-sm text-muted-foreground">{item.code}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            className="w-20"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateQuantity(item.product_id, parseInt(e.target.value) || 1)
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        ${item.subtotal.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeFromCart(item.product_id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Resumen de venta */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos de la Venta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer">Cliente</Label>
                                    <Select
                                        value={saleData.customer_id?.toString() || '0'}
                                        onValueChange={(value) =>
                                            setSaleData({ ...saleData, customer_id: value !== '0' ? parseInt(value) : undefined })
                                        }
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

                                <div className="space-y-2">
                                    <Label htmlFor="payment">Método de Pago</Label>
                                    <Select
                                        value={saleData.payment_method}
                                        onValueChange={(value) =>
                                            setSaleData({ ...saleData, payment_method: value as PaymentMethod })
                                        }
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

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notas</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Observaciones"
                                        value={saleData.notes}
                                        onChange={(e) =>
                                            setSaleData({ ...saleData, notes: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>IVA (16%):</span>
                                        <span>${calculateTaxes().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total:</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={processSale}
                                    className="w-full mt-4"
                                    disabled={loading || cart.length === 0}
                                >
                                    {loading ? 'Procesando...' : 'Finalizar Venta'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}