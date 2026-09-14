(function(root){
  'use strict';
  const palettes={
    IndianFlag:{label:'Indian Flag',surface:'#f8f9fc',ink:'#172750',action:'#153eaa',actionText:'#ffffff',quiet:'#edf2ff',accent:'#ff9933',muted:'#59657c'},
    Jaisalmer:{label:'Jaisalmer',surface:'#fff8e9',ink:'#54210b',action:'#9a4f07',actionText:'#ffffff',quiet:'#fff3dc',accent:'#f2a51a',muted:'#735640'},
    Jodhpur:{label:'Jodhpur',surface:'#f4f7ff',ink:'#17366b',action:'#1f5496',actionText:'#ffffff',quiet:'#e6edff',accent:'#6da4ff',muted:'#526985'},
    Udaipur:{label:'Udaipur',surface:'#fffceb',ink:'#3d3b3b',action:'#4a4442',actionText:'#ffffff',quiet:'#f4eee0',accent:'#d2cac5',muted:'#68605d'},
    Jaipur:{label:'Jaipur',surface:'#fff5f0',ink:'#4b1d14',action:'#762817',actionText:'#ffffff',quiet:'#fff0e9',accent:'#c9775e',muted:'#72564e'},
    Peacock:{label:'Peacock',surface:'#f2fbfa',ink:'#123744',action:'#174a70',actionText:'#ffffff',quiet:'#e4f4f2',accent:'#3e93aa',muted:'#48626a'}
  };
  Object.values(palettes).forEach(p=>{p.colors=[p.action,p.accent,p.ink,p.ink,p.quiet];});
  const cityTheme={"Phoenix, AZ":'Jaisalmer',"San Diego, CA":'Jaisalmer',"Denver, CO":'Jaisalmer',"Dallas, TX":'Jaipur',"Houston, TX":'Jaipur',"Austin, TX":'Jaipur',"New York, NY":'Jodhpur',"Boston, MA":'Jodhpur',"Washington, DC":'Jodhpur',"Toronto, ON, Canada":'Peacock',"Vancouver, BC, Canada":'Peacock',"Montreal, QC, Canada":'Peacock'};
  const chapterTheme={national:'IndianFlag',northeast:'Jodhpur',mideast:'Jodhpur',midwest:'Udaipur',southwest:'Jaipur',southeast:'Jaisalmer','west-coast':'Peacock','canada-east':'Peacock','canada-west':'Jaisalmer'};
  const preferenceKey='forest-theme-preference-v1';
  const safe=value=>{const compact=String(value||'').replaceAll(' ','');return palettes[compact]?compact:'IndianFlag';};
  function currentPerson(data){try{const s=JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session;return data?.people.find(p=>p.id===s?.personaId)||null;}catch{return null;}}
  function themeForCity(city){if(cityTheme[city])return cityTheme[city];if(!city)return 'IndianFlag';const names=Object.keys(palettes).filter(n=>n!=='IndianFlag'),hash=[...city].reduce((n,c)=>n+c.charCodeAt(0),0);return names[hash%names.length];}
  function themeForChapter(id){return chapterTheme[id]||'IndianFlag';}
  function apply(value,{persist=true}={}){const name=safe(value),p=palettes[name],style=document.documentElement.style;document.documentElement.dataset.theme=name.toLowerCase();style.setProperty('--surface',p.surface);style.setProperty('--ink',p.ink);style.setProperty('--action',p.action);style.setProperty('--action-text',p.actionText);style.setProperty('--quiet',p.quiet);style.setProperty('--accent',p.accent);style.setProperty('--muted',p.muted);style.setProperty('--paper',p.surface);style.setProperty('--green',p.action);style.setProperty('--navy',p.ink);style.setProperty('--saffron',p.accent);style.setProperty('--india-green',p.action);p.colors.forEach((color,i)=>style.setProperty(`--theme-${i+1}`,color));try{localStorage.setItem('forest-theme-v1',name);if(persist)localStorage.setItem(preferenceKey,name);}catch{}return name;}
  function init(data){const person=currentPerson(data),chapter=root.ChapterCore?.forPerson(person),chapterKey=themeForChapter(chapter?.id),cityKey=themeForCity(person?.city||'');let preferred='';try{preferred=localStorage.getItem(preferenceKey)||'';}catch{}const active=apply(preferred||chapterKey||cityKey||'IndianFlag',{persist:false}),host=document.querySelector('#theme-picker');if(!host)return;host.innerHTML=`<label class="theme-picker"><span>Theme</span><select aria-label="Choose visual theme"><option value="__chapter__">${chapter?`${chapter.name} theme`:'Automatic theme'}</option>${Object.entries(palettes).map(([key,p])=>`<option value="${key}">${p.label}</option>`).join('')}</select></label>`;const select=host.querySelector('select');select.value=preferred?active:'__chapter__';select.onchange=()=>{if(select.value==='__chapter__'){try{localStorage.removeItem(preferenceKey);}catch{}apply(chapterKey||cityKey||'IndianFlag',{persist:false});}else apply(select.value);};}
  root.ThemePicker={palettes,apply,init,cityTheme,chapterTheme,themeForCity,themeForChapter,preferenceKey};
  if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{if(root.data)init(root.data);});
})(globalThis);
