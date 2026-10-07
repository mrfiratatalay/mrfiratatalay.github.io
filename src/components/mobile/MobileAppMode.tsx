import { Check, Maximize2, Share2, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Locale } from '../../lib/i18n/locales.ts';

/** Standalone is opt-in through the browser; fullscreen requires a user gesture. */
export default function MobileAppMode({ locale }: { locale: Locale }) {
  const [standalone, setStandalone] = useState(false);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ios, setIos] = useState(false);
  const t = locale === 'tr' ? {
    title: 'Uygulama görünümü',
    installed: 'Ana Ekrandan açıldı',
    add: 'Ana Ekrana ekle',
    ios: 'Tarayıcının Paylaş menüsünde “Ana Ekrana Ekle”yi seç. Ardından eklenen simgeden açtığında site tarayıcı çubukları olmadan çalışır.',
    other: 'Tarayıcı menüsünde “Uygulamayı yükle” veya “Ana ekrana ekle”yi seç. Uygulama simgesinden açtığında site ayrı bir pencerede çalışır.',
    fullscreen: 'Tam ekran aç',
    exit: 'Tam ekrandan çık',
    failed: 'Bu tarayıcı tam ekran isteğini kabul etmedi. Ana Ekrana ekleyerek uygulama görünümünü kullanabilirsin.',
  } : {
    title: 'App view',
    installed: 'Opened from the Home Screen',
    add: 'Add to Home Screen',
    ios: 'Choose “Add to Home Screen” in your browser’s Share menu. Open the added icon to use the site without browser bars.',
    other: 'Choose “Install app” or “Add to Home screen” in your browser menu. Launch the app icon to open the site in its own window.',
    fullscreen: 'Open fullscreen',
    exit: 'Exit fullscreen',
    failed: 'This browser declined the fullscreen request. Add the site to your Home Screen to use app view.',
  };

  useEffect(() => {
    const mode = window.matchMedia('(display-mode: standalone)');
    const sync = () => setStandalone(mode.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const syncFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    sync();
    syncFullscreen();
    setFullscreenAvailable(Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen));
    setIos(/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    mode.addEventListener('change', sync);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => {
      mode.removeEventListener('change', sync);
      document.removeEventListener('fullscreenchange', syncFullscreen);
    };
  }, []);

  const toggleFullscreen = async () => {
    setFailed(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setFailed(true);
    }
  };

  return (
    <section className="cc-module cc-mobile-app" aria-label={t.title}>
      <h3><Smartphone aria-hidden="true" />{t.title}</h3>
      {standalone ? (
        <p className="cc-app-ready"><Check aria-hidden="true" />{t.installed}</p>
      ) : (
        <details className="cc-app-install">
          <summary><Share2 aria-hidden="true" />{t.add}</summary>
          <p>{ios ? t.ios : t.other}</p>
        </details>
      )}
      {fullscreenAvailable && !standalone && (
        <button className="cc-app-fullscreen" type="button" onClick={toggleFullscreen} aria-pressed={fullscreen}>
          <Maximize2 aria-hidden="true" />{fullscreen ? t.exit : t.fullscreen}
        </button>
      )}
      {failed && <p className="cc-note" role="status">{t.failed}</p>}
    </section>
  );
}
