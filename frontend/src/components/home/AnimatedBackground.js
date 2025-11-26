// frontend/src/components/home/AnimatedBackground.js (Novo Componente)
import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = ({ color }) => {
  return (
    <motion.div 
      className="animated-background-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1 } }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <svg className="animated-svg" viewBox="0 0 500 500">
        <defs>
          <filter id="blob-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10"
              result="blob"
            />
          </filter>
        </defs>
        <g filter="url(#blob-filter)">
          <motion.circle
            cx="250"
            cy="250"
            r="100"
            fill={color}
            animate={{
              cx: [250, 200, 300, 250],
              cy: [250, 300, 200, 250],
              r: [100, 120, 90, 100],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx="150"
            cy="150"
            r="80"
            fill={color}
            animate={{
              cx: [150, 250, 100, 150],
              cy: [150, 100, 250, 150],
              r: [80, 100, 70, 80],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
          <motion.circle
            cx="350"
            cy="350"
            r="90"
            fill={color}
            animate={{
              cx: [350, 300, 400, 350],
              cy: [350, 400, 300, 350],
              r: [90, 70, 110, 90],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 10 }}
          />
        </g>
      </svg>
    </motion.div>
  );
};

export default AnimatedBackground;
