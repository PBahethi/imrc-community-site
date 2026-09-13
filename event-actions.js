(function(root){
  'use strict';
  if(typeof document!=='undefined'&&!document.querySelector('link[href="./event-actions.css"]')){const style=document.createElement('link');style.rel='stylesheet';style.href='./event-actions.css';document.head?.appendChild(style);}
  let data,repo,observed=false;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const actor=()=>{try{const session=JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session;return session?.authenticated?data?.people.find(p=>p.id===session.personaId)||null:null;}catch{return null;}};
  function init(next){data=next;if(!repo){let storage;try{storage=localStorage;}catch{storage={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};}repo=EventActionsCore.repository(storage,data.people,data.events);}else repo.updateReferences(data.people,data.events);}
  function familyFor(person){if(!person)return[];const linked=data.people.filter(p=>p.id!==person.id&&(p.familyOf===person.id||person.familyOf===p.id));return [person,...linked].slice(0,12);}
  function registration(event,person){const state=repo.read(),record=state.registrations.find(r=>r.eventId===event.id&&r.actorId===person?.id),family=familyFor(person);return `<section class="event-action-panel" aria-labelledby="register-title"><div class="event-action-heading"><div><p class="eyebrow">GATHER TOGETHER</p><h2 id="register-title">Register your household</h2><p>${record?`You have ${record.attendeeIds.length} ${record.attendeeIds.length===1?'attendee':'attendees'} registered.`:'Choose who is coming. One confirmation keeps the household together.'}</p></div><span class="event-capacity">${event.people.length} story participants</span></div>${person?`<form id="event-registration-form"><fieldset><legend>Who will attend?</legend>${family.map(p=>`<label class="attendee-choice"><input type="checkbox" name="attendee" value="${esc(p.id)}" ${record?.attendeeIds.includes(p.id)?'checked':''}><span>${esc(p.name)}<small>${p.id===person.id?'You':'Family member'}</small></span></label>`).join('')}</fieldset><button class="button" type="submit">${record?'Update registration':'Register household'}</button><span id="registration-status" role="status"></span></form>`:'<p><a href="#login">Sign in</a> to register yourself and linked family members.</p>'}</section>`;}
  function requests(event,person){const rows=repo.read().requests.filter(r=>r.eventId===event.id);return `<section class="event-requests" aria-labelledby="requests-title"><div class="event-action-heading"><div><p class="eyebrow">COMMUNITY REQUESTS</p><h2 id="requests-title">Post a request</h2><p>Ask for a ride, offer volunteer help, submit a question, or share an accessibility need.</p></div></div>${person?`<form id="event-request-form"><label for="request-type">Request type</label><select id="request-type" name="requestType">${EventActionsCore.requestTypes.map(t=>`<option>${t}</option>`).join('')}</select><label for="request-title">Title</label><input id="request-title" name="title" maxlength="140" required placeholder="What would help?"/><label for="request-body">Details</label><textarea id="request-body" name="body" maxlength="600" rows="3" required placeholder="Add the useful details for other attendees."></textarea><button class="button secondary" type="submit">Post request</button><span id="request-status" role="status"></span></form>`:'<p><a href="#login">Sign in</a> to post a request.</p>'}<div class="request-list">${rows.map(r=>`<article class="request-card"><span class="tag">${esc(r.type)}</span><h3>${esc(r.title)}</h3><p>${esc(r.body)}</p><small>Posted by ${esc(data.people.find(p=>p.id===r.actorId)?.name||'Demo member')}</small></article>`).join('')||'<p class="quiet-empty">No requests yet. A clear request can help people find one another.</p>'}</div></section>`;}
  function mount(next,event,refresh=false){
    init(next);
    const host=document.querySelector('.event-detail-grid');
    if(!host)return;
    let panels=host.parentElement.querySelector('#event-participation');
    if(panels&&!refresh)return;
    if(!panels){panels=document.createElement('div');panels.id='event-participation';host.insertAdjacentElement('afterend',panels);}
    panels.innerHTML=registration(event,actor())+requests(event,actor());
    bind(event);
  }
  function bind(event){
    const rf=document.querySelector('#event-registration-form');
    if(rf)rf.onsubmit=e=>{
      e.preventDefault();init(data);
      const attendeeIds=[...rf.querySelectorAll('input[name="attendee"]:checked')].map(i=>i.value),person=actor();
      const status=document.querySelector('#registration-status');
      if(!attendeeIds.length){status.textContent='Choose at least one attendee.';return;}
      const state=repo.apply({type:'register',eventId:event.id,attendeeIds},person);
      const record=state.registrations.find(r=>r.eventId===event.id&&r.actorId===person?.id);
      if(!record||record.attendeeIds.length!==attendeeIds.length||!attendeeIds.every(id=>record.attendeeIds.includes(id))){status.textContent='Registration could not be saved. Sign in and check the selected attendees.';return;}
      mount(data,event,true);
      document.querySelector('#registration-status').textContent=repo.isPersistent()?'Registration saved in this browser.':'Registration saved for this visit.';
    };
    const qf=document.querySelector('#event-request-form');
    if(qf)qf.onsubmit=e=>{
      e.preventDefault();init(data);
      const f=new FormData(qf),id=`rq-${crypto.randomUUID()}`;
      const state=repo.apply({type:'request',eventId:event.id,requestType:f.get('requestType'),title:f.get('title'),body:f.get('body'),id},actor());
      if(!state.requests.some(r=>r.id===id)){document.querySelector('#request-status').textContent='Request could not be posted. Check your sign-in and request details; the demo supports up to 200 requests.';return;}
      mount(data,event,true);
      document.querySelector('#request-status').textContent=repo.isPersistent()?'Request posted in this browser.':'Request posted for this visit.';
    };
  }
  function decorate(next){init(next);document.querySelectorAll('.event').forEach(card=>{if(card.querySelector('.event-register-link'))return;const href=card.querySelector('a[href^="#event/"]')?.getAttribute('href');if(!href)return;const link=document.createElement('a');link.className='event-register-link';link.href=href;link.textContent='Register →';card.querySelector('.card-bottom')?.prepend(link);});}
  function observe(next){init(next);if(observed)return;observed=true;const refresh=()=>{decorate(next);const match=location.hash.match(/^#event\/(.+)$/),event=match&&next.events.find(e=>e.id===decodeURIComponent(match[1]));if(event&&document.querySelector('.event-detail-grid'))mount(next,event);};refresh();if(typeof MutationObserver==='function')new MutationObserver(refresh).observe(document.querySelector('#main'),{childList:true,subtree:true});}
  root.EventActions={init,mount,observe,activity:()=>repo?repo.read().activity:[],reset:()=>repo?.reset()};
  if(typeof document!=='undefined')document.dispatchEvent(new Event('event-actions-ready'));
})(globalThis);
