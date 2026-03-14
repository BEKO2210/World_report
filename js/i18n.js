/* ═══════════════════════════════════════════════════════════
   BELKIS ONE 1.0 — Internationalization (DE/EN)
   ═══════════════════════════════════════════════════════════ */

const translations = {
  de: {
    // ─── Loading Screen ───
    'loading.sub': 'Lade Weltdaten aus 40+ Quellen',

    // ─── Navigation ───
    'nav.aria': 'Sektions-Navigation',
    'nav.prolog': 'Start',
    'nav.indicator': 'Index',
    'nav.environment': 'Umwelt',
    'nav.society': 'Gesellschaft',
    'nav.economy': 'Wirtschaft',
    'nav.progress': 'Fortschritt',
    'nav.realtime': 'Echtzeit',
    'nav.momentum': 'Momentum',
    'nav.crisis': 'Krisen',
    'nav.scenarios': 'Szenarien',
    'nav.sources': 'Quellen',
    'nav.action': 'Handeln',
    'nav.epilog': 'Ende',
    'nav.jumpTo': 'Zu {label} springen',

    // ─── Prolog ───
    'prolog.title': 'Wie geht es der Welt? Wirklich?',
    'prolog.subtitle': 'Ein datengetriebenes Scroll-Erlebnis.',
    'prolog.sources': 'Datenquellen',
    'prolog.cycle': 'Update-Zyklus',
    'prolog.rate': 'Erfolgsrate',
    'prolog.scroll': 'Scroll um zu erfahren',

    // ─── Act 1 — World Indicator ───
    'act1.label': 'AKT 01',
    'act1.title': 'Der Welt-Indikator',
    'act1.desc': 'Berechnet aus hunderten Datenpunkten. Kein Algorithmus, kein KI-Modell — reiner Code, reale Daten.',
    'act1.collapse': 'KOLLAPS',
    'act1.golden': 'GOLDENES ZEITALTER',
    'act1.zone.critical': 'KRITISCH',
    'act1.zone.concerning': 'BESORGNISERREGEND',
    'act1.zone.mixed': 'GEMISCHT',
    'act1.zone.positive': 'POSITIV',
    'act1.zone.excellent': 'EXZELLENT',
    'act1.howTitle': 'Wie wird der Index berechnet?',
    'act1.howText': 'Gewichteter Durchschnitt aus 5 Kategorien: Umwelt (25%), Gesellschaft (25%), Wirtschaft (20%), Fortschritt (20%), Momentum (10%). Jede Kategorie wird aus Dutzenden Indikatoren normalisiert auf 0–100.',
    'act1.sub.environment': 'Umwelt',
    'act1.sub.society': 'Gesellschaft',
    'act1.sub.economy': 'Wirtschaft',
    'act1.sub.progress': 'Fortschritt',
    'act1.sub.momentum': 'Momentum',
    'act1.sub.weight25': '25% Gewichtung',
    'act1.sub.weight20': '20% Gewichtung',
    'act1.sub.weight10': '10% Gewichtung',
    'act1.vsPeriod': 'vs. letzte Periode',

    // ─── Act 2 — Environment ───
    'act2.label': 'AKT 02 — UMWELT',
    'act2.title': 'Der Planet atmet',
    'act2.desc': 'Temperatur, CO2, Luft, Eis, Wald, Erneuerbare — die Vitaldaten unserer Erde.',
    'act2.tempTitle': 'Temperaturanomalie 1880–2026',
    'act2.tempDesc': 'Jeder Streifen = ein Jahr. Blau = kühler, Rot = wärmer als der Durchschnitt (1951–1980).',
    'act2.co2Explain': 'Parts per Million in der Atmosphäre. Vor der Industrialisierung: ~280 ppm. Höchster Wert seit 800.000 Jahren.',
    'act2.tempExplain': 'Abweichung vom Durchschnitt (1951–1980). Das 1.5°C-Ziel von Paris ist fast erreicht.',
    'act2.co2ChartTitle': 'CO2-Konzentration über die Zeit',
    'act2.arcticIce': 'ARKTISCHES EIS',
    'act2.today': 'Heute',
    'act2.arcticExplain': 'Eisverlust entspricht etwa der Fläche von Indien.',
    'act2.forestLabel': 'WALDFLÄCHE',
    'act2.forestExplain': 'Anteil der Landfläche mit Wald. ~10 Mio Hektar Verlust pro Jahr.',
    'act2.renewableLabel': 'ERNEUERBARE ENERGIEN',
    'act2.renewableExplain': 'Anteil am Gesamtverbrauch. Wächst exponentiell dank Solar & Wind.',
    'act2.airTitle': 'Luftqualität weltweit',
    'act2.airDesc': 'AQI: 0–50 gut, 51–100 moderat, 101–150 ungesund für empfindliche Gruppen, 150+ ungesund',
    'act2.weatherTitle': 'Aktuelle Wetterdaten',
    'act2.weatherDesc': 'Echtzeitdaten aus 8 Metropolen via Open-Meteo',

    // ─── Act 3 — Society ───
    'act3.label': 'AKT 03 — GESELLSCHAFT',
    'act3.title': 'Wir Menschen',
    'act3.desc': '8.1 Milliarden. Konflikte, Flucht, Freiheit, Gesundheit — wie es uns geht.',
    'act3.population': 'WELTBEVÖLKERUNG',
    'act3.popContext': '+1% pro Jahr',
    'act3.conflicts': 'AKTIVE KONFLIKTE',
    'act3.conflictsContext': 'Kriege & bewaffnete Konflikte',
    'act3.lifeExp': 'LEBENSERWARTUNG',
    'act3.lifeExpContext': '1960: nur 52.6 Jahre',
    'act3.childMort': 'KINDERSTERBLICHKEIT',
    'act3.childMortContext': 'pro 1000 Lebendgeburten',
    'act3.conflictMapTitle': 'Aktive Konflikte weltweit',
    'act3.conflictMapDesc': 'Größe = Intensität. Rot = Krieg, Orange = Konflikt, Gelb = Unruhen',
    'act3.refugeeLabel': 'Menschen auf der Flucht weltweit',
    'act3.refugeeSource': 'Quelle: UNHCR 2026 — Mehr als je zuvor in der Geschichte',
    'act3.freedomTitle': 'Freiheitsindex weltweit',
    'act3.freedomDesc': '195 Länder bewertet nach politischen Rechten & bürgerlichen Freiheiten',
    'act3.free': 'Frei (84)',
    'act3.partlyFree': 'Teilweise frei (56)',
    'act3.notFree': 'Nicht frei (55)',
    'act3.freedomDecline': '18. Jahr in Folge mit Rückgang — Freedom House 2026',
    'act3.lifeExpLabel': 'LEBENSERWARTUNG',
    'act3.lifeExpTrend': '+20.8 J. seit 1960',
    'act3.lifeExpExplain': 'Haupttreiber: Medizin, Hygiene, Ernährung.',
    'act3.infraLabel': 'INFRASTRUKTUR-ZUGANG',
    'act3.infraElec': 'Strom',
    'act3.infraWater': 'Sauberes Wasser',
    'act3.infraEdu': 'Bildung',
    'act3.infraExplain': 'Milliarden haben heute Zugang zu Grundversorgung — historisch einzigartig.',

    // ─── Act 4 — Economy ───
    'act4.label': 'AKT 04 — WIRTSCHAFT',
    'act4.title': 'Der Motor',
    'act4.desc': 'Reichtum, Armut, Ungleichheit, Handel — die Zahlen hinter dem System.',
    'act4.billionaires': 'Milliardäre weltweit',
    'act4.billionairesOwn': 'besitzen 45.8% des Weltvermögens',
    'act4.poverty': 'Menschen in extremer Armut',
    'act4.povertyThreshold': 'unter $2.15 pro Tag',
    'act4.wealthTitle': 'Globale Vermögensverteilung',
    'act4.wealthDesc': 'Das reichste 1% besitzt mehr als die untere Hälfte der Menschheit zusammen.',
    'act4.gdpGrowth': 'BIP-WACHSTUM',
    'act4.gdpContext': 'Global 2026',
    'act4.inflation': 'INFLATION',
    'act4.inflationContext': 'Verbraucherpreise',
    'act4.unemployment': 'ARBEITSLOSIGKEIT',
    'act4.unemploymentContext': 'Weltweite Quote',
    'act4.gdpPerCapita': 'BIP PRO KOPF',
    'act4.gdpPerCapitaContext': 'Durchschnitt',
    'act4.giniExplain': '0 = Gleichheit, 1 = Ungleichheit. Global: 0.42 — Tendenz sinkend.',
    'act4.tradeLabel': 'GLOBALER HANDEL',
    'act4.tradeExplain': 'Handel als % des BIP. Rückläufig seit 2008 durch Protektionismus.',
    'act4.exchangeLabel': 'WECHSELKURSE (USD)',
    'act4.regionalGdp': 'REGIONALES BIP-WACHSTUM',

    // ─── Act 5 — Progress ───
    'act5.label': 'AKT 05 — FORTSCHRITT',
    'act5.title': 'Die Kurve',
    'act5.desc': 'Wissenschaft, Technologie, Bildung — der Fortschritt ist exponentiell.',
    'act5.internet': 'INTERNET-NUTZER',
    'act5.internetContext': '5.4 Mrd online',
    'act5.literacy': 'ALPHABETISIERUNG',
    'act5.literacyContext': '1900: nur ~21%',
    'act5.mobile': 'MOBILFUNK',
    'act5.mobileContext': 'Abos/100 Menschen',
    'act5.rd': 'F&E-AUSGABEN',
    'act5.rdContext': '% des globalen BIP',
    'act5.pubTitle': 'Wissenschaftliche Publikationen pro Jahr',
    'act5.pubDesc': 'Exponentielles Wissenwachstum seit den 1990ern',
    'act5.githubLabel': 'GITHUB GLOBAL PULSE',
    'act5.commitsDay': 'Commits / Tag',
    'act5.activeDev': 'Aktive Entwickler',
    'act5.githubExplain': 'Open Source treibt Innovation. Entwickler weltweit lösen gemeinsam Probleme.',
    'act5.internetPen': 'INTERNET-DURCHDRINGUNG',
    'act5.literacyLabel': 'ALPHABETISIERUNG',
    'act5.literacyGap': 'Geschlechterlücke schließt sich — aber noch {gap}% Differenz.',
    'act5.spaceflight': 'RAUMFAHRT-NEWS',
    'act5.latestScience': 'NEUESTE WISSENSCHAFT',

    // ─── Act 6 — Realtime ───
    'act6.label': 'AKT 06 — ECHTZEIT',
    'act6.title': 'Echtzeit-Pulse',
    'act6.desc': 'Live-Daten aus aller Welt — aktualisiert alle 6 Stunden aus Dutzenden APIs.',
    'act6.earthquakes': 'Erdbeben (24h)',
    'act6.earthquakesDesc': 'USGS — Alle Beben M2.5+ in 24h',
    'act6.cleanCities': 'Sauberste Städte',
    'act6.dirtyCities': 'Schmutzigste Städte',
    'act6.sentiment': 'Nachrichten-Sentiment',
    'act6.sentimentDesc': 'GDELT globale Nachrichtenstimmung',
    'act6.fearGreed': 'Crypto Fear & Greed',
    'act6.fearGreedScale': '0 = Angst, 100 = Gier',
    'act6.solar': 'Sonnenaktivität',
    'act6.volcanic': 'Vulkane',
    'act6.news': 'Globale Nachrichten',
    'act6.newsDesc': 'UN, WHO, BBC, Al Jazeera, Guardian, DW, NASA, ReliefWeb u.a.',
    'act6.loading': 'Lade...',

    // ─── Act 7 — Momentum ───
    'act7.label': 'AKT 07 — MOMENTUM',
    'act7.question': 'Wird es besser — oder schlechter?',
    'act7.desc': 'Nicht wo wir stehen — sondern wohin wir uns bewegen.',
    'act7.method': '<strong>Methodik:</strong> Vergleich der letzten 3 Jahre mit den 3 Jahren davor für jeden Indikator.',
    'act7.keyIndicators': '20 Schlüssel-Indikatoren',
    'act7.trendsPositive': 'Trends positiv',
    'act7.vsToday': 'Die Welt 2000 vs. Heute',
    'act7.vsTodayDesc': '25 Jahre Veränderung — die Fakten',
    'act7.momentumScore': 'Momentum-Score',
    'act7.momentumDesc': 'Der Richtungsvektor der Menschheit.',
    'act7.improved': '✓ Verbessert',
    'act7.worsened': '✗ Verschlechtert',

    // ─── Act 8 — Crisis Map ───
    'act8.label': 'AKT 08 — KRISEN',
    'act8.title': 'Die Karte der Krisen',
    'act8.desc': 'Klima, Konflikte, Hunger, Naturkatastrophen — und Hoffnung.',
    'act8.climate': 'Klimarisiko',
    'act8.conflicts': 'Konflikte',
    'act8.hunger': 'Hungerkrisen',
    'act8.nature': 'Naturschutz',
    'act8.energy': 'Erneuerbare',
    'act8.mapPlaceholder': 'Interaktive Weltkarte — Layer ein/ausschaltbar',
    'act8.infoText': 'Die Realität ist komplex. Es gibt Krisen und Fortschritt — gleichzeitig, überall. Die Frage ist nicht ob, sondern wie schnell wir reagieren.',

    // ─── Act 9 — Scenarios ───
    'act9.label': 'AKT 09 — SZENARIEN',
    'act9.title': 'Drei Zukünfte',
    'act9.desc': 'Projektionen bis 2050 — basierend auf aktuellen Trends und wissenschaftlichen Modellen.',
    'act9.pathA': 'PFAD A',
    'act9.bauTitle': 'Weiter so',
    'act9.bauSub': 'Business as Usual',
    'act9.pathB': 'PFAD B',
    'act9.worstTitle': 'Schlimmster Fall',
    'act9.worstSub': 'Kippunkte überschritten',
    'act9.pathC': 'PFAD C',
    'act9.bestTitle': 'Bestmöglicher Kurs',
    'act9.bestSub': 'Volle Kooperation',

    // ─── Act 10 — Sources ───
    'act10.label': 'AKT 10 — TRANSPARENZ',
    'act10.title': 'Datenquellen & Transparenz',
    'act10.desc': 'Jeder Datenpunkt überprüfbar. Jede Quelle verlinkt. Open Source.',
    'act10.sources': 'Quellen',
    'act10.successful': 'Erfolgreich',
    'act10.rate': 'Rate',
    'act10.nextUpdate': 'Nächstes Update',
    'act10.methodTitle': 'Methodik',
    'act10.methodText': 'Keine KI. Nur Code und Daten. Alle Berechnungen open-source und reproduzierbar.',
    'act10.methodNote': 'Der Welt-Indikator basiert auf gewichteten normalisierten Sub-Scores (0–100).',

    // ─── Act 11 — Action ───
    'act11.label': 'AKT 11 — HANDELN',
    'act11.question': 'Du hast die Daten gesehen.<br>Was kannst DU tun?',
    'act11.localTitle': 'Lokal handeln',
    'act11.localDesc': 'Wählen. Community-Projekte. Lokalpolitik mitgestalten.',
    'act11.localImpact': 'Wirkung: Deine Stadt',
    'act11.digitalTitle': 'Digital beitragen',
    'act11.digitalDesc': 'Open Source. Datenprojekte. Wissen teilen.',
    'act11.digitalImpact': 'Wirkung: Global, sofort',
    'act11.globalTitle': 'Global wirken',
    'act11.globalDesc': 'Gezielte Spenden. Effektiver Altruismus.',
    'act11.example1': '1€ = 4 Mahlzeiten',
    'act11.example2': '5€ = 1 Impfung',
    'act11.example3': '25€ = 1 Monat Schule',

    // ─── Epilog ───
    'epilog.message': 'Die Daten aktualisieren sich alle 6 Stunden.<br>Komm zurück — und sieh ob sich etwas verändert hat.',
    'epilog.backToTop': 'Zurück nach oben',
    'epilog.easterEgg': 'Du interessierst dich.<br>Das ist der erste Schritt.',

    // ─── Footer ───
    'footer.invite': 'Open Source — Beiträge willkommen!',
    'footer.contrib': 'Übersetzungen, Detail-Ansichten, Verbesserungen, Issues — jede Hilfe zählt.',
    'footer.impressum': 'Impressum',
    'footer.impressumLegal': 'Angaben gemäß § 5 TMG / § 18 Abs. 2 MStV',
    'footer.contact': 'Kontakt',
    'footer.responsible': 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:',
    'footer.responsibleName': 'Belkis Aslani, Anschrift wie oben.',
    'footer.privacy': 'Datenschutzerklärung',
    'footer.privacyController': '1. Verantwortlicher',
    'footer.privacyControllerText': 'Belkis Aslani, Vogelsangstr. 32, 71691 Freiberg am Neckar. E-Mail: belkis.aslani@gmail.com',
    'footer.privacyCollection': '2. Erhebung und Verarbeitung personenbezogener Daten',
    'footer.privacyCollectionText': 'Diese Website erhebt, speichert und verarbeitet <em>keine</em> personenbezogenen Daten. Es werden keine Cookies gesetzt, kein Tracking eingesetzt und keine Analyse-Tools verwendet.',
    'footer.privacyHosting': '3. Hosting',
    'footer.privacyHostingText': 'Die Website wird über GitHub Pages (GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA) bereitgestellt. GitHub kann Server-Logfiles (IP-Adresse, Browsertyp, Zeitstempel) erheben.',
    'footer.privacyAPIs': '4. Externe APIs',
    'footer.privacyAPIsText': 'Die dargestellten Daten werden serverseitig per GitHub Actions aus öffentlichen APIs (Weltbank, NASA, WHO u. a.) abgerufen und als statische JSON-Datei ausgeliefert. Beim Besuch der Seite werden keine Anfragen an Drittanbieter-Server gestellt.',
    'footer.privacyRights': '5. Ihre Rechte',
    'footer.privacyRightsText': 'Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch gemäß Art. 15–21 DSGVO. Kontakt: belkis.aslani@gmail.com. Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO).',
    'footer.disclaimer': 'Haftungsausschluss',
    'footer.disclaimerContent': 'Haftung für Inhalte',
    'footer.disclaimerContentText': 'Die Inhalte dieser Website werden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der dargestellten Daten wird jedoch keine Gewähr übernommen. Die Daten stammen aus öffentlichen Quellen und werden automatisiert aufbereitet.',
    'footer.disclaimerLinks': 'Haftung für Links',
    'footer.disclaimerLinksText': 'Diese Website enthält Links zu externen Seiten Dritter, auf deren Inhalte kein Einfluss besteht. Für die Inhalte verlinkter Seiten ist der jeweilige Anbieter verantwortlich.',

    // ─── Dynamic JS strings ───
    'js.loadError': 'Daten konnten nicht geladen werden.',
    'js.lastUpdate': 'Letzte Aktualisierung: {time}',
    'js.unknown': 'Unbekannt',
    'js.humidity': 'Feuchte:',
    'js.wind': 'Wind:',
    'js.displaced': 'Binnenvertriebene',
    'js.asylumseekers': 'Asylsuchende',
    'js.flightRoutes': 'Größte Fluchtrouten:',
    'js.maleLabel': 'Männer: {val}%',
    'js.femaleLabel': 'Frauen: {val}%',
    'js.newRepos': 'neue Repos heute',
    'js.activeDevs': 'aktive Devs',
    'js.sunspotCount': 'Sonnenfleckenzahl',
    'js.noData': 'Keine Daten',
    'js.activeVolcanoes': 'Aktive Vulkane',
    'js.noReports': 'Keine aktuellen Meldungen',
    'js.noTitle': 'Ohne Titel',
    'js.soon': 'Bald',
    'js.years': 'Jahre',
    'js.giniIndex': 'Gini-Index',
    'js.publications': 'Publikationen',
    'js.slightlyNeg': 'Leicht Negativ',
    'js.improved': 'Verbessert',
    'js.worsened': 'Verschlechtert',

    // ─── Spaceflight fallback ───
    'js.spaceFallback1': 'SpaceX Starship: Testflug #8 erfolgreich',
    'js.spaceFallback2': 'ESA Ariane 6: Zweiter kommerzieller Start',
    'js.spaceFallback3': 'NASA Artemis III: Crew-Auswahl bestätigt',
    'js.spaceFallback4': 'ISRO: Chandrayaan-4 Mission geplant',

    // ─── Number formatting ───
    'num.bio': 'Bio',
    'num.mrd': 'Mrd',
    'num.mio': 'Mio',

    // ─── Map legends ───
    'map.extremelyHigh': 'Extrem hoch',
    'map.high': 'Hoch',
    'map.medium': 'Mittel',
    'map.low': 'Niedrig',
    'map.veryLow': 'Gering',
    'map.war': 'Krieg',
    'map.conflict': 'Konflikt',
    'map.unrest': 'Unruhen',
    'map.flightRoutes': 'Fluchtrouten',
    'map.mioDisplaced': '{val} Mio. Vertriebene',
    'map.intensity': 'Intensität:',
    'map.southSudan': 'Südsudan',
    'map.somalia': 'Somalia',
    'map.yemen': 'Jemen',
    'map.afghanistan': 'Afghanistan',
    'map.sudan': 'Sudan',
    'map.gaza': 'Gaza',
    'map.drCongo': 'DR Kongo',
    'map.syria': 'Syrien',
    'map.iran': 'Iran',
    'map.russia': 'Russland',
    'map.lebanon': 'Libanon',
    'map.iraq': 'Irak',
    'map.haiti': 'Haiti',
    'map.acutelyMalnourished': 'akut unterernährt',
    'map.famine': 'Hungersnot (IPC 5)',
    'map.emergency': 'Notfall (IPC 4)',
    'map.crisis': 'Krise (IPC 3)',
    'map.stress': 'Stress (IPC 2)',
    'map.noData': 'Keine Daten',
    'map.protected35': '>35% geschützt',
    'map.protected25': '25–35%',
    'map.protected15': '15–25%',
    'map.protected8': '8–15%',
    'map.protectedLow': '<8% geschützt',
    'map.forest': 'Wald: {val}% global',
    'map.renewable75': '>75% erneuerbar',
    'map.renewable50': '50–75%',
    'map.renewable30': '30–50%',
    'map.renewable15': '15–30%',
    'map.renewable5': '5–15%',
    'map.fossil': '<5% (fossil)',
    'map.renewableGlobal': '{val}% global',
    'map.worldMap': 'Weltkarte',

    // ─── Charts ───
    'chart.anomaly': 'Anomalie',
    'chart.top1': 'Top 1%',
    'chart.bottom50': 'Untere 50%',
    'chart.timesMore': '× mehr',

    // ─── Toggle ───
    'toggle.label': 'DE'
  },

  en: {
    // ─── Loading Screen ───
    'loading.sub': 'Loading world data from 40+ sources',

    // ─── Navigation ───
    'nav.aria': 'Section Navigation',
    'nav.prolog': 'Start',
    'nav.indicator': 'Index',
    'nav.environment': 'Environment',
    'nav.society': 'Society',
    'nav.economy': 'Economy',
    'nav.progress': 'Progress',
    'nav.realtime': 'Real-time',
    'nav.momentum': 'Momentum',
    'nav.crisis': 'Crises',
    'nav.scenarios': 'Scenarios',
    'nav.sources': 'Sources',
    'nav.action': 'Act',
    'nav.epilog': 'End',
    'nav.jumpTo': 'Jump to {label}',

    // ─── Prolog ───
    'prolog.title': 'How is the world doing? Really?',
    'prolog.subtitle': 'A data-driven scroll experience.',
    'prolog.sources': 'Data Sources',
    'prolog.cycle': 'Update Cycle',
    'prolog.rate': 'Success Rate',
    'prolog.scroll': 'Scroll to explore',

    // ─── Act 1 — World Indicator ───
    'act1.label': 'ACT 01',
    'act1.title': 'The World Indicator',
    'act1.desc': 'Calculated from hundreds of data points. No algorithm, no AI model — pure code, real data.',
    'act1.collapse': 'COLLAPSE',
    'act1.golden': 'GOLDEN AGE',
    'act1.zone.critical': 'CRITICAL',
    'act1.zone.concerning': 'CONCERNING',
    'act1.zone.mixed': 'MIXED',
    'act1.zone.positive': 'POSITIVE',
    'act1.zone.excellent': 'EXCELLENT',
    'act1.howTitle': 'How is the index calculated?',
    'act1.howText': 'Weighted average of 5 categories: Environment (25%), Society (25%), Economy (20%), Progress (20%), Momentum (10%). Each category is normalized from dozens of indicators to 0–100.',
    'act1.sub.environment': 'Environment',
    'act1.sub.society': 'Society',
    'act1.sub.economy': 'Economy',
    'act1.sub.progress': 'Progress',
    'act1.sub.momentum': 'Momentum',
    'act1.sub.weight25': '25% Weight',
    'act1.sub.weight20': '20% Weight',
    'act1.sub.weight10': '10% Weight',
    'act1.vsPeriod': 'vs. last period',

    // ─── Act 2 — Environment ───
    'act2.label': 'ACT 02 — ENVIRONMENT',
    'act2.title': 'The Planet Breathes',
    'act2.desc': 'Temperature, CO2, air, ice, forests, renewables — the vital signs of our Earth.',
    'act2.tempTitle': 'Temperature Anomaly 1880–2026',
    'act2.tempDesc': 'Each stripe = one year. Blue = cooler, Red = warmer than the average (1951–1980).',
    'act2.co2Explain': 'Parts per million in the atmosphere. Before industrialization: ~280 ppm. Highest level in 800,000 years.',
    'act2.tempExplain': 'Deviation from average (1951–1980). The Paris 1.5°C target is nearly reached.',
    'act2.co2ChartTitle': 'CO2 Concentration Over Time',
    'act2.arcticIce': 'ARCTIC ICE',
    'act2.today': 'Today',
    'act2.arcticExplain': 'Ice loss equals roughly the area of India.',
    'act2.forestLabel': 'FOREST AREA',
    'act2.forestExplain': 'Share of land area covered by forest. ~10M hectares lost per year.',
    'act2.renewableLabel': 'RENEWABLE ENERGY',
    'act2.renewableExplain': 'Share of total consumption. Growing exponentially thanks to solar & wind.',
    'act2.airTitle': 'Air Quality Worldwide',
    'act2.airDesc': 'AQI: 0–50 good, 51–100 moderate, 101–150 unhealthy for sensitive groups, 150+ unhealthy',
    'act2.weatherTitle': 'Current Weather Data',
    'act2.weatherDesc': 'Real-time data from 8 metropolises via Open-Meteo',

    // ─── Act 3 — Society ───
    'act3.label': 'ACT 03 — SOCIETY',
    'act3.title': 'We the People',
    'act3.desc': '8.1 billion. Conflicts, displacement, freedom, health — how we are doing.',
    'act3.population': 'WORLD POPULATION',
    'act3.popContext': '+1% per year',
    'act3.conflicts': 'ACTIVE CONFLICTS',
    'act3.conflictsContext': 'Wars & armed conflicts',
    'act3.lifeExp': 'LIFE EXPECTANCY',
    'act3.lifeExpContext': '1960: only 52.6 years',
    'act3.childMort': 'CHILD MORTALITY',
    'act3.childMortContext': 'per 1,000 live births',
    'act3.conflictMapTitle': 'Active Conflicts Worldwide',
    'act3.conflictMapDesc': 'Size = intensity. Red = war, Orange = conflict, Yellow = unrest',
    'act3.refugeeLabel': 'People displaced worldwide',
    'act3.refugeeSource': 'Source: UNHCR 2026 — More than ever in history',
    'act3.freedomTitle': 'Freedom Index Worldwide',
    'act3.freedomDesc': '195 countries rated by political rights & civil liberties',
    'act3.free': 'Free (84)',
    'act3.partlyFree': 'Partly free (56)',
    'act3.notFree': 'Not free (55)',
    'act3.freedomDecline': '18th consecutive year of decline — Freedom House 2026',
    'act3.lifeExpLabel': 'LIFE EXPECTANCY',
    'act3.lifeExpTrend': '+20.8 yrs since 1960',
    'act3.lifeExpExplain': 'Main drivers: medicine, hygiene, nutrition.',
    'act3.infraLabel': 'INFRASTRUCTURE ACCESS',
    'act3.infraElec': 'Electricity',
    'act3.infraWater': 'Clean Water',
    'act3.infraEdu': 'Education',
    'act3.infraExplain': 'Billions now have access to basic services — historically unique.',

    // ─── Act 4 — Economy ───
    'act4.label': 'ACT 04 — ECONOMY',
    'act4.title': 'The Engine',
    'act4.desc': 'Wealth, poverty, inequality, trade — the numbers behind the system.',
    'act4.billionaires': 'Billionaires worldwide',
    'act4.billionairesOwn': 'own 45.8% of global wealth',
    'act4.poverty': 'People in extreme poverty',
    'act4.povertyThreshold': 'under $2.15 per day',
    'act4.wealthTitle': 'Global Wealth Distribution',
    'act4.wealthDesc': 'The richest 1% owns more than the bottom half of humanity combined.',
    'act4.gdpGrowth': 'GDP GROWTH',
    'act4.gdpContext': 'Global 2026',
    'act4.inflation': 'INFLATION',
    'act4.inflationContext': 'Consumer prices',
    'act4.unemployment': 'UNEMPLOYMENT',
    'act4.unemploymentContext': 'Global rate',
    'act4.gdpPerCapita': 'GDP PER CAPITA',
    'act4.gdpPerCapitaContext': 'Average',
    'act4.giniExplain': '0 = equality, 1 = inequality. Global: 0.42 — trending down.',
    'act4.tradeLabel': 'GLOBAL TRADE',
    'act4.tradeExplain': 'Trade as % of GDP. Declining since 2008 due to protectionism.',
    'act4.exchangeLabel': 'EXCHANGE RATES (USD)',
    'act4.regionalGdp': 'REGIONAL GDP GROWTH',

    // ─── Act 5 — Progress ───
    'act5.label': 'ACT 05 — PROGRESS',
    'act5.title': 'The Curve',
    'act5.desc': 'Science, technology, education — progress is exponential.',
    'act5.internet': 'INTERNET USERS',
    'act5.internetContext': '5.4B online',
    'act5.literacy': 'LITERACY',
    'act5.literacyContext': '1900: only ~21%',
    'act5.mobile': 'MOBILE',
    'act5.mobileContext': 'Subs/100 people',
    'act5.rd': 'R&D SPENDING',
    'act5.rdContext': '% of global GDP',
    'act5.pubTitle': 'Scientific Publications Per Year',
    'act5.pubDesc': 'Exponential knowledge growth since the 1990s',
    'act5.githubLabel': 'GITHUB GLOBAL PULSE',
    'act5.commitsDay': 'Commits / Day',
    'act5.activeDev': 'Active Developers',
    'act5.githubExplain': 'Open source drives innovation. Developers worldwide solve problems together.',
    'act5.internetPen': 'INTERNET PENETRATION',
    'act5.literacyLabel': 'LITERACY',
    'act5.literacyGap': 'Gender gap is closing — but still {gap}% difference.',
    'act5.spaceflight': 'SPACEFLIGHT NEWS',
    'act5.latestScience': 'LATEST SCIENCE',

    // ─── Act 6 — Realtime ───
    'act6.label': 'ACT 06 — REAL-TIME',
    'act6.title': 'Real-Time Pulse',
    'act6.desc': 'Live data from around the world — updated every 6 hours from dozens of APIs.',
    'act6.earthquakes': 'Earthquakes (24h)',
    'act6.earthquakesDesc': 'USGS — All quakes M2.5+ in 24h',
    'act6.cleanCities': 'Cleanest Cities',
    'act6.dirtyCities': 'Most Polluted Cities',
    'act6.sentiment': 'News Sentiment',
    'act6.sentimentDesc': 'GDELT global news sentiment',
    'act6.fearGreed': 'Crypto Fear & Greed',
    'act6.fearGreedScale': '0 = Fear, 100 = Greed',
    'act6.solar': 'Solar Activity',
    'act6.volcanic': 'Volcanoes',
    'act6.news': 'Global News',
    'act6.newsDesc': 'UN, WHO, BBC, Al Jazeera, Guardian, DW, NASA, ReliefWeb etc.',
    'act6.loading': 'Loading...',

    // ─── Act 7 — Momentum ───
    'act7.label': 'ACT 07 — MOMENTUM',
    'act7.question': 'Is it getting better — or worse?',
    'act7.desc': 'Not where we stand — but where we are heading.',
    'act7.method': '<strong>Methodology:</strong> Comparing the last 3 years with the 3 years before for each indicator.',
    'act7.keyIndicators': '20 Key Indicators',
    'act7.trendsPositive': 'trends positive',
    'act7.vsToday': 'The World 2000 vs. Today',
    'act7.vsTodayDesc': '25 years of change — the facts',
    'act7.momentumScore': 'Momentum Score',
    'act7.momentumDesc': 'The direction vector of humanity.',
    'act7.improved': '✓ Improved',
    'act7.worsened': '✗ Worsened',

    // ─── Act 8 — Crisis Map ───
    'act8.label': 'ACT 08 — CRISES',
    'act8.title': 'The Crisis Map',
    'act8.desc': 'Climate, conflicts, hunger, natural disasters — and hope.',
    'act8.climate': 'Climate Risk',
    'act8.conflicts': 'Conflicts',
    'act8.hunger': 'Hunger Crises',
    'act8.nature': 'Conservation',
    'act8.energy': 'Renewables',
    'act8.mapPlaceholder': 'Interactive world map — layers toggleable',
    'act8.infoText': 'Reality is complex. There are crises and progress — simultaneously, everywhere. The question is not if, but how fast we respond.',

    // ─── Act 9 — Scenarios ───
    'act9.label': 'ACT 09 — SCENARIOS',
    'act9.title': 'Three Futures',
    'act9.desc': 'Projections to 2050 — based on current trends and scientific models.',
    'act9.pathA': 'PATH A',
    'act9.bauTitle': 'Business as Usual',
    'act9.bauSub': 'Current trajectory',
    'act9.pathB': 'PATH B',
    'act9.worstTitle': 'Worst Case',
    'act9.worstSub': 'Tipping points crossed',
    'act9.pathC': 'PATH C',
    'act9.bestTitle': 'Best Possible Course',
    'act9.bestSub': 'Full cooperation',

    // ─── Act 10 — Sources ───
    'act10.label': 'ACT 10 — TRANSPARENCY',
    'act10.title': 'Data Sources & Transparency',
    'act10.desc': 'Every data point verifiable. Every source linked. Open source.',
    'act10.sources': 'Sources',
    'act10.successful': 'Successful',
    'act10.rate': 'Rate',
    'act10.nextUpdate': 'Next Update',
    'act10.methodTitle': 'Methodology',
    'act10.methodText': 'No AI. Just code and data. All calculations open-source and reproducible.',
    'act10.methodNote': 'The World Indicator is based on weighted normalized sub-scores (0–100).',

    // ─── Act 11 — Action ───
    'act11.label': 'ACT 11 — ACT NOW',
    'act11.question': 'You\'ve seen the data.<br>What can YOU do?',
    'act11.localTitle': 'Act Locally',
    'act11.localDesc': 'Vote. Community projects. Shape local politics.',
    'act11.localImpact': 'Impact: Your city',
    'act11.digitalTitle': 'Contribute Digitally',
    'act11.digitalDesc': 'Open source. Data projects. Share knowledge.',
    'act11.digitalImpact': 'Impact: Global, immediate',
    'act11.globalTitle': 'Act Globally',
    'act11.globalDesc': 'Targeted donations. Effective altruism.',
    'act11.example1': '$1 = 4 meals',
    'act11.example2': '$5 = 1 vaccination',
    'act11.example3': '$25 = 1 month of school',

    // ─── Epilog ───
    'epilog.message': 'The data updates every 6 hours.<br>Come back — and see if something has changed.',
    'epilog.backToTop': 'Back to top',
    'epilog.easterEgg': 'You care.<br>That\'s the first step.',

    // ─── Footer ───
    'footer.invite': 'Open Source — contributions welcome!',
    'footer.contrib': 'Translations, detail views, improvements, issues — every contribution counts.',
    'footer.impressum': 'Legal Notice',
    'footer.impressumLegal': 'Information according to § 5 TMG / § 18 para. 2 MStV',
    'footer.contact': 'Contact',
    'footer.responsible': 'Responsible for content according to § 18 para. 2 MStV:',
    'footer.responsibleName': 'Belkis Aslani, address as above.',
    'footer.privacy': 'Privacy Policy',
    'footer.privacyController': '1. Controller',
    'footer.privacyControllerText': 'Belkis Aslani, Vogelsangstr. 32, 71691 Freiberg am Neckar. Email: belkis.aslani@gmail.com',
    'footer.privacyCollection': '2. Collection and processing of personal data',
    'footer.privacyCollectionText': 'This website does <em>not</em> collect, store, or process any personal data. No cookies are set, no tracking is used, and no analytics tools are employed.',
    'footer.privacyHosting': '3. Hosting',
    'footer.privacyHostingText': 'The website is hosted via GitHub Pages (GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). GitHub may collect server log files (IP address, browser type, timestamp).',
    'footer.privacyAPIs': '4. External APIs',
    'footer.privacyAPIsText': 'The displayed data is fetched server-side via GitHub Actions from public APIs (World Bank, NASA, WHO, etc.) and delivered as a static JSON file. No requests to third-party servers are made when visiting this page.',
    'footer.privacyRights': '5. Your Rights',
    'footer.privacyRightsText': 'Access, rectification, deletion, restriction, data portability, and objection under Art. 15–21 GDPR. Contact: belkis.aslani@gmail.com. Right to lodge a complaint with a supervisory authority (Art. 77 GDPR).',
    'footer.disclaimer': 'Disclaimer',
    'footer.disclaimerContent': 'Liability for Content',
    'footer.disclaimerContentText': 'The content of this website is created with the utmost care. However, no guarantee is given for the accuracy, completeness, and timeliness of the displayed data. Data comes from public sources and is processed automatically.',
    'footer.disclaimerLinks': 'Liability for Links',
    'footer.disclaimerLinksText': 'This website contains links to third-party external sites over whose content we have no influence. The respective provider is responsible for the content of linked pages.',

    // ─── Dynamic JS strings ───
    'js.loadError': 'Data could not be loaded.',
    'js.lastUpdate': 'Last update: {time}',
    'js.unknown': 'Unknown',
    'js.humidity': 'Humidity:',
    'js.wind': 'Wind:',
    'js.displaced': 'Internally Displaced',
    'js.asylumseekers': 'Asylum Seekers',
    'js.flightRoutes': 'Major Displacement Routes:',
    'js.maleLabel': 'Male: {val}%',
    'js.femaleLabel': 'Female: {val}%',
    'js.newRepos': 'new repos today',
    'js.activeDevs': 'active devs',
    'js.sunspotCount': 'Sunspot Number',
    'js.noData': 'No data',
    'js.activeVolcanoes': 'Active Volcanoes',
    'js.noReports': 'No current reports',
    'js.noTitle': 'Untitled',
    'js.soon': 'Soon',
    'js.years': 'Years',
    'js.giniIndex': 'Gini Index',
    'js.publications': 'Publications',
    'js.slightlyNeg': 'Slightly Negative',
    'js.improved': 'Improved',
    'js.worsened': 'Worsened',

    // ─── Spaceflight fallback ───
    'js.spaceFallback1': 'SpaceX Starship: Test Flight #8 Successful',
    'js.spaceFallback2': 'ESA Ariane 6: Second Commercial Launch',
    'js.spaceFallback3': 'NASA Artemis III: Crew Selection Confirmed',
    'js.spaceFallback4': 'ISRO: Chandrayaan-4 Mission Planned',

    // ─── Number formatting ───
    'num.bio': 'T',
    'num.mrd': 'B',
    'num.mio': 'M',

    // ─── Map legends ───
    'map.extremelyHigh': 'Extremely high',
    'map.high': 'High',
    'map.medium': 'Medium',
    'map.low': 'Low',
    'map.veryLow': 'Very low',
    'map.war': 'War',
    'map.conflict': 'Conflict',
    'map.unrest': 'Unrest',
    'map.flightRoutes': 'Displacement routes',
    'map.mioDisplaced': '{val}M displaced',
    'map.intensity': 'Intensity:',
    'map.southSudan': 'South Sudan',
    'map.somalia': 'Somalia',
    'map.yemen': 'Yemen',
    'map.afghanistan': 'Afghanistan',
    'map.sudan': 'Sudan',
    'map.gaza': 'Gaza',
    'map.drCongo': 'DR Congo',
    'map.syria': 'Syria',
    'map.iran': 'Iran',
    'map.russia': 'Russia',
    'map.lebanon': 'Lebanon',
    'map.iraq': 'Iraq',
    'map.haiti': 'Haiti',
    'map.acutelyMalnourished': 'acutely malnourished',
    'map.famine': 'Famine (IPC 5)',
    'map.emergency': 'Emergency (IPC 4)',
    'map.crisis': 'Crisis (IPC 3)',
    'map.stress': 'Stress (IPC 2)',
    'map.noData': 'No data',
    'map.protected35': '>35% protected',
    'map.protected25': '25–35%',
    'map.protected15': '15–25%',
    'map.protected8': '8–15%',
    'map.protectedLow': '<8% protected',
    'map.forest': 'Forest: {val}% global',
    'map.renewable75': '>75% renewable',
    'map.renewable50': '50–75%',
    'map.renewable30': '30–50%',
    'map.renewable15': '15–30%',
    'map.renewable5': '5–15%',
    'map.fossil': '<5% (fossil)',
    'map.renewableGlobal': '{val}% global',
    'map.worldMap': 'World Map',

    // ─── Charts ───
    'chart.anomaly': 'Anomaly',
    'chart.top1': 'Top 1%',
    'chart.bottom50': 'Bottom 50%',
    'chart.timesMore': '× more',

    // ─── Toggle ───
    'toggle.label': 'EN'
  }
};

class I18n {
  constructor() {
    this._lang = localStorage.getItem('belkis-lang') || 'de';
    this._listeners = [];
  }

  get lang() { return this._lang; }

  set lang(value) {
    if (value !== 'de' && value !== 'en') return;
    this._lang = value;
    localStorage.setItem('belkis-lang', value);
    document.documentElement.lang = value;
    this._applyToDOM();
    this._listeners.forEach(fn => fn(value));
  }

  toggle() {
    this.lang = this._lang === 'de' ? 'en' : 'de';
  }

  t(key, params = {}) {
    let str = translations[this._lang]?.[key] || translations.de[key] || key;
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v);
    });
    return str;
  }

  onChange(fn) {
    this._listeners.push(fn);
  }

  _applyToDOM() {
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = translation;
      } else {
        el.textContent = translation;
      }
    });

    // Translate aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', this.t(el.getAttribute('data-i18n-aria')));
    });

    // Update toggle button text
    const toggleLabel = document.querySelector('.lang-toggle__label');
    if (toggleLabel) {
      toggleLabel.textContent = this._lang === 'de' ? 'EN' : 'DE';
    }
  }

  init() {
    document.documentElement.lang = this._lang;
    this._applyToDOM();
  }
}

export const i18n = new I18n();
