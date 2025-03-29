import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-900 text-white">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4">Página no encontrada</p>
      <Link to="/" className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition">
        Volver al inicio
      </Link>
    </div>
  );
}
