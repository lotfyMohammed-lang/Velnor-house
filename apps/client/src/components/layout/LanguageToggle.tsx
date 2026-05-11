import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="h-11 w-11 rounded-full border border-zinc-200 bg-background shadow-sm hover:bg-accent dark:border-zinc-800"
      title={i18n.language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <div className="flex items-center gap-1">
        <Languages className="size-5 text-zinc-700 dark:text-zinc-300" />
        <span className="text-[10px] font-bold uppercase">
          {i18n.language === 'en' ? 'AR' : 'EN'}
        </span>
      </div>
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
