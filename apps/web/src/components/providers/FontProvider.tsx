'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Font = 'inter' | 'garamond' | 'mono' | 'roboto' | 'poppins' | 'playfair' | 'system';

interface FontContextType {
  font: Font;
  setFont: (font: Font) => void;
  previewFont: Font;
  setPreviewFont: (font: Font) => void;
  saveFont: () => void;
  resetPreview: () => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

const FONT_STORAGE_KEY = 'app-font';

const fontClassMap: Record<Font, string> = {
  inter: 'font-inter',
  garamond: 'font-garamond',
  mono: 'font-space-mono',
  roboto: 'font-roboto',
  poppins: 'font-poppins',
  playfair: 'font-playfair',
  system: 'font-sans', // Tailwind's default system font
};

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = useState<Font>('system');
  const [previewFont, setPreviewFont] = useState<Font>('system');

  // Load saved font on mount
  useEffect(() => {
    const savedFont = localStorage.getItem(FONT_STORAGE_KEY) as Font | null;
    if (savedFont && ['inter', 'garamond', 'mono', 'roboto', 'poppins', 'playfair', 'system'].includes(savedFont)) {
      setFontState(savedFont);
      setPreviewFont(savedFont);
    } else {
      // If no saved font, set system as default and save it
      localStorage.setItem(FONT_STORAGE_KEY, 'system');
    }
  }, []);

  // Apply saved font to document body (NOT preview font)
  useEffect(() => {
    const body = document.body;
    
    // Remove all font classes from body
    Object.values(fontClassMap).forEach(className => {
      body.classList.remove(className);
    });
    
    // Add the saved font class (not preview) to body
    body.classList.add(fontClassMap[font]);
  }, [font]);

  const setFont = (newFont: Font) => {
    setFontState(newFont);
    setPreviewFont(newFont);
    localStorage.setItem(FONT_STORAGE_KEY, newFont);
  };

  const saveFont = () => {
    setFont(previewFont);
  };

  const resetPreview = () => {
    setPreviewFont(font);
  };

  return (
    <FontContext.Provider 
      value={{ 
        font, 
        setFont, 
        previewFont, 
        setPreviewFont,
        saveFont,
        resetPreview
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
}
