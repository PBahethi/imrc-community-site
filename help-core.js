/* Explicit, browser-local offers. Profile fields never imply consent to help. */
(function(root){
  'use strict';
  const key='forest-help-v1';
  const clean=(v,n=160)=>typeof v==='string'?v.trim().slice(0,n):'';
  function normalize(value,capabilities){
    const allowed=capabilities.map(c=>c.id),v=value&&value.version===1?value:{};
    const seen=new Set();
    const offers=(Array.isArray(v.offers)?v.offers:[]).filter(o=>o&&clean(o.memberId)&&!seen.has(o.memberId)&&seen.add(o.memberId)).slice(0,500).map(o=>({memberId:clean(o.memberId),available:o.available===true,capabilityIds:Array.isArray(o.capabilityIds)?[...new Set(o.capabilityIds.filter(id=>allowed.includes(id)))]:[]}));
    const activity=(Array.isArray(v.activity)?v.activity:[]).filter(a=>a&&clean(a.actorId)&&typeof a.text==='string'&&Number.isFinite(Date.parse(a.at))).slice(0,30).map(a=>({actorId:clean(a.actorId),text:clean(a.text),at:new Date(a.at).toISOString()}));
    return {version:1,offers,activity};
  }
  function offer(value,memberId,capabilities){return normalize(value,capabilities).offers.find(o=>o.memberId===memberId)||{memberId,available:false,capabilityIds:[]};}
  function transition(value,action,actor,capabilities,now=new Date()){
    const state=normalize(value,capabilities);if(!actor||!clean(actor.id)||action.type!=='offer')return state;
    const next=normalize({version:1,offers:[{memberId:actor.id,available:action.available,capabilityIds:action.capabilityIds}]},capabilities).offers[0];
    if(!next.capabilityIds.length)next.available=false;
    const previous=offer(state,actor.id,capabilities);
    if(previous.available===next.available&&JSON.stringify(previous.capabilityIds)===JSON.stringify(next.capabilityIds))return state;
    state.offers=state.offers.filter(o=>o.memberId!==actor.id).concat(next);
    state.activity.unshift({actorId:actor.id,text:next.available?'Updated an available community help offer':'Updated help topics; availability is off',at:now.toISOString()});state.activity=state.activity.slice(0,30);return state;
  }
  function search(people,value,capabilities,{capabilityId='',city='',query='',viewerId=''}={}){
    const state=normalize(value,capabilities),needle=clean(query).toLowerCase();
    return people.filter(p=>p.id!==viewerId).map(person=>({person,offer:offer(state,person.id,capabilities)})).filter(row=>row.offer.available&&row.offer.capabilityIds.length&&(!capabilityId||row.offer.capabilityIds.includes(capabilityId))&&(!city||row.person.city===city)).map(row=>({...row,capabilities:capabilities.filter(c=>row.offer.capabilityIds.includes(c.id))})).filter(row=>!needle||[row.person.name,row.person.city,...row.capabilities.map(c=>c.label)].join(' ').toLowerCase().includes(needle)).sort((a,b)=>a.person.name.localeCompare(b.person.name)||a.person.id.localeCompare(b.person.id));
  }
  function prompt(value,actor,capabilities){
    if(!actor)return null;const own=offer(value,actor.id,capabilities),chosen=capabilities.find(c=>own.capabilityIds.includes(c.id));
    return chosen?{capabilityId:chosen.id,title:`You chose ${chosen.label}`,text:own.available?`Share one useful tip about ${chosen.label.toLowerCase()} in Ask the Community, or answer a relevant question.`:`When you have time, turn on availability for your selected help topics.`,available:own.available}:null;
  }
  function repository(storage,capabilities){
    let memory=null,persistent=true;
    function read(){if(memory)return normalize(memory,capabilities);try{memory=normalize(JSON.parse(storage.getItem(key)||'null'),capabilities);}catch{persistent=false;memory=normalize(null,capabilities);}return normalize(memory,capabilities);}
    return {read,isPersistent:()=>persistent,apply(action,actor){memory=transition(read(),action,actor,capabilities);try{storage.setItem(key,JSON.stringify(memory));persistent=true;}catch{persistent=false;}return read();},reset(){memory=normalize(null,capabilities);try{storage.removeItem(key);persistent=true;}catch{persistent=false;}return read();}};
  }
  const api={key,normalize,offer,transition,search,prompt,repository};root.HelpCore=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
