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
  for(const name of ['Jaisalmer','Jodhpur','Udaipur','Jaipur','Peacock'])assert.match(source,new RegExp(name));
  assert.match(html,/theme\.js/);assert.match(html,/chapter\.js/);assert.match(html,/voting\.js/);
});
test('convention airline planner separates native date/time fields and carries OKC suggestions',()=>{
  const event=data.events.find(e=>e.id==='EV2028'),source=fs.readFileSync('event-actions.js','utf8');
  assert.ok(event.airlineOptions.length>=10);
  assert.deepEqual([...new Set(event.airlineOptions.map(o=>o.airline))].sort(),['Alaska Airlines','American Airlines','Delta Air Lines','Frontier Airlines','Southwest Airlines']);
  assert.match(source,/type="date" name="arrivalDate"/);assert.match(source,/type="time" name="arrivalTime"/);assert.match(source,/data-flight-suggestion="arrival"/);assert.match(source,/data-flight-suggestion="departure"/);
});
test('IMRC officer voting calendar event is tied to four national and four chapter offices',()=>{
  const event=data.events.find(e=>e.id==='EVVOTE2015');
  assert.ok(event);
  assert.deepEqual(event.dates,['2015-02-28']);
  assert.deepEqual(event.voting.national,['President','Vice President','Treasurer','Secretary']);
  assert.deepEqual(event.voting.chapter,['President','Vice President','Treasurer','Secretary']);
  assert.match(fs.readFileSync('voting.js','utf8'),/EVVOTE2015/);
  assert.match(fs.readFileSync('calendars/EVVOTE2015.ics','utf8'),/DTSTART;VALUE=DATE:20150228/);
});
