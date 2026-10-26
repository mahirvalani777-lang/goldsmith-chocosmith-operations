// Production requisitions and numbered goods issues. All operations are browser-local demo transactions.
const qty=v=>Math.round(Number(v)*1000)/1000;
const must=(yes,msg)=>{if(!yes)throw new Error(msg)};
const now=()=>new Date().toISOString();
export function initialiseIssues(s){
  if(!Array.isArray(s.requisitions))s.requisitions=[{id:'MRS-DEMO-001',job:'JC-G-1024-003',entity:'Goldsmith',stage:'Mixing',purpose:'Planned production',reason:'Example initial sugar requirement for the linked job',needed:'2026-10-26',requestedBy:'Production operator',status:'Pending approval',created:'2026-10-26T08:00:00.000Z',lines:[{id:'M1',item:'RM-SUG-01',name:'Sugar M-30',unit:'kg',requested:25,approved:0,issued:0}]}];
  s.gins??=[];s.productionCustody??=[];s.issueLedger??=[];s.issueTokens??=[];s.issueSchema=1;return s;
}
function positive(v){const n=Number(v);must(Number.isFinite(n)&&n>0,'Enter a positive material quantity.');must(Math.abs(n-qty(n))<1e-8,'Use no more than three decimals for this kg demonstration.');return qty(n);}
function actor(s,allowed){must(allowed.includes(s.role),'Switch to '+allowed.join(' or ')+' to perform this action.');}
function eligible(l,date,entity,location,item){return l.entity===entity&&l.location===location&&l.item===item&&l.stage==='Raw material'&&l.qty>0&&!l.hold&&!l.countHold&&!l.recall&&!l.discrepancyHold&&!l.countPaused&&l.quality==='Released'&&(l.expiry?l.expiry>date:l.expiryRequired===false);}
function allocate(s,rows,entity,location,date){
  const used=new Map(),allocations=[];
  for(const row of rows){let remaining=row.quantity;const lots=s.lots.filter(l=>eligible(l,date,entity,location,row.item)).sort((a,b)=>{if(a.expiry&&b.expiry)return a.expiry.localeCompare(b.expiry)||String(a.receivedAt||a.id).localeCompare(String(b.receivedAt||b.id));if(a.expiry)return -1;if(b.expiry)return 1;return String(a.receivedAt||a.id).localeCompare(String(b.receivedAt||b.id));});
    for(const lot of lots){const available=qty(lot.qty-(used.get(lot.id)||0));if(available<=0)continue;const take=qty(Math.min(remaining,available));allocations.push({line:row.line,item:row.item,name:row.name,unit:row.unit,lot:lot.id,expiry:lot.expiry||'',from:location,quantity:take});used.set(lot.id,qty((used.get(lot.id)||0)+take));remaining=qty(remaining-take);if(!remaining)break;}
    must(remaining===0,'Insufficient eligible stock for '+row.item+' at '+location+'. Held, expired or other-entity stock cannot be issued.');
  }return allocations;
}
function nextNumber(s,prefix){let i=s.seq+1;while(s.gins.some(g=>g.id===prefix+i)||s.requisitions.some(r=>r.id===prefix+i))i++;return prefix+i;}
function docStatus(r){return r.lines.every(l=>l.issued===l.approved)?'Fulfilled':r.lines.some(l=>l.issued>0)?'Part issued':'Approved';}
function postGin(s,p,tools){
  actor(s,['Stores operator']);must(p.token&&typeof p.token==='string','A unique posting reference is required.');must(!s.issueTokens.includes(p.token),'This posting reference was already used. No duplicate GIN was posted.');
  const mrs=p.mrs?s.requisitions.find(r=>r.id===p.mrs):null;
  const extra=p.extra?s.requests.find(r=>r.id===p.extra):null;
  must(Boolean(mrs)!==Boolean(extra),'Select one approved MRS or extra-material request.');
  const request=mrs||extra;const job=s.jobs.find(j=>j.id===request.job);must(job&&!job.closed,'Cannot issue against a closed or missing job card.');
  must(mrs?['Approved','Part issued'].includes(mrs.status):['Approved','Part issued'].includes(extra.status),'The material request must be approved and outstanding before GIN posting.');
  const entity=job.entity;const floors={Goldsmith:'G-PROD',Chocosmith:'C-PROD'};must(p.destination===floors[entity],'Choose the production floor belonging to the job entity.');
  const locations=p.locations||[{Location_ID:'G-DRM',Branch_Entity:'Goldsmith Food Products',Store_Type:'Raw Material'},{Location_ID:'G-LRM',Branch_Entity:'Goldsmith Food Products',Store_Type:'Raw Material'},{Location_ID:'C-DRM',Branch_Entity:'Chocosmith Food Products',Store_Type:'Raw Material'},{Location_ID:'C-LRM',Branch_Entity:'Chocosmith Food Products',Store_Type:'Raw Material'}];
  must(locations.some(l=>l.Location_ID===p.location&&l.Branch_Entity===entity+' Food Products'&&l.Store_Type==='Raw Material'),'Source store must be a raw-material store of the job entity.');
  must(p.handedTo?.trim(),'Record the production person receiving the material.');must(p.date&&/^\d{4}-\d{2}-\d{2}$/.test(p.date),'Enter a valid issue date.');
  const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});must(p.date<=today,'A posted issue cannot be future dated.');
  const availableLines=mrs?mrs.lines:[{id:extra.id,item:extra.item,name:extra.item,unit:'kg',approved:extra.qty,issued:extra.issued}];
  must(Array.isArray(p.lines)&&p.lines.length,'Enter at least one issue quantity.');const seen=new Set(),rows=[];
  for(const row of p.lines){must(!seen.has(row.line),'Duplicate request line in the GIN.');seen.add(row.line);const l=availableLines.find(x=>x.id===row.line);must(l,'Issue line does not belong to the request.');const q=positive(row.quantity);must(q<=qty(l.approved-l.issued),'Issue quantity exceeds the remaining approved quantity for '+l.item+'.');rows.push({line:l.id,item:l.item,name:l.name,unit:l.unit,quantity:q});}
  // All lines and all stock are checked before any mutation. The caller commits a cloned state.
  const allocations=allocate(s,rows,entity,p.location,today>p.date?today:p.date);
  const id=nextNumber(s,'GIN-'+p.date.replaceAll('-','')+'-');const ref=mrs?mrs.id:extra.id;
  const gin={id,job:job.id,entity,mrs:mrs?.id||'',extra:extra?.id||'',request:ref,stage:mrs?.stage||job.stage,from:p.location,to:p.destination,date:p.date,handedTo:p.handedTo.trim(),issuedBy:s.role,approvedBy:request.approvedBy||request.approver||'Production manager',status:'Posted',reason:p.remarks?.trim()||'',lines:allocations,created:now(),token:p.token,total:qty(rows.reduce((a,r)=>a+r.quantity,0))};
  for(const a of allocations){const l=s.lots.find(x=>x.id===a.lot);l.qty=qty(l.qty-a.quantity);const c=s.productionCustody.find(c=>c.job===job.id&&c.item===a.item&&c.lot===a.lot&&c.location===p.destination);if(c)c.qty=qty(c.qty+a.quantity);else s.productionCustody.push({job:job.id,item:a.item,name:a.name,lot:a.lot,location:p.destination,entity,qty:a.quantity,unit:a.unit});
    const eventBase={gin:id,request:ref,job:job.id,entity,item:a.item,lot:a.lot,unit:a.unit,date:p.date,actor:s.role};const eventId='IE-'+id+'-'+(s.issueLedger.length+1);s.issueLedger.push({...eventBase,id:eventId+'-OUT',location:p.location,quantity:-a.quantity,kind:'GIN_STORE_OUT'},{...eventBase,id:eventId+'-IN',location:p.destination,quantity:a.quantity,kind:'GIN_PRODUCTION_IN'});}
  for(const row of rows){if(mrs){const l=mrs.lines.find(l=>l.id===row.line);l.issued=qty(l.issued+row.quantity);}else extra.issued=qty(extra.issued+row.quantity);}
  request.status=mrs?docStatus(mrs):extra.issued===extra.qty?'Issued':'Part issued';job.issued=qty(job.issued+gin.total);s.gins.unshift(gin);s.issueTokens.push(p.token);tools.log(s,'GIN posted: stores to production',id,gin.total+' kg · '+job.id+' · '+ref+' · '+p.location+' → '+p.destination);return id;
}
export function issueAction(s,action,p,tools){
  initialiseIssues(s);
  if(action==='initialiseIssues')return;
  if(action==='createMrs'){
    actor(s,['Production operator']);const j=s.jobs.find(j=>j.id===p.job);must(j&&!j.closed,'Select an open job card.');must(p.reason?.trim(),'Record why the materials are required.');must(p.stage?.trim(),'Enter the job stage.');must(['Planned production','Additional material'].includes(p.purpose),'Choose a request purpose.');must(Array.isArray(p.lines)&&p.lines.length&&p.lines.length<=20,'Enter between 1 and 20 material lines.');const seen=new Set();
    const lines=p.lines.map((l,i)=>{const m=p.materials?.find(m=>m.Material_ID===l.item);must(m&&m.Category==='Raw Material'&&m.Status==='Active','Select an active raw material from the master.');must(m.Base_Unit==='KG','This prototype issues kg materials only.');must(!seen.has(l.item),'Use one request line per material.');seen.add(l.item);return{id:'L'+(i+1),item:m.Material_ID,name:m.Material_Name,unit:'kg',requested:positive(l.quantity),approved:0,issued:0};});
    const id=nextNumber(s,'MRS-');s.requisitions.unshift({id,job:j.id,entity:j.entity,stage:p.stage.trim(),purpose:p.purpose,reason:p.reason.trim(),needed:p.needed||'',requestedBy:s.role,created:now(),status:'Pending approval',lines});tools.log(s,'MRS submitted for job',id,j.id+' · '+lines.length+' materials · no stock movement');return id;
  }
  if(action==='reviewMrs'){
    actor(s,['Production manager']);const r=s.requisitions.find(r=>r.id===p.id);must(r&&r.status==='Pending approval','MRS is not pending approval.');must(r.requestedBy!==s.role,'Self-approval is not allowed.');must(s.jobs.some(j=>j.id===r.job&&!j.closed),'The linked job is closed or missing.');must(['Approve','Reject'].includes(p.decision),'Choose approve or reject.');must(p.note?.trim(),'Record the approval or rejection note.');r.status=p.decision==='Approve'?'Approved':'Rejected';r.approvedBy=s.role;r.reviewedAt=now();r.reviewNote=p.note.trim();if(p.decision==='Approve')for(const l of r.lines)l.approved=l.requested;tools.log(s,'MRS '+r.status.toLowerCase(),r.id,p.note.trim()+' · no stock movement');return;
  }
  if(action==='postGin')return postGin(s,p,tools);
  if(action==='issueExtra'){
    const request=s.requests.find(r=>r.id===p.id);must(request,'Additional request not found.');const j=s.jobs.find(j=>j.id===request.job);must(j,'Job not found.');const loc=p.location||s.lots.find(l=>l.entity===j.entity&&l.item===request.item&&l.stage==='Raw material')?.location;
    return postGin(s,{...p,extra:request.id,lines:[{line:request.id,quantity:p.qty}],location:loc,destination:j.entity==='Goldsmith'?'G-PROD':'C-PROD',date:p.date||'2026-10-24',handedTo:p.handedTo||'Production operator · demo',token:p.token||'legacy-extra-'+request.id+'-'+request.issued+'-'+s.seq},tools);
  }
  throw new Error('Unknown production issue action.');
}
