import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuthStore } from "../store/authStore";
import { authenticateUser } from "../services/authService";

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const user = await authenticateUser(username, password);
            if (user) {
                login(user);
            } else {
                setError("Usuario o contraseña incorrectos");
            }
        } catch {
            setError("Error en la autenticación");
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">SaleSys</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
                    <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" disabled={loading}>
                        {loading ? "Cargando..." : "Iniciar Sesión"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
