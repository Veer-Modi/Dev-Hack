import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => changeLanguage(i18n.language === 'en' ? 'hi' : 'en')}
        className="gap-2 px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        <Languages className="h-4 w-4" />
        {i18n.language === 'en' ? 'EN' : 'HI'}
      </Button>
    </div>
  );
};

export default LanguageSwitcher;