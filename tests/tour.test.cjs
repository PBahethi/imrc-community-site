const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Core=require('../tour-core.js');
const data=require('../data.json');
const steps=require('../tour-steps.json');

test('board tour keeps the scripted twelve-stop order and bounded navigation',()=>{
  assert.equal(steps.length,12);
  assert.deepEqual(steps.map(step=>step.id),['welcome','chapter','login','dashboard','suggestions','directory','registration','convention','checkin','votes','contribute','end']);
  assert.equal(Core.next(steps,11).id,'end');
  assert.equal(Core.previous(steps,0).id,'welcome');
  assert.equal(Core.indexFor(steps,'missing'),0);
});

test('every board tour route is registered and each spotlight rule is safe',()=>{
  assert.deepEqual(Core.validateRoutes(steps),[]);
  assert.equal(Core.targetFor(steps[0]),'');
  assert.equal(Core.targetFor(null),'');
  for(const step of steps)assert.doesNotThrow(()=>Core.targetFor(step));
});

test('seed plan uses only existing browser-local stores and real fixture ids',()=>{
  const plan=Core.seedPlan(data,new Date('2026-09-14T15:00:00Z'));
  assert.equal(Core.validateSeedPlan(plan),true);
  assert.ok(plan.every(entry=>Core.allowedSeedKeys.includes(entry.key)));
  const eventState=plan.find(entry=>entry.key==='forest-event-actions-v1').value;
  assert.equal(eventState.registrations[0].actorId,'RAM-001');
  assert.deepEqual(eventState.conventionPlans[0].agendaIds,['sat-yoga','sat-rays']);
});

test('tour copy is escaped and corrupted or unavailable storage does not throw',()=>{
  assert.equal(Core.escapeHtml('<script>"x" & y</script>'),'&lt;script&gt;&quot;x&quot; &amp; y&lt;/script&gt;');
  const corrupt={getItem(){return '{';},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}};
  const repo=Core.repository(corrupt);
  assert.doesNotThrow(()=>repo.read());
  assert.doesNotThrow(()=>repo.save({active:true}));
  assert.doesNotThrow(()=>repo.reset());
});

test('Reset demo clears tour state and missing targets use the centered fallback',()=>{
  const engagement=fs.readFileSync('engagement.js','utf8'),tour=fs.readFileSync('tour.js','utf8');
  assert.match(engagement,/forest-board-tour-v1/);
  assert.match(tour,/if\(!target\)\{layer\.classList\.add\('board-tour-centered'\)/);
  assert.match(tour,/stateRepo\(\)\.reset\(\)/);
});

test('tour integration loads modules and exposes a landing-page entry',()=>{
  const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('app.js','utf8'),tour=fs.readFileSync('tour.js','utf8');
  for(const asset of ['tour.css','tour-core.js','tour.js'])assert.match(html,new RegExp(asset.replace('.','\\.')));
  assert.match(app,/view==='tour'/);
  assert.match(tour,/Take the five-minute board tour/);
  assert.match(tour,/role=\"dialog\"/);
  assert.match(tour,/aria-modal=\"true\"/);
});
