/* Pure domain rules for the public demo. No authentication or private data. */
(function (root) {
  'use strict';
  const interests = [
    ['books','Books'],['culture','Culture'],['language','Languages'],['history','Community history'],
    ['volunteering','Community service'],['education','Education'],['mentoring','Mentoring'],
    ['technology','Technology'],['music','Music'],['cooking','Cooking'],['tennis','Tennis'],['travel','Travel']
  ].map(([id,label])=>({id,label}));
  const capabilities = [
    ['career','Career mentoring'],['college','College guidance'],['internships','Internships'],['introductions','Job introductions'],
    ['technology','Technology'],['medicine','Medicine'],['legal','Legal'],['finance','Finance'],['real-estate','Real estate'],
    ['immigration','Immigration'],['moving','Moving'],['transport','Transportation'],['language','Language practice'],
    ['culture','Cultural education'],['events','Event volunteering'],['elders','Elder assistance'],['welcome','New family welcome'],['history','Community history'],['other','Other']
  ].map(([id,label])=>({id,label}));
  // Illustrative group concepts, not memberships or facts about source characters.
  const groups = [
    {id:'story-circle',name:'Stories under the tree',interestIds:['books','culture','history'],description:'A small reading circle to share interpretations, questions, and stories across generations.',eventId:'EV002',activity:'Bring one passage you would like to discuss.',format:'Reading circle'},
    {id:'language-circle',name:'Language exchange',interestIds:['language','culture','education'],description:'A friendly place to practise a phrase, share its meaning, and learn from one another.',eventId:'EV005',activity:'Think of a phrase you could help someone learn.',format:'Peer learning'},
    {id:'welcome-circle',name:'The welcome circle',interestIds:['volunteering','mentoring','education'],description:'A group concept for people who enjoy welcoming families and making introductions.',eventId:'EV001',activity:'Choose one way you would like to welcome a new member.',format:'Community service'},
    {id:'culture-circle',name:'Culture & creativity',interestIds:['music','cooking','culture','history'],description:'Share the food, art, music, and memories that give a community its character.',eventId:'EV008',activity:'Choose a recipe, song, or story you could share.',format:'Interest group'}
  ];
  const uniqueIds=(value,allowed)=>Array.isArray(value)?[...new Set(value.filter(id=>typeof id==='string'&&allowed.includes(id)))]:[];
  const defaults=()=>({version:1,session:{authenticated:false,personaId:'',signedInAt:''},personaId:'',profileEdits:{},interestIds:[],helpIds:[],savedPeople:[],dismissedPeople:[],savedGroups:[],activity:[]});
  function normalize(value,personIds){
    const source=value&&typeof value==='object'&&!Array.isArray(value)&&value.version===1?value:{};
    const state=defaults();
    const session=source.session&&typeof source.session==='object'?source.session:{};
    state.session={authenticated:Boolean(session.authenticated)&&personIds.includes(session.personaId),personaId:personIds.includes(session.personaId)?session.personaId:'',signedInAt:typeof session.signedInAt==='string'&&Number.isFinite(Date.parse(session.signedInAt))?session.signedInAt:''};
    state.personaId=state.session.authenticated?state.session.personaId:(personIds.includes(source.personaId)?source.personaId:'');
    state.profileEdits={};
    if(source.profileEdits&&typeof source.profileEdits==='object') for(const [id,edit] of Object.entries(source.profileEdits)) if(personIds.includes(id)&&edit&&typeof edit==='object') state.profileEdits[id]={displayName:typeof edit.displayName==='string'?edit.displayName.slice(0,160):'',city:typeof edit.city==='string'?edit.city.slice(0,120):'',bio:typeof edit.bio==='string'?edit.bio.slice(0,2000):'',catchPhrase:typeof edit.catchPhrase==='string'?edit.catchPhrase.slice(0,240):''};
    state.interestIds=uniqueIds(source.interestIds,interests.map(i=>i.id));
    state.helpIds=uniqueIds(source.helpIds,capabilities.map(i=>i.id));
    state.savedPeople=uniqueIds(source.savedPeople,personIds).filter(id=>id!==state.personaId);
    state.dismissedPeople=uniqueIds(source.dismissedPeople,personIds).filter(id=>!state.savedPeople.includes(id));
    state.savedGroups=uniqueIds(source.savedGroups,groups.map(g=>g.id));
    const actions=['login','logout','profile-edit','preferences','save-person','remove-person','dismiss-person','save-group','remove-group'];
    state.activity=Array.isArray(source.activity)?source.activity.filter(a=>a&&actions.includes(a.type)&&typeof a.at==='string'&&Number.isFinite(Date.parse(a.at))&&((a.type==='preferences')||(a.type==='logout'&&(!a.target||personIds.includes(a.target)||personIds.includes(a.actorId)))||(a.type==='login'&&personIds.includes(a.target))||(a.type==='profile-edit'&&personIds.includes(a.target))||(a.type.includes('person')&&personIds.includes(a.target))||(a.type.includes('group')&&groups.some(g=>g.id===a.target)))).slice(0,12).map(a=>{const actorId=personIds.includes(a.actorId)?a.actorId:(['login','profile-edit','logout'].includes(a.type)&&personIds.includes(a.target)?a.target:'');return {type:a.type,target:a.type==='preferences'?'':a.target||'',actorId,at:a.at};}) : [];
    return state;
  }
  function sharedLanguages(a,b){
    const tokenize=value=>String(value||'').split(';').map(s=>s.trim()).filter(Boolean);
    const theirs=tokenize(b.languages).map(s=>s.toLowerCase());
    return tokenize(a.languages).filter(s=>theirs.includes(s.toLowerCase()));
  }
  function suggestions(data,state,limit=6){
    const viewer=data.people.find(p=>p.id===state.personaId);
    if(!viewer)return [];
    return data.people.filter(p=>p.id!==viewer.id&&!state.dismissedPeople.includes(p.id)&&!state.savedPeople.includes(p.id)).map(person=>{
      const reasons=[];let score=0;
      if(viewer.city&&viewer.city===person.city){reasons.push(`Both demo profiles list ${person.city}`);score+=3;}
      if(viewer.origin&&viewer.origin===person.origin){reasons.push(`Shared ancestral place: ${person.origin}`);score+=2;}
      const languages=sharedLanguages(viewer,person);
      if(languages.length){reasons.push(`Both list ${languages.slice(0,3).join(', ')}`);score+=1;}
      return {person,reasons,score};
    }).filter(p=>p.score>0).sort((a,b)=>b.score-a.score||a.person.id.localeCompare(b.person.id)).slice(0,limit);
  }
  function groupSuggestions(state){
    return groups.map(group=>({group,shared:interests.filter(i=>state.interestIds.includes(i.id)&&group.interestIds.includes(i.id))})).sort((a,b)=>b.shared.length-a.shared.length||a.group.id.localeCompare(b.group.id));
  }
  function upcoming(events,now=new Date()){
    // Calendar uses all-day values; compare to the visitor's local date without UTC date shifts.
    const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    return events.flatMap(event=>event.dates.filter(date=>date>=today).map(date=>({event,date}))).sort((a,b)=>a.date.localeCompare(b.date)||a.event.id.localeCompare(b.event.id));
  }
  function transition(current,action,personIds,now=new Date()){
    const state=normalize(current,personIds);
    if(action.type==='login'){
      if(!personIds.includes(action.personaId))return state;
      state.session={authenticated:true,personaId:action.personaId,signedInAt:now.toISOString()};state.personaId=action.personaId;
      state.activity=[{type:'login',target:action.personaId,actorId:action.personaId,at:now.toISOString()},...state.activity].slice(0,12);return state;
    }
    if(action.type==='logout'){
      const actorId=state.session.personaId||state.personaId;
      state.session={authenticated:false,personaId:'',signedInAt:''};state.personaId='';
      state.activity=[{type:'logout',target:actorId,actorId,at:now.toISOString()},...state.activity].slice(0,12);return state;
    }
    if(action.type==='profile-edit'){
      if(!state.session.authenticated||state.session.personaId!==action.personaId||!personIds.includes(action.personaId))return state;
      const edit=action.value&&typeof action.value==='object'?action.value:{};state.profileEdits[action.personaId]={displayName:typeof edit.displayName==='string'?edit.displayName.slice(0,160):'',city:typeof edit.city==='string'?edit.city.slice(0,120):'',bio:typeof edit.bio==='string'?edit.bio.slice(0,2000):'',catchPhrase:typeof edit.catchPhrase==='string'?edit.catchPhrase.slice(0,240):''};
      state.activity=[{type:'profile-edit',target:action.personaId,actorId:action.personaId,at:now.toISOString()},...state.activity].slice(0,12);return state;
    }
    if(action.type==='preferences'){
      const next=normalize({...state,...action.value,version:1},personIds);
      // Preferences belong to this demo visitor, not an authenticated source person.
      next.savedPeople=next.savedPeople.filter(id=>id!==next.personaId);
      next.dismissedPeople=[];
      next.activity=[{type:'preferences',target:'',actorId:state.session.personaId||'',at:now.toISOString()},...state.activity].slice(0,12);
      return next;
    }
    const mappings={'save-person':['savedPeople',true,personIds],'remove-person':['savedPeople',false,personIds],'dismiss-person':['dismissedPeople',true,personIds],'save-group':['savedGroups',true,groups.map(g=>g.id)],'remove-group':['savedGroups',false,groups.map(g=>g.id)]};
    const mapping=mappings[action.type];
    if(!mapping||!mapping[2].includes(action.target)||action.target===state.personaId)return state;
    const [field,add]=mapping;
    if(add===state[field].includes(action.target))return state;
    state[field]=add?[...state[field],action.target]:state[field].filter(id=>id!==action.target);
    state.activity=[{type:action.type,target:action.target,actorId:state.session.personaId||'',at:now.toISOString()},...state.activity].slice(0,12);
    return state;
  }
  function repository(storage,personIds){
    const key='forest-community-v1';let memory=defaults(),persistent=true;
    try{memory=normalize(JSON.parse(storage.getItem(key)||'null'),personIds);}catch{persistent=false;}
    return {
      read:()=>normalize(memory,personIds),
      isPersistent:()=>persistent,
      apply(action){const next=transition(memory,action,personIds);try{storage.setItem(key,JSON.stringify(next));persistent=true;}catch{persistent=false;}memory=next;return this.read();},
      reset(){try{storage.removeItem(key);persistent=true;}catch{persistent=false;}memory=defaults();return this.read();}
    };
  }
  const api={interests,capabilities,groups,normalize,defaults,suggestions,groupSuggestions,upcoming,transition,repository};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CommunityCore=api;
})(globalThis);
