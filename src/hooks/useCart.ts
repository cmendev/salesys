import { CartItem, Product } from '@/types/sales';
import { useState } from 'react';
import { toast } from 'sonner';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

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
    toast.success(`Producto ${product.name} agregado`);
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

  const clearCart = () => {
    setCart([]);
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.subtotal, 0);
  const calculateTaxes = () => calculateSubtotal() * 0.16;
  const calculateTotal = () => calculateSubtotal() + calculateTaxes();

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateSubtotal,
    calculateTaxes,
    calculateTotal
  };
}