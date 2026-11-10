import type { HelpLocale } from '../../lib/studywithme/help-links';

type Section = [heading: string, explanation: string];

interface PrivacyCopy {
  title: string;
  intro: string;
  device: Section;
  purchases: Section;
  removal: Section;
  email: Section;
  website: Section;
}

// The app's PrivacyInfo.xcprivacy and localized About text describe its data
// practices. The website also covers voluntary email and GitHub Pages hosting.
export const privacy: Record<HelpLocale, PrivacyCopy> = {
  tr: {
    title: 'Gizlilik Politikası',
    intro: 'Tao: Cozy Focus Timer, Fırat Atalay’ın iPhone, iPad ve Mac için geliştirdiği bir uygulama. Burada uygulamanın, destek e-postasının ve bu sitenin verileri nasıl işlediğini açıklıyorum.',
    device: ['Cihazında kalanlar', 'Görevlerin, oturum geçmişin, çalışma alışkanlıklarına ilişkin yerel kayıtlar ve oda tercihlerin cihazında saklanır. Bunları bana gönderen bir uygulama sunucusu yok. Uygulama hesap açmanı istemez, analitik, izleme, reklam veya çökme raporlama hizmeti kullanmaz ve oturum verilerini cihazlar arasında eşzamanlamaz.'],
    purchases: ['Satın almalar', 'İşlemleri ve satın almaları geri yüklemeyi Apple, App Store üzerinden yürütür. Uygulama, hangi ürünleri kullanabileceğini doğrulamak için Apple’dan satın alma durumunu okur. Ödeme bilgilerin veya Apple Hesabı parolan bana ulaşmaz.'],
    removal: ['Saklama ve silme', 'Yerel kayıtlar, ilgili uygulama verilerini kaldırana kadar cihazda kalır. iPhone ve iPad’de uygulamayı silmek, cihazdaki uygulama verilerini kaldırır. Mac’te uygulamayı Çöp Sepeti’ne taşımak yerel verileri her zaman silmez. Sistem yedeklerinde verilerin bir kopyası kalabilir ve uygulamayı kaldırmak Apple’ın satın alma kayıtlarını silmez. Yerel verileri kaldırmak için yardıma ihtiyacın olursa bana yazabilirsin.'],
    email: ['Destek e-postası', 'Bana yazarsan adresini, mesajını ve gönderdiğin ekleri talebini yanıtlamak ve takip etmek için kullanırım. Posta hizmetini Gmail sağlar. Yazışmaları talebin ve takibi için gerektiği süre boyunca veya yasal bir saklama zorunluluğu varsa o süre boyunca tutarım. Yazışmanın silinmesini istemek ya da gizlilikle ilgili soru sormak için aynı adrese yazabilirsin.'],
    website: ['Bu internet sitesi', 'Tao: Cozy Focus Timer sayfaları reklam veya ziyaret analitiği kullanmaz. Siteyi barındıran GitHub Pages, güvenlik için ziyaretçilerin IP adreslerini kaydeder. GitHub bu kayıtları kendi gizlilik politikası kapsamında işler.'],
  },
  en: {
    title: 'Privacy Policy',
    intro: 'Tao: Cozy Focus Timer is made by Fırat Atalay for iPhone, iPad, and Mac. This policy covers the app, support email, and this website.',
    device: ['Data on your device', 'The app stores tasks, session history, local records of your study habits, and room preferences on your device. There is no app server that receives them. The app has no accounts, analytics, tracking, advertising, or crash reporting, and does not sync session data across devices.'],
    purchases: ['Purchases', 'Apple handles transactions and purchase restoration through the App Store. The app reads purchase status from Apple to check which items you can use. I do not receive your payment details or Apple Account password.'],
    removal: ['Retention and deletion', 'Local records stay on the device until you remove the relevant app data. Deleting the app on iPhone or iPad removes its data from the device. Moving the app to the Trash on Mac can leave local app data behind. System backups may keep a copy and uninstalling does not erase Apple’s purchase records. Email me if you need help removing local app data.'],
    email: ['Support email', 'If you write to me, I use your email address, message, and any attachments you send to respond and follow up. Gmail provides the mail service. I keep the correspondence as long as needed to handle the request and related follow-up, or as required by law. You can email me to ask for deletion of the correspondence or to ask a privacy question.'],
    website: ['This website', 'The Tao: Cozy Focus Timer pages do not use ads or visitor analytics. GitHub Pages hosts the site and logs visitor IP addresses for security. GitHub handles those records under its own privacy statement.'],
  },
  de: {
    title: 'Datenschutzerklärung',
    intro: 'Tao: Cozy Focus Timer wird von Fırat Atalay für iPhone, iPad und Mac entwickelt. Diese Erklärung gilt für die App, Support-E-Mails und diese Website.',
    device: ['Daten auf deinem Gerät', 'Die App speichert Aufgaben, den Sitzungsverlauf, lokale Angaben zu deinen Lerngewohnheiten und die Zimmer-Einstellungen auf deinem Gerät. Es gibt keinen App-Server, der diese Daten empfängt. Die App verwendet keine Konten, Analysen, Nachverfolgung, Werbung oder Absturzberichte und synchronisiert Sitzungsdaten nicht zwischen Geräten.'],
    purchases: ['Käufe', 'Apple wickelt Käufe und deren Wiederherstellung über den App Store ab. Die App liest bei Apple den Kaufstatus, um zu prüfen, welche Artikel du nutzen kannst. Ich erhalte weder Zahlungsdaten noch das Passwort deines Apple Accounts.'],
    removal: ['Speicherung und Löschung', 'Lokale Daten bleiben auf dem Gerät, bis du die betreffenden App-Daten entfernst. Wenn du die App auf dem iPhone oder iPad löschst, werden ihre Daten vom Gerät entfernt. Auf dem Mac können beim Verschieben der App in den Papierkorb lokale Daten zurückbleiben. Systembackups können eine Kopie enthalten. Die Deinstallation löscht Apples Kaufdaten nicht. Schreib mir, wenn du Hilfe beim Entfernen lokaler App-Daten brauchst.'],
    email: ['Support per E-Mail', 'Wenn du mir schreibst, verwende ich deine E-Mail-Adresse, Nachricht und Anhänge, um dir zu antworten und die Anfrage weiterzuverfolgen. Der Maildienst ist Gmail. Ich bewahre die Korrespondenz so lange auf, wie sie für die Anfrage und ihre Nachbereitung nötig ist oder das Gesetz es verlangt. Du kannst per E-Mail um Löschung bitten oder Fragen zum Datenschutz stellen.'],
    website: ['Diese Website', 'Die Seiten zu Tao: Cozy Focus Timer verwenden keine Werbung und keine Besucheranalyse. GitHub Pages hostet die Website und protokolliert die IP-Adressen von Besuchern zu Sicherheitszwecken. GitHub verarbeitet diese Daten nach seiner eigenen Datenschutzerklärung.'],
  },
  fr: {
    title: 'Politique de confidentialité',
    intro: 'Tao: Cozy Focus Timer est développé par Fırat Atalay pour iPhone, iPad et Mac. Cette politique couvre l’app, les e-mails d’assistance et ce site.',
    device: ['Les données sur ton appareil', 'L’app enregistre tes tâches, l’historique de tes séances, des informations locales sur tes habitudes de travail et tes préférences de pièce sur ton appareil. Aucun serveur de l’app ne reçoit ces données. L’app ne comporte ni compte, ni analyse, ni suivi, ni publicité, ni rapport de plantage, et ne synchronise pas tes séances entre appareils.'],
    purchases: ['Achats', 'Apple gère les transactions et la restauration des achats via l’App Store. L’app vérifie le statut de tes achats auprès d’Apple pour savoir quels articles tu peux utiliser. Je ne reçois ni tes données de paiement ni le mot de passe de ton compte Apple.'],
    removal: ['Conservation et suppression', 'Les données locales restent sur l’appareil jusqu’à ce que tu les supprimes. Sur iPhone ou iPad, supprimer l’app efface ses données de l’appareil. Sur Mac, déplacer l’app dans la corbeille peut laisser des données locales. Les sauvegardes du système peuvent en conserver une copie. La désinstallation n’efface pas les achats enregistrés par Apple. Écris-moi si tu as besoin d’aide pour effacer les données locales.'],
    email: ['E-mails d’assistance', 'Si tu m’écris, j’utilise ton adresse, ton message et tes éventuelles pièces jointes pour répondre et suivre ta demande. Gmail fournit le service de messagerie. Je conserve les échanges le temps nécessaire pour traiter et suivre la demande, ou pendant la durée exigée par la loi. Tu peux m’écrire pour demander la suppression des échanges ou poser une question de confidentialité.'],
    website: ['Ce site', 'Les pages Tao: Cozy Focus Timer ne contiennent ni publicité ni analyse d’audience. GitHub Pages héberge le site et consigne les adresses IP des visiteurs pour des raisons de sécurité. GitHub traite ces données selon sa propre politique de confidentialité.'],
  },
  es: {
    title: 'Política de privacidad',
    intro: 'Tao: Cozy Focus Timer es una app de Fırat Atalay para iPhone, iPad y Mac. Esta política cubre la app, el correo de soporte y este sitio web.',
    device: ['Datos en tu dispositivo', 'La app guarda en tu dispositivo las tareas, el historial de sesiones, los registros locales de tus hábitos de estudio y tus preferencias de la habitación. Ningún servidor de la app recibe esos datos. La app no usa cuentas, analítica, seguimiento, publicidad ni informes de fallos, y no sincroniza las sesiones entre dispositivos.'],
    purchases: ['Compras', 'Apple gestiona las transacciones y la restauración de compras a través del App Store. La app consulta el estado de las compras con Apple para saber qué artículos puedes usar. No recibo tus datos de pago ni la contraseña de tu cuenta de Apple.'],
    removal: ['Conservación y eliminación', 'Los registros locales se conservan hasta que borres los datos correspondientes. En el iPhone y el iPad, eliminar la app borra sus datos del dispositivo. En el Mac, mover la app a la papelera puede dejar datos locales. Las copias de seguridad del sistema pueden conservar una copia. La desinstalación no borra el historial de compras de Apple. Escríbeme si necesitas ayuda para borrar datos locales.'],
    email: ['Correo de soporte', 'Si me escribes, uso tu dirección de correo, tu mensaje y los archivos adjuntos que envíes para responder y dar seguimiento. Gmail presta el servicio de correo. Conservo la correspondencia durante el tiempo necesario para atender y seguir la solicitud, o cuando la ley lo exija. Puedes escribirme para pedir que se elimine la correspondencia o preguntar por la privacidad.'],
    website: ['Este sitio web', 'Las páginas de Tao: Cozy Focus Timer no utilizan publicidad ni analítica de visitas. GitHub Pages aloja el sitio y registra las direcciones IP de los visitantes por seguridad. GitHub trata estos registros según su propia declaración de privacidad.'],
  },
  it: {
    title: 'Informativa sulla privacy',
    intro: 'Tao: Cozy Focus Timer è sviluppata da Fırat Atalay per iPhone, iPad e Mac. Questa informativa riguarda l’app, l’assistenza via email e questo sito.',
    device: ['Dati sul tuo dispositivo', 'L’app salva sul dispositivo le attività, la cronologia delle sessioni, i dati locali sulle tue abitudini di studio e le preferenze della stanza. Nessun server dell’app riceve questi dati. L’app non usa account, analisi, tracciamento, pubblicità o segnalazioni di arresti anomali, e non sincronizza le sessioni tra dispositivi.'],
    purchases: ['Acquisti', 'Apple gestisce le transazioni e il ripristino degli acquisti tramite App Store. L’app legge lo stato degli acquisti da Apple per verificare quali articoli puoi usare. Non ricevo i tuoi dati di pagamento o la password del tuo Apple Account.'],
    removal: ['Conservazione e cancellazione', 'I dati locali rimangono sul dispositivo finché non li rimuovi. Eliminare l’app da iPhone o iPad ne rimuove i dati dal dispositivo. Su Mac, spostare l’app nel Cestino può lasciare dati locali. I backup di sistema possono conservarne una copia. La disinstallazione non cancella gli acquisti registrati da Apple. Scrivimi se ti serve aiuto per rimuovere i dati locali.'],
    email: ['Assistenza via email', 'Se mi scrivi, uso il tuo indirizzo, il messaggio e gli eventuali allegati per rispondere e seguire la richiesta. Il servizio di posta è fornito da Gmail. Conservo la corrispondenza per il tempo necessario alla richiesta e al suo seguito, o per il periodo previsto dalla legge. Puoi scrivermi per chiedere la cancellazione della corrispondenza o per domande sulla privacy.'],
    website: ['Questo sito', 'Le pagine di Tao: Cozy Focus Timer non usano pubblicità né analisi delle visite. GitHub Pages ospita il sito e registra gli indirizzi IP dei visitatori per motivi di sicurezza. GitHub tratta questi dati secondo la propria informativa sulla privacy.'],
  },
  'pt-BR': {
    title: 'Política de Privacidade',
    intro: 'Tao: Cozy Focus Timer é desenvolvido por Fırat Atalay para iPhone, iPad e Mac. Esta política cobre o app, o e-mail de suporte e este site.',
    device: ['Dados no seu aparelho', 'O app salva no seu aparelho as tarefas, o histórico de sessões, os registros locais dos seus hábitos de estudo e as preferências do quarto. Nenhum servidor do app recebe esses dados. O app não usa contas, análises, rastreamento, anúncios ou relatórios de falhas e não sincroniza as sessões entre aparelhos.'],
    purchases: ['Compras', 'A Apple processa transações e restaura compras pela App Store. O app lê o estado da compra na Apple para verificar quais itens você pode usar. Não recebo seus dados de pagamento nem a senha da sua Conta Apple.'],
    removal: ['Retenção e exclusão', 'Os dados locais ficam no aparelho até você remover os dados do app. Apagar o app do iPhone ou iPad remove os dados do dispositivo. No Mac, mover o app para o Lixo pode deixar dados locais. Os backups do sistema podem guardar uma cópia. Desinstalar não apaga o histórico de compras da Apple. Escreva se precisar de ajuda para remover os dados locais.'],
    email: ['E-mail de suporte', 'Se você escrever, uso seu endereço, mensagem e eventuais anexos para responder e acompanhar a solicitação. O serviço de e-mail é fornecido pelo Gmail. Guardo a correspondência pelo tempo necessário para atender e acompanhar o pedido, ou conforme exigido por lei. Você pode escrever para pedir a exclusão das mensagens ou fazer perguntas sobre privacidade.'],
    website: ['Este site', 'As páginas de Tao: Cozy Focus Timer não usam anúncios nem análises de visitas. O GitHub Pages hospeda o site e registra os endereços IP dos visitantes por segurança. O GitHub trata esses registros de acordo com sua própria política de privacidade.'],
  },
  ja: {
    title: 'プライバシーポリシー',
    intro: 'Tao: Cozy Focus Timer は Fırat Atalay が iPhone、iPad、Mac 向けに開発しています。このポリシーはアプリ、サポートメール、このウェブサイトに適用されます。',
    device: ['端末に保存されるデータ', 'タスク、セッション履歴、学習習慣に関する記録、部屋の設定は端末に保存されます。これらを受け取るアプリのサーバーはありません。アプリはアカウント、分析、トラッキング、広告、クラッシュ報告を使用せず、セッションデータを端末間で同期しません。'],
    purchases: ['購入', '取引と購入の復元は App Store を通じて Apple が処理します。アプリは利用できるアイテムを確認するため、Apple から購入状況を取得します。お支払い情報や Apple Account のパスワードは私には届きません。'],
    removal: ['保管と削除', '端末上の記録は、該当するアプリデータを削除するまで保存されます。iPhone や iPad でアプリを削除すると、端末上のアプリデータも削除されます。Mac ではアプリをごみ箱に移してもデータが残る場合があります。システムのバックアップにコピーが残ることがあり、アプリを削除しても Apple の購入記録は消えません。端末上のデータを削除する方法については、メールでお問い合わせください。'],
    email: ['サポートメール', 'お問い合わせに返信し、その対応を続けるために、メールアドレス、メッセージ、添付ファイルを使用します。メールサービスは Gmail です。対応に必要な期間、または法律で定められた期間、やり取りを保管します。メールでやり取りの削除を依頼したり、プライバシーについて質問したりできます。'],
    website: ['このウェブサイト', 'Tao: Cozy Focus Timer のページには広告やアクセス解析はありません。ホスティングを提供する GitHub Pages は、セキュリティのため訪問者の IP アドレスを記録します。GitHub はこれらの記録を自社のプライバシーステートメントに従って処理します。'],
  },
  ko: {
    title: '개인정보 처리방침',
    intro: 'Tao: Cozy Focus Timer는 Fırat Atalay가 iPhone, iPad 및 Mac용으로 개발합니다. 이 방침은 앱, 지원 이메일 및 이 웹사이트에 적용됩니다.',
    device: ['기기에 저장되는 데이터', '앱은 할 일, 세션 기록, 공부 습관에 관한 로컬 기록, 방 설정을 기기에 저장합니다. 이 데이터를 받는 앱 서버는 없습니다. 앱은 계정, 분석, 추적, 광고 또는 충돌 보고를 사용하지 않으며 기기 간 세션 데이터를 동기화하지 않습니다.'],
    purchases: ['구입', '거래 및 구입 복원은 Apple이 App Store를 통해 처리합니다. 앱은 사용 가능한 아이템을 확인하기 위해 Apple에서 구입 상태를 확인합니다. 결제 정보나 Apple 계정 암호는 제게 전달되지 않습니다.'],
    removal: ['보관 및 삭제', '로컬 기록은 관련 앱 데이터를 제거할 때까지 기기에 남습니다. iPhone 또는 iPad에서 앱을 삭제하면 기기의 앱 데이터도 삭제됩니다. Mac에서 앱을 휴지통으로 옮겨도 로컬 데이터가 남을 수 있습니다. 시스템 백업에 사본이 남을 수 있으며 앱을 제거해도 Apple의 구입 기록은 지워지지 않습니다. 로컬 데이터 삭제에 도움이 필요하면 이메일을 보내 주세요.'],
    email: ['지원 이메일', '이메일을 보내면 답변 및 후속 처리를 위해 이메일 주소, 메시지, 첨부 파일을 사용합니다. 메일 서비스는 Gmail을 이용합니다. 요청과 후속 처리에 필요한 기간 또는 법에서 요구하는 기간 동안 이메일을 보관합니다. 이메일로 대화 기록 삭제를 요청하거나 개인정보에 대해 문의할 수 있습니다.'],
    website: ['이 웹사이트', 'Tao: Cozy Focus Timer 페이지는 광고나 방문자 분석을 사용하지 않습니다. 사이트를 호스팅하는 GitHub Pages는 보안을 위해 방문자의 IP 주소를 기록합니다. GitHub는 자체 개인정보 처리방침에 따라 해당 기록을 처리합니다.'],
  },
  'zh-Hans': {
    title: '隐私政策',
    intro: 'Tao: Cozy Focus Timer 由 Fırat Atalay 为 iPhone、iPad 和 Mac 开发。本政策适用于应用、支持邮件和本网站。',
    device: ['设备上的数据', '应用将任务、时段记录、学习习惯的本地记录和房间偏好保存在设备上。应用没有接收这些数据的服务器。应用不使用账户、分析、跟踪、广告或崩溃报告，也不在设备之间同步时段数据。'],
    purchases: ['购买', 'Apple 通过 App Store 处理交易和恢复购买。应用从 Apple 读取购买状态，以确认你可以使用哪些物品。我不会收到你的支付信息或 Apple 账户密码。'],
    removal: ['保留和删除', '本地记录会保存在设备上，直至你删除相关应用数据。从 iPhone 或 iPad 删除应用会移除设备上的应用数据。在 Mac 上将应用移到废纸篓后，本地数据可能仍然存在。系统备份可能留有副本，卸载应用不会删除 Apple 的购买记录。若需要协助删除本地数据，可以给我发邮件。'],
    email: ['支持邮件', '如果你发邮件给我，我会使用你的邮箱地址、邮件内容及附件来回复并跟进你的请求。邮件服务由 Gmail 提供。我会在处理和跟进请求所需的时间内保存往来邮件，或根据法律要求予以保留。你可以发邮件要求删除往来邮件，或咨询隐私问题。'],
    website: ['本网站', 'Tao: Cozy Focus Timer 页面不使用广告或访客分析。网站由 GitHub Pages 托管。为保障安全，GitHub Pages 会记录访客的 IP 地址，并按照 GitHub 自己的隐私声明处理这些记录。'],
  },
  'zh-Hant': {
    title: '隱私權政策',
    intro: 'Tao: Cozy Focus Timer 由 Fırat Atalay 為 iPhone、iPad 和 Mac 開發。本政策適用於 App、支援郵件和本網站。',
    device: ['裝置上的資料', 'App 將任務、時段記錄、學習習慣的本機記錄和房間偏好儲存在裝置上。App 沒有接收這些資料的伺服器。App 不使用帳號、分析、追蹤、廣告或當機回報，也不在裝置之間同步時段資料。'],
    purchases: ['購買', 'Apple 透過 App Store 處理交易與還原購買項目。App 會向 Apple 讀取購買狀態，確認你可以使用哪些物品。我不會收到你的付款資料或 Apple 帳號密碼。'],
    removal: ['保存與刪除', '本機記錄會留在裝置上，直到你移除相關 App 資料。在 iPhone 或 iPad 上刪除 App 會移除裝置上的 App 資料。在 Mac 上將 App 移到垃圾桶後，本機資料可能仍然存在。系統備份可能保留副本，解除安裝 App 不會刪除 Apple 的購買記錄。若需要移除本機資料的協助，可以寄信給我。'],
    email: ['支援郵件', '如果你寄信給我，我會使用你的電子郵件地址、訊息與附件來回覆及跟進你的請求。郵件服務由 Gmail 提供。往來郵件會保留到請求及後續處理完成，或依法律要求保存。你可以寄信要求刪除往來郵件，或提出隱私問題。'],
    website: ['本網站', 'Tao: Cozy Focus Timer 頁面不使用廣告或訪客分析。網站由 GitHub Pages 託管。為了安全，GitHub Pages 會記錄訪客的 IP 位址，並依 GitHub 自己的隱私權聲明處理這些記錄。'],
  },
  ar: {
    title: 'سياسة الخصوصية',
    intro: 'طوّر Fırat Atalay تطبيق Tao: Cozy Focus Timer لأجهزة iPhone وiPad وMac. تغطي هذه السياسة التطبيق وبريد الدعم وهذا الموقع.',
    device: ['البيانات على جهازك', 'يحفظ التطبيق مهامك وسجل جلساتك وسجلات عادات الدراسة المحلية وتفضيلات الغرفة على جهازك. لا يوجد خادم للتطبيق يستقبل هذه البيانات. لا يستخدم التطبيق حسابات أو تحليلات أو تتبعًا أو إعلانات أو تقارير أعطال، ولا يزامن بيانات الجلسات بين الأجهزة.'],
    purchases: ['المشتريات', 'تدير Apple المعاملات واستعادة المشتريات عبر App Store. يقرأ التطبيق حالة الشراء من Apple للتحقق من العناصر التي يمكنك استخدامها. لا أتلقى تفاصيل الدفع أو كلمة مرور حساب Apple الخاص بك.'],
    removal: ['الاحتفاظ والحذف', 'تبقى السجلات المحلية على جهازك حتى تحذف بيانات التطبيق ذات الصلة. يؤدي حذف التطبيق من iPhone أو iPad إلى إزالة بياناته من الجهاز. وقد تبقى بعض البيانات المحلية عند نقل التطبيق إلى سلة المهملات على Mac. قد تحتفظ النسخ الاحتياطية للنظام بنسخة، ولا يؤدي إلغاء التثبيت إلى حذف سجلات الشراء لدى Apple. راسلني إذا احتجت إلى مساعدة في إزالة البيانات المحلية.'],
    email: ['بريد الدعم', 'إذا راسلتني، أستخدم عنوان بريدك ورسالتك ومرفقاتك للرد على طلبك ومتابعته. توفر Gmail خدمة البريد. أحتفظ بالمراسلات طوال المدة اللازمة للرد والمتابعة أو وفقًا لما يتطلبه القانون. يمكنك مراسلتي لطلب حذف المراسلات أو لطرح سؤال حول الخصوصية.'],
    website: ['هذا الموقع', 'لا تستخدم صفحات Tao: Cozy Focus Timer الإعلانات أو تحليلات الزيارات. تستضيف GitHub Pages الموقع وتسجّل عناوين IP للزوار لأغراض الأمان. تعالج GitHub هذه السجلات وفقًا لبيان الخصوصية الخاص بها.'],
  },
};
