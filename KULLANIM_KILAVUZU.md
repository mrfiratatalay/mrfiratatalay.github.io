# Kullanım kılavuzu

Siten: **https://mrfiratatalay.github.io/**

Yazı ve not eklemek için kod yazman gerekmez. Her şeyi tarayıcıdaki **Pages CMS** editöründen yaparsın. Kaydettiğin her değişiklik GitHub'daki site deposuna gider; birkaç dakika içinde site kendini yeniden hazırlayıp yayınlar.

> Bu kılavuz ilk sürüm için yazıldı. Pages CMS ekranındaki düğme adları zamanla değişebilir; aşağıdaki adımlar 6 Ekim 2026'daki resmî dokümana göre hazırlandı.

## 0. İlk kurulum (bir kez)

1. https://app.pagescms.org adresini aç.
2. **GitHub ile giriş yap** (Sign in with GitHub).
3. Pages CMS GitHub uygulamasını kurman istenir. Erişimi **yalnızca `mrfiratatalay.github.io` deposuna** ver; bütün depolara değil.
4. Depo listesinden `mrfiratatalay/mrfiratatalay.github.io` deposunu ve `main` dalını seç.
5. Sol menüde şu bölümleri görürsün: **Makaleler, Öğrenme Notları, Projeler, Profil ve İletişim, Çalışma Serileri**.

Parolanı kimseyle paylaşma; giriş her zaman kendi GitHub hesabından yapılır.

## 1. Yeni makale nasıl eklenir?

1. **Makaleler** bölümünü aç, **Yeni / Add** düğmesine bas.
2. Alanları doldur (bir sonraki başlığa bak).
3. Yazını **Yazının içeriği** alanına yaz.
4. Hazırsan **Yayında** anahtarını aç ve **Kaydet**.
5. 2–4 dakika sonra yazın şu adreste açılır: `https://mrfiratatalay.github.io/blog/YAZI-ADRESI/`

## 2. Alanlara ne yazılır?

| Alan | Örnek | Not |
| --- | --- | --- |
| Başlık | Spring Boot'ta Controller Nasıl Çalışır? | İstediğin zaman değiştirebilirsin. |
| Yazı adresi | `spring-boot-controller` | Küçük harf, rakam ve tire. Yayınladıktan sonra **değiştirme**; eski bağlantılar bozulur. |
| Kısa açıklama | Bir isteğin controller'a nasıl ulaştığını örneklerle anlatıyorum. | Listelerde, aramada ve Google'da görünür. |
| Yayın tarihi | 2026-10-06 | Editör bugünü önerir. |
| Kategori | Spring Boot | Listeden seç. |
| Etiketler | java, controller | İsteğe bağlı. |
| Kapak görseli + açıklaması | Bir isteğin yolculuğunu gösteren şema | Görsel eklersen açıklama zorunlu. |

Yayında bir yazıda kısa açıklama, tarih, kategori veya metin eksikse site **yayınlanmaz**; önceki sürüm açık kalır ve Actions sayfasında hangi alanın eksik olduğu yazar.

## 3. Görsel ve kod bloğu nasıl eklenir?

- **Görsel:** Editörün araç çubuğundaki görsel düğmesiyle yükle. Görseller `public/images/blog/` klasörüne kaydedilir. Büyük fotoğrafları yüklemeden önce küçült (genişlik ~1600 px yeter).
- **Kod bloğu:** Editörde kaynak (Markdown) moduna geç ve şöyle yaz:

  ````markdown
  ```java
  @GetMapping("/merhaba")
  public String merhaba() { return "Merhaba"; }
  ```
  ````

  Sitede kodun üstünde dil adı ("Java") ve **Kopyala** düğmesi görünür. Dil yazmazsan "Kod" yazar.
- **Tablo:** Kaynak modunda Markdown tablosu yazabilirsin; telefonda tablo kendi içinde kayar.

## 4. Taslak nasıl kaydedilir, yayına nasıl açılır?

- **Yayında** kapalıyken kaydedersen yazı **taslak** olur. Taslak için sayfa oluşmaz; blog listesine, aramaya, RSS'e ve site haritasına girmez. Taslakta açıklama ve tarih boş kalabilir.
- Yayına almak için yazıyı aç, **Yayında**'yı aç, **Kaydet**.

**Önemli:** Site deposu herkese açık. Taslak dosyası GitHub'da ve geçmişte görülebilir. "Blogda görünmüyor" ile "kimse göremez" aynı şey değildir. Gerçekten gizli kalması gereken metni yayınlayana kadar kendi bilgisayarında tut.

## 5. Yayınlanmış yazı nasıl düzenlenir?

Makaleler bölümünde yazıyı bul, değiştir, kaydet. Başlığı değiştirmek adresi değiştirmez. Adresi gerçekten değiştirmen gerekirse önce bana sor; GitHub Pages'te eski adresi otomatik yönlendirme yoktur.

Önemli bir güncelleme yaptıysan **Son düzenleme tarihi** alanını doldurabilirsin.

