import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      const element = document.getElementById(id);
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 80, // Account for header height
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'py-3 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20 shadow-sm'
          : 'py-5 bg-transparent',
        className
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <NavLink 
          to="/" 
          className={cn(
            "text-xl font-serif font-medium tracking-tight transition-opacity hover:opacity-80",
            isHomePage && !isScrolled && "text-white"
          )}
        >
          Travel Journal
        </NavLink>
        
        <div className="hidden md:flex items-center space-x-8">
          <NavLinks scrollToSection={scrollToSection} isHomePage={isHomePage} isScrolled={isScrolled} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              "h-9 w-9",
              isHomePage && !isScrolled && "text-white hover:bg-white/10"
            )}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        
        <button 
          className="md:hidden flex items-center"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={cn(
            "block w-6 transition-all duration-300",
            isMobileMenuOpen ? "opacity-0" : "opacity-100"
          )}>
            <span className={cn(
              "block w-6 h-0.5 mb-1.5",
              isHomePage && !isScrolled ? "bg-white" : "bg-foreground"
            )} />
            <span className={cn(
              "block w-6 h-0.5 mb-1.5",
              isHomePage && !isScrolled ? "bg-white" : "bg-foreground"
            )} />
            <span className={cn(
              "block w-4 h-0.5",
              isHomePage && !isScrolled ? "bg-white" : "bg-foreground"
            )} />
          </span>
        </button>
      </div>
      
      <div 
        className={cn(
          "fixed inset-0 bg-white dark:bg-black z-40 flex flex-col pt-24 px-6 transition-transform duration-500 ease-in-out transform md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <button 
          className="absolute top-5 right-5 p-2"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <span className="block w-6 h-0.5 bg-foreground transform rotate-45 translate-y-0.5" />
          <span className="block w-6 h-0.5 bg-foreground transform -rotate-45" />
        </button>
        
        <nav className="flex flex-col space-y-6 text-lg">
          <NavLink 
            to="/" 
            className={({ isActive }) => cn(
              "hover:text-blue-500 transition-colors",
              isActive && "text-blue-500 font-semibold"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink 
            to="/journals" 
            className={({ isActive }) => cn(
              "hover:text-blue-500 transition-colors",
              isActive && "text-blue-500 font-semibold"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            My Journals
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => cn(
              "hover:text-blue-500 transition-colors",
              isActive && "text-blue-500 font-semibold"
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Profile
          </NavLink>
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="justify-start p-0 h-auto text-lg"
          >
            <Sun className="h-5 w-5 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="h-5 w-5 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            Toggle Theme
          </Button>
        </nav>
      </div>
    </header>
  );
};

interface NavLinksProps {
  scrollToSection: (id: string) => void;
  isHomePage: boolean;
  isScrolled: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ scrollToSection, isHomePage, isScrolled }) => (
  <>
    <NavLink 
      to="/" 
      className={({ isActive }) => cn(
        "text-sm font-medium transition-colors",
        isHomePage && !isScrolled 
          ? "text-white hover:text-white/80" 
          : "hover:text-blue-500",
        isActive && !(isHomePage && !isScrolled) && "text-blue-500"
      )}
    >
      Home
    </NavLink>
    <NavLink 
      to="/journals" 
      className={({ isActive }) => cn(
        "text-sm font-medium transition-colors",
        isHomePage && !isScrolled 
          ? "text-white hover:text-white/80" 
          : "hover:text-blue-500",
        isActive && !(isHomePage && !isScrolled) && "text-blue-500"
      )}
    >
      My Journals
    </NavLink>
    <NavLink 
      to="/profile" 
      className={({ isActive }) => cn(
        "text-sm font-medium transition-colors",
        isHomePage && !isScrolled 
          ? "text-white hover:text-white/80" 
          : "hover:text-blue-500",
        isActive && !(isHomePage && !isScrolled) && "text-blue-500"
      )}
    >
      Profile
    </NavLink>
  </>
);

export default Header;
