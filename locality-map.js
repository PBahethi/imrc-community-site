(function(root){
  'use strict';
  let mounted=false,map=null,generation=0;
  const assets=new Map();
  const cityCoordinates={
    'Atlanta, GA':[33.749,-84.388],'Austin, TX':[30.2672,-97.7431],'Baltimore, MD':[39.2904,-76.6122],
    'Boston, MA':[42.3601,-71.0589],'Calgary, AB, Canada':[51.0447,-114.0719],'Charlottetown, PE, Canada':[46.2382,-63.1311],
    'Chicago, IL':[41.8781,-87.6298],'Dallas, TX':[32.7767,-96.797],'Denver, CO':[39.7392,-104.9903],
    'Fredericton, NB, Canada':[45.9636,-66.6431],'Halifax, NS, Canada':[44.6488,-63.5752],'Houston, TX':[29.7604,-95.3698],
    'Los Angeles, CA':[34.0522,-118.2437],'Miami, FL':[25.7617,-80.1918],'Montreal, QC, Canada':[45.5019,-73.5674],
    'New York, NY':[40.7128,-74.006],'Newark, NJ':[40.7357,-74.1724],'Orlando, FL':[28.5383,-81.3792],
    'Phoenix, AZ':[33.4484,-112.074],'Portland, OR':[45.5152,-122.6784],'San Diego, CA':[32.7157,-117.1611],
    'San Francisco, CA':[37.7749,-122.4194],'San Jose, CA':[37.3382,-121.8863],'Saskatoon, SK, Canada':[52.1579,-106.6702],
    "St. John's, NL, Canada":[47.5615,-52.7126],'Seattle, WA':[47.6062,-122.3321],'Tampa, FL':[27.9506,-82.4572],
    'Toronto, ON, Canada':[43.6532,-79.3832],'Vancouver, BC, Canada':[49.2827,-123.1207],'Washington, DC':[38.9072,-77.0369],
    'Winnipeg, MB, Canada':[49.8951,-97.1384]
  };
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
  function readSession(){try{return JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session||{};}catch{return {};}}
  function familyForProfile(people,relationships,personaId){
    if(!personaId)return [];
    const ids=new Set([personaId]);
    relationships.filter(r=>r.category==='Family'&&(r.from===personaId||r.to===personaId)).forEach(r=>{ids.add(r.from);ids.add(r.to);});
    return [...ids].map(id=>people.find(p=>p.id===id)).filter(Boolean);
  }
  function summary(counties){
    const total=counties.reduce((sum,c)=>sum+Number(c.population||0),0);
    return {total,largest:[...counties].sort((a,b)=>b.population-a.population).slice(0,3)};
  }
  function legendHtml(stats,familyCount,profileName){
    const top=stats.largest.map(c=>`${esc(c.name)}, ${esc(c.state)} ${Number(c.population).toLocaleString()}`).join(' · ');
    return `<div class="locality-legend" aria-label="Map legend and data explanation"><div><span class="heat-swatch"></span><strong>Heat map</strong><p>All county residents in the U.S. Census population estimate, not South Asian or Indian-subcontinent heritage.</p></div><div><span class="family-swatch"></span><strong>Profile family dots</strong><p>${familyCount?`${familyCount} fictional demo profile location${familyCount===1?'':'s'} for ${esc(profileName)} and direct family.`:'Sign in to show the selected profile and direct family members as dots.'}</p></div><div class="locality-numbers"><strong>${stats.total.toLocaleString()}</strong><p>people across the mapped counties</p><small>Largest counties: ${top}</small></div></div>`;
  }
  function leave(){generation++;if(map){map.remove();map=null;}}
  async function render(){
    leave();const token=generation,main=document.querySelector('#main');if(!main)return;
    main.innerHTML='<p class="eyebrow">REAL DATA · U.S. CENSUS BUREAU</p><h1>Where people really live.</h1><p class="sub">County-level total population, median age, and sex estimates shown as an aggregate heat map. Profile-family dots use fictional demo member cities.</p><div id="locality-explainer" class="note"></div><div id="locality-map" class="locality-map" role="img" aria-label="Heat map of United States county population with optional family profile dots"></div><p id="locality-status" class="results" role="status">Loading Census data...</p><div class="note" id="locality-source"></div>';
    document.title='Locality Map · Tree in the Forest';
    const container=document.querySelector('#locality-map'),status=document.querySelector('#locality-status'),source=document.querySelector('#locality-source'),explainer=document.querySelector('#locality-explainer');
    const current=()=>token===generation&&container.isConnected&&location.hash==='#localitymap';
    try{
      await Promise.all([load('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',true),load('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')]);
      if(!current())return;
      await load('https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js');
      if(!current())return;
      const [localityResponse,communityResponse]=await Promise.all([fetch('./locality-data.json'),fetch('./data.json')]);
      if(!localityResponse.ok)throw Error('locality data unavailable');
      const data=await localityResponse.json(),rawCommunity=communityResponse.ok?await communityResponse.json():{};
      if(!current())return;
      const community={people:Array.isArray(rawCommunity.people)?rawCommunity.people:[],relationships:Array.isArray(rawCommunity.relationships)?rawCommunity.relationships:[]};
      const stats=summary(data.counties),session=readSession(),profile=community.people.find(p=>p.id===session.personaId),family=familyForProfile(community.people,community.relationships,profile?.id).filter(p=>cityCoordinates[p.city]);
      status.textContent=`${data.counties.length.toLocaleString()} US counties · ${stats.total.toLocaleString()} total residents · Vintage ${data.sourceYear}`;
      if(explainer)explainer.innerHTML=legendHtml(stats,family.length,profile?.name||'the selected member');
      source.textContent=`${data.source} Generated ${data.generated}.`;
      map=L.map(container,{scrollWheelZoom:false}).setView([39.8,-98.6],4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:11,attribution:'© OpenStreetMap contributors'}).addTo(map);
      const maxLog=Math.log10(Math.max(...data.counties.map(c=>c.population)));
      L.heatLayer(data.counties.map(c=>[c.lat,c.lng,Math.log10(c.population)/maxLog]),{radius:16,blur:20,max:1,maxZoom:9}).addTo(map);
      data.counties.forEach(c=>L.circleMarker([c.lat,c.lng],{radius:4,weight:0,fillOpacity:.01}).bindPopup(`<div class="locality-popup"><h3>${esc(c.name)}</h3><p class="sub">${esc(c.state)}</p><dl><dt>Total population</dt><dd>${c.population.toLocaleString()}</dd><dt>Median age</dt><dd>${c.medianAge} (M ${c.medianAgeMale} · F ${c.medianAgeFemale})</dd><dt>Sex</dt><dd>${c.pctFemale}% female · ${c.pctMale}% male</dd></dl></div>`).addTo(map));
      family.forEach(p=>L.circleMarker(cityCoordinates[p.city],{radius:p.id===profile.id?9:7,color:'#000080',weight:2,fillColor:p.id===profile.id?'#ff9933':'#138808',fillOpacity:.92}).bindPopup(`<div class="locality-popup"><h3>${esc(p.name)}</h3><p class="sub">${esc(p.city)} · ${p.id===profile.id?'selected profile':'direct family member'}</p><p>Fictional demo profile location.</p></div>`).addTo(map));
    }catch{if(current())status.textContent='Unable to load the map or locality data. Check your connection, then leave this page and open Locality Map to retry.';}
  }
  function observe(){if(mounted)return;mounted=true;}
  root.LocalityMap={observe,render,leave};
})(globalThis);
