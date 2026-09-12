const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const data=JSON.parse(fs.readFileSync('site/data.json','utf8'));
function app(){
 const nodes=new Map();
 const node=key=>{if(!nodes.has(key)) nodes.set(key,{innerHTML:'',textContent:'',value:'',focus(){},querySelector(){return null;}});return nodes.get(key);};
 const store=new Map();
 const context=vm.createContext({document:{addEventListener(){},querySelector:node,querySelectorAll:()=>[]},location:{hash:'#home'},window:{scrollTo(){},addEventListener(){}},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},fetch:()=>new Promise(()=>{}),console});
 vm.runInContext(fs.readFileSync('site/app.js','utf8')+'\ndata='+JSON.stringify(data)+';',context);
 return {run:code=>vm.runInContext(code,context),node,store};
}
test('public payload preserves counts and excludes private source fields',()=>{
 assert.equal(data.people.length,44);assert.equal(data.relationships.length,80);assert.equal(data.events.length,8);
 assert.equal(data.events.reduce((n,e)=>n+e.people.length,0),47);
 for(const p of data.people)assert.deepEqual(Object.keys(p).sort(),['id','name','first','clan','origin','city','languages','aliases','type'].sort());
 assert.equal(data.externalPeople.Gautama,'Gautama');
 for(const r of data.relationships){assert.ok(data.people.some(p=>p.id===r.from));assert.ok(data.people.some(p=>p.id===r.to)||data.externalPeople[r.to]);}
});
test('directory handles search, filter, pagination and no matches',()=>{
 const a=app();a.run('people()');assert.match(a.node('#results').innerHTML,/44 people/);assert.match(a.node('#results').innerHTML,/Page 1 of 4/);
 a.node('#next').onclick();assert.match(a.node('#results').innerHTML,/Page 2 of 4/);
 a.node('#search').value='Raghava';a.node('#search').oninput();assert.match(a.node('#results').innerHTML,/Rama Ikshvaku/);
 a.node('#clan').value='Videha';a.node('#clan').onchange();assert.match(a.node('#results').innerHTML,/No people match/);
});
test('routes preserve notes, missing references, scheduled events and escaped text',()=>{
 const a=app();a.run("detail('person','RAM-035')");assert.match(a.node('main').innerHTML,/no profile in workbook/);assert.match(a.node('main').innerHTML,/Tradition-dependent/);
 a.run('events(true)');assert.match(a.node('main').innerHTML,/2027/);assert.match(a.node('#event-results').innerHTML,/January/);
 assert.equal(a.run("esc('<script>')"),'&lt;script&gt;');
 for(const view of ['home','people','connections','groups','events','calendar','about','person/RAM-001','event/EV001','lineage/Videha','invalid']){a.run(`location.hash=${JSON.stringify('#'+view)};route()`);assert.ok(a.node('main').innerHTML.length>50);}
});
test('event bookmark saves and removes without claiming a registration',()=>{
 const a=app();a.run("detail('event','EV001')");a.node('#save-event').onclick();assert.equal(a.store.get('forest-saved'),'["EV001"]');assert.match(a.node('#save-status').textContent,/Saved in this browser/);a.node('#save-event').onclick();assert.equal(a.store.get('forest-saved'),'[]');
});

test('one event per month from January through August 2027 with artwork and valid ICS',()=>{
 assert.equal(new Set(data.events.flatMap(e=>e.dates.map(d=>d.slice(0,7)))).size,8);
 for(const [index,e] of data.events.entries()){
  assert.deepEqual(e.dates.map(d=>d.slice(0,7)),['2027-'+String(index+1).padStart(2,'0')]);
  assert.ok(fs.statSync('site/'+e.image).size>0);
  const ics=fs.readFileSync('site/calendars/'+e.id+'.ics','utf8');
  assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,1);
  assert.equal(new Set([...ics.matchAll(/UID:(.*)/g)].map(x=>x[1])).size,1);
  for(const date of e.dates)assert.ok(ics.includes('DTSTART;VALUE=DATE:'+date.replaceAll('-','')));
  for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
 }
});
test('calendar month and saved filters narrow the agenda',()=>{
 const a=app();a.run('events(true)');a.node('#event-month').value='02';a.node('#event-month').onchange();
 assert.match(a.node('#event-results').innerHTML,/February/);assert.doesNotMatch(a.node('#event-results').innerHTML,/January/);
 a.node('#only-saved').checked=true;a.node('#only-saved').onchange();assert.match(a.node('#event-results').innerHTML,/No matching events/);
 a.store.set('forest-saved','["EV002"]');a.node('#only-saved').onchange();assert.match(a.node('#event-results').innerHTML,/Sita Swayamvara/);assert.doesNotMatch(a.node('#event-results').innerHTML,/Battle of Lanka/);
});
test('help has accessible descriptions and corrupt saved data is tolerated',()=>{
 const a=app();assert.match(a.run("tip('Help','Try a name')"),/aria-describedby="tip-/);assert.match(a.run("tip('Help','Try a name')"),/role="tooltip"/);
 a.store.set('forest-saved','{}');assert.equal(a.run('saved().length'),0);
});
