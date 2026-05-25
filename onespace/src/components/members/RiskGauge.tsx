"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate the score from 0 to target over 1.5s
    const duration = 1500;
    const start = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedScore(Math.floor(score * ease));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  // Determine color based on score
  let color = "#22C55E"; // Green
  let labelColor = "text-green-600";
  let labelText = "Healthy";
  
  if (score >= 70) {
    color = "#EF4444"; // Red
    labelColor = "text-red-600";
    labelText = "High Risk";
  } else if (score >= 40) {
    color = "#F59E0B"; // Amber
    labelColor = "text-amber-600";
    labelText = "Medium Risk";
  }

  // SVG arc math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // Use a semicircular arc (half circumference) plus a bit extra for styling
  const arcLength = circumference * 0.75; 
  const strokeDasharray = `${arcLength} ${circumference}`;
  const strokeDashoffset = arcLength - (animatedScore / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-[135deg]" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
          />
          {/* Active track */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Value text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-3xl font-bold font-heading text-cs-black">
            {animatedScore}
          </span>
          <span className="text-[10px] text-cs-gray-500 uppercase tracking-wider font-semibold">
            Risk Score
          </span>
        </div>
      </div>
      
      <div className={`mt-[-10px] font-semibold text-sm ${labelColor}`}>
        {labelText}
      </div>
    </div>
  );
}
