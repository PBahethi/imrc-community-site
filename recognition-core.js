(function(root){
 'use strict';
 const key='forest-recognition-v1',categories=['Community service','Volunteer work','Cultural contribution','Mentoring','Arts','Graduation','Milestone'];
 const stories=[{id:'welcome-under-tree',memberId:'RAM-001',category:'Community service',title:'Making room under the tree',body:'Imagine Rama welcoming a new family, introducing their neighbours, and helping them find a first gathering. This fictional spotlight celebrates the simple act of making someone feel included.'},{id:'stories-shared',memberId:'RAM-002',category:'Cultural contribution',title:'Keeping stories in conversation',body:'Imagine Sita bringing generations together to share a story and listen to different interpretations. This fictional spotlight celebrates patient listening and cultural connection.'}];
 const clean=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
 const empty=()=>({version:1,nominations:[],thanks:[],activity:[]});
 function normalize(raw,ids){const s=empty();if(!raw||raw.version!==1)return s;const known=id=>ids.includes(id);s.nominations=(Array.isArray(raw.nominations)?raw.nominations:[]).filter(n=>n&&known(n.memberId)&&known(n.authorId)&&categories.includes(n.category)&&clean(n.reason,600)&&Number.isFinite(Date.parse(n.at))).slice(0,100).map(n=>({memberId:n.memberId,authorId:n.authorId,category:n.category,reason:clean(n.reason,600),at:n.at}));s.thanks=(Array.isArray(raw.thanks)?raw.thanks:[]).filter(t=>t&&known(t.actorId)&&stories.some(st=>st.id===t.storyId)).slice(0,200).map(t=>({actorId:t.actorId,storyId:t.storyId}));s.activity=(Array.isArray(raw.activity)?raw.activity:[]).filter(a=>a&&known(a.actorId)&&['nominate','thank'].includes(a.type)&&Number.isFinite(Date.parse(a.at))).slice(0,30).map(a=>({actorId:a.actorId,type:a.type,at:a.at}));return s;}
 function transition(raw,action,actorId,ids,now=new Date()){
  const s=normalize(raw,ids);if(!ids.includes(actorId))return s;
  if(action.type==='nominate'){
   if(!ids.includes(action.memberId)||action.memberId===actorId||!categories.includes(action.category)||!clean(action.reason,600)||s.nominations.length>=100)return s;
   if(s.nominations.some(n=>n.authorId===actorId&&n.memberId===action.memberId&&n.category===action.category))return s;
   s.nominations.unshift({memberId:action.memberId,authorId:actorId,category:action.category,reason:clean(action.reason,600),at:now.toISOString()});
  }else if(action.type==='thank'){
   if(!stories.some(st=>st.id===action.storyId)||s.thanks.some(t=>t.actorId===actorId&&t.storyId===action.storyId)||s.thanks.length>=200)return s;
   s.thanks.push({actorId,storyId:action.storyId});
  }else return s;
  s.activity.unshift({actorId,type:action.type,at:now.toISOString()});s.activity=s.activity.slice(0,30);return s;
 }
 function repository(storage,ids){let memory=empty(),persistent=true;try{memory=normalize(JSON.parse(storage.getItem(key)||'null'),ids);}catch{persistent=false;}
 return {read:()=>normalize(memory,ids),isPersistent:()=>persistent,apply(action,actorId){memory=transition(memory,action,actorId,ids);try{storage.setItem(key,JSON.stringify(memory));persistent=true;}catch{persistent=false;}return this.read();},reset(){memory=empty();try{storage.removeItem(key);persistent=true;}catch{persistent=false;}return this.read();}};}
 const api={key,categories,stories,empty,normalize,transition,repository};root.RecognitionCore=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
