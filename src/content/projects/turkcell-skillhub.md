---
title: Turkcell SkillHub
urlSlug: turkcell-skillhub
tagline:
  tr: Gece temalı, oyunlaştırılmış dijital beceri platformu
  en: A night-themed, gamified digital skills platform
context:
  tr: Code Night Trabzon Birinciliği ve All-Star Finalisti
  en: Code Night Trabzon 1st Place & All-Star Finalist
summary:
  tr: "Turkcell Code Night 2025 Trabzon'da iki kişilik takımımızla bir gecede yazıp birinci olduğumuz projeyi, yarışmadan sonra baştan yazdım. Her ders gökyüzünde bir yıldız, her konu bir takımyıldız: quiz'i geçen öğrencinin yıldızı yanıyor, kazandığı XP ile Gece Saati 17:00'den şafağa ilerliyor. Arkada Java 25 ve Spring Boot 4 ile katmanlara ayrılmış bir API ve PostgreSQL var. Canlı demoda tek tıkla hazır bir öğrenci profiline girip bütün modülleri deneyebilirsiniz."
  en: "My two-person team built this project overnight at Turkcell Code Night 2025 in Trabzon and took first place; after the competition I rewrote it from scratch. Every lesson is a star and every topic a constellation: pass a quiz and your star lights up, and the XP you earn moves your Night Clock from 17:00 toward dawn. Behind it is a layered Java 25 and Spring Boot 4 API with PostgreSQL. In the live demo you can open a ready-made learner profile with one click and try every module."
highlights:
  tr:
    - "Hackathon gecesi bizi kazandıran fikir ve demoydu; kod üretime hazır değildi. Projeyi bir kod incelemesi yapar gibi açtım: giriş tarayıcıda tutuluyordu, liderlik tablosu isim uyduruyordu, XP sonsuza kadar kasılabiliyordu ve API anahtarı repoya commit'lenmişti. Yamamak yerine veritabanı, backend ve arayüzüyle baştan yazdım; o gecenin ekran görüntülerini repoda hatıra olarak sakladım."
    - "XP'yi bir sayaçta değil, yalnızca eklenen bir defterde tutuyorum. Toplam, seviye ve sıralamalar her okumada bu defterden SQL window fonksiyonlarıyla türetiliyor; kopyalanıp gerçeğinden ayrışabilecek bir puan yok."
    - "Bir quiz'i tekrar çözmek yalnızca önceki en iyi skoru geçtiğin kadar XP kazandırıyor. Puanlama, deneme, XP ve rozetler tek transaction'da yazılıyor; öğrencinin satırını FOR UPDATE ile kilitlediğim için çift tıklama aynı gelişmeyi iki kez ödetemiyor."
    - "Doğru cevaplar tarayıcıya hiç gitmiyor; puanlama sunucuda, saf bir domain fonksiyonunda yapılıyor. Kuralları veritabanında da koruyorum: kısmi unique index her sorunun tek doğru şıkkı olmasını garanti ediyor, aynı e-postayla eşzamanlı iki kayıt 500 değil 409 ile bitiyor."
    - "Gece Rehberi'nin önerilerini Claude yazıyor ama modele yalnızca öğrencinin gerçek ilerlemesini gösteriyorum ve her öneriyi açılabilir derslerle karşılaştırıyorum. Model reddederse, hata verirse ya da anahtar yoksa deterministik bir kural motoru cevap veriyor."
    - "Demo verisini elle eklemedim: 30 kurgusal öğrencinin dört haftalık geçmişini gerçek quiz servisinden geçirerek oynatıyorum. XP, seri, rozet ve sıralamalar canlı trafikle aynı koddan çıkıyor."
    - "Code Night'ın görsellerinden renkleri ölçüp bir tasarım dili kurdum. İlk tasarımda doygun lacivert her yerdeydi ve uzun kullanımda yoruyordu; “Sakin Gece” ile çalışma yüzeylerini sakin tonlara çektim, laciverti yalnızca gökyüzü pencerelerine bıraktım, parıltıyı da yalnızca kazanılan şeylere verdim. Koyu ve açık tema, sayfa yeniden çizilmeden CSS değişkenleriyle değişiyor."
    - "Ücretsiz barındırmada backend uyuyor, veritabanı siliniyordu. Arayüze aynı API sözleşmesini tarayıcıda karşılayan bir demo katmanı yazdım; canlı demo beklemeden açılıyor ve gerçek API derlemesinde bu kod pakete hiç girmiyor. Gerçek sistemi görmek isteyene tek komut yetiyor: docker compose up --build."
    - "İki tarafta da Clean Architecture uyguladım: backend'de iş kuralları Spring'e bağımlı olmayan saf Java, arayüzde her ekran kendi klasöründe. Elle yazılan hiçbir dosya 300 satırı geçmiyor; bütün kararları gerekçeleri ve bedelleriyle repodaki docs klasöründe anlattım."
  en:
    - "What won us the hackathon was the idea and the demo; the code was not production-ready. I opened the project like a code review: sign-in lived in the browser, the leaderboard invented names, XP could be farmed forever and an API key had been committed to the repository. Instead of patching it, I rewrote the database, the backend and the interface from scratch and kept the screenshots of that night in the repository as a memento."
    - "XP is kept in an append-only ledger, not in a counter. Totals, levels and rankings are derived from that ledger with SQL window functions on every read, so there is no copied score that can drift away from the truth."
    - "Retaking a quiz only pays the XP above your previous best score. Grading, the attempt, XP and badges are written in one transaction, and because I lock the learner's row with FOR UPDATE, a double-click cannot pay the same improvement twice."
    - "Correct answers never reach the browser; grading happens on the server in a pure domain function. The database guards the rules too: a partial unique index guarantees one correct option per question, and two simultaneous sign-ups with the same email end in a 409, not a 500."
    - "Claude writes the Night Guide's suggestions, but the model only sees the learner's real progress and every suggestion is checked against lessons the learner can actually open. If the model refuses, fails or no key is configured, a deterministic rule engine answers instead."
    - "I did not insert demo data by hand: 30 fictional learners replay four weeks of history through the real quiz service, so XP, streaks, badges and rankings come from the same code as live traffic."
    - "I measured the colours from the official Code Night visuals and built a design language on them. The first design used saturated navy everywhere and was tiring to use for long; with “Sakin Gece” (Calm Night) I moved the working surfaces to calm tones, kept the navy only for the sky windows and gave glow only to things that are earned. The dark and light themes switch through CSS variables without re-rendering the page."
    - "On free hosting the backend fell asleep and the database was deleted. I wrote a demo layer that answers the same API contract in the browser, so the live demo opens instantly, and this code never enters the real API build. For anyone who wants the real system, one command is enough: docker compose up --build."
    - "I applied Clean Architecture on both sides: the backend's business rules are plain Java with no Spring dependency, and every screen of the interface lives in its own folder. No hand-written file exceeds 300 lines, and I documented every decision with its reasons and trade-offs in the repository's docs folder."
