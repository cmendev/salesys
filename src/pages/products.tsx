import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  stock: number;
}

interface NewProduct {
  name: string;
  code: string;
  price: number;
  stock: number;
}

export default function ProductsDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalType, setModalType] = useState<"create" | "update" | "delete" | null>(null);
  const [formData, setFormData] = useState<NewProduct>({
    name: "",
    code: "",
    price: 0,
    stock: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data: Product[] = await invoke("get_all_products");
      setProducts(data);
    } catch (error) {
      toast.error("No se pudieron cargar los productos");
      console.error("Error al cargar productos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (modalType === "create") {
        await invoke("add_product", { product: formData });
        toast.success("Producto creado correctamente");
        setModalType(null);
        await fetchProducts();
      } 
      else if (modalType === "update" && selectedProduct) {
        await invoke("update_product", { 
          id: selectedProduct.id,
          product: formData 
        });
        toast.success("Producto actualizado correctamente");
        setModalType(null);
        await fetchProducts();
      }
    } catch (error) {
      console.error("Error al procesar producto:", error);
      toast.error(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      const productId = selectedProduct.id;
      await invoke("delete_product", { id: productId });
      
      toast.success("Producto eliminado correctamente");
      setModalType(null);
      await fetchProducts();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error(`Error al eliminar: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Button 
        className="mb-4" 
        onClick={() => { 
          setModalType("create"); 
          setFormData({
            name: "",
            code: "",
            price: 0,
            stock: 0,
          }); 
        }}
      >
        Agregar Producto
      </Button>

      <div className="overflow-x-auto">
        <Table className="min-w-full border border-gray-300 text-sm">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="border-t">
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.code}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Button 
                    className="mr-2" 
                    onClick={() => { 
                      setSelectedProduct(product); 
                      setFormData({
                        name: product.name,
                        code: product.code,
                        price: product.price,
                        stock: product.stock,
                      }); 
                      setModalType("update"); 
                    }}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => { 
                      setSelectedProduct(product); 
                      setModalType("delete"); 
                    }}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MODAL */}
      <Dialog open={!!modalType} onOpenChange={() => !loading && setModalType(null)}>
        <DialogContent>
          <DialogTitle>
            {modalType === "create" ? "Crear Producto" : 
             modalType === "update" ? "Editar Producto" : "Eliminar Producto"}
          </DialogTitle>
          
          {modalType !== "delete" ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input 
                  placeholder="Nombre del producto" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input 
                  placeholder="Código" 
                  value={formData.code} 
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
                <Input 
                  placeholder="Precio" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
                <Input 
                  placeholder="Stock" 
                  type="number"
                  min="0"
                  value={formData.stock} 
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  required
                />
                <Button 
                  className="mt-4 w-full" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Guardar"}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar el producto {selectedProduct?.name}?
                <br />
                Código: {selectedProduct?.code}
              </DialogDescription>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setModalType(null)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}