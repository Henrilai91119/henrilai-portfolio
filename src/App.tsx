import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, X, ArrowLeft, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';

import GALLERY_ITEMS_JSON from './gallery-items.json';
import PROJECT_DESCRIPTIONS from './project-descriptions.json';
import PRICE_LIST_JSON from './price-list.json';

// Gallery Item Data Structure
interface GalleryItem {
  id: number;
  title: string;
  subTitle?: string | null;
  category: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isCover?: boolean;
  hue?: number;
}

interface PriceItem {
  title: string;
  content: string;
  imageUrl: string | null;
}

const GALLERY_ITEMS = GALLERY_ITEMS_JSON as GalleryItem[];
const DESCRIPTIONS = PROJECT_DESCRIPTIONS as { [key: string]: string };
const PRICE_ITEMS = PRICE_LIST_JSON as PriceItem[];

const NAV_ITEMS = [
  'Moments in Time',
  'Commissioned',
  'Design',
  'Motion',
  'Blog',
  'BIO',
  'Price List',
];

// --- Magnetic Button Component ---
const MagneticButton = ({ children, onClick, className }: any) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const x = (clientX - centerX) * 0.35;
    const y = (clientY - centerY) * 0.35;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <div 
      ref={ref} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <motion.div 
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      >
        <button onClick={onClick} className={className}>{children}</button>
      </motion.div>
    </div>
  );
};

// Reusable Image Component
const LazyImage = ({ src, alt, className, priority = false, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className={`relative bg-transparent overflow-hidden ${className}`}>
      <motion.img
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        onLoad={() => setIsLoaded(true)}
        src={src || ''}
        alt={alt || 'Portfolio Work'}
        loading={priority ? "eager" : "lazy"}
        className={`w-full h-auto object-contain block ${props.imgClassName || ""}`}
        {...props}
      />
    </div>
  );
};

