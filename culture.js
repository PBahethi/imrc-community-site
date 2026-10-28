/* Marwar culture gallery (#culture) and photo credits (#credits).
   Photos are real, freely licensed Wikimedia Commons images listed in marwar-photos.json. */
(function(){
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let cache=null;
  function load(){if(cache)return cache;cache=fetch('./marwar-photos.json').then(r=>{if(!r.ok)throw Error('photos');return r.json();}).catch(e=>{cache=null;throw e;});return cache;}
  const credit=p=>`Photo: ${esc(p.author)} · <a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener license">${esc(p.license)}</a> · <a href="${esc(p.source)}" target="_blank" rel="noopener">Source ↗</a>`;
  function figure(p,i){
    return `<figure class="culture-card"><a class="culture-zoom" href="${esc(p.srcLarge)}" target="_blank" rel="noopener" aria-label="Open a larger version of ${esc(p.title)}"><img src="${esc(p.src)}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async"></a><figcaption><strong>${esc(p.title)}</strong> <span lang="hi">${esc(p.hindi)}</span><span class="culture-caption">${esc(p.caption)}</span><small>${credit(p)}</small></figcaption></figure>`;
  }
  function render(main){
    main.innerHTML='<p class="eyebrow">MARWAR · मारवाड़</p><h1>The land we come from.</h1><p class="sub">Loading photographs…</p>';
    const target=main.firstElementChild;
    load().then(data=>{
      if(main.firstElementChild!==target)return;
      const [hero,...rest]=data.photos;
      main.innerHTML=`<section class="culture-hero" aria-labelledby="culture-title"><img src="${esc(hero.srcLarge)}" srcset="${esc(hero.src)} 800w, ${esc(hero.srcLarge)} 1600w" sizes="(max-width: 700px) 100vw, 1100px" alt="${esc(hero.alt)}" width="${hero.widthLarge}" height="${hero.heightLarge}" fetchpriority="high"><div class="culture-hero-copy"><p class="eyebrow">MARWAR · मारवाड़ · RAJASTHAN</p><h1 id="culture-title">The land we come from.</h1><p>Forts and blue lanes, saffron safas, Ghoomar and Kalbelia, kathputli ballads, camel fairs, bandhani and dal baati. A small window into the Marwar roots many IMRC families share.</p><a class="button" href="#observances">See festival dates →</a></div><p class="culture-hero-credit">${esc(hero.title)} · ${credit(hero)}</p></section>
      <div class="section-head"><h2>A Marwar album</h2><a href="#credits">Photo credits &amp; licences →</a></div>
      <div class="culture-grid">${rest.map(figure).join('')}</div>
      <p class="culture-note">${esc(data.note)} See <a href="#credits">photo credits</a> for each author and licence.</p>`;
      document.title='Marwar culture · Tree in the Forest';
    }).catch(()=>{if(main.firstElementChild===target)main.innerHTML='<h1>Marwar culture</h1><p>Unable to load the photographs. Please refresh to retry.</p>';});
  }
  function credits(main){
    main.innerHTML='<p class="eyebrow">ATTRIBUTION</p><h1>Photo credits</h1><p class="sub">Loading…</p>';
    const target=main.firstElementChild;
    load().then(data=>{
      if(main.firstElementChild!==target)return;
      main.innerHTML=`<p class="eyebrow">ATTRIBUTION</p><h1>Photo credits</h1><p class="sub">${esc(data.note)} Images under CC BY-SA may be reused under the same licence.</p>
      <div class="credits-table-wrap"><table class="credits-table"><caption class="sr-only">Marwar culture photographs, authors and licences</caption><thead><tr><th scope="col">Photo</th><th scope="col">Author</th><th scope="col">Licence</th><th scope="col">Source</th><th scope="col">Changes</th></tr></thead><tbody>${data.photos.map(p=>`<tr><th scope="row"><img src="${esc(p.src)}" alt="" width="96" height="${Math.round(96*p.height/p.width)}" loading="lazy">${esc(p.title)}</th><td>${esc(p.author)}</td><td><a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener license">${esc(p.license)}</a></td><td><a href="${esc(p.source)}" target="_blank" rel="noopener">${esc(p.commonsTitle)} ↗</a></td><td>${esc(p.changes)}</td></tr>`).join('')}</tbody></table></div>
      <p class="culture-note">Story-event artwork and profile portraits elsewhere in this demo come from Wikimedia Commons public-domain or CC0 depictions and carry their own source links.</p>`;
      document.title='Photo credits · Tree in the Forest';
    }).catch(()=>{if(main.firstElementChild===target)main.innerHTML='<h1>Photo credits</h1><p>Unable to load the credits. Please refresh to retry.</p>';});
  }
  globalThis.Culture={render,credits,load};
})();