## 6. Yeni öğrenme notu nasıl eklenir?

**Öğrenme Notları** bölümünde **Yeni** de. Alanlar makaleye benzer. Not adresi `java-interface` ise not şurada açılır: `/notlar/yerel/java-interface/`. Yeni bir konu için yeni bir depo açmana gerek yok.

## 7. Proje ve profil nasıl düzenlenir?

- **Projeler:** Ad, kısa açıklama, teknolojiler, GitHub bağlantısı, varsa demo ve video. Gerçek bir ekran görüntüsü yüklersen kartta o görünür; yoksa projenin baş harfleri görünür. Demo yoksa demo alanını boş bırak; sitede çalışmayan düğme gösterilmez.
- **Profil ve İletişim:** Ad, unvan, tanıtım metni, e-posta, fotoğraf, deneyim, eğitim, yetenekler ve bağlantılar.
- **CV:** Yalnızca herkese açık paylaşmak istediğin bilgileri içeren bir PDF yükle. (Eski CV'nde referans kişinin telefon numarası olduğu için siteye konmadı.)

## 8. Eski notlar ne zaman güncellenir?

Bağlı not repolarındaki notlar site her hazırlandığında yeniden alınır:

- Site deposuna bir değişiklik geldiğinde (editörden kaydettiğinde),
- Her gün Türkiye saatiyle yaklaşık **06:17**'de (GitHub yoğunlukta geciktirebilir),
- Elle başlattığında (bir sonraki başlık).

Not reposuna yaptığın değişiklik siteye anında değil, bu üç yoldan birinde gelir.

**Şu anki durum:** `java-spring` reposu özel (private) olduğu için bağlantısı hazır ama **kapalı** (`config/note-sources.json` → `"enabled": false`). Açmak için iki yol var:
1. Notların olduğu repoyu herkese açık yapmak (repodaki her şey görünür olur), ya da
2. Yalnızca yayınlamak istediğin notları ayrı, herkese açık bir not reposuna taşımak (önerilir).

Hangisini seçtiğini söylemen yeterli; ayarı birlikte açarız.

## 9. Elle güncelleme nasıl çalıştırılır?

1. https://github.com/mrfiratatalay/mrfiratatalay.github.io/actions adresini aç.
2. Soldan **Kisisel siteyi hazirla ve yayinla** işini seç.
3. **Run workflow** → **Run workflow** düğmesine bas.
4. Yeşil tik çıkınca site güncellenmiştir.

Not: Depoda 60 gün hiç hareket olmazsa GitHub günlük işi duraklatabilir. Aynı sayfada çıkan **Enable workflow** düğmesiyle tekrar açarsın.

## 10. Yayınlama başarısız olursa?

Site hazırlanırken bir hata olursa **son başarılı sürüm açık kalır**, site boşalmaz.

1. Actions sayfasında kırmızı çarpılı işlemi aç.
2. **Icerikleri ve siteyi hazirla** adımındaki hata metnini oku. Genelde Türkçe ve neyin eksik olduğunu söyler. Örnek: `src/content/blog/x.md: Yayında ama kısa açıklama eksik.`
3. Editörden düzeltip tekrar kaydet. Çözemezsen hata metnini kopyalayıp bana gönder.

## Çalışma serisi eklemek

**Çalışma Serileri** bölümünde bir seri oluştur, chapter ekle, her part'a içeriğin site adresini yaz (ör. `/blog/spring-boot-controller/` veya `/notlar/yerel/java-interface/`). Seri, yazıları kopyalamaz; mevcut sayfalara sırayla bağlantı verir. Yazıların sonunda **önceki/sonraki part** bağlantıları otomatik görünür.

## Örnek içerikler

Sitede örnek olarak bir makale ("Örnek yazı: …"), bir not ("Örnek not: Java'da interface") ve bir seri var. Kendi içeriğini ekledikten sonra bunları editörden silebilirsin. Eski portfolyondan alınan bio, deneyim ve projeleri de kontrol edip güncelle. Bunlar 2024 tarihli eski sitenden çevrildi ve bazıları güncel olmayabilir.

## Google'da görünmek (isteğe bağlı)

1. https://search.google.com/search-console adresinde **URL öneki** (URL-prefix) mülkü olarak `https://mrfiratatalay.github.io/` ekle.
2. Doğrulama yöntemi olarak **HTML etiketi**ni seç. Etiketteki `content="..."` değerini editörde **Profil ve İletişim → Google Search Console doğrulama kodu** alanına yapıştır ve kaydet.
3. Site yayınlanınca Search Console'da **Doğrula**'ya bas ve `sitemap-index.xml` site haritasını gönder.

Google'da görünme garanti değildir; zamanla ve içerik kalitesiyle gelir.

## Kendi bilgisayarında önizleme (isteğe bağlı)

```bash
npm install
npm run build:ornek   # örnek notlarla siteyi hazırla
npm run preview       # http://localhost:4321
```
