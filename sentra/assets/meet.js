// Meet Sentra — interactive guided intro (fully scripted, no AI, no external services
// except a best-effort IP country lookup that silently falls back).
(function () {
  'use strict';
  var root, stage, conv, actionArea, started = false, clockOn = false, detectP = null;
  var flowGen = 0;   // bumped by Skip — pending timeline steps from an older generation die silently
  var state = { lang: 'en', name: '', country: null, city: null, region: null, cc: null };

  /* ---------------- i18n ---------------- */
  var T = {
    en: {
      hi: 'Hi 👋 Welcome to <span class="accent">Sentra</span>.',
      ask_ar: 'Should I switch to Arabic for you?',
      yes: 'Yes — العربية', no: 'No, English is fine',
      ask_name: "Before we start — what's your name?",
      name_ph: 'Type your name…',
      meet: 'Lovely to meet you, <strong>{name}</strong> 😊',
      geo_guess: 'And if I\'m not mistaken, you\'re joining from around <strong>{city}</strong> — {fact}',
      geo_fact_generic: 'a lovely part of the world 🌍',
      hello: 'So — what is Sentra? It\'s a central information center powered by AI. It watches the world\'s real data and gives you exactly the information you need.',
      watch: 'Here is what happens inside, every minute:',
      mind_caption: 'Millions of signals from social, news, TV and the web flow into one mind that classifies and sorts — then AI reads all of it, so you don\'t have to.',
      geo_intro: 'And since you\'re around <strong>{place}</strong> — here\'s what Sentra would set up for it, today:',
      geo_title: '📍 {place} — through Sentra\'s eyes',
      lb_outlets: 'Sources it would ingest first', lb_langs: 'Coverage languages', lb_scopes: 'Your first scopes',
      geo_scope_sector: 'your sector', geo_scope_region: 'the region',
      geo_brief: 'Daily executive brief at <strong>06:00 local time</strong> — in English and Arabic.',
      ask_biz: 'Now tell me, {name} — what is your business? I\'ll show you what Sentra would put on <em>your</em> desk.',
      after_scenario: 'That\'s a taste with sample data — on a live demo you\'ll see it with <strong>your</strong> real world. Want to peek at another desk?',
      again: 'Show me another business', cta_demo: 'Request a live demo', cta_continue: 'Keep exploring the site ↓',
      live: 'Live preview', rx: 'analysing', session: 'live session', send: 'Send',
      skip_intro: 'Skip intro →', name_skip: 'I\'d rather not say',
      meet_anon: 'Happy to have you here 😊',
      ask_biz_anon: 'Now tell me — what is your business? I\'ll show you what Sentra would put on <em>your</em> desk.',
      sc_titles: { gov: '🏛 Government & diplomacy', brand: '🏢 Brand & competitors', aviation: '✈️ Aviation & transport', events: '🏟 Sports & major events', media: '🎙 Media & broadcast', agency: '📣 Agency & communications' },
      lb_rep: 'Reputation Index', lb_sov: 'Share of Voice', lb_alerts: 'Live Alerts', lb_brief: 'Daily Brief — this morning', you: 'You',
      lb_trends: 'Trends Centre', lb_senti: 'Sentiment Analysis', lb_net: 'Entity Network — who drives the story', lb_actions: 'Copilot — recommended actions',
      s_pos: 'positive', s_neu: 'neutral', s_neg: 'negative',
      b_you: 'You act', b_ai: 'AI assists', b_auto: 'Done for you',
      note: 'Illustrative sample data — a live demo shows your real world.'
    },
    ar: {
      hi: 'أهلاً 👋 مرحباً بك في <span class="accent">سنترا</span>.',
      ask_ar: 'هل أنتقل إلى العربية؟', yes: 'نعم — العربية', no: 'English',
      ask_name: 'قبل أن نبدأ — ما اسمك؟', name_ph: 'اكتب اسمك…',
      meet: 'تشرفت بمعرفتك يا <strong>{name}</strong> 😊',
      geo_guess: 'وإن لم أكن مخطئاً، فأنت تنضم إلينا من حوالي <strong>{city}</strong> — {fact}',
      geo_fact_generic: 'بقعة جميلة من العالم 🌍',
      hello: 'إذاً — ما هو سنترا؟ إنه مركز معلومات مدعوم بالذكاء الاصطناعي، يراقب بيانات العالم الحقيقية ويقدّم لك المعلومة التي تحتاجها بالضبط.',
      watch: 'إليك ما يحدث في الداخل، كل دقيقة:',
      mind_caption: 'ملايين الإشارات من وسائل التواصل والأخبار والتلفزيون والإنترنت تتدفق إلى عقل واحد يصنّف ويرتّب — ثم يقرأ الذكاء الاصطناعي كل ذلك، حتى لا تضطر أنت.',
      geo_intro: 'وبما أنك حوالي <strong>{place}</strong> — إليك ما سيجهّزه سنترا لها اليوم:',
      geo_title: '📍 {place} — بعيون سنترا',
      lb_outlets: 'مصادر سيبدأ بها فوراً', lb_langs: 'لغات التغطية', lb_scopes: 'نطاقاتك الأولى',
      geo_scope_sector: 'قطاعك', geo_scope_region: 'المنطقة',
      geo_brief: 'موجز تنفيذي يومي عند <strong>٦:٠٠ صباحاً بتوقيتك المحلي</strong> — بالعربية والإنجليزية.',
      ask_biz: 'الآن أخبرني يا {name} — ما مجال عملك؟ سأريك ما الذي سيضعه سنترا على مكتبك أنت.',
      after_scenario: 'هذه لمحة ببيانات تجريبية — في العرض المباشر سترى عالمك <strong>أنت</strong> الحقيقي. تريد إلقاء نظرة على مكتب آخر؟',
      again: 'أرني مجالاً آخر', cta_demo: 'اطلب عرضاً مباشراً', cta_continue: 'تابع استكشاف الموقع ↓',
      live: 'معاينة حية', rx: 'يحلّل', session: 'جلسة مباشرة', send: 'إرسال',
      skip_intro: 'تخطَّ المقدمة ←', name_skip: 'أفضّل عدم الذكر',
      meet_anon: 'سعدت بوجودك هنا 😊',
      ask_biz_anon: 'الآن أخبرني — ما مجال عملك؟ سأريك ما الذي سيضعه سنترا على مكتبك أنت.',
      sc_titles: { gov: '🏛 الحكومة والدبلوماسية', brand: '🏢 العلامات والمنافسون', aviation: '✈️ الطيران والنقل', events: '🏟 الرياضة والفعاليات الكبرى', media: '🎙 الإعلام والبث', agency: '📣 وكالات الاتصال' },
      lb_rep: 'مؤشر السمعة', lb_sov: 'حصة الصوت', lb_alerts: 'تنبيهات حية', lb_brief: 'الموجز اليومي — هذا الصباح', you: 'أنت',
      lb_trends: 'مركز الاتجاهات', lb_senti: 'تحليل المشاعر', lb_net: 'شبكة الكيانات — من يقود القصة', lb_actions: 'المساعد — إجراءات مقترحة',
      s_pos: 'إيجابي', s_neu: 'محايد', s_neg: 'سلبي',
      b_you: 'قرارك', b_ai: 'الذكاء يساعد', b_auto: 'تم تلقائياً',
      note: 'بيانات توضيحية — العرض المباشر يعرض عالمك الحقيقي.'
    }
  };
  function t(k) { var s = T[state.lang][k]; return s !== undefined ? s : T.en[k]; }
  function fmt(s, vars) { return s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] || ''; }); }

  /* ---------------- city charm & country media (curated, no AI) ---------------- */
  var CITY_FACTS = {
    'istanbul': { en: 'the city of cats and two continents 🐈', ar: 'مدينة القطط والقارتين 🐈' },
    'doha':     { en: 'where the desert meets a skyline of glass 🌆', ar: 'حيث تلتقي الصحراء بأفقٍ من زجاج 🌆' },
    'dubai':    { en: 'the city that builds tomorrow first 🌇', ar: 'المدينة التي تبني الغد أولاً 🌇' },
    'abu dhabi':{ en: 'calm waters and grand ambitions 🕌', ar: 'مياه هادئة وطموحات كبرى 🕌' },
    'riyadh':   { en: 'the heart of the Arabian Peninsula 🏜', ar: 'قلب الجزيرة العربية 🏜' },
    'jeddah':   { en: 'the bride of the Red Sea 🌊', ar: 'عروس البحر الأحمر 🌊' },
    'cairo':    { en: 'the city of a thousand minarets 🕌', ar: 'مدينة الألف مئذنة 🕌' },
    'amman':    { en: 'the white city on seven hills ⛰', ar: 'المدينة البيضاء على سبع تلال ⛰' },
    'kuwait city': { en: 'the pearl of the Gulf 🦪', ar: 'لؤلؤة الخليج 🦪' },
    'manama':   { en: 'an island of a thousand years of trade ⛵', ar: 'جزيرة ألف عام من التجارة ⛵' },
    'muscat':   { en: 'where mountains guard the sea 🏔', ar: 'حيث تحرس الجبال البحر 🏔' },
    'beirut':   { en: 'the city that always rises again 🌅', ar: 'المدينة التي تنهض دائماً من جديد 🌅' },
    'ankara':   { en: 'the steppe capital with a fortress heart 🏰', ar: 'عاصمة السهوب بقلبٍ من قلعة 🏰' },
    'london':   { en: 'home of a thousand newsrooms 🎡', ar: 'موطن ألف غرفة أخبار 🎡' },
    'paris':    { en: 'the city of light ✨', ar: 'مدينة النور ✨' }
  };
  var OUTLETS_CC = {
    QA: ['Al Jazeera','Gulf Times','The Peninsula'], TR: ['Anadolu Agency','TRT','Hürriyet'],
    AE: ['The National','Gulf News','WAM'], SA: ['Al Arabiya','Asharq Al-Awsat','SPA'],
    EG: ['Al-Ahram','Youm7','MENA'], KW: ['KUNA','Al-Qabas'], BH: ['BNA','Gulf Daily News'],
    OM: ['ONA','Times of Oman'], JO: ['Petra','Al Rai'], LB: ['NNA','An-Nahar'],
    GB: ['BBC','Reuters','The Guardian'], US: ['AP','CNN','The New York Times'],
    FR: ['AFP','Le Monde'], DE: ['DPA','Der Spiegel']
  };

  /* ---------------- scenario sample data ---------------- */
  var SCENARIOS = {
    gov: { rep: 74, senti: [41,38,21],
      en: { drv: '▲ summit coverage · ▼ visa story',
        kpis: [['12.4K','Signals today'],['214','Accredited sources'],['3.1K','Mentions of you']],
        trends: [['Regional summit',240],['Visa policy story',95],['Energy talks',38],['Cultural season',-12]],
        ents: { hub: 'Summit narrative', nodes: ['Foreign ministries','Regional bloc','State media','Int\'l press'] },
        acts: [['you','Review the summit brief before the 09:00 press call'],['ai','Response to the visa story — first draft ready for your edit'],['auto','Daily bilingual brief compiled and delivered at 06:00']],
        alerts: [['critical','Regional summit narrative shifting negative','now · 14 accredited sources'],['high','Visa story picked up by international press','38 min ago · 6 new outlets'],['medium','New actor joined the sanctions story','1 hr ago · network updated']],
        sov: [['You',72],['Neighbor state A',54],['Neighbor state B',38]],
        brief: '<strong>3 narratives</strong> need attention today. The summit story gained 6 outlets overnight; sentiment turned after yesterday\'s statement. Talking points are drafted and awaiting review.' },
      ar: { drv: '▲ تغطية القمة · ▼ قصة التأشيرات',
        kpis: [['١٢٫٤ ألف','إشارة اليوم'],['٢١٤','مصدراً معتمداً'],['٣٫١ ألف','إشارة إليك']],
        trends: [['القمة الإقليمية',240],['قصة التأشيرات',95],['محادثات الطاقة',38],['الموسم الثقافي',-12]],
        ents: { hub: 'سردية القمة', nodes: ['وزارات الخارجية','التكتل الإقليمي','الإعلام الرسمي','الصحافة الدولية'] },
        acts: [['you','راجع موجز القمة قبل مؤتمر التاسعة صباحاً'],['ai','الرد على قصة التأشيرات — مسودة أولى جاهزة لتعديلك'],['auto','الموجز اليومي ثنائي اللغة أُعد وسُلّم عند ٦:٠٠']],
        alerts: [['critical','سردية القمة الإقليمية تتحول سلبياً','الآن · ١٤ مصدراً معتمداً'],['high','الصحافة الدولية التقطت قصة التأشيرات','قبل ٣٨ دقيقة · ٦ منافذ جديدة'],['medium','طرف جديد انضم إلى قصة العقوبات','قبل ساعة · تحديث الشبكة']],
        sov: [['أنت',72],['دولة مجاورة أ',54],['دولة مجاورة ب',38]],
        brief: '<strong>٣ سرديات</strong> تحتاج انتباهك اليوم. قصة القمة كسبت ٦ منافذ خلال الليل؛ تحوّلت المشاعر بعد بيان الأمس. نقاط الحديث جاهزة بانتظار المراجعة.' } },
    brand: { rep: 68, senti: [46,32,22],
      en: { drv: '▲ product launch · ▼ pricing complaints',
        kpis: [['8.7K','Mentions today'],['46','Influencers active'],['2.3M','Campaign reach']],
        trends: [['Product launch',310],['Pricing debate',64],['Sustainability angle',22],['Support quality',-18]],
        ents: { hub: 'Launch story', nodes: ['Competitor A','Top influencer','Tech press','Retail partners'] },
        acts: [['you','Approve the response to the pricing thread — draft attached'],['ai','Influencer outreach brief — AI shortlisted 5 profiles'],['auto','Weekly competitor scorecard generated and filed']],
        alerts: [['high','Competitor A launched a campaign in your segment','1 hr ago · 8 influencers amplifying'],['medium','Pricing complaint thread gaining traction','3 hrs ago · sentiment −12%'],['low','Your launch hashtag trending in 2 markets','today · anomaly detector']],
        sov: [['You',44],['Competitor A',51],['Competitor B',29]],
        brief: 'Competitor A out-voiced you this week (<strong>51% vs 44%</strong>) on the launch story. Two influencers drove 60% of it — their profiles and a suggested response are inside.' },
      ar: { drv: '▲ إطلاق المنتج · ▼ شكاوى الأسعار',
        kpis: [['٨٫٧ ألف','إشارة اليوم'],['٤٦','مؤثراً نشطاً'],['٢٫٣ مليون','وصول الحملة']],
        trends: [['إطلاق المنتج',310],['نقاش الأسعار',64],['زاوية الاستدامة',22],['جودة الدعم',-18]],
        ents: { hub: 'قصة الإطلاق', nodes: ['المنافس أ','أبرز المؤثرين','الصحافة التقنية','شركاء التجزئة'] },
        acts: [['you','اعتمد الرد على سلسلة الأسعار — المسودة مرفقة'],['ai','موجز التواصل مع المؤثرين — الذكاء رشّح ٥ ملفات'],['auto','بطاقة أداء المنافسين الأسبوعية أُنشئت وحُفظت']],
        alerts: [['high','المنافس أ أطلق حملة في قطاعك','قبل ساعة · ٨ مؤثرين يضخّمون'],['medium','سلسلة شكاوى الأسعار تكتسب زخماً','قبل ٣ ساعات · المشاعر −١٢٪'],['low','وسم إطلاقك يتصدر في سوقين','اليوم · كاشف الشذوذ']],
        sov: [['أنت',44],['منافس أ',51],['منافس ب',29]],
        brief: 'المنافس أ تفوّق عليك صوتياً هذا الأسبوع (<strong>٥١٪ مقابل ٤٤٪</strong>) في قصة الإطلاق. مؤثران قادا ٦٠٪ منها — ملفاهما ورد مقترح بالداخل.' } },
    aviation: { rep: 81, senti: [52,31,17],
      en: { drv: '▲ route launch praise · ▼ delay reports',
        kpis: [['5.2K','Route mentions'],['18','Markets watched'],['132','Broadcast clips']],
        trends: [['New route praise',180],['Weather delays',140],['Loyalty program',35],['Baggage complaints',-9]],
        ents: { hub: 'Disruption story', nodes: ['Hub airport','Rival carrier A','Travel media','Regulator'] },
        acts: [['you','Approve the holding statement before 21:00'],['ai','Passenger FAQ update — AI drafted from tonight\'s forecast'],['auto','Route sentiment report auto-delivered to operations']],
        alerts: [['critical','Weather disruption trending in 2 hub regions','now · ops + comms flagged'],['medium','Delay complaints clustering on social','25 min ago · 3 airports'],['low','Route launch coverage 92% positive','today · 31 outlets']],
        sov: [['You',58],['Rival carrier A',33],['Rival carrier B',24]],
        brief: 'A disruption story is forming around tonight\'s weather; a <strong>drafted holding statement</strong> is ready. Route launch sentiment is strongly positive across the region.' },
      ar: { drv: '▲ إشادة بالوجهة الجديدة · ▼ تقارير تأخير',
        kpis: [['٥٫٢ ألف','إشارة للوجهات'],['١٨','سوقاً مراقباً'],['١٣٢','مقطع بث']],
        trends: [['إشادة بالوجهة الجديدة',180],['تأخيرات الطقس',140],['برنامج الولاء',35],['شكاوى الأمتعة',-9]],
        ents: { hub: 'قصة الاضطراب', nodes: ['مطار المحور','الناقل المنافس أ','إعلام السفر','الجهة المنظمة'] },
        acts: [['you','اعتمد البيان التمهيدي قبل التاسعة مساءً'],['ai','تحديث أسئلة المسافرين — صاغه الذكاء من توقعات الليلة'],['auto','تقرير مشاعر الوجهات أُرسل تلقائياً للعمليات']],
        alerts: [['critical','اضطراب جوي يتصدر في منطقتي محاور','الآن · تنبيه للعمليات والاتصال'],['medium','شكاوى التأخير تتجمع على وسائل التواصل','قبل ٢٥ دقيقة · ٣ مطارات'],['low','تغطية الوجهة الجديدة ٩٢٪ إيجابية','اليوم · ٣١ منفذاً']],
        sov: [['أنت',58],['ناقل منافس أ',33],['ناقل منافس ب',24]],
        brief: 'قصة اضطراب تتشكل حول طقس الليلة؛ <strong>بيان تمهيدي جاهز</strong>. مشاعر إطلاق الوجهة إيجابية بقوة في المنطقة.' } },
    events: { rep: 77, senti: [58,27,15],
      en: { drv: '▲ ticket demand · ▼ transport concerns',
        kpis: [['15.9K','Event mentions'],['8','Venues monitored'],['12','Languages covered']],
        trends: [['Ticket demand',275],['Opening ceremony',120],['Transport plan',88],['Venue-3 rumor',45]],
        ents: { hub: 'Venue-3 rumor', nodes: ['Organizing committee','City transport','Fan groups','Foreign press'] },
        acts: [['you','Clear the rumor response before the evening session'],['ai','Talking points for the transport Q&A — drafted'],['auto','Stakeholder pulse refreshed every hour']],
        alerts: [['high','Security rumor cluster forming near venue 3','12 min ago · 5 sources converging'],['medium','Transport complaints rising on social','1 hr ago · trend anomaly'],['low','Opening ceremony coverage 88% positive','today · 40+ outlets']],
        sov: [['Your event',66],['Critics cluster',21],['Neutral media',13]],
        brief: 'One rumor cluster needs a response before the evening session — <strong>stakeholder pulse steady</strong>, two accounts shifted tone. The situation map has 3 live pins.' },
      ar: { drv: '▲ إقبال على التذاكر · ▼ مخاوف النقل',
        kpis: [['١٥٫٩ ألف','إشارة للفعالية'],['٨','مواقع مراقبة'],['١٢','لغة مغطاة']],
        trends: [['إقبال التذاكر',275],['حفل الافتتاح',120],['خطة النقل',88],['شائعة الموقع ٣',45]],
        ents: { hub: 'شائعة الموقع ٣', nodes: ['اللجنة المنظمة','نقل المدينة','مجموعات الجماهير','الصحافة الأجنبية'] },
        acts: [['you','اعتمد الرد على الشائعة قبل جلسة المساء'],['ai','نقاط الحديث لأسئلة النقل — جاهزة'],['auto','نبض الأطراف يتحدث كل ساعة']],
        alerts: [['high','عنقود شائعات أمنية يتشكل قرب الموقع ٣','قبل ١٢ دقيقة · ٥ مصادر تتقارب'],['medium','شكاوى النقل ترتفع على وسائل التواصل','قبل ساعة · شذوذ في الاتجاه'],['low','تغطية حفل الافتتاح ٨٨٪ إيجابية','اليوم · ٤٠+ منفذاً']],
        sov: [['فعاليتك',66],['عنقود المنتقدين',21],['إعلام محايد',13]],
        brief: 'عنقود شائعات واحد يحتاج رداً قبل جلسة المساء — <strong>نبض الأطراف مستقر</strong>، حسابان غيّرا النبرة. خريطة الموقف فيها ٣ نقاط حية.' } },
    media: { rep: 72, senti: [44,41,15],
      en: { drv: '▲ exclusive pickup · ▼ rival scoop',
        kpis: [['21K','Stories tracked'],['14','Beats covered'],['96','Verification checks']],
        trends: [['Your exclusive',320],['Election beat',75],['Rival scoop',66],['Economy beat',41]],
        ents: { hub: 'Exclusive pickup', nodes: ['Rival outlet A','Wire agencies','TV talk shows','Social amplifiers'] },
        acts: [['you','Assign the follow-up on rival A\'s scoop'],['ai','Second-source verification — AI traced 3 leads'],['auto','Attribution report updating live']],
        alerts: [['high','Your exclusive picked up by 12 outlets','2 hrs ago · attribution tracked'],['medium','Rival broke a story in your beat','40 min ago · angle analysis ready'],['low','Talk shows quoting your reporting tonight','scheduled · 3 channels']],
        sov: [['You',39],['Rival outlet A',41],['Rival outlet B',20]],
        brief: 'Your exclusive is winning the morning (<strong>12 pickups</strong>); rival A\'s scoop is 40 minutes old with no second source yet — the verification trail is inside.' },
      ar: { drv: '▲ انتشار الحصري · ▼ سبق منافس',
        kpis: [['٢١ ألف','قصة متتبعة'],['١٤','مجالاً مغطى'],['٩٦','فحص تحقق']],
        trends: [['خبرك الحصري',320],['ملف الانتخابات',75],['سبق المنافس',66],['الملف الاقتصادي',41]],
        ents: { hub: 'انتشار الحصري', nodes: ['المنفذ المنافس أ','وكالات الأنباء','البرامج الحوارية','مضخّمو التواصل'] },
        acts: [['you','كلّف متابعة سبق المنافس أ'],['ai','التحقق من مصدر ثانٍ — الذكاء تتبع ٣ خيوط'],['auto','تقرير الإسناد يتحدّث مباشرة']],
        alerts: [['high','خبرك الحصري التقطته ١٢ منفذاً','قبل ساعتين · تتبع الإسناد'],['medium','منافس نشر قصة في مجالك','قبل ٤٠ دقيقة · تحليل الزاوية جاهز'],['low','برامج حوارية تقتبس تقريرك الليلة','مجدول · ٣ قنوات']],
        sov: [['أنت',39],['منفذ منافس أ',41],['منفذ منافس ب',20]],
        brief: 'خبرك الحصري يتصدر الصباح (<strong>١٢ التقاطاً</strong>)؛ سبق المنافس أ عمره ٤٠ دقيقة بلا مصدر ثانٍ بعد — مسار التحقق بالداخل.' } },
    agency: { rep: 70, senti: [39,37,24],
      en: { drv: '▲ campaign KPIs · ▼ one client crisis',
        kpis: [['6','Accounts live'],['11K','Mentions today'],['9','Reports this week']],
        trends: [['Client Y campaign',230],['Client X crisis',190],['Sector policy',52],['Award season',18]],
        ents: { hub: 'Client X story', nodes: ['Their rival','Consumer groups','Trade press','Regulators'] },
        acts: [['you','Send the crisis brief to Client X — ready now'],['ai','Campaign recap deck for Client Y — AI drafted'],['auto','6 client reports scheduled for Friday']],
        alerts: [['critical','Client X: negative story accelerating','now · crisis playbook suggested'],['medium','Sector policy chatter rising — 3 clients affected','2 hrs ago · watchlist'],['low','Client Y campaign beat its share-of-voice target','today · report auto-drafted']],
        sov: [['Client X',35],['Their rival',48],['Sector avg.',17]],
        brief: 'One client needs attention now (the crisis brief is drafted); two are ahead of target. <strong>Client-ready reports</strong> for all six accounts generate on demand.' },
      ar: { drv: '▲ مؤشرات الحملات · ▼ أزمة عميل واحد',
        kpis: [['٦','حسابات نشطة'],['١١ ألف','إشارة اليوم'],['٩','تقارير هذا الأسبوع']],
        trends: [['حملة العميل ص',230],['أزمة العميل س',190],['سياسات القطاع',52],['موسم الجوائز',18]],
        ents: { hub: 'قصة العميل س', nodes: ['منافسه','مجموعات المستهلكين','الصحافة المتخصصة','الجهات المنظمة'] },
        acts: [['you','أرسل موجز الأزمة للعميل س — جاهز الآن'],['ai','عرض ملخص حملة العميل ص — صاغه الذكاء'],['auto','٦ تقارير عملاء مجدولة ليوم الجمعة']],
        alerts: [['critical','العميل س: قصة سلبية تتسارع','الآن · خطة أزمة مقترحة'],['medium','حديث سياسات القطاع يرتفع — ٣ عملاء متأثرون','قبل ساعتين · قائمة المتابعة'],['low','حملة العميل ص تجاوزت هدف حصة الصوت','اليوم · تقرير مُعد تلقائياً']],
        sov: [['العميل س',35],['منافسه',48],['متوسط القطاع',17]],
        brief: 'عميل واحد يحتاج انتباهك الآن (موجز الأزمة جاهز)، واثنان يتقدمان على الهدف. <strong>تقارير جاهزة للعملاء</strong> لكل الحسابات الستة عند الطلب.' } }
  };

  /* ---------------- helpers ---------------- */
  var AVATAR = '<span class="avatar-s"><img src="./assets/icon.svg" alt=""></span>';
  var SEND_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 11.5 21 3l-8.5 18-2.4-7.1L3 11.5Z" fill="currentColor"/></svg>';
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function scrollEnd() { stage.scrollTo({ top: stage.scrollHeight, behavior: 'smooth' }); }
  function pause(ms) {
    var g = flowGen;
    return new Promise(function (r) { setTimeout(function () { if (g === flowGen) r(); }, ms); });
  }
  function now() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }
  function thinkRow() {
    return el('<div class="row bot">' + AVATAR +
      '<div class="msg-col"><div class="stamp">' + now() + '</div>' +
      '<div class="bubble"><span class="rx">' + t('rx') + '</span></div></div></div>');
  }
  function botSay(html, cls, delay) {
    var g = flowGen;
    return new Promise(function (res) {
      var think = thinkRow();
      conv.appendChild(think); scrollEnd();
      setTimeout(function () {
        if (g !== flowGen) { think.remove(); return; }   // skipped — never resolves
        think.querySelector('.bubble').outerHTML = '<div class="bubble ' + (cls || '') + '">' + html + '</div>';
        scrollEnd(); res();
      }, delay || 700);
    });
  }
  function botWide(innerHTML) {
    conv.appendChild(el('<div class="row bot wide"><div class="bubble" aria-hidden="true">' + innerHTML + '</div></div>'));
    scrollEnd();
  }
  function meSay(text) {
    var r = el('<div class="row me"><div class="msg-col"><div class="stamp">' + now() + '</div><div class="bubble"></div></div></div>');
    r.querySelector('.bubble').textContent = text;
    conv.appendChild(r); scrollEnd();
  }
  function clearAction() { actionArea.innerHTML = ''; }
  function showChoices(items) {
    clearAction();
    var box = el('<div class="choices"></div>');
    items.forEach(function (it) {
      var b = el('<button type="button"' + (it.primary ? ' class="primary"' : '') + '></button>');
      b.textContent = it.label;
      b.onclick = function () { clearAction(); it.on(); };
      box.appendChild(b);
    });
    actionArea.appendChild(box); scrollEnd();
  }
  function showInput(placeholder, onSubmit, skipLabel, onSkip) {
    clearAction();
    var wrap = el('<div></div>');
    var box = el('<div class="conv-input"><input type="text" maxlength="60"><button type="button" aria-label="Send">' + SEND_ICON + '</button></div>');
    var inp = box.querySelector('input'), btn = box.querySelector('button');
    inp.placeholder = placeholder;
    function go() { var v = inp.value.trim(); if (!v) return; clearAction(); onSubmit(v); }
    btn.onclick = go; inp.onkeydown = function (e) { if (e.key === 'Enter') go(); };
    wrap.appendChild(box);
    if (skipLabel && onSkip) {
      var sk = el('<button type="button" class="input-skip">' + skipLabel + '</button>');
      sk.onclick = function () { clearAction(); onSkip(); };
      wrap.appendChild(sk);
    }
    actionArea.appendChild(wrap);
    setTimeout(function () { inp.focus({ preventScroll: true }); }, 60);
    scrollEnd();
  }
  function setLang(lang) {
    state.lang = lang;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    var sl = root.querySelector('#msb-label'); if (sl) sl.textContent = t('session');
    var sk = root.querySelector('#msb-skip'); if (sk) sk.textContent = t('skip_intro');
  }
  function updateGeoLabel() {
    var g = root.querySelector('#msb-geo');
    if (g && state.city) g.textContent = '· ' + state.city + (state.country ? ', ' + state.country : '');
  }

  /* ---------------- geo detection (best effort, silent fallback) ---------------- */
  var AR_CC = ['QA','SA','AE','KW','BH','OM','EG','JO','LB','IQ','SY','YE','PS','LY','TN','DZ','MA','SD','MR','SO','DJ','KM'];
  function detect() {
    var browserAr = (navigator.language || '').toLowerCase().indexOf('ar') === 0;
    return new Promise(function (res) {
      var done = false;
      var to = setTimeout(function () { if (!done) { done = true; res({ ar: browserAr }); } }, 3500);
      fetch('https://ipapi.co/json/').then(function (r) { return r.json(); }).then(function (j) {
        if (done) return; done = true; clearTimeout(to);
        res({ ar: browserAr || AR_CC.indexOf(j.country_code) !== -1, country: j.country_name || null, cc: j.country_code, city: j.city || null, region: j.region || null });
      }).catch(function () { if (!done) { done = true; clearTimeout(to); res({ ar: browserAr }); } });
    });
  }
  function cityGuessLine() {
    var f = state.city && CITY_FACTS[state.city.toLowerCase()];
    if (!f && state.region && CITY_FACTS[state.region.toLowerCase()]) {
      state.city = state.region; updateGeoLabel();
      f = CITY_FACTS[state.region.toLowerCase()];
    }
    if (!f && state.region && state.city && state.region.toLowerCase() !== state.city.toLowerCase()) {
      state.city = state.region; updateGeoLabel();
    }
    if (!state.city) return null;
    var fact = f ? (f[state.lang] || f.en) : t('geo_fact_generic');
    return fmt(t('geo_guess'), { city: esc(state.city), fact: fact });
  }

  /* ---------------- the mind animation ---------------- */
  function mindSVG() {
    var srcLabel = state.lang === 'ar'
      ? ['📱 التواصل','💬 تيليغرام','📰 الأخبار','📺 التلفزيون','📈 المؤشرات','💼 مصادر مميزة']
      : ['📱 Social','💬 Telegram','📰 News','📺 TV & radio','📈 Trends','💼 Premium feeds'];
    var outLabel = state.lang === 'ar'
      ? ['⚡ تنبيهات','🧵 سرديات','🕸 كيانات','🗺 خريطة الموقف','📋 موجزات']
      : ['⚡ Alerts','🧵 Narratives','🕸 Entities','🗺 Situation Map','📋 Briefings'];
    var catIn = state.lang === 'ar' ? 'يجمع' : 'COLLECT';
    var catAI = state.lang === 'ar' ? 'عقل واحد' : 'one mind';
    var catOut = state.lang === 'ar' ? 'يسلّم' : 'DELIVER';
    var srcY = [30, 78, 126, 174, 222, 270], outY = [40, 95, 150, 205, 260];
    var cls = ['pa','pb','pc','pd','pe','pf'];
    var s = '<div class="mind-scene" aria-hidden="true"><svg viewBox="0 0 800 300">';
    s += '<text class="cat" x="90" y="14" text-anchor="middle">' + catIn + '</text>';
    s += '<text class="cat" x="710" y="14" text-anchor="middle">' + catOut + '</text>';
    srcY.forEach(function (y, i) {
      s += '<rect class="msrc" x="10" y="' + (y - 16) + '" width="160" height="32" rx="10"/>' +
           '<text x="90" y="' + (y + 5) + '" text-anchor="middle">' + srcLabel[i] + '</text>' +
           '<path class="lane" d="M174 ' + y + ' C 260 ' + y + ', 300 150, 356 150"/>' +
           '<circle class="p ' + cls[i] + '" cx="174" cy="' + y + '" r="4.5"/>';
    });
    s += '<circle class="mind-wave" cx="400" cy="150" r="56" fill="none" stroke="#D4A832" stroke-width="1.2"/>' +
         '<circle class="mind-wave w2" cx="400" cy="150" r="56" fill="none" stroke="#D4A832" stroke-width="1.2"/>' +
         '<g class="mind-ring"><circle cx="400" cy="150" r="56" fill="none" stroke="#D4A832" stroke-width="1.5" stroke-dasharray="7 10" opacity=".75"/></g>' +
         '<g class="mind-core"><circle cx="400" cy="150" r="40" fill="#1E3A5F"/><circle cx="400" cy="150" r="40" fill="none" stroke="#5373A3" stroke-width="1.6"/>' +
         '<text x="400" y="146" text-anchor="middle" style="font-size:14px;fill:#F5C842;font-weight:800">AI</text>' +
         '<text x="400" y="163" text-anchor="middle" class="lbl" style="fill:#A9B9D1">' + catAI + '</text></g>';
    outY.forEach(function (y, i) {
      s += '<path class="lane" d="M444 150 C 520 150, 540 ' + y + ', 596 ' + y + '"/>' +
           '<g class="out-chip" style="animation-delay:' + (0.35 + i * 0.3) + 's">' +
           '<rect class="msrc" x="598" y="' + (y - 16) + '" width="192" height="32" rx="16" style="stroke:#D4A832"/>' +
           '<text x="694" y="' + (y + 5) + '" text-anchor="middle">' + outLabel[i] + '</text></g>';
    });
    return s + '</svg></div>';
  }

  /* ---------------- geo card ---------------- */
  function geoCard() {
    var place = state.city ? state.city + (state.country ? ' · ' + state.country : '') : state.country;
    var outlets = (OUTLETS_CC[state.cc] || []).slice(0, 4).map(function (o) { return '<span class="pill">' + esc(o) + '</span>'; }).join(' ');
    if (!outlets) outlets = '<span class="pill">' + (state.lang === 'ar' ? 'الصحافة الوطنية' : 'National press') + '</span> <span class="pill">' + (state.lang === 'ar' ? 'البث المحلي' : 'Local broadcast') + '</span> <span class="pill">' + (state.lang === 'ar' ? 'وسائل التواصل' : 'Social media') + '</span>';
    var scopes = ['<span class="pill gold">' + esc(state.country || '') + '</span>',
                  '<span class="pill">' + t('geo_scope_region') + '</span>',
                  '<span class="pill">' + t('geo_scope_sector') + '</span>'].join(' ');
    return '<div class="scenario"><div class="head"><span class="t">' + fmt(t('geo_title'), { place: esc(place) }) + '</span>' +
      '<span class="live"><span class="live-dot"></span>' + t('live') + '</span></div>' +
      '<div class="body" style="grid-template-columns:1fr 1fr">' +
      '<div class="sc-block"><h5><span class="fdot"></span>' + t('lb_outlets') + '</h5><div style="display:flex;flex-wrap:wrap;gap:8px">' + outlets + '</div>' +
      '<h5 style="margin-top:15px"><span class="fdot"></span>' + t('lb_langs') + '</h5><div style="display:flex;flex-wrap:wrap;gap:8px"><span class="pill">English</span> <span class="pill">العربية</span></div></div>' +
      '<div class="sc-block"><h5><span class="fdot"></span>' + t('lb_scopes') + '</h5><div style="display:flex;flex-wrap:wrap;gap:8px">' + scopes + '</div>' +
      '<div class="sc-brief" style="margin-top:15px">' + t('geo_brief') + '</div></div>' +
      '</div><div class="sc-note">' + t('note') + '</div></div>';
  }

  /* ---------------- scenario dashboard ---------------- */
  function h5(label) { return '<h5><span class="fdot"></span>' + label + '</h5>'; }
  function miniNet(ents) {
    var pos = [[60,26],[240,22],[70,84],[236,86]];
    var lines = pos.map(function (p) { return '<line class="edge" x1="150" y1="52" x2="' + p[0] + '" y2="' + p[1] + '"/>'; }).join('');
    var nodes = pos.map(function (p, i) {
      return '<circle class="node" cx="' + p[0] + '" cy="' + p[1] + '" r="6"/>' +
             '<text x="' + p[0] + '" y="' + (p[1] + (p[1] < 52 ? -12 : 18)) + '" text-anchor="middle" style="font-size:9px;fill:var(--muted)">' + ents.nodes[i] + '</text>';
    }).join('');
    return '<div class="netbox net"><svg viewBox="0 0 300 108">' + lines +
      '<circle class="node hub" cx="150" cy="52" r="10"/>' +
      '<text x="150" y="76" text-anchor="middle" style="font-size:9.5px;fill:var(--foreground);font-weight:700">' + ents.hub + '</text>' +
      nodes + '</svg></div>';
  }
  function scenarioCard(key) {
    var sc = SCENARIOS[key]; var L = sc[state.lang] || sc.en;
    var C = 2 * Math.PI * 36, off = C * (1 - sc.rep / 100);
    var kpis = L.kpis.map(function (k) { return '<div class="kpi"><b>' + k[0] + '</b><span>' + k[1] + '</span></div>'; }).join('');
    var sov = L.sov.map(function (row, i) {
      return '<div class="bar-row' + (i === 0 ? ' you' : '') + '"><span class="nm">' + row[0] + '</span><span class="bar"><i style="width:' + row[1] + '%"></i></span><span>' + row[1] + '%</span></div>';
    }).join('');
    var maxTrend = Math.max.apply(null, L.trends.map(function (x) { return Math.abs(x[1]); }));
    var trends = L.trends.map(function (x) {
      var up = x[1] >= 0, w = Math.round(Math.abs(x[1]) / maxTrend * 100);
      return '<div class="trend-mini"><span class="nm">' + x[0] + '</span><span class="spark"><i style="width:' + w + '%"></i></span><span class="d ' + (up ? 'up' : 'dn') + '">' + (up ? '▲' : '▼') + Math.abs(x[1]) + '%</span></div>';
    }).join('');
    var s = sc.senti;
    var senti = '<div class="senti"><i class="pos" style="width:' + s[0] + '%"></i><i class="neu" style="width:' + s[1] + '%"></i><i class="neg" style="width:' + s[2] + '%"></i></div>' +
      '<div class="senti-leg"><span><span class="sw2" style="background:var(--ok)"></span><b>' + s[0] + '%</b> ' + t('s_pos') + '</span>' +
      '<span><span class="sw2" style="background:var(--navy-300)"></span><b>' + s[1] + '%</b> ' + t('s_neu') + '</span>' +
      '<span><span class="sw2" style="background:var(--bad)"></span><b>' + s[2] + '%</b> ' + t('s_neg') + '</span></div>';
    var alerts = L.alerts.map(function (a) {
      return '<div class="sc-alert"><span class="sev ' + a[0] + '"></span> <strong>' + a[1] + '</strong><div class="meta">' + a[2] + '</div></div>';
    }).join('');
    var badge = { you: ['you', t('b_you')], ai: ['ai', t('b_ai')], auto: ['auto', t('b_auto')] };
    var acts = L.acts.map(function (a) {
      var b = badge[a[0]];
      return '<div class="act"><span class="ab ' + b[0] + '">' + b[1] + '</span><span>' + a[1] + '</span></div>';
    }).join('');
    return '<div class="scenario"><div class="head"><span class="t">' + t('sc_titles')[key] + '</span><span class="live"><span class="live-dot"></span>' + t('live') + '</span></div>' +
      '<div class="kpis">' + kpis + '</div>' +
      '<div class="body">' +
      '<div class="sc-block">' + h5(t('lb_rep')) +
        '<div class="gauge-row"><span class="gauge"><svg width="80" height="80" viewBox="0 0 84 84">' +
        '<circle class="track" cx="42" cy="42" r="36" fill="none" stroke-width="8"/>' +
        '<circle class="val" cx="42" cy="42" r="36" fill="none" stroke-width="8" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
        '</svg><span class="num">' + sc.rep + '</span></span>' +
        '<span class="rep-drv">' + L.drv + '</span></div>' +
        h5(t('lb_senti')).replace('<h5>', '<h5 style="margin-top:15px">') + senti + '</div>' +
      '<div class="sc-block">' + h5(t('lb_sov')) + '<div class="sov">' + sov + '</div>' +
        h5(t('lb_trends')).replace('<h5>', '<h5 style="margin-top:15px">') + trends + '</div>' +
      '<div class="sc-block">' + h5(t('lb_alerts')) + alerts + '</div>' +
      '<div class="sc-block" style="grid-column:span 1">' + h5(t('lb_net')) + miniNet(L.ents) + '</div>' +
      '<div class="sc-block" style="grid-column:span 2">' + h5(t('lb_actions')) + acts + '</div>' +
      '<div class="sc-block" style="grid-column:1/-1">' + h5(t('lb_brief')) + '<div class="sc-brief">' + L.brief + '</div></div>' +
      '</div><div class="sc-note">' + t('note') + '</div></div>';
  }

  /* ---------------- the flow ---------------- */
  function bizGrid() {
    clearAction();
    var grid = el('<div class="biz-grid"></div>');
    Object.keys(SCENARIOS).forEach(function (k) {
      var full = t('sc_titles')[k];
      var ic = full.split(' ')[0], lb = full.substring(full.indexOf(' ') + 1);
      var b = el('<button type="button"><span class="ic">' + ic + '</span><span class="lb">' + lb + '</span></button>');
      b.onclick = function () { clearAction(); pickScenario(k); };
      grid.appendChild(b);
    });
    actionArea.appendChild(grid); scrollEnd();
  }
  function askBizLine() {
    return state.name ? fmt(t('ask_biz'), { name: esc(state.name) }) : t('ask_biz_anon');
  }
  function stepScenarioPick() {
    botSay(askBizLine()).then(bizGrid);
  }
  function pickScenario(key) {
    try { sessionStorage.setItem('sentraMeetDone', '1'); } catch (e) {}
    meSay(t('sc_titles')[key].substring(t('sc_titles')[key].indexOf(' ') + 1));
    var think = thinkRow();
    conv.appendChild(think); scrollEnd();
    setTimeout(function () {
      think.remove();
      botWide(scenarioCard(key));
      setTimeout(function () {
        botSay(t('after_scenario')).then(function () {
          showChoices([
            { label: t('again'), on: bizGrid },
            { label: t('cta_demo'), primary: true, on: function () { location.href = 'https://id8media.com/en/contact'; } },
            { label: t('cta_continue'), on: function () {
                clearAction();
                var next = document.getElementById('after-meet');
                if (next) next.scrollIntoView({ behavior: 'smooth' });
              } }
          ]);
        });
      }, 1400);
    }, 900);
  }
  function stepGeoData(nextFn) {
    if (!state.country && !state.city) return nextFn();
    var place = state.city || state.country;
    botSay(fmt(t('geo_intro'), { place: esc(place) })).then(function () {
      botWide(geoCard());
      setTimeout(nextFn, 1600);
    });
  }
  function stepHello() {
    pause(900).then(function () {
      return botSay(state.name ? fmt(t('meet'), { name: esc(state.name) }) : t('meet_anon'));
    }).then(function () {
      var line = cityGuessLine();
      if (!line) return Promise.resolve();
      return pause(1100).then(function () { return botSay(line); });
    }).then(function () {
      return pause(1600);
    }).then(function () {
      return botSay(t('hello'), '', 1100);
    }).then(function () {
      return pause(2200);
    }).then(function () {
      return botSay(t('watch'));
    }).then(function () {
      return pause(900);
    }).then(function () {
      botWide(mindSVG());
      return pause(2500);
    }).then(function () {
      return botSay(t('mind_caption'));
    }).then(function () {
      setTimeout(function () { stepGeoData(stepScenarioPick); }, 2000);
    });
  }
  function stepName() {
    botSay(t('ask_name')).then(function () {
      showInput(t('name_ph'),
        function (v) { state.name = v; meSay(v); stepHello(); },
        t('name_skip'),
        function () { state.name = ''; stepHello(); });
    });
  }
  function tickClock() {
    var c = root.querySelector('#msb-clock');
    if (c) c.textContent = now();
  }
  function initOnce() {
    if (started) return;
    started = true;
    if (!clockOn) { clockOn = true; tickClock(); setInterval(tickClock, 1000); }
    // geo runs in parallel — the conversation NEVER waits on it
    detectP = detect();
    detectP.then(function (d) {
      state.country = d.country || null; state.city = d.city || null;
      state.cc = d.cc || null; state.region = d.region || null;
      var geoLabel = d.city ? d.city + (d.country ? ', ' + d.country : '') : d.country;
      if (geoLabel) { var g = root.querySelector('#msb-geo'); if (g) g.textContent = '· ' + geoLabel; }
    });
  }
  function begin() {
    initOnce();
    var meetDone = false;
    try { meetDone = sessionStorage.getItem('sentraMeetDone') === '1'; } catch (e) {}
    if (meetDone) {
      // returning visitor: straight to the picker
      botSay(t('hi'), 'hero-line', 400).then(function () {
        return botSay(askBizLine(), '', 500);
      }).then(bizGrid);
      return;
    }
    botSay(t('hi'), 'hero-line').then(function () {
      // wait briefly for geo only to decide the Arabic offer; never longer than 1.2s
      return Promise.race([detectP, new Promise(function (r) { setTimeout(function () { r(null); }, 1200); })]);
    }).then(function (d) {
      var arHint = (d && d.ar) || (navigator.language || '').toLowerCase().indexOf('ar') === 0;
      if (arHint && state.lang === 'en') {
        botSay(t('ask_ar')).then(function () {
          showChoices([
            { label: T.ar.yes, primary: true, on: function () { setLang('ar'); meSay('العربية'); stepName(); } },
            { label: T.en.no, on: function () { meSay(T.en.no); stepName(); } }
          ]);
        });
      } else stepName();
    });
  }
  function skipToPicker() {
    flowGen++;              // kill every pending timeline step
    initOnce();
    clearAction();
    botSay(askBizLine(), '', 400).then(bizGrid);
  }

  document.addEventListener('DOMContentLoaded', function () {
    root = document.getElementById('meet');
    if (!root) return;
    stage = root.querySelector('.meet-stage');
    conv = root.querySelector('.conv');
    actionArea = root.querySelector('.action-area');
    var sk = root.querySelector('#msb-skip');
    if (sk) sk.onclick = skipToPicker;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); begin(); } });
      }, { threshold: 0.3 });
      io.observe(root);
    } else begin();
  });
})();
