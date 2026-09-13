(function(root){
  'use strict';
  if(typeof document!=='undefined'&&!document.querySelector('link[href="./event-actions.css"]')){const style=document.createElement('link');style.rel='stylesheet';style.href='./event-actions.css';document.head?.appendChild(style);}
  let data,repo,observed=false;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const actor=()=>{try{const session=JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session;return session?.authenticated?data?.people.find(p=>p.id===session.personaId)||null:null;}catch{return null;}};
  const conventionAgendaId=(dayIndex,itemIndex)=>`d${dayIndex}-i${itemIndex}`;
  const packingBase=['Photo ID','Hotel confirmation','Event QR ticket','Comfortable clothes','Traditional outfit','Reusable water bottle','Phone charger','Medication','Notebook'];
  function busTimes(event,direction){
    const dates=event.dates.map(d=>new Date(d+'T00:00:00Z'));
    const fmt=d=>d.toISOString().slice(0,10);
    const first=dates[0],last=dates[dates.length-1],before=new Date(first),after=new Date(last);
    before.setUTCDate(first.getUTCDate()-1);after.setUTCDate(last.getUTCDate()+1);
    const arrivalDays=[before,first],departureDays=[last,after],hours=direction==='arrival'?['10:00 AM','12:00 PM','2:00 PM','4:00 PM','6:00 PM','8:00 PM','10:00 PM']:['5:00 AM','7:00 AM','9:00 AM','11:00 AM','1:00 PM','3:00 PM'];
    return (direction==='arrival'?arrivalDays:departureDays).flatMap(day=>hours.map(time=>`${fmt(day)} ${time}`));
  }
  function packingFor(plan){
    const extra=[];
    if(plan.airline||plan.flightIn||plan.flightOut)extra.push('Airline itinerary');
    if(String(plan.arrivalAt||'').match(/PM|2[0-3]:|1[8-9]:/i))extra.push('Late-arrival snack');
    if(plan.agendaIds?.length)extra.push('Session notes');
    if(plan.reminders?.includes('yoga'))extra.push('Yoga clothes');
    return [...new Set([...packingBase,...extra])];
  }
  function init(next){data=next;if(!repo){let storage;try{storage=localStorage;}catch{storage={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};}repo=EventActionsCore.repository(storage,data.people,data.events);}else repo.updateReferences(data.people,data.events);}
  function familyFor(person){if(!person)return[];const linked=data.people.filter(p=>p.id!==person.id&&(p.familyOf===person.id||person.familyOf===p.id));return [person,...linked].slice(0,12);}
  function registration(event,person){const state=repo.read(),record=state.registrations.find(r=>r.eventId===event.id&&r.actorId===person?.id),family=familyFor(person);return `<section class="event-action-panel" aria-labelledby="register-title"><div class="event-action-heading"><div><p class="eyebrow">GATHER TOGETHER</p><h2 id="register-title">Register your household</h2><p>${record?`You have ${record.attendeeIds.length} ${record.attendeeIds.length===1?'attendee':'attendees'} registered.`:'Choose who is coming. One confirmation keeps the household together.'}</p></div><span class="event-capacity">${event.people.length} story participants</span></div>${person?`<form id="event-registration-form"><fieldset><legend>Who will attend?</legend>${family.map(p=>`<label class="attendee-choice"><input type="checkbox" name="attendee" value="${esc(p.id)}" ${record?.attendeeIds.includes(p.id)?'checked':''}><span>${esc(p.name)}<small>${p.id===person.id?'You':'Family member'}</small></span></label>`).join('')}</fieldset><button class="button" type="submit">${record?'Update registration':'Register household'}</button><span id="registration-status" role="status"></span></form>`:'<p><a href="#login">Sign in</a> to register yourself and linked family members.</p>'}</section>`;}
  function requests(event,person){const rows=repo.read().requests.filter(r=>r.eventId===event.id);return `<section class="event-requests" aria-labelledby="requests-title"><div class="event-action-heading"><div><p class="eyebrow">COMMUNITY REQUESTS</p><h2 id="requests-title">Post a request</h2><p>Ask for a ride, offer volunteer help, submit a question, or share an accessibility need.</p></div></div>${person?`<form id="event-request-form"><label for="request-type">Request type</label><select id="request-type" name="requestType">${EventActionsCore.requestTypes.map(t=>`<option>${t}</option>`).join('')}</select><label for="request-title">Title</label><input id="request-title" name="title" maxlength="140" required placeholder="What would help?"/><label for="request-body">Details</label><textarea id="request-body" name="body" maxlength="600" rows="3" required placeholder="Add the useful details for other attendees."></textarea><button class="button secondary" type="submit">Post request</button><span id="request-status" role="status"></span></form>`:'<p><a href="#login">Sign in</a> to post a request.</p>'}<div class="request-list">${rows.map(r=>`<article class="request-card"><span class="tag">${esc(r.type)}</span><h3>${esc(r.title)}</h3><p>${esc(r.body)}</p><small>Posted by ${esc(data.people.find(p=>p.id===r.actorId)?.name||'Demo member')}</small></article>`).join('')||'<p class="quiet-empty">No requests yet. A clear request can help people find one another.</p>'}</div></section>`;}
  function conventionWorkflow(event,person){
    if(event.type!=='Convention')return '';
    const state=repo.read(),registered=state.registrations.find(r=>r.eventId===event.id&&r.actorId===person?.id),plan=state.conventionPlans.find(p=>p.eventId===event.id&&p.actorId===person?.id)||{};
    const agenda=event.agenda.flatMap((day,dayIndex)=>day.items.map((item,itemIndex)=>({id:conventionAgendaId(dayIndex,itemIndex),day:day.day,item})));
    const selectedPacking=plan.packing?.length?plan.packing:packingFor(plan);
    return `<section class="event-action-panel convention-workflow" aria-labelledby="convention-workflow-title"><div class="event-action-heading"><div><p class="eyebrow">REVIEW WORKFLOW</p><h2 id="convention-workflow-title">Finish convention logistics</h2><p>Register first, book the hotel externally, then return here to finish travel, agenda, reminders, and buses in any order.</p></div><span class="event-capacity">${registered?'Registered':'Sign in to start'}</span></div>${person?`<div class="workflow-steps"><span class="${registered?'done':''}">1 Register</span><span class="${plan.hotelBooked?'done':''}">2 Hotel</span><span class="${plan.arrivalBus&&plan.departureBus?'done':''}">3 Buses</span><span class="${plan.agendaIds?.length?'done':''}">4 Agenda</span><span class="${plan.reminders?.length?'done':''}">5 Reminders</span></div><form id="convention-workflow-form"><div class="hotel-booking-card"><div><h3>Book hotel externally</h3><p>Use the venue website to reserve rooms or finish an organizer-provided room block booking. Return here and mark the booking complete.</p></div><a class="button secondary" href="${esc(event.venue.sourceUrl)}" target="_blank" rel="noopener">Book hotel externally ↗</a><label class="attendee-choice compact"><input type="checkbox" name="hotelBooked" ${plan.hotelBooked?'checked':''}><span>Hotel booking completed</span></label></div><fieldset><legend>Airline itinerary</legend><div class="logistics-grid"><label>Airline<input name="airline" maxlength="60" value="${esc(plan.airline||'')}" placeholder="American, Southwest, Delta..."></label><label>Arrival flight<input name="flightIn" maxlength="40" value="${esc(plan.flightIn||'')}" placeholder="AA 1234"></label><label>Arrival date/time<input name="arrivalAt" maxlength="40" value="${esc(plan.arrivalAt||'')}" placeholder="2028-01-14 6:20 PM"></label><label>Departure flight<input name="flightOut" maxlength="40" value="${esc(plan.flightOut||'')}" placeholder="WN 5678"></label><label>Departure date/time<input name="departureAt" maxlength="40" value="${esc(plan.departureAt||'')}" placeholder="2028-01-19 10:15 AM"></label></div></fieldset><fieldset><legend>Airport buses</legend><div class="logistics-grid"><label>Airport to hotel<select name="arrivalBus"><option value="">Choose arrival coach</option>${busTimes(event,'arrival').map(t=>`<option value="${esc(t)}" ${plan.arrivalBus===t?'selected':''}>${esc(t)} · OKC to Omni</option>`).join('')}</select></label><label>Hotel to airport<select name="departureBus"><option value="">Choose departure coach</option>${busTimes(event,'departure').map(t=>`<option value="${esc(t)}" ${plan.departureBus===t?'selected':''}>${esc(t)} · Omni to OKC</option>`).join('')}</select></label></div></fieldset><fieldset><legend>Agenda signups</legend><p class="form-note">Choose any sessions you want. These are not serial; you can select mentoring without selecting earlier sessions.</p><div class="agenda-pick-grid">${agenda.map(a=>`<label class="choice"><input type="checkbox" name="agendaIds" value="${a.id}" ${plan.agendaIds?.includes(a.id)?'checked':''}><span><strong>${esc(a.item)}</strong><small>${esc(a.day)}</small></span></label>`).join('')}</div></fieldset><fieldset><legend>Event reminders</legend><div class="choice-grid">${[['hotel','Hotel booking follow-up'],['bus','Bus pickup reminders'],['meals','Meal times'],['agenda','Selected agenda sessions'],['yoga','Yoga mornings'],['packing','Packing list before travel']].map(([id,label])=>`<label class="choice"><input type="checkbox" name="reminders" value="${id}" ${plan.reminders?.includes(id)?'checked':''}><span>${esc(label)}</span></label>`).join('')}</div></fieldset><fieldset><legend>Example packing list</legend><p class="form-note">The demo suggests items from your itinerary and reminders. Adjust the checked items before saving.</p><div class="choice-grid">${packingFor(plan).map(item=>`<label class="choice"><input type="checkbox" name="packing" value="${esc(item)}" ${selectedPacking.includes(item)?'checked':''}><span>${esc(item)}</span></label>`).join('')}</div></fieldset><button class="button" type="submit">Save convention logistics</button><span id="convention-status" role="status"></span></form>`:'<p><a href="#login">Sign in</a> to review the convention workflow.</p>'}</section>`;
  }
  function mount(next,event,refresh=false){
    init(next);
    const host=document.querySelector('.event-detail-grid');
    if(!host)return;
    let panels=host.parentElement.querySelector('#event-participation');
    if(panels&&!refresh)return;
    if(!panels){panels=document.createElement('div');panels.id='event-participation';host.insertAdjacentElement('afterend',panels);}
    panels.innerHTML=registration(event,actor())+conventionWorkflow(event,actor())+requests(event,actor());
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
    const cf=document.querySelector('#convention-workflow-form');
    if(cf)cf.onsubmit=e=>{
      e.preventDefault();init(data);
      const f=new FormData(cf),value={hotelBooked:f.get('hotelBooked')==='on',airline:f.get('airline'),flightIn:f.get('flightIn'),arrivalAt:f.get('arrivalAt'),flightOut:f.get('flightOut'),departureAt:f.get('departureAt'),arrivalBus:f.get('arrivalBus'),departureBus:f.get('departureBus'),agendaIds:f.getAll('agendaIds'),reminders:f.getAll('reminders'),packing:f.getAll('packing')};
      const state=repo.apply({type:'convention-plan',eventId:event.id,value},actor());
      if(!state.conventionPlans.some(p=>p.eventId===event.id&&p.actorId===actor()?.id)){document.querySelector('#convention-status').textContent='Convention logistics could not be saved. Sign in and try again.';return;}
      mount(data,event,true);
      document.querySelector('#convention-status').textContent=repo.isPersistent()?'Convention logistics saved in this browser.':'Convention logistics saved for this visit.';
    };
  }
  function decorate(next){init(next);document.querySelectorAll('.event').forEach(card=>{if(card.querySelector('.event-register-link'))return;const href=card.querySelector('a[href^="#event/"]')?.getAttribute('href');if(!href)return;const link=document.createElement('a');link.className='event-register-link';link.href=href;link.textContent='Register →';card.querySelector('.card-bottom')?.prepend(link);});}
  function observe(next){init(next);if(observed)return;observed=true;const refresh=()=>{decorate(next);const match=location.hash.match(/^#event\/(.+)$/),event=match&&next.events.find(e=>e.id===decodeURIComponent(match[1]));if(event&&document.querySelector('.event-detail-grid'))mount(next,event);};refresh();if(typeof MutationObserver==='function')new MutationObserver(refresh).observe(document.querySelector('#main'),{childList:true,subtree:true});}
  root.EventActions={init,mount,observe,activity:()=>repo?repo.read().activity:[],reset:()=>repo?.reset()};
  if(typeof document!=='undefined')document.dispatchEvent(new Event('event-actions-ready'));
})(globalThis);
