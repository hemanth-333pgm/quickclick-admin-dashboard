import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/CustomerDetail';
import Retailers from './pages/Retailers';
import RetailerDetail from './pages/RetailerDetail';
import DeliveryPartners from './pages/DeliveryPartners';
import DeliveryPartnerDetail from './pages/DeliveryPartnerDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Categories from './pages/Categories';
import Coupons from './pages/Coupons';

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="customers/:id" element={<UserDetail />} />
          <Route path="retailers" element={<Retailers />} />
          <Route path="retailers/:id" element={<RetailerDetail />} />
          <Route path="delivery-partners" element={<DeliveryPartners />} />
          <Route path="delivery-partners/:id" element={<DeliveryPartnerDetail />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="categories" element={<Categories />} />
          <Route path="coupons" element={<Coupons />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
