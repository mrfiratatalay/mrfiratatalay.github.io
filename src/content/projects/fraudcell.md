---
title: FraudCell
urlSlug: fraudcell
tagline:
  tr: Yapay zekâ ve analistin birlikte çalıştığı dolandırıcılık operasyon platformu
  en: A fraud operations platform where AI and analysts work together
context:
  tr: Code Night 2026 All-Star Finalisti
  en: Code Night 2026 All-Star Finalist
summary:
  tr: "Turkcell Code Night 2026 All-Star finalinde iki kişilik takımımızla bir gecede yazdığımız projeyi, etkinlikten sonra gerçek bir mikroservis sistemine dönüştürdüm. Her ödeme yapay zekâyla skorlanıyor, riskli olan uzmanlığına uygun analiste düşüyor ve SLA sayacıyla takip ediliyor. Gerekirse müşteriye \"bu işlemi sen mi yaptın?\" diye soruluyor. Canlı demoda müşteri, analist, süpervizör ve yönetici olarak tek tıkla, şifresiz girip aynı vakayı dört taraftan görebilirsiniz."
  en: "My two-person team built this project overnight at the Turkcell Code Night 2026 All-Star final; after the event I turned it into a real microservice system. Every payment is scored by AI, risky ones go to an analyst with the right specialty and are tracked against an SLA, and when needed the customer is asked \"was this you?\". In the live demo you can sign in as customer, analyst, supervisor or administrator with one click and no password, and see the same case from four sides."
highlights:
  tr:
    - "Gece bittiğinde sistem çalışıyordu ama temiz bir makinede açılmıyordu: Postgres init betiğinin çalıştırma izni yoktu, model dosyaları repoda değildi. Projeyi dokuz adımlık bir plana böldüm; her adım ayrı bir PR oldu ve hiçbiri yeşil CI olmadan birleşmedi. Bugün her PR'da temiz bir makinede docker compose up ile bütün sistem açılıyor ve vakadaki zorunlu demo akışı baştan koşuyor."
    - "Dört servis tek bir Postgres'i ve ortak bir anahtar dosyasını paylaşıyordu. Her servise kendi Postgres'ini ve özel ağını verdim; başka servisin verisine olaylardan beslenen projeksiyonlarla ulaşıyorum. İmza anahtarı artık yalnızca Identity'de duruyor, diğerleri token'ı JWKS ile doğruluyor."
    - "Servisler RabbitMQ üzerinden konuşuyor. Olay, iş verisiyle aynı veritabanı işleminde outbox'a yazılıyor, tüketiciler aynı olayı inbox ile ikinci kez işlemiyor. CI her container'ı, RabbitMQ dahil, sırayla durdurup sistemin toparlandığını doğruluyor."
    - "AI servisi düşerse ödeme durmuyor: 5 saniyede sonuç gelmeyen işlem \"Belirsiz\" riskle manuel kuyruğa açılıyor. Sağlıklı trafiğin bile kuyruğa düştüğünü fark ettim; outbox 2 saniyede bir yoklanırken süre de 2 saniyeydi. Süreyi zincirin gerçek uzunluğuna göre yeniden seçtim."
    - "Hackathon sürümünde her blok +15 puan alıyordu; bu, analisti her şeyi bloklamaya itiyordu. Kararın doğru olup olmadığını bilen tek kaynağı müşterinin cevabı olarak tanımladım. Önce hatayı yakalayan bir test yazdım, sonra puanı, rozetleri ve modelin doğruluk metriklerini bu cevaba bağladım."
    - "İki süpervizör aynı vakayı aynı anda atarsa ilk atama kaybolmasın diye her kayda sürüm ekledim: yazma If-Match istiyor, eski sürüm 412 alıyor. Bir vakanın tek aktif ataması ve analist başına en fazla 10 vaka gibi kuralları veritabanında da filtreli unique index ve check constraint'lerle koruyorum."
    - "Vaka dokümanı jürinin deneyeceği saldırıları sayıyordu. Hepsini bir betiğe yazdım: IDOR, rol matrisi, bozulmuş JWT, SQL injection, XSS, kaba kuvvet ve kullanılmış refresh token. 96 kontrol her PR'da gerçek sisteme karşı koşuyor. Müşterinin personel puanlarını okuyabildiğini bu denetim sırasında yakalayıp kapattım."
    - "Modeli dürüst ölçüyorum: kalibre edilmiş risk modelinin recall değeri 0,52, yani dolandırıcılıkların yaklaşık yarısı kaçıyor. Bunu dokümanda ve model kartında açıkça yazdım. Eğitimde kullanılmayan 120 Türkçe senaryo ayrı bir kabul seti; gece özelliğinin UTC yüzünden yanlış hesaplandığını da düzelttim."
    - "Arayüzü bir vaka yönetim aracı gibi baştan kurdum: analist için yoğun bir vaka tablosu ve sabit bir karar paneli, süpervizör için \"önce müdahale bekleyenler\" diye açılan bir panel, müşteri için risk seviyesi yerine işlemin sonucu. Canlı demo aynı API sözleşmesini tarayıcıda karşılıyor; gerçek derlemeye demo kodu hiç girmiyor."
  en:
    - "When the night ended the system worked, but it didn't start on a clean machine: the Postgres init script wasn't executable and the model files weren't in the repository. I split the work into a nine-step plan; every step became its own PR, and none was merged without green CI. Today every PR brings the whole system up with docker compose up on a clean machine and replays the case's mandatory demo flow."
    - "Four services shared one Postgres and one key file. I gave each service its own Postgres and private network, and other services' data now arrives through event-fed projections. The signing key lives only in Identity; the others validate tokens through JWKS."
    - "Services talk over RabbitMQ. An event is written to the outbox in the same database transaction as the business data, and consumers use an inbox so the same event is never applied twice. CI stops every container in turn, RabbitMQ included, and checks that the system recovers."
    - "If the AI service fails, payments don't stop: a transaction with no result within 5 seconds opens with an unknown risk in the manual queue. I noticed even healthy traffic ending up there: the outbox was polled every 2 seconds while the deadline was also 2 seconds. I re-sized the deadline from the real length of the chain."
    - "In the hackathon version every block earned +15 points, which pushed analysts to block everything. I defined the customer's answer as the only source that knows whether a decision was right. I wrote a test that caught the bug first, then tied points, badges and the model's accuracy metrics to that answer."
    - "So that the first assignment isn't lost when two supervisors assign the same case at once, every record has a version: writes require If-Match, and a stale version gets 412. Rules such as one active assignment per case and at most 10 cases per analyst are also enforced in the database with filtered unique indexes and check constraints."
    - "The case listed the attacks the jury would try. I wrote them all into a script: IDOR, a role matrix, tampered JWTs, SQL injection, XSS, brute force and a reused refresh token. 96 checks run against the real system on every PR. During that audit I found and closed a hole that let customers read staff points."
    - "I measure the model honestly: the calibrated risk model's recall is 0.52, so about half of the frauds slip through, and I say so in the docs and the model card. 120 Turkish scenarios that are never used for training form a separate acceptance set, and I fixed the night feature being computed in UTC."
    - "I rebuilt the interface as a case-management tool: a dense case table and a sticky decision panel for analysts, a dashboard that opens with the cases needing action for supervisors, and for customers the outcome of a transaction instead of a risk level. The live demo answers the same API contract in the browser, and no demo code ships in the real build."
