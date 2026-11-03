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

  // Route Isolation Check: If in admin backend, render ONLY isolated Admin Layout Shell!
  if (currentView === 'admin') {
    return (
      <>
        <AdminLayout>
          <AdminDashboardView />
        </AdminLayout>
        <CommandKModal />
        <ToastContainer />
      </>
    );
  }

  if (currentView === 'admin-login') {
    return (
      <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[#0b0e14] text-white' : 'bg-neutral-100 text-[#0a0a0a]'} flex items-center justify-center font-sans`}>
        <AdminLoginView />
        <ToastContainer />
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
