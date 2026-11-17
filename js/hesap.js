/* Ücret hesaplayıcı.
   Fiyatlar tek yerde: Ocak 2027 güncellemesinde yalnızca FIYAT değişir. */
var FIYAT={gece:2550, gunduz:1900, teslimSiniri:"15:00",
  /* kreş: üç ay içinde en az 4 gün planlayan ailelere */
  kresIndirimi:function(gun,aralik){return (gun>=4&&aralik<=92)?20:0},
  kopekIndirimi:function(n){return n>=3?15:(n===2?10:0)},
  geceIndirimi:function(g){return g>=10?10:(g>=5?5:0)}};

(function(){
  var tl=function(n){return n.toLocaleString('tr-TR')+' TL'};
  document.querySelectorAll('[data-price="night"]').forEach(function(e){e.textContent=tl(FIYAT.gece)});
  document.querySelectorAll('[data-price="day"]').forEach(function(e){e.textContent=tl(FIYAT.gunduz)});
  var iso=function(x){return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  function nights(a,b){var A=new Date(a+'T12:00'),B=new Date(b+'T12:00');return Math.round((B-A)/864e5)}
  function row(l,v,cls){return '<div class="row'+(cls?' '+cls:'')+'"><span>'+l+'</span><span>'+v+'</span></div>'}

  function init(root){
    var q=function(c){return root.querySelector(c)};
    var n=1, out=q('.c-n'), res=q('.c-res'), rezLink=root.dataset.rez||'on-rezervasyon/';
    /* aynı gün seçilince: kreş için başka günler eklenebilir */
    var kutu=document.createElement('div'); kutu.className='c-gunler'; kutu.hidden=true;
    kutu.innerHTML='<div class="c-ek"></div><button type="button" class="btn ghost ek-ekle">+ Bir gün daha ekle</button>';
    q('.grid-in').after(kutu);
    var ekListe=kutu.querySelector('.c-ek');
    kutu.querySelector('.ek-ekle').addEventListener('click',function(){
      if(ekListe.children.length>=14) return;
      var r=document.createElement('div'); r.className='ek-gun';
      r.innerHTML='<input type="date" aria-label="Kreş günü"><button type="button" aria-label="Bu günü çıkar">Çıkar</button>';
      r.querySelector('input').addEventListener('change',calc); r.querySelector('input').addEventListener('input',calc);
      r.querySelector('button').addEventListener('click',function(){r.remove();calc()});
      ekListe.appendChild(r); r.querySelector('input').focus({preventScroll:true});
    });
    root.querySelectorAll('[data-step]').forEach(function(b){b.addEventListener('click',function(){
      n=Math.min(10,Math.max(1,n+(+b.dataset.step))); out.textContent=n; calc();})});
    ['.c-in','.c-out','.c-time'].forEach(function(c){q(c).addEventListener('input',calc);q(c).addEventListener('change',calc)});
    var d=new Date(); d.setDate(d.getDate()+1); q('.c-in').value=iso(d);
    var d2=new Date(d); d2.setDate(d2.getDate()+3); q('.c-out').value=iso(d2);
    function calc(){
      var a=q('.c-in').value,b=q('.c-out').value,t=q('.c-time').value||'12:00';
      if(!a||!b){res.innerHTML='';return}
      var g=nights(a,b);
      if(g<0){res.innerHTML='<p class="err">Çıkış günü, giriş gününden önce olamaz.</p>';return}
      var h='',per=0,sinir=FIYAT.teslimSiniri.replace(':','.');
      kutu.hidden=g!==0;
      var gunler=[a], kres=0;
      if(g===0){
        [].forEach.call(ekListe.querySelectorAll('input'),function(i){if(i.value&&gunler.indexOf(i.value)<0)gunler.push(i.value)});
        gunler.sort();
        var k=gunler.length, aralik=nights(gunler[0],gunler[k-1]);
        per=k*FIYAT.gunduz;
        h+=row(k===1?'Gündüz misafirliği · aynı gün teslim':k+' gün kreş × '+tl(FIYAT.gunduz),tl(per));
        kres=FIYAT.kresIndirimi(k,aralik);
        var kresNot=(k>=4&&!kres)?'<p class="fine">Dört günlük kreş indirimi, üç ay içindeki günlere uygulanır.</p>':'';
      }
      else{
        per=g*FIYAT.gece; h+=row(g+' gece × '+tl(FIYAT.gece),tl(g*FIYAT.gece));
        if(t>FIYAT.teslimSiniri){per+=FIYAT.gunduz;h+=row('Çıkış günü '+sinir+' sonrası · gündüz misafirliği',tl(FIYAT.gunduz));}
        else h+=row('Çıkış günü '+sinir+' öncesi teslim','0 TL');
      }
      var sub=per*n, kd=FIYAT.kopekIndirimi(n), gd=g>0?FIYAT.geceIndirimi(g):0;
      if(n>1) h+=row(n+' köpek','× '+n);
      if(kd||gd||kres||n>1) h+=row('Ara toplam',tl(sub));
      var tot=sub;
      if(kd){var x=Math.round(sub*kd/100);tot-=x;h+=row(n+' köpek indirimi (%'+kd+')','−'+tl(x),'minus');}
      if(gd){var y=Math.round(sub*gd/100);tot-=y;h+=row(g+' gece indirimi (%'+gd+')','−'+tl(y),'minus');}
      if(kres){var z=Math.round(sub*kres/100);tot-=z;h+=row(gunler.length+' günlük kreş indirimi (%'+kres+')','−'+tl(z),'minus');}
      h+=row('Toplam',tl(tot),'total');
      if(g===0&&kresNot) h+=kresNot;
      h+='<p class="fine">Tutarı ön rezervasyondan sonra telefonda birlikte teyit ederiz.</p>';
      var ekq=(g===0&&gunler.length>1)?'&ek='+gunler.filter(function(x){return x!==a}).join(','):'';
      h+='<div class="actions"><a class="btn ghost" href="'+rezLink+'?giris='+a+'&cikis='+b+ekq+'">'+(g>0?'Bu tarihlerle ön rezervasyon':(gunler.length>1?'Bu günler için ön rezervasyon':'Bu gün için ön rezervasyon'))+' <span class="ar">→</span></a></div>';
      res.innerHTML=h;
    }
    calc();
  }
  document.querySelectorAll('[data-calc]').forEach(init);

  /* alttan açılan panel: sayfa yerinden oynamaz */
  var panel=document.getElementById('hesap-panel');
  if(panel){
    var last=null;
    function open(){last=document.activeElement;panel.hidden=false;requestAnimationFrame(function(){panel.classList.add('open')});document.body.style.overflow='hidden';var c=panel.querySelector('.sheet-close');c&&c.focus({preventScroll:true})}
    function close(){panel.classList.remove('open');document.body.style.overflow='';setTimeout(function(){panel.hidden=true},250);if(last)try{last.focus({preventScroll:true})}catch(e){}}
    document.querySelectorAll('[data-open-calc]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();open()})});
    panel.querySelectorAll('[data-close-calc]').forEach(function(b){b.addEventListener('click',close)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden)close()});
    if(location.hash==='#hesapla'){open();history.replaceState(null,'',location.pathname)}
  }
})();
