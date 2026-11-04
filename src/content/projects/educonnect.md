---
title: EduConnect
urlSlug: educonnect
tagline:
  tr: Kaynağını gösteren bir asistanla yapay zekâ destekli kampüs platformu
  en: An AI-assisted campus platform with an assistant that shows its sources
context:
  tr: TÜBİTAK 2209-A destekli bitirme projesi
  en: Graduation project supported by TÜBİTAK 2209-A
summary:
  tr: "Recep Tayyip Erdoğan Üniversitesi'nde Ayşe Mandıralı ile birlikte bitirme tezimiz olarak geliştirdiğimiz kampüs platformu: akış, topluluklar, etkinlikler, ikinci el pazar, mesajlaşma ve üniversiteyle ilgili soruları resmî kaynaklara dayanarak cevaplayan EduAI. Arkada ASP.NET Core 10 ile yazılmış bir API, PostgreSQL ve BERTurk modelini çalıştıran bir Python servisi var. Canlı demoda dört rolden biriyle tek tıkla girip akışı, toplulukları, EduAI'ı, fotoğrafla ürün aramayı ve anlık mesajları deneyebilirsiniz."
  en: "A campus platform Ayşe Mandıralı and I built as our graduation thesis at Recep Tayyip Erdoğan University: a feed, communities, events, a second-hand market, messaging and EduAI, which answers university questions based on official sources. Behind it are an ASP.NET Core 10 API, PostgreSQL and a Python service that runs a BERTurk model. In the live demo you can log in with one of four roles in one click and try the feed, communities, EduAI, searching products with a photo and live messages."
