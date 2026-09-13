(function(root){
  'use strict';
  let mounted=false,map=null,generation=0;
  const assets=new Map();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function load(url,stylesheet=false){
    if(assets.has(url))return assets.get(url);
    const pending=new Promise((resolve,reject)=>{
      const element=document.createElement(stylesheet?'link':'script');
      if(stylesheet){element.rel='stylesheet';element.href=url;}else element.src=url;
      const timer=setTimeout(()=>fail(),15000);
      const fail=()=>{clearTimeout(timer);element.remove();assets.delete(url);reject(Error('Map asset unavailable'));};
      element.onload=()=>{clearTimeout(timer);resolve();};element.onerror=fail;
      document.head.appendChild(element);
    });
    assets.set(url,pending);return pending;
  }
  function leave(){generation++;if(map){map.remove();map=null;}}
  async function render(){
    leave();const token=generation,main=document.querySelector('#main');if(!main)return;
    main.innerHTML='<p class="eyebrow">REAL DATA · U.S. CENSUS BUREAU</p><h1>Where people really live.</h1><p class="sub">County-level population, median age, and sex estimates shown as an aggregate heat map. No individual-level data is used.</p><div id="locality-map" class="locality-map" role="img" aria-label="Heat map of United States county population"></div><p id="locality-status" class="results" role="status">Loading Census data…</p><div class="note" id="locality-source"></div>';
    document.title='Locality Map · Tree in the Forest';
    const container=document.querySelector('#locality-map'),status=document.querySelector('#locality-status'),source=document.querySelector('#locality-source');
    const current=()=>token===generation&&container.isConnected&&location.hash==='#localitymap';
    try{
      await Promise.all([load('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',true),load('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')]);
      if(!current())return;
      await load('https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js');
      if(!current())return;
      const response=await fetch('./locality-data.json');if(!response.ok)throw Error('locality data unavailable');
      const data=await response.json();if(!current())return;
      status.textContent=`${data.counties.length.toLocaleString()} US counties · Vintage ${data.sourceYear} estimates`;
      source.textContent=`${data.source} Generated ${data.generated}.`;
      map=L.map(container,{scrollWheelZoom:false}).setView([39.8,-98.6],4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:11,attribution:'© OpenStreetMap contributors'}).addTo(map);
      const maxLog=Math.log10(Math.max(...data.counties.map(c=>c.population)));
      L.heatLayer(data.counties.map(c=>[c.lat,c.lng,Math.log10(c.population)/maxLog]),{radius:16,blur:20,max:1,maxZoom:9}).addTo(map);
      data.counties.forEach(c=>L.circleMarker([c.lat,c.lng],{radius:4,weight:0,fillOpacity:.01}).bindPopup(`<div class="locality-popup"><h3>${esc(c.name)}</h3><p class="sub">${esc(c.state)}</p><dl><dt>Population</dt><dd>${c.population.toLocaleString()}</dd><dt>Median age</dt><dd>${c.medianAge} (M ${c.medianAgeMale} · F ${c.medianAgeFemale})</dd><dt>Sex</dt><dd>${c.pctFemale}% female · ${c.pctMale}% male</dd></dl></div>`).addTo(map));
    }catch{if(current())status.textContent='Unable to load the map or locality data. Check your connection, then leave this page and open Locality Map to retry.';}
  }
  function observe(){if(mounted)return;mounted=true;const nav=document.querySelector('nav');if(nav&&!nav.querySelector('a[href="#localitymap"]'))nav.insertAdjacentHTML('beforeend','<a href="#localitymap">▲ <span>Locality Map</span></a>');}
  root.LocalityMap={observe,render,leave};
})(globalThis);
