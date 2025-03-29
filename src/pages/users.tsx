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

  const handleDelete = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      console.log("Enviando solicitud de eliminación para user_id:", selectedUser.id);
      const user_id = Number(selectedUser.id);
      if (isNaN(user_id)) {
        throw new Error("ID de usuario no válido");
      }

      const result = await invoke<boolean>("delete_user", { user_id });

      if (!result) {
        throw new Error("No se pudo eliminar el usuario");
      }

      toast.success("Usuario eliminado correctamente");
      setUsers(users.filter(user => user.id !== user_id));
      setModalType(null);
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar usuario");
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
            {modalType === "delete" ? "Eliminar Usuario" : ""}
          </DialogTitle>
          {modalType === "delete" && (
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
