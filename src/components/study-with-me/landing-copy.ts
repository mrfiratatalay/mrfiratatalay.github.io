/**
 * Ürün sayfasının yazıları.
 *
 * Arkadaşın konuşma balonlarındaki cümleler uygulamanın kendi cümleleridir
 * (`App.xcstrings` içindeki `mac.guide.line.*`). Görünüm, saat ve pencere adları ile
 * görünüm açıklamaları da uygulamanın mağaza metinlerinden (`Store.xcstrings`) alındı.
 * Uygulamada bir ad değişirse burada da değişmeli.
 *
 * Sayfada yalnızca doğrulanmış şeyler yazar: abonelik, hesap, reklam, seri ve rozet
 * olmadığı uygulamanın kodundan kontrol edildi. Cihazlar arasında eşitleme olmadığı
 * için sayfa böyle bir izlenim vermez.
 */
export type LandingLanguage = 'tr' | 'en';

/** Odanın üç ışığı. Sıra, güneşe her dokunuşta ilerleyen sıradır. */
export const lights = ['day', 'evening', 'night'] as const;
export type Light = (typeof lights)[number];

/** Hazır görünümler, stüdyodaki sırasıyla. Görsellerin dosya adları bu anahtarlardır. */
export const lookKeys = [
  'coquette', 'library', 'paris', 'school', 'bunny', 'strawberry', 'daisy', 'cat',
  'campus', 'gamer', 'explorer', 'detective', 'barista', 'sailor', 'pilot', 'painter',
] as const;
export type LookKey = (typeof lookKeys)[number];

export const clockKeys = ['ink', 'chalkboard', 'flip-clock', 'retro-digital', 'projection', 'hourglass', 'ceramic'] as const;
export const windowKeys = ['clear', 'starry-night', 'rainy-city', 'thunderstorm', 'night-train', 'northern-lights'] as const;
export const roomKeys = ['rainy-city', 'northern-lights', 'starry-night', 'night-train'] as const;