problem:
  tr: "Gençler yazılım, yapay zekâ ya da siber güvenlik öğrenmeye hevesle başlıyor ama bu heves çabuk sönüyor: dağınık kaynaklar arasında nereden devam edeceğini bilemiyor, ilerlemesini göremiyor, emeğinin bir karşılığını hissetmiyor. Code Night'taki vaka da tam bunu istiyordu: ders izlenen, quiz çözülen, rozet kazanılan ve gelişimin takip edildiği bir platform."
  en: "Young people start learning software, AI or cybersecurity with enthusiasm, but it fades quickly: they don't know where to continue among scattered resources, they can't see their progress and their effort doesn't feel rewarded. That was exactly the Code Night case: a platform to watch lessons, take quizzes, earn badges and track progress."
benefit:
  tr: "Öğrenci gökyüzüne bakınca nerede olduğunu ve sıradaki yıldızı tek bakışta görüyor. Ön koşul çizgileri yolu gösteriyor, Gece Rehberi kişisel öneri veriyor; XP, seriler, gizli rozetler ve şehrinin Türkiye haritasında parlaması öğrenmeyi bir oyuna çeviriyor. Her quiz sonunda yanlışının nedenini açıklamasıyla görüyor; tekrar çözdüğünde puan için değil, öğrenmek için çözüyor."
  en: "Looking at the sky, a learner sees at a glance where they are and which star comes next. Prerequisite lines show the path, the Night Guide gives personal suggestions, and XP, streaks, secret badges and their city glowing on the map of Türkiye turn learning into a game. After every quiz they see why an answer was wrong, so a retake is about learning, not points."
