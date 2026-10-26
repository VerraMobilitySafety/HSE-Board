/* Shared by the public TV board and VERO's embedded board. No session tokens. */
const LIVE_BOARD_API='https://verra-ims-api-dev-eegmeab6c5haetdv.westus3-01.azurewebsites.net/api/consultation/public/';
let publishedBoardRecords=[],boardBaseline=null,boardPollBusy=false,boardRefreshPending=false,lastBoardFingerprint='';
const boardResourceTypes={eap:'Employee Assistance Program',emergency:'Emergency Assistance',map:'Emergency Evacuation Map',injury:'If You Are Injured',report:'Report an Event',ims:'IMS Policy'};
function publicBoardItem(kind){return publishedBoardRecords.find(r=>r.kind===kind&&r.site_key===siteKey)||publishedBoardRecords.find(r=>r.kind===kind);}
function boardText(tag,value){const n=document.createElement(tag);n.textContent=value||'';return n;}
function renderPublishedRecords(records,title){
 document.getElementById('panelTitle').textContent=title;document.getElementById('panelIntro').textContent='Published information for '+site.name;
 const body=document.getElementById('panelBody');body.replaceChildren();
 if(!records.length)body.append(boardText('p','No current published information is available for this section.'));
 for(const r of records){const card=document.createElement('section');card.className='content-box';card.append(boardText('h3',r.title),boardText('p',r.public_summary));
  const meta='Posted '+new Date(r.posted_at).toLocaleDateString('en-AU')+' · Remove '+r.expires_on+' · Contact: '+r.contact;card.append(boardText('small',meta));
  if(r.link){const a=boardText('a','View Information ↗');a.className='open-link';a.href=r.link;a.target='_blank';a.rel='noopener noreferrer';card.append(document.createElement('br'),a);}body.append(card);
 }
 document.getElementById('overlay').classList.add('active');resetInactivity();
}
function mountBoardConsultation(){
 const tiles=document.querySelector('.tiles');if(!tiles||tiles.dataset.consultation)return;tiles.dataset.consultation='true';
 const committee=document.querySelector('[aria-label="IMS Committee QR code"]');if(committee){const button=document.createElement('button');button.type='button';button.className=committee.className;button.dataset.content='minutes';button.innerHTML=committee.innerHTML;button.setAttribute('aria-label','IMS Committee');committee.replaceWith(button);}
 const report=document.querySelector('[aria-label="Report an Event QR code"]');if(report){const button=document.createElement('button');button.type='button';button.className=report.className;button.dataset.content='report';button.innerHTML=report.innerHTML;report.replaceWith(button);}
 const policy=boardText('button','View IMS Policy');policy.type='button';policy.className='board-policy-link';policy.onclick=()=>{const rows=publishedBoardRecords.filter(r=>r.kind==='resource'&&r.display?.resource_type==='IMS Policy');if(rows.length)renderPublishedRecords(rows,'IMS Policy');else openSitePolicy();};document.querySelector('.hero-top')?.append(policy);
 for(const [key,title,icon,copy]of [['toolbox','Team & Toolbox Meetings','☷','Meeting updates, topics and agreed actions.'],['shares','HSEQ Shares','◈','Hazard alerts, lessons learnt and information shares.'],['feedback','Consultation & Feedback','☏','Consultation outcomes and how to raise an issue.']]){
  const button=document.createElement('button');button.type='button';button.className='tile consultation-tile';button.dataset.content=key;const head=document.createElement('div');head.className='tile-head';const symbol=boardText('span',icon);symbol.className='icon';head.append(symbol,boardText('h3',title));button.append(head,boardText('p',copy));tiles.append(button);
 }
 document.querySelector('.tiles').addEventListener('click',e=>{
  const tile=e.target.closest('[data-content]');if(!tile||!site)return;const key=tile.dataset.content;
  const mapping={minutes:['committee'],hsr:['hsr','election'],toolbox:['toolbox'],shares:['share'],feedback:['consultation']};
  const kinds=mapping[key];const resource=boardResourceTypes[key];const records=kinds?publishedBoardRecords.filter(r=>kinds.includes(r.kind)):resource?publishedBoardRecords.filter(r=>r.kind==='resource'&&r.display?.resource_type===resource):[];
  if(records.length||['toolbox','shares','feedback'].includes(key)){e.preventDefault();e.stopImmediatePropagation();renderPublishedRecords(records,tile.querySelector('h3')?.textContent||'Site Information');}
  else if(key==='hsr'&&(!Array.isArray(site.hsrs)||site.hsrs.every(h=>h.name==='HSR Name'))){e.preventDefault();e.stopImmediatePropagation();renderPublishedRecords([],'Your Health and Safety Representatives');}
 },true);
 document.querySelector('.header-policy-button')?.addEventListener('click',e=>{const records=publishedBoardRecords.filter(r=>r.kind==='resource'&&r.display?.resource_type==='IMS Policy');if(records.length){e.stopImmediatePropagation();renderPublishedRecords(records,'IMS Policy');}},true);
 const footer=document.querySelector('.screen footer');const status=boardText('span','Connecting to live updates…');status.id='liveBoardStatus';footer?.append(status);
}
async function refreshPublicBoard(){
 if(boardPollBusy){boardRefreshPending=true;return;}boardPollBusy=true;
 try{
  const response=await fetch(LIVE_BOARD_API+encodeURIComponent(siteKey),{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Live board unavailable');const data=await response.json();
  if(!boardBaseline)boardBaseline={site:structuredClone(site),global:structuredClone(globalContent)};
  const fingerprint=JSON.stringify(data);if(fingerprint!==lastBoardFingerprint){
  lastBoardFingerprint=fingerprint;
  site=structuredClone(boardBaseline.site);globalContent=structuredClone(boardBaseline.global);site.name=data.site.name;publishedBoardRecords=data.records;
  const focus=publicBoardItem('focus');if(focus){site.focus=focus.display.message||focus.public_summary;globalContent.currentFocus={type:focus.display.image_url?'image':'text',src:focus.display.image_url||'',title:focus.title,text:focus.public_summary,action:focus.display.action};}
  document.querySelector('.screen').classList.toggle('has-live-focus',!!focus);
  const performance=publicBoardItem('performance');if(performance){for(const key of ['tifr','hazards']){globalContent[key]={lastMonth:Number(performance.display[key]),target:Number(performance.display[key+'_target']),history:[]};}}
  applySite();document.getElementById('emergencyTile')?.setAttribute('data-content','emergency');
  const scope=performance?(performance.site_key==='all'?'All Sites':'This Site')+' · '+performance.display.period:'All Sites · '+(globalContent.tifr.history?.at(-1)?.month||'Reporting Period');
  for(const selector of ['.tifr-view','.hazards-view']){const n=document.querySelector(selector);if(n)n.textContent=scope;}
  }
  document.getElementById('liveBoardStatus').textContent='Live Updates · '+new Date().toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'});
  parent.postMessage({type:'hse-board-ready',site:siteKey,fresh:true},'*');
 }catch(e){document.getElementById('liveBoardStatus').textContent='Live Updates Unavailable · Retrying';parent.postMessage({type:'hse-board-ready',site:siteKey,fresh:false},'*');
  // An expired notice must disappear even when the connection is interrupted.
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const previous=publishedBoardRecords.length;publishedBoardRecords=publishedBoardRecords.filter(r=>!r.expires_on||r.expires_on>=today);
  if(previous!==publishedBoardRecords.length){lastBoardFingerprint='';if(boardBaseline){site=structuredClone(boardBaseline.site);globalContent=structuredClone(boardBaseline.global);const focus=publicBoardItem('focus');if(focus){site.focus=focus.display.message||focus.public_summary;globalContent.currentFocus={type:focus.display.image_url?'image':'text',src:focus.display.image_url||'',title:focus.title,text:focus.public_summary,action:focus.display.action};}document.querySelector('.screen').classList.toggle('has-live-focus',!!focus);applySite();}document.getElementById('overlay').classList.remove('active');}
 }finally{boardPollBusy=false;if(boardRefreshPending){boardRefreshPending=false;refreshPublicBoard();}}
}
window.addEventListener('message',event=>{if(event.source!==parent||event.origin!=='https://agreeable-bush-0f38b9c10.5.azurestaticapps.net')return;if(event.data?.type==='vero-board-refresh')refreshPublicBoard();});
setInterval(()=>{if(typeof site!=='undefined'&&site)refreshPublicBoard();},30000);