/** Destek ve gizlilik sayfalarının on iki dili, kendi adlarıyla. */
export const appLanguages = [
  ['tr', 'Türkçe'], ['en', 'English'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español'], ['it', 'Italiano'],
  ['pt-BR', 'Português'], ['ja', '日本語'], ['ko', '한국어'], ['zh-Hans', '简体中文'], ['zh-Hant', '繁體中文'], ['ar', 'العربية'],
] as const;

export const landingCopy = {
  tr: {
    title: 'Tao: Cozy Focus Timer · Odak için küçük bir oda',
    description: 'iPhone, iPad ve Mac için elle çizilmiş bir odak odası. Sayacı başlat, masadaki küçük arkadaşınla birlikte çalış, molada pencere kenarında nefes al.',
    path: '/studywithme/',
    directory: '/uygulamalar/',
    alternate: '/studywithme/en/',
    support: '/studywithme/support/',
    privacy: '/studywithme/privacy/',
    skip: 'İçeriğe geç',
    nav: 'Ürün sayfası',
    supportLabel: 'Destek',
    privacyLabel: 'Gizlilik politikası',
    directoryLabel: 'Uygulamalarım',
    platforms: 'iPhone · iPad · Mac',
    soon: 'Yakında App Store’da',

    kicker: 'Elle çizilmiş bir odak odası',
    heading: ['Odak için', 'küçük bir', 'oda.'],
    intro: 'Sayacı başlat. Masanın başında seninle birlikte çalışan küçük bir arkadaş var. Mola gelince o da kalkar, pencereyi açar.',
    roomAlt: 'Uygulamanın odası: masada defterine yazan arkadaş, duvarda geri sayan sayaç, solda pencere',
    hello: 'aa, merhaba! odama hoş geldin',
    light: {
      idle: 'Odanın ışığı senin saatine göre değişir.',
      now: {
        day: 'Sende saat {time}. Odada da gündüz.',
        evening: 'Sende saat {time}. Odada da akşam, lamba yandı.',
        night: 'Sende saat {time}. Odada da gece.',
      },
      tried: {
        day: 'Şimdi odada gündüz.',
        evening: 'Şimdi odada akşam, lamba yandı.',
        night: 'Şimdi odada gece.',
      },
      hint: {
        day: 'Köşedeki güneşe dokun, akşam olsun.',
        evening: 'Güneşe bir daha dokun, gece olsun.',
        night: 'Köşedeki aya dokun, sabah olsun.',
      },
      button: {
        day: 'Odayı akşam yap',
        evening: 'Odayı gece yap',
        night: 'Odayı gündüz yap',
      },
      reset: 'Kendi saatime dön',
    },

    storyLabel: 'Bir oturum',
    storyTitle: 'Sen çalışırsın, o da çalışır.',
    storyLead: 'Burada sayaç yalnızca bir rakam değil. Her oturumda odada bir şeyler olur.',
    story: [
      {
        title: 'Başlat’a bas',
        body: 'Arkadaşın uyanır, masaya oturur. Sayaç duvarda saymaya başlar.',
        bubble: 'birlikte çalışalım mı?',
        alt: 'Yatağında uyuyan arkadaş, altında başlat düğmesi',
      },
      {
        title: 'Birlikte çalışın',
        body: 'O defterine yazar, sen işine bakarsın. İstediğin an duraklat, kaldığın yerden devam et.',
        bubble: '',
        alt: 'Masada gülümseyerek defterine yazan arkadaş',
      },
      {
        title: 'Zil çalınca mola',
        body: 'Süre dolunca başını kaldırıp sana bakar. Molayı başlat: masadan kalkar, pencereyi açar, gerinir.',
        bubble: 'başardık! mola zamanı?',
        alt: 'Açık pencerenin önünde gözleri kapalı gerinen arkadaş',
      },
      {
        title: 'Akşam olunca lamba',
        body: 'Odadaki ışık gerçek saattir. Gün batarken duvar kararır, masada lambanın ışığı kalır.',
        bubble: '',
        alt: 'Akşam karanlığında lamba ışığıyla çalışan arkadaş',
      },
      {
        title: 'Bitirince uyku',
        body: 'Oturumu bitirdiğinde yatağına girer. Sen dönene kadar orada.',
        bubble: '',
        alt: 'Gece yatağında uyuyan arkadaş',
      },
    ],

    looksLabel: 'Stüdyo',
    looksBubble: 'bana tıkla: beni giydir, odamı süsle!',
    looksTitle: 'Bugün kim olsun?',
    looksBody: 'On altı görünüm var. Birine dokun, nasıl durduğuna bak.',
    looksNote: 'Görünümler stüdyoda tek seferlik satın alınır. Abonelik yok.',
    looksPick: 'Görünümler',
    looks: {
      coquette: ['Romantik', 'Saten fiyonk ve küçük krem fırfırlı yaka.'],
      library: ['Kütüphane', 'Kalp gözlük ve yosun yeşili yumuşak hırka.'],
      paris: ['Paris', 'Çivit bere, kalp gözlük ve fırfırlı yaka.'],
      school: ['Okul', 'Çizgili denizci yakası ve gül kurusu fiyonk.'],
      bunny: ['Tavşan', 'Yumuşak tavşan kulakları ve krem tulum.'],
      strawberry: ['Çilek Bahçesi', 'Çilek bere ve gül kurusu pötikare salopet.'],
      daisy: ['Papatya', 'Papatya tacı ve yumuşak yosun yeşili yaka.'],
      cat: ['Kedi Kulaklık', 'Kedi kulaklı kulaklık ve gül kurusu kazak.'],
      campus: ['Kampüs', 'Çivit şapka ve yosun yeşili kolej ceketi.'],
      gamer: ['Oyuncu', 'Yumuşak kulaklık ve sıcacık kil rengi hoodie.'],
      explorer: ['Gezgin', 'Kum rengi şapka ve bol cepli gezgin yeleği.'],
      detective: ['Dedektif', 'Kahverengi kasket ve kemerli trençkot.'],
      barista: ['Barista', 'Küçük sakal ve yosun yeşili iş önlüğü.'],
      sailor: ['Denizci', 'Krem denizci şapkası ve çivit yaka.'],
      pilot: ['Pilot', 'Uçuş başlığı ve tüylü yakalı uçuş ceketi.'],
      painter: ['Ressam', 'Kil rengi bere ve boya izli krem önlük.'],
    },

    roomsLabel: 'Oda',
    roomsTitle: 'Aynı oda, başka bir akşam.',
    roomsBody: 'Bir lamba, bir perde, masaya bir kupa ya da uyuyan bir kedi. Odayı parça parça kendin kurarsın.',
    rooms: {
      'rainy-city': 'Yağmurlu şehir manzarası, yapraklı saat ve kadife perdeli oda',
      'northern-lights': 'Kuzey ışıkları, kum saati ve yeşil masa lambalı oda',
      'starry-night': 'Yıldızlı gece, kara tahta ve fırfırlı perdeli oda',
      'night-train': 'Gece treni manzarası, duvara yansıyan saat ve masada uyuyan kedili oda',
    },
    clocksBubble: 'saatime tıkla: pomodoro mu, kronometre mi?',
    clocksTitle: 'Yedi saat, tek duvar.',
    clocksBody: 'Pomodoro’da odak ve mola süresini sen belirlersin. Kronometre sıfırdan yukarı sayar, sen durdurana kadar. Hangisini seçersen seç, duvarda nasıl duracağı da sana kalmış.',
    clocks: {
      ink: 'Mürekkep',
      chalkboard: 'Kara Tahta',
      'flip-clock': 'Yapraklı Saat',
      'retro-digital': 'Retro Dijital',
      projection: 'Yansıma',
      hourglass: 'Kum Saati',
      ceramic: 'Seramik Kurmalı Saat',
    },
    windowsTitle: 'Pencerenden ne görünsün?',
    windowsBody: 'Altı manzara var. Yağmurlu bir şehir, geçip giden bir gece treni, kuzey ışıkları…',
    windows: {
      clear: 'Açık',
      'starry-night': 'Yıldızlı Gece',
      'rainy-city': 'Yağmurlu Şehir',
      thunderstorm: 'Fırtına',
      'night-train': 'Gece Treni',
      'northern-lights': 'Kuzey Işıkları',
    },
    soundBubble: 'çalışırken biraz yağmur sesi?',
    soundBody: 'Oda için beş ses var. İstersen hiçbiri: sessizlik de bir seçim.',
    sounds: ['pencere', 'kütüphane', 'yağmur', 'dışarısı, geç saat', 'şömine'],
    roomsNote: 'Saatlerin, manzaraların ve oda eşyalarının bir kısmı stüdyoda tek seferlik satın alınır.',

    notebookLabel: 'Defter',
    notebookBubble: 'bugünün ilk görevini defterime yaz',
    notebookTitle: 'Bugün ne yaptın?',
    notebookBody: 'Yapacaklarını yaz, bitirdiklerinin üstünü çiz. Bitirdiğin her oturum, yaptığın günün takvimine düşer.',
    notebookQuote: 'Burada hiçbir şey birikmez, hiçbir şey tükenmez.',
    tasksAlt: 'Defterin görevler sayfası: dört yapılacak ve üstü çizilmiş bir görev',
    recordAlt: 'Defterin kayıt sayfası: çalışılan günlerin altında sürenin yazdığı bir takvim ve o gün bitirilen iki görev',

    absentTitle: 'Odada olmayanlar',
    absent: ['hesap yok', 'abonelik yok', 'reklam yok', 'seri yok, rozet yok'],
    absentBody: 'Görevlerin, oturum geçmişin ve oda ayarların cihazında saklanır. Uygulamada hesap, analitik ya da çökme raporlaması yok.',

    devicesTitle: 'Çalıştığın yerde yanında.',
    devicesBody: 'iPhone’da cebinde, iPad’de masanda. Mac’te pencereyi kapatsan da sayaç menü çubuğunda saymaya devam eder.',
    devicesMore: ['iPhone’da kilit ekranında canlı sayaç', 'On iki dil'],
    phoneAlt: 'iPhone’da kuzey ışıklı odada çalışan arkadaş',
    padAlt: 'iPad’de gündüz ışığında, yağmurlu şehir manzaralı odada çalışan arkadaş',
    macAlt: 'Mac penceresinde yıldızlı gece manzaralı odada çalışan arkadaş',
    menuAlt: 'Mac menü çubuğundaki panel: sayaç, duraklat ve bitir düğmeleri, küçük oda önizlemesi',

    goodbye: 'oda artık senin. molada pencere başında görüşürüz!',
    closingTitle: 'Yakında App Store’da.',
    status: 'İndirme bağlantısı, Tao: Cozy Focus Timer App Store’da yayımlandığında burada yer alacak.',
    friendAlt: 'Defter sayfasından doğrulmuş, iki patisini kaleme koymuş arkadaş',
    localData: 'Görevlerin ve oturumların cihazında tutulur.',
    trademark: 'iPhone, iPad ve Mac, Apple Inc.’in ABD ve diğer ülkelerde ve bölgelerde tescilli ticari markalarıdır. App Store, Apple Inc.’in hizmet markasıdır.',
  },
  en: {
    title: 'Tao: Cozy Focus Timer · A little room to focus in',
    description: 'A hand-drawn focus room for iPhone, iPad, and Mac. Start the timer, work alongside the little friend at the desk, and take your break by the window.',
    path: '/studywithme/en/',
    directory: '/en/apps/',
    alternate: '/studywithme/',
    support: '/studywithme/en/support/',
    privacy: '/studywithme/en/privacy/',
    skip: 'Skip to content',
    nav: 'Product page',
    supportLabel: 'Support',
    privacyLabel: 'Privacy policy',
    directoryLabel: 'My Apps',
    platforms: 'iPhone · iPad · Mac',
    soon: 'Coming soon to the App Store',

    kicker: 'A hand-drawn focus room',
    heading: ['A little', 'room to', 'focus in.'],
    intro: 'Start the timer. There’s a little friend at the desk, working right along with you. When it’s time for a break, they get up and open the window.',
    roomAlt: 'The app’s room: the friend writing in a notebook at the desk, the timer counting down on the wall, a window on the left',
    hello: 'oh, hi! welcome to my room',
    light: {
      idle: 'The light in the room follows your own clock.',
      now: {
        day: 'It’s {time} where you are. It’s daytime in the room too.',
        evening: 'It’s {time} where you are. Evening in the room too, and the lamp is on.',
        night: 'It’s {time} where you are. Night in the room too.',
      },
      tried: {
        day: 'Now it’s daytime in the room.',
        evening: 'Now it’s evening in the room, and the lamp is on.',
        night: 'Now it’s night in the room.',
      },
      hint: {
        day: 'Tap the sun in the corner to make it evening.',
        evening: 'Tap the sun again to make it night.',
        night: 'Tap the moon in the corner to make it morning.',
      },
      button: {
        day: 'Make it evening in the room',
        evening: 'Make it night in the room',
        night: 'Make it daytime in the room',
      },
      reset: 'Back to my own time',
    },

    storyLabel: 'One session',
    storyTitle: 'You work. So does your friend.',
    storyLead: 'The timer here is more than a number. Something happens in the room every session.',
    story: [
      {
        title: 'Press start',
        body: 'Your friend wakes up and sits down at the desk. The timer starts counting on the wall.',
        bubble: 'shall we study together?',
        alt: 'The friend asleep in bed, with the start button underneath',
      },
      {
        title: 'Work side by side',
        body: 'They write in their notebook while you get on with your work. Pause whenever you need to and pick up where you left off.',
        bubble: '',
        alt: 'The friend smiling and writing in a notebook at the desk',
      },
      {
        title: 'A break when the bell rings',
        body: 'When focus time runs out, your friend looks up at you. Start the break and they get up, open the window and stretch.',
        bubble: 'we did it! break time?',
        alt: 'The friend stretching with eyes closed in front of the open window',
      },
      {
        title: 'A lamp when evening comes',
        body: 'The light in the room is the real hour. As the day fades the walls go dark, and the lamp keeps its light on the desk.',
        bubble: '',
        alt: 'The friend working by lamplight in the dark of the evening',
      },
      {
        title: 'Sleep when you’re done',
        body: 'Stop the session and your friend gets into bed, and stays there until you’re back.',
        bubble: '',
        alt: 'The friend asleep in bed at night',
      },
    ],

    looksLabel: 'The studio',
    looksBubble: 'click me to dress me up and decorate my room',
    looksTitle: 'Who are we today?',
    looksBody: 'There are sixteen looks. Tap one to see how it sits.',
    looksNote: 'Looks are one-time purchases in the studio. There’s no subscription.',
    looksPick: 'Looks',
    looks: {
      coquette: ['Coquette', 'A satin bow and a little cream ruffle.'],
      library: ['Library', 'Heart glasses and a soft moss cardigan.'],
      paris: ['Paris', 'An indigo beret, heart glasses and ruffles.'],
      school: ['School', 'A rose bow with a striped sailor collar.'],
      bunny: ['Bunny', 'Soft bunny ears and a cream romper.'],
      strawberry: ['Strawberry Garden', 'A berry beret and rose gingham overalls.'],
      daisy: ['Daisy', 'A daisy crown and a soft moss collar.'],
      cat: ['Cat Listener', 'Cat-ear headphones and a rose pullover.'],
      campus: ['Campus', 'An indigo cap and a moss varsity jacket.'],
      gamer: ['Gamer', 'Soft headphones and a cosy clay hoodie.'],
      explorer: ['Explorer', 'A sand bucket hat and a pocketed vest.'],
      detective: ['Detective', 'A brown newsboy cap and a belted trench.'],
      barista: ['Barista', 'A little beard and a moss work apron.'],
      sailor: ['Sailor', 'A cream sailor hat and an indigo collar.'],
      pilot: ['Pilot', 'A flying cap and a fleece-collared jacket.'],
      painter: ['Painter', 'A clay beret and a paint-marked cream smock.'],
    },

    roomsLabel: 'The room',
    roomsTitle: 'Same room, a different evening.',
    roomsBody: 'A lamp, a curtain, a mug on the desk or a sleeping cat. You put the room together piece by piece.',
    rooms: {
      'rainy-city': 'A room with a rainy city view, a flip clock and velvet curtains',
      'northern-lights': 'A room with the northern lights, an hourglass and a green desk lamp',
      'starry-night': 'A room with a starry night, a chalkboard and ruffled curtains',
      'night-train': 'A room with a night train view, the time projected on the wall and a cat asleep on the desk',
    },
    clocksBubble: 'click my clock: pomodoro or stopwatch?',
    clocksTitle: 'Seven clocks, one wall.',
    clocksBody: 'In Pomodoro you choose how long focus and breaks last. The stopwatch counts up from zero until you stop it. Either way, how it looks on the wall is up to you.',
    clocks: {
      ink: 'Ink',
      chalkboard: 'Chalkboard',
      'flip-clock': 'Flip Clock',
      'retro-digital': 'Retro Digital',
      projection: 'Projection',
      hourglass: 'Hourglass',
      ceramic: 'Ceramic Timer',
    },
    windowsTitle: 'What’s outside your window?',
    windowsBody: 'There are six views. A rainy city, a night train going by, the northern lights…',
    windows: {
      clear: 'Clear',
      'starry-night': 'Starry Night',
      'rainy-city': 'Rainy City',
      thunderstorm: 'Thunderstorm',
      'night-train': 'Night Train',
      'northern-lights': 'Northern Lights',
    },
    soundBubble: 'a little rain while we work?',
    soundBody: 'There are five sounds for the room. Or none at all: silence is a choice too.',
    sounds: ['the window', 'library', 'rain', 'outside, late', 'fireplace'],
    roomsNote: 'Some clocks, views and room items are one-time purchases in the studio.',

    notebookLabel: 'The notebook',
    notebookBubble: 'write today’s first task in my notebook',
    notebookTitle: 'What did you get done today?',
    notebookBody: 'Write down what you mean to do and cross off what you finish. Every session you finish lands on the day you did it.',
    notebookQuote: 'Nothing here counts up, and nothing runs out.',
    tasksAlt: 'The notebook’s tasks page: four things to do and one crossed off',
    recordAlt: 'The notebook’s record page: a calendar with the time worked written under each day, and two tasks finished that day',

    absentTitle: 'Not in the room',
    absent: ['no account', 'no subscription', 'no ads', 'no streaks, no badges'],
    absentBody: 'Your tasks, session history and room settings are stored on your device. There are no accounts, analytics or crash reporting in the app.',

    devicesTitle: 'A little company wherever you work.',
    devicesBody: 'In your pocket on iPhone, on your desk on iPad. On Mac the timer keeps counting in the menu bar even after you close the window.',
    devicesMore: ['A live timer on the iPhone Lock Screen', 'Twelve languages'],
    phoneAlt: 'The friend working on iPhone in a room with the northern lights',
    padAlt: 'The friend working on iPad in daylight, in a room with a rainy city view',
    macAlt: 'The friend working in a Mac window, in a room with a starry night view',
    menuAlt: 'The Mac menu bar panel: the timer, pause and stop buttons, and a small preview of the room',

    goodbye: 'the room is yours now. see you at the window on your break!',
    closingTitle: 'Coming soon to the App Store.',
    status: 'The download link will appear here when Tao: Cozy Focus Timer is released on the App Store.',
    friendAlt: 'The friend risen from a notebook page, with both paws resting on a pencil',
    localData: 'Your tasks and sessions are stored on your device.',
    trademark: 'iPhone, iPad, and Mac are trademarks of Apple Inc., registered in the U.S. and other countries and regions. App Store is a service mark of Apple Inc.',
  },
} as const;