function App() {
  const [activeCategory, setActiveCategory] = useState('Moments in Time');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedSubProject, setSelectedSubProject] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 初始化主題
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const getYearFromPath = (path: string) => {
    const parts = path.split('/');
    const yearPart = parts.find(p => /^\d{4}$/.test(p));
    return yearPart || "Others";
  };

  const currentCategoryItems = useMemo(() => {
    const categoryToMatch = activeCategory === 'Moments in Time' ? 'Personal' : activeCategory;
    return GALLERY_ITEMS.filter(item => item.category === categoryToMatch);
  }, [activeCategory]);

  const allYears = useMemo(() => {
    if (activeCategory !== 'Moments in Time') return [];
    const years = Array.from(new Set(currentCategoryItems.map(item => getYearFromPath(item.imageUrl))))
      .filter(y => y !== "Others")
      .sort((a, b) => parseInt(b) - parseInt(a));
    return years;
  }, [currentCategoryItems, activeCategory]);

  const subProjectList = useMemo(() => {
    const pToMatch = selectedProject || (activeCategory === 'Design' ? 'graphic' : null);
    if (!pToMatch) return [];
    return Array.from(new Set(currentCategoryItems.filter(item => item.title === pToMatch).map(item => item.subTitle).filter(Boolean))) as string[];
  }, [selectedProject, activeCategory, currentCategoryItems]);

  useEffect(() => {
    if (activeCategory === 'Moments in Time' && allYears.length > 0) {
      setActiveYear(allYears[0]);
    } else if (activeCategory === 'Design') {
      setSelectedProject('graphic');
    } else {
      setSelectedProject(null);
    }
    setSelectedSubProject(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeCategory, allYears]);

  useEffect(() => {
    if (activeCategory === 'Design' && (selectedProject === 'outdoor' || selectedProject === 'vehicle') && !selectedSubProject && subProjectList.length > 0) {
      setSelectedSubProject(subProjectList[0]);
    }
  }, [activeCategory, selectedProject, subProjectList]);

  const displayItems = useMemo(() => {
    let items = [...currentCategoryItems];
    if (activeCategory === 'Moments in Time') {
      if (activeYear) items = items.filter(item => getYearFromPath(item.imageUrl) === activeYear);
      return items.sort((a, b) => (a.hue || 0) - (b.hue || 0));
    }
    if (activeCategory === 'Commissioned' && selectedProject) {
      items = items.filter(item => item.title === selectedProject && !item.isCover);
      if (selectedSubProject) items = items.filter(item => item.subTitle === selectedSubProject);
    } else if (activeCategory === 'Design') {
      const pToMatch = selectedProject || 'graphic';
      items = items.filter(item => item.title === pToMatch && !item.isCover);
      if (selectedSubProject) items = items.filter(item => item.subTitle === selectedSubProject);
    }
    return items;
  }, [currentCategoryItems, selectedProject, selectedSubProject, activeCategory, activeYear]);

  const navigateImage = (direction: 'next' | 'prev') => {
    if (!selectedImage) return;
    const currentIndex = displayItems.findIndex(item => item.id === selectedImage.id);
    if (currentIndex === -1) return;
    let nextIndex = direction === 'next' ? (currentIndex + 1) % displayItems.length : (currentIndex - 1 + displayItems.length) % displayItems.length;
    setSelectedImage(displayItems[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowRight') navigateImage('next');
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, displayItems]);

  const currentDescription = useMemo(() => {
    const keys = [selectedSubProject, selectedProject, activeYear, activeCategory].map(k => k?.toLowerCase().trim()).filter(Boolean) as string[];
    for (const key of keys) { if (DESCRIPTIONS[key]) return DESCRIPTIONS[key]; }
    return null;
  }, [selectedProject, selectedSubProject, activeCategory, activeYear]);

  const isSeamlessLayout = activeCategory === 'Design' && (selectedSubProject === '997' || selectedSubProject === 'gogoro' || selectedSubProject === 'wanderer');

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500">
      {/* Sidebar */}
      <header className="p-8 md:p-12 lg:fixed lg:w-64 lg:h-screen lg:flex lg:flex-col lg:justify-between z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm lg:bg-transparent lg:dark:bg-transparent">
        <div>
          <h1 className="mb-12"><a href="/"><img src="/images/web logo/web logo.png" alt="Logo" className="w-16 md:w-20 h-auto dark:invert" /></a></h1>
          <nav>
            <ul className="space-y-4">
              {NAV_ITEMS.map((label) => (
                <li key={label}>
                  <MagneticButton 
                    onClick={() => setActiveCategory(label)} 
                    className={`nav-link block w-full text-left transition-all duration-500 tracking-[0.2em] uppercase text-[0.68rem] ${activeCategory === label ? 'font-bold border-b border-black dark:border-white pb-1' : 'text-gray-300 hover:text-black dark:hover:text-white'}`}
                  >
                    {label}
                  </MagneticButton>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <footer className="space-y-8">
          <div className="flex items-center space-x-6">
            <a href="https://www.instagram.com/henrilai.photography/" target="_blank" rel="noopener noreferrer" className="grayscale opacity-30 hover:opacity-100 transition-all duration-700">
              <Instagram size={16} strokeWidth={1.5} />
            </a>
            <button onClick={toggleDarkMode} className="grayscale opacity-30 hover:opacity-100 transition-all duration-700 p-1">
              {isDarkMode ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </button>
          </div>
          <p className="text-[0.56rem] text-gray-300 mt-6 uppercase tracking-[0.2em]">© 2026 Henri Lai</p>
        </footer>
      </header>

      {/* Main Area with Page Transitions */}
      <main className={`lg:ml-64 ${isSeamlessLayout ? 'p-0' : 'p-8 md:p-12 lg:p-16 lg:pt-12'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + (selectedProject || '') + (activeYear || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeCategory === 'BIO' ? (
              <div className="max-w-xl mx-auto lg:mx-0 p-8">
                <LazyImage src="/images/BIO/self.jpg" alt="BIO" className="aspect-[4/5] mb-10 w-full max-w-xs grayscale hover:grayscale-0 transition-all duration-1000" />
                <div className="space-y-8 text-[0.85rem] leading-[2] text-gray-600 dark:text-gray-400 tracking-wider">
                  <p className="font-semibold text-black dark:text-white tracking-[0.4em] uppercase text-[1.1rem]">HI , 我是賴昱成</p>
                  <div className="space-y-4">
                    <p>斜槓設計師、攝影師，目前為自由接案工作者</p>
                    <div className="space-y-1">
                      <p><span className="text-black dark:text-white font-semibold mr-4 tracking-[0.2em]">設計</span> 專攻戶外用品設計、平面設計</p>
                      <p><span className="text-black dark:text-white font-semibold mr-4 tracking-[0.2em]">攝影</span> 商品攝影、活動攝影為主，並持續運用底片創作</p>
                    </div>
                    <p className="pt-2 text-xs">歡迎透過各平台聯繫洽談商業合作內容 !</p>
                  </div>
                  <div className="pt-12 border-t border-gray-100 dark:border-gray-800">
                    <p className="uppercase tracking-[0.3em] text-[0.56rem] text-gray-400 mb-2 font-bold">Contact</p>
                    <a href="mailto:lai91119@gmail.com" className="hover:text-black dark:hover:text-white underline underline-offset-8 transition-colors text-gray-400">lai91119@gmail.com</a>
                  </div>
                </div>
              </div>
            ) : activeCategory === 'Price List' ? (
              <div className="max-w-5xl mx-auto p-8 space-y-32 py-20">
                {PRICE_ITEMS.map((item, index) => (
                  <div key={item.title} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-start`}>
                    <div className="w-full md:w-1/2"><LazyImage src={item.imageUrl} alt={item.title} className="w-full h-auto" /></div>
                    <div className="w-full md:w-1/2 space-y-8 pt-4">
                      <h2 className="text-[1.1rem] font-bold tracking-[0.4em] uppercase border-b border-gray-100 dark:border-gray-800 pb-4">{item.title}</h2>
                      <div className="text-[0.8rem] leading-[2.2] text-gray-600 dark:text-gray-400 tracking-wide whitespace-pre-wrap">{item.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeCategory === 'Commissioned' && !selectedProject ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24 px-4 md:px-8">
                {Array.from(new Set(currentCategoryItems.map(i => i.title)))
                  .sort((a, b) => (b.match(/\d{4}/)?.[0]||"0").localeCompare(a.match(/\d{4}/)?.[0]||"0"))
                  .map(title => {
                    const cover = currentCategoryItems.find(i => i.title === title && i.isCover) || currentCategoryItems.find(i => i.title === title);
                    return (
                      <div key={title} onClick={() => { setSelectedProject(title); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group cursor-pointer flex flex-col items-center text-center px-4 md:px-8">
                        <div className="aspect-square mb-8 overflow-hidden bg-gray-50 dark:bg-gray-900 w-full">
                          <img src={cover?.thumbnailUrl || cover?.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000" />
                        </div>
                        <h2 className="text-[1.125rem] font-medium tracking-[0.2em] uppercase mb-2 opacity-80 group-hover:opacity-100 transition-opacity">{title}</h2>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="space-y-12">
                <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md py-6 mb-16 border-b border-gray-50 dark:border-gray-900 space-y-6">
                  {activeCategory === 'Moments in Time' ? (
                    <nav className="flex justify-center space-x-8 md:space-x-12 px-8 overflow-x-auto no-scrollbar">
                      {allYears.map(year => (
                        <button key={year} onClick={() => { setActiveYear(year); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`text-[0.62rem] uppercase tracking-[0.4em] transition-all duration-500 whitespace-nowrap ${activeYear === year ? 'text-black dark:text-white font-bold border-b border-black dark:border-white pb-1' : 'text-gray-300 hover:text-black dark:hover:text-white'}`}>{year}</button>
                      ))}
                    </nav>
                  ) : (
                    <>
                      {activeCategory === 'Design' && (
                        <nav className="flex justify-center space-x-8 md:space-x-12 px-8 overflow-x-auto no-scrollbar">
                          {Array.from(new Set(currentCategoryItems.map(i => i.title))).sort().map(cat => (
                            <button key={cat} onClick={() => { setSelectedProject(cat); setSelectedSubProject(null); }} className={`text-[0.62rem] uppercase tracking-[0.4em] transition-all duration-500 ${selectedProject === cat ? 'text-black dark:text-white font-bold' : 'text-gray-300 hover:text-black dark:hover:text-white'}`}>{cat}</button>
                          ))}
                        </nav>
                      )}
                      {selectedProject && (
                        <div className="px-8 flex items-center justify-between">
                          <button onClick={() => setSelectedProject(null)} className="flex items-center text-[0.62rem] uppercase tracking-[0.3em] text-gray-400 hover:text-black dark:hover:text-white group">
                            <ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" />Back
                          </button>
                          <h2 className="text-[1.125rem] font-medium tracking-[0.3em] uppercase">{selectedProject}</h2>
                        </div>
                      )}
                      {subProjectList.length > 0 && (
                        <nav className="flex justify-center space-x-6 md:space-x-8 px-8 overflow-x-auto no-scrollbar pt-2">
                          {subProjectList.map(sub => (
                            <button key={sub} onClick={() => setSelectedSubProject(sub)} className={`text-[0.56rem] uppercase tracking-[0.3em] transition-all duration-500 ${selectedSubProject === sub ? 'text-black dark:text-white border-b border-black dark:border-white' : 'text-gray-300 hover:text-black dark:hover:text-white'}`}>{sub}</button>
                          ))}
                        </nav>
                      )}
                    </>
                  )}
                </header>
                {currentDescription && (<div className="max-w-2xl mx-auto mb-24 px-8 italic text-center text-[0.8rem] leading-[2.2] text-gray-500 dark:text-gray-400 tracking-wide font-light whitespace-pre-wrap">{currentDescription}</div>)}
                <div className={isSeamlessLayout ? "flex flex-col w-full max-w-2xl mx-auto" : "columns-1 sm:columns-2 md:columns-3 gap-16 lg:gap-24 space-y-16 lg:space-y-24 px-4 md:px-8 lg:px-12"}>
                  {displayItems.map((item) => (
                    <div key={item.id} onClick={() => setSelectedImage(item)} className="break-inside-avoid cursor-crosshair group relative mb-16 lg:mb-24">
                      <LazyImage src={item.thumbnailUrl || item.imageUrl} alt={item.title} />
                      {!selectedProject && (
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-right">
                          <p className="text-[0.5rem] text-gray-300 uppercase tracking-widest">{getYearFromPath(item.imageUrl)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-[#0a0a0a]/95 p-4 md:p-12 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-8 right-8 text-black dark:text-white p-2 hover:rotate-90 transition-transform duration-500"><X size={24} strokeWidth={1} /></button>
            <div className="relative flex items-center justify-center max-w-full max-h-full">
              <motion.img key={selectedImage.id} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={selectedImage.imageUrl} className="max-w-full max-h-[85vh] object-contain shadow-sm" />
              <div className="absolute -bottom-12 left-0 w-full text-center italic text-black/40 dark:text-white/40 tracking-[0.5em] text-[0.6rem] uppercase">{getYearFromPath(selectedImage.imageUrl)} — {selectedImage.title}</div>
            </div>
            <button className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black dark:hover:text-white p-4" onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}><ChevronLeft size={48} strokeWidth={1} /></button>
            <button className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black dark:hover:text-white p-4" onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}><ChevronRight size={48} strokeWidth={1} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
