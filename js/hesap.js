/* Ücret hesaplayıcı.
   Fiyatlar tek yerde: Ocak 2027 güncellemesinde yalnızca FIYAT değişir. */
var FIYAT={gece:2550, gunduz:1900, teslimSiniri:"15:00",
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
      if(g===0){per=FIYAT.gunduz;h+=row('Gündüz misafirliği · aynı gün teslim',tl(FIYAT.gunduz));}
      else{
        per=g*FIYAT.gece; h+=row(g+' gece × '+tl(FIYAT.gece),tl(g*FIYAT.gece));
        if(t>FIYAT.teslimSiniri){per+=FIYAT.gunduz;h+=row('Çıkış günü '+sinir+' sonrası · gündüz misafirliği',tl(FIYAT.gunduz));}
        else h+=row('Çıkış günü '+sinir+' öncesi teslim','0 TL');
      }
      var sub=per*n, kd=FIYAT.kopekIndirimi(n), gd=g>0?FIYAT.geceIndirimi(g):0;
      if(n>1) h+=row(n+' köpek','× '+n);
      if(kd||gd||n>1) h+=row('Ara toplam',tl(sub));
      var tot=sub;
      if(kd){var x=Math.round(sub*kd/100);tot-=x;h+=row(n+' köpek indirimi (%'+kd+')','−'+tl(x),'minus');}
      if(gd){var y=Math.round(sub*gd/100);tot-=y;h+=row(g+' gece indirimi (%'+gd+')','−'+tl(y),'minus');}
      h+=row('Toplam',tl(tot),'total');
      h+='<p class="fine">Tutarı ön rezervasyondan sonra telefonda birlikte teyit ederiz.</p>';
      h+='<div class="actions"><a class="btn ghost" href="'+rezLink+'?giris='+a+'&cikis='+b+'">'+(g>0?'Bu tarihlerle ön rezervasyon':'Bu gün için ön rezervasyon')+' <span class="ar">→</span></a></div>';
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
