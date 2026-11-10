import type { HelpLocale } from '../../lib/studywithme/help-links';

interface SupportCopy {
  title: string;
  intro: string;
  contactTitle: string;
  contactDetails: string;
  appleHelp: string;
  guides: [heading: string, explanation: string][];
}

export const support: Record<HelpLocale, SupportCopy> = {
  tr: {
    title: 'Destek',
    intro: 'Oturum, ses veya satın alma konusunda takıldığında buradan başlayabilirsin.',
    contactTitle: 'Bir not bırak',
    contactDetails: 'Cihaz modelini, işletim sistemi ve uygulama sürümünü, sorunun hangi adımda çıktığını yaz. Ekran görüntüsü gönderirsen kişisel bilgilerini gizle. Parola veya ödeme bilgisi gönderme.',
    appleHelp: 'Apple’ın satın alma yardımı',
    guides: [
      ['Süreyi nasıl değiştiririm?', 'Odada saate dokun veya tıkla. Pomodoro’yu seçip odak ve mola sürelerini ayarla. Kronometre ileri doğru sayar. Odada yuvarlak düğmeyle başlatıp duraklatabilirsin. Mac’te sayaç menü çubuğundan da kullanılabilir.'],
      ['Mola neden kendi kendine başlamadı?', 'Otomatik devam kapalıysa, odak süresi bitince mola hazır bekler. Yuvarlak düğmeyle başlat. Her aşamanın kendiliğinden başlamasını istiyorsan oturum ayarlarından otomatik devamı aç.'],
      ['Bitiş sesi veya bildirim gelmiyor', 'Defteri açıp Ayarlar’daki ses bölümünden oturum bitiş sesinin açık olduğunu kontrol et. iPhone, iPad veya Mac’in sistem ayarlarında uygulama için bildirim iznini, ses ayarını ve etkin Odak modunu kontrol et.'],
      ['Satın aldığım öğe nerede?', 'Satın alırken kullandığın Apple Hesabı ile App Store’a giriş yap. Defterde Stüdyo’yu aç, ürün listesinin sonuna kaydır ve “satın almaları geri yükle”yi seç. Ardından öğeyi Stüdyo’da tekrar kontrol et.'],
    ],
  },
  en: {
    title: 'Support',
    intro: 'Start here if you need a hand with a session, sound, or something you bought.',
    contactTitle: 'Leave a note',
    contactDetails: 'Include your device model, system and app versions, and what you did just before the issue. Hide personal details in screenshots. Please leave out passwords and payment information.',
    appleHelp: 'Apple’s purchase help',
    guides: [
      ['How do I change the timer?', 'Tap or click the clock in the room. Choose Pomodoro and set your focus and break lengths, or choose Stopwatch to count up. Start and pause with the round button. On Mac, you can also use the timer from the menu bar.'],
      ['Why is my break waiting?', 'With automatic continuation off, the break waits when focus ends. Use the round button to start it. Turn on automatic continuation in the session settings if you want phases to start on their own.'],
      ['I missed the chime or notification', 'Open the notebook and check the session chime under sound in Settings. In your iPhone, iPad, or Mac system settings, check the app’s notification permissions and alert sound settings. Check any active Focus mode as well.'],
      ['Where is the item I bought?', 'Sign in to the App Store with the Apple Account you used to buy it. Open studio in the notebook, scroll to the end of the product list, and choose “restore purchases.” Check the item in studio again.'],
    ],
  },
  de: {
    title: 'Support',
    intro: 'Hier findest du Hilfe zu Sitzungen, Tönen und Käufen.',
    contactTitle: 'Schreib mir',
    contactDetails: 'Nenne dein Gerät, die System- und App-Version und den Schritt, bei dem das Problem auftrat. Decke persönliche Angaben in Screenshots ab. Schicke keine Passwörter oder Zahlungsdaten.',
    appleHelp: 'Hilfe von Apple zu Käufen',
    guides: [
      ['Wie stelle ich den Timer ein?', 'Tippe oder klicke auf die Uhr im Zimmer. Im Pomodoro-Modus kannst du Fokus- und Pausendauer einstellen. Die Stoppuhr zählt vorwärts. Mit der runden Taste startest oder pausierst du. Auf dem Mac geht das auch über die Menüleiste.'],
      ['Warum startet die Pause nicht?', 'Ohne automatische Fortsetzung wartet die Pause nach der Fokuszeit. Starte sie mit der runden Taste oder aktiviere die automatische Fortsetzung in den Sitzungseinstellungen.'],
      ['Ich höre keinen Ton oder erhalte keine Mitteilung', 'Prüfe im Notizbuch unter Einstellungen und Ton den Sitzungston. Prüfe in den Systemeinstellungen deines iPhone, iPad oder Mac die Mitteilungsberechtigung, die Töne und einen eventuell aktiven Fokusmodus.'],
      ['Wo ist mein gekaufter Artikel?', 'Melde dich im App Store mit dem Apple Account des Kaufs an. Öffne das Studio im Notizbuch, scrolle ans Ende der Produktliste und wähle „Käufe wiederherstellen“. Prüfe den Artikel anschließend erneut im Studio.'],
    ],
  },
  fr: {
    title: 'Assistance',
    intro: 'Une question sur une séance, un son ou un achat ? Commence ici.',
    contactTitle: 'Laisse un mot',
    contactDetails: 'Indique ton appareil, les versions du système et de l’app, et l’étape où le problème apparaît. Masque tes données personnelles dans les captures. N’envoie ni mot de passe ni données de paiement.',
    appleHelp: 'Aide d’Apple pour les achats',
    guides: [
      ['Comment régler le minuteur ?', 'Touche ou clique sur l’horloge de la pièce. En mode Pomodoro, règle la durée de travail et de pause. Le chronomètre compte vers le haut. Le bouton rond sert à démarrer ou mettre en pause. Sur Mac, la barre des menus permet aussi de le faire.'],
      ['Pourquoi la pause attend-elle ?', 'Lorsque la poursuite automatique est désactivée, la pause attend la fin du travail. Démarre-la avec le bouton rond ou active la poursuite automatique dans les réglages de la séance.'],
      ['Je ne reçois ni son ni notification', 'Dans le carnet, vérifie le son de fin de séance dans les réglages audio. Dans les réglages de ton iPhone, iPad ou Mac, vérifie les autorisations de notification, les sons et le mode Concentration en cours.'],
      ['Où est mon article acheté ?', 'Connecte-toi à l’App Store avec le compte Apple utilisé pour l’achat. Ouvre l’atelier dans le carnet, descends au bas de la liste et choisis « restaurer les achats ». Recherche de nouveau ton article dans l’atelier.'],
    ],
  },
  es: {
    title: 'Soporte',
    intro: 'Aquí encontrarás ayuda con las sesiones, el sonido y las compras.',
    contactTitle: 'Déjame una nota',
    contactDetails: 'Indica el modelo del dispositivo, la versión del sistema y de la app, y qué paso produjo el problema. Oculta los datos personales en las capturas. No envíes contraseñas ni datos de pago.',
    appleHelp: 'Ayuda de Apple con las compras',
    guides: [
      ['¿Cómo ajusto el temporizador?', 'Toca o haz clic en el reloj de la habitación. Elige Pomodoro y ajusta la duración de la concentración y del descanso. El cronómetro cuenta hacia adelante. Usa el botón redondo para iniciar o pausar. En Mac también puedes usar la barra de menús.'],
      ['¿Por qué no empieza el descanso?', 'Si la continuación automática está desactivada, el descanso espera al terminar el tiempo de concentración. Inícialo con el botón redondo o activa la continuación automática en los ajustes de sesión.'],
      ['No oigo el aviso o no recibo una notificación', 'Abre el cuaderno y comprueba el sonido de fin de sesión en los ajustes de sonido. En tu iPhone, iPad o Mac, revisa los permisos de notificaciones de la app, los sonidos y el modo de concentración activo.'],
      ['¿Dónde está el artículo que compré?', 'Entra en el App Store con la misma cuenta de Apple de la compra. Abre el taller en el cuaderno, baja hasta el final de la lista y elige «restaurar compras». Vuelve a buscar el artículo en el taller.'],
    ],
  },
  it: {
    title: 'Supporto',
    intro: 'Qui trovi aiuto per le sessioni, i suoni e gli acquisti.',
    contactTitle: 'Lascia un messaggio',
    contactDetails: 'Indica il dispositivo, le versioni del sistema e dell’app e il passaggio in cui si è verificato il problema. Oscura i dati personali nelle schermate. Non inviare password o dati di pagamento.',
    appleHelp: 'Assistenza Apple per gli acquisti',
    guides: [
      ['Come regolo il timer?', 'Tocca o fai clic sull’orologio nella stanza. Scegli Pomodoro e imposta la durata del lavoro e delle pause. Il cronometro conta in avanti. Usa il tasto rotondo per avviare o mettere in pausa. Su Mac puoi usare anche la barra dei menu.'],
      ['Perché la pausa è in attesa?', 'Se la continuazione automatica è disattivata, la pausa attende alla fine del lavoro. Avviala con il tasto rotondo oppure attiva la continuazione automatica nelle impostazioni della sessione.'],
      ['Non sento il suono o non ricevo la notifica', 'Nel quaderno, verifica il suono di fine sessione nelle impostazioni audio. Nelle impostazioni di iPhone, iPad o Mac controlla i permessi per le notifiche dell’app, i suoni e la modalità Full immersion attiva.'],
      ['Dov’è l’articolo che ho comprato?', 'Accedi all’App Store con lo stesso Apple Account usato per l’acquisto. Apri l’atelier nel quaderno, scorri fino in fondo all’elenco e scegli «ripristina acquisti». Cerca di nuovo l’articolo nell’atelier.'],
    ],
  },
  'pt-BR': {
    title: 'Suporte',
    intro: 'Comece por aqui se precisar de ajuda com sessões, sons ou compras.',
    contactTitle: 'Deixe um recado',
    contactDetails: 'Diga qual é o seu aparelho, as versões do sistema e do app e em que etapa o problema aconteceu. Oculte dados pessoais nas capturas de tela. Não envie senhas ou dados de pagamento.',
    appleHelp: 'Ajuda da Apple com compras',
    guides: [
      ['Como ajusto o timer?', 'Toque ou clique no relógio do quarto. Escolha Pomodoro e ajuste a duração do foco e da pausa. O cronômetro conta para frente. Use o botão redondo para iniciar ou pausar. No Mac, também dá para usar a barra de menus.'],
      ['Por que a pausa está esperando?', 'Com a continuação automática desligada, a pausa espera depois do foco. Inicie com o botão redondo ou ligue a continuação automática nos ajustes da sessão.'],
      ['Não ouvi o aviso ou não recebi a notificação', 'Abra o caderno e confira o som de fim da sessão nos ajustes de áudio. Nos ajustes do iPhone, iPad ou Mac, confira a permissão de notificações do app, os sons e o modo Foco ativo.'],
      ['Onde está o item que comprei?', 'Entre na App Store com a mesma Conta Apple usada na compra. Abra o ateliê no caderno, role até o fim da lista e escolha “restaurar compras”. Procure o item novamente no ateliê.'],
    ],
  },
  ja: {
    title: 'サポート',
    intro: 'セッション、音、購入について困ったときは、こちらをご覧ください。',
    contactTitle: 'お問い合わせ',
    contactDetails: 'お使いの機種、OS とアプリのバージョン、問題が起きるまでの操作をお知らせください。スクリーンショットの個人情報は隠し、パスワードや支払い情報は送らないでください。',
    appleHelp: '購入についての Apple サポート',
    guides: [
      ['タイマーの長さを変えるには？', '部屋の時計をタップまたはクリックします。ポモドーロでは集中時間と休憩時間を設定でき、ストップウォッチでは経過時間を計ります。丸いボタンで開始と一時停止ができます。Mac ではメニューバーからも操作できます。'],
      ['休憩が始まらないのはなぜ？', '自動継続がオフの場合、集中時間が終わっても休憩は待機します。丸いボタンで休憩を始めるか、セッション設定で自動継続をオンにしてください。'],
      ['終了音や通知が届かない', 'ノートを開き、設定の音の項目でセッション終了音を確認します。iPhone、iPad、Mac のシステム設定でアプリの通知の許可、通知音、集中モードも確認してください。'],
      ['購入したアイテムが見つからない', '購入時と同じ Apple Account で App Store にサインインします。ノートのスタジオを開き、商品一覧の最後にある「購入を復元」を選びます。スタジオでアイテムをもう一度確認してください。'],
    ],
  },
  ko: {
    title: '지원',
    intro: '세션, 소리, 구입에 관해 도움이 필요할 때 이곳에서 시작하세요.',
    contactTitle: '메시지 보내기',
    contactDetails: '기기 모델, 운영체제와 앱 버전, 문제가 발생한 단계까지의 조작을 알려 주세요. 스크린샷의 개인 정보는 가려 주세요. 암호나 결제 정보는 보내지 마세요.',
    appleHelp: 'Apple 구입 지원',
    guides: [
      ['타이머 시간을 어떻게 바꾸나요?', '방의 시계를 탭하거나 클릭하세요. 포모도로에서 집중 시간과 휴식 시간을 설정할 수 있어요. 스톱워치는 경과 시간을 셉니다. 둥근 버튼으로 시작하거나 일시 정지할 수 있고, Mac에서는 메뉴 막대에서도 조작할 수 있어요.'],
      ['휴식이 왜 시작되지 않나요?', '자동 진행이 꺼져 있으면 집중 시간이 끝난 뒤 휴식이 대기 상태로 남아요. 둥근 버튼을 눌러 시작하거나 세션 설정에서 자동 진행을 켜세요.'],
      ['종료음이 들리지 않거나 알림이 오지 않아요', '노트를 열고 설정의 소리 항목에서 세션 종료음을 확인하세요. iPhone, iPad 또는 Mac의 시스템 설정에서 앱 알림 권한과 알림음, 활성화된 집중 모드도 확인하세요.'],
      ['구입한 아이템은 어디 있나요?', '구입에 사용한 Apple 계정으로 App Store에 로그인하세요. 노트에서 스튜디오를 열고 상품 목록 끝으로 스크롤한 뒤 “구입 복원”을 선택하세요. 스튜디오에서 아이템을 다시 확인하세요.'],
    ],
  },
  'zh-Hans': {
    title: '支持',
    intro: '如果你在专注时段、声音或购买方面需要帮助，可以从这里开始。',
    contactTitle: '给我留言',
    contactDetails: '请提供设备型号、系统和应用版本，以及问题发生前的操作步骤。请遮盖截图中的个人信息，不要发送密码或付款资料。',
    appleHelp: 'Apple 购买支持',
    guides: [
      ['怎样调整计时器？', '轻点或点击房间里的钟。选择番茄钟并设置专注与休息时长，或者选择秒表来正向计时。圆形按钮可开始或暂停。Mac 上也可以从菜单栏操作。'],
      ['为什么休息没有开始？', '关闭自动继续后，专注结束时休息会等你手动开始。轻点圆形按钮，或者在时段设置中开启自动继续。'],
      ['没有听到提示音或收到通知', '打开笔记本，在设置的声音页面检查时段结束提示音。在 iPhone、iPad 或 Mac 的系统设置中检查应用通知权限、通知声音和正在使用的专注模式。'],
      ['在哪里找我买过的物品？', '用购买时的 Apple 账户登录 App Store。打开笔记本中的工作室，滚动到商品列表底部，选择“恢复购买”。然后回到工作室检查物品。'],
    ],
  },
  'zh-Hant': {
    title: '支援',
    intro: '想詢問專注時段、聲音或購買項目，可以從這裡開始。',
    contactTitle: '留張便條',
    contactDetails: '請提供裝置型號、系統與 App 版本，以及問題出現前的操作步驟。請遮住截圖中的個人資料，勿寄送密碼或付款資料。',
    appleHelp: 'Apple 購買支援',
    guides: [
      ['如何調整計時器？', '點一下或按一下房間裡的時鐘。選擇番茄鐘可設定專注與休息時間，選擇碼錶則會正向計時。使用圓形按鈕開始或暫停。Mac 也可以從選單列操作。'],
      ['為什麼休息還沒開始？', '關閉自動繼續時，專注結束後會等待你開始休息。點一下圓形按鈕開始，或在時段設定中開啟自動繼續。'],
      ['沒聽到提示音或收到通知', '打開筆記本，在設定的聲音頁面確認時段結束提示音。在 iPhone、iPad 或 Mac 的系統設定中檢查 App 的通知權限、通知聲音和使用中的專注模式。'],
      ['找不到買過的項目', '用購買時使用的 Apple 帳號登入 App Store。打開筆記本中的工作室，捲到商品列表底部並選擇「還原購買項目」。再到工作室查看。'],
    ],
  },
  ar: {
    title: 'الدعم',
    intro: 'ابدأ من هنا إذا احتجت إلى مساعدة في الجلسات أو الصوت أو المشتريات.',
    contactTitle: 'اترك رسالة',
    contactDetails: 'اذكر طراز جهازك وإصدار النظام والتطبيق والخطوة التي ظهرت فيها المشكلة. أخفِ معلوماتك الشخصية من لقطات الشاشة ولا ترسل كلمات المرور أو بيانات الدفع.',
    appleHelp: 'مساعدة Apple بشأن المشتريات',
    guides: [
      ['كيف أغيّر المؤقت؟', 'اضغط على الساعة في الغرفة. اختر بومودورو لتحديد مدتي التركيز والاستراحة، أو اختر ساعة الإيقاف لعدّ الوقت المنقضي. استخدم الزر الدائري للبدء أو الإيقاف المؤقت. ويمكنك التحكم من شريط القوائم على Mac أيضًا.'],
      ['لماذا لم تبدأ الاستراحة؟', 'عند إيقاف المتابعة التلقائية، تنتظر الاستراحة بعد انتهاء التركيز. ابدأها بالزر الدائري أو فعّل المتابعة التلقائية في إعدادات الجلسة.'],
      ['لم أسمع النغمة أو لم يصل الإشعار', 'افتح الدفتر وتحقق من نغمة نهاية الجلسة في إعدادات الصوت. في إعدادات iPhone أو iPad أو Mac، تحقق من إذن إشعارات التطبيق وأصواتها ونمط التركيز النشط.'],
      ['أين العنصر الذي اشتريته؟', 'سجّل الدخول إلى App Store بحساب Apple الذي استخدمته للشراء. افتح الاستوديو في الدفتر وانتقل إلى آخر قائمة المنتجات واختر «استعادة المشتريات». ثم تحقّق من العنصر في الاستوديو.'],
    ],
  },
};
