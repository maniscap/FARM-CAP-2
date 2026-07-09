import { motion } from 'framer-motion';

export default function SplashScreen() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col justify-between items-center py-12 z-[100] font-sans overflow-hidden">
      
      {/* Top Spacer */}
      <div className="flex-1 flex flex-col justify-center items-center w-full px-6">
        
        {/* Logo and Name */}
        <motion.div 
          className="flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="text-6xl md:text-7xl mb-4 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            🧢
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-white text-4xl md:text-5xl font-black tracking-widest text-center mb-2 drop-shadow-lg">
            FARM CAP
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-white/70 text-xs md:text-sm font-semibold tracking-widest text-center mb-6">
            - GROWING SMARTER TOGETHER -
          </motion.p>
          
          <motion.div variants={itemVariants} className="w-16 h-1 bg-white/30 rounded-full mb-8"></motion.div>
          
          <motion.p variants={itemVariants} className="text-white/70 text-sm md:text-base font-semibold tracking-[0.3em] text-center mb-2 uppercase">
            by
          </motion.p>
          
          <motion.p variants={itemVariants} className="text-white/80 text-base md:text-lg tracking-[0.2em] text-center uppercase leading-relaxed" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            Sathyabama Democratic<br/>Alliance
          </motion.p>
        </motion.div>
      </div>
      
      {/* Bottom Footer */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
      >
        <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-2">
          <span>POWERED BY</span>
          <span className="flex items-center gap-1.5 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 font-extrabold">
            <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
            GEMINI
          </span>
        </p>
      </motion.div>
      
    </div>
  );
}
