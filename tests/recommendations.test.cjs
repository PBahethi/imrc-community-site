const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const data=require('../data.json');
const Core=require('../event-actions-core.js');
test('review fixtures demonstrate household, capacity, and guest registration',()=>{
  assert.equal(data.events.find(e=>e.id==='EV2028').capacity,240);
  assert.deepEqual(data.people.filter(p=>p.familyOf==='RAM-001').map(p=>p.id),['RAM-002','RAM-003']);
  const event=data.events.find(e=>e.id==='EV2028'),storage=new Map(),repo=Core.repository({getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},data.people,data.events),actor=data.people[0];
  const state=repo.apply({type:'register',eventId:event.id,attendeeIds:[actor.id],guestNames:['Guest One']},actor);
  assert.deepEqual(state.registrations[0].guestNames,['Guest One']);
});
test('theme source contains every supplied palette and new components are wired',()=>{
  const source=fs.readFileSync('theme.js','utf8'),html=fs.readFileSync('index.html','utf8');
  for(const name of ['IndianFlag','Jaisalmer','Jodhpur','Udaipur','Jaipur','Peacock'])assert.match(source,new RegExp(name));
  assert.match(html,/theme\.js/);assert.match(html,/chapter\.js/);assert.match(html,/voting\.js/);
});
test('chapter pages place the labeled territory map before leadership and use the Indian Flag national theme',()=>{
  const chapter=fs.readFileSync('chapter.js','utf8'),core=fs.readFileSync('chapter-core.js','utf8'),map=fs.readFileSync('chapter-map.js','utf8'),routes=fs.readFileSync('routes-enhancements.js','utf8');
  assert.ok(chapter.indexOf('chapter-inline-map')<chapter.indexOf('Chapter leadership'));
  assert.match(map,/renderInline/);assert.match(core,/theme:'Indian Flag'/);
  assert.match(routes,/signedInChapter/);assert.doesNotMatch(routes,/render\(data,'national'\)/);
});
test('convention airline planner separates native date/time fields and carries OKC suggestions',()=>{
  const event=data.events.find(e=>e.id==='EV2028'),source=fs.readFileSync('event-actions.js','utf8');
  assert.ok(event.airlineOptions.length>=10);
  assert.deepEqual([...new Set(event.airlineOptions.map(o=>o.airline))].sort(),['Alaska Airlines','American Airlines','Delta Air Lines','Frontier Airlines','Southwest Airlines']);
  assert.match(source,/type="date" name="arrivalDate"/);assert.match(source,/type="time" name="arrivalTime"/);assert.match(source,/data-flight-suggestion="arrival"/);assert.match(source,/data-flight-suggestion="departure"/);
});
test('IMRC officer voting calendar event is tied to four national and four chapter offices',()=>{
  const event=data.events.find(e=>e.id==='EVVOTE2027');
  assert.ok(event);
  assert.deepEqual(event.dates,['2027-02-28']);
  assert.equal(event.image,'images/imrc-officer-voting-2027.jpg');
  assert.deepEqual(event.voting.national,['President','Vice President','Treasurer','Secretary']);
  assert.deepEqual(event.voting.chapter,['President','Vice President','Treasurer','Secretary']);
  assert.match(fs.readFileSync('voting.js','utf8'),/EVVOTE2027/);
  assert.match(fs.readFileSync('calendars/EVVOTE2027.ics','utf8'),/DTSTART;VALUE=DATE:20270228/);
});
test('Review v3 themes use stable keys, accessible roles, and persistent preferences',()=>{
  const source=fs.readFileSync('theme.js','utf8'),css=fs.readFileSync('themes.css','utf8'),doc=fs.readFileSync('themes/colorpalette.md','utf8');
  assert.match(source,/option value="\$\{key\}/);
  assert.match(source,/forest-theme-preference-v1/);
  assert.match(source,/actionText:'#ffffff'/);
  assert.match(source,/chapterTheme=\{national:'IndianFlag'/);
  assert.doesNotMatch(css,/!important/);
  for(const role of ['--surface','--ink','--action','--action-text','--quiet','--accent'])assert.match(css,new RegExp(role));
  assert.match(doc,/Jaisalmer/);assert.doesNotMatch(doc,/00ffc6T/);
});
test('guided member journey is a routed, resumable checklist derived from stored actions',()=>{
  const landing=fs.readFileSync('landing-demo.js','utf8'),routes=fs.readFileSync('routes-enhancements.js','utf8'),html=fs.readFileSync('index.html','utf8'),engagement=fs.readFileSync('engagement.js','utf8');
  assert.match(landing,/renderJourney/);assert.match(landing,/forest-demo-journey-v1/);
  assert.match(landing,/forest-event-actions-v1/);assert.match(landing,/agendaIds/);
  assert.match(landing,/data-journey-next/);assert.match(routes,/view==='journey'/);
  assert.match(html,/href="#start"/);assert.match(html,/IMRC Convention 2028/);
  assert.match(engagement,/forest-demo-journey-v1/);assert.match(engagement,/forest-theme-preference-v1/);
});
test('journey mode preselects Rama and carries coach marks through login, event, profile, and voting',()=>{
  const landing=fs.readFileSync('landing-demo.js','utf8'),routes=fs.readFileSync('routes-enhancements.js','utf8'),engagement=fs.readFileSync('engagement.js','utf8'),css=fs.readFileSync('landing.css','utf8');
  assert.match(landing,/tryHref:'#login\/journey'/);
  assert.match(landing,/index===0&&current===0\?step\.tryHref/);
  assert.match(engagement,/guided\?'RAM-001'/);assert.match(engagement,/#home\/journey/);
  assert.match(routes,/journey-event-banner/);assert.match(routes,/#event\/EV2028\/journey/);
  assert.match(routes,/#profile\/journey/);assert.match(routes,/#votes\/journey/);
  assert.match(routes,/Build Rama’s personal agenda/);assert.match(css,/journey-coach-popover/);
});
test('chapter maps use state and province geometry instead of overlapping rectangles',()=>{
  const source=fs.readFileSync('chapter-map.js','utf8'),core=fs.readFileSync('chapter-core.js','utf8'),us=JSON.parse(fs.readFileSync('chapter-boundaries-us.geojson')),canada=JSON.parse(fs.readFileSync('chapter-boundaries-canada.geojson'));
  assert.match(source,/L\.geoJSON/);assert.match(source,/chapter-boundaries-us\.geojson/);assert.match(source,/chapter-boundaries-canada\.geojson/);
  assert.doesNotMatch(source,/const regions=/);assert.match(source,/Retry map/);
  assert.ok(us.features.length>=51);assert.equal(canada.features.length,13);
  assert.match(core,/states:\['CT'/);assert.match(core,/provinces:\['ON'/);
});
test('agenda choices stay in place and receive an inline saved pill',()=>{
  const source=fs.readFileSync('event-actions.js','utf8');
  assert.doesNotMatch(source,/scrollIntoView/);
  assert.match(source,/agenda-save-pill/);assert.match(source,/bottom:8px/);
});
