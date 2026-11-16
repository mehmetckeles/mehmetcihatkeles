/* Talep formları: Google Form'a gider, Drive'daki "Site talepleri" tablosuna düşer, e-posta bildirimi gelir. */
(function(){
  var FORM='https://docs.google.com/forms/d/e/1FAIpQLSdfu0jZr6BJRK3GxRTbwdAbm5t7yUwNxJz2gHfAoy1aWvlW6g/formResponse';
  var ALAN={tur:'entry.1679659265',ad:'entry.1228144126',tel:'entry.1329993373',kopek:'entry.2127242662',tarih:'entry.130478542',ayrinti:'entry.71232531'};
  var ETIKET={semt:'Semt',yas:'Yaşı',cinsiyet:'Cinsiyeti',kisir:'Kısırlaştırıldı mı',iliski:'Diğer köpeklerle',asi:'Aşı ve parazit',alerji:'Alerji',karakter:'Anlatılanlar',konaklama_tarihleri:'Düşünülen konaklama',uygun_zaman:'Tanışma için uygun zaman',degisiklik:'Son görüşmeden beri değişiklik',ilac:'İlaç / özel bakım'};
  function trTarih(v){if(!v)return'';var p=v.split('-');return p[2]+'.'+p[1]+'.'+p[0]}
  function gonder(f){
    var fd=new FormData(f), tur=f.dataset.form==='tanisma'?'Tanışma':'Ön rezervasyon', satir=[];
    Object.keys(ETIKET).forEach(function(k){var v=(fd.get(k)||'').toString().trim(); if(v) satir.push(ETIKET[k]+': '+v)});
    var tarih=tur==='Tanışma'?(fd.get('konaklama_tarihleri')||''):(trTarih(fd.get('giris'))+' → '+trTarih(fd.get('cikis')));
    var p=new URLSearchParams();
    p.append(ALAN.tur,tur);
    p.append(ALAN.ad,((fd.get('ad')||'')+' '+(fd.get('soyad')||'')).trim());
    p.append(ALAN.tel,fd.get('telefon')||'');
    p.append(ALAN.kopek,fd.get('kopek')||'');
    p.append(ALAN.tarih,tarih);
    p.append(ALAN.ayrinti,satir.join('\n'));
    return fetch(FORM,{method:'POST',mode:'no-cors',body:p});
  }
  /* hesaplayıcıdan gelen tarihler */
  var u=new URLSearchParams(location.search);
  ['giris','cikis'].forEach(function(k){var el=document.querySelector('[name="'+k+'"]'); if(el&&u.get(k)) el.value=u.get(k)});

  document.querySelectorAll('form[data-form]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      f.querySelectorAll('.field').forEach(function(x){x.classList.remove('bad')});
      var bad=[].slice.call(f.querySelectorAll('[required]')).filter(function(el){
        if(el.type==='radio') return !f.querySelector('input[name="'+el.name+'"]:checked');
        return !el.value.trim();});
      var warn=f.querySelector('.warn');
      if(bad.length){
        bad.forEach(function(el){el.closest('.field').classList.add('bad')});
        warn.hidden=false;
        warn.textContent=bad.length===1?'Bir soru eksik kaldı; işaretli soruya bakar mısınız?':bad.length+' soru eksik kaldı; işaretli sorulara bakar mısınız?';
        return;
      }
      warn.hidden=true;
      var btn=f.querySelector('button[type=submit]'); btn.disabled=true;
      gonder(f).then(function(){
        f.hidden=true;
        var ok=document.getElementById('tesekkur'); ok.hidden=false;
        window.scrollTo(0,0);
      }).catch(function(){
        btn.disabled=false; warn.hidden=false;
        warn.textContent='Gönderilemedi; bağlantıda bir sorun olmuş olabilir. Biraz sonra yeniden deneyebilir ya da WhatsApp\'tan yazabilirsiniz: 0505 280 64 48';
      });
    });
  });
})();
