# Study With Me · Web ve App Store Connect

Study With Me, portfolyonun GitHub Pages sitesinde kendi ürün sayfasıyla yer alır.
Portfolyonun **Uygulamalarım / My Apps** klasörü iki dilde aynı uygulama listesini
kullanır. Yeni bir uygulama eklemek için `src/lib/site/apps.ts` dosyasına bir kayıt,
uygulamanın sayfasını da kendi adresine ekle.

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
