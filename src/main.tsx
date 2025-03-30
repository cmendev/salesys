import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProductsDashboard from './pages/products';
import SalesDashboard from './pages/sales';
import UsersDashboard from './pages/users';
import AppLayout from './layout/AppLayout';
import LoginForm from './components/LoginForm';
import CustomersDashboard from './pages/customers';
import Dashboard from './pages/dashboard';
import NotFoundPage from './pages/404';

import './App.css';
import NewSalePage from './pages/newsale';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true, path: 'panel',
        element: <Dashboard />,
      },
      {
        path: 'login',
        element: <LoginForm />,
      },
      {
        path: 'clientes',
        element: <CustomersDashboard />,
      },
      {
        path: 'productos',
        element: <ProductsDashboard />,
      },
      {
        path: 'ventas',
        element: <SalesDashboard />,
      },
      {
        path: 'usuarios',
        element: <UsersDashboard />,
      },
      {
        path: 'ventas/nueva',
        element: <NewSalePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);