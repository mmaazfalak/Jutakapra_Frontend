import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Flame,
  Clock,
  Bell,
  Sparkles,
  Truck,
  CheckCircle2,
  MapPin,
  Store,
  Tag,
  Zap,
  ShoppingBag,
  Eye,
  Check,
  ChevronRight,
  Shield,
  Layers,
  Banknote,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryType, Product } from '../types';
import { DROP_EVENTS } from '../data/mockData';
import { formatPKR } from '../utils/format';

export const HomeView: React.FC = () => {
  const {
    products,
    stores,
    navigateTo,
    setSelectedCategory,
    setCurrentStoreId,
    themeMode,
    addToCart,
    setQuickViewProduct,
    subscribeAlert,
    addToast,
  } = useStore();

  const isDark = themeMode === 'dark';

  // Active filter tab for trending products
  const [activeTab, setActiveTab] = useState<'all' | 'inStock' | 'tees' | 'jackets' | 'footwear'>('all');

  // Newsletter email state
  const [vipEmail, setVipEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Drop Alert Modal
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');

  // Drop Countdown Timer for next drop
  const nextDrop = DROP_EVENTS[0] || null;
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!nextDrop) return;
    const calculateTimeLeft = () => {
      const diff = Math.max(0, nextDrop.targetTimestamp - Date.now());
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [nextDrop]);

  // Hidden store filter
  const hiddenStoreIds = new Set(
    stores.filter((s) => s.isHidden || s.status === 'suspended').map((s) => s.id)
  );

  // Available visible products
  const visibleProducts = products.filter(
    (p) => !p.isHidden && !p.isArchived && (!p.storeId || !hiddenStoreIds.has(p.storeId))
  );

  // Highlighted "Grail of the Week" (1st high-value in-stock 1-of-1 product or first product)
  const spotlightProduct: Product | undefined =
    visibleProducts.find((p) => p.is1of1 && p.inStock && p.isTrending) ||
    visibleProducts.find((p) => p.is1of1 && p.inStock) ||
    visibleProducts[0];

  // Filtered Products for the showcase grid
  const filteredProducts = visibleProducts
    .filter((p) => {
      if (activeTab === 'inStock') return p.inStock;
      if (activeTab === 'tees') return p.category === 'Vintage Tees & Trousers';
      if (activeTab === 'jackets') return p.category === 'Jackets & Coats' || p.category === 'Workwear & Jeans';
      if (activeTab === 'footwear') return p.category === 'Sneakers & Boots';
      return true;
    })
    .sort((a, b) => {
      const aStock = a.inStock && (a.stockCount === undefined || a.stockCount > 0);
      const bStock = b.inStock && (b.stockCount === undefined || b.stockCount > 0);
      if (aStock && !bStock) return -1;
      if (!aStock && bStock) return 1;
      return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
    })
    .slice(0, 8);

  // Categories for bento grid
  const bentoCategories: {
    title: string;
    category: CategoryType;
    eraText: string;
    image: string;
    itemCount: string;
    tag: string;
  }[] = [
    {
      title: 'Workwear & Heavy Canvas',
      category: 'Workwear & Jeans',
      eraText: 'Union-Made Detroit Duck, 70s Redline Denim, Double-Knees',
      image:
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      itemCount: '24 Grails',
      tag: 'AUTHENTIC UNION-MADE',
    },
    {
      title: 'Vintage Tees & Tour Merch',
      category: 'Vintage Tees & Trousers',
      eraText: 'Single-Stitch 80s & 90s Band, Rap, and Skate Archives',
      image:
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      itemCount: '38 Grails',
      tag: 'SINGLE-STITCH VERIFIED',
    },
    {
      title: 'Jackets, Leather & Shells',
      category: 'Jackets & Coats',
      eraText: 'Stüssy Varsity, GORE-TEX Golden Arc, Schott Leather Bikers',
      image:
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
      itemCount: '18 Grails',
      tag: 'WINTER GRAILS',
    },
    {
      title: 'Sneakers & Archival Boots',
      category: 'Sneakers & Boots',
      eraText: '1994 Air Jordan 1s, 2002 Nike SB Dunks, Wearable Vintage Footwear',
      image:
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      itemCount: '15 Grails',
      tag: 'OG RETROS',
    },
  ];

  // Active verified stores (excluding suspended/hidden)
  const activeStores = stores.filter((s) => !s.isHidden && s.status !== 'suspended');

  const handleCategoryClick = (cat: CategoryType) => {
    setSelectedCategory(cat);
    navigateTo('shop');
  };

  const handleStoreFilterClick = (storeId: string) => {
    setCurrentStoreId(storeId);
    navigateTo('shop');
  };

  const handleVipSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipEmail || !vipEmail.includes('@')) {
      addToast({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please provide a valid email address to join the Drop Syndicate.',
      });
      return;
    }
    subscribeAlert(vipEmail, 'All Upcoming Drops');
    setIsSubscribed(true);
    setVipEmail('');
    addToast({
      type: 'success',
      title: 'VIP Access Unlocked',
      message: 'You will receive 15-minute early access before items go live publicly.',
    });
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail || !alertEmail.includes('@')) return;
    subscribeAlert(alertEmail, nextDrop?.title || 'Next Drop');
    setIsAlertModalOpen(false);
    setAlertEmail('');
    addToast({
      type: 'success',
      title: 'Drop Reminder Set',
      message: `We will notify you 15 minutes before ${nextDrop?.title || 'the drop'} drops!`,
    });
  };

  const marqueeBrands = [
    'CARHARTT DETROIT (1989)',
    '1994 NIKE AIR JORDAN 1 HIGH',
    'STÜSSY ARCHIVE',
    "1998 ARC'TERYX GORE-TEX",
    'KAPITAL KOUNTRY',
    "LEVI'S 501 BIG E SELVEDGE",
    'SINGLE-STITCH GUARANTEED',
    '1993 NIRVANA TOUR',
    'SCHOTT PERFECTO LEATHER',
    '100% DEADSTOCK & AUTHENTIC',
  ];

  return (
    <div className={`space-y-12 sm:space-y-20 pb-24 font-sans ${isDark ? 'text-neutral-100' : 'text-[#0a0a0a]'}`}>

      {/* =========================================================================
          1. HIGH-IMPACT ARCHIVAL HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-[#0a0a0a] border border-[#232833] shadow-2xl">
            {/* Cinematic Background with Noise & Archival Gradients */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85"
                alt="Juta Kapra Archival Vintage"
                className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
            </div>

            {/* Hero Main Content */}
            <div className="relative z-10 px-6 sm:px-12 lg:px-16 py-16 sm:py-24 lg:py-28 max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-bold tracking-wider uppercase mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#e5341f] animate-pulse" />
                <span>Pakistan's 1st Authenticated Archival Vault</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.05]">
                Rare Vintage <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
                  Grails.
                </span>{' '}
                <span className="text-[#e5341f]">Zero</span> Fast Fashion.
              </h1>

              {/* Subtext */}
              <p className="mt-5 text-sm sm:text-base lg:text-lg text-neutral-300 font-medium leading-relaxed max-w-2xl">
                Union-made Carhartt Detroit canvas, 90s single-stitch tour tees, rare Japanese selvedge, and OG footwear. Hand-inspected with zero dry-rot, delivered nationwide with Cash on Delivery.
              </p>

              {/* CTA Group */}
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigateTo('shop')}
                  className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-[#e5341f] text-white font-black text-xs sm:text-sm tracking-wider uppercase hover:bg-[#d02e1b] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#e5341f]/30 cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  <span>Explore Catalog ({visibleProducts.length} Grails)</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('city-vaults-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md text-white font-bold text-xs sm:text-sm tracking-wider uppercase border border-white/20 transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4 text-neutral-300" />
                  <span>Browse By City Hub</span>
                </button>

                <button
                  onClick={() => navigateTo('condition-guide')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white underline underline-offset-4 py-2 px-1 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>12-Point Inspection Standards</span>
                </button>
              </div>

              {/* Micro Trust Pills */}
              <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase text-white tracking-wider">100% Legit</p>
                    <p className="text-[10px] text-neutral-400">No Bootlegs / Repros</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase text-white tracking-wider">24–48h Courier</p>
                    <p className="text-[10px] text-neutral-400">TCS, Leopards & Trax</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Banknote className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase text-white tracking-wider">Cash on Delivery</p>
                    <p className="text-[10px] text-neutral-400">+ Mobile Wallets</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-[#e5341f]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase text-white tracking-wider">1-of-1 Vault</p>
                    <p className="text-[10px] text-neutral-400">Unique Hand-Picked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SILKY MARQUEE TICKER (BRANDS & ARCHIVES)
          ========================================================================= */}
      <section className="border-y border-[#0a0a0a]/10 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#12151c] py-3 overflow-hidden select-none">
        <div className="flex items-center gap-8 whitespace-nowrap animate-none overflow-x-auto no-scrollbar px-4">
          <div className="flex items-center gap-8 shrink-0">
            {marqueeBrands.concat(marqueeBrands).map((brand, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-3 text-xs font-black tracking-widest uppercase text-[#0a0a0a]/60 dark:text-neutral-400"
              >
                <span>{brand}</span>
                <span className="text-[#e5341f] text-xs">◆</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. LIVE DROP COUNTDOWN ALERT BANNER
          ========================================================================= */}
      {nextDrop && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#171922] via-[#0f1117] to-[#171922] border border-[#2b303c] p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Details */}
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#e5341f]/20 border border-[#e5341f]/40 text-[#ff6b5b] text-[11px] font-black tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#e5341f] animate-ping" />
                  <span>{nextDrop.badge || 'UPCOMING DROP'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {nextDrop.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 font-medium line-clamp-2">
                  {nextDrop.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
                  <span>📅 {nextDrop.dateStr}</span>
                  <span>📦 {nextDrop.itemCount} Verified Pieces</span>
                </div>
              </div>

              {/* Right: Live Countdown Clock & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                  <div className="text-center px-1">
                    <span className="block text-xl sm:text-2xl font-black text-white font-mono leading-none">
                      {String(countdown.days).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Days</span>
                  </div>
                  <span className="text-lg font-black text-neutral-500 font-mono">:</span>
                  <div className="text-center px-1">
                    <span className="block text-xl sm:text-2xl font-black text-white font-mono leading-none">
                      {String(countdown.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Hours</span>
                  </div>
                  <span className="text-lg font-black text-neutral-500 font-mono">:</span>
                  <div className="text-center px-1">
                    <span className="block text-xl sm:text-2xl font-black text-white font-mono leading-none">
                      {String(countdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Mins</span>
                  </div>
                  <span className="text-lg font-black text-neutral-500 font-mono">:</span>
                  <div className="text-center px-1">
                    <span className="block text-xl sm:text-2xl font-black text-[#e5341f] font-mono leading-none">
                      {String(countdown.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-[#e5341f] tracking-wider">Secs</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAlertModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-[#0a0a0a] font-black text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
                  >
                    <Bell className="w-3.5 h-3.5 text-[#e5341f]" />
                    <span>Set Alert</span>
                  </button>

                  <button
                    onClick={() => navigateTo('drops')}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Calendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          4. ARCHIVAL GRAIL OF THE WEEK SPOTLIGHT (SPLIT EDITORIAL)
          ========================================================================= */}
      {spotlightProduct && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#12151c] rounded-3xl border border-[#0a0a0a]/10 dark:border-neutral-800 p-6 sm:p-10 lg:p-12 shadow-sm">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left Photo Showcase */}
              <div className="w-full lg:w-1/2 relative aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-[#0a0a0a]/10 dark:border-neutral-800">
                <img
                  src={spotlightProduct.images[0]}
                  alt={spotlightProduct.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#0a0a0a] text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                    👑 Grail of the Week
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Verified Single-Stitch
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-3 text-white text-xs flex items-center justify-between">
                  <span>Archival Identification: <strong className="font-mono text-neutral-300">{spotlightProduct.id}</strong></span>
                  <span className="text-emerald-400 font-bold">100% Genuine</span>
                </div>
              </div>

              {/* Right Editorial Spec */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#e5341f] tracking-widest mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Archival Spotlight</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0a0a0a] dark:text-white leading-tight">
                    {spotlightProduct.title}
                  </h2>
                  <p className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {spotlightProduct.description ||
                      'Hand-selected archival piece authenticated through our strict 12-point inspection protocol. Preserved with natural vintage patina and ready for everyday rotation.'}
                  </p>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-2 pb-1 border-y border-[#0a0a0a]/10 dark:border-neutral-800">
                  <span className="text-3xl font-black text-[#0a0a0a] dark:text-white">
                    {formatPKR(spotlightProduct.price)}
                  </span>
                  {spotlightProduct.originalPrice && spotlightProduct.originalPrice > spotlightProduct.price && (
                    <span className="text-base text-neutral-400 line-through font-medium">
                      {formatPKR(spotlightProduct.originalPrice)}
                    </span>
                  )}
                  <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
                    Ready to Ship
                  </span>
                </div>

                {/* Spec Highlights Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-[#0a0a0a]/5 dark:border-neutral-700">
                    <span className="block text-neutral-400 text-[10px] uppercase font-bold">Category</span>
                    <strong className="text-[#0a0a0a] dark:text-white">{spotlightProduct.category}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-[#0a0a0a]/5 dark:border-neutral-700">
                    <span className="block text-neutral-400 text-[10px] uppercase font-bold">Condition Grade</span>
                    <strong className="text-emerald-600 font-bold">{spotlightProduct.conditionScore || '9.5/10 Flawless'}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-[#0a0a0a]/5 dark:border-neutral-700">
                    <span className="block text-neutral-400 text-[10px] uppercase font-bold">Fulfillment</span>
                    <strong className="text-[#0a0a0a] dark:text-white">Nationwide 24–48h COD</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-[#0a0a0a]/5 dark:border-neutral-700">
                    <span className="block text-neutral-400 text-[10px] uppercase font-bold">Availability</span>
                    <strong className="text-[#e5341f] font-bold">1-of-1 Vault Only</strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (spotlightProduct.inStock) {
                        addToCart(spotlightProduct);
                      }
                    }}
                    disabled={!spotlightProduct.inStock}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] font-black text-xs uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{spotlightProduct.inStock ? 'Add Grail to Cart' : 'Sold Out'}</span>
                  </button>

                  <button
                    onClick={() => setQuickViewProduct(spotlightProduct)}
                    className="px-5 py-4 rounded-xl border border-[#0a0a0a]/20 dark:border-neutral-700 font-bold text-xs uppercase tracking-wider hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Quick View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          5. TRENDING 1-OF-1 GRAILS SHOWCASE (WITH FILTER TABS)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#e5341f] tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Vault Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0a0a0a] dark:text-white">
              Trending 1-of-1 Grails
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Real-time available catalog. When an item is bought, it is gone forever.
            </p>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              All Grails
            </button>
            <button
              onClick={() => setActiveTab('inStock')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'inStock'
                  ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              🔥 In Stock Only
            </button>
            <button
              onClick={() => setActiveTab('tees')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'tees'
                  ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              👕 Vintage Tees
            </button>
            <button
              onClick={() => setActiveTab('jackets')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'jackets'
                  ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              🧥 Heavy Canvas &amp; Outerwear
            </button>
            <button
              onClick={() => setActiveTab('footwear')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'footwear'
                  ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              👟 Footwear
            </button>
          </div>
        </div>

        {/* 4-Up Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((prod) => (
            <div key={prod.id}>
              <ProductCard product={prod} />
            </div>
          ))}
        </div>

        {/* Bottom CTA to Shop */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigateTo('shop')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[#0a0a0a] dark:text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#0a0a0a]/10 dark:border-neutral-700"
          >
            <span>Explore All {visibleProducts.length} Grails In Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          6. CURATED CATEGORY ARCHIVES (ENHANCED BENTO GRID)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#e5341f] tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Collections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0a0a0a] dark:text-white">
            Curated Category Archives
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Explore strictly categorized vintage aesthetics with zero fast fashion clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bentoCategories.map((bento) => (
            <div
              key={bento.title}
              onClick={() => handleCategoryClick(bento.category)}
              className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-[#0a0a0a]/15 dark:border-neutral-800 cursor-pointer bg-[#0a0a0a] shadow-md"
            >
              {/* Image background with dark overlay */}
              <img
                src={bento.image}
                alt={bento.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-75 group-hover:opacity-60 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

              {/* Tag on Top */}
              <div className="absolute top-6 left-6 z-10">
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                  {bento.tag}
                </span>
              </div>

              {/* Content on bottom */}
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {bento.itemCount}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white text-[#0a0a0a] flex items-center justify-center transform group-hover:translate-x-1 group-hover:bg-[#e5341f] group-hover:text-white transition-all shadow-lg">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-[#fafafa]">
                  {bento.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-1 font-medium line-clamp-1">
                  {bento.eraText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. CITY VAULTS & LOCAL VENDOR HUBS (ISLAMABAD • LAHORE • KARACHI)
          ========================================================================= */}
      <section id="city-vaults-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#fafafa] dark:bg-[#12151c] border border-[#0a0a0a]/10 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#e5341f] tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Nationwide Physical Network</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0a0a0a] dark:text-white">
                Archival Vaults &amp; Store Hubs
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Explore local hub locations across Pakistan. Shop directly by curated boutique.
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentStoreId(null);
                navigateTo('shop');
              }}
              className="text-xs font-bold text-[#e5341f] hover:underline"
            >
              View All Stores Catalog →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {activeStores.slice(0, 4).map((store) => (
              <div
                key={store.id}
                onClick={() => handleStoreFilterClick(store.id)}
                className="group bg-white dark:bg-[#171922] p-5 rounded-2xl border border-[#0a0a0a]/10 dark:border-neutral-800 hover:border-[#0a0a0a]/30 dark:hover:border-neutral-600 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase text-[#e5341f] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
                      {store.city || 'Pakistan'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE HUB
                    </span>
                  </div>

                  <h4 className="font-black text-base text-[#0a0a0a] dark:text-white group-hover:text-[#e5341f] transition-colors">
                    {store.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {store.description || `${store.city} flagship destination for authenticated vintage wear.`}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#0a0a0a]/5 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 text-[11px] font-medium">
                    🚚 {store.defaultCourier || 'TCS Express 24h'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#0a0a0a] dark:text-white font-bold group-hover:translate-x-1 transition-transform">
                    <span>Shop Hub</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. TRUST BANNER: 12-POINT CONDITION GRADING PROTOCOL
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#12151c] border border-[#0a0a0a]/15 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 border border-[#0a0a0a]/10 dark:border-neutral-700 px-3 py-1 rounded-full text-xs font-bold text-[#0a0a0a] dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>The Juta Kapra Inspection Standard</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0a0a0a] dark:text-white">
                How We Grade Vintage Condition
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Thrifting online shouldn’t be a guessing game. Every garment undergoes a 12-point authentication protocol inspecting single-stitch hems, paper tags, seam integrity, and natural distress patterns.
              </p>
              <button
                onClick={() => navigateTo('condition-guide')}
                className="inline-flex items-center space-x-2 text-xs font-bold text-[#0a0a0a] dark:text-white hover:text-[#e5341f] border-b-2 border-[#0a0a0a] dark:border-white hover:border-[#e5341f] pb-1 transition-colors cursor-pointer"
              >
                <span>Read Full Condition &amp; Authenticity Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-50 dark:bg-[#171922] p-5 rounded-2xl border border-[#0a0a0a]/10 dark:border-neutral-800 space-y-2">
                <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Mint 10/10
                </span>
                <h4 className="font-bold text-sm text-[#0a0a0a] dark:text-white">Deadstock / Archive</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Unworn or factory-stored condition with zero flaws, crisp original collar, and full garment color.
                </p>
              </div>

              <div className="bg-neutral-50 dark:bg-[#171922] p-5 rounded-2xl border border-[#0a0a0a]/10 dark:border-neutral-800 space-y-2">
                <span className="text-xs font-black uppercase text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                  Good 8.5–9/10
                </span>
                <h4 className="font-bold text-sm text-[#0a0a0a] dark:text-white">Curated Vintage</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Natural gentle wear, soft vintage cotton fade, and authentic graphic cracking with no structural damage.
                </p>
              </div>

              <div className="bg-neutral-50 dark:bg-[#171922] p-5 rounded-2xl border border-[#0a0a0a]/10 dark:border-neutral-800 space-y-2">
                <span className="text-xs font-black uppercase text-[#e5341f] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
                  Distressed 7/10
                </span>
                <h4 className="font-bold text-sm text-[#0a0a0a] dark:text-white">Patina 1-of-1</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Honest workwear battle scars: authentic paint splatters, sun-fades, and frayed hems worn with pride.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. WHY STREETWEAR COLLECTORS TRUST JUTA.KAPRA (4 VALUE PILLARS)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0a0a0a] dark:text-white">
            Built for Serious Archivists
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            How we protect Pakistani streetwear enthusiasts from counterfeits and low-quality reproductions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#171922] border border-[#0a0a0a]/10 dark:border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-black text-base text-[#0a0a0a] dark:text-white">100% Legit Check Guarantee</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Every garment undergoes tag date verification, dry-rot flexibility testing, and stitch inspection before listing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#171922] border border-[#0a0a0a]/10 dark:border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-black text-base text-[#0a0a0a] dark:text-white">24–48h Nationwide Courier</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Shipped via TCS Express, Leopards Courier, and Trax with tracking SMS sent straight to your phone.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#171922] border border-[#0a0a0a]/10 dark:border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <h4 className="font-black text-base text-[#0a0a0a] dark:text-white">Cash on Delivery &amp; Wallets</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Pay rider at your door with Cash on Delivery or transfer instantly using JazzCash, Easypaisa, or Meezan Bank.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#171922] border border-[#0a0a0a]/10 dark:border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-[#e5341f] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-black text-base text-[#0a0a0a] dark:text-white">1-of-1 Vault Preservation</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Unique pieces are strictly locked. No mass-market reproductions. You own an authentic slice of fashion history.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. VIP DROP ALERT / SYNDICATE CLUB NEWSLETTER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#0a0a0a] text-white p-8 sm:p-12 lg:p-16 border border-[#232833] shadow-2xl">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Exclusive 15-Minute Drop Window</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-tight">
              Join the Drop Syndicate
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
              Rare 1-of-1 pieces sell out in minutes. Syndicate members receive an alert link 15 minutes before drops go live on Instagram.
            </p>

            {isSubscribed ? (
              <div className="pt-4 flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>You're in! Check your inbox for the upcoming drop private access key.</span>
              </div>
            ) : (
              <form onSubmit={handleVipSubscribe} className="pt-4 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={vipEmail}
                  onChange={(e) => setVipEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#e5341f] text-white font-black text-xs uppercase tracking-wider hover:bg-[#d02e1b] transition-all whitespace-nowrap cursor-pointer shadow-lg"
                >
                  Join Syndicate
                </button>
              </form>
            )}

            <p className="text-[11px] text-neutral-500 pt-2">
              Joined by 4,200+ archival collectors in Islamabad, Lahore &amp; Karachi. Zero spam.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DROP ALERT MODAL
          ========================================================================= */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12151c] text-[#0a0a0a] dark:text-white rounded-2xl max-w-md w-full p-6 border border-[#0a0a0a]/15 dark:border-neutral-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#0a0a0a]/10 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#e5341f]" />
                <h3 className="font-black text-base">Set Drop Reminder</h3>
              </div>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="text-neutral-400 hover:text-[#0a0a0a] dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAlertSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter your email to receive an instant reminder 15 minutes before <strong>{nextDrop?.title}</strong> drops!
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#e5341f]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e5341f] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#d02e1b]"
                >
                  Confirm Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
