import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Edit3,
  Save,
  X,
  KeyRound,
  Eye,
  EyeOff,
  Package,
  Truck,
  CheckCircle2,
  ExternalLink,
  Clock,
  Camera,
  Trash2,
  Check,
  ChevronRight,
  Copy,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { formatPKR } from '../utils/format';
import { AddressManager } from '../components/AddressManager';
import { OrderStatus } from '../types';
import { normalizeOrderItem } from '../utils/orderItem';

type AccountTab = 'overview' | 'orders' | 'addresses' | 'security';
type OrderFilterType = 'all' | 'processing' | 'confirmed' | 'dispatched' | 'delivered';

export const AccountView: React.FC = () => {
  const {
    currentCustomer,
    profile,
    isAuthLoading,
    orders,
    themeMode,
    navigateTo,
    openAuthModal,
    logoutCustomer,
    updateProfile,
    changeCustomerPassword,
    changeCustomerPasswordApi,
    updateCustomerPassword,
    fetchFreshUserProfile,
    addToast,
  } = useStore();

  const isDark = themeMode === 'dark';
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  // Search and filter for orders
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderFilterType>('all');

  // Pull fresh user details directly from database on view mount
  useEffect(() => {
    fetchFreshUserProfile();
  }, []);

  // Helper for multi-stage pipeline status
  const getOrderStageDetails = (status: OrderStatus | string) => {
    const s = String(status || '').trim();
    if (s === 'Processing' || s === 'Pending') {
      return {
        stepIndex: 0,
        badgeText: 'Stage 1: Processing',
        shortText: 'Processing',
        badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold',
        dotColor: 'bg-amber-500',
        description: 'Order received & queued for authentication and warehouse packaging.',
      };
    }
    if (s === 'Confirmed') {
      return {
        stepIndex: 1,
        badgeText: 'Stage 1.5: Confirmed',
        shortText: 'Confirmed',
        badgeClass: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30 font-bold',
        dotColor: 'bg-cyan-500',
        description: 'Verified & confirmed by warehouse. Packing parcel for courier dispatch.',
      };
    }
    if (s === 'Dispatched to Courier' || s === 'In Transit') {
      return {
        stepIndex: 2,
        badgeText: 'Stage 2: In Transit',
        shortText: 'In Transit',
        badgeClass: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30 font-bold',
        dotColor: 'bg-blue-500',
        description: 'Handed over to courier partner. On the road to your shipping address.',
      };
    }
    if (s === 'Delivered') {
      return {
        stepIndex: 3,
        badgeText: 'Stage 3: Delivered',
        shortText: 'Delivered',
        badgeClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-bold',
        dotColor: 'bg-emerald-500',
        description: 'Package successfully delivered and confirmed.',
      };
    }
    if (s === 'Cancelled') {
      return {
        stepIndex: -1,
        badgeText: 'Cancelled',
        shortText: 'Cancelled',
        badgeClass: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 font-bold',
        dotColor: 'bg-red-500',
        description: 'This order was cancelled.',
      };
    }
    return {
      stepIndex: 0,
      badgeText: s,
      shortText: s,
      badgeClass: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 font-bold',
      dotColor: 'bg-neutral-500',
      description: 'Order registered in system.',
    };
  };

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security / Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  // Effective customer object
  const activeFullName = profile?.full_name || currentCustomer?.fullName || 'Collector';
  const activeEmail = profile?.email || currentCustomer?.email || '';
  const activePhone = profile?.phone || currentCustomer?.phone || '';
  const activeAvatar = profile?.avatar_url || currentCustomer?.avatarUrl || '';
  const activeAddresses = currentCustomer?.addresses || [];

  const hasExistingPassword = Boolean(
    currentCustomer?.hasPassword ||
    currentCustomer?.passwordHash ||
    profile?.has_password ||
    (profile as any)?.password_hash ||
    (typeof window !== 'undefined' && activeEmail && localStorage.getItem('has_password_' + activeEmail.toLowerCase()) === 'true')
  );

  // Orders filtered for this customer
  const customerOrders = orders.filter(
    (o) =>
      o.customerId === currentCustomer?.id ||
      o.customerId === profile?.id ||
      (o.customer?.email && o.customer.email.toLowerCase() === activeEmail.toLowerCase())
  );

  const activeShipments = customerOrders.filter(
    (o) =>
      o.status === 'Dispatched to Courier' ||
      (o.status as string) === 'In Transit' ||
      o.status === 'Processing' ||
      o.status === 'Pending' ||
      o.status === 'Confirmed'
  );

  const totalSpent = customerOrders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.total : sum), 0);
  const latestOrder = customerOrders[0] || null;

  // Filtered orders list for Orders tab
  const filteredOrders = customerOrders.filter((ord) => {
    const q = orderSearchQuery.trim().toLowerCase();
    const trackingNo = (ord.courierTracking?.trackingNumber || ord.trackingNumber || '').toLowerCase();
    const courierPartner = (ord.courierTracking?.courierName || ord.courier || '').toLowerCase();
    const dispatchNote = (ord.courierTracking?.dispatchNote || '').toLowerCase();

    const matchesSearch =
      !q ||
      ord.orderNumber.toLowerCase().includes(q) ||
      trackingNo.includes(q) ||
      courierPartner.includes(q) ||
      dispatchNote.includes(q) ||
      ord.items.some((it) => normalizeOrderItem(it).title.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (orderStatusFilter === 'processing') return ord.status === 'Processing' || ord.status === 'Pending';
    if (orderStatusFilter === 'confirmed') return ord.status === 'Confirmed';
    if (orderStatusFilter === 'dispatched') return ord.status === 'Dispatched to Courier' || (ord.status as string) === 'In Transit';
    if (orderStatusFilter === 'delivered') return ord.status === 'Delivered';
    return true;
  });

  const startEditing = () => {
    setEditName(activeFullName);
    setEditPhone(activePhone);
    setEditAvatarUrl(activeAvatar);
    setIsEditingProfile(true);
  };

  const cancelEditing = () => {
    setIsEditingProfile(false);
  };

  const saveProfile = async () => {
    setIsSaving(true);
    const trimmedName = editName.trim();
    const trimmedPhone = editPhone.trim();
    const trimmedAvatar = editAvatarUrl.trim();

    try {
      await updateProfile({
        full_name: trimmedName || activeFullName,
        phone: trimmedPhone,
        avatar_url: trimmedAvatar || activeAvatar,
      });

      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal details have been saved.',
        duration: 2500,
      });

      setIsEditingProfile(false);
    } catch {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update profile. Please try again.',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Please choose a photo under 5MB.',
        duration: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const resultData = uploadEvent.target?.result as string;
      if (resultData) {
        setEditAvatarUrl(resultData);
        await updateProfile({ avatar_url: resultData });
        addToast({
          type: 'success',
          title: 'Photo Updated',
          message: 'Your profile picture has been updated.',
          duration: 2500,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = async () => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeFullName)}&background=0a0a0a&color=fff&size=200&bold=true`;
    setEditAvatarUrl(defaultAvatar);
    await updateProfile({ avatar_url: defaultAvatar });
    addToast({
      type: 'info',
      title: 'Photo Reset',
      message: 'Profile picture reset to default avatar.',
      duration: 2500,
    });
  };

  const handleCopyTracking = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTrackingId(trackingNum);
    addToast({
      type: 'info',
      title: 'Tracking Code Copied',
      message: `${trackingNum} copied to clipboard.`,
      duration: 2000,
    });
    setTimeout(() => {
      setCopiedTrackingId(null);
    }, 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (hasExistingPassword && !currentPassword.trim()) {
      setPasswordError('Current password is required to update your existing password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPw(true);
    try {
      const supaResult = await updateCustomerPassword(newPassword);

      const result = await changeCustomerPasswordApi({
        currentPassword: hasExistingPassword ? currentPassword : '',
        newPassword,
        confirmPassword,
      });

      const localResult = changeCustomerPassword(currentPassword, newPassword);

      if (supaResult.success || result.success || localResult.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (typeof window !== 'undefined' && activeEmail) {
          try {
            localStorage.setItem('has_password_' + activeEmail.toLowerCase(), 'true');
          } catch {}
        }
        if (currentCustomer) {
          currentCustomer.hasPassword = true;
          if (!currentCustomer.passwordHash) currentCustomer.passwordHash = 'active';
        }
        addToast({
          type: 'success',
          title: 'Password Updated',
          message: 'Your account password has been updated.',
          duration: 3000,
        });
      } else {
        setPasswordError(supaResult.error || result.message || localResult.error || 'Failed to update password.');
      }
    } finally {
      setIsChangingPw(false);
    }
  };

  // Auth Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#eceff1] dark:bg-[#0f1115] flex items-center justify-center font-sans">
        <div className="w-7 h-7 border-3 border-neutral-800 dark:border-neutral-200 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not Logged In Screen
  if (!currentCustomer && !profile) {
    return (
      <div className="min-h-screen bg-[#eceff1] dark:bg-[#0f1115] flex items-center justify-center px-4 py-12 font-sans">
        <div className="max-w-sm w-full bg-white dark:bg-[#161920] border border-neutral-300/90 dark:border-neutral-800 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-900 dark:text-neutral-100 shadow-2xs">
            <User className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-extrabold tracking-tight text-neutral-950 dark:text-white">
              Customer Account
            </h1>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
              Sign in to manage your orders, saved addresses, and live shipments.
            </p>
          </div>
          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => openAuthModal('google')}
              className="w-full h-9 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigateTo('login')}
                className="h-9 px-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-bold text-xs cursor-pointer transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigateTo('register')}
                className="h-9 px-2 rounded-xl bg-[#e5341f] hover:bg-[#c42912] text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eceff1] dark:bg-[#0f1115] font-sans pb-16 pt-4 sm:pt-6 transition-colors duration-200">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-3.5">
        <AnimatePresence mode="wait">
          {/* ============ OVERVIEW / MAIN PROFILE VIEW ============ */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-3.5"
            >
              {/* Profile Header Card */}
              <div className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Compact Avatar (48px) with Crisp Dark Ring */}
                    <div className="relative group shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-900 text-white flex items-center justify-center ring-2 ring-neutral-300 dark:ring-neutral-700 shadow-2xs">
                        {activeAvatar ? (
                          <img
                            src={activeAvatar}
                            alt={activeFullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-black text-white">
                            {activeFullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity"
                        title="Change photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dark High-Contrast Name, Email & Phone */}
                    <div className="min-w-0 space-y-0.5">
                      <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-neutral-950 dark:text-white truncate">
                        {activeFullName}
                      </h2>
                      <p className="text-xs text-neutral-800 dark:text-neutral-200 font-mono font-semibold truncate">
                        {activeEmail}
                      </p>
                      {activePhone ? (
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 font-mono font-semibold">
                          <Phone className="w-3 h-3 text-neutral-600 dark:text-neutral-400" />
                          <span>{activePhone}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Edit Profile Toggle Button */}
                  {!isEditingProfile && (
                    <button
                      onClick={startEditing}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Inline Profile Editing Mode */}
                {isEditingProfile && (
                  <div className="pt-4 mt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Full name"
                          className="w-full h-8.5 px-3 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-950 dark:text-white focus:outline-none focus:border-neutral-800 dark:focus:border-neutral-300 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="0300 1234567"
                          className="w-full h-8.5 px-3 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-950 dark:text-white focus:outline-none focus:border-neutral-800 dark:focus:border-neutral-300 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:underline cursor-pointer"
                        >
                          Change photo
                        </button>
                        {activeAvatar && (
                          <button
                            type="button"
                            onClick={removeProfilePhoto}
                            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                          >
                            Remove photo
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="h-8 px-3 rounded-lg text-xs font-bold text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveProfile}
                          disabled={isSaving}
                          className="h-8 px-3.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 shadow-2xs"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Metrics Strip Card on Gray Canvas */}
              <div className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl p-3 shadow-xs">
                <div className="grid grid-cols-3 text-center divide-x divide-neutral-200 dark:divide-neutral-800">
                  <div className="px-2">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block font-bold">Total Spent</span>
                    <span className="text-xs sm:text-sm font-black font-mono text-neutral-950 dark:text-white mt-0.5 block">
                      {formatPKR(totalSpent || currentCustomer?.lifetimeValue || 0)}
                    </span>
                  </div>
                  <div className="px-2">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block font-bold">Total Orders</span>
                    <span className="text-xs sm:text-sm font-black font-mono text-neutral-950 dark:text-white mt-0.5 block">
                      {customerOrders.length}
                    </span>
                  </div>
                  <div className="px-2">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block font-bold">In Transit</span>
                    <span className={`text-xs sm:text-sm font-black font-mono mt-0.5 block ${activeShipments.length > 0 ? 'text-[#e5341f]' : 'text-neutral-950 dark:text-white'}`}>
                      {activeShipments.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Latest Order Spotlight (if exists) */}
              {latestOrder && (
                <div
                  onClick={() => setActiveTab('orders')}
                  className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-700 transition-all shadow-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-950 dark:text-white">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-neutral-950 dark:text-white font-mono">
                          #{latestOrder.orderNumber}
                        </span>
                        <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 font-mono">
                          {formatPKR(latestOrder.total)}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-semibold truncate mt-0.5">
                        {latestOrder.items.length} {latestOrder.items.length === 1 ? 'item' : 'items'} • Status: <strong className="text-neutral-950 dark:text-white">{latestOrder.status}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-neutral-800 dark:text-neutral-200 shrink-0">
                    <span className="hidden sm:inline">Track</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Grouped Menu Card */}
              <div className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl shadow-xs divide-y divide-neutral-200 dark:divide-neutral-800/80 overflow-hidden">
                {/* Orders & Tracking */}
                <button
                  onClick={() => setActiveTab('orders')}
                  className="w-full p-3.5 flex items-center justify-between text-left group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-950 dark:text-white">Orders & Tracking</p>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">Track live parcels and past order history</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {customerOrders.length > 0 && (
                      <span className="text-xs text-neutral-700 dark:text-neutral-300 font-mono font-bold">
                        {customerOrders.length}
                      </span>
                    )}
                    {activeShipments.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#e5341f] text-white">
                        {activeShipments.length} Active
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Shipping Addresses */}
                <button
                  onClick={() => setActiveTab('addresses')}
                  className="w-full p-3.5 flex items-center justify-between text-left group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-950 dark:text-white">Shipping Addresses</p>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">Manage saved destinations for 1-click checkout</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activeAddresses.length > 0 && (
                      <span className="text-xs text-neutral-700 dark:text-neutral-300 font-bold">
                        {activeAddresses.length} saved
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Security & Password */}
                <button
                  onClick={() => setActiveTab('security')}
                  className="w-full p-3.5 flex items-center justify-between text-left group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-950 dark:text-white">Security & Login</p>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">Password credentials and Google authorization</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-neutral-700 dark:text-neutral-300 font-bold">
                      {(currentCustomer.authProvider === 'google' || profile?.auth_provider === 'google') ? 'Google Linked' : 'Password'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Sign Out */}
                <button
                  onClick={logoutCustomer}
                  className="w-full p-3.5 flex items-center justify-between text-left group hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-red-600 dark:text-red-400"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-600 dark:text-red-400">Sign Out</p>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">End your session on this device</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ============ ORDERS & TRACKING TAB ============ */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-3.5"
            >
              {/* Top Sub-Bar with Back Link */}
              <div className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Account</span>
                </button>
                <h3 className="text-xs font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider">
                  Orders & Tracking
                </h3>
                <span className="text-xs font-black font-mono text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                  {customerOrders.length}
                </span>
              </div>

              {/* Search & Filter Card */}
              <div className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl p-3 shadow-xs space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by order # or product title..."
                    className="w-full h-8.5 pl-9 pr-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-950 dark:text-white focus:outline-none focus:border-neutral-800 dark:focus:border-neutral-300 transition-colors"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {([
                    { id: 'all', label: 'All Orders' },
                    { id: 'processing', label: 'Processing' },
                    { id: 'confirmed', label: 'Confirmed' },
                    { id: 'dispatched', label: 'In Transit' },
                    { id: 'delivered', label: 'Delivered' },
                  ] as const).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderStatusFilter(tab.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        orderStatusFilter === tab.id
                          ? 'bg-neutral-950 text-white dark:bg-white dark:text-black shadow-2xs'
                          : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List Cards */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl py-12 text-center space-y-2 shadow-xs">
                  <Package className="w-8 h-8 text-neutral-400 mx-auto" />
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">No orders found.</p>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="text-xs text-[#e5341f] font-bold hover:underline cursor-pointer"
                  >
                    Browse store catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((ord) => {
                    const stage = getOrderStageDetails(ord.status);
                    const trackingNumber = ord.courierTracking?.trackingNumber || ord.trackingNumber;
                    const courierName = ord.courierTracking?.courierName || ord.courier || 'TCS';
                    const trackingUrl = ord.courierTracking?.trackingUrl;

                    return (
                      <div
                        key={ord.id}
                        className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl p-4 shadow-xs space-y-3"
                      >
                        {/* Order Header Row */}
                        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-neutral-200 dark:border-neutral-800">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-neutral-950 dark:text-white">
                              #{ord.orderNumber}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${stage.badgeClass}`}>
                              {stage.shortText}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-semibold">
                              {new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="font-mono font-black text-sm text-neutral-950 dark:text-white">
                              {formatPKR(ord.total)}
                            </span>
                          </div>
                        </div>

                        {/* Courier Tracking Row if assigned */}
                        {trackingNumber && (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/60 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                {courierName}: <strong className="font-mono text-blue-700 dark:text-blue-300 font-black">{trackingNumber}</strong>
                              </span>
                              <button
                                onClick={() => handleCopyTracking(trackingNumber)}
                                className="text-blue-600 dark:text-blue-300 hover:text-blue-900 p-0.5 cursor-pointer"
                                title="Copy tracking ID"
                              >
                                {copiedTrackingId === trackingNumber ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {trackingUrl && (
                              <a
                                href={trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-blue-700 dark:text-blue-300 hover:underline flex items-center gap-1 shrink-0"
                              >
                                <span>Track</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="space-y-2">
                          {ord.items.map((rawIt, idx) => {
                            const it = normalizeOrderItem(rawIt);
                            return (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={it.image}
                                    alt={it.title}
                                    className="w-10 h-10 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
                                    }}
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-neutral-950 dark:text-white truncate">
                                      {it.title}
                                    </p>
                                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
                                      Size <span className="font-bold text-neutral-900 dark:text-white">{it.size}</span> • Qty {it.quantity}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-neutral-950 dark:text-white shrink-0 pl-2">
                                  {formatPKR(it.totalPrice)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Order Footer Details */}
                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
                          <span className="truncate">
                            Ship to: <strong className="text-neutral-900 dark:text-neutral-100 font-bold">{ord.customer.fullName}</strong> ({ord.customer.city || 'Pakistan'})
                          </span>
                          <span className="uppercase font-bold font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                            {ord.paymentMethod === 'cod' ? 'COD' : ord.paymentMethod.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ============ ADDRESSES TAB ============ */}
          {activeTab === 'addresses' && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-3.5"
            >
              {/* Back to Account Sub-Header */}
              <div className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Account</span>
                </button>
                <h3 className="text-xs font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider">
                  Shipping Addresses
                </h3>
                <div className="w-12" />
              </div>

              <div className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
                <AddressManager />
              </div>
            </motion.div>
          )}

          {/* ============ SECURITY & PASSWORD TAB ============ */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-3.5"
            >
              {/* Back to Account Sub-Header */}
              <div className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Account</span>
                </button>
                <h3 className="text-xs font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider">
                  Security & Password
                </h3>
                <div className="w-12" />
              </div>

              <div className="bg-white dark:bg-[#161920] border border-neutral-300/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                {/* Google Linked Notice */}
                {(currentCustomer.authProvider === 'google' || profile?.auth_provider === 'google') && (
                  <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        Google account linked (<span className="font-mono font-bold">{activeEmail}</span>)
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                )}

                {/* Password Form */}
                <form onSubmit={handleChangePassword} className="space-y-3.5">
                  <h4 className="text-xs font-black text-neutral-950 dark:text-white uppercase tracking-wider">
                    {hasExistingPassword ? 'Update Password' : 'Set Account Password'}
                  </h4>

                  {hasExistingPassword && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); }}
                          className="w-full h-8.5 px-3 pr-9 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-950 dark:text-white focus:outline-none focus:border-neutral-800 dark:focus:border-neutral-300"
                          placeholder="Current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                        >
                          {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-1">
                        {hasExistingPassword ? 'New Password' : 'Create Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); setPasswordSuccess(false); }}
                          className="w-full h-8.5 px-3 pr-9 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-950 dark:text-white focus:outline-none focus:border-neutral-800 dark:focus:border-neutral-300"
                          placeholder="Min 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                        >
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                        className="w-full h-8.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold text-neutral-950 dark:text-white focus:outline-none focus:border-neutral-800 dark:focus:border-neutral-300"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold">{passwordError}</p>
                  )}

                  {passwordSuccess && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Password updated successfully.</p>
                  )}

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isChangingPw}
                      className="h-8.5 px-5 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      {isChangingPw ? 'Saving...' : hasExistingPassword ? 'Update Password' : 'Set Account Password'}
                    </button>
                  </div>
                </form>

                {/* Device Session & Sign Out */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-neutral-950 dark:text-white">Active Device Session</p>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">Logged in on this device</p>
                  </div>
                  <button
                    onClick={logoutCustomer}
                    className="h-8 px-3 rounded-xl border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