role:
  tr: "Turkcell Code Night 2025 Trabzon'da takım arkadaşım Ayşe Mandıralı ile iki kişilik bir takımdık; takım kaptanı bendim. Yarışmadan sonra projeyi baştan yazdım: mimariye, veri modeline, oyun kurallarına ve tasarım diline ben karar verdim, her değişikliği tarayıcıda deneyip kabul ettim. Kodun önemli bir kısmını yapay zekâyla (Claude Code) birlikte, kendi koyduğum kurallar altında yazdım."
  en: "At Turkcell Code Night 2025 in Trabzon my teammate Ayşe Mandıralı and I were a two-person team, and I was the team captain. After the competition I rewrote the project from scratch: I decided the architecture, the data model, the game rules and the design language, and tried every change in the browser before accepting it. I wrote a significant part of the code with an AI assistant (Claude Code), under rules I set."
technologies:
  - Java 25
  - Spring Boot 4
  - PostgreSQL 17
  - Flyway
  - React 19
  - TypeScript
  - Material UI
  - TanStack Query
  - Docker
  - Claude API
icon: trophy
color: orange
cover: /images/projects/turkcell-skillhub/kapak.webp
coverAlt:
  tr: "SkillHub: bilgisayarda gökyüzü haritası ve Gece Saati, telefonda aynı ekranın mobil hâli"
  en: "SkillHub: the sky map and the Night Clock on the desktop, and the same screen on a phone"
gallery:
  - image: /images/projects/turkcell-skillhub/gokyuzu.webp
    alt:
      tr: "Gökyüzü haritası: her ders bir yıldız, her konu bir takımyıldız; çizgiler ön koşulları gösteriyor"
      en: "The sky map: every lesson is a star and every topic a constellation; the lines show prerequisites"
  - image: /images/projects/turkcell-skillhub/dersler.webp
    alt:
      tr: "Ders kataloğu: takımyıldıza ve zorluğa göre filtre, her derste en iyi skor"
      en: "The lesson catalogue: filters by constellation and difficulty, with the best score on every lesson"
  - image: /images/projects/turkcell-skillhub/quiz-sonucu.webp
    alt:
      tr: "Quiz sonucu: +75 XP, Gece Saati'nin 22:35'ten 23:04'e ilerlemesi ve yeni seviye"
      en: "Quiz result: +75 XP, the Night Clock moving from 22:35 to 23:04 and a new level"
  - image: /images/projects/turkcell-skillhub/gece-rehberi.webp
    alt:
      tr: "Gece Rehberi: öğrencinin gerçek ilerlemesinden üretilen üç kişisel öneri"
      en: "The Night Guide: three personal suggestions built from the learner's real progress"
  - image: /images/projects/turkcell-skillhub/sehir-isiklari.webp
    alt:
      tr: "Şehir Işıkları: 81 ilin gece haritası; şehirler öğrencilerinin XP'siyle parlıyor"
      en: "City Lights: a night map of all 81 provinces, where cities glow with their learners' XP"
  - image: /images/projects/turkcell-skillhub/rozetler.webp
    alt:
      tr: "Rozet koleksiyonu: 12 kart; gizli rozetler kazanılana kadar sırrını saklıyor"
      en: "The badge collection: 12 cards; secret badges keep their story hidden until earned"
  - image: /images/projects/turkcell-skillhub/telefon.webp
    alt:
      tr: "Telefon arayüzü: giriş, Gece Saati ve Şehir Işıkları"
      en: "Phone interface: sign-in, the Night Clock and City Lights"
  - image: /images/projects/turkcell-skillhub/safak-tema.webp
    alt:
      tr: "Açık Şafak teması: aynı ekranlar, kontrastı kontrol edilmiş gündüz renkleriyle"
      en: "The light Şafak theme: the same screens in contrast-checked daytime colours"
  - image: /images/projects/turkcell-skillhub/demo-giris.webp
    alt:
      tr: "Canlı demonun giriş sayfası: tek tıkla hazır bir öğrenci profiline giriş"
      en: "The live demo's sign-in page: one click opens a ready-made learner profile"
repoUrl: https://github.com/mrfiratatalay/Turkcell-Skillhub
demoUrl: https://skillhub-turkcell.vercel.app
featured: false
order: 4
published: true
---
