(function(root){
  'use strict';
  const chapters=[
    {id:'national',name:'IMRC National',country:'United States & Canada',committees:['National Programs','Membership & Chapters','Finance & Governance'],initiatives:['IMRC Convention 2028','National mentorship network','Shared community calendar']},
    {id:'northeast',name:'Northeast Chapter',country:'United States',matches:['Northeast','New England'],committees:['Welcome & Membership','Cultural Programs','Youth'],initiatives:['Spring family gathering','New member welcome']},
    {id:'mideast',name:'Mid-Atlantic Chapter',country:'United States',matches:['Mideast'],committees:['Events','Community Care','Professional Network'],initiatives:['Regional dinner','Volunteer exchange']},
    {id:'midwest',name:'Midwest Chapter',country:'United States',matches:['Midwest'],committees:['Events','Finance','Youth & Families'],initiatives:['Summer picnic','Student support']},
    {id:'southwest',name:'Southwest Chapter',country:'United States',matches:['Southwest'],committees:['Programs','Membership','Community Care'],initiatives:['Dallas gathering','Health initiative']},
    {id:'southeast',name:'Southeast Chapter',country:'United States',matches:['Southeast'],committees:['Events','Outreach','Cultural Programs'],initiatives:['Atlanta meetup','Heritage workshop']},
    {id:'west-coast',name:'West Coast Chapter',country:'United States',matches:['West Coast North','West Coast South'],committees:['Programs','Technology','Membership'],initiatives:['Bay Area gathering','Pacific welcome']},
    {id:'canada-east',name:'Canada East & Central Chapter',country:'Canada',matches:['Canada East & Central'],committees:['Member Care','Events','Youth'],initiatives:['Ontario welcome','Heritage circle']},
    {id:'canada-west',name:'Canada West Chapter',country:'Canada',matches:['Canada West'],committees:['Events','Outreach','Membership'],initiatives:['Prairie gathering','Western welcome']}
  ];
  const cityFallback={'New York, NY':'northeast','Boston, MA':'northeast','Washington, DC':'mideast','Chicago, IL':'midwest','Dallas, TX':'southwest','Houston, TX':'southwest','Atlanta, GA':'southeast','San Francisco, CA':'west-coast','Los Angeles, CA':'west-coast','Toronto, ON, Canada':'canada-east','Montreal, QC, Canada':'canada-east','Vancouver, BC, Canada':'canada-west'};
  function forPerson(person){if(!person)return chapters[0];const city=String(person.city||''),state=city.split(',').slice(-1)[0].trim(),byAddress=cityFallback[city]||(/Canada/i.test(city)?(state==='BC'||state==='AB'||state==='SK'||state==='MB'?'canada-west':'canada-east'):(['TX','AZ','CO','NM'].includes(state)?'southwest':['IL','OH','MI','MN','WI'].includes(state)?'midwest':['NY','MA','CT','RI','NH','VT','ME'].includes(state)?'northeast':['GA','FL','NC','SC','TN','AL'].includes(state)?'southeast':['CA','WA','OR'].includes(state)?'west-coast':state==='DC'||state==='MD'||state==='NJ'?'mideast':''));return chapters.find(c=>c.id===byAddress)||chapters.find(c=>c.matches?.includes(person.chapter))||chapters[0];}
  function decorate(data){const node=document.querySelector('#chapter-context');if(!node)return;let person=null;try{const s=JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session;person=data.people.find(p=>p.id===s.personaId);}catch{}const chapter=forPerson(person);node.innerHTML=`<a href="#chapter/${chapter.id}"><strong>${chapter.name}</strong> · ${person?.city||'National view'}</a>`;}
  root.ChapterCore={chapters,forPerson,decorate};
})(globalThis);
