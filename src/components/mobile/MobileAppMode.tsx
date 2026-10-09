import { Check, Download, Maximize2, Minimize2, Monitor, Share2, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Locale } from '../../lib/i18n/locales.ts';
import { subscribeFullscreenState, toggleNativeFullscreen, type FullscreenState } from '../../lib/ui/fullscreen.ts';

/** Standalone is opt-in through the browser; fullscreen requires a user gesture. */
export default function MobileAppMode({ locale }: { locale: Locale }) {
  const [mode, setMode] = useState<FullscreenState>({
    standalone: false, fullscreen: false, available: false, ios: false, desktop: false, displayMode: 'browser',
  });
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const t = locale === 'tr' ? {
    title: 'Uygulama görünümü',
    installed: 'Ana Ekrandan açıldı',
    installedDesktop: 'Uygulama penceresinde açıldı',
    add: 'Ana Ekrana ekle',
    installDesktop: 'Uygulama olarak yükle',
    ios: 'Tarayıcının Paylaş menüsünde “Ana Ekrana Ekle”yi seç. Uygulama olarak aç seçeneği görünüyorsa açık bırak. Ardından eklenen simgeden açtığında site tarayıcı çubukları olmadan çalışır.',
    other: 'Tarayıcı menüsünde “Uygulamayı yükle” veya “Ana ekrana ekle”yi seç. Uygulama simgesinden açtığında site ayrı bir pencerede çalışır.',
    desktop: 'Chrome veya Edge menüsünde “Uygulama olarak yükle”yi, Safari’de Dosya menüsünde “Dock’a Ekle”yi seç. Eklenen simge siteyi kendi uygulama penceresinde açar.',
    fullscreen: 'Tam ekran aç',
    exit: 'Tam ekrandan çık',
    failed: 'Bu tarayıcı tam ekran isteğini kabul etmedi. Ana Ekrana ekleyerek uygulama görünümünü kullanabilirsin.',
    failedDesktop: 'Tarayıcı tam ekran isteğini kabul etmedi. Tarayıcının tam ekran komutunu kullanabilir veya siteyi uygulama olarak yükleyebilirsin.',
  } : {
    title: 'App view',
    installed: 'Opened from the Home Screen',
    installedDesktop: 'Opened in an app window',
    add: 'Add to Home Screen',
    installDesktop: 'Install as an app',
    ios: 'Choose “Add to Home Screen” in your browser’s Share menu. If “Open as Web App” appears, leave it enabled. Open the added icon to use the site without browser bars.',
    other: 'Choose “Install app” or “Add to Home screen” in your browser menu. Launch the app icon to open the site in its own window.',
    desktop: 'Choose “Install as an app” in Chrome or Edge, or “Add to Dock” in Safari’s File menu. Launch the added icon to open the site in its own app window.',
    fullscreen: 'Open fullscreen',
    exit: 'Exit fullscreen',
    failed: 'This browser declined the fullscreen request. Add the site to your Home Screen to use app view.',
    failedDesktop: 'This browser declined the fullscreen request. Use your browser’s fullscreen command or install the site as an app.',
  };

  useEffect(() => subscribeFullscreenState(setMode), []);

  const toggleFullscreen = async () => {
    setFailed(false);
    setPending(true);
    try {
      await toggleNativeFullscreen();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="cc-module cc-mobile-app" aria-label={t.title}>
      <h3>{mode.desktop ? <Monitor aria-hidden="true" /> : <Smartphone aria-hidden="true" />}{t.title}</h3>
      {mode.standalone ? (
        <p className="cc-app-ready"><Check aria-hidden="true" />{mode.desktop ? t.installedDesktop : t.installed}</p>
      ) : (
        <details className="cc-app-install">
          <summary>{mode.desktop ? <Download aria-hidden="true" /> : <Share2 aria-hidden="true" />}{mode.desktop ? t.installDesktop : t.add}</summary>
          <p>{mode.ios ? t.ios : mode.desktop ? t.desktop : t.other}</p>
        </details>
      )}
      {mode.available && (mode.desktop || !mode.standalone || mode.fullscreen) && (
        <button className="cc-app-fullscreen" type="button" onClick={toggleFullscreen} disabled={pending} aria-pressed={mode.fullscreen}>
          {mode.fullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}{mode.fullscreen ? t.exit : t.fullscreen}
        </button>
      )}
      {failed && <p className="cc-note" role="status">{mode.desktop ? t.failedDesktop : t.failed}</p>}
    </section>
  );
}
