---
title: ZekAI
urlSlug: zekai
tagline:
  tr: Alıcıya ve satıcıya yapay zekâyla destek veren e-ticaret karar platformu
  en: An AI decision platform for both sides of e-commerce
context:
  tr: HackAthon'26 — BTK Akademi × Google × Girişimcilik Vakfı
  en: HackAthon'26 — BTK Akademi × Google × Girişimcilik Vakfı
summary:
  tr: "HackAthon'26'da iki kişilik takımımızla altı günde geliştirdiğimiz bir e-ticaret karar platformu. Alıcı bir ürün linkini yapıştırıp ihtiyacını kendi cümleleriyle yazıyor; ZekAI ürünü, yorumları ve fiyatı birlikte değerlendirip gerekçeli bir karar veriyor. Satıcı ise ürün sayfasını beş farklı müşteri profiline gezdiriyor, içeriğini, paketlerini ve yorum cevaplarını yapay zekâyla iyileştiriyor. Arkada iki ASP.NET Core API'si, Gemini ile çalışan bir FastAPI servisi ve PostgreSQL var. Canlı demoda alıcı ya da satıcı olarak tek tıkla girip bütün modülleri deneyebilirsiniz."
  en: "An e-commerce decision platform my two-person team built in six days at HackAthon'26. A buyer pastes a product link and describes their need in their own words; ZekAI weighs the product, the reviews and the price together and gives a reasoned verdict. A seller has five different customer profiles walk through a product page and improves its content, bundles and review replies with AI. Behind it are two ASP.NET Core APIs, a FastAPI service running on Gemini and PostgreSQL. In the live demo you can sign in as a buyer or a seller with one click and try every module."
highlights:
  tr:
    - "Bir entegrasyonu göstermek için entegre olunacak bir mağaza gerekiyordu; ilk prototipte mağaza ZekAI'ın içinde sahte bir veri katmanıydı. Onu kendi veritabanı ve kimlik sistemi olan ayrı bir ürüne, Akıllı Market'e ayırdım. ZekAI pazar yerine veritabanından değil, satıcının verdiği API anahtarıyla API'sinden bağlanıyor; bu ayrım anahtarın nasıl verileceği ve iki tarafın nasıl tutarlı kalacağı gibi gerçek entegrasyon sorularını erkenden sordurdu."
    - "Pazar yerinin API'sini iki tür istemci aynı Authorization başlığıyla çağırıyor: kendi arayüzü kullanıcı JWT'siyle, ZekAI satıcının API anahtarıyla. Küçük bir policy scheme token'ın biçimine bakıp isteği doğru doğrulayıcıya yönlendiriyor; satıcı controller'ları iki yolu ayırt etmek zorunda kalmıyor."
    - "Satın alma kararını modele bırakmadım. Gemini yalnızca dört skor ve kanıtlı uyarılar üretiyor; Alabilirsin, Dikkatli İlerle ya da Alternatife Bak kararını açık eşiklerle çalışan saf bir fonksiyon veriyor. Aynı skorlar her zaman aynı kararı veriyor ve ekrandaki “Neden bu sonuç?” listesi, kararı doğuran kuralın kendisi."
    - "Alıcı analizinin ilk sürümü Google ADK ile kurulmuş yedi ajanlı bir hattı; her analiz yedi çağrının maliyetini ve gecikmesini taşıyordu. Yarışmanın son günü hattı tek bir yapılandırılmış çağrıya ve yalnızca gerektiğinde Google Arama ile yapılan bir piyasa kontrolüne indirdim; kombin analizi de beş çağrıdan bire indi."
    - "Aynı soruya iki kez para ödememek için her pahalı çıktıyı girdisinin SHA-256 özetiyle saklıyorum. Analiz anahtarında ürünün parmak izi (fiyat, stok, başlık, puan, yorum sayısı) var; ürün değişince anahtar da değişiyor, önbelleği temizleyen ayrı bir kod gerekmiyor."
    - "Gemini kotası dolduğunda satıcı araçları işaretli bir örnek cevap ve sarı bir uyarı gösteriyor; alıcı analizi ise uydurma bir “Alabilirsin” yerine açık bir hatayla bitiyor. Bir satıcının örnek bir başlık görmesi zararsız, bir alıcının uydurulmuş bir karar görmesi değil."
    - "Uzun AI cevaplarını Server-Sent Events ile adım adım gösteriyorum. ZekAI'ın API'si akışı satır satır tarayıcıya aktarırken son raporu yakalayıp önbelleğe yazıyor; tarayıcı AI servisini ve Gemini anahtarını hiç görmüyor."
    - "Paket indirimini iki ürüne fiyatlarıyla orantılı paylaştırıyorum; her sipariş satırı kendi indirimini taşıdığı için iade ve raporlama satır bazında doğru kalıyor. Bir ürün çiftine tek aktif paket kuralını, arşivlenmiş paketleri hariç tutan kısmi bir unique index ile veritabanında da koruyorum."
    - "Yarışmadan altı ay sonra ücretsiz katmandaki servisler uyumuştu ve canlı sitede kimse giriş yapamıyordu. İki arayüzün bütün ağ çağrılarını tek bir fonksiyona topladım ve Vercel derlemesinde onu aynı sözleşmeyi tarayıcıda karşılayan bir demo katmanına bağladım; kurallar üretim kodunun portu, veri seed'den üretilmiş katalog. Bütün kararları gerekçeleri, bedelleri ve bilinen eksikleriyle repodaki docs klasöründe iki dilde anlattım."
  en:
    - "To show an integration we needed a store to integrate with; in the first prototype the store was a fake data layer inside ZekAI. I split it into a separate product with its own database and identity system, Akıllı Market. ZekAI reaches the marketplace through its API, not its database, using an API key the seller provides, and that split made us face real integration questions early: how a key is issued and how both sides stay consistent."
    - "Two kinds of clients call the marketplace API with the same Authorization header: its own frontend with a user JWT and ZekAI with the seller's API key. A small policy scheme looks at the token's shape and routes the request to the right handler, so the seller controllers never have to tell the two paths apart."
    - "I did not leave the purchase decision to the model. Gemini only produces four scores and evidence-backed warnings; the go ahead, proceed with care or look for an alternative verdict comes from a pure function with explicit thresholds. The same scores always give the same verdict, and the “why this result?” list on screen is the rule that produced it."
    - "The first version of the buyer analysis was a seven-agent pipeline built with Google ADK, so every analysis carried the cost and latency of seven calls. On the last day of the competition I cut it down to one structured call plus a Google Search market check that runs only when needed; the kombin analysis went from five calls to one."
    - "To never pay twice for the same question, I store every expensive output with the SHA-256 hash of its input. The analysis key includes the product's fingerprint (price, stock, title, rating, review count); when the product changes, so does the key, and no cache-clearing code is needed."
    - "When the Gemini quota runs out, the seller tools show a flagged sample answer with a yellow warning, while the buyer analysis ends with a clear error instead of a made-up “go ahead”. A seller seeing a sample title does no harm; a buyer seeing an invented verdict does."
    - "Long AI answers arrive step by step over Server-Sent Events. ZekAI's API relays the stream to the browser line by line while catching the final report for the cache; the browser never sees the AI service or the Gemini key."
    - "A bundle discount is split between the two products in proportion to their prices, and because every order line carries its own discount, refunds and reporting stay correct per line. The one-active-bundle-per-pair rule is also enforced in the database with a partial unique index that ignores archived bundles."
    - "Six months after the competition the free-tier services had gone to sleep and nobody could sign in on the live site. I gathered every network call of both frontends into one function and, in the Vercel build, connected it to a demo layer that fulfils the same contract in the browser; the rules are ports of the production code and the data is a catalogue generated from the seed. I documented every decision with its reasons, trade-offs and known gaps in the repository's docs folder, in Turkish and English."
