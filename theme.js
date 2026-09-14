(function(root){
  'use strict';
  const palettes={
    IndianFlag:{label:'Indian Flag',colors:['#153eaa','#ff9933','#138808','#000080','#edf2ff']},
    Jaisalmer:{label:'Jaisalmer',colors:['#b85f08','#f2a51a','#2d727b','#6f8400','#fff8e9']},
    Jodhpur:{label:'Jodhpur',colors:['#b0c3ff','#9fb8ff','#6da4ff','#538fff','#2663b7']},
    Udaipur:{label:'Udaipur',colors:['#fffceb','#f4eee0','#e9e0d4','#d2cac5','#c5bebe']},
    Jaipur:{label:'Jaipur',colors:['#762817','#a5422c','#c9775e','#6b2618','#fff5f0']},
    Peacock:{label:'Peacock',colors:['#174a70','#236f7a','#3e93aa','#0c6b67','#f2fbfa']}
  };
  const cityTheme={"Phoenix, AZ":'Jaisalmer',"San Diego, CA":'Jaisalmer',"Denver, CO":'Jaisalmer',"Dallas, TX":'Jaipur',"Houston, TX":'Jaipur',"Austin, TX":'Jaipur',"New York, NY":'Jodhpur',"Boston, MA":'Jodhpur',"Washington, DC":'Jodhpur',"Toronto, ON, Canada":'Peacock',"Vancouver, BC, Canada":'Peacock',"Montreal, QC, Canada":'Peacock'};
  const chapterTheme={national:'Indian Flag',northeast:'Jodhpur',mideast:'Jodhpur',midwest:'Udaipur',southwest:'Jaipur',southeast:'Jaisalmer','west-coast':'Peacock','canada-east':'Peacock','canada-west':'Jaisalmer'};
  const safe=v=>v==='National'?'IndianFlag':palettes[v]?v:'Udaipur';
  function currentCity(data){try{const s=JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session;return data?.people.find(p=>p.id===s?.personaId)?.city||'';}catch{return '';}}
  function themeForCity(city){if(cityTheme[city])return cityTheme[city];if(!city)return 'IndianFlag';const names=Object.keys(palettes).filter(n=>n!=='IndianFlag'),hash=[...city].reduce((n,c)=>n+c.charCodeAt(0),0);return names[hash%names.length];}
  function themeForChapter(id){return chapterTheme[id]||'Udaipur';}
  function apply(name){name=safe(name);const p=palettes[name],foreground={IndianFlag:'#172750',Jaisalmer:'#54210b',Jodhpur:'#17366b',Udaipur:'#3d3b3b',Jaipur:'#4b1d14',Peacock:'#123744'}[name]||'#172750',surface={IndianFlag:'#f8f9fc',Jaisalmer:'#fff8e9',Jodhpur:'#f4f7ff',Udaipur:'#fffceb',Jaipur:'#fff5f0',Peacock:'#f2fbfa'}[name]||'#f8f9fc';document.documentElement.dataset.theme=name.toLowerCase();p.colors.forEach((color,i)=>document.documentElement.style.setProperty(`--theme-${i+1}`,color));document.documentElement.style.setProperty('--green',foreground);document.documentElement.style.setProperty('--navy',foreground);document.documentElement.style.setProperty('--saffron',p.colors[1]);document.documentElement.style.setProperty('--india-green',p.colors[3]);document.documentElement.style.setProperty('--paper',surface);document.documentElement.style.setProperty('--ink',foreground);document.documentElement.style.setProperty('--muted',name==='Peacock'?'#48626a':name==='Jaipur'?'#72564e':'#59657c');try{localStorage.setItem('forest-theme-v1',name);}catch{}return name;}
  function init(data){let saved='';try{saved=localStorage.getItem('forest-theme-v1')||'';}catch{}let chapter='';try{const s=JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session,p=data?.people.find(x=>x.id===s?.personaId);chapter=root.ChapterCore?.forPerson(p)?.id||'';}catch{}apply(safe(chapter?themeForChapter(chapter):(saved||themeForCity(currentCity(data)))));const host=document.querySelector('#theme-picker');if(!host)return;host.innerHTML=`<label class="theme-picker"><span>Theme</span><select aria-label="Choose visual theme">${Object.values(palettes).map(p=>`<option value="${p.label}">${p.label}</option>`).join('')}</select></label>`;const select=host.querySelector('select');select.value=Object.values(palettes).find(p=>p.label.toLowerCase().replaceAll(' ','')===document.documentElement.dataset.theme)?.label||'Indian Flag';select.onchange=()=>apply(select.value);}
  root.ThemePicker={palettes,apply,init,cityTheme,chapterTheme,themeForCity,themeForChapter};
  if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{if(root.data) init(root.data);});
})(globalThis);
