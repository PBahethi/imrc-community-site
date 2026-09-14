(function(){
  'use strict';
  let data;
  function sync(){if(!data)return;globalThis.ThemePicker?.init(data);globalThis.ChapterCore?.decorate(data);const hash=location.hash.slice(1),[view,id]=hash.split('/');if(view==='votes')globalThis.Voting?.render();if(view==='chapters')globalThis.Chapter?.render(data,'national');if(view==='chapter')globalThis.Chapter?.render(data,decodeURIComponent(id||'national'));}
  fetch('./data.json').then(r=>r.json()).then(d=>{data=d;sync();window.addEventListener('hashchange',sync);});
})();
document.addEventListener('click',event=>{const button=event.target.closest?.('.help');if(!button)return;const wrap=button.parentElement,rect=button.getBoundingClientRect();wrap.classList.toggle('edge',rect.right+260>window.innerWidth);});