highlights:
  tr:
    - "Kasım'da canlı adrese girdiğimde giriş bile yapılamıyordu: Render'daki ücretsiz veritabanının süresi dolmuştu. Arayüze, gerçek API'nin sözleşmesini tarayıcıda karşılayan bir demo katmanı yazdım. axios'un adaptörü ve SignalR bağlantısı derleme sırasında değişiyor, ekranlar aynı kalıyor ve gerçek derlemede bu kodun izi bile yok. Gerçek sistemi görmek isteyene tek komut yetiyor: docker compose up --build."
    - "EduAI'ın değeri modelden değil, etrafındaki sistemden geliyor. Kendi veri setimizle ince ayardan geçirdiğimiz BERTurk soruyu 7 niyetten birine ayırıyor, 412 kayıtlık bilgi tabanı cevabı buluyor, Gemini de bunu öğrencinin diliyle anlatıyor. Cevap ancak eşleşme yeterince güçlüyse dayanaklı sayılıyor; her cevapta kaynak bağlantısı, niyet ve güven bandı görünüyor."
    - "Asistan bazı sorulara “duyuruları takip ediniz” diye cevap veriyordu; sorun model değil veriydi. Kısa ve yönlendiren cevapları yakalayan bir dedektör yazdık. Öğrenci El Kitabı ve yönergeler gibi resmî PDF'lerden de bilgi tabanını bir günde 225 kayıttan 412 kayda çıkardık."
    - "Her dış servisin düşebileceğini varsaydık: NLP servisi cevap vermezse güvenli bir yedek sonuçla, Gemini'nin kotası dolarsa yerel bilgi tabanıyla devam ediliyor. Kasım'da sistemi anahtarsız çalıştırınca bu yedeğin hiç devreye girmediğini gördüm, çünkü servis daha oluşturulurken hata veriyordu. Düzelttim; bugün EduAI Gemini anahtarı olmadan da cevap veriyor."
    - "Modelin doğrulama doğruluğu 0,9626, ama bu sayıyı olduğundan büyük göstermiyorum: doğrulama seti, büyük kısmı kurallarla üretilmiş eğitim verisiyle aynı dağılımdan geliyor. Bu yüzden 60 zor vakalık ayrı bir test seti hazırladık. Modelin güveni düşükse ya da ilk iki tahmini birbirine çok yakınsa anahtar kelime sınıflandırıcısına da soruluyor."
    - "Refresh token'ı HttpOnly bir çerezde ve tek kullanımlık tutuyoruz. Eski token tek bir UPDATE ... WHERE ile iptal edildiği için iki sekme aynı anda yenilemeye kalksa bile yarışı veritabanı çözüyor; ikinci istek temiz bir 401 alıyor. Arayüzde de süresi aynı anda dolan istekler tek bir yenileme çağrısını paylaşıyor."
    - "Beğeni, kaydetme, takip ve üyelik gibi bir kez olması gereken işleri uygulamaya değil veritabanına emanet ettik. Aynı anda gelen ikinci istek benzersiz indeksten 23505 hatası alıyor ve backend bunu “iş zaten yapılmış” diye okuyor. Sayılar ayrı bir sayaçtan değil satırlardan geldiği için şişemiyor."
    - "Görsel aramada Gemini fotoğrafı tarif ederken NLP servisi ResNet-50 ile 2048 boyutlu bir vektör çıkarıyor. İkisi tek bir puanda birleşiyor ve API her sonucu kategori, metin, durum, fiyat ve görsel benzerlik dökümüyle döndürüyor; sıralama açıklanabilir kalıyor."
    - "Ücretsiz katmanlar mimariyi şekillendirdi. Modeller Render'ın 512 MB'ına sığmayınca yapay zekâyı Hugging Face'te ayrı bir servise taşıdık; SMTP portları kapalı olunca e-postayı Brevo'nun HTTPS API'sine, SQL Server olmayınca veritabanını PostgreSQL'e geçirdik. Kasım'daki yeniden okumada üç sözleşme hatası daha buldum ve her kararı bedeliyle birlikte Türkçe ve İngilizce 12 dokümanda anlattım."
  en:
    - "In November I opened the live address and nobody could even log in: Render's free database had expired. I wrote a demo layer that answers the real API's contract in the browser. The axios adapter and the SignalR connection are swapped at build time, the screens stay the same, and the real build carries no trace of this code. For anyone who wants the real system, one command is enough: docker compose up --build."
    - "EduAI's value comes not from the model but from the system around it. A BERTurk model we fine-tuned on our own dataset sorts each question into one of 7 intents, a 412-entry knowledge base finds the answer, and Gemini puts it into the student's words. An answer only counts as grounded when the match is strong enough, and every answer shows its source link, intent and confidence band."
    - "The assistant answered some questions with “follow the announcements”; the problem was not the model but the data. We wrote a detector that catches short, deflecting answers, and in one day we grew the knowledge base from 225 to 412 entries using official PDFs such as the Student Handbook and university regulations."
    - "We assumed any external service could fail: if the NLP service does not answer, a safe fallback result takes over, and if Gemini's quota runs out, the local knowledge base does. In November I ran the system without a key and saw that this fallback never ran, because the service failed while it was being created. I fixed it, and today EduAI answers even without a Gemini key."
    - "The model's validation accuracy is 0.9626, but I do not oversell that number: the validation set comes from the same distribution as the training data, most of which was generated from rules. That is why we prepared a separate set of 60 hard cases. When the model's confidence is low, or its top two guesses are too close, the keyword classifier is consulted as well."
    - "We keep the refresh token in an HttpOnly cookie, single-use. Because the old token is revoked with a single UPDATE ... WHERE, the database settles the race even when two tabs refresh at the same moment, and the second request gets a clean 401. In the UI, requests that expire together share one refresh call."
    - "We trusted the database, not the application, with things that must happen only once: likes, bookmarks, follows and memberships. A second simultaneous request gets error 23505 from a unique index, and the backend reads it as “already done”. Counts come from rows, not from a separate counter, so they cannot inflate."
    - "In visual search, Gemini describes the photo while the NLP service extracts a 2,048-dimensional vector with ResNet-50. The two are combined into one score, and the API returns every result with a breakdown of category, text, condition, price and visual similarity, so the ranking stays explainable."
    - "Free tiers shaped the architecture. When the models did not fit into Render's 512 MB, we moved the AI into a separate service on Hugging Face; when the SMTP ports were blocked, we moved e-mail to Brevo's HTTPS API; and with no SQL Server available, we moved the database to PostgreSQL. In my November reread I found three more contract bugs, and I documented every decision with its cost in 12 documents in Turkish and English."
problem:
  tr: "Üniversiteye başladığımızda kampüsteki hayatı yakalamak zordu: hangi etkinliğin nerede olduğu, hangi toplulukların var olduğu, kullanmadığımız kitabı kime verebileceğimiz ya da bütünleme sınavına kimlerin girebileceği farklı yerlere dağılmıştı. WhatsApp grupları dağınıktı, genel sosyal medya üniversiteden kopuktu, resmî duyurular uzun PDF'lerin içinde kayboluyordu."
  en: "When we started university, it was hard to keep up with campus life: which event was where, which clubs existed, who could use a book we no longer needed, or who could take the make-up exam was scattered across many places. WhatsApp groups were chaotic, general social media had nothing to do with the university, and official announcements were buried in long PDFs."
benefit:
  tr: "Öğrenci kampüsle ilgili her şeyi tek bir yerde buluyor: kendisine göre sıralanan ve nedenini söyleyen bir akış, toplulukların ve etkinliklerin takibi, fotoğrafla ürün aranabilen bir pazar ve anlık mesajlar. Üniversiteyle ilgili bir sorusu olduğunda EduAI kaynağını göstererek cevap veriyor. Kayıt kurumsal e-postayla yapıldığı için platformdaki herkes gerçekten bir öğrenci."
  en: "A student finds everything about campus in one place: a feed ranked for them that explains its choices, communities and events to follow, a market where products can be searched with a photo, and live messages. When they have a question about the university, EduAI answers and shows its source. Because signing up requires an institutional e-mail address, everyone on the platform really is a student."
