# mehmetcihatkeles.com

Mehmet Cihat Keleş'in kişisel sitesi. GitHub Pages'te yayınlanır.

## Sayfalar
- `index.html` ana sayfa · `konaklama.html` konaklama, ücret hesaplama ve formlar
- `tut.html` Temel Uyum Terapisi · `cv.html` CV · `yazilar.html` + `yazi/` yazılar

## Yeni yazı eklemek
1. `icerik/yazilar/` altına mevcut yazılardaki biçimde bir `.md` dosyası koy.
2. `python3 build.py` çalıştır. Yazı sayfası, Yazılar listesi ve ana sayfadaki "Son yazılar" güncellenir.

## Fiyatı güncellemek
`js/hesap.js` dosyasının başındaki `var FIYAT={gece:..., gunduz:...}` satırı. Ücret, hesaplayıcı ve gündüz ücreti oradan beslenir.
Fiyat geçmişi tablosuna yeni satır aynı dosyada, `<table class="hist">` içine eklenir.

## Formlar
Tanışma (`tanisma-gorusmesi/`) ve ön rezervasyon (`on-rezervasyon/`) formları Google Form'a gönderir (`js/form.js` içinde `FORM` ve `ALAN`).
Cevaplar Drive'daki "Site talepleri · mehmetcihatkeles.com" tablosuna düşer; her yeni talepte e-posta bildirimi gelir.

## Eski adresler
`post/…` ve `blog/`, `on-rezervasyon/` gibi klasörler, Wix'teki eski adresleri yeni sayfalara yönlendirir.

## Yazı boyutları

Sitedeki bütün yazı boyutları `css/site.css` dosyasının başındaki dokuz basamaklı ölçekten gelir (`--t-etiket`, `--t-kucuk`, `--t-metin`, `--t-govde`, `--t-giris`, `--t-ara`, `--t-bolum`, `--t-sayfa`, `--t-vitrin`). Yeni bir öğe eklerken bunlardan birini kullanın; yeni bir piksel değeri yazmayın. Bir basamağı değiştirmek, o basamağı kullanan her yeri birlikte değiştirir.

## Paylaşım görseli ve arama motorları

- Bağlantı WhatsApp, Instagram ya da başka bir yerde paylaşıldığında görünen görsel `img/paylasim.jpg` (1200×630). Değiştirmek için aynı adla yenisini koymak yeterli.
- `sitemap.xml` ve `robots.txt` arama motorları için. Yeni bir yazı eklendiğinde `sitemap.xml`'e bir satır eklenir.
