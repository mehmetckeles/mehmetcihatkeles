/*
 * Site talepleri · anında bildirim
 * "Site talepleri · mehmetcihatkeles.com" tablosuna bağlı Apps Script.
 * Formdan yeni bir talep düştüğünde Mehmet'e e-posta gönderir: kişinin adı,
 * köpeği, tarihleri ve hazır mesajla açılan "WhatsApp'ta yanıtla" düğmesi.
 *
 * Kurulum: Uzantılar → Apps Script → bu dosyayı yapıştır → kur() çalıştır.
 * Deneme: sonTalebiGonder() tablodaki son talep için e-postayı yeniden yollar.
 */

var AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

var KADIN = ('ayşe fatma emine hatice zeynep elif merve büşra esra özge özlem gamze gizem derya ebru ece eda ela elçin '+
  'esin ezgi gül gülay gülşen hande hülya ipek irem kübra leyla melek melike meltem merve nazlı neslihan nihan nil nilay '+
  'nilüfer nur nuray nurcan pelin pınar rabia seda selin selma serap sevgi sevil sevim sibel sinem şeyma şule tuba tuğba '+
  'tülay yasemin yeşim zehra zerrin aslı aysun aylin aynur bahar banu başak berna betül beyza burcu canan cansu ceren cemre '+
  'damla defne dilek dilara didem duygu dilan ecem elvan emel esma feride figen filiz funda gonca gökçe hilal ilknur ilayda '+
  'işıl kader lale mine mehtap müge naz nazan nermin nesrin oya özden reyhan rukiye sema semra serpil sevda songül şebnem '+
  'şirin tuğçe türkan yağmur yıldız zuhal açelya aleyna arzu asena aybike aysel azra bengü berrak buse cennet çiğdem '+
  'ece elanur fadime feyza gülsüm hacer hale havva jale kevser lerzan mediha nalan necla nergis nevin perihan saadet sanem '+
  'selda serra simge sude şenay tijen ümran yeliz zübeyde melis melisa beril bilge ayten aynur ayşegül ebrar ilknur gülsen').split(' ');

var ERKEK = ('ahmet mehmet mustafa ali hüseyin hasan ibrahim ismail osman yusuf murat ömer ramazan halil süleyman abdullah '+
  'mahmut recep salih fatih kadir emre burak serkan kemal cem can onur tolga volkan erkan erdem ercan erhan ozan oğuz orhan '+
  'okan hakan kaan kerem koray kubilay levent metin mert mesut necati nihat nuri orçun serdar sinan tuncay tarık tamer '+
  'taner tayfun uğur ufuk yavuz yasin yiğit yunus zafer bülent cengiz cihan cihat çağlar çağatay doğan engin enes eren '+
  'ertuğrul faruk ferhat furkan gökhan güven harun ilker ilhan kenan kürşat batuhan baran barış berk berkay bora caner '+
  'emir emirhan erol ersin göktuğ görkem hamza hikmet ilyas kamil kazım koray mehmetcan muhammed musa nazım oktay özgür '+
  'rıza sami sedat selim semih sercan şahin şükrü tahsin turgut tuncer turan utku vedat veli yalçın yılmaz zeki adem '+
  'alper arda atakan aydın bekir burhan cüneyt dursun egemen eyüp ferdi gürkan hilmi ihsan irfan kutay mithat nedim '+
  'necip nevzat oğuzhan önder rüştü sadık sait sefa selçuk sertaç tufan ümit taylan yasir yener').split(' ');

function kur() {
  var ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'talepGeldi') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('talepGeldi').forSpreadsheet(ss).onFormSubmit().create();
}

function talepGeldi(e) {
  var sayfa = e && e.range ? e.range.getSheet() : SpreadsheetApp.getActive().getSheets()[0];
  var satir = e && e.range ? e.range.getRow() : sayfa.getLastRow();
  satiriGonder(sayfa, satir);
}

function sonTalebiGonder() {
  var sayfa = SpreadsheetApp.getActive().getSheets()[0];
  satiriGonder(sayfa, sayfa.getLastRow());
}

