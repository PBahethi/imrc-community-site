const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Obs=require('../observances.js');
const data=require('../observances.json');
const root=path.join(__dirname,'..');
const cats=data.meta.categories.map(c=>c.id);
const isoDate=/^\d{4}-\d{2}-\d{2}$/;

test('every observance has a valid date, category, Hindi name, description, status and https source',()=>{
  const ids=new Set();
  for(const e of data.events){
    assert.ok(!ids.has(e.id),`duplicate id ${e.id}`);ids.add(e.id);
    assert.match(e.start,isoDate,e.id);
    assert.ok(!Number.isNaN(Date.parse(e.start)),e.id);
    if(e.end){assert.match(e.end,isoDate,e.id);assert.ok(e.end>=e.start,e.id);}
    assert.ok(cats.includes(e.category),e.id);
    assert.ok(e.name&&e.hindi&&e.description,e.id);
    assert.match(e.hindi,/[\u0900-\u097F]/,`${e.id} needs Devanagari`);
    assert.ok(['verified','tentative'].includes(e.status),e.id);
    assert.match(e.source,/^https:\/\//,e.id);
  }
});

test('festival, Jain and Rajasthan dates stay inside the published range; US holidays cover 2026–2027',()=>{
  const {start,end}=data.meta.range;
  for(const e of data.events.filter(e=>!['us-holiday'].includes(e.category))){assert.ok(e.start>=start&&(e.end||e.start)<=end,e.id);}
  const us=data.events.filter(e=>e.category==='us-holiday');
  assert.equal(us.filter(e=>e.start.startsWith('2026')).length,11);
  assert.equal(us.filter(e=>e.start.startsWith('2027')).length,12); // includes Dec 31, 2027 (New Year's Day 2028 observed)
  for(const name of ['Gangaur','Holi (Dhulandi)','Diwali · Lakshmi Puja','Karva Chauth','Mahavir Jayanti','Republic Day (India)'])assert.ok(data.events.some(e=>e.name===name),name);
});

test('generated ICS files are in sync with observances.json',()=>{
  const dir=path.join(root,'calendars','observances');
  const all=fs.readFileSync(path.join(dir,'all.ics'),'utf8');
  assert.ok(all.startsWith('BEGIN:VCALENDAR\r\n'));
  const uids=[...all.matchAll(/^UID:(.+)@imrc-community-site\r$/gm)].map(m=>m[1]).sort();
  assert.deepEqual(uids,data.events.map(e=>e.id).sort());
  for(const c of cats){
    const ics=fs.readFileSync(path.join(dir,`${c}.ics`),'utf8');
    assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,data.events.filter(e=>e.category===c).length,c);
  }
  for(const line of all.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75,`unfolded line: ${line.slice(0,40)}`);
});

test('calendar helpers build month grids, multi-day ranges and subscribe links',()=>{
  const weeks=Obs.monthMatrix('2027-04');
  assert.equal(weeks.flat().filter(Boolean).length,30);
  assert.equal(weeks[0].indexOf('2027-04-01'),4); // Thursday
  const navratri=data.events.find(e=>e.id==='sharad-navratri-2027');
  assert.ok(Obs.occursOn(navratri,'2027-10-03'));
  assert.ok(Obs.eventsInMonth([navratri],'2027-10').length===1);
  assert.equal(Obs.monthsBetween('2026-11','2027-12').length,14);
  assert.equal(Obs.defaultMonth(['2026-11','2026-12'],'2026-10-28'),'2026-11');
  const links=Obs.subscribeLinks('https://example.org/site/','jain');
  assert.equal(links.webcal,'webcal://example.org/site/calendars/observances/jain.ics');
  assert.ok(links.google.startsWith('https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2F'));
  assert.equal(Obs.filterEvents(data.events,new Set(['india-holiday'])).length,3);
});