problem:
  tr: "Dijital ödemelerde dolandırıcılık saniyeler içinde olur; her işlemi bir insanın incelemesi imkânsız, her şeyi otomatik bloklamak ise gerçek müşteriyi mağdur eder. Code Night'taki vaka bunun dengesini istiyordu: yapay zekâ riskli olanı bulsun, doğru analist SLA süresi içinde karar versin, müşteri sürece dahil olsun ve analistler motive kalsın. Üstelik bir bileşen düştüğünde hiçbir işlem kaybolmamalı."
  en: "Fraud in digital payments happens in seconds; a person can't review every transaction, and blocking everything automatically hurts real customers. The Code Night case asked for the balance: AI finds the risky ones, the right analyst decides within an SLA, the customer takes part in the process and analysts stay motivated. And when a component fails, no transaction may be lost."
benefit:
  tr: "Analist ekranı açtığında en riskli ve en acil vakayı en üstte, SLA'sını canlı geri sayarken görüyor; skorun neden yüksek olduğunu okuyup müşteriye sorabiliyor ve tek bir sonraki adıma odaklanıyor. Süpervizör panelde önce müdahale bekleyenleri, sonra yükü ve modelin doğruluğunu görüyor. Müşteri ise işleminin sonucunu ve sürecini bir dekont gibi takip ediyor, \"ben yapmadım\" dediği an işlem beklemeye alınıyor."
  en: "When an analyst opens the screen, the riskiest and most urgent case is on top with its SLA counting down; they can read why the score is high, ask the customer, and focus on one next step. The supervisor's dashboard shows the cases needing action first, then workload and model accuracy. The customer follows a transaction's outcome and progress like a receipt, and the moment they say \"it wasn't me\" the transaction is put on hold."
