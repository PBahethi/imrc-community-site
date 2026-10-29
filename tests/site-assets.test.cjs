const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const photos=require('../marwar-photos.json').photos;
const allowed=['CC0','Public domain','CC BY 2.0','CC BY 3.0','CC BY 4.0','CC BY-SA 2.0','CC BY-SA 3.0','CC BY-SA 4.0'];

test('every Marwar photo is a local WebP with alt text, author, licence and a Commons source',()=>{
  for(const p of photos){
    for(const f of [p.src,p.srcLarge])assert.ok(fs.existsSync(path.join(root,f)),f);
    assert.match(p.src,/\.webp$/);
    assert.ok(p.alt.length>20,p.id);assert.ok(p.author,p.id);
    assert.ok(allowed.includes(p.license),`${p.id}: ${p.license}`);
    assert.match(p.licenseUrl,/^https:\/\/creativecommons\.org\//);
    assert.match(p.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(fs.statSync(path.join(root,p.src)).size<200_000,`${p.src} should stay small`);
  }
});

test('no uncredited image ships in images/marwar',()=>{
  const credited=new Set(photos.flatMap(p=>[p.src,p.srcLarge].map(f=>path.basename(f))));
  for(const f of fs.readdirSync(path.join(root,'images','marwar')))assert.ok(credited.has(f),`uncredited ${f}`);
});

test('index.html loads every script inside the document and links the new pages',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(html.trimEnd().endsWith('</html>'),'nothing may follow </html>');
  for(const s of ['culture.js','observances.js','routes-enhancements.js'])assert.ok(html.includes(`src="./${s}"`),s);
  for(const h of ['#observances','#culture','#credits'])assert.ok(html.includes(`href="${h}"`),h);
});
