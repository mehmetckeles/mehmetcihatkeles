(function(){
  var root=document.documentElement;
  function setTheme(t){root.setAttribute('data-theme',t);
    document.querySelectorAll('[data-theme-toggle]').forEach(function(b){b.textContent=t==='dark'?'Gündüz':'Gece'});
    try{localStorage.setItem('mck-theme',t)}catch(e){}}
  var saved=null;try{saved=localStorage.getItem('mck-theme')}catch(e){}
  setTheme(saved||(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  document.querySelectorAll('[data-theme-toggle]').forEach(function(b){b.addEventListener('click',function(){
    setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark')})});

  var sheet=document.getElementById('sheet'), openBtn=document.querySelector('[data-menu]');
  function open(){sheet.classList.add('open');openBtn.setAttribute('aria-expanded','true');document.body.style.overflow='hidden'}
  function close(){sheet.classList.remove('open');openBtn.setAttribute('aria-expanded','false');document.body.style.overflow=''}
  openBtn.addEventListener('click',open);
  document.querySelector('[data-menu-close]').addEventListener('click',close);
  sheet.querySelectorAll('[data-close]').forEach(function(a){a.addEventListener('click',close)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});

  var top=document.getElementById('top');
  addEventListener('scroll',function(){top.classList.toggle('scrolled',scrollY>8)},{passive:true});
})();
