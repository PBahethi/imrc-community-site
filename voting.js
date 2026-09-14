(function(root){
  'use strict';
  const eventId='EVVOTE2027';
  const fallbackRoles={national:['President','Vice President','Treasurer','Secretary'],chapter:['President','Vice President','Treasurer','Secretary']};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function pollsForData(){
    const event=root.IMRCData?.events?.find(e=>e.id===eventId),roles=event?.voting||fallbackRoles;
    return Object.entries(roles).flatMap(([scope,offices])=>offices.map(office=>({id:`${scope}-${office.toLowerCase().replaceAll(' ','-')}`,scope:scope==='national'?'National':'Chapter',title:`${scope==='national'?'National':'Chapter'} ${office} election`,options:['Candidate slate A','Candidate slate B','Abstain'],eventId:event?.id||eventId})));
  }
  function actor(){try{const s=JSON.parse(localStorage.getItem('forest-community-v1')||'{}').session;return s?.authenticated?s.personaId:'';}catch{return '';}}
  function listeningExample(){return `<section class="listening-poll note"><p class="eyebrow">COMMUNITY LISTENING · FROM THE ORIGINAL WELCOME SURVEY</p><h2>What would bring you back?</h2><p>Select the signals your committee should hear before planning the next programme. This example stays in your browser.</p><form id="welcome-listening-poll"><div class="choice-grid">${[['people','Meet people with shared interests'],['events','Discover gatherings and RSVP'],['help','Find or offer practical help'],['family','Keep family and heritage connections'],['groups','Join small local or interest groups']].map(([v,l])=>`<label class="choice"><input type="checkbox" name="likes" value="${v}"><span>${l}</span></label>`).join('')}</div><button class="button secondary" type="submit">Save listening input</button><span id="welcome-listening-status" role="status"></span></form></section>`;}
  function render(){
    const polls=pollsForData(),state=root.VotingCore.read(),id=actor();
    const rows=polls.map(p=>{
      const chosen=state.votes[p.id]?.[id],counts=p.options.map((o,i)=>Object.values(state.votes[p.id]||{}).filter(v=>v===String(i)).length),total=counts.reduce((a,b)=>a+b,0);
      return `<article class="poll-card"><p class="eyebrow">${esc(p.scope)} vote · 28 Feb 2027</p><h2>${esc(p.title)}</h2><p class="demo-context">This ballot is tied to the <a href="#event/${esc(p.eventId)}">IMRC Officer Voting calendar event</a>. A national or chapter committee can use the same component when a decision is needed.</p>${id&&!chosen?`<form data-poll="${p.id}"><fieldset><legend>Choose one</legend>${p.options.map((o,i)=>`<label class="choice"><input type="radio" name="option" value="${i}" required><span>${esc(o)}</span></label>`).join('')}</fieldset><button class="button" type="submit">Cast vote</button></form>`:id?`<p class="vote-confirmation" role="status">Your vote is recorded for “${esc(p.options[Number(chosen)])}”.</p>`:'<p><a href="#login">Sign in</a> to vote in this poll.</p>'}<div class="poll-results" aria-label="Vote results">${p.options.map((o,i)=>`<div><span>${esc(o)}</span><strong>${counts[i]} · ${total?Math.round(counts[i]/total*100):0}%</strong><i style="width:${total?counts[i]/total*100:0}%"></i></div>`).join('')}</div></article>`;
    }).join('');
    document.querySelector('#main').innerHTML=`<p class="eyebrow">DECISIONS TOGETHER</p><h1>Votes & polls</h1><p class="sub">Eight officer ballots connected to the 28 February 2027 calendar event: four national and four chapter roles.</p><div class="poll-grid">${rows}</div>${listeningExample()}`;
    document.querySelectorAll('[data-poll]').forEach(form=>form.onsubmit=e=>{e.preventDefault();const option=new FormData(form).get('option');root.VotingCore.cast(form.dataset.poll,option,actor());render();});
    const welcome=document.querySelector('#welcome-listening-poll');if(welcome)welcome.onsubmit=e=>{e.preventDefault();try{localStorage.setItem('forest-welcome-listening-v1',JSON.stringify([...new FormData(welcome).getAll('likes')]))}catch{}document.querySelector('#welcome-listening-status').textContent='Listening input saved in this browser.';};
  }
  root.Voting={render,polls:pollsForData};
})(globalThis);
