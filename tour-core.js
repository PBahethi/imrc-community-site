(function(root){
  'use strict';
  const key='forest-board-tour-v1';
  const personaId='RAM-001';
  const routerViews=['tour','chapter','login','home','connections','event','profile','votes'];
  const allowedSeedKeys=['forest-community-v1','forest-saved','forest-event-actions-v1','forest-convention-attendance-v1','forest-votes-v1','forest-theme-preference-v1','forest-theme-v1'];
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function normalizeSteps(value){return Array.isArray(value)?value.filter(step=>step&&typeof step.id==='string'&&typeof step.route==='string'&&typeof step.title==='string'&&typeof step.seeing==='string'&&typeof step.why==='string').map(step=>({...step,targetSelector:typeof step.targetSelector==='string'?step.targetSelector:''})):[];}
  function clamp(index,steps){return Math.max(0,Math.min(Number.isFinite(index)?index:0,Math.max(0,steps.length-1)));}
  function indexFor(steps,id){const index=steps.findIndex(step=>step.id===id);return index<0?0:index;}
  function next(steps,index){return steps[clamp(index+1,steps)]||null;}
  function previous(steps,index){return steps[clamp(index-1,steps)]||null;}
  function targetFor(step){return step?.targetSelector||'';}
  function routeView(route){return String(route||'').replace(/^#/,'').split('/')[0];}
  function validateRoutes(steps,views=routerViews){return normalizeSteps(steps).filter(step=>!views.includes(routeView(step.route))).map(step=>step.id);}
  function normalizeState(value){const source=value&&value.version===1?value:{};return {version:1,active:source.active===true,seeded:source.seeded===true,currentId:typeof source.currentId==='string'?source.currentId:'welcome'};}
  function repository(storage){let memory=null,persistent=true;function read(){if(memory)return normalizeState(memory);try{memory=normalizeState(JSON.parse(storage.getItem(key)||'null'));}catch{persistent=false;memory=normalizeState(null);}return normalizeState(memory);}return {read,isPersistent:()=>persistent,save(patch){memory=normalizeState({...read(),...patch,version:1});try{storage.setItem(key,JSON.stringify(memory));persistent=true;}catch{persistent=false;}return read();},reset(){memory=normalizeState(null);try{storage.removeItem(key);persistent=true;}catch{persistent=false;}return read();}};}
  function seedPlan(data,now=new Date('2026-09-14T15:00:00.000Z')){
    const people=new Set((data?.people||[]).map(person=>person.id)),events=new Set((data?.events||[]).map(event=>event.id));
    if(!people.has(personaId)||!people.has('RAM-002')||!events.has('EV001')||!events.has('EV2028'))return [];
    const at=new Date(now).toISOString();
    return [
      {op:'write',key:'forest-community-v1',value:{version:1,session:{authenticated:true,personaId,signedInAt:at},personaId,profileEdits:{},interestIds:['culture','mentoring'],helpIds:['welcome'],savedPeople:[],dismissedPeople:[],savedGroups:[],activity:[{type:'login',target:personaId,actorId:personaId,at}]}},
      {op:'write',key:'forest-saved',value:['EV001']},
      {op:'write',key:'forest-event-actions-v1',value:{version:1,registrations:[{eventId:'EV2028',actorId:personaId,attendeeIds:[personaId,'RAM-002'],guestNames:[],status:'registered'}],requests:[],conventionPlans:[{eventId:'EV2028',actorId:personaId,hotelBooked:false,airline:'',flightIn:'',arrivalAt:'',flightOut:'',departureAt:'',arrivalBus:'',departureBus:'',agendaIds:['sat-yoga','sat-rays'],reminders:[],packing:[],packingInitialized:false}],activity:[{actorId:personaId,text:'Updated convention logistics for IMRC Convention 2028',at},{actorId:personaId,text:'Registered 2 attendees for IMRC Convention 2028',at}]}},
      {op:'write',key:'forest-convention-attendance-v1',value:{version:1,checkins:[{actorId:personaId,eventId:'EV2028',sessionId:'sat-yoga',at}],activity:[{actorId:personaId,text:'Checked in to Yoga Morning at IMRC Convention 2028',at}]}},
      {op:'write',key:'forest-votes-v1',value:{version:1,votes:{'chapter-program-priority':{[personaId]:'0'}}}},
      {op:'remove',key:'forest-theme-preference-v1'},
      {op:'remove',key:'forest-theme-v1'}
    ];
  }
  function validateSeedPlan(plan){return Array.isArray(plan)&&plan.every(entry=>entry&&allowedSeedKeys.includes(entry.key)&&['write','remove'].includes(entry.op));}
  function applySeed(storage,plan){if(!validateSeedPlan(plan))return false;try{for(const entry of plan){if(entry.op==='remove')storage.removeItem(entry.key);else storage.setItem(entry.key,JSON.stringify(entry.value));}return true;}catch{return false;}}
  const api={key,personaId,routerViews,allowedSeedKeys,escapeHtml,normalizeSteps,clamp,indexFor,next,previous,targetFor,validateRoutes,normalizeState,repository,seedPlan,validateSeedPlan,applySeed};
  root.TourCore=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
