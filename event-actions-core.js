(function(root){
  'use strict';
  const key='forest-event-actions-v1';
  const requestTypes=['Ride','Volunteer','Question','Accessibility','Other'];
  const clean=(v,n=500)=>typeof v==='string'?v.trim().slice(0,n):'';
  const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,140}$/.test(id);
  function empty(){return {version:1,registrations:[],requests:[],activity:[]};}
  function normalize(value,people=[],events=[]){
    const v=value&&value.version===1?value:{},ids=new Set(people.map(p=>p.id)),eventIds=new Set(events.map(e=>e.id)),out=empty();
    out.registrations=(Array.isArray(v.registrations)?v.registrations:[]).filter(r=>r&&ids.has(r.actorId)&&eventIds.has(r.eventId)&&Array.isArray(r.attendeeIds)&&r.attendeeIds.length>0&&r.attendeeIds.length<=12&&r.attendeeIds.every(id=>ids.has(id))).map(r=>({eventId:r.eventId,actorId:r.actorId,attendeeIds:[...new Set(r.attendeeIds)]}));
    out.requests=(Array.isArray(v.requests)?v.requests:[]).filter(r=>r&&validId(r.id)&&ids.has(r.actorId)&&eventIds.has(r.eventId)&&requestTypes.includes(r.type)&&clean(r.title,140)&&clean(r.body,600)&&Number.isFinite(Date.parse(r.at))).slice(0,200).map(r=>({id:r.id,eventId:r.eventId,actorId:r.actorId,type:r.type,title:clean(r.title,140),body:clean(r.body,600),at:new Date(r.at).toISOString()}));
    out.activity=(Array.isArray(v.activity)?v.activity:[]).filter(a=>a&&ids.has(a.actorId)&&clean(a.text,180)&&Number.isFinite(Date.parse(a.at))).slice(0,40).map(a=>({actorId:a.actorId,text:clean(a.text,180),at:new Date(a.at).toISOString()}));
    return out;
  }
  function transition(value,action,actor,people,events,now=new Date()){
    const s=normalize(value,people,events);if(!actor||!people.some(p=>p.id===actor.id)||!action)return s;
    if(action.type==='register'){
      const event=events.find(e=>e.id===action.eventId),attendees=[...new Set(Array.isArray(action.attendeeIds)?action.attendeeIds:[])];
      if(!event||!attendees.length||attendees.length>12||!attendees.every(id=>people.some(p=>p.id===id)))return s;
      const existing=s.registrations.find(r=>r.eventId===event.id&&r.actorId===actor.id);if(existing){existing.attendeeIds=attendees;}else s.registrations.push({eventId:event.id,actorId:actor.id,attendeeIds:attendees});
      s.activity.unshift({actorId:actor.id,text:`Registered ${attendees.length} ${attendees.length===1?'attendee':'attendees'} for ${clean(event.name,120)}`,at:now.toISOString()});
    }else if(action.type==='request'){
      const event=events.find(e=>e.id===action.eventId);if(!event||!requestTypes.includes(action.requestType)||!clean(action.title,140)||!clean(action.body,600)||s.requests.length>=200)return s;
      s.requests.unshift({id:action.id,eventId:event.id,actorId:actor.id,type:action.requestType,title:clean(action.title,140),body:clean(action.body,600),at:now.toISOString()});s.activity.unshift({actorId:actor.id,text:`Posted an event ${action.requestType.toLowerCase()} request`,at:now.toISOString()});
    }else return s;
    s.activity=s.activity.slice(0,40);return s;
  }
  function repository(storage,people,events){let memory=null,persistent=true;function read(){if(memory)return normalize(memory,people,events);try{memory=normalize(JSON.parse(storage.getItem(key)||'null'),people,events);}catch{persistent=false;memory=empty();}return memory;}return {read,updateReferences(nextPeople,nextEvents){people=nextPeople;events=nextEvents;},isPersistent:()=>persistent,apply(action,actor){memory=transition(read(),action,actor,people,events);try{storage.setItem(key,JSON.stringify(memory));persistent=true;}catch{persistent=false;}return read();},reset(){memory=empty();try{storage.removeItem(key);persistent=true;}catch{persistent=false;}return read();}};}
  root.EventActionsCore={key,requestTypes,empty,normalize,transition,repository};if(typeof module==='object'&&module.exports)module.exports=root.EventActionsCore;
})(globalThis);
