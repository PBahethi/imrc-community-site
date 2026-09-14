(function(root){
  'use strict';
  const core=root.TourCore;
  let stepsPromise,repo,context,currentIndex=0,activeTarget=null,routeObserver=null;
  const main=()=>document.querySelector('#main');
  const storage=()=>{try{return localStorage;}catch{return {getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};}};
  const stateRepo=()=>repo||(repo=core.repository(storage()));
  const loadSteps=()=>stepsPromise||(stepsPromise=fetch('./tour-steps.json').then(response=>{if(!response.ok)throw Error('Unable to load board tour');return response.json();}).then(core.normalizeSteps));
  const routeId=()=>{const [view,id='']=location.hash.slice(1).split('/');return view==='tour'?decodeURIComponent(id||'welcome'):'';};
  function setTitle(step){document.title=`${step.title} · Board tour`;}
  function clearLayer(){document.querySelector('.board-tour-layer')?.remove();if(activeTarget){activeTarget.removeAttribute('aria-describedby');activeTarget=null;}routeObserver?.disconnect();routeObserver=null;window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);}
  function annotateSurface(step){
    const area=main();if(!area)return;
    if(step.id==='chapter'&&!area.querySelector('[data-tour="chapter-map"]')){const map=area.querySelector('#chapter-inline-map'),disclaimer=area.querySelector('.map-disclaimer'),hierarchy=area.querySelector('.chapter-hierarchy');if(map&&hierarchy){const wrap=document.createElement('section');wrap.className='board-tour-surface';wrap.dataset.tour='chapter-map';map.before(wrap);wrap.append(map);if(disclaimer)wrap.append(disclaimer);wrap.append(hierarchy);}}
    if(step.id==='dashboard'&&!area.querySelector('[data-tour="dashboard-actions"]')){const aside=area.querySelector('.dashboard-aside');if(aside){const panel=document.createElement('section');panel.className='next-steps board-tour-prompts';panel.dataset.tour='dashboard-actions';panel.innerHTML='<p class="eyebrow">RAMA\'S RELEVANT NEXT STEPS</p><h2>Three easy ways back in</h2><ul><li><strong>Meet someone:</strong> Vishvamitra · because both profiles list Washington, DC</li><li><strong>Show up:</strong> Rama\'s Exile · two story connections are attending</li><li><strong>Help:</strong> Welcome a new family to the Mid-Atlantic Chapter</li></ul>';aside.prepend(panel);}}
    if(step.id==='directory'&&!area.querySelector('[data-tour="directory-tree"]')){const filters=area.querySelector('.filters'),trees=area.querySelector('#relationship-trees');if(filters&&trees){const wrap=document.createElement('section');wrap.className='board-tour-surface';wrap.dataset.tour='directory-tree';filters.before(wrap);wrap.append(filters,trees);}}
    if(step.id==='votes'&&!area.querySelector('[data-tour="chapter-poll"]')){const grid=area.querySelector('.poll-grid');if(grid){const card=document.createElement('article');card.className='poll-card board-tour-chapter-poll';card.dataset.tour='chapter-poll';card.innerHTML='<p class="eyebrow">MID-ATLANTIC CHAPTER POLL · ANSWERED</p><h2>Which program should the chapter prioritize?</h2><p class="vote-confirmation" role="status">Rama voted for “Regional family volunteering day”.</p><p class="demo-context">The eight February 2027 National and Chapter officer ballots remain open below.</p>';grid.prepend(card);}}
    if(step.id==='contribute'){const section=[...area.querySelectorAll('.dashboard-section')].find(node=>node.querySelector('h2')?.textContent==='Take part');if(section)section.dataset.tour='take-part';}
  }
  function renderSurface(step){
    const renderers=context?.renderers||{},data=context?.data;if(!data)return;
    const [view,id='']=step.route.slice(1).split('/');
    if(step.id==='welcome'||step.id==='end'){renderers.landing?.();return;}
    if(view==='chapter')root.Chapter?.render(data,id);
    else if(view==='login')renderers.login?.();
    else if(view==='home')renderers.home?.();
    else if(view==='connections')renderers.connections?.();
    else if(view==='event'){renderers.detail?.('event',id);const event=data.events.find(row=>row.id===id);if(event&&root.EventActions)root.EventActions.mount(data,event,true);}
    else if(view==='profile'){renderers.profile?.();const anchor=main()?.querySelector('.profile-actions');if(anchor&&root.ConventionExperience&&!main().querySelector('.profile-convention'))anchor.insertAdjacentHTML('afterend',root.ConventionExperience.profilePanel(data,core.personaId));}
    else if(view==='votes')root.Voting?.render();
    annotateSurface(step);
  }
  function position(){
    const layer=document.querySelector('.board-tour-layer'),spot=layer?.querySelector('.board-tour-spotlight'),card=layer?.querySelector('.board-tour-card');if(!layer||!spot||!card)return;
    const target=activeTarget;if(!target){layer.classList.add('board-tour-centered');spot.hidden=true;return;}
    const rect=target.getBoundingClientRect(),pad=10,left=Math.max(8,rect.left-pad),top=Math.max(8,rect.top-pad),width=Math.min(innerWidth-left-8,rect.width+pad*2),height=Math.min(innerHeight-top-8,rect.height+pad*2);
    spot.hidden=false;spot.style.setProperty('--tour-left',`${left}px`);spot.style.setProperty('--tour-top',`${top}px`);spot.style.setProperty('--tour-width',`${Math.max(40,width)}px`);spot.style.setProperty('--tour-height',`${Math.max(40,height)}px`);
    layer.classList.remove('board-tour-centered');const cardWidth=Math.min(460,innerWidth-32),below=rect.bottom+18,above=rect.top-card.offsetHeight-18,cardTop=below+card.offsetHeight<innerHeight?below:Math.max(16,above),cardLeft=Math.max(16,Math.min(innerWidth-cardWidth-16,rect.left));card.style.setProperty('--tour-card-left',`${cardLeft}px`);card.style.setProperty('--tour-card-top',`${cardTop}px`);
  }
  function controls(step,index,total){
    if(step.id==='welcome')return '<div class="board-tour-controls"><button class="button" type="button" data-tour-action="start">Start tour</button><button class="button secondary" type="button" data-tour-action="explore">Just explore</button></div>';
    if(step.id==='end')return '<div class="board-tour-controls"><button class="button" type="button" data-tour-action="restart">Restart tour</button><button class="button secondary" type="button" data-tour-action="explore">Explore on my own</button><button class="board-tour-skip" type="button" data-tour-action="reset">Reset demo</button></div>';
    return `<div class="board-tour-controls"><button class="button secondary" type="button" data-tour-action="back" ${index===0?'disabled':''}>Back</button><button class="button" type="button" data-tour-action="next">Next</button><button class="board-tour-skip" type="button" data-tour-action="skip">Skip tour</button></div><span class="board-tour-count">${index+1} of ${total}</span>`;
  }
  function showCard(steps,step,index,target){
    clearLayer();activeTarget=target||null;const layer=document.createElement('div');layer.className='board-tour-layer';const titleId=`board-tour-title-${core.escapeHtml(step.id)}`,descriptionId=`board-tour-copy-${core.escapeHtml(step.id)}`;layer.innerHTML=`<div class="board-tour-spotlight" aria-hidden="true"></div><section class="board-tour-card" role="dialog" aria-modal="true" aria-labelledby="${titleId}" aria-describedby="${descriptionId}"><p class="board-tour-label">BOARD TOUR</p><h2 id="${titleId}">${core.escapeHtml(step.title)}</h2><div id="${descriptionId}"><p>${core.escapeHtml(step.seeing)}</p><p class="board-tour-why">${core.escapeHtml(step.why)}</p></div>${controls(step,index,steps.length)}</section>`;document.body.appendChild(layer);const card=layer.querySelector('.board-tour-card');if(activeTarget){activeTarget.setAttribute('aria-describedby',descriptionId);if(step.id!=='welcome'&&step.id!=='end')activeTarget.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}layer.addEventListener('click',event=>{const action=event.target.closest('[data-tour-action]')?.dataset.tourAction;if(action)act(action,steps);});window.addEventListener('resize',position);window.addEventListener('scroll',position,true);requestAnimationFrame(()=>{position();card.querySelector('button')?.focus();});setTitle(step);
  }
  function mountStep(steps,step,index){renderSurface(step);annotateSurface(step);const selector=core.targetFor(step),target=selector?main()?.querySelector(selector):null;showCard(steps,step,index,target);if(selector&&!target){routeObserver=new MutationObserver(()=>{annotateSurface(step);const found=main()?.querySelector(selector);if(found)showCard(steps,step,index,found);});routeObserver.observe(main(),{childList:true,subtree:true});}}
  function go(steps,index){const bounded=core.clamp(index,steps),step=steps[bounded];currentIndex=bounded;stateRepo().save({active:true,currentId:step.id});location.hash=`#tour/${step.id}`;if(routeId()===step.id)mountStep(steps,step,bounded);}
  function seedTour(){const seeded=core.applySeed(storage(),core.seedPlan(context.data,new Date()));context.renderers.reload?.();root.EventActions?.reload?.(context.data);root.ThemePicker?.init(context.data);return seeded;}
  function explore(step){clearLayer();stateRepo().save({active:false,currentId:step?.id||'welcome'});location.hash=step?.route&&step.route!=='#tour/end'&&step.route!=='#tour'?step.route:'#home';}
  function act(action,steps){const step=steps[currentIndex];if(action==='start'){const seeded=seedTour();stateRepo().save({active:true,seeded,currentId:'chapter'});go(steps,1);}else if(action==='back')go(steps,currentIndex-1);else if(action==='next')go(steps,currentIndex+1);else if(action==='skip'||action==='explore')explore(step);else if(action==='restart'){stateRepo().reset();const seeded=seedTour();stateRepo().save({active:true,seeded,currentId:'chapter'});go(steps,1);}else if(action==='reset'){clearLayer();stateRepo().reset();document.querySelector('#reset-demo-tab')?.click();}}
  function onKeydown(event){const layer=document.querySelector('.board-tour-layer');if(!layer)return;if(event.key==='Escape'){event.preventDefault();loadSteps().then(steps=>act('skip',steps));return;}if(event.key==='ArrowLeft'){event.preventDefault();loadSteps().then(steps=>act('back',steps));return;}if(event.key==='ArrowRight'){event.preventDefault();loadSteps().then(steps=>act('next',steps));return;}if(event.key!=='Tab')return;const focusable=[...layer.querySelectorAll('button:not([disabled]),a[href]')];if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  function route(data,id,renderers){context={data,renderers};main().innerHTML='<p class="board-tour-loading" role="status">Preparing the board tour…</p>';loadSteps().then(steps=>{const requested=id||'welcome',index=core.indexFor(steps,requested),step=steps[index];currentIndex=index;let state=stateRepo().read();if(!state.seeded&&!['welcome','end'].includes(step.id)){const seeded=seedTour();state=stateRepo().save({seeded});}stateRepo().save({active:true,currentId:step.id,seeded:state.seeded});mountStep(steps,step,index);}).catch(()=>{main().innerHTML='<h1>Unable to load the board tour.</h1><p><a href="#home">Explore the community instead →</a></p>';});}
  function decorateLanding(){const actions=document.querySelector('.demo-hero .landing-actions,.landing-hero .landing-actions');if(actions&&!actions.querySelector('.board-tour-entry')){const link=document.createElement('a');link.className='button secondary board-tour-entry';link.href='#tour';link.textContent='Take the five-minute board tour →';actions.appendChild(link);}}
  function reset(){clearLayer();stateRepo().reset();}
  document.addEventListener('keydown',onKeydown);
  document.addEventListener('event-actions-ready',()=>{if(routeId()&&context)loadSteps().then(steps=>{const step=steps[core.indexFor(steps,routeId())];if(step?.route.startsWith('#event/'))mountStep(steps,step,core.indexFor(steps,step.id));});});
  if(typeof MutationObserver==='function')new MutationObserver(decorateLanding).observe(document.documentElement,{childList:true,subtree:true});
  document.querySelector('#reset-demo-tab')?.addEventListener('click',reset);
  if(new URLSearchParams(location.search).get('tour')==='1'&&!location.hash)location.hash='#tour';
  root.Tour={route,reset,decorateLanding,loadSteps};
})(globalThis);
