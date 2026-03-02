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
  { label: 'Personal', href: '#' },
  { label: 'Commissioned', href: '#' },
  { label: 'Design', href: '#' },
  { label: 'Motion', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'BIO', href: '#' },
  { label: 'Price List', href: '#' },
];

const ITEMS_PER_PAGE = 30;

const LazyImage = ({ src, alt, className, priority = false, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} className={`relative bg-gray-50 overflow-hidden ${className}`}>
      <motion.img initial={{ opacity: 0 }} animate={{ opacity: isLoaded ? 1 : 0 }} transition={{ duration: 1.5, ease: "easeOut" }} onLoad={() => setIsLoaded(true)} src={src} alt={alt} loading={priority ? "eager" : "lazy"} className={`w-full h-full object-cover ${props.imgClassName || ""}`} {...props} />
      {!isLoaded && <div className="absolute inset-0 bg-gray-50" />}
    </motion.div>
  );
};

function App() {
  const [activeCategory, setActiveCategory] = useState('Personal');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null); // 父分類
  const [selectedSubProject, setSelectedSubProject] = useState<string | null>(null); // 子專案
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
    const handleScroll = () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      }
      if (activeCategory === 'Personal') {
        const years = Object.keys(yearRefs.current);
        for (const year of years) {
          const element = yearRefs.current[year];
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= 200) { setActiveYear(year); break; }
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  const filteredAndSortedItems = useMemo(() => {
    const items = GALLERY_ITEMS.filter(item => item.category === activeCategory);
    return items.sort((a, b) => {
      const yearA = a.imageUrl.match(/\d{4}/)?.[0] || "0";
      const yearB = b.imageUrl.match(/\d{4}/)?.[0] || "0";
      return parseInt(yearB) - parseInt(yearA);
    });
  }, [activeCategory]);

  // 1. 取得父分類目錄 (用於 Design / Commissioned 第一層)
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

  // 2. 取得子專案目錄 (用於 Design 第二層)
  const subProjectCovers = useMemo(() => {
    if (!selectedProject || (activeCategory !== 'Design' && activeCategory !== 'Commissioned')) return [];
    const itemsInProject = filteredAndSortedItems.filter(item => item.title === selectedProject);
    const subProjectsMap: { [key: string]: GalleryItem } = {};
    itemsInProject.forEach(item => {
      const subKey = item.subTitle || 'Default';
      if (!subProjectsMap[subKey] || item.isCover) subProjectsMap[subKey] = item;
    });
    return Object.entries(subProjectsMap).sort();
  }, [selectedProject, activeCategory, filteredAndSortedItems]);

  const allYears = useMemo(() => {
    if (activeCategory !== 'Personal') return [];
    const years = Array.from(new Set(filteredAndSortedItems.map(item => item.imageUrl.match(/\d{4}/)?.[0]).filter(Boolean))) as string[];
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  }, [activeCategory, filteredAndSortedItems]);

  const displayItems = useMemo(() => {
    if (selectedSubProject) {
      return filteredAndSortedItems.filter(item => item.title === selectedProject && (item.subTitle === selectedSubProject || (!item.subTitle && selectedSubProject === 'Default')));
    }
    // 特殊案例：Commissioned 如果沒有子專案，點進去直接顯全部
    if (activeCategory === 'Commissioned' && selectedProject && subProjectCovers.length === 1 && subProjectCovers[0][0] === 'Default') {
      return filteredAndSortedItems.filter(item => item.title === selectedProject);
    }
    return filteredAndSortedItems.slice(0, visibleCount);
  }, [filteredAndSortedItems, visibleCount, selectedProject, selectedSubProject, activeCategory, subProjectCovers]);

  const isFolderView = (activeCategory === 'Commissioned' || activeCategory === 'Design') && !selectedProject;
  const isSubFolderView = (activeCategory === 'Commissioned' || activeCategory === 'Design') && selectedProject && !selectedSubProject;
  
  // 修正邏輯：如果一個專案內只有 Default 子專案，則不顯示子專案目錄，直接進入內容
  const shouldShowContentDirectly = selectedProject && subProjectCovers.length === 1 && subProjectCovers[0][0] === 'Default';

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white font-sans text-black text-xs">
      <header className="p-8 md:p-12 lg:fixed lg:w-64 lg:h-screen lg:flex lg:flex-col lg:justify-between z-30 bg-white/80 backdrop-blur-sm lg:bg-transparent">
        <div>
          <h1 className="text-2xl font-semibold tracking-[0.3em] mb-12 uppercase"><a href="/" className="hover:opacity-70 transition-opacity text-black">HENRI LAI</a></h1>
          <nav>
            <ul className="space-y-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}><button onClick={() => setActiveCategory(item.label)} className={`nav-link block w-full text-left transition-all duration-500 tracking-[0.2em] ${activeCategory === item.label ? 'font-bold border-b border-black inline-block pb-1 text-black text-[11px]' : 'text-gray-300 hover:text-black text-[11px]'}`}>{item.label}</button></li>
              ))}
            </ul>
          </nav>
        </div>
        <footer className="mt-12 lg:mt-0">
          <div className="flex space-x-6 grayscale opacity-30 hover:opacity-100 transition-all duration-700">
            <a href="https://www.instagram.com/henrilai.photography/" target="_blank" rel="noreferrer" className="hover:text-black"><Instagram size={16} strokeWidth={1.5} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-black"><Linkedin size={16} strokeWidth={1.5} /></a>
          </div>
          <p className="text-[9px] text-gray-300 mt-6 uppercase tracking-[0.2em]">© 2026 Henri Lai</p>
        </footer>
      </header>

      <main className={`lg:ml-64 ${selectedSubProject === '997' ? 'p-0' : 'p-8 md:p-12 lg:p-16 lg:pt-12'}`}>
        {activeCategory === 'BIO' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto lg:mx-0 p-8 text-black"><LazyImage src="/images/BIO/profile.jpg" alt="Henri Lai" priority={true} className="aspect-[4/5] mb-16 w-full max-w-xs grayscale hover:grayscale-0 transition-all duration-1000" /><div className="space-y-8 text-[13px] leading-[1.8] text-gray-600 tracking-wide text-black"><p className="font-semibold text-black tracking-[0.3em] uppercase text-xs">HENRI LAI</p><p>這裡可以放您的自我介紹。</p><div className="pt-16 border-t border-gray-100"><p className="uppercase tracking-[0.3em] text-[9px] text-gray-400 mb-4 font-bold">Contact</p><a href="mailto:hello@henrilai.com" className="hover:text-black underline underline-offset-8 transition-colors text-gray-400">hello@henrilai.com</a></div></div></motion.div>
        ) : activeCategory === 'Price List' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl p-8"><h2 className="text-sm font-semibold tracking-[0.4em] mb-20 uppercase font-bold text-black">Price List</h2><div className="space-y-16 text-black"><section><h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-300 mb-8 font-bold">— Services</h3><ul className="space-y-6"><li className="flex justify-between border-b border-gray-50 pb-4 text-[11px] font-sans text-black"><span className="tracking-widest">Photography Session</span><span className="font-light text-gray-400">Contact for pricing</span></li></ul></section></div></motion.div>
        ) : isFolderView ? (
          /* Level 1: Father Categories (e.g., vehicle, graphic) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24 px-4 md:px-8">
            <AnimatePresence mode="popLayout">
              {projectCovers.map(([title, item]) => (
                <motion.div layout initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} key={title} onClick={() => { setSelectedProject(title); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group cursor-pointer flex flex-col items-center text-center px-4 md:px-8">
                  <div className="aspect-square mb-8 overflow-hidden bg-gray-50 w-full"><img src={item.imageUrl} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000 ease-out" /></div>
                  <h2 className="text-[18px] font-medium tracking-[0.2em] uppercase text-black mb-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{title}</h2>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (isSubFolderView && !shouldShowContentDirectly) ? (
          /* Level 2: Sub Projects (e.g., 997, gogoro) */
          <div className="space-y-12">
            <header className="mb-24 flex items-center justify-between border-b border-gray-100 pb-10">
              <button onClick={() => setSelectedProject(null)} className="flex items-center text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors mb-6 group"><ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" />Back to Designs</button>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24 px-4 md:px-8">
              {subProjectCovers.map(([subTitle, item]) => (
                <motion.div layout key={subTitle} onClick={() => { setSelectedSubProject(subTitle); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group cursor-pointer flex flex-col items-center text-center px-4 md:px-8">
                  <div className="aspect-square mb-8 overflow-hidden bg-gray-50 w-full"><img src={item.imageUrl} alt={subTitle} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000 ease-out" /></div>
                  <h2 className="text-[18px] font-medium tracking-[0.2em] uppercase text-black mb-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{subTitle === 'Default' ? selectedProject : subTitle}</h2>
                </motion.div>
              ))}
            </div>
          </div>
        ) : activeCategory === 'Personal' ? (
          <div className="space-y-12">
            <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-md py-6 mb-16 border-b border-gray-50 flex justify-center space-x-8 md:space-x-12 px-8 overflow-x-auto no-scrollbar">{allYears.map(year => (<button key={year} onClick={() => { const el = yearRefs.current[year]; if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 100, behavior: 'smooth' }); }} className={`text-[10px] uppercase tracking-[0.4em] transition-all duration-500 whitespace-nowrap ${activeYear === year ? 'text-black font-bold scale-110' : 'text-gray-300 hover:text-black'}`}>{year}</button>))}</nav>
            <div className="space-y-48">{groupedVisibleItems.map(([year, items]) => (<section key={year} ref={el => yearRefs.current[year] = el} className="space-y-16"><header className="border-b border-gray-100 pb-6 mb-12 ml-8 md:ml-12"><h2 className="text-[14px] font-bold tracking-[0.6em] text-black/30 uppercase italic">{year}</h2></header><div className="columns-1 sm:columns-2 md:columns-3 gap-16 lg:gap-24 space-y-16 lg:space-y-24"><AnimatePresence mode="popLayout">{items.map((item, index) => (<div key={item.id} onClick={() => setSelectedImage(item)} className="break-inside-avoid mb-16 lg:mb-24 group cursor-crosshair px-4 md:px-8 lg:px-12 text-black"><LazyImage src={item.imageUrl} alt={item.title} priority={index < 6} imgClassName="h-auto transition-transform duration-1000 ease-out group-hover:scale-[1.01]" /></div>))}</AnimatePresence></div></section>))}</div>
          </div>
        ) : (
          /* Level 3: Content View */
          <div className={`${selectedSubProject === '997' ? 'w-full text-black' : 'space-y-12'}`}>
            {(selectedProject || selectedSubProject) && (
              <header className={`mb-24 space-y-8 ${selectedSubProject === '997' ? 'p-8 md:p-12 lg:p-16 text-black' : ''} text-black`}>
                <div className="flex items-center justify-between border-b border-gray-100 pb-10">
                  <div>
                    <button onClick={() => { if (selectedSubProject && !shouldShowContentDirectly) setSelectedSubProject(null); else { setSelectedProject(null); setSelectedSubProject(null); } window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors mb-6 group"><ArrowLeft size={12} className="mr-2 group-hover:-translate-x-1 transition-transform" />Back to {selectedSubProject && !shouldShowContentDirectly ? selectedProject : 'Category'}</button>
                    <h2 className="text-[18px] font-medium tracking-[0.3em] uppercase text-black">{selectedSubProject === '997' ? '997' : (selectedSubProject && selectedSubProject !== 'Default' ? selectedSubProject : selectedProject)}</h2>
                  </div>
                </div>
              </header>
            )}
            <div className={selectedSubProject === '997' ? 'flex flex-col w-full' : 'columns-1 sm:columns-2 md:columns-3 gap-16 lg:gap-24 space-y-16 lg:space-y-24'}>
              <AnimatePresence mode="popLayout">
                {displayItems.map((item, index) => (
                  <div key={item.id} onClick={() => setSelectedImage(item)} className={selectedSubProject === '997' ? 'w-full text-black' : 'break-inside-avoid mb-16 lg:mb-24 group cursor-crosshair px-4 md:px-8 lg:px-12 text-black'}>
                    <LazyImage src={item.imageUrl} alt={item.title} priority={index < 6} showYear={activeCategory === 'Personal'} imgClassName="h-auto w-full block" className={selectedSubProject === '997' ? 'bg-transparent' : ''} />
                    {(!selectedProject && activeCategory !== 'Personal') && <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-right"><p className="text-[9px] uppercase tracking-[0.3em] text-gray-300 font-light">{item.title}</p></div>}
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
              <p className="text-[9px] uppercase tracking-[0.5em] text-gray-300 font-light">{selectedImage.title} {selectedImage.subTitle ? `— ${selectedImage.subTitle}` : ''} <span className="ml-4 opacity-50 tracking-widest">{selectedImage.imageUrl.match(/\d{4}/)?.[0]}</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
