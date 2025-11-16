import React from 'react';
import { cn } from '@/lib/utils';
import FadeIn from './animations/FadeIn';

interface HeroProps {
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ className }) => {
  return (
    <section className={cn('relative min-h-screen flex items-center overflow-hidden', className)}>
      <div className="absolute inset-0 -z-10">
        <div className="relative w-full h-full overflow-hidden">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/Convert-to-MP4-project.mp4" type="video/mp4" />
            {/* Fallback to image if video fails to load */}
            <img 
              src="/tree-wallpaper.jpg" 
              alt="Travel" 
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/tree-wallpaper.heic';
              }}
            />
          </video>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-32 relative z-10 max-w-4xl">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn delay={200}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-white leading-tight mb-6">
              Travel Journal
            </h1>
          </FadeIn>
          
          <FadeIn delay={300}>
            <p className="text-lg md:text-xl text-white/90 mb-4">
              Document your adventures and preserve your memories.
            </p>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Mark your locations, capture your experiences, and let AI help summarize your journeys.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Hero;