problem:
  tr: "E-ticaretin iki tarafında da aynı soru var: bu ürün gerçekten işe yarar mı? Alıcı, ürünün ihtiyacına uyup uymadığını, fiyatın makul olup olmadığını ve yorumların ne dediğini tek tek okuyamıyor; sonuç pişmanlık ve iade. Satıcı ise ziyaretçinin neden satın almadan çıktığını bilmiyor: başlık mı eksik, fiyat mı yüksek, yorumlara cevap mı verilmemiş?"
  en: "Both sides of e-commerce ask the same question: will this product actually work? A buyer cannot check, one by one, whether a product fits their need, whether the price is fair and what the reviews really say; the result is regret and returns. A seller does not know why visitors leave without buying: is the title weak, the price too high, or are reviews left unanswered?"
benefit:
  tr: "Alıcı bir link ve birkaç cümleyle gerekçeli bir karar alıyor; her uyarı kaynağı olan yorumu gösteriyor. Kaydettiği ürünleri ihtiyacına göre karşılaştırabiliyor, birlikte alacaklarını bütçesiyle tartabiliyor. Satıcı ise ürün sayfasının hangi müşteriyi neden kaybettiğini görüyor; içeriğini, görsellerini, paketlerini ve yorum cevaplarını tek yerden iyileştiriyor."
  en: "With a link and a few sentences, a buyer gets a reasoned verdict, and every warning points to the review it came from. They can compare saved products against their need and weigh items bought together against a budget. A seller sees which customers a product page loses and why, and improves its content, images, bundles and review replies in one place."
