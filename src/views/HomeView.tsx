import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Banknote,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryType } from '../types';

export const HomeView: React.FC = () => {
  const { products, stores, navigateTo, setSelectedCategory, themeMode } = useStore();

  const isDark = themeMode === 'dark';

  // Hidden store filter
  const hiddenStoreIds = new Set(
    stores.filter((s) => s.isHidden || s.status === 'suspended').map((s) => s.id)
  );

  // Available visible products
  const visibleProducts = products.filter(
    (p) => !p.isHidden && !p.isArchived && (!p.storeId || !hiddenStoreIds.has(p.storeId))
  );

  // 4-up trending items: in-stock first, sold out moved to the last
  const trendingProducts = visibleProducts
    .sort((a, b) => {
      const aStock = a.inStock && (a.stockCount === undefined || a.stockCount > 0);
      const bStock = b.inStock && (b.stockCount === undefined || b.stockCount > 0);
      if (aStock && !bStock) return -1;
      if (!aStock && bStock) return 1;
      return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
    })
    .slice(0, 4);

  // Categories for bento grid
  const bentoCategories: {
    title: string;
    category: CategoryType;
    eraText: string;
    image: string;
    itemCount: string;
  }[] = [
    {
      title: 'Workwear & Jeans',
      category: 'Workwear & Jeans',
      eraText: 'Union-Made Detroit Duck, 70s Redline Denim, Carhartt Pants',
      image:
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      itemCount: '24 Grails',
    },
    {
      title: 'Vintage Tees & Trousers',
      category: 'Vintage Tees & Trousers',
      eraText: 'Single-Stitch 80s & 90s Tour Merchandise, Archival Trousers',
      image:
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      itemCount: '38 Grails',
    },
    {
      title: 'Jackets & Coats',
      category: 'Jackets & Coats',
      eraText: 'Stüssy Varsity, GORE-TEX Shells, Schott Leather Biker Jackets',
      image:
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
      itemCount: '18 Grails',
    },
    {
      title: 'Sneakers & Boots',
      category: 'Sneakers & Boots',
      eraText: '1994 Air Jordan 1s, 2002 Nike SB Dunks, Wearable Vintage Footwear',
      image:
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      itemCount: '15 Grails',
    },
  ];

  const handleCategoryClick = (cat: CategoryType) => {
    setSelectedCategory(cat);
    navigateTo('shop');
  };

  return (
    <div className={`space-y-12 sm:space-y-16 pb-20 font-sans pt-4 sm:pt-6 ${isDark ? 'text-neutral-100' : 'text-[#0a0a0a]'}`}>

      {/* =========================================================================
          1. TRENDING 4-UP GRAILS GRID (IMMEDIATE VISIBILITY, PRODUCT-FIRST)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean section header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e5341f] animate-pulse" />
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0a0a0a]'}`}>
              Trending 1-of-1 Grails
            </h2>
          </div>
          <button
            onClick={() => navigateTo('shop')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e5341f] hover:underline cursor-pointer"
          >
            <span>View All ({visibleProducts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4-up grid: on mobile 3 items, on tablet/desktop 4 items */}
        {trendingProducts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-xl sm:rounded-2xl border border-[#0a0a0a]/10 overflow-hidden bg-neutral-100">
                <div className="aspect-[4/5] bg-neutral-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trendingProducts.map((prod, idx) => (
              <div key={prod.id} className={idx === 3 ? 'hidden sm:block' : 'block'}>
                <ProductCard product={prod} priority={idx < 2} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          2. CURATED CATEGORY BENTO TILES
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0a0a0a]'}`}>
            Curated Category Archives
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-neutral-400' : 'text-[#0a0a0a]/60'}`}>
            Explore strictly categorized vintage aesthetics with zero fast fashion clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bentoCategories.map((bento) => (
            <div
              key={bento.title}
              onClick={() => handleCategoryClick(bento.category)}
              className="group relative h-80 rounded-2xl overflow-hidden border border-[#0a0a0a]/15 dark:border-neutral-800 cursor-pointer bg-[#0a0a0a]"
            >
              {/* Image background with dark overlay */}
              <img
                src={bento.image}
                alt={bento.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                width={800}
                height={400}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

              {/* Content on bottom */}
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {bento.itemCount}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white text-[#0a0a0a] flex items-center justify-center transform group-hover:translate-x-1 group-hover:bg-[#e5341f] group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-[#fafafa]">
                  {bento.title}
                </h3>
                <p className="text-xs text-white/80 mt-1 font-medium line-clamp-1">
                  {bento.eraText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. TRUST BANNER: 12-POINT CONDITION GRADING SYSTEM
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`border rounded-2xl p-6 sm:p-10 lg:p-12 transition-colors ${
          isDark
            ? 'bg-[#12151c] border-neutral-800 text-white'
            : 'bg-[#fafafa] border-[#0a0a0a]/15 text-[#0a0a0a]'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className={`inline-flex items-center space-x-2 border px-3 py-1 rounded-full text-xs font-bold ${
                isDark
                  ? 'bg-neutral-800 border-neutral-700 text-white'
                  : 'bg-white border-[#0a0a0a]/10 text-[#0a0a0a]'
              }`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>The Juta Kapra Inspection Standard</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                How We Grade Vintage Condition
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#0a0a0a]/70'}`}>
                Thrifting online shouldn’t be a guessing game. Every garment undergoes a 12-point authentication protocol inspecting single-stitch hems, paper tags, seam integrity, and natural distress patterns.
              </p>
              <button
                onClick={() => navigateTo('condition-guide')}
                className={`inline-flex items-center space-x-2 text-xs font-bold pb-1 transition-colors cursor-pointer border-b-2 hover:text-[#e5341f] hover:border-[#e5341f] ${
                  isDark ? 'text-white border-white' : 'text-[#0a0a0a] border-[#0a0a0a]'
                }`}
              >
                <span>Read Full Condition &amp; Authenticity Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 sm:p-5 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#171922] border-neutral-800' : 'bg-white border-[#0a0a0a]/10'
              }`}>
                <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Mint 10/10
                </span>
                <h4 className="font-bold text-sm">Deadstock / Archive</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#0a0a0a]/60'}`}>
                  Unworn or factory-stored condition with zero flaws, crisp original collar, and full garment color.
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#171922] border-neutral-800' : 'bg-white border-[#0a0a0a]/10'
              }`}>
                <span className="text-xs font-black uppercase text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                  Good 8.5–9/10
                </span>
                <h4 className="font-bold text-sm">Curated Vintage</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#0a0a0a]/60'}`}>
                  Natural gentle wear, soft vintage cotton fade, and authentic graphic cracking with no structural damage.
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#171922] border-neutral-800' : 'bg-white border-[#0a0a0a]/10'
              }`}>
                <span className="text-xs font-black uppercase text-[#e5341f] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
                  Distressed 7/10
                </span>
                <h4 className="font-bold text-sm">Patina 1-of-1</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#0a0a0a]/60'}`}>
                  Honest workwear battle scars: authentic paint splatters, sun-fades, and frayed hems worn with pride.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SLEEK TRUST & LOGISTICS FOOTNOTE STRIP
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t ${
          isDark ? 'border-neutral-800 text-neutral-300' : 'border-[#0a0a0a]/10 text-[#0a0a0a]'
        }`}>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">100% Authenticated</p>
              <p className="text-[11px] text-neutral-500">Inspected single-stitch & tags</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Nationwide Courier</p>
              <p className="text-[11px] text-neutral-500">24–48h via TCS & Leopards</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Banknote className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Cash on Delivery</p>
              <p className="text-[11px] text-neutral-500">+ JazzCash & Easypaisa</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#e5341f] shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Physical City Hubs</p>
              <p className="text-[11px] text-neutral-500">Islamabad, Lahore & Karachi</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
