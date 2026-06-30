/**
 * Image gallery with thumbnail navigation.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

export default function ProductImageGallery({ images = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-square card flex items-center justify-center text-slate-400">
        No images available
      </div>
    );
  }

  const next = (e) => {
    e?.stopPropagation();
    setActiveIdx((i) => (i + 1) % images.length);
  };
  const prev = (e) => {
    e?.stopPropagation();
    setActiveIdx((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="space-y-2">
        <div
          className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-zoom-in"
          onClick={() => setFullscreen(true)}
        >
          <img
            src={images[activeIdx]?.image_url || images[activeIdx]?.image}
            alt=""
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 flex items-center justify-center hover:bg-white"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 flex items-center justify-center hover:bg-white"
              >
                <FiChevronRight />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {activeIdx + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveIdx(idx)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  activeIdx === idx ? 'border-brand' : 'border-transparent'
                }`}
              >
                <img src={img.image_url || img.image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setFullscreen(false)}
          >
            <button className="absolute top-4 right-4 text-white p-2" onClick={() => setFullscreen(false)}>
              <FiX size={28} />
            </button>
            <button onClick={prev} className="absolute left-4 text-white p-2">
              <FiChevronLeft size={40} />
            </button>
            <button onClick={next} className="absolute right-4 text-white p-2">
              <FiChevronRight size={40} />
            </button>
            <motion.img
              key={activeIdx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={images[activeIdx]?.image_url || images[activeIdx]?.image}
              alt=""
              className="max-w-full max-h-[90vh] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
