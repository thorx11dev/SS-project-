import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Store } from 'lucide-react';
import { motion } from 'motion/react';

export const Contact = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      // Pakistan is UTC+5
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const pkt = new Date(utc + (3600000 * 5));
      const hour = pkt.getHours();
      
      // Open from 12:00 to 23:00
      if (hour >= 12 && hour < 23) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 md:mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl uppercase italic font-bold tracking-tighter mb-4"
          >
            Contact Us
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* Contact Info Cards */}
          <div className="space-y-6">
            
            {/* Address Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-900 text-white p-6 md:p-8 rounded-3xl border border-neutral-800 shadow-sm flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <MapPin size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold uppercase italic mb-2">Location</h3>
                <p className="text-neutral-400 leading-relaxed font-mono text-sm">
                  FGWM+9MJ, Mujahid Rd, Rehmat Pura Latefa Bad,<br/>
                  Sialkot, Punjab, Pakistan
                </p>
              </div>
            </motion.div>

            {/* Hours Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-900 text-white p-6 md:p-8 rounded-3xl border border-neutral-800 shadow-sm flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <Clock size={24} className="text-white" />
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-xl font-bold uppercase italic">Opening Hours</h3>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                    {isOpen ? 'Open Now' : 'Closed'}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-neutral-400 font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-white font-bold">Monday</span>
                    <span className="font-bold text-white">12:00 – 23:00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-white font-bold">Tuesday</span>
                    <span className="font-bold text-white">12:00 – 23:00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-white font-bold">Wednesday</span>
                    <span className="font-bold text-white">12:00 – 23:00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-white font-bold">Thursday</span>
                    <span className="font-bold text-white">12:00 – 23:00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-white font-bold">Friday</span>
                    <span className="font-bold text-white">12:00 – 23:00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-white font-bold">Saturday</span>
                    <span className="font-bold text-white">12:00 – 23:00</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-white font-bold">Sunday</span>
                    <span className="font-bold text-white">12:00 – 23:00</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Links - Horizontal Layout */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-row justify-center sm:justify-start gap-4"
            >
              {/* WhatsApp */}
              <a 
                href="https://wa.me/923318614995?partnertoken=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJHb29nbGUiLCJpYXQiOjE3NzMyMjgyMTMsInVybCI6Imh0dHBzOi8vd2EubWUvOTIzMzE4NjE0OTk1IiwiZXhwIjoxNzczMjI4NTEzfQ.Y3hMtcdpfParpa5Kd6FCytTAuyP0MBLsMLpgonv1wYsh4oxYkLWBRoKGGJwAUs0DTz8cpR-c99uzX9MxRU9azQ" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-16 h-16 sm:w-20 sm:h-20 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                title="WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
              </a>
              
              {/* Facebook */}
              <a 
                href="https://www.facebook.com/137817149695754" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Phone */}
              <a 
                href="tel:+923029069925" 
                className="w-16 h-16 sm:w-20 sm:h-20 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                title="Call Us"
              >
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </a>
            </motion.div>

          </div>

          {/* Map Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800 shadow-sm h-[400px] lg:h-auto min-h-[500px] overflow-hidden relative"
          >
            <div className="absolute top-8 left-8 z-10 bg-black/80 text-white backdrop-blur px-4 py-2 rounded-full shadow-md flex items-center gap-2 border border-white/10">
              <Store size={16} className="text-white" />
              <span className="font-bold text-sm">Janjua Sports / Kashif Sports</span>
            </div>
            {/* Google Maps Embed */}
            <div className="w-full h-full rounded-2xl overflow-hidden bg-neutral-800">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3365.118949216053!2d74.5369661!3d32.4962222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391eeab885555555%3A0x123456789abcdef!2sMujahid%20Rd%2C%20Rehmat%20Pura%20Latefa%20Bad%2C%20Sialkot%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Kashif Sports Location"
                className="w-full h-full invert-[0.9] hue-rotate-180 contrast-125 opacity-80 hover:opacity-100 transition-opacity duration-500"
              ></iframe>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