function satiriGonder(sayfa, satir) {
  var v = sayfa.getRange(satir, 1, 1, 7).getDisplayValues()[0];
  var t = talepOku(v);
  var b = bildirim(t, sayfa.getParent().getUrl());
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: b.konu,
    body: b.duz,
    htmlBody: b.html,
    name: 'Site talepleri'
  });
}

/* ---------- talebi okuma ---------- */

function kucuk(s) { return String(s).replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase(); }
function buyukBas(s) {
  s = kucuk(s);
  var ilk = s.charAt(0);
  ilk = ilk === 'i' ? 'İ' : (ilk === 'ı' ? 'I' : ilk.toUpperCase());
  return ilk + s.slice(1);
}
function kelimeler(s) { return String(s).trim().split(/\s+/).filter(Boolean).map(buyukBas).join(' '); }

function hitap(adSoyad) {
  var ad = kelimeler(adSoyad).split(' ')[0] || '';
  if (!ad) return 'Merhaba';
  var k = kucuk(ad);
  if (KADIN.indexOf(k) > -1) return 'Merhaba ' + ad + ' Hanım';
  if (ERKEK.indexOf(k) > -1) return 'Merhaba ' + ad + ' Bey';
  return 'Merhaba ' + ad;
}

function kopekAdi(s) {
  var parca = String(s).split(/[,(\/;:\-–]/)[0].trim();
  if (!parca) return '';
  if (/\s(ve|&|ile)\s/i.test(' ' + parca + ' ')) return kelimeler(parca).replace(/ (Ve|İle) /g, function (m) { return kucuk(m); });
  return buyukBas(parca.split(/\s+/)[0]);
}

function tarihCoz(s) {
  var m = String(s).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  return m ? { g: +m[1], a: +m[2], y: +m[3] } : null;
}
function tarihYaz(d, buYil) {
  return d.g + ' ' + AYLAR[d.a - 1] + (d.y !== buYil ? ' ' + d.y : '');
}
function liste(arr) {
  if (arr.length < 2) return arr.join('');
  return arr.slice(0, -1).join(', ') + ' ve ' + arr[arr.length - 1];
}

function telefon(s) {
  var r = String(s).replace(/\D/g, '');
  if (/^0\d{10}$/.test(r)) r = '9' + r;
  else if (/^5\d{9}$/.test(r)) r = '90' + r;
  return r.length >= 11 ? r : '';
}

function talepOku(v) {
  var t = { zaman: v[0], tur: v[1], adSoyad: kelimeler(v[2]), tel: v[3], kopek: v[4], tarihler: v[5], ayrinti: v[6] };
  var buYil = new Date().getFullYear();
  var ham = String(v[5]);
  t.kopekAdi = kopekAdi(v[4]);
  t.hitap = hitap(v[2]);
  t.wa = telefon(v[3]);
  if (/^tan[ıi]şma/i.test(t.tur)) {
    t.cesit = 'tanisma';
  } else if (/^g[üu]nd[üu]z/i.test(ham)) {
    t.cesit = 'gunduz';
    t.gunler = (ham.match(/\d{1,2}\.\d{1,2}\.\d{4}/g) || []).map(tarihCoz);
  } else {
    var iki = ham.split(/→|->/);
    t.cesit = 'konaklama';
    t.giris = tarihCoz(iki[0]);
    t.cikis = iki[1] ? tarihCoz(iki[1]) : null;
  }
  t.buYil = buYil;
  return t;
}

/* ---------- mesaj ---------- */

function whatsappMetni(t) {
  var icin = t.kopekAdi ? t.kopekAdi + ' için ' : '';
  if (t.cesit === 'tanisma') {
    return t.hitap + ', ' + icin + 'tanışma talebinizi aldım. Uygun bir günü birlikte belirlemek için sizi arayacağım.';
  }
  if (t.cesit === 'gunduz' && t.gunler && t.gunler.length) {
    var g = t.gunler.map(function (d) { return tarihYaz(d, t.buYil); });
    return t.hitap + ', ' + icin + liste(g) + (g.length > 1 ? ' tarihlerindeki' : ' tarihindeki') +
      ' gündüz misafirliği talebinizi aldım. Görüşmek üzere.';
  }
  if (t.cesit === 'konaklama' && t.giris && t.cikis) {
    return t.hitap + ', ' + icin + tarihYaz(t.giris, t.buYil) + ' – ' + tarihYaz(t.cikis, t.buYil) +
      ' tarihlerindeki konaklama talebinizi aldım. Görüşmek üzere.';
  }
  return t.hitap + ', ' + icin + 'ön rezervasyon talebinizi aldım. Görüşmek üzere.';
}

function ozet(t) {
  if (t.cesit === 'tanisma') return 'Tanışma';
  if (t.cesit === 'gunduz') {
    var n = t.gunler ? t.gunler.length : 0;
    return 'Gündüz misafirliği' + (n ? ', ' + n + ' gün' : '');
  }
  if (t.giris && t.cikis) return 'Konaklama, ' + tarihYaz(t.giris, t.buYil) + ' – ' + tarihYaz(t.cikis, t.buYil);
  return 'Ön rezervasyon';
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function bildirim(t, tabloUrl) {
  var metin = whatsappMetni(t);
  var link = t.wa ? 'https://wa.me/' + t.wa + '?text=' + encodeURIComponent(metin) : '';
  var deneme = /deneme/i.test(t.tur + ' ' + t.adSoyad) ? 'Deneme · ' : '';
  var konu = deneme + 'Yeni talep · ' + (t.adSoyad || 'İsimsiz') + ' · ' + ozet(t);

  var satirlar = [
    ['Tür', t.tur], ['Ad', t.adSoyad], ['Telefon', t.tel], ['Köpek', t.kopek],
    ['Tarihler', t.tarihler], ['Ayrıntılar', t.ayrinti], ['Geldiği an', t.zaman]
  ].filter(function (r) { return String(r[1]).trim(); });

  var duz = konu + '\n\n' + satirlar.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
    '\n\nHazır yanıt:\n' + metin + (link ? '\n\nWhatsApp\'ta yanıtla: ' + link : '') + '\n\nTablo: ' + tabloUrl;

  var tr = satirlar.map(function (r) {
    var deger = r[0] === 'Telefon' && t.wa
      ? '<a href="tel:+' + t.wa + '" style="color:#1a1a1a">' + esc(r[1]) + '</a>'
      : esc(r[1]).replace(/\n/g, '<br>');
    return '<tr><td style="padding:6px 14px 6px 0;color:#777;vertical-align:top;white-space:nowrap">' + r[0] +
      '</td><td style="padding:6px 0;color:#1a1a1a">' + deger + '</td></tr>';
  }).join('');

  var dugme = link
    ? '<a href="' + link + '" style="display:inline-block;background:#1f8f4e;color:#fff;text-decoration:none;' +
      'font-weight:600;font-size:17px;padding:14px 26px;border-radius:10px">WhatsApp\'ta yanıtla</a>'
    : '<p style="color:#a33">Telefon numarası okunamadı; yanıtı elle göndermek gerekiyor.</p>';

  var html =
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.5;max-width:560px">' +
    '<p style="margin:0 0 4px;color:#777;font-size:13px">' + esc(deneme) + 'mehmetcihatkeles.com · yeni talep</p>' +
    '<h2 style="margin:0 0 16px;font-size:21px;color:#1a1a1a">' + esc(t.adSoyad || 'İsimsiz') + ' · ' + esc(ozet(t)) + '</h2>' +
    '<table style="border-collapse:collapse;margin:0 0 20px">' + tr + '</table>' +
    '<p style="margin:0 0 6px;color:#777;font-size:13px">Hazır yanıt</p>' +
    '<div style="background:#f3f1ea;border-radius:10px;padding:12px 14px;margin:0 0 18px;color:#1a1a1a">' + esc(metin) + '</div>' +
    dugme +
    '<p style="margin:22px 0 0;font-size:13px;color:#777">Düğme WhatsApp\'ı bu mesajla açar; göndermeden önce değiştirebilirsiniz. ' +
    '<a href="' + tabloUrl + '" style="color:#777">Tüm talepler</a></p>' +
    '</div>';

  return { konu: konu, duz: duz, html: html, metin: metin, link: link };
}
