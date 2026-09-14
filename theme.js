(function(root){
  'use strict';
  const palettes={
    Jaisalmer:{label:'Jaisalmer',colors:['#faa622','#ffe52c','#7fe6ef','#c4d70c','#c22303']},
    Jodhpur:{label:'Jodhpur',colors:['#b0c3ff','#9fb8ff','#6da4ff','#538fff','#2663b7']},
    Udaipur:{label:'Udaipur',colors:['#fffceb','#f4eee0','#e9e0d4','#d2cac5','#c5bebe']},
    Jaipur:{label:'Jaipur',colors:['#3d3b3b','#7a331e','#91472d','#ab5e4a','#c97051']},
    Peacock:{label:'Peacock',colors:['#1a0285','#1f727e','#359cbb','#46d1bf','#00ffc6']}
  };
  const cityTheme={"Phoenix, AZ":'Jaisalmer',"San Diego, CA":'Jaisalmer',"Denver, CO":'Jaisalmer',"Dallas, TX":'Jaipur',"Houston, TX":'Jaipur',"Austin, TX":'Jaipur',"New York, NY":'Jodhpur',"Boston, MA":'Jodhpur',"Washington, DC":'Jodhpur',"Toronto, ON, Canada":'Peacock',"Vancouver, BC, Canada":'Peacock',"Montreal, QC, Canada":'Peacock'};
  const chapterTheme={national:'Peacock',northeast:'Jodhpur',mideast:'Jodhpur',midwest:'Udaipur',southwest:'Jaipur',southeast:'Jaisalmer','west-coast':'Peacock','canada-east':'Peacock','canada-west':'Jaisalmer'};
  const safe=v=>palettes[v]?v:'Udaipur';
  function currentCity(data){try{const s=JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session;return data?.people.find(p=>p.id===s?.personaId)?.city||'';}catch{return '';}}
  function themeForCity(city){if(cityTheme[city])return cityTheme[city];if(!city)return 'Udaipur';const names=Object.keys(palettes),hash=[...city].reduce((n,c)=>n+c.charCodeAt(0),0);return names[hash%names.length];}
  function themeForChapter(id){return chapterTheme[id]||'Udaipur';}
  function apply(name){name=safe(name);const p=palettes[name],dark=name==='Udaipur'?'#3d3b3b':p.colors[4];document.documentElement.dataset.theme=name.toLowerCase();p.colors.forEach((color,i)=>document.documentElement.style.setProperty(`--theme-${i+1}`,color));document.documentElement.style.setProperty('--green',dark);document.documentElement.style.setProperty('--navy',dark);document.documentElement.style.setProperty('--saffron',p.colors[1]);document.documentElement.style.setProperty('--india-green',p.colors[3]);document.documentElement.style.setProperty('--paper',p.colors[0]);try{localStorage.setItem('forest-theme-v1',name);}catch{}return name;}
  function init(data){let saved='';try{saved=localStorage.getItem('forest-theme-v1')||'';}catch{}let chapter='';try{const s=JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session,p=data?.people.find(x=>x.id===s?.personaId);chapter=root.ChapterCore?.forPerson(p)?.id||'';}catch{}apply(safe(chapter?themeForChapter(chapter):(saved||themeForCity(currentCity(data)))));const host=document.querySelector('#theme-picker');if(!host)return;host.innerHTML=`<label class="theme-picker"><span>Theme</span><select aria-label="Choose visual theme">${Object.values(palettes).map(p=>`<option value="${p.label}">${p.label}</option>`).join('')}</select></label>`;const select=host.querySelector('select');select.value=document.documentElement.dataset.theme[0].toUpperCase()+document.documentElement.dataset.theme.slice(1);select.onchange=()=>apply(select.value);}
  root.ThemePicker={palettes,apply,init,cityTheme,chapterTheme,themeForCity,themeForChapter};
  if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{if(root.data) init(root.data);});
})(globalThis);
