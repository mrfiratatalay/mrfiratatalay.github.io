import type { RushlineLocale } from '../../lib/rushline/help-links';

type Section = [heading: string, explanation: string];

interface HelpCopy {
  support: {
    title: string;
    intro: string;
    contactTitle: string;
    contactDetails: string;
    guides: Section[];
  };
  privacy: {
    title: string;
    intro: string;
    sections: Section[];
  };
  appleHelp: string;
  back: string;
  other: string;
}

/*
 * Oyunun PrivacyInfo.xcprivacy dosyası veri toplamadığını ve izleme yapmadığını söyler.
 * Oyunda ağ isteği, hesap, analitik, reklam ve çökme raporu yoktur; ilerleme cihazda
 * (UserDefaults) tutulur, satın almaları StoreKit ile Apple yürütür. Ayar adları oyundaki
 * Türkçe ve İngilizce metinlerdir.
 */
export const help: Record<RushlineLocale, HelpCopy> = {
  tr: {
    support: {
      title: 'Destek',
      intro: 'Sürüşte, kontrollerde ya da bir satın almada takıldıysan buradan başla.',
      contactTitle: 'Bana yaz',
      contactDetails: 'iPhone modelini, iOS sürümünü ve sorunun hangi ekranda, hangi adımda çıktığını yaz. Ekran görüntüsü eklersen kişisel bilgilerini gizle. Parola ya da ödeme bilgisi gönderme.',
      guides: [
        ['Motor kendi kendine bir yana kayıyor', 'Ayarlar’daki KONTROLLER bölümünden “Mevcut eğimi nötr kabul et”e dokun ya da “Başlangıçta otomatik kalibre et”i aç. Telefonu en rahat tuttuğun açıda tutarken yap. Hassasiyet ayarıyla motorun ne kadar keskin döneceğini değiştirebilirsin.'],
        ['Eğmek yerine parmakla sürmek istiyorum', 'Ayarlar’da kontrol modunu “Sürükle” yap. Ekrana basıp parmağını sağa sola kaydırdığında motor parmağını izler; basılı tutmak yine gazdır.'],
        ['Nasıl fren yaparım?', 'Gaz için basılı tuttuğun parmak ekrandayken ikinci bir parmağını ekrana koy. Parmağını kaldırırsan motor kendi kendine yavaşlar.'],
        ['Ses ya da müzik gelmiyor', 'Ayarlar’da sesin açık olduğunu ve müzik ile efekt seviyelerini kontrol et. iPhone’un ses düzeyini ve sessiz modunu da kontrol et.'],
        ['Satın aldığım motor ya da jeton nerede?', 'App Store’a satın alırken kullandığın Apple Hesabı ile giriş yaptığından emin ol. Ayarlar’daki SATIN ALIMLAR bölümünde “Satın alımları geri yükle”ye dokun. Jeton paketleri geri yüklenemez, ama aldığın anda hesabına eklenir.'],
      ],
    },
    privacy: {
      title: 'Gizlilik Politikası',
      intro: 'Rushline, Fırat Atalay’ın iPhone için geliştirdiği bir oyun. Burada oyunun, destek e-postasının ve bu sitenin verileri nasıl işlediğini açıklıyorum.',
      sections: [
        ['Cihazında kalanlar', 'Skorların, rekorların, jetonların, açtığın motorlar, kariyer yıldızları, günlük görevler ve ayarların yalnızca telefonunda saklanır. Oyun internete bağlanmaz ve bunları bana gönderen bir sunucu yoktur. Hesap açmanı istemez; analitik, izleme, reklam veya çökme raporlama hizmeti kullanmaz.'],
        ['Hareket sensörü', 'Eğerek sürmek için oyun, iPhone’un hareket sensöründen telefonun eğimini okur. Bu bilgi yalnızca sürüş sırasında motoru yönlendirmek için kullanılır; kaydedilmez ve telefondan çıkmaz.'],
        ['Satın almalar', 'Satın almaları ve geri yüklemeyi Apple, App Store üzerinden yürütür. Oyun, hangi ürünlerin senin olduğunu görmek için satın alma durumunu Apple’dan okur. Ödeme bilgilerin veya Apple Hesabı parolan bana ulaşmaz.'],
        ['Paylaşma', 'PAYLAŞ düğmesi, skorunu iPhone’un kendi paylaşım ekranına bırakır. Neyi, kiminle, hangi uygulamayla paylaşacağını sen seçersin; oyun bunu bana iletmez.'],
        ['Saklama ve silme', 'Oyunun verileri, oyunu silene kadar telefonunda kalır; oyunu silmek bu verileri telefondan kaldırır. iCloud veya bilgisayar yedeklerinde bir kopyası kalabilir. Oyunu silmek Apple’daki satın alma kayıtlarını silmez.'],
        ['Destek e-postası', 'Bana yazarsan adresini, mesajını ve eklerini yalnızca talebini yanıtlamak ve takip etmek için kullanırım. Posta hizmetini Gmail sağlar. Yazışmayı talep için gerektiği kadar ya da yasa gerektiriyorsa o süre boyunca saklarım. Silinmesini istemek için aynı adrese yazabilirsin.'],
        ['Bu internet sitesi', 'Rushline sayfaları reklam veya ziyaret analitiği kullanmaz. Siteyi barındıran GitHub Pages, güvenlik için ziyaretçilerin IP adreslerini kaydeder ve bu kayıtları kendi gizlilik politikasına göre işler.'],
        ['Çocuklar', 'Oyun kimseden kişisel bilgi toplamaz; bu çocuklar için de geçerlidir.'],
      ],
    },
    appleHelp: 'Apple’ın satın alma yardımı',
    back: 'Rushline’a dön',
    other: 'English',
  },
  en: {
    support: {
      title: 'Support',
      intro: 'Start here if you are stuck on a ride, the controls or something you bought.',
      contactTitle: 'Write to me',
      contactDetails: 'Include your iPhone model, iOS version and the screen and step where the problem showed up. Hide personal details in screenshots. Please leave out passwords and payment information.',
      guides: [
        ['The bike drifts to one side on its own', 'In Settings, under CONTROLS, tap “Use current tilt as neutral” or turn on “Auto-calibrate at start”. Hold the phone at the angle you like while you do it. Sensitivity changes how sharply the bike turns.'],
        ['I want to steer with my finger instead of tilting', 'Set the control mode to “Drag” in Settings. Press the screen and slide your finger left and right; the bike follows it, and holding still opens the throttle.'],
        ['How do I brake?', 'While your throttle finger is on the screen, put a second finger down. Lift your finger and the bike slows down by itself.'],
        ['No sound or music', 'Check that sound is on in Settings, along with the music and effects levels. Check the iPhone’s volume and silent mode as well.'],
        ['Where is the bike or coins I bought?', 'Make sure you are signed in to the App Store with the Apple Account you bought with. In Settings, under PURCHASES, tap “Restore purchases”. Coin packs cannot be restored, but they are added the moment you buy them.'],
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      intro: 'Rushline is a game made by Fırat Atalay for iPhone. This policy covers the game, support email and this website.',
      sections: [
        ['Data on your device', 'Your scores, records, coins, unlocked bikes, career stars, daily tasks and settings are stored only on your phone. The game does not connect to the internet and there is no server that receives them. There are no accounts, analytics, tracking, advertising or crash reporting.'],
        ['Motion sensor', 'To steer by tilting, the game reads your phone’s tilt from the iPhone motion sensor. It is used only to steer the bike during a ride; it is not stored and never leaves the phone.'],
        ['Purchases', 'Apple handles purchases and restoring them through the App Store. The game reads purchase status from Apple to see which items are yours. I do not receive your payment details or Apple Account password.'],
        ['Sharing', 'The SHARE button hands your score to the iPhone’s own share sheet. You choose what to share, with whom and in which app; the game does not send it to me.'],
        ['Retention and deletion', 'The game’s data stays on your phone until you delete the game; deleting it removes the data from the phone. iCloud or computer backups may keep a copy. Deleting the game does not erase Apple’s purchase records.'],
        ['Support email', 'If you write to me, I use your address, message and attachments only to answer and follow up on your request. Gmail provides the mail service. I keep the correspondence as long as the request needs, or as long as the law requires. Write to the same address to ask for deletion.'],
        ['This website', 'The Rushline pages use no ads or visitor analytics. GitHub Pages hosts the site, logs visitor IP addresses for security and handles those records under its own privacy statement.'],
        ['Children', 'The game collects no personal information from anyone, children included.'],
      ],
    },
    appleHelp: 'Apple’s purchase help',
    back: 'Back to Rushline',
    other: 'Türkçe',
  },
};
