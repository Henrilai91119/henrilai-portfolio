import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, X, ArrowLeft } from 'lucide-react';

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
  aspectRatio: 'square' | 'portrait' | 'video';
  isCover?: boolean;
  hue?: number;
}

const GALLERY_ITEMS = GALLERY_ITEMS_JSON as GalleryItem[];
const DESCRIPTIONS = PROJECT_DESCRIPTIONS as { [key: string]: string };
const PRICE_ITEMS = PRICE_LIST_JSON as PriceItem[];

interface PriceItem {
  title: string;
  content: string;
  imageUrl: string | null;
}

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

// Reusable Image Component with Custom Loading GIF
const LazyImage = ({ src, alt, className, priority = false, showYear = false, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const yearMatch = src ? src.match(/\d{4}/) : null;
  const year = yearMatch ? yearMatch[0] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative bg-gray-50 overflow-hidden ${className}`}
    >
      {/* Loading GIF Placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10"
          >
            <img 
              src="/images/gif/loading.gif" 
              alt="Loading..." 
              className="w-12 h-12 opacity-30 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        onLoad={() => setIsLoaded(true)}
        src={src || ''}
        alt={alt || 'Henri Lai Portfolio Work'}
        loading={priority ? "eager" : "lazy"}
        className={`w-full h-full object-cover ${props.imgClassName || ""}`}
        {...props}
      />
      
      {/* Year Label Overlay */}
      {isLoaded && showYear && year && (
        <div className="absolute top-4 right-4 pointer-events-none text-black">
          <p className="text-[0.5rem] font-light tracking-[0.4em] text-black/20 uppercase italic">{year}</p>
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
    if (activeCategory === 'Design') {
      setSelectedProject('graphic');
      setSelectedSubProject(null);
    } else {
      setSelectedProject(null);
      setSelectedSubProject(null);
    }
    setActiveYear(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeCategory]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1200) {
            setVisibleCount(prev => prev + ITEMS_PER_PAGE);
          }
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
    return [...items].sort((a, b) => {
      const yearA = a.imageUrl?.match(/\d{4}/)?.[0] || "0";
      const yearB = b.imageUrl?.match(/\d{4}/)?.[0] || "0";
      if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
      return (a.hue || 0) - (b.hue || 0);
    });
  }, [activeCategory]);

  const designParentCategories = useMemo(() => {
    if (activeCategory !== 'Design') return [];
    return Array.from(new Set(filteredAndSortedItems.map(item => item.title))).filter(Boolean).sort() as string[];
  }, [activeCategory, filteredAndSortedItems]);

  const subProjectList = useMemo(() => {
    if (!selectedProject || activeCategory !== 'Design') return [];
    const subs = Array.from(new Set(
      filteredAndSortedItems.filter(item => item.title === selectedProject).map(item => item.subTitle).filter(Boolean)
    )) as string[];
    return subs.sort((a, b) => {
      if (a.toLowerCase() === 'wanderer') return -1;
      if (b.toLowerCase() === 'wanderer') return 1;
      return a.localeCompare(b);
    });
  }, [selectedProject, activeCategory, filteredAndSortedItems]);

  const projectCovers = useMemo(() => {
    if (activeCategory !== 'Commissioned') return [];
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

  const allYears = useMemo(() => {
    if (activeCategory !== 'Moments in Time') return [];
    const years = Array.from(new Set(filteredAndSortedItems.map(item => item.imageUrl?.match(/\d{4}/)?.[0]).filter(Boolean))) as string[];
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  }, [activeCategory, filteredAndSortedItems]);

  const displayItems = useMemo(() => {
    if (activeCategory === 'Commissioned' && selectedProject) {
      return filteredAndSortedItems.filter(item => item.title === selectedProject && !item.isCover);
    }
    if (activeCategory === 'Design') {
      const projectToMatch = selectedProject || 'graphic';
      let items = filteredAndSortedItems.filter(item => item.title === projectToMatch);
      if (selectedSubProject) items = items.filter(item => item.subTitle === selectedSubProject && !item.isCover);
      else if (projectToMatch !== 'graphic') items = items.filter(item => !item.isCover);
      const isSeamless = selectedSubProject === '997' || selectedSubProject === 'gogoro' || selectedSubProject === 'wanderer' || (projectToMatch === 'vehicle' && !selectedSubProject);
      if (isSeamless) return [...items].sort((a, b) => (a.imageUrl || '').localeCompare(b.imageUrl || ''));
      return items.slice(0, visibleCount);
    }
    return filteredAndSortedItems.slice(0, visibleCount);
  }, [filteredAndSortedItems, visibleCount, selectedProject, selectedSubProject, activeCategory]);

  const scrollToYear = (year: string) => {
    const targetIdx = filteredAndSortedItems.findIndex(item => item.imageUrl?.includes(year));
    if (targetIdx >= visibleCount) setVisibleCount(targetIdx + 30);
    setTimeout(() => {
      const element = yearRefs.current[year];
      if (element) {
        const headerOffset = 120;
        window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - headerOffset, behavior: 'smooth' });
        setActiveYear(year);
      }
    }, 100);
  };

  const isSeamlessLayout = activeCategory === 'Design' && (selectedSubProject === '997' || selectedSubProject === 'gogoro' || selectedSubProject === 'wanderer' || (selectedProject === 'vehicle' && !selectedSubProject));
  const groupedVisibleItems = useMemo(() => {
    if (activeCategory !== 'Moments in Time') return [];
    const visible = filteredAndSortedItems.slice(0, visibleCount);
    const groups: { [key: string]: GalleryItem[] } = {};
    visible.forEach(item => {
      const year = item.imageUrl?.match(/\d{4}/)?.[0] || "Others";
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });
    return Object.entries(groups).sort((a, b) => {
      if (a[0] === "Others") return 1;
      if (b[0] === "Others") return -1;
      return parseInt(b[0]) - parseInt(a[0]);
    });
  }, [filteredAndSortedItems, visibleCount, activeCategory]);

  const isEmptyCategory = filteredAndSortedItems.length === 0 && !['BIO', 'Price List'].includes(activeCategory);
  const currentDescription = useMemo(() => {
    const key = (selectedSubProject || selectedProject || activeCategory).toLowerCase();
    return DESCRIPTIONS[key] || null;
  }, [selectedProject, selectedSubProject, activeCategory]);

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans text-black">
      <header className="p-8 md:p-12 lg:fixed lg:w-64 lg:h-screen lg:flex lg:flex-col lg:justify-between z-30 bg-white/80 backdrop-blur-sm lg:bg-transparent text-black">
        <div>
          <h1 className="mb-12"><a href="/" className="hover:opacity-70 transition-opacity"><img src="/images/web logo/未命名-2_工作區域 1.png" alt="HENRI LAI Logo" className="w-16 md:w-20 h-auto" /></a></h1>
          <nav>
            <ul className="space-y-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}><button onClick={() => setActiveCategory(item.label)} className={`nav-link block w-full text-left transition-all duration-500 tracking-[0.2em] ${activeCategory === item.label ? 'font-bold border-b border-black inline-block pb-1 text-black text-[0.68rem]' : 'text-gray-300 hover:text-black text-[0.68rem]'}`}>{item.label}</button></li>
              ))}
            </ul>
          </nav>
        </div>
        <footer className="mt-12 lg:mt-0 text-black">
          <div className="flex space-x-6 grayscale opacity-30 hover:opacity-100 transition-all duration-700 text-black">
            <a href="https://www.instagram.com/henrilai.photography/" target="_blank" rel="noopener noreferrer" className="hover:text-black"><Instagram size={16} strokeWidth={1.5} /></a>
          </div>
          <p className="text-[0.56rem] text-gray-300 mt-6 uppercase tracking-[0.2em]">© 2026 Henri Lai</p>
        </footer>
      </header>

      <main className={`lg:ml-64 ${isSeamlessLayout ? 'p-0' : 'p-8 md:p-12 lg:p-16 lg:pt-12'} text-black text-black`}>
        {activeCategory === 'BIO' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto lg:mx-0 p-8 text-black">
            <LazyImage src="/images/BIO/self.jpg" alt="Henri Lai Profile" priority={true} className="aspect-[4/5] mb-16 w-full max-w-xs grayscale hover:grayscale-0 transition-all duration-1000 text-black" />
            <div className="space-y-10 text-[0.85rem] leading-[2] text-gray-600 tracking-wider text-black text-black">
              <p className="font-semibold text-black tracking-[0.4em] uppercase text-[1.1rem] text-black">HI , 我是賴昱成</p>
              <div className="space-y-6 text-black text-black text-black"><p className="text-black text-black">斜槓設計師、攝影師，目前為自由接案工作者</p><div className="space-y-2 text-black text-black"><p className="text-black text-black"><span className="text-black font-semibold mr-4 tracking-[0.2em] text-black text-black">設計</span> 專攻戶外用品設計、平面設計</p><p className="text-black text-black text-black"><span className="text-black font-semibold mr-4 tracking-[0.2em] text-black text-black text-black">攝影</span> 商品攝影、活動攝影為主，並持續運用底片創作</p></div><p className="pt-4 text-black text-xs text-black text-black text-black">歡迎透過各平台聯繫洽談商業合作內容 !</p></div>
              <div className="pt-16 border-t border-gray-100 text-black text-black"><p className="uppercase tracking-[0.3em] text-[0.56rem] text-gray-400 mb-4 font-bold text-black text-black">Contact</p><a href="mailto:lai91119@gmail.com" className="hover:text-black underline underline-offset-8 transition-colors text-gray-400 font-sans text-black text-black">lai91119@gmail.com</a></div>
            </div>
          </motion.div>
        ) : activeCategory === 'Price List' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto p-8 space-y-32 py-20 text-black text-black">
            {PRICE_ITEMS.map((item, index) => (
              <div key={item.title} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-start text-black`}>
                <div className="w-full md:w-1/2"><LazyImage src={item.imageUrl} alt={`${item.title} pricing`} className="w-full h-auto" imgClassName="object-contain h-auto" /></div>
                <div className="w-full md:w-1/2 space-y-8 text-black pt-4 text-black"><h2 className="text-[1.1rem] font-bold tracking-[0.4em] uppercase border-b border-gray-100 pb-4 text-black text-black">{item.title}</h2><div className="text-[0.8rem] leading-[2.2] text-gray-600 tracking-wide whitespace-pre-wrap text-black font-sans text-black">{item.content}</div></div>
              </div>
            ))}
            {PRICE_ITEMS.length === 0 && (<div className="h-[40vh] flex flex-col items-center justify-center text-center text-black font-sans text-black"><p className="text-[0.62rem] uppercase tracking-[0.5em] text-gray-300 text-black">Section under construction</p><h2 className="text-[0.85rem] font-bold tracking-[0.3em] uppercase text-black mt-4 font-sans text-black text-black">正在建置中</h2></div>)}
          </motion.div>
        ) : activeCategory === 'Commissioned' && !selectedProject ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24 px-4 md:px-8 text-black text-black">
            <AnimatePresence>
              {projectCovers.map(([title, item]) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={title} onClick={() => { setSelectedProject(title); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group cursor-pointer flex flex-col items-center text-center px-4 md:px-8 text-black text-black">
                  <div className="aspect-square mb-8 overflow-hidden bg-gray-50 w-full text-black text-black"><img src={item.imageUrl} alt={`${title} cover`} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000 ease-out text-black text-black" /></div>
                  <h2 className="text-[1.125rem] font-medium tracking-[0.2em] uppercase text-black mb-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity text-black font-sans text-black text-black text-black text-black">{title}</h2>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className={`${isSeamlessLayout ? 'w-full text-black' : 'space-y-12 text-black'}`}>
            {activeCategory === 'Moments in Time' && (
              <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-md py-6 mb-16 border-b border-gray-50 flex justify-center space-x-8 md:space-x-12 px-8 overflow-x-auto no-scrollbar text-black font-sans text-black">
                {allYears.map(year => (<button key={year} onClick={() => scrollToYear(year)} className={`text-[0.62rem] uppercase tracking-[0.4em] transition-all duration-500 whitespace-nowrap ${activeYear === year ? 'text-black font-bold scale-110 underline decoration-1 underline-offset-8 text-black' : 'text-gray-300 hover:text-black text-gray-300'}`}>{year}</button>))}
              </nav>
            )}
            {activeCategory === 'Design' && (
              <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md py-6 mb-16 border-b border-gray-50 space-y-6 text-black font-sans text-black">
                <nav className="flex justify-center space-x-8 md:space-x-12 px-8 overflow-x-auto no-scrollbar text-black font-sans text-black">
                  {designParentCategories.map(cat => (<button key={cat} onClick={() => { setSelectedProject(cat); setSelectedSubProject(null); }} className={`text-[0.62rem] uppercase tracking-[0.4em] transition-all duration-500 ${selectedProject === cat ? 'text-black font-bold text-black' : 'text-gray-300 hover:text-black text-gray-300'}`}>{cat}</button>))}
                </nav>
                {selectedProject && subProjectList.length > 0 && (
                  <nav className="flex justify-center space-x-6 md:space-x-8 px-8 overflow-x-auto no-scrollbar text-black pt-2 font-sans text-black">
                    {subProjectList.map(sub => (<button key={sub} onClick={() => setSelectedSubProject(sub)} className={`text-[0.56rem] uppercase tracking-[0.3em] transition-all duration-500 ${selectedSubProject === sub ? 'text-black border-b border-black text-black' : 'text-gray-300 hover:text-black text-gray-300'}`}>{sub}</button>))}
                  </nav>
                )}
              </header>
            )}
            {activeCategory === 'Commissioned' && selectedProject && (
              <header className="mb-24 flex items-center justify-between border-b border-gray-100 pb-10 text-black font-sans text-black">
                <div><button onClick={() => setSelectedProject(null)} className="flex items-center text-[0.62rem] uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors mb-6 group text-black font-sans text-black"><ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform text-black" />Back to Categories</button><h2 className="text-[1.125rem] font-medium tracking-[0.3em] uppercase text-black font-sans text-black">{selectedProject}</h2></div>
              </header>
            )}
            {currentDescription && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`max-w-2xl mx-auto mb-24 px-8 ${isSeamlessLayout ? 'mt-32 text-black' : ''} text-black text-black`}>
                <div className="text-[0.8rem] leading-[2.2] text-gray-500 tracking-wide font-light whitespace-pre-wrap text-center italic text-black font-sans text-black">{currentDescription}</div>
              </motion.div>
            )}
            {isEmptyCategory ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-[40vh] flex flex-col items-center justify-center text-center text-black font-sans text-black text-black">
                <p className="text-[0.62rem] uppercase tracking-[0.5em] text-gray-300 text-black">Section under construction</p>
                <h2 className="text-[0.85rem] font-bold tracking-[0.3em] uppercase text-black mt-4 font-sans text-black text-black text-black">正在建置中</h2>
              </motion.div>
            ) : activeCategory === 'Moments in Time' ? (
              <div className="space-y-48 text-black text-black">
                {groupedVisibleItems.map(([year, items]) => (
                  <section key={year} ref={el => yearRefs.current[year] = el} className="space-y-16 text-black text-black">
                    <header className="border-b border-gray-100 pb-6 mb-12 ml-8 md:ml-12 text-black text-[0.875rem] text-black"><h2 className="text-[0.875rem] font-bold tracking-[0.6em] text-black/30 uppercase italic text-black font-sans text-black text-black">{year}</h2></header>
                    <div className="columns-1 sm:columns-2 md:columns-3 gap-16 lg:gap-24 space-y-16 lg:space-y-24 text-black text-black text-black">
                      {items.map((item, index) => (<div key={item.id} onClick={() => setSelectedImage(item)} className="break-inside-avoid mb-16 lg:mb-24 group cursor-crosshair px-4 md:px-8 lg:px-12 text-black text-black"><LazyImage src={item.imageUrl} alt={`${year} work ${index + 1}`} priority={index < 6} showYear={false} imgClassName="h-auto transition-transform duration-1000 ease-out group-hover:scale-[1.01] text-black text-black" /></div>))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className={isSeamlessLayout ? 'flex flex-col w-full max-w-2xl mx-auto text-black text-black' : 'columns-1 sm:columns-2 md:columns-3 gap-16 lg:gap-24 space-y-16 lg:space-y-24 text-black text-black'}>
                {displayItems.map((item, index) => (
                  <div key={item.id} onClick={() => setSelectedImage(item)} className={isSeamlessLayout ? 'w-full text-black text-black' : 'break-inside-avoid mb-16 lg:mb-24 group cursor-crosshair px-4 md:px-8 lg:px-12 text-black text-black'}>
                    <LazyImage src={item.imageUrl} alt={item.title || 'Portfolio Work'} priority={index < 6} showYear={false} imgClassName="h-auto w-full block" className={isSeamlessLayout ? 'bg-transparent text-black text-black' : 'text-black text-black'} />
                    {(!selectedProject && activeCategory !== 'Moments in Time') && <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-right text-black font-sans text-black text-black"><p className="text-[0.56rem] uppercase tracking-[0.3em] text-gray-300 font-light text-black font-sans text-black text-black">{item.title}</p></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-white/98 p-4 md:p-12 lg:p-24 cursor-zoom-out text-black text-black text-black" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-8 right-8 text-black hover:rotate-90 transition-transform duration-500 p-2 text-black text-black text-black text-black text-black"><X size={24} strokeWidth={1} /></button>
            <motion.img initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: "spring", damping: 30, stiffness: 200 }} src={selectedImage.imageUrl} alt={selectedImage.title} className="max-w-full max-h-full object-contain shadow-2xl text-black" />
            <div className="absolute bottom-12 left-12 text-left text-black text-black text-black text-black">
              <p className="text-[0.56rem] uppercase tracking-[0.5em] text-gray-300 font-light text-black font-sans text-black text-black text-black">{selectedImage.title} {selectedImage.subTitle ? `— ${selectedImage.subTitle}` : ''} <span className="ml-4 opacity-50 tracking-widest text-black text-black text-black">{selectedImage.imageUrl?.match(/\d{4}/)?.[0]}</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
