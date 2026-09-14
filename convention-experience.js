(function(root){
  'use strict';
  const key='forest-convention-attendance-v1';
  const eventStateKey='forest-event-actions-v1';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const badgeDefinitions=[
    {count:1,id:'first-gathering',icon:'✦',name:'First Gathering',description:'Checked in to a convention session.'},
    {count:3,id:'community-explorer',icon:'◉',name:'Community Explorer',description:'Tried three different sessions.'},
    {count:6,id:'active-connector',icon:'⌘',name:'Active Connector',description:'Joined six opportunities to meet and learn.'},
    {count:10,id:'community-builder',icon:'♧',name:'Community Builder',description:'Participated across ten convention sessions.'},
    {count:20,id:'convention-steward',icon:'❧',name:'Convention Steward',description:'Sustained participation across the programme.'}
  ];
  const empty=()=>({version:1,checkins:[],activity:[]});
  const sessions=event=>(event?.agenda||[]).flatMap((day,dayIndex)=>(day.items||[]).map((item,itemIndex)=>typeof item==='string'?{id:`d${dayIndex}-i${itemIndex}`,time:'',title:item,category:'General',room:'',dayId:day.id||`day-${dayIndex+1}`,day:day.day,date:day.date||event.dates?.[dayIndex]}:{...item,dayId:day.id||`day-${dayIndex+1}`,day:day.day,date:day.date||event.dates?.[dayIndex]}));
  function normalize(raw,data){
    const source=raw&&raw.version===1?raw:{},valid=new Set((data?.events||[]).flatMap(event=>sessions(event).map(session=>`${event.id}/${session.id}`))),people=new Set((data?.people||[]).map(person=>person.id)),state=empty();
    state.checkins=(Array.isArray(source.checkins)?source.checkins:[]).filter(row=>row&&people.has(row.actorId)&&valid.has(`${row.eventId}/${row.sessionId}`)&&Number.isFinite(Date.parse(row.at))).slice(0,300).map(row=>({actorId:row.actorId,eventId:row.eventId,sessionId:row.sessionId,at:new Date(row.at).toISOString()}));
    state.activity=(Array.isArray(source.activity)?source.activity:[]).filter(row=>row&&people.has(row.actorId)&&typeof row.text==='string'&&row.text.trim()&&Number.isFinite(Date.parse(row.at))).slice(0,60).map(row=>({actorId:row.actorId,text:row.text.trim().slice(0,180),at:new Date(row.at).toISOString()}));
    return state;
  }
  function read(data){try{return normalize(JSON.parse(localStorage.getItem(key)||'null'),data);}catch{return empty();}}
  function write(state){try{localStorage.setItem(key,JSON.stringify(state));return true;}catch{return false;}}
  function eventPlans(){try{const value=JSON.parse(localStorage.getItem(eventStateKey)||'null');return Array.isArray(value?.conventionPlans)?value.conventionPlans:[];}catch{return [];}}
  function badgeProgress(count){const earned=badgeDefinitions.filter(badge=>count>=badge.count),next=badgeDefinitions.find(badge=>count<badge.count)||null;return {earned,next,count};}
  function query(){const params=new URLSearchParams(location.hash.split('?')[1]||''),parts=location.hash.slice(1).split('/');if(parts[2]==='session'&&parts[3])params.set('session',decodeURIComponent(parts[3]));if(parts[2]==='category'&&parts[3])params.set('category',decodeURIComponent(parts[3]));return params;}
  function sessionQr(event,session){const target=`#event/${encodeURIComponent(event.id)}/session/${encodeURIComponent(session.id)}`,base=`${location.origin||''}${location.pathname||''}`;return {target,url:`https://api.qrserver.com/v1/create-qr-code/?size=144x144&margin=10&data=${encodeURIComponent(base+target)}`};}
  function filterControls(event,scope){
    const categories=[...new Set(sessions(event).map(session=>session.category))].sort();
    return `<div class="programme-controls" data-filter-scope="${scope}"><div class="day-tabs" role="tablist" aria-label="Convention days">${event.agenda.map((day,index)=>{const id=day.id||`day-${index+1}`;return `<button id="${scope}-tab-${esc(id)}" type="button" role="tab" data-day-tab="${esc(id)}" aria-controls="${scope}-panel-${esc(id)}" aria-selected="${index===0?'true':'false'}">${esc(day.shortDay||day.day)}</button>`;}).join('')}</div><label>Category<select data-category-filter><option value="">All categories</option>${categories.map(category=>`<option>${esc(category)}</option>`).join('')}</select></label><p class="programme-count" role="status"></p></div>`;
  }
  function agendaBrowser(event){
    const rows=event.agenda.map((day,dayIndex)=>{const id=day.id||`day-${dayIndex+1}`;return `<section id="browse-panel-${esc(id)}" class="programme-day" data-programme-day="${esc(id)}" role="tabpanel" aria-labelledby="browse-tab-${esc(id)}"><div class="programme-day-heading"><div><p class="eyebrow">${esc(day.theme)}</p><h3>${esc(day.day)}</h3></div><span>${day.items.length} sessions</span></div><div class="programme-list">${day.items.map((item,itemIndex)=>{const session=typeof item==='string'?{id:`d${dayIndex}-i${itemIndex}`,time:'',title:item,category:'General',room:''}:item;return `<article class="programme-session" data-programme-category="${esc(session.category)}"><time>${esc(session.time)}</time><div><span class="session-category">${esc(session.category)}</span><h4>${esc(session.title)}</h4><p>${esc(session.room)}</p></div><a href="#event/${encodeURIComponent(event.id)}/session/${encodeURIComponent(session.id)}" aria-label="Open QR ticket for ${esc(session.title)}">QR ticket →</a></article>`;}).join('')}</div></section>`;}).join('');
    return `<div class="programme-browser" data-agenda-browser="${esc(event.id)}">${filterControls(event,'browse')}${rows}</div>`;
  }
  function bindFilter(rootNode,initialDay,initialCategory=''){
    if(!rootNode||rootNode.dataset.filterBound)return;
    rootNode.dataset.filterBound='true';
    const tabs=[...rootNode.querySelectorAll('[data-day-tab]')],select=rootNode.querySelector('[data-category-filter]'),panels=[...rootNode.querySelectorAll('[data-programme-day]')],options=[...rootNode.querySelectorAll('[data-planner-day]')];
    let day=initialDay||tabs[0]?.dataset.dayTab||'';
    if(select&&initialCategory&&[...select.options].some(option=>option.value===initialCategory))select.value=initialCategory;
    const update=()=>{
      const category=select?.value||'';
      tabs.forEach(tab=>{const active=tab.dataset.dayTab===day;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
      panels.forEach(panel=>{panel.hidden=panel.dataset.programmeDay!==day;panel.querySelectorAll('[data-programme-category]').forEach(item=>item.hidden=!!category&&item.dataset.programmeCategory!==category);});
      options.forEach(option=>option.hidden=option.dataset.plannerDay!==day||!!category&&option.dataset.plannerCategory!==category);
      const visible=[...panels.flatMap(panel=>[...panel.querySelectorAll('[data-programme-category]')]),...options].filter(item=>!item.hidden&&!item.closest('[hidden]')).length;
      const count=rootNode.querySelector('.programme-count');if(count)count.textContent=`${visible} ${visible===1?'session':'sessions'} shown`;
    };
    tabs.forEach(tab=>tab.onclick=()=>{day=tab.dataset.dayTab;update();});if(select)select.onchange=update;update();
  }
  function bindAgendaBrowser(event){const category=query().get('category')||'',selected=sessions(event).find(session=>session.id===query().get('session'))||sessions(event).find(session=>session.category===category);document.querySelectorAll(`[data-agenda-browser="${event.id}"]`).forEach(node=>bindFilter(node,selected?.dayId||event.agenda[0]?.id,category));}
  function decoratePlanner(event){
    const grid=document.querySelector('.agenda-pick-grid');if(!grid||grid.dataset.enhanced)return;grid.dataset.enhanced='true';
    const controls=document.createElement('div');controls.className='planner-filter-shell';controls.innerHTML=filterControls(event,'planner');grid.parentElement.insertBefore(controls,grid);
    const category=query().get('category')||'',selected=sessions(event).find(session=>session.id===query().get('session'))||sessions(event).find(session=>session.category===category);bindFilter(grid.parentElement,selected?.dayId||event.agenda[0]?.id,category);
  }
  function checkinPanel(event,person,selectedIds=[],data={events:[event],people:person?[person]:[]}){
    const session=sessions(event).find(item=>item.id===query().get('session'));if(!session)return '';
    const checked=person&&read(data).checkins.some(row=>row.actorId===person.id&&row.eventId===event.id&&row.sessionId===session.id),scheduled=selectedIds.includes(session.id);
    return `<section class="session-checkin" aria-labelledby="session-checkin-title"><div><p class="eyebrow">SESSION QR CHECK-IN</p><h3 id="session-checkin-title">${esc(session.title)}</h3><p>${esc(session.day)} · ${esc(session.time)} · ${esc(session.room)} · ${esc(session.category)}</p></div>${!person?'<a class="button" href="#login">Sign in to check in</a>':checked?'<span class="checkin-complete">✓ Attended</span>':scheduled?`<button type="button" class="button" data-session-checkin="${esc(session.id)}">Check in now</button>`:'<span class="checkin-note">Add this session to your schedule before checking in.</span>'}<p class="profile-disclaimer">This public demo stores the check-in only in this browser. The QR contains a public session link and no member information.</p><p class="session-checkin-status" role="status"></p></section>`;
  }
  function bindCheckin(event,person,selectedIds,rerender,data={events:[event],people:person?[person]:[]}){const button=document.querySelector('[data-session-checkin]');if(!button||!person)return;button.onclick=()=>{const sessionId=button.dataset.sessionCheckin;if(!selectedIds.includes(sessionId))return;const state=read(data);if(!state.checkins.some(row=>row.actorId===person.id&&row.eventId===event.id&&row.sessionId===sessionId)){const session=sessions(event).find(item=>item.id===sessionId),at=new Date().toISOString();state.checkins.unshift({actorId:person.id,eventId:event.id,sessionId,at});state.activity.unshift({actorId:person.id,text:`Checked in to ${session.title} at ${event.name}`,at});state.activity=state.activity.slice(0,60);write(state);}rerender();};}
  function profilePanel(data,personId){
    const plans=eventPlans().filter(plan=>plan.actorId===personId),state=read(data),checkins=state.checkins.filter(row=>row.actorId===personId),progress=badgeProgress(checkins.length),scheduled=plans.flatMap(plan=>{const event=data.events.find(row=>row.id===plan.eventId);if(!event)return[];return sessions(event).filter(session=>plan.agendaIds?.includes(session.id)).map(session=>({event,session,attended:checkins.some(row=>row.eventId===event.id&&row.sessionId===session.id)}));});
    const badges=badgeDefinitions.map(badge=>`<article class="participation-badge ${progress.earned.some(item=>item.id===badge.id)?'earned':'locked'}"><span>${badge.icon}</span><div><strong>${esc(badge.name)}</strong><small>${progress.earned.some(item=>item.id===badge.id)?badge.description:`Unlock at ${badge.count} check-in${badge.count===1?'':'s'}.`}</small></div></article>`).join('');
    const schedule=scheduled.length?scheduled.map(({event,session,attended})=>{const qr=sessionQr(event,session);return `<article class="profile-session"><img src="${qr.url}" alt="QR ticket for ${esc(session.title)}" width="112" height="112" loading="lazy"><div><span class="session-category">${esc(session.category)}</span><h3>${esc(session.title)}</h3><p>${esc(session.day)} · ${esc(session.time)}<br>${esc(session.room)}</p><a href="${qr.target}">${attended?'View attended session':'Open check-in'} →</a></div><span class="attendance-state ${attended?'attended':''}">${attended?'✓ Attended':'Scheduled'}</span></article>`;}).join(''):'<p class="quiet-empty">No convention sessions selected yet. Open the IMRC Convention and build your personal schedule.</p>';
    return `<section class="profile-convention"><div class="section-head"><div><p class="eyebrow">MY CONVENTION</p><h2>Schedule, QR tickets, and participation</h2><p>Your selected sessions and check-ins stay in this browser.</p></div><a href="#event/EV2028">Edit schedule →</a></div><div class="badge-summary"><strong>${checkins.length}</strong><span>session check-ins</span>${progress.next?`<small>${progress.next.count-checkins.length} more to earn ${esc(progress.next.name)}</small>`:'<small>All demo participation badges earned</small>'}</div><div class="participation-badges" aria-label="Participation badges">${badges}</div><h2>My schedule</h2><div class="profile-schedule">${schedule}</div></section>`;
  }
  function reset(){try{localStorage.removeItem(key);}catch{}}
  const api={key,sessions,badgeProgress,normalize,agendaBrowser,bindAgendaBrowser,decoratePlanner,checkinPanel,bindCheckin,profilePanel,activity:data=>read(data).activity,reset};
  root.ConventionExperience=api;if(typeof module==='object'&&module.exports)module.exports=api;
  if(typeof document!=='undefined'){
    let dataPromise;
    const loadData=()=>dataPromise||(dataPromise=fetch('./data.json').then(response=>response.json()));
    const autoBind=()=>{const category=query().get('category')||'';document.querySelectorAll('.programme-browser').forEach(node=>{const match=[...node.querySelectorAll('[data-programme-category]')].find(item=>item.dataset.programmeCategory===category),day=match?.closest('[data-programme-day]')?.dataset.programmeDay||'';bindFilter(node,day,category);});if(location.hash==='#profile'&&!document.querySelector('.profile-convention')&&document.querySelector('.profile-actions'))loadData().then(data=>{let session;try{session=JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session;}catch{}if(location.hash==='#profile'&&session?.authenticated&&!document.querySelector('.profile-convention'))document.querySelector('.profile-actions')?.insertAdjacentHTML('afterend',profilePanel(data,session.personaId));}).catch(()=>{});};
    root.ConventionExperience.bindAll=autoBind;
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',autoBind,{once:true});else autoBind();
    document.querySelector('#reset-demo-tab')?.addEventListener('click',reset);
  }
})(globalThis);
