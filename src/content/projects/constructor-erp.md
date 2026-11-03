---
title: Constructor ERP
urlSlug: constructor-erp
tagline:
  tr: Müteahhitler için çok firmalı şantiye yönetim platformu
  en: Multi-tenant construction site management platform for contractors
summary:
  tr: "Müteahhitlerin şantiyelerini WhatsApp grupları yerine tek yerden yönettiği, çok firmalı bir SaaS ürünü. Her şantiye bir sohbet grubu gibi çalışıyor; yanında yoklama ve puantaj, malzeme sevkiyatı ve taşeron ilerlemesi var. Telefonda sade bir saha arayüzü, bilgisayarda bir yönetim paneli var. Canlı demoda beş rolden biriyle şifresiz girip her ekranı deneyebilirsiniz."
  en: "A multi-tenant SaaS product that lets contractors run their construction sites from one place instead of WhatsApp groups. Every site works like a group chat, with attendance and timesheets, material shipments and subcontractor progress alongside it. There is a simple field interface on the phone and a management dashboard on the desktop. In the live demo you can sign in as any of five roles without a password and try every screen."
highlights:
  tr:
    - "Ürünü tek bir fikrin etrafında topladım: şantiye bir WhatsApp grubudur. Dört tasarım turundan sonra dağılan ürünü; en son mesaja göre sıralanan liste, okundu tikleri ve sabitleme gibi kullanıcının zaten bildiği davranışlarla yeniden kurdum. Her ekranda kendime şunu sordum: “Bunu müteahhit olan dayım kullanabilir mi?”"
    - "Tek bir müşteri için yazdığımız uygulamayı satılabilir bir ürüne (SaaS) dönüştürdük: tanıtım sitesi, paket karşılaştırma, başvuru formu, tek kullanımlık linkle açılan kurulum sihirbazı ve firmaları, abonelikleri, ödemeleri yöneten bir platform paneli."
    - "Bir firmanın verisinin başka bir firmaya görünmemesini iki katmanda garanti altına aldım: servisler firmaya göre süzüyor, PostgreSQL de satır seviyesinde güvenlikle (RLS) başka firmanın satırını hiç döndürmüyor. Korumasız bir tablo kalırsa uygulama açılmıyor; RLS'e takılmayan süper kullanıcı ve bağlantı havuzunda kalan firma bilgisi gibi tuzakları da kapattım."
    - "Kod kurallarını bir belgede bırakmadım, derlemeye bağladım: dosya en fazla 200, fonksiyon en fazla 30 satır; katman ve kütüphane sınırlarını ESLint ile Checkstyle denetliyor ve kurala uymayan kod derlenmiyor. Yapay zekâyla hızlı yazılan kodun tutarlı kalmasını bu sağladı."
    - "Zamanla bir depo yönetim sistemine dönüşen malzeme modülünü (7 hareket türü, 8 durum, 13 süzgeç) bir sevkiyat defterine sadeleştirdim: bir sevkiyat bir kamyon, tek hedef ve tek irsaliye. Modülün backend'i 3.622 satırdan 2.336 satıra indi; bu projede en çok gurur duyduğum commit, bir şey çıkardığım commit."
    - "Çalışan ilk yoklama sürümünü asıl soruya göre baştan kurduk: “Ay sonunda kime kaç günlük ödeme yapılacak?” Şef her sabah firmanın tek listesini işaretliyor, taşeronlar ekip olarak sayılıyor, işaretlenmemiş bir gün kimseyi kendiliğinden “gelmedi” yapmıyor ve ay sonunda puantaj Excel'i hazır oluyor."
    - "Telefon (Vant) ve bilgisayar (Element Plus) için iki ayrı arayüz kurduk; iş mantığı ise ortak bir katmanda bir kez yazılıyor ve bu katmanın arayüz kütüphanesi kullanmamasını ESLint denetliyor. Sahadaki zayıf internet için gönderim kuyruğu, telefonda fotoğraf küçültme ve önbellekten açılan bir uygulama var."
    - "Oturumu JWT yerine sunucuda tuttum, çünkü patron birini firmadan çıkardığında o kişinin oturumu anında kapanmalıydı. Çerez HttpOnly ve SameSite=Strict; veritabanında token'ın yalnızca SHA-256 özeti duruyor ve başka kökenden gelen yazma isteklerini Sec-Fetch-Site başlığıyla reddediyorum."
    - "Ücretsiz barındırmada backend uyuyor, veritabanının süresi doluyordu ve projeyi incelemek isteyen biri boş bir sayfa görüyordu. Ekranların koduna dokunmadan tarayıcıda çalışan bir sahte backend kurdum; canlı demo beklemeden açılıyor. Gerçek sistemi görmek isteyene de tek komut yetiyor: ./scripts/start.sh her şeyi Docker'da kuruyor."
  en:
    - "I built the product around one idea: a construction site is a WhatsApp group. After four design rounds had blurred the product, I rebuilt it on behaviours users already know, such as a list sorted by the latest message, read ticks and pinning. On every screen I asked myself: “Could my uncle, who is a contractor, use this?”"
    - "We turned an app written for a single customer into a sellable SaaS product: a marketing site, plan comparison, an application form, an onboarding wizard opened by a one-time link, and a platform panel that manages companies, subscriptions and payments."
    - "I guaranteed in two layers that one company's data is never visible to another: services filter by company, and PostgreSQL row-level security (RLS) never returns another company's rows. The app refuses to start if a table is left unprotected, and I closed traps such as the superuser that bypasses RLS and company context lingering in the connection pool."
    - "I tied the code rules to the build instead of leaving them in a document: files are capped at 200 lines and functions at 30, ESLint and Checkstyle enforce layer and library boundaries, and code that breaks a rule does not compile. This is what kept AI-assisted code consistent at speed."
    - "I simplified the materials module, which had grown into a warehouse management system (7 movement types, 8 statuses, 13 filters), into a shipment log: one shipment is one truck, with one destination and one waybill. The module's backend went from 3,622 to 2,336 lines; the commit I am proudest of in this project is one that removed things."
    - "We rebuilt the working first version of attendance around the real question: “How many days do we pay each person at the end of the month?” The site manager marks one company-wide list each morning, subcontractors are counted as crews, an unmarked day never turns into “absent” on its own, and the monthly timesheet is ready as an Excel file."
    - "We built two separate interfaces, Vant for the phone and Element Plus for the desktop, while the business logic is written once in a shared layer that ESLint keeps free of UI libraries. For weak signal on site there is an upload queue, photo compression on the phone and an app that opens from cache."
    - "I kept sessions on the server instead of using JWTs, because when an owner removes someone from the company, that person's session has to end immediately. The cookie is HttpOnly and SameSite=Strict, the database stores only a SHA-256 hash of the token, and cross-origin write requests are rejected using the Sec-Fetch-Site header."
    - "On free hosting the backend fell asleep and the database expired, so anyone reviewing the project saw a blank page. I built a fake backend that runs in the browser without touching the screens' code, so the live demo opens instantly. For anyone who wants the real system, one command is enough: ./scripts/start.sh sets everything up in Docker."
