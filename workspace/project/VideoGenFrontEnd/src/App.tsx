import { FC, Suspense, useEffect, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './core/services/queryClient';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import Login from './pages/Login';
import { MainShell } from './shell/MainShell';
import Dashboard from './pages/Dashboard';
import { VideosPage } from './pages/Videos';
import NewVideo from './pages/NewVideo';
import { SignupPage } from './pages/Signup';
import DiscoveryPage from './pages/Discovery';
import AdminDiscoveryPage from './pages/AdminDiscovery';
import TokenPurchasePage from './pages/Tokens/Purchase';
import TransactionHistoryPage from './pages/Tokens/Transactions';
import PaymentHistoryPage from './pages/Tokens/History';
import PaymentPage from './pages/Tokens/Payment';
import { config } from './config/env';
import { DebugPanel } from './components/debug/DebugPanel';
import CheckoutPage from './pages/Tokens/Checkout';
import CreditsPage from './pages/Credits';
import { PayPalSDKProvider } from './components/tokens/PayPalButtonSDK';

const App: FC = () => {
  useEffect(() => {
    console.log('App mounted');
  }, []);

  console.log('App rendering');

  return (
    <QueryClientProvider client={queryClient}>
      <PayPalSDKProvider>
        <div className="dark">
          <div className="min-h-screen bg-background font-sans antialiased">
            <HashRouter>
              <AuthProvider>
                <ErrorBoundary>
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-screen">
                        <div className="text-foreground">Loading...</div>
                      </div>
                    }
                  >
                    <Routes>
                      {/* Public routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<SignupPage />} />

                      {/* Root redirect */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />

                      {/* Protected routes */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <MainShell />
                          </ProtectedRoute>
                        }
                      >
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="videos" element={<VideosPage />} />
                        {/* Video routes */}
                        <Route path="videos">
                          <Route path="new" element={<NewVideo />} />
                          <Route path="new/:projectId" element={<NewVideo />} />
                        </Route>
                        {/* Discovery routes */}
                        <Route path="discovery" element={<DiscoveryPage />} />
                        <Route path="admin/discovery" element={
                          <RoleProtectedRoute requiredRole="admin">
                            <AdminDiscoveryPage />
                          </RoleProtectedRoute>
                        } />
                        {/* Token routes */}
                        <Route path="tokens">
                          <Route path="purchase" element={<Navigate to="/credits" replace />} />
                          <Route path="checkout/:packageId" element={<CheckoutPage />} />
                          <Route path="payment/:packageId" element={<PaymentPage />} />
                          <Route path="transactions" element={<Navigate to="/credits" replace />} />
                          <Route path="history" element={<Navigate to="/credits" replace />} />
                        </Route>
                        {/* Credits route (previously Billing) */}
                        <Route path="credits" element={<CreditsPage />} />
                        {/* Redirect from old billing route to new credits route */}
                        <Route path="billing" element={<Navigate to="/credits" replace />} />
                      </Route>
                    </Routes>

                    {/* Debug Panel - only shown in development mode */}
                    {config.environment === 'development' && <DebugPanel />}

                    {/* Environment indicator */}
                    {config.environment === 'production' ? (
                      <div
                        style={{
                          position: 'fixed',
                          bottom: 10,
                          right: 10,
                          background: '#dc2626',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          zIndex: 9999,
                        }}
                      >
                        PRODUCTION
                      </div>
                    ) : (
                      <div
                        style={{
                          position: 'fixed',
                          bottom: 10,
                          right: 10,
                          background: '#2563eb',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          zIndex: 9999,
                        }}
                      >
                        DEVELOPMENT
                      </div>
                    )}
                  </Suspense>
                </ErrorBoundary>
              </AuthProvider>
            </HashRouter>
          </div>
        </div>
      </PayPalSDKProvider>
    </QueryClientProvider>
  );
};

export default App;
