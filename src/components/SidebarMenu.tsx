import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../types/user';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
    path: string;
    name: string;
    icon: string;
    roles: (UserRole | string)[];
}

interface SidebarMenuProps {
    userRole: UserRole;
}

export function SidebarMenu({ userRole }: SidebarMenuProps) {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);

    const menuItems: MenuItem[] = [
        { path: '/', name: 'Panel', icon: '📈', roles: [UserRole.Admin, UserRole.Seller, UserRole.Manager] },
        { path: '/productos', name: 'Productos', icon: '📦', roles: [UserRole.Admin, UserRole.Seller, UserRole.Manager] },
        { path: '/productos/categorias', name: 'Categorías', icon: '🏷️', roles: [UserRole.Admin] },
        { path: '/clientes', name: 'Clientes', icon: '👥', roles: [UserRole.Admin, UserRole.Seller, UserRole.Manager] },
        { path: '/ventas', name: 'Ventas', icon: '💰', roles: [UserRole.Admin, UserRole.Seller, UserRole.Manager] },
        { path: '/ventas/nueva', name: 'Nueva Venta', icon: '🛒', roles: [UserRole.Admin, UserRole.Seller] },
        { path: '/facturas', name: 'Facturas', icon: '🧾', roles: [UserRole.Admin, UserRole.Manager] },
        { path: '/usuarios', name: 'Usuarios', icon: '👤', roles: [UserRole.Admin] },
    ];
    
    const filteredItems = menuItems.filter(item => 
        item.roles.some(role => role === userRole)
    );
    const groupedItems: Record<string, MenuItem[]> = filteredItems.reduce((acc, item) => {
        const category = item.path.split('/')[1] ? item.path.split('/')[1] : item.name;
        acc[category] = acc[category] || [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    return (
        <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
            <div className="mb-8">
                <h1 className="text-xl font-bold">SaleSys</h1>
                <p className="text-sm text-gray-400">Rol: {userRole}</p>
            </div>
            
            <nav className="flex-1 overflow-y-auto">
                {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="mb-6">
                        <h2 className="text-xs uppercase text-gray-400 mb-2">{items[0].icon} {category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                        <ul>
                            {items.map(item => (
                                <li key={item.path} className="mb-1">
                                    <Link to={item.path} className={`flex items-center p-2 rounded transition ${location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>
                                        <span className="mr-2">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
            
            <div className="mt-auto pt-4 border-t border-gray-700">
                <button onClick={logout} className="flex items-center p-2 rounded transition">
                    <span className="mr-2">❌</span>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
