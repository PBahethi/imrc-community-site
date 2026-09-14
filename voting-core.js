(function(root){
  'use strict';
  const key='forest-votes-v1';
  function read(){try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&v.version===1?v:{version:1,votes:{}};}catch{return {version:1,votes:{}};}}
  function cast(pollId,optionId,actorId){const s=read();s.votes[pollId] ||= {};if(!s.votes[pollId][actorId])s.votes[pollId][actorId]=optionId;try{localStorage.setItem(key,JSON.stringify(s));}catch{}return s;}
  root.VotingCore={key,read,cast};
})(globalThis);
