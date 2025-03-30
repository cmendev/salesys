import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { UserRole } from "@/types/user";

interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
  is_active: boolean;
  password_hash?: string;
}

interface NewUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  full_name: string;
}

export default function UsersDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<"create" | "update" | "delete" | null>(null);
  const [formData, setFormData] = useState<Omit<NewUser, "password"> & { password?: string }>({
    username: "",
    email: "",
    role: UserRole.Seller,
    full_name: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data: User[] = await invoke("get_all_users");
      setUsers(data);
    } catch (error) {
      toast.error("No se pudieron cargar los usuarios");
      console.error("Error al cargar usuarios:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (modalType === "create") {
        if (!formData.password) {
          throw new Error("La contraseña es requerida");
        }
  
        const newUser = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          full_name: formData.full_name,
        };
  
        await invoke("create_user", { user: newUser });
        toast.success("Usuario creado correctamente");
        setModalType(null); // Cierra el modal
        await fetchUsers(); // Actualiza la tabla
      } 
      else if (modalType === "update" && selectedUser) {
        const updatedUser = {
          id: selectedUser.id,
          username: formData.username,
          email: formData.email,
          role: formData.role,
          full_name: formData.full_name,
          is_active: selectedUser.is_active,
          password_hash: selectedUser.password_hash || "",
        };
  
        await invoke("update_user", { user: updatedUser });
        toast.success("Usuario actualizado correctamente");
        setModalType(null); // Cierra el modal
        await fetchUsers(); // Actualiza la tabla
      }
    } catch (error) {
      console.error("Error al procesar usuario:", error);
      toast.error(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      console.log("Intentando eliminar usuario ID:", selectedUser.id);
      
      // Convertir explícitamente a número entero
      const userId = parseInt(selectedUser.id.toString(), 10);
      if (isNaN(userId)) {
        throw new Error("ID de usuario inválido");
      }
  
      // Usar "userId" como parámetro (como en tu versión que funciona)
      const rowsAffected = await invoke<number>("delete_user", { userId: userId });
      
      if (rowsAffected > 0) {
        toast.success("Usuario eliminado correctamente");
        setModalType(null);
        await fetchUsers();
      } else {
        toast.error("No se pudo eliminar el usuario (no encontrado)");
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
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
            username: "",
            email: "",
            role: UserRole.Seller,
            full_name: "",
            password: "",
          }); 
        }}
      >
        Agregar Usuario
      </Button>

      <div className="overflow-x-auto">
        <Table className="min-w-full border border-gray-300 text-sm">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>ID</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-t">
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button 
                    className="mr-2" 
                    onClick={() => { 
                      setSelectedUser(user); 
                      setFormData({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        full_name: user.full_name,
                      }); 
                      setModalType("update"); 
                    }}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => { 
                      setSelectedUser(user); 
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
            {modalType === "create" ? "Crear Usuario" : 
             modalType === "update" ? "Editar Usuario" : "Eliminar Usuario"}
          </DialogTitle>
          
          {modalType !== "delete" ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input 
                  placeholder="Nombre de usuario" 
                  value={formData.username || ""} 
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
                <Input 
                  placeholder="Email" 
                  type="email"
                  value={formData.email || ""} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input 
                  placeholder="Nombre completo" 
                  value={formData.full_name || ""} 
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
                {modalType === "create" && (
                  <Input 
                    placeholder="Contraseña" 
                    type="password"
                    value={formData.password || ""} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                )}
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.Admin}>Admin</SelectItem>
                    <SelectItem value={UserRole.Seller}>Seller</SelectItem>
                    <SelectItem value={UserRole.Manager}>Manager</SelectItem>
                  </SelectContent>
                </Select>
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
                ¿Estás seguro de que deseas eliminar al usuario {selectedUser?.username}?
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
