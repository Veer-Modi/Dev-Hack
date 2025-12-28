import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AccessibilityContextType = {
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'larger';
  voiceInputEnabled: boolean;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleVoiceInput: () => void;
  setFontSize: (size: 'normal' | 'large' | 'larger') => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('accessibility_highContrast');
    const savedFontSize = localStorage.getItem('accessibility_fontSize');
    
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedFontSize && ['normal', 'large', 'larger'].includes(savedFontSize)) {
      setFontSize(savedFontSize as 'normal' | 'large' | 'larger');
    }
  }, []);

  // Apply high contrast class to body
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility_highContrast', highContrast.toString());
  }, [highContrast]);

  // Apply font size class to body
  useEffect(() => {
    document.body.classList.remove('font-size-normal', 'font-size-large', 'font-size-larger');
    document.body.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('accessibility_fontSize', fontSize);
  }, [fontSize]);

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const increaseFontSize = () => {
    setFontSize(prev => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'larger';
      return 'larger';
    });
  };

  const decreaseFontSize = () => {
    setFontSize(prev => {
      if (prev === 'larger') return 'large';
      if (prev === 'large') return 'normal';
      return 'normal';
    });
  };

  const setFontSizeHandler = (size: 'normal' | 'large' | 'larger') => {
    setFontSize(size);
  };

  const toggleVoiceInput = () => {
    setVoiceInputEnabled(prev => !prev);
  };

  const value = {
    highContrast,
    fontSize,
    voiceInputEnabled,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    toggleVoiceInput,
    setFontSize: setFontSizeHandler,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};