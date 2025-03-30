import { Outlet } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { SidebarMenu } from "../components/SidebarMenu";
import { useAuthStore } from "../store/authStore";
import { UserRole } from "../types/user";
import { Toaster } from "@/components/ui/sonner";

const AppLayout = () => {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    return (
        <div className="flex h-screen">
            {/* Verificamos que el usuario existe antes de acceder a su rol */}
            <SidebarMenu userRole={user?.role as UserRole} />

            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
            <Toaster richColors position="bottom-right" closeButton={false} />
        </div>
    );
};

export default AppLayout;
