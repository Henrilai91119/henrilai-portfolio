import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin, X, ArrowLeft } from 'lucide-react';

import GALLERY_ITEMS_JSON from './gallery-items.json';

// Gallery Item Data Structure
interface GalleryItem {
  id: number;
  title: string;
  subTitle?: string | null;
  category: string;
  imageUrl: string;
  aspectRatio: 'square' | 'portrait' | 'video';
  isCover?: boolean;
}

const GALLERY_ITEMS = GALLERY_ITEMS_JSON as GalleryItem[];

const NAV_ITEMS = [
  { label: 'Moments in Time', href: '#' },
  { label: 'Commissioned', href: '#' },
  { label: 'Design', href: '#' },
  { label: 'Motion', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'BIO', href: '#' },
  { label: 'Price List', href: '#' },
];

const ITEMS_PER_PAGE = 30;

// Reusable Image Component with Elegant 1.5s Scroll Reveal
const LazyImage = ({ src, alt, className, priority = false, showYear = false, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const yearMatch = src.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : null;

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
        className={`w-full h-full object-cover ${props.imgClassName || ""}`}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-50" />
      )}
      {/* Year Label Overlay */}
      {isLoaded && showYear && year && (
        <div className="absolute top-4 right-4 pointer-events-none">
          <p className="text-[0.5rem] font-light tracking-[0.4em] text-black/20 uppercase italic">
            {year}
          </p>
        </div>
      )}
    </motion.div>
  );
};

