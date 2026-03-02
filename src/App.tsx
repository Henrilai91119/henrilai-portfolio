import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin } from 'lucide-react';

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

function App() {
  const [activeCategory, setActiveCategory] = useState('Personal');

  const filteredItems = GALLERY_ITEMS.filter(item => 
    item.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar Navigation */}
      <header className="p-8 md:p-12 lg:fixed lg:w-64 lg:h-screen lg:flex lg:flex-col lg:justify-between z-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-widest mb-12 uppercase">
            <a href="/" className="hover:opacity-70 transition-opacity">HENRI LAI</a>
          </h1>
          <nav>
            <ul className="space-y-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => setActiveCategory(item.label)}
                    className={`nav-link block w-full text-left transition-all duration-300 ${
                      activeCategory === item.label 
                        ? 'font-bold border-b border-black inline-block pb-0.5 text-black' 
                        : 'text-gray-400 hover:text-black'
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
          <div className="flex space-x-6 grayscale opacity-50 hover:opacity-100 transition-all duration-500">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-600">
              <Instagram size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-blue-600">
              <Linkedin size={18} />
            </a>
          </div>
          <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-widest">
            © 2024 Henri Lai
          </p>
        </footer>
      </header>

      {/* Main Content Area */}
      <main className="lg:ml-64 p-8 md:p-12">
        {activeCategory === 'BIO' ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <div className="aspect-[4/5] bg-gray-100 mb-12 w-full max-w-sm grayscale hover:grayscale-0 transition-all duration-1000 overflow-hidden">
              <img 
                src="/images/BIO/profile.jpg" 
                alt="Henri Lai" 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
            <div className="space-y-6 text-sm leading-relaxed text-gray-800">
              <p className="font-semibold text-lg mb-8 tracking-widest uppercase">HENRI LAI</p>
              <p>
                這裡可以放您的自我介紹。
              </p>
              <div className="pt-12">
                <p className="uppercase tracking-widest text-[10px] text-gray-400 mb-4">Contact</p>
                <a href="mailto:hello@henrilai.com" className="hover:text-gray-400 underline underline-offset-4 transition-colors">
                  hello@henrilai.com
                </a>
              </div>
            </div>
          </motion.div>
        ) : activeCategory === 'Price List' ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <h2 className="text-xl font-semibold tracking-widest mb-12 uppercase">Price List</h2>
            <div className="space-y-12">
              <section>
                <h3 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">— Services</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between border-b border-gray-100 pb-2">
                    <span>Photography Session</span>
                    <span className="font-mono">Contact for pricing</span>
                  </li>
                </ul>
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                key={item.id}
                className={`
                  relative group overflow-hidden bg-gray-50
                  ${item.aspectRatio === 'square' ? 'aspect-square' : ''}
                  ${item.aspectRatio === 'portrait' ? 'aspect-[3/4]' : ''}
                  ${item.aspectRatio === 'video' ? 'aspect-video' : ''}
                `}
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default App
