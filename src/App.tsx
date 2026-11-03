import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { ToastContainer } from './components/ToastContainer';
import { AdminLayout } from './components/AdminLayout';
import { CommandKModal } from './components/CommandKModal';
import { FloatingCartButton } from './components/FloatingCartButton';
import { MobileAppNavBar } from './components/MobileAppNavBar';

// Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { ConditionGuideView } from './views/ConditionGuideView';
import { DropsView } from './views/DropsView';
import { ContactView } from './views/ContactView';
import { AdminLoginView } from './views/AdminLoginView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { CustomerOrdersView } from './views/CustomerOrdersView';
import { AccountView } from './views/AccountView';
import { RegisterView } from './views/RegisterView';
import { LoginView } from './views/LoginView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { VerifyOtpView } from './views/VerifyOtpView';
import { ResetPasswordView } from './views/ResetPasswordView';
import { ProfileEditView } from './views/ProfileEditView';
import { ChangePasswordView } from './views/ChangePasswordView';
import { CheckoutGateModal } from './components/CheckoutGateModal';
import { GoogleSetupPasswordModal } from './components/GoogleSetupPasswordModal';

const MainApp: React.FC = () => {
  const { currentView, themeMode } = useStore();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Check URL pathname or view for Admin portal request and redirect to dedicated Backend domain
  useEffect(() => {
    const path = (window.location.pathname + window.location.search).toLowerCase();
    if (path.includes('admin') || currentView === 'admin' || currentView === 'admin-login') {
      window.location.href = 'https://jutakaprabackend.vercel.app/';
    }
  }, [currentView]);

  if (currentView === 'admin' || currentView === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-10 h-10 border-2 border-[#e5341f] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-tight">Redirecting to Admin Management Backend...</h2>
        <p className="text-neutral-400 text-sm mt-2 max-w-md">
          The administrative management panel is hosted at{' '}
          <a href="https://jutakaprabackend.vercel.app/" className="text-[#e5341f] underline font-medium">
            jutakaprabackend.vercel.app
          </a>
        </p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ShopView />;
      case 'product':
        return <ProductDetailView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'register':
        return <RegisterView />;
      case 'login':
        return <LoginView />;
      case 'forgot-password':
        return <ForgotPasswordView />;
      case 'verify-otp':
        return <VerifyOtpView />;
      case 'reset-password':
        return <ResetPasswordView />;
      case 'account-profile':
        return <ProfileEditView />;
      case 'account-change-password':
        return <ChangePasswordView />;
      case 'account':
        return <AccountView />;
      case 'account-orders':
        return <CustomerOrdersView />;
      case 'condition-guide':
        return <ConditionGuideView />;
      case 'drops':
        return <DropsView />;
      case 'contact':
        return <ContactView />;
      default:
        return <HomeView />;
    }
  };

  // Customer Storefront Shell (3-Tier Header, Main, Footer, Cart Drawer, Quick View Modal)
  return (
    <div className={`min-h-screen flex flex-col ${themeMode === 'dark' ? 'bg-[#0a0a0a] text-neutral-100' : 'bg-white text-[#0a0a0a]'} font-sans selection:bg-[#e5341f] selection:text-white transition-colors duration-200`}>
      {/* 3-Tier Sticky Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-28 md:pb-0">{renderView()}</main>

      {/* Comprehensive Store Footer */}
      <Footer />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Floating Action Button for Shopping Bag (Bottom-Right) */}
      <FloatingCartButton />

      {/* Quick View Modal */}
      <QuickViewModal />

      {/* Interactive Toast Notifications */}
      <ToastContainer />

      {/* Global Auth Modal (Login / Signup / Google) */}
      <CheckoutGateModal />

      {/* Google Sign-in Optional Password Setup Modal */}
      <GoogleSetupPasswordModal />

      {/* Mobile Native-Style App Bottom Navigation Bar */}
      <MobileAppNavBar />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
