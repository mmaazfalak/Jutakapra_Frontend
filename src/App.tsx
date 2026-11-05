import React, { useEffect, Suspense, lazy } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
// Lightweight UI elements loaded eagerly
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingCartButton } from './components/FloatingCartButton';
import { MobileAppNavBar } from './components/MobileAppNavBar';

// Heavy interactive overlay modals split into on-demand chunks for fast initial paint
const QuickViewModal = lazyWithRetry(() => import('./components/QuickViewModal').then((m) => ({ default: m.QuickViewModal })));
const CommandKModal = lazyWithRetry(() => import('./components/CommandKModal').then((m) => ({ default: m.CommandKModal })));
const CheckoutGateModal = lazyWithRetry(() => import('./components/CheckoutGateModal').then((m) => ({ default: m.CheckoutGateModal })));

// HomeView is loaded eagerly for instant above-the-fold First Contentful Paint
import { HomeView } from './views/HomeView';

// Auto-retry wrapper for dynamic imports to seamlessly handle post-deployment chunk hash changes
function lazyWithRetry<T extends React.ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    const hasReloaded = typeof window !== 'undefined' ? sessionStorage.getItem('chunk_reloaded') : null;
    try {
      const module = await factory();
      if (typeof window !== 'undefined') sessionStorage.removeItem('chunk_reloaded');
      return module;
    } catch (err: any) {
      const isChunkError =
        err?.message?.includes('dynamically imported module') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('module script') ||
        err?.name === 'ChunkLoadError' ||
        err instanceof TypeError;
      if (!hasReloaded && isChunkError && typeof window !== 'undefined') {
        sessionStorage.setItem('chunk_reloaded', 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}

// Route-based code-splitting: Views load lazily on demand with auto-recovery from stale builds
const ShopView = lazyWithRetry(() => import('./views/ShopView').then((m) => ({ default: m.ShopView })));
const ProductDetailView = lazyWithRetry(() => import('./views/ProductDetailView').then((m) => ({ default: m.ProductDetailView })));
const CartView = lazyWithRetry(() => import('./views/CartView').then((m) => ({ default: m.CartView })));
const CheckoutView = lazyWithRetry(() => import('./views/CheckoutView').then((m) => ({ default: m.CheckoutView })));
const ConditionGuideView = lazyWithRetry(() => import('./views/ConditionGuideView').then((m) => ({ default: m.ConditionGuideView })));
const DropsView = lazyWithRetry(() => import('./views/DropsView').then((m) => ({ default: m.DropsView })));
const ContactView = lazyWithRetry(() => import('./views/ContactView').then((m) => ({ default: m.ContactView })));
const CustomerOrdersView = lazyWithRetry(() => import('./views/CustomerOrdersView').then((m) => ({ default: m.CustomerOrdersView })));
const AccountView = lazyWithRetry(() => import('./views/AccountView').then((m) => ({ default: m.AccountView })));
const RegisterView = lazyWithRetry(() => import('./views/RegisterView').then((m) => ({ default: m.RegisterView })));
const LoginView = lazyWithRetry(() => import('./views/LoginView').then((m) => ({ default: m.LoginView })));
const ForgotPasswordView = lazyWithRetry(() => import('./views/ForgotPasswordView').then((m) => ({ default: m.ForgotPasswordView })));
const VerifyOtpView = lazyWithRetry(() => import('./views/VerifyOtpView').then((m) => ({ default: m.VerifyOtpView })));
const ResetPasswordView = lazyWithRetry(() => import('./views/ResetPasswordView').then((m) => ({ default: m.ResetPasswordView })));
const ProfileEditView = lazyWithRetry(() => import('./views/ProfileEditView').then((m) => ({ default: m.ProfileEditView })));
const ChangePasswordView = lazyWithRetry(() => import('./views/ChangePasswordView').then((m) => ({ default: m.ChangePasswordView })));

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'https://jutakaprabackend.vercel.app';

const ViewSkeleton: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-white dark:bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-[#0a0a0a] dark:border-white border-t-transparent rounded-full animate-spin" />
    <span className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mt-4 font-mono">
      Loading Vault...
    </span>
  </div>
);

const MainApp: React.FC = () => {
  const { currentView, quickViewProduct, isCommandKOpen, isCheckoutGateOpen } = useStore();

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
      case 'account-orders':
      case 'track':
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
      <main className="flex-grow pb-24 md:pb-0">
        <Suspense fallback={<ViewSkeleton />}>{renderView()}</Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        {quickViewProduct && <QuickViewModal />}
        {isCheckoutGateOpen && <CheckoutGateModal />}
        {isCommandKOpen && <CommandKModal />}
      </Suspense>
      <FloatingCartButton />
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
