/* Browser-local participation domain. All member offers are explicit demo choices. */
(function(root){
  'use strict';
  const categories=['Recommendations','Education','Careers','Travel','Community help','Local information','Culture','Food','Sports','Events','Parenting','Technology'];
  const areas=['High school','College','Graduate school','Career','Entrepreneurship','Technology','Medicine','Government','Leadership','Community service','Culture/language'];
  const seeds=[{id:'welcome-question',title:'What would help a new family feel welcome?',description:'Share one small activity or useful local tip.',category:'Community help',tags:['welcome'],author:'Welcome circle (demo)',authorId:'',date:'2026-09-12T12:00:00Z'}];
  const clean=(v,n=600)=>typeof v==='string'?v.trim().slice(0,n):'';
  const unique=v=>Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'))].slice(0,100):[];
  const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,120}$/.test(id)&&!['__proto__','constructor','prototype'].includes(id);
  const validDate=date=>typeof date==='string'&&Number.isFinite(Date.parse(date));
  function normalize(v){
    v=v&&typeof v==='object'&&!Array.isArray(v)?v:{};
    const ids=new Set(seeds.map(q=>q.id)),questions=[];
    for(const q of Array.isArray(v.questions)?v.questions:[]){if(questions.length>=100)break;if(!q||!validId(q.id)||ids.has(q.id)||!validId(q.authorId)||!validDate(q.date)||!categories.includes(q.category)||!clean(q.title,160)||!clean(q.description))continue;ids.add(q.id);questions.push({id:q.id,title:clean(q.title,160),description:clean(q.description),author:clean(q.author,160),authorId:q.authorId,date:q.date,category:q.category,tags:unique(q.tags).map(t=>clean(t,30)).filter(Boolean).slice(0,5)});}
    const replies=(Array.isArray(v.replies)?v.replies:[]).filter(r=>r&&ids.has(r.questionId)&&validId(r.authorId)&&validDate(r.date)&&clean(r.body)).slice(0,500).map(r=>({questionId:r.questionId,body:clean(r.body),author:clean(r.author,160),authorId:r.authorId,date:r.date}));
    const members={};for(const [id,value] of Object.entries(v.members&&typeof v.members==='object'&&!Array.isArray(v.members)?v.members:{})){if(!validId(id)||!value||typeof value!=='object'||Array.isArray(value))continue;const m=member({members:{[id]:value}},id);for(const field of ['following','liked','reported'])m[field]=m[field].filter(q=>ids.has(q));members[id]=m;}
    const activity=(Array.isArray(v.activity)?v.activity:[]).filter(a=>a&&validId(a.actorId)&&clean(a.text,160)&&validDate(a.at)).slice(0,30).map(a=>({actorId:a.actorId,text:clean(a.text,160),at:a.at}));
    return {questions,replies,members,activity};
  }
  function member(state,id){const raw=state?.members&&Object.hasOwn(state.members,id)?state.members[id]:null,m=raw&&typeof raw==='object'?raw:{};return {following:unique(m.following).filter(validId),liked:unique(m.liked).filter(validId),reported:unique(m.reported).filter(validId),mentors:unique(m.mentors).filter(validId),willing:m.willing===true,seeking:m.seeking===true,areas:unique(m.areas).filter(a=>areas.includes(a))};}
  function transition(value,action,actor,now=new Date()){
    const s=normalize(value);if(!actor||!validId(actor.id)||!action||typeof action!=='object')return s;
    const m=member(s,actor.id);const questions=[...s.questions,...seeds];let text='';
    if(action.type==='post'){
      const title=clean(action.title,160),description=clean(action.description);if(s.questions.length>=100||!title||!description||!categories.includes(action.category)||!validId(action.id)||questions.some(q=>q.id===action.id))return s;
      s.questions.unshift({id:action.id,title,description,category:action.category,tags:unique(action.tags).map(t=>clean(t,30)).filter(Boolean).slice(0,5),author:clean(actor.name,160),authorId:actor.id,date:now.toISOString()});text='Posted a community question';
    }else if(action.type==='reply'){
      if(s.replies.length>=500||!questions.some(q=>q.id===action.target)||!clean(action.body))return s;
      s.replies.push({questionId:action.target,body:clean(action.body),author:clean(actor.name,160),authorId:actor.id,date:now.toISOString()});text='Answered a community question';
    }else if(['following','liked','reported'].includes(action.type)){
      if(!questions.some(q=>q.id===action.target))return s;
      if(!m[action.type].includes(action.target)&&m[action.type].length>=100)return s;
      m[action.type]=m[action.type].includes(action.target)?m[action.type].filter(id=>id!==action.target):[...m[action.type],action.target];text={following:'Updated followed questions',liked:'Updated a question reaction',reported:'Updated a local question report'}[action.type];
    }else if(action.type==='mentorship'){
      m.willing=action.willing===true;m.seeking=action.seeking===true;m.areas=unique(action.areas).filter(a=>areas.includes(a));text='Updated mentorship preferences';
    }else if(action.type==='mentor'){
      if(!validId(action.target)||action.target===actor.id||(!m.mentors.includes(action.target)&&(m.mentors.length>=100||!member(s,action.target).willing)))return s;m.mentors=m.mentors.includes(action.target)?m.mentors.filter(id=>id!==action.target):[...m.mentors,action.target];text='Updated a saved mentor introduction';
    }else return s;
    s.members={...s.members,[actor.id]:m};s.activity=[{actorId:actor.id,text,at:now.toISOString()},...s.activity].slice(0,30);return s;
  }
  function matches(people,state,viewerId,topic=''){
    const viewer=people.find(p=>p.id===viewerId),prefs=member(state,viewerId);
    return people.filter(p=>p.id!==viewerId&&member(state,p.id).willing).map(person=>{const offer=member(state,person.id),shared=offer.areas.filter(a=>prefs.areas.includes(a)),reasons=shared.map(a=>`Shared mentoring area: ${a}`);if(viewer?.city&&person.city===viewer.city)reasons.push(`Both list ${person.city}`);return {person,areas:offer.areas,reasons:reasons.length?reasons:['This member opted in to offer mentoring.'],score:shared.length*3+(viewer?.city&&person.city===viewer.city?1:0)};}).filter(m=>!topic||m.areas.includes(topic)).sort((a,b)=>b.score-a.score||a.person.id.localeCompare(b.person.id));
  }
  const api={categories,areas,seeds,normalize,member,transition,matches};root.ParticipationCore=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