role:
  tr: "Turkcell Code Night 2026 All-Star finalinde takım arkadaşım Ayşe Mandıralı ile iki kişilik bir takımdık; takım kaptanı bendim. O gece Ayşe mimari dokümanları, Identity ve Transaction servislerinin ilk hâlini ve frontend temelini kurdu; ben servisleri bağladım, AI kapalıyken çalışan akışı, demo akışlarını ve arayüzü yaptım. Etkinlikten sonraki tamamlamayı tek başıma yaptım. Kodun önemli bir kısmını yapay zekâyla (Claude Code) birlikte, kendi koyduğum kurallar altında yazdım."
  en: "At the Turkcell Code Night 2026 All-Star final my teammate Ayşe Mandıralı and I were a two-person team, and I was the captain. That night Ayşe wrote the architecture documents, the first versions of the Identity and Transaction services and the frontend's foundation; I connected the services and built the AI-down flow, the demo flows and the UI. I did the post-event completion on my own. I wrote a significant part of the code with an AI assistant (Claude Code), under rules I set."
technologies:
  - .NET 10
  - ASP.NET Core 10
  - EF Core 10
  - YARP 2.3
  - PostgreSQL 18
  - RabbitMQ 4.3
  - Python 3.13
  - FastAPI
  - scikit-learn 1.5
  - React 19
  - TypeScript 5.9
  - TanStack Query
  - Tailwind CSS 4
  - Docker
  - Playwright
icon: shield
color: blue
cover: /images/projects/fraudcell/kapak.webp
coverAlt:
  tr: "FraudCell: bilgisayarda analistin vaka çalışma alanı, telefonda müşterinin ana sayfası"
  en: "FraudCell: the analyst's case workspace on the desktop and the customer's home page on a phone"
gallery:
  - image: /images/projects/fraudcell/analist-gelen-kutusu.webp
    alt:
      tr: "Analistin gelen kutusu: en riskli ve en acil vaka üstte, SLA canlı geri sayıyor"
      en: "The analyst's inbox: the riskiest and most urgent case on top, with a live SLA countdown"
  - image: /images/projects/fraudcell/vaka-calisma-alani.webp
    alt:
      tr: "Vaka çalışma alanı: 0,40 ve 0,90 eşikleriyle risk ölçeği, AI gerekçesi, vaka geçmişi ve karar paneli"
      en: "The case workspace: the risk meter with its 0.40 and 0.90 thresholds, the AI's reasons, the case history and the decision panel"
  - image: /images/projects/fraudcell/supervizor-paneli.webp
    alt:
      tr: "Süpervizör paneli: önce müdahale bekleyen vakalar, sonra risk ve SLA dağılımı, model doğruluğu"
      en: "The supervisor dashboard: cases needing action first, then risk and SLA distribution and model accuracy"
  - image: /images/projects/fraudcell/musteri-islem-dekontu.webp
    alt:
      tr: "Müşterinin işlem dekontu: sonuç, işlem süreci, yapay zekâ gerekçeleri ve 1–5 yıldız değerlendirme"
      en: "The customer's transaction receipt: the outcome, its progress, the AI's reasons and a 1–5 star rating"
  - image: /images/projects/fraudcell/atama-kuyrugu.webp
    alt:
      tr: "Atama kuyruğu: türü belirlenemeyen ve analist kapasitesi bekleyen vakalar"
      en: "The assignment queue: cases with an unknown type and cases waiting for analyst capacity"
  - image: /images/projects/fraudcell/analist-profili.webp
    alt:
      tr: "Analist profili: seviye çubuğu, puan hareketleri ve rozetler"
      en: "The analyst profile: the level bar, the point history and badges"
  - image: /images/projects/fraudcell/telefon.webp
    alt:
      tr: "Telefon arayüzü: müşteri ana sayfası, \"Bu işlemi sen mi yaptın?\" sorusu ve analistin vaka listesi"
      en: "Phone interface: the customer's home page, the \"was this you?\" question and the analyst's case list"
  - image: /images/projects/fraudcell/koyu-tema.webp
    alt:
      tr: "Koyu tema: aynı vaka ekranı Turkcell lacivertinde"
      en: "Dark theme: the same case screen in Turkcell navy"
  - image: /images/projects/fraudcell/demo-giris.webp
    alt:
      tr: "Canlı demonun giriş sayfası: dört rolün her biri için tek tıkla, şifresiz giriş"
      en: "The live demo's sign-in page: one-click, password-free sign-in for each of the four roles"
repoUrl: https://github.com/mrfiratatalay/FraudCell
demoUrl: https://fraud-cell.vercel.app
featured: false
order: 1
published: true
---