problem:
  tr: "Türkiye'de müteahhitlerin çoğu şantiyelerini WhatsApp gruplarıyla yönetiyor. WhatsApp mesajlaşmak için harika ama bir şantiyeyi yönetmeye yetmiyor: üç hafta önce dökülen kolonun fotoğrafı yüzlerce mesajın arasında kayboluyor, bugün hangi şantiyeden hiç haber gelmediğini kimse fark etmiyor, puantaj ay sonunda defterden ve hafızadan toplanıyor, hangi kamyonun hangi şantiyeye kaç torba çimento götürdüğünün izi kalmıyor."
  en: "Most contractors in Turkey run their sites through WhatsApp groups. WhatsApp is great for messaging but not enough to manage a construction site: the photo of a column poured three weeks ago gets lost among hundreds of messages, nobody notices which site has sent no news today, timesheets are pieced together from notebooks and memory at the end of the month, and there is no record of which truck took how many bags of cement to which site."
benefit:
  tr: "Patron bütün şantiyelerini, kimin işe geldiğini ve nereye ne malzeme gittiğini telefonundan bir bakışta görüyor. Şef yoklamayı ve günlük ilerlemeyi birkaç dokunuşla giriyor; çalışan fotoğraf atıyor, sorun bildiriyor ve kendi puantajını görüyor. Uygulama yine bir sohbet grubu gibi göründüğü için kimsenin baştan bir şey öğrenmesi gerekmiyor, ay sonunda da puantaj Excel'i hazır oluyor."
  en: "The owner sees every site, who showed up and where materials went at a glance from the phone. The site manager enters attendance and daily progress in a few taps; workers send photos, report problems and see their own timesheet. Because the app still looks like a group chat, nobody has to learn anything new, and the monthly timesheet is ready as an Excel file."