role:
  tr: "Projeyi Ayşe Mandıralı ile birlikte, RTEÜ Bilgisayar Mühendisliği bitirme tezimiz olarak geliştirdik. Bütün sorumlulukları paylaştık; kaptan ya da tek bir sahip yoktu, backend, yapay zekâ servisi, arayüz ve yayına alma ortak işimizdi. Kasım 2026'da projeyi baştan okuyup canlı demoyu kurdum, üç hatayı düzelttim ve dokümanları koddan doğrulayarak yazdım. Kodun önemli bir kısmını yapay zekâyla (Claude Code) birlikte, kendi koyduğum kurallar altında yazdım."
  en: "Ayşe Mandıralı and I built the project together as our graduation thesis in Computer Engineering at RTEÜ. We shared every responsibility; there was no captain or single owner, and the backend, the AI service, the frontend and deployment were our joint work. In November 2026 I reread the project from the start, built the live demo, fixed three bugs and wrote the documentation, checking it against the code. I wrote a significant part of the code with AI (Claude Code), under rules I set."
technologies:
  - ASP.NET Core 10
  - EF Core 10
  - PostgreSQL 16
  - SignalR
  - FastAPI
  - BERTurk
  - PyTorch 2.5
  - Gemini 2.5 Flash Lite
  - React 19
  - TypeScript 5.9
  - Ant Design 6
  - TanStack Query 5
  - Docker
icon: graduation
color: teal
cover: /images/projects/educonnect/kapak.webp
coverAlt:
  tr: "EduConnect: bilgisayarda kişiselleştirilmiş akış, telefonda kaynağıyla cevap veren EduAI"
  en: "EduConnect: the personalized feed on a desktop, and EduAI answering with its source on a phone"
gallery:
  - image: /images/projects/educonnect/akis.webp
    alt:
      tr: "Kişiselleştirilmiş akış: her gönderinin üstünde neden önerildiği yazıyor; sağda gündemdeki etiketler ve takip önerileri"
      en: "The personalized feed: every post says why it was recommended, with trending tags and follow suggestions on the right"
  - image: /images/projects/educonnect/eduai.webp
    alt:
      tr: "EduAI: bütünleme ve kütüphane sorularına resmî kaynaklı cevaplar; her cevapta niyet, güven bandı ve bilgi tabanı etiketi"
      en: "EduAI: answers about make-up exams and the library with official sources; each one shows the intent, confidence band and knowledge base label"
  - image: /images/projects/educonnect/gorsel-arama.webp
    alt:
      tr: "Görsel arama: yüklenen fotoğraf %93 güvenle bilimsel hesap makinesi olarak tanınıyor, en yakın ilan puanıyla listeleniyor"
      en: "Visual search: the uploaded photo is recognized as a scientific calculator with 93% confidence, and the closest listing comes with its score"
  - image: /images/projects/educonnect/topluluk.webp
    alt:
      tr: "Topluluk sayfası: kurucu olarak üye yönetimi, topluluk kuralları ve topluluk özeti"
      en: "A community page: member management as the founder, the community rules and a summary"
  - image: /images/projects/educonnect/etkinlikler.webp
    alt:
      tr: "Etkinlikler: kontenjan çubukları, kayıt ve iptal; Kaçkar yürüyüşü 25/25 ile dolu"
      en: "Events: capacity bars, registration and cancellation; the Kaçkar hike is full at 25/25"
  - image: /images/projects/educonnect/mesajlar.webp
    alt:
      tr: "Birebir mesajlar: gönderilen mesaja birkaç saniye içinde cevap geliyor"
      en: "Direct messages: a reply arrives within seconds of sending a message"
  - image: /images/projects/educonnect/telefon.webp
    alt:
      tr: "Telefon arayüzü: akış, topluluk ve EduAI, alt gezinme çubuğuyla"
      en: "Phone interface: the feed, a community and EduAI, with a bottom navigation bar"
  - image: /images/projects/educonnect/koyu-tema.webp
    alt:
      tr: "Koyu tema: aynı akış, siyah değil koyu lacivert bir zeminde"
      en: "The dark theme: the same feed on deep navy rather than black"
  - image: /images/projects/educonnect/demo-giris.webp
    alt:
      tr: "Canlı demonun giriş sayfası: dört rolden biriyle şifresiz, tek tıkla giriş"
      en: "The live demo's landing page: one-click, password-free login with one of four roles"
repoUrl: https://github.com/mrfiratatalay/educonnect-backend
demoUrl: https://educonnect-tez.vercel.app
featured: false
order: 3
published: true
---
