---
title: "Örnek yazı: Bu sitede bir makale nasıl görünür?"
urlSlug: ornek-yazi-nasil-gorunur
description: Başlıklar, kod blokları, tablolar ve görsellerle bir makalenin okuma penceresinde nasıl göründüğünü gösteren örnek yazı.
publishedAt: 2026-10-06
category: genel
tags:
  - örnek
  - site
cover: /images/blog/ornek-istek-akisi.webp
coverAlt: Tarayıcıdan veritabanına giden bir isteğin dört adımını gösteren örnek şema
published: false
---

> Bu bir **örnek yazıdır**. Kendi ilk yazını yayınladığında bu yazıyı Pages CMS'deki **Makaleler** bölümünden silebilir veya düzenleyebilirsin.

Bu sayfa, yeni bir makalenin sitede nasıl görüneceğini göstermek için hazırlandı. Yazıyı tarayıcıdaki editörde yazıp **Yayında** anahtarını açtığında, birkaç dakika içinde bu pencerenin içinde açılır.

## Okuma penceresi

Uzun yazılar için okuma alanı dar ve rahat tutulur. Pencerenin üst çubuğundaki düğmelerle:

- **Okuma modu** ile pencereyi büyütüp yalnızca metne odaklanabilirsin.
- **Bağlantıyı kopyala** ile yazının adresini paylaşabilirsin.
- Yeşil düğme pencereyi büyütür, sarı düğme küçültür, kırmızı düğme masaüstüne döner.

## Kod blokları

Her kod bloğunun üstünde dil adı ve bir **Kopyala** düğmesi bulunur:

```java
@RestController
@RequestMapping("/api/notlar")
public class NotController {

    private final NotService notService;

    public NotController(NotService notService) {
        this.notService = notService;
    }

    @GetMapping("/{id}")
    public NotDto getir(@PathVariable Long id) {
        return notService.bul(id);
    }
}
```

Terminal komutları da aynı şekilde görünür:

```bash
./mvnw spring-boot:run
curl http://localhost:8080/api/notlar/1
```

## Tablolar

Geniş tablolar telefonda sayfayı taşırmaz; tablo kendi alanında yatay kayar.

| Katman | Görevi | Örnek sınıf | Not |
| --- | --- | --- | --- |
| Controller | İsteği karşılar ve yanıtı döndürür | `NotController` | HTTP ile ilgili kodlar burada kalır |
| Service | İş kurallarını uygular | `NotService` | Asıl mantık burada yazılır |
| Repository | Veritabanıyla konuşur | `NotRepository` | Spring Data arayüzü olabilir |

## Görseller

Görseller ekranı taşırmaz ve açıklayıcı bir alternatif metin taşır:

![Tarayıcı, controller, service ve veritabanı adımlarını sırayla gösteren örnek şema](/images/blog/ornek-istek-akisi.webp)

## Sonuç

Bu örnek yazıyı silmeden önce kendi yazının da aynı şekilde göründüğünü kontrol edebilirsin. Çalışma serilerinde chapter ve part sırası, yazının sonunda **önceki/sonraki** bağlantıları olarak görünür.
