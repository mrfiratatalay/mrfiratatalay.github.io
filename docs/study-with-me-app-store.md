# Study With Me · Web ve App Store Connect

Study With Me, portfolyonun GitHub Pages sitesinde kendi ürün sayfasıyla yer alır.
Portfolyonun **Uygulamalarım / My Apps** klasörü iki dilde aynı uygulama listesini
kullanır. Yeni bir uygulama eklemek için `src/lib/site/apps.ts` dosyasına bir kayıt,
uygulamanın sayfasını da kendi adresine ekle.

## Ürün sayfası nasıl kurulu

Sayfanın kodu `src/components/study-with-me/` içindedir. Sayfa uygulamanın kendisi gibi
davranır: tepesi odadır, ışığı ziyaretçinin saatine göre gündüz, akşam ya da gecedir
(köşedeki güneşe dokununca değişir) ve arkadaş, uygulamadaki kendi cümleleriyle konuşur.
Yazıların hepsi `landing-copy.ts` dosyasındadır; uygulamada bir ad ya da cümle değişirse
orada da değişmelidir.

Destek ve gizlilik sayfaları (`src/views/studywithme/HelpView.astro`, on iki dil) aynı
renkleri, yazıyı ve ışığı kullanır: uygulamadaki gibi defterin sayfalarıdır, meşe masanın
üstünde açık dururlar ve üstlerinde defterin sekmeleri vardır. Yazıları
`src/data/studywithme/` altındadır; görünüş değişirken o yazılara dokunulmaz.

Uygulamayı gösteren her görüntü gerçek bir ekran görüntüsünden kesilir, elle çizilmez:

| Ne | Nasıl üretilir |
| --- | --- |
| Oda, oturum adımları, görünümler, saatler, pencereler, defter, cihazlar, paylaşım görseli | `node scripts/tasarim/tao-gorselleri.mjs` |
| Köşedeki güneş ve ay, kalem, sayfanın sonundaki arkadaş ve gözleri | `python3 scripts/tasarim/tao-ikon-parcalari.py` (kullanımı dosyanın başında) |

İkisi de uygulamanın ekran görüntüsü arşivini okur (`~/Desktop/Developer/My-Apps/01/screenshot`;
başka yerdeyse `--kaynak`). Arşiv bu depoda olmadığı için üretilen görseller
`public/studywithme/images/` altında depoya eklenir. İlk betik ayrıca duvar ve zemin
renklerini ölçüp `room-measures.json` dosyasına yazar; sayfa odayı ekranın kenarına kadar
bu renklerle uzatır, o yüzden görseller yenilenince bu dosya da onlarla birlikte yenilenir.

Dükkandan kaldırılan pencereler ve eşyalar sayfada görünmemelidir. Hangi karenin
kullanıldığı ve neden o karenin seçildiği betiğin içinde yazılıdır.

Yazı tipi uygulamadaki Shantell Sans'tır (lisansı `public/studywithme/fonts/OFL.txt`).
Ürün sayfası da destek ve gizlilik sayfaları da aynı iki küçük dosyayı kullanır; bunlar
asıl dosyalardan (arşivde `MAC/00-kaynaklar/shantellsans-*.ttf`) yalnızca Latin harfleri
ve sayfada geçen işaretler bırakılarak üretildi:

```sh
pyftsubset shantellsans-semibold.ttf --flavor=woff2 --layout-features='*' --no-hinting --desubroutinize \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0100-017F,U+2010-2015,U+2018-201E,U+2022,U+2026,U+2032-2033,U+2190-2193,U+2196-2199,U+2212,U+2713,U+25A0,U+25B6,U+23F8" \
  --output-file=public/studywithme/fonts/shantellsans-semibold.woff2
```

(`regular` için aynısı.) Sayfaya bu aralıkların dışında bir harf eklenirse, örneğin Kiril
bir dil, dosyalar o aralıkla yeniden üretilmelidir; yoksa o harfler sistem yazı tipiyle çıkar.
Japonca, Korece, Çince ve Arapça başlıklar zaten sistem yazı tipiyle yazılır: Shantell Sans'ta
o harfler yoktur.

## App Store Connect adresleri

| Alan | Türkçe | İngilizce |
| --- | --- | --- |
| Marketing URL | [Ürün sayfası](https://mrfiratatalay.github.io/studywithme/) | [Product page](https://mrfiratatalay.github.io/studywithme/en/) |
| Support URL | [Destek](https://mrfiratatalay.github.io/studywithme/support/) | [Support](https://mrfiratatalay.github.io/studywithme/en/support/) |
| Privacy Policy URL | [Gizlilik politikası](https://mrfiratatalay.github.io/studywithme/privacy/) | [Privacy policy](https://mrfiratatalay.github.io/studywithme/en/privacy/) |

Destek ve gizlilik için uygulamanın on iki dili vardır. Türkçe dışındaki diller
`/studywithme/<dil>/support/` ve `/studywithme/<dil>/privacy/` adreslerini kullanır.
Dil kodları `en`, `de`, `fr`, `es`, `it`, `pt-BR`, `ja`, `ko`, `zh-Hans`,
`zh-Hant` ve `ar`. Aynı dilin farklı mağaza bölgeleri aynı adrese bağlanabilir.

## Başvuruya hazırlık

1. GitHub Pages yayınından sonra yukarıdaki adresleri oturum açmadan aç. Türkçe ve
   İngilizce ürün sayfasının doğru uygulamayı gösterdiğini, destek e-postasının
   çalıştığını ve gizlilik sayfalarının doğrudan açıldığını kontrol et.
2. App Store Connect’te sürümün **Support URL** alanına destek sayfasını,
   **Marketing URL** alanına ürün sayfasını koy. **App Privacy** bölümünde
   herkese açık **Privacy Policy URL** alanını ve veri beyanını doldur.
3. Gönderilecek iPhone, iPad ve Mac sürümlerinde **Ayarlar → Hakkında → Gizlilik
   politikası** bağlantısının açıldığını kontrol et. Uygulamanın gizlilik özeti
   veya veri kullanımı değişirse uygulama deposundaki özetle bu sitenin
   politikası birlikte güncellenir.
4. App Review notlarında **Defter → Stüdyo** üzerinden örnek bir ücretli öğeye ve
   satın alımları geri yükleme düğmesine nasıl ulaşılacağını yaz. İlk
   non-consumable ürünü uygulamanın ilk sürümüyle birlikte gönder. İlk gün
   satılacak ürünlerin her biri kendi fiyat, satış bölgesi ve ürünü gösteren
   inceleme görseliyle Connect’te hazırlanır.
5. Study With Me'nin mağaza sayfası yayımlandığında, ürün sayfasındaki
   yayın bilgisi yerine doğrulanmış App Store ürün bağlantısını ekle. Rozet
   kullanılacaksa Apple’ın ilgili dil için sağladığı görseli kullan.

Apple, destek adresinin gerçek iletişim bilgisine ulaşmasını ve gizlilik
politikasının hem Connect’te hem uygulama içinde erişilebilir olmasını ister.
Marketing URL ve mağaza videosu isteğe bağlıdır.

- [App Store Connect sürüm alanları](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)
- [App Privacy ve politika adresleri](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy)
- [App Review 5.1.1 · Gizlilik politikası](https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage)
- [Uygulama içi satın alma gönderimi](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase)
- [App Store bağlantısı ve rozetleri](https://developer.apple.com/app-store/marketing/guidelines/)
