import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import promoImg from '@/assets/promo-ad.png';

interface PromoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const PromoPopup: React.FC<PromoPopupProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-neutral-900 border border-[#ADFF44]/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(173,255,68,0.25)] z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content Link wrapper */}
            <a 
              href="https://academy.koutuhal.in/page/aiforschoolstudents-hvf2e6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group"
            >
              {/* Image Section */}
              <div className="relative h-64 sm:h-[450px] md:h-[550px] overflow-hidden">
                <img
                  src={promoImg}
                  alt="AI for School Students"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                
                {/* Badge on Image */}
                <div className="absolute bottom-4 left-6">
                  <div className="bg-[#ADFF44] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_#ADFF44]">
                    <Sparkles className="h-3 w-3 fill-black" />
                    New Program
                  </div>
                </div>
              </div>

              {/* Text Section */}
              <div className="p-8 sm:p-12 pt-0">
                <h3 className="text-3xl sm:text-5xl font-display font-black text-white mb-4 leading-tight">
                  AI FOR students <br />
                  <span className="text-[#ADFF44]">SUMMER BOOTCAMP</span>
                </h3>
                <p className="text-neutral-400 text-lg sm:text-xl mb-8 leading-relaxed max-w-2xl">
                  Join the most intensive AI workshop this summer. Build real projects, master modern AI tools, and jumpstart your futuristic career today!
                </p>

                <Button className="w-full sm:w-auto px-12 h-16 bg-[#ADFF44] text-black hover:bg-[#9BE63D] font-black underline uppercase tracking-widest rounded-2xl group-hover:shadow-[0_0_30px_#ADFF4455] transition-all text-lg">
                  Enroll Now <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </div>
            </a>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromoPopup;
