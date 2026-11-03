import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { ToastContainer } from './components/ToastContainer';
import { CommandKModal } from './components/CommandKModal';
import { FloatingCartButton } from './components/FloatingCartButton';
import { MobileAppNavBar } from './components/MobileAppNavBar';

// Customer Storefront Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { ConditionGuideView } from './views/ConditionGuideView';
import { DropsView } from './views/DropsView';
import { ContactView } from './views/ContactView';
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

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'https://jutakaprabackend.vercel.app';

const MainApp: React.FC = () => {
  const { currentView } = useStore();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Route redirect for Admin requests - links to the separate backend admin portal
  useEffect(() => {
    const path = (window.location.pathname + window.location.search).toLowerCase();
    if (path.includes('admin') || currentView === 'admin' || currentView === 'admin-login') {
      window.location.href = ADMIN_URL;
    }
  }, [currentView]);

  if (currentView === 'admin' || currentView === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-10 h-10 border-2 border-[#e5341f] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-tight">Opening Juta Kapra Admin Management Portal...</h2>
        <p className="text-neutral-400 text-sm mt-2 max-w-md">
          The administrative control website is securely hosted at{' '}
          <a href={ADMIN_URL} className="text-[#e5341f] underline font-medium">
            {ADMIN_URL}
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
      case 'guide':
        return <ConditionGuideView />;
      case 'drops':
        return <DropsView />;
      case 'contact':
        return <ContactView />;
      case 'orders':
        return <CustomerOrdersView />;
      case 'account':
        return <AccountView />;
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
      case 'profile-edit':
        return <ProfileEditView />;
      case 'change-password':
        return <ChangePasswordView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0a0a0a]">
      <Header />
      <main className="flex-grow pb-24 md:pb-0">{renderView()}</main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <CheckoutGateModal />
      <GoogleSetupPasswordModal />
      <CommandKModal />
      <FloatingCartButton />
      <MobileAppNavBar />
      <ToastContainer />
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