role:
  tr: "HackAthon'26'da takım arkadaşım Ayşe Mandıralı ile iki kişilik bir takımdık; takım kaptanı bendim. Sistemi iki ürüne ve üç servise ayırdım, alıcı tarafını ve Seller Studio'nun yapay zekâ akışlarını yazdım, Gemini maliyetini düşürdüm, yayını kurdum ve Ayşe'nin pull request'lerini inceleyip birleştirdim. Yarışmadan sonra canlı demoyu tarayıcıya taşıdım ve dokümanları yazdım. Kodun önemli bir kısmını yapay zekâyla (Claude Code) birlikte, kendi koyduğum kurallar altında yazdım."
  en: "At HackAthon'26 my teammate Ayşe Mandıralı and I were a two-person team, and I was the team captain. I split the system into two products and three services, wrote the buyer side and Seller Studio's AI flows, cut the Gemini costs, set up the deployment, and reviewed and merged Ayşe's pull requests. After the competition I moved the live demo into the browser and wrote the documentation. I wrote a significant part of the code with an AI assistant (Claude Code), under rules I set."
technologies:
  - Next.js 16
  - React 19
  - TypeScript
  - ASP.NET Core 10
  - Entity Framework Core
  - PostgreSQL 16
  - Python 3.12
  - FastAPI
  - Google Gemini
  - Server-Sent Events
  - Docker
icon: sparkles
color: green
cover: /images/projects/zekai/kapak.webp
coverAlt:
  tr: "ZekAI: bilgisayarda müşteri simülasyonu, telefonda bir ürün analizinin kararı"
  en: "ZekAI: the customer simulation on the desktop and a product analysis verdict on a phone"
gallery:
  - image: /images/projects/zekai/analiz-akisi.webp
    alt:
      tr: "Canlı analiz akışı: danışman, gerekirse piyasa kontrolü ve karar; her adım kendi sonucu gelince tamamlanıyor"
      en: "The live analysis flow: advisor, a market check if needed, then the decision; each step completes when its own result arrives"
  - image: /images/projects/zekai/karar.webp
    alt:
      tr: "Karar ekranı: Alabilirsin kararı ve kararı doğuran kuralların listesi"
      en: "The verdict screen: a go-ahead verdict and the list of rules that produced it"
  - image: /images/projects/zekai/karsilastirma.webp
    alt:
      tr: "Karşılaştırma: iki kulaklık, alıcının ihtiyacına göre bir kazanan ve her ürün için gerekçe"
      en: "Comparison: two headphones, a winner for the buyer's need and a reason for each product"
  - image: /images/projects/zekai/musteri-simulasyonu.webp
    alt:
      tr: "Müşteri simülasyonu: beş müşteri profili ürün sayfasının kendi önemsediği bölümüne bakıyor"
      en: "Customer simulation: five customer profiles each look at the part of the page they care about"
  - image: /images/projects/zekai/yapay-zeka-icerik.webp
    alt:
      tr: "Yapay zekâyla içerik: yeni başlık, açıklamalar, özellik maddeleri ve ürün görselleri"
      en: "Content with AI: a new title, descriptions, feature bullets and product images"
  - image: /images/projects/zekai/birlikte-sat.webp
    alt:
      tr: "Birlikte sat: tamamlayıcı ürün önerileri ve indirimli paketler"
      en: "Sell together: complementary product suggestions and discounted bundles"
  - image: /images/projects/zekai/musteri-sesi.webp
    alt:
      tr: "Müşteri Sesi: her yoruma bir cevap taslağı ve yorumlardan çıkarılmış sık sorulan sorular"
      en: "Customer Voice: a draft reply for every review and FAQs drawn from the reviews"
  - image: /images/projects/zekai/akilli-market.webp
    alt:
      tr: "Akıllı Market: ZekAI'ın bağlandığı pazar yerinin ürün sayfası ve paket fırsatları"
      en: "Akıllı Market: a product page and bundle deals on the marketplace ZekAI connects to"
  - image: /images/projects/zekai/telefon.webp
    alt:
      tr: "Telefon arayüzü: tek tıkla demo girişi, analiz kararı ve satıcının Müşteri Sesi ekranı"
      en: "Phone interface: the one-click demo sign-in, an analysis verdict and the seller's Customer Voice screen"
  - image: /images/projects/zekai/koyu-tema.webp
    alt:
      tr: "Koyu tema: kaydedilen analizler, her birinde durum ve not"
      en: "The dark theme: saved analyses, each with a status and a note"
  - image: /images/projects/zekai/demo-giris.webp
    alt:
      tr: "Canlı demonun giriş sayfası: satıcı ya da alıcı olarak tek tıkla giriş"
      en: "The live demo's sign-in page: one click as a seller or a buyer"
repoUrl: https://github.com/mrfiratatalay/btk-zekai
demoUrl: https://zekai-platformm.vercel.app/login
featured: false
order: 2
published: true
---
