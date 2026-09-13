/* Browser-local fictional members. One write saves a household and its relationships. */
(function(root){
  'use strict';
  const key='forest-new-members-v1';
  const tiers=['Bronze','Silver','Gold','Platinum'];
  const relations=['SPOUSE','CHILD','PARENT','SIBLING'];
  const fixtures=[
    {address:'1600 Pennsylvania Avenue NW',city:'Washington, DC',zip:'20500',area:'202'},
    {address:'1 Microsoft Way',city:'Redmond, WA',zip:'98052',area:'425'},
    {address:'1 Infinite Loop',city:'Cupertino, CA',zip:'95014',area:'408'},
    {address:'350 Fifth Avenue',city:'New York, NY',zip:'10118',area:'212'}
  ];
  const text=(v,max=160)=>typeof v==='string'?v.trim().slice(0,max):'';
  function read(storage){try{const rows=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(rows)?rows.filter(p=>p&&/^NEW-[\w-]+$/.test(p.id)&&typeof p.name==='string').map(p=>({...p,membership:tiers.includes(p.membership)?p.membership:'Bronze'})):[];}catch{return [];}}
  function phone(zip){return `(${fixtures.find(f=>f.zip===zip)?.area||'202'}) 555-0100`;}
  function validPhone(value){return /^\([2-9]\d{2}\) 555-01\d{2}$/.test(value);}
  function build(values,parent,id){
    const name=text(values.name,120);if(!name)throw Error('Enter a member name.');
    const base=parent||{};
    const member={id,name,first:name.split(/\s+/)[0],clan:text(values.clan)||base.clan||'New community member',origin:text(values.origin)||base.origin||'Shared community',city:text(values.city)||base.city||'Not specified',languages:text(values.languages)||base.languages||'Not specified',aliases:'',type:'Demo member',headshot:'',headshotAlt:'Initials shown',headshotSource:'',headshotLicense:'',catchPhrase:text(values.catchPhrase,240)||'There is room for one more connection.',membership:tiers.includes(values.membership)?values.membership:'Bronze',address:text(values.address)||base.address||'',postalCode:text(values.postalCode,5)||base.postalCode||'',phone:text(values.phone)||phone(values.postalCode)};
    if(member.postalCode&&!/^\d{5}$/.test(member.postalCode))throw Error('Use a five-digit US ZIP code.');
    if(!validPhone(member.phone))throw Error('Use an example number such as (202) 555-0100 through (202) 555-0199.');
    if(parent){if(!relations.includes(values.relationship))throw Error('Choose a family relationship.');member.familyOf=parent.id;member.familyRelationship=values.relationship;}
    return member;
  }
  function save(storage,values,parent,family){
    const rows=read(storage),id='NEW-'+(root.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const member=build(values,parent,id),created=[member];
    if(family)created.push(build({...values,...family},member,id+'-F'));
    storage.setItem(key,JSON.stringify([...rows,...created]));return created;
  }
  function merge(data,storage){
    data.people=data.people.filter(p=>!p.id.startsWith('NEW-'));
    data.relationships=data.relationships.filter(r=>!r.localDemo);
    const added=read(storage);data.people.push(...added);
    added.filter(p=>p.familyOf&&data.people.some(other=>other.id===p.familyOf)).forEach(p=>data.relationships.push({from:p.id,to:p.familyOf,type:p.familyRelationship,note:'Family relationship created in this browser.',localDemo:true}));return data;
  }
  const api={key,tiers,relations,fixtures,read,phone,validPhone,build,save,merge};
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.MemberStore=api;
})(globalThis);
