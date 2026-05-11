import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getContactSettings } from '@/api/settings.api';

export function WhatsAppButton() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  const { data: settings, isLoading, isError, isFetching } = useQuery({
    queryKey: ['contact-settings'],
    queryFn: getContactSettings,
    staleTime: 0, // Ensure we check for fresh settings on every mount/refresh
    retry: 1,
  });

  // CRITICAL: Do not render anything while loading for the first time
  // Also hide if there is an error, if settings are missing, or if not explicitly enabled
  if (isLoading || isError || !settings || settings.whatsappEnabled !== true) {
    return null;
  }

  // If we are re-fetching but have old settings where it was disabled, we still want to respect that.
  // The check above (settings.whatsappEnabled === false) already handles this if settings exists.

  const phoneNumber = settings.whatsappNumber;
  const message = encodeURIComponent(settings.whatsappDefaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  
  const labelText = isRtl ? settings.whatsappLabelAr : settings.whatsappLabelEn;
  
  // Decide actual screen side based on setting
  const isOnRight = settings.whatsappPosition === 'right';

  return (
    <div 
      className={cn(
        "fixed bottom-8 z-50 flex items-center group transition-all duration-500",
        isOnRight ? "right-8 flex-row-reverse" : "left-8 flex-row"
      )}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#25D366] to-[#128C7E] text-white shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group-hover:shadow-[#25D366]/25",
          "border border-white/20 ring-4 ring-transparent group-hover:ring-[#25D366]/10"
        )}
        aria-label="Contact us on WhatsApp"
      >
        {/* WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="currentColor"
          className="drop-shadow-md"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.05-.148-.471-1.138-.646-1.537-.17-.413-.344-.35-.472-.357-.122-.007-.263-.009-.404-.009-.14 0-.37.053-.564.251-.194.198-.74.723-.74 1.762 0 1.039.75 2.042.855 2.189.104.148 1.477 2.254 3.578 3.16.5.216.89.345 1.194.442.502.16 0.957.137 1.317.084.402-.058 1.255-.513 1.431-1.008.176-.495.176-.918.123-1.008-.053-.09-.198-.149-.496-.298zM12 2.045c-5.492 0-9.955 4.463-9.955 9.955 0 1.75.457 3.454 1.328 4.96L2.045 22l5.19-.136a9.92 9.92 0 004.765 1.214c5.492 0 9.955-4.463 9.955-9.955 0-5.492-4.463-9.955-9.955-9.955zM12 20.315c-1.558 0-3.076-.418-4.406-1.21l-.316-.188-3.272.086 1.01-3.19-.206-.328c-.838-1.332-1.28-2.877-1.28-4.466a8.21 8.21 0 1116.42 0 8.21 8.21 0 01-8.226 8.21z" />
        </svg>

        {/* Pulse Background Animation */}
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/20 group-hover:hidden" />
      </a>

      {/* Elegant Hover Label */}
      <div 
        className={cn(
          "max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-500 ease-out group-hover:max-w-xs group-hover:opacity-100",
          isOnRight ? "mr-4" : "ml-4"
        )}
      >
        <div className="rounded-2xl border border-zinc-200 bg-white/90 px-4 py-2 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
          <span className="text-sm font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
            {labelText}
          </span>
        </div>
      </div>
    </div>
  );
}