role:
  tr: "Ekip arkadaşım Musa Kusbey ile iki kişilik bir ekiptik; ben ürün sahibi ve full-stack geliştiriciydim. Ürünün yönüne, kod kurallarına ve modüllerin çoğunun tasarımına ben karar verdim; her değişikliği tarayıcıda deneyip kabul ettim, dalları birleştirdim ve ürünü yayına aldım. Kodun önemli bir kısmını yapay zekâyla (Claude Code) birlikte, derlemede denetlenen kurallar altında yazdık."
  en: "My teammate Musa Kusbey and I were a two-person team; I was the product owner and a full-stack developer. I decided the product direction, the code rules and the design of most modules, tried every change in the browser before accepting it, merged the branches and shipped the product. We wrote a significant part of the code with an AI assistant (Claude Code), under rules enforced at build time."
technologies:
  - Java 25
  - Spring Boot 4
  - PostgreSQL 18
  - Vue 3
  - TypeScript
  - Flyway
  - Docker
  - Testcontainers
  - Playwright
  - Element Plus
  - Vant
icon: construction
color: indigo
cover: /images/projects/constructor-erp/kapak.webp
coverAlt:
  tr: "Constructor ERP: bilgisayarda taşeron ilerleme takibi, telefonda fotoğraflı şantiye sohbeti"
  en: "Constructor ERP: subcontractor progress tracking on the desktop and a site chat with photos on the phone"
gallery:
  - image: /images/projects/constructor-erp/telefon.webp
    alt:
      tr: "Telefon arayüzü: şantiye listesi, fotoğraflı şantiye sohbeti ve çalışanın kendi puantajı"
      en: "Phone interface: the site list, a site chat with photos and a worker's own timesheet"
  - image: /images/projects/constructor-erp/santiye-sohbet.webp
    alt:
      tr: "Bilgisayarda şantiye sohbeti: sabitlenmiş kurallar, fotoğraflı saha mesajı ve okunmamış mesajlar"
      en: "Site chat on the desktop: pinned rules, a field update with a photo and unread messages"
  - image: /images/projects/constructor-erp/ilerleme.webp
    alt:
      tr: "İlerleme takibi: taşeronların iş kalemleri, gerçekleşen miktar ve yüzde"
      en: "Progress tracking: subcontractor work items with the completed quantity and percentage"
  - image: /images/projects/constructor-erp/yoklama.webp
    alt:
      tr: "Yoklama: şef her sabah tek listeyi işaretliyor, mesai ve not ekleyebiliyor"
      en: "Attendance: the site manager marks a single list each morning and can add overtime and notes"
  - image: /images/projects/constructor-erp/malzeme.webp
    alt:
      tr: "Malzeme yönetimi: her sevkiyatın nereden nereye gittiği ve hangi malzemeden ne kadar olduğu"
      en: "Material management: where each shipment went and how much of each material it carried"
  - image: /images/projects/constructor-erp/platform-ozeti.webp
    alt:
      tr: "Platform yönetimi: aktif firmalar, aylık gelir, tahsilat ve yakında bitecek abonelikler"
      en: "Platform admin: active companies, monthly revenue, collections and subscriptions about to expire"
  - image: /images/projects/constructor-erp/demo-giris.webp
    alt:
      tr: "Canlı demonun giriş sayfası: beş rol, şifresiz giriş"
      en: "The live demo's entry page: five roles, no password"
repoUrl: https://github.com/mrfiratatalay/constructor-erp
demoUrl: https://iskeleerp.vercel.app/demo
featured: false
order: 0
published: true
---
