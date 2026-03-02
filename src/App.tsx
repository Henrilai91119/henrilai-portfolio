import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin, X, ArrowLeft } from 'lucide-react';

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

const ITEMS_PER_PAGE = 21;

// Reusable Image Component with Elegant 1.5s Scroll Reveal
const LazyImage = ({ src, alt, className, priority = false, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative bg-gray-50 overflow-hidden ${className}`}
    >
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
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
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    setSelectedProject(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeCategory]);

  useEffect(() => {
    const handleScroll = () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    const items = GALLERY_ITEMS.filter(item => item.category === activeCategory);
    return items.sort((a, b) => {
      const yearA = a.imageUrl.match(/\d{4}/)?.[0] || "0";
      const yearB = b.imageUrl.match(/\d{4}/)?.[0] || "0";
      return parseInt(yearB) - parseInt(yearA);
    });
  }, [activeCategory]);

  const projectCovers = useMemo(() => {
    if (activeCategory !== 'Commissioned') return [];
    const projectsMap: { [key: string]: GalleryItem } = {};
    filteredAndSortedItems.forEach(item => {
      if (!projectsMap[item.title]) projectsMap[item.title] = item;
    });
    return Object.entries(projectsMap).sort((a, b) => {
      const yearA = a[0].match(/\d{4}/)?.[0] || "0";
      const yearB = b[0].match(/\d{4}/)?.[0] || "0";
      return parseInt(yearB) - parseInt(yearA);
    });
  }, [activeCategory, filteredAndSortedItems]);

  const displayItems = useMemo(() => {
    if (activeCategory === 'Commissioned' && selectedProject) {
      return filteredAndSortedItems.filter(item => item.title === selectedProject);
    }
    return filteredAndSortedItems.slice(0, visibleCount);
  }, [filteredAndSortedItems, visibleCount, selectedProject, activeCategory]);

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans">
      <header className="p-8 md:p-12 lg:fixed lg:w-64 lg:h-screen lg:flex lg:flex-col lg:justify-between z-20 bg-white/80 backdrop-blur-sm lg:bg-transparent text-black">
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
          <p className="text-[9px] text-gray-300 mt-6 uppercase tracking-[0.2em]">© 2026 Henri Lai</p>
        </footer>
      </header>

      <main className="lg:ml-64 p-8 md:p-12 lg:p-16 lg:pt-12">
        {activeCategory === 'BIO' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto lg:mx-0">
            <LazyImage src="/images/BIO/profile.jpg" alt="Henri Lai" priority={true} className="aspect-[4/5] mb-16 w-full max-w-xs grayscale hover:grayscale-0 transition-all duration-1000" />
            <div className="space-y-8 text-[13px] leading-[1.8] text-gray-600 tracking-wide">
              <p className="font-semibold text-black tracking-[0.3em] uppercase text-xs">HENRI LAI</p>
              <p>這裡可以放您的自我介紹。</p>
              <div className="pt-16 border-t border-gray-100">
                <p className="uppercase tracking-[0.3em] text-[9px] text-gray-400 mb-4 font-bold">Contact</p>
                <a href="mailto:hello@henrilai.com" className="hover:text-black underline underline-offset-8 transition-colors text-gray-400">hello@henrilai.com</a>
              </div>
            </div>
          </motion.div>
        ) : activeCategory === 'Price List' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
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
        ) : activeCategory === 'Commissioned' && !selectedProject ? (
          /* Commissioned: Project List View (Reduced Size) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-32 lg:gap-x-32 lg:gap-y-48 px-4 md:px-12 lg:px-16">
            <AnimatePresence mode="popLayout">
              {projectCovers.map(([title, item]) => (
                <motion.div
                  layout initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  key={title}
                  onClick={() => { setSelectedProject(title); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="group cursor-pointer flex flex-col items-center text-center"
                >
                  <div className="aspect-[3/4] mb-10 overflow-hidden bg-gray-50 w-full">
                    <img 
                      src={item.imageUrl} alt={title} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
                    />
                  </div>
                  <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-black mb-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                    {title}
                  </h2>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* General Category or Commissioned Detail View (Reduced Size) */
          <div className="space-y-12">
            {selectedProject && (
              <header className="mb-24 flex items-center justify-between border-b border-gray-100 pb-10">
                <div>
                  <button onClick={() => setSelectedProject(null)} className="flex items-center text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors mb-6 group">
                    <ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Projects
                  </button>
                  <h2 className="text-[12px] font-bold tracking-[0.5em] uppercase text-black">{selectedProject}</h2>
                </div>
              </header>
            )}
            
            <div className="columns-1 sm:columns-2 md:columns-3 gap-16 lg:gap-24 space-y-16 lg:space-y-24">
              <AnimatePresence mode="popLayout">
                {displayItems.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedImage(item)}
                    className="break-inside-avoid mb-16 lg:mb-24 group cursor-crosshair px-4 md:px-8 lg:px-12"
                  >
                    <LazyImage 
                      src={item.imageUrl} alt={item.title} priority={index < 6}
                      imgClassName="h-auto transition-transform duration-1000 ease-out group-hover:scale-[1.01]"
                    />
                    {!selectedProject && (
                      <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-right">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-gray-300 font-light">{item.title}</p>
                      </div>
                    )}
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/98 p-4 md:p-12 lg:p-24 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 text-black hover:rotate-90 transition-transform duration-500 p-2"><X size={24} strokeWidth={1} /></button>
            <motion.img
              initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              src={selectedImage.imageUrl} alt={selectedImage.title}
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
            <div className="absolute bottom-12 left-12 text-left">
              <p className="text-[9px] uppercase tracking-[0.5em] text-gray-300 font-light">{selectedImage.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
