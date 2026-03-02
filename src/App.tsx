import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin, X } from 'lucide-react';

import GALLERY_ITEMS_JSON from './gallery-items.json';

// Gallery Item Data Structure
interface GalleryItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  aspectRatio: 'square' | 'portrait' | 'video';
}

const GALLERY_ITEMS = GALLERY_ITEMS_JSON as GalleryItem[];

const NAV_ITEMS = [
  { label: 'Personal', href: '#' },
  { label: 'Commissioned', href: '#' },
  { label: 'Design', href: '#' },
  { label: 'Motion', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'BIO', href: '#' },
  { label: 'Price List', href: '#' },
];

const ITEMS_PER_PAGE = 21; // 每次加載 21 張 (3欄的倍數)

// Reusable Image Component with Scroll Reveal and Priority Support
const LazyImage = ({ src, alt, className, priority = false, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div 
      initial={priority ? { opacity: 0 } : { opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
      className={`relative bg-gray-50 overflow-hidden ${className}`}
    >
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        onLoad={() => setIsLoaded(true)}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        // @ts-ignore
        fetchpriority={priority ? "high" : "low"}
        className={`w-full h-full object-cover ${props.imgClassName || ""}`}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-50" />
      )}
    </motion.div>
  );
};

function App() {
  const [activeCategory, setActiveCategory] = useState('Personal');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // 當切換分類時，重置顯示數量
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeCategory]);

  // 無限捲動邏輯
  useEffect(() => {
    const handleScroll = () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 自動排序邏輯：提取路徑中的四位數字年份進行比較
  const filteredAndSortedItems = useMemo(() => {
    const items = GALLERY_ITEMS.filter(item => item.category === activeCategory);
    
    return items.sort((a, b) => {
      const yearA = a.imageUrl.match(/\d{4}/)?.[0] || "0";
      const yearB = b.imageUrl.match(/\d{4}/)?.[0] || "0";
      return parseInt(yearB) - parseInt(yearA);
    });
  }, [activeCategory]);

  // 僅取目前可見的照片
  const visibleItems = useMemo(() => {
    return filteredAndSortedItems.slice(0, visibleCount);
  }, [filteredAndSortedItems, visibleCount]);

  const commissionedGroups = useMemo(() => {
    if (activeCategory !== 'Commissioned') return [];
    
    const groups: { [key: string]: GalleryItem[] } = {};
    filteredAndSortedItems.forEach(item => {
      if (!groups[item.title]) {
        groups[item.title] = [];
      }
      groups[item.title].push(item);
    });

    return Object.entries(groups).sort((a, b) => {
      const yearA = a[0].match(/\d{4}/)?.[0] || "0";
      const yearB = b[0].match(/\d{4}/)?.[0] || "0";
      return parseInt(yearB) - parseInt(yearA);
    });
  }, [activeCategory, filteredAndSortedItems]);

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans">
      <header className="p-8 md:p-12 lg:fixed lg:w-64 lg:h-screen lg:flex lg:flex-col lg:justify-between z-20 bg-white/80 backdrop-blur-sm lg:bg-transparent">
        <div>
          <h1 className="text-2xl font-semibold tracking-[0.3em] mb-12 uppercase">
            <a href="/" className="hover:opacity-70 transition-opacity">HENRI LAI</a>
          </h1>
          <nav>
            <ul className="space-y-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => setActiveCategory(item.label)}
                    className={`nav-link block w-full text-left transition-all duration-500 tracking-[0.2em] ${
                      activeCategory === item.label 
                        ? 'font-bold border-b border-black inline-block pb-1 text-black text-[11px]' 
                        : 'text-gray-300 hover:text-black text-[11px]'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <footer className="mt-12 lg:mt-0">
          <div className="flex space-x-6 grayscale opacity-30 hover:opacity-100 transition-all duration-700">
            <a href="https://www.instagram.com/henrilai.photography/" target="_blank" rel="noreferrer" className="hover:text-black">
              <Instagram size={16} strokeWidth={1.5} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-black">
              <Linkedin size={16} strokeWidth={1.5} />
            </a>
          </div>
          <p className="text-[9px] text-gray-300 mt-6 uppercase tracking-[0.2em]">
            © 2026 Henri Lai
          </p>
        </footer>
      </header>

      <main className="lg:ml-64 p-8 md:p-12 lg:p-16 lg:pt-12">
        {activeCategory === 'BIO' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto lg:mx-0"
          >
            <LazyImage 
              src="/images/BIO/profile.jpg" 
              alt="Henri Lai" 
              priority={true}
              className="aspect-[4/5] mb-16 w-full max-w-sm grayscale hover:grayscale-0 transition-all duration-1000"
            />
            <div className="space-y-8 text-[13px] leading-[1.8] text-gray-600 tracking-wide">
              <p className="font-semibold text-black tracking-[0.3em] uppercase text-xs">HENRI LAI</p>
              <p>這裡可以放您的自我介紹。</p>
              <div className="pt-16 border-t border-gray-100">
                <p className="uppercase tracking-[0.3em] text-[9px] text-gray-400 mb-4 font-bold">Contact</p>
                <a href="mailto:hello@henrilai.com" className="hover:text-black underline underline-offset-8 transition-colors text-gray-400">
                  hello@henrilai.com
                </a>
              </div>
            </div>
          </motion.div>
        ) : activeCategory === 'Price List' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl"
          >
            <h2 className="text-sm font-semibold tracking-[0.4em] mb-20 uppercase">Price List</h2>
            <div className="space-y-16">
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-300 mb-8 font-bold">— Services</h3>
                <ul className="space-y-6">
                  <li className="flex justify-between border-b border-gray-50 pb-4 text-[11px]">
                    <span className="tracking-widest">Photography Session</span>
                    <span className="font-light text-gray-400">Contact for pricing</span>
                  </li>
                </ul>
              </section>
            </div>
          </motion.div>
        ) : activeCategory === 'Commissioned' ? (
          <div className="space-y-32 lg:space-y-48">
            <AnimatePresence mode="popLayout">
              {commissionedGroups.map(([projectTitle, items]) => (
                <section key={projectTitle} className="space-y-12">
                  <header className="max-w-2xl border-l border-black pl-6 mb-16">
                    <h2 className="text-[11px] font-bold tracking-[0.5em] uppercase text-black">
                      {projectTitle}
                    </h2>
                  </header>
                  <div className="columns-1 sm:columns-2 md:columns-3 gap-12 lg:gap-16 space-y-12 lg:space-y-16">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedImage(item)}
                        className="break-inside-avoid mb-12 lg:mb-16 group cursor-crosshair"
                      >
                        <LazyImage 
                          src={item.imageUrl} 
                          alt={item.title} 
                          priority={index < 6}
                          imgClassName="h-auto group-hover:scale-[1.01] transition-transform duration-1000"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 gap-12 lg:gap-16 space-y-12 lg:space-y-16">
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item)}
                  className="break-inside-avoid mb-12 lg:mb-16 group cursor-crosshair"
                >
                  <LazyImage 
                    src={item.imageUrl} 
                    alt={item.title} 
                    priority={index < 6}
                    imgClassName="h-auto transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                  />
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-gray-300 font-light">{item.title}</p>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/98 p-4 md:p-12 lg:p-24 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-8 right-8 text-black hover:rotate-90 transition-transform duration-500 p-2"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} strokeWidth={1} />
            </button>
            <motion.img
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
            <div className="absolute bottom-12 left-12 text-left">
              <p className="text-[9px] uppercase tracking-[0.5em] text-gray-300 font-light">
                {selectedImage.title}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
