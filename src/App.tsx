import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, ExternalLink } from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  aspectRatio: 'square' | 'portrait' | 'video';
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, title: 'Personal Work 1', category: 'Personal', imageUrl: '', aspectRatio: 'square' },
  { id: 2, title: 'Commissioned Work 1', category: 'Commissioned', imageUrl: '', aspectRatio: 'portrait' },
  { id: 3, title: 'Design Project 1', category: 'Design', imageUrl: '', aspectRatio: 'square' },
  { id: 4, title: 'Motion Graphic 1', category: 'Motion', imageUrl: '', aspectRatio: 'video' },
  { id: 5, title: 'Personal Work 2', category: 'Personal', imageUrl: '', aspectRatio: 'portrait' },
  { id: 6, title: 'Design Project 2', category: 'Design', imageUrl: '', aspectRatio: 'square' },
];

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
    activeCategory === 'Personal' || item.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar Navigation */}
      <header className="p-8 md:p-12 lg:fixed lg:w-64 lg:h-screen lg:flex lg:flex-col lg:justify-between z-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-widest mb-12">
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
                        ? 'font-bold border-b border-black inline-block pb-0.5' 
                        : 'text-gray-500 hover:text-black'
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
                relative group overflow-hidden cursor-pointer bg-gray-50
                ${item.aspectRatio === 'square' ? 'aspect-square' : ''}
                ${item.aspectRatio === 'portrait' ? 'aspect-[3/4]' : ''}
                ${item.aspectRatio === 'video' ? 'aspect-video' : ''}
              `}
            >
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform duration-700 ease-out">
                {/* Image will go here */}
                <span className="text-xs uppercase tracking-widest">{item.title}</span>
              </div>
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}

export default App