function App() {
  const [activeCategory, setActiveCategory] = useState('Moments in Time');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedSubProject, setSelectedSubProject] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [activeYear, setActiveYear] = useState<string | null>(null);

  const yearRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
    setSelectedProject(null);
    setSelectedSubProject(null);
    setActiveYear(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeCategory]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // 無限捲動
          if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1200) {
            setVisibleCount(prev => prev + ITEMS_PER_PAGE);
          }

          // 年份偵測邏輯
          if (activeCategory === 'Moments in Time') {
            const years = Object.keys(yearRefs.current);
            for (const year of years) {
              const element = yearRefs.current[year];
              if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top >= -100 && rect.top <= 350) {
                  setActiveYear(year);
                  break;
                }
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  const filteredAndSortedItems = useMemo(() => {
    const categoryToMatch = activeCategory === 'Moments in Time' ? 'Personal' : activeCategory;
    const items = GALLERY_ITEMS.filter(item => item.category === categoryToMatch);
    return items.sort((a, b) => {
      const yearA = a.imageUrl.match(/\d{4}/)?.[0] || "0";
      const yearB = b.imageUrl.match(/\d{4}/)?.[0] || "0";
      return parseInt(yearB) - parseInt(yearA);
    });
  }, [activeCategory]);

  const projectCovers = useMemo(() => {
    if (activeCategory !== 'Commissioned' && activeCategory !== 'Design') return [];
    const projectsMap: { [key: string]: GalleryItem } = {};
    filteredAndSortedItems.forEach(item => {
      if (!projectsMap[item.title] || item.isCover) projectsMap[item.title] = item;
    });
    return Object.entries(projectsMap).sort((a, b) => {
      const yearA = a[0].match(/\d{4}/)?.[0] || "0";
      const yearB = b[0].match(/\d{4}/)?.[0] || "0";
      return parseInt(yearB) - parseInt(yearA);
    });
  }, [activeCategory, filteredAndSortedItems]);

  const subProjectCovers = useMemo(() => {
    if (!selectedProject) return [];
    const itemsInProject = filteredAndSortedItems.filter(item => item.title === selectedProject);
    const subProjectsMap: { [key: string]: GalleryItem } = {};
    itemsInProject.forEach(item => {
      const subKey = item.subTitle || 'Default';
      if (!subProjectsMap[subKey] || item.isCover) subProjectsMap[subKey] = item;
    });
    return Object.entries(subProjectsMap).sort();
  }, [selectedProject, filteredAndSortedItems]);

  const groupedVisibleItems = useMemo(() => {
    const visible = filteredAndSortedItems.slice(0, visibleCount);
    const groups: { [key: string]: GalleryItem[] } = {};
    visible.forEach(item => {
      const year = item.imageUrl.match(/\d{4}/)?.[0] || "Others";
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });
    return Object.entries(groups).sort((a, b) => {
      if (a[0] === "Others") return 1;
      if (b[0] === "Others") return -1;
      return parseInt(b[0]) - parseInt(a[0]);
    });
  }, [filteredAndSortedItems, visibleCount]);

  const allYears = useMemo(() => {
    if (activeCategory !== 'Moments in Time') return [];
    const years = Array.from(new Set(filteredAndSortedItems.map(item => item.imageUrl.match(/\d{4}/)?.[0]).filter(Boolean))) as string[];
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  }, [activeCategory, filteredAndSortedItems]);

  const displayItems = useMemo(() => {
    const isProjectView = activeCategory === 'Commissioned' || activeCategory === 'Design';
    if (isProjectView && selectedProject) {
      return filteredAndSortedItems.filter(item => {
        if (!selectedSubProject || selectedSubProject === 'Default') return item.title === selectedProject;
        return item.title === selectedProject && item.subTitle === selectedSubProject;
      }).sort((a, b) => {
        if (selectedSubProject === '997' || selectedSubProject === 'gogoro' || selectedProject === 'vehicle') {
          return a.imageUrl.localeCompare(b.imageUrl);
        }
        return 0;
      });
    }
    return filteredAndSortedItems.slice(0, visibleCount);
  }, [filteredAndSortedItems, visibleCount, selectedProject, selectedSubProject, activeCategory]);

  const scrollToYear = (year: string) => {
    const targetIdx = filteredAndSortedItems.findIndex(item => item.imageUrl.includes(year));
    if (targetIdx >= visibleCount) {
      setVisibleCount(targetIdx + 30);
    }
    setTimeout(() => {
      const element = yearRefs.current[year];
      if (element) {
        const headerOffset = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        setActiveYear(year);
      }
    }, 100);
  };

  const isFolderView = (activeCategory === 'Commissioned' || activeCategory === 'Design') && !selectedProject;
  const isSubFolderView = (activeCategory === 'Commissioned' || activeCategory === 'Design') && selectedProject && !selectedSubProject;
  const shouldShowContentDirectly = selectedProject && subProjectCovers.length === 1 && subProjectCovers[0][0] === 'Default';
  const isSeamlessLayout = selectedSubProject === '997' || selectedSubProject === 'gogoro' || (selectedProject === 'vehicle' && selectedSubProject === 'gogoro') || (selectedProject === 'vehicle' && selectedSubProject === '997');

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans text-black">
      <header className="p-8 md:p-12 lg:fixed lg:w-64 lg:h-screen lg:flex lg:flex-col lg:justify-between z-30 bg-white/80 backdrop-blur-sm lg:bg-transparent">
        <div>
          <h1 className="mb-12">
            <a href="/" className="hover:opacity-70 transition-opacity">
              <img src="/images/web logo/未命名-2_工作區域 1.png" alt="HENRI LAI" className="w-16 md:w-20 h-auto" />
            </a>
          </h1>
          <nav>
            <ul className="space-y-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={() => setActiveCategory(item.label)} 
                    className={`nav-link block w-full text-left transition-all duration-500 tracking-[0.2em] ${activeCategory === item.label ? 'font-bold border-b border-black inline-block pb-1 text-black text-[0.68rem]' : 'text-gray-300 hover:text-black text-[0.68rem]'}`}
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
            <a href="https://www.instagram.com/henrilai.photography/" target="_blank" rel="noreferrer" className="hover:text-black"><Instagram size={16} strokeWidth={1.5} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-black"><Linkedin size={16} strokeWidth={1.5} /></a>
          </div>
          <p className="text-[0.56rem] text-gray-300 mt-6 uppercase tracking-[0.2em]">© 2026 Henri Lai</p>
        </footer>
      </header>

      <main className={`lg:ml-64 ${isSeamlessLayout ? 'p-0' : 'p-8 md:p-12 lg:p-16 lg:pt-12'}`}>
        {activeCategory === 'BIO' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto lg:mx-0 p-8">
            <LazyImage src="/images/BIO/profile.jpg" alt="Henri Lai" priority={true} className="aspect-[4/5] mb-16 w-full max-w-xs grayscale hover:grayscale-0 transition-all duration-1000" />
            <div className="space-y-10 text-[0.85rem] leading-[2] text-gray-600 tracking-wider">
              <p className="font-semibold text-black tracking-[0.4em] uppercase text-[1.1rem]">HI , 我是賴昱成</p>
              <div className="space-y-6">
                <p>斜槓設計師、攝影師，目前為自由接案工作者</p>
                <div className="space-y-2">
                  <p><span className="text-black font-semibold mr-4 tracking-[0.2em]">設計</span> 專攻戶外用品設計、平面設計</p>
                  <p><span className="text-black font-semibold mr-4 tracking-[0.2em]">攝影</span> 商品攝影、活動攝影為主，並持續運用底片創作</p>
                </div>
                <p className="pt-4">歡迎透過各平台聯繫洽談商業合作內容 !</p>
              </div>
              <div className="pt-16 border-t border-gray-100">
                <p className="uppercase tracking-[0.3em] text-[0.56rem] text-gray-400 mb-4 font-bold">Contact</p>
                <a href="mailto:hello@henrilai.com" className="hover:text-black underline underline-offset-8 transition-colors text-gray-400">hello@henrilai.com</a>
              </div>
            </div>
          </motion.div>
        ) : activeCategory === 'Price List' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl p-8">
            <h2 className="text-[0.75rem] font-semibold tracking-[0.4em] mb-20 uppercase font-bold text-black">Price List</h2>
            <div className="space-y-16">
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-300 mb-8 font-bold">— Services</h3>
                <ul className="space-y-6">
                  <li className="flex justify-between border-b border-gray-50 pb-4 text-[0.68rem]"><span className="tracking-widest">Photography Session</span><span className="font-light text-gray-400">Contact for pricing</span></li>
                </ul>
              </section>
            </div>
          </motion.div>
        ) : isFolderView ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24 px-4 md:px-8">
            <AnimatePresence>
              {projectCovers.map(([title, item]) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={title} onClick={() => { setSelectedProject(title); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group cursor-pointer flex flex-col items-center text-center px-4 md:px-8">
                  <div className="aspect-square mb-8 overflow-hidden bg-gray-50 w-full"><img src={item.imageUrl} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000 ease-out" /></div>
                  <h2 className="text-[1.125rem] font-medium tracking-[0.2em] uppercase text-black mb-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{title}</h2>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (isSubFolderView && !shouldShowContentDirectly) ? (
          <div className="space-y-12">
            <header className="mb-24 flex items-center justify-between border-b border-gray-100 pb-10">
              <button onClick={() => setSelectedProject(null)} className="flex items-center text-[0.62rem] uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors mb-6 group"><ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" />Back to Categories</button>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24 px-4 md:px-8">
              {subProjectCovers.map(([subTitle, item]) => (
                <motion.div key={subTitle} onClick={() => { setSelectedSubProject(subTitle); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group cursor-pointer flex flex-col items-center text-center px-4 md:px-8">
                  <div className="aspect-square mb-8 overflow-hidden bg-gray-50 w-full"><img src={item.imageUrl} alt={subTitle} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000 ease-out" /></div>
                  <h2 className="text-[1.125rem] font-medium tracking-[0.2em] uppercase text-black mb-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{subTitle === 'Default' ? selectedProject : subTitle}</h2>
                </motion.div>
              ))}
            </div>
          </div>
        ) : activeCategory === 'Moments in Time' ? (
          <div className="space-y-12">
            <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-md py-6 mb-16 border-b border-gray-50 flex justify-center space-x-8 md:space-x-12 px-8 overflow-x-auto no-scrollbar">{allYears.map(year => (<button key={year} onClick={() => scrollToYear(year)} className={`text-[0.62rem] uppercase tracking-[0.4em] transition-all duration-500 whitespace-nowrap ${activeYear === year ? 'text-black font-bold scale-110 underline decoration-1 underline-offset-8' : 'text-gray-300 hover:text-black'}`}>{year}</button>))}</nav>
            <div className="space-y-48">
              {groupedVisibleItems.map(([year, items]) => (
                <section key={year} ref={el => yearRefs.current[year] = el} className="space-y-16">
                  <header className="border-b border-gray-100 pb-6 mb-12 ml-8 md:ml-12"><h2 className="text-[0.875rem] font-bold tracking-[0.6em] text-black/30 uppercase italic">{year}</h2></header>
                  <div className="columns-1 sm:columns-2 md:columns-3 gap-16 lg:gap-24 space-y-16 lg:space-y-24">
                    {items.map((item, index) => (<div key={item.id} onClick={() => setSelectedImage(item)} className="break-inside-avoid mb-16 lg:mb-24 group cursor-crosshair px-4 md:px-8 lg:px-12 text-black"><LazyImage src={item.imageUrl} alt={item.title} priority={index < 6} showYear={activeCategory === 'Moments in Time'} imgClassName="h-auto transition-transform duration-1000 ease-out group-hover:scale-[1.01]" /></div>))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div className={`${isSeamlessLayout ? 'w-full' : 'space-y-12'}`}>
            {(selectedProject || selectedSubProject) && (
              <header className={`mb-24 space-y-8 ${isSeamlessLayout ? 'p-8 md:p-12 lg:p-16' : ''}`}>
                <div className="flex items-center justify-between border-b border-gray-100 pb-10">
                  <div>
                    <button onClick={() => { if (selectedSubProject && !shouldShowContentDirectly) setSelectedSubProject(null); else { setSelectedProject(null); setSelectedSubProject(null); } window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center text-[0.62rem] uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors mb-6 group"><ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" />Back to {selectedSubProject && !shouldShowContentDirectly ? selectedProject : 'Category'}</button>
                    <h2 className="text-[1.125rem] font-medium tracking-[0.3em] uppercase text-black">{isSeamlessLayout ? (selectedSubProject || selectedProject) : (selectedSubProject && selectedSubProject !== 'Default' ? selectedSubProject : selectedProject)}</h2>
                  </div>
                </div>
              </header>
            )}
            <div className={isSeamlessLayout ? 'flex flex-col w-full' : 'columns-1 sm:columns-2 md:columns-3 gap-16 lg:gap-24 space-y-16 lg:space-y-24'}>
              <AnimatePresence>
                {displayItems.map((item, index) => (
                  <div key={item.id} onClick={() => setSelectedImage(item)} className={isSeamlessLayout ? 'w-full' : 'break-inside-avoid mb-16 lg:mb-24 group cursor-crosshair px-4 md:px-8 lg:px-12 text-black'}>
                    <LazyImage src={item.imageUrl} alt={item.title} priority={index < 6} showYear={activeCategory === 'Moments in Time'} imgClassName="h-auto w-full block" className={isSeamlessLayout ? 'bg-transparent' : ''} />
                    {(!selectedProject && activeCategory !== 'Moments in Time') && <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-right"><p className="text-[0.56rem] uppercase tracking-[0.3em] text-gray-300 font-light text-black">{item.title}</p></div>}
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-white/98 p-4 md:p-12 lg:p-24 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-8 right-8 text-black hover:rotate-90 transition-transform duration-500 p-2"><X size={24} strokeWidth={1} /></button>
            <motion.img initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: "spring", damping: 30, stiffness: 200 }} src={selectedImage.imageUrl} alt={selectedImage.title} className="max-w-full max-h-full object-contain shadow-2xl" />
            <div className="absolute bottom-12 left-12 text-left">
              <p className="text-[0.56rem] uppercase tracking-[0.5em] text-gray-300 font-light">{selectedImage.title} {selectedImage.subTitle ? `— ${selectedImage.subTitle}` : ''} <span className="ml-4 opacity-50 tracking-widest">{selectedImage.imageUrl.match(/\d{4}/)?.[0]}</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
