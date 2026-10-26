import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seed,transact,LIMIT} from './core.js';
const source=JSON.parse(readFileSync(new URL('./source-data.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
let checks=0;const fresh=()=>seed(source);const ok=(f)=>{f();checks++};
let s=fresh();
ok(()=>assert.equal(s.sourceSummary.materials,36));
ok(()=>assert.throws(()=>transact(s,'output',{job:s.jobs[0].id,qty:100,stage:'Finished',expiry:'2027-04-24'}),/Production operator/));
s.role='Production operator';const id=transact(s,'output',{job:s.jobs[0].id,qty:100,stage:'Finished',expiry:'2027-04-24'});
ok(()=>assert.equal(s.jobs[0].output,700));
ok(()=>assert.equal(s.lots.find(l=>l.id===id).hold,true));
s.role='Quality';ok(()=>assert.throws(()=>transact(s,'quality',{id,decision:'Release',checklist:'Passed',evidence:'DEMO-QC'}),/Production manager must/));
s.role='Production manager';transact(s,'verifyOutput',{id});s.role='Quality';transact(s,'quality',{id,decision:'Release',checklist:'Passed',evidence:'DEMO-QC'});
s.role='Stores operator';transact(s,'dispatch',{lot:id,qty:20,customer:'Example customer'});ok(()=>assert.equal(s.lots.find(l=>l.id===id).qty,80));
s.role='Quality';transact(s,'hold',{id,reason:'Example investigation'});s.role='Stores operator';ok(()=>assert.throws(()=>transact(s,'dispatch',{lot:id,qty:1,customer:'Example'}),/held/));
ok(()=>assert.ok(s.dispatches.find(d=>d.batch===id).incident));ok(()=>assert.ok(s.notifications.some(x=>x.to.includes('Director'))));
s.role='Quality';ok(()=>assert.throws(()=>transact(s,'quality',{id:'SMP-2409-A',decision:'Release',checklist:'Passed',evidence:'Example'}),/Expired/));
s=fresh();s.role='Accounts manager';ok(()=>assert.throws(()=>transact(s,'paymentApprove',{id:'PAY-002'}),/Director/));
s.payments[1].amount=LIMIT;transact(s,'paymentApprove',{id:'PAY-002'});ok(()=>assert.equal(s.payments[1].status,'Approved'));
s=fresh();s.role='Director';transact(s,'paymentApprove',{id:'PAY-002'});ok(()=>assert.equal(s.payments[1].approvedBy,'Director'));
s=fresh();s.role='Accounts manager';ok(()=>assert.throws(()=>transact(s,'paymentVerify',{id:'PAY-001'}),/Bank proof/));
s.payments[0].by='Accounts manager';ok(()=>assert.throws(()=>transact(s,'paymentApprove',{id:'PAY-001'}),/Self-approval/));s.payments[0].by='Accounts operator';transact(s,'paymentApprove',{id:'PAY-001'});transact(s,'paymentExecute',{id:'PAY-001'});s.role='Accounts operator';transact(s,'paymentProof',{id:'PAY-001',ref:'DEMO-UTR',evidence:'DEMO-PROOF'});s.role='Accounts manager';transact(s,'paymentVerify',{id:'PAY-001'});ok(()=>assert.equal(s.payments[0].status,'Completed'));ok(()=>assert.throws(()=>transact(s,'paymentVerify',{id:'PAY-001'}),/Bank proof/));
s=fresh();s.role='Production operator';const waste=transact(s,'waste',{job:s.jobs[0].id,qty:5,reason:'Example clean-down'});s.role='Stores operator';transact(s,'receiveWaste',{id:waste,qty:4.8});ok(()=>assert.equal(s.waste.at(-1).state,'Receipt discrepancy'));ok(()=>assert.equal(s.waste.at(-1).remaining,4.8));ok(()=>assert.throws(()=>transact(s,'receiveWaste',{id:waste,qty:4.8}),/already received/));
s=fresh();s.role='Production manager';transact(s,'approveRequest',{id:'EXTRA-001'});s.role='Stores operator';transact(s,'issueExtra',{id:'EXTRA-001',qty:3});ok(()=>assert.equal(s.requests[0].issued,3));ok(()=>assert.throws(()=>transact(s,'issueExtra',{id:'EXTRA-001',qty:3}),/remaining approv/));
s=fresh();s.role='Stores operator';transact(s,'count',{lot:'G-DC-2210-A',qty:250});ok(()=>assert.equal(s.lots.find(l=>l.id==='G-DC-2210-A').qty,260));ok(()=>assert.throws(()=>transact(s,'dispatch',{lot:'G-DC-2210-A',qty:1,customer:'Example'}),/held/));
s=fresh();s.role='Stores operator';transact(s,'receipt',{qty:110,ordered:100,supplier:'Example',po:'PO-DEMO',item:'RM-SUG-01',master:source.Material_Master[0],entity:'Goldsmith',expiry:'2027-10-24'});s.role='Quality';ok(()=>assert.throws(()=>transact(s,'quality',{id:s.lots.at(-1).id,decision:'Release',checklist:'Passed',evidence:'DEMO-QC'}),/Receipt exception/));
console.log(JSON.stringify({checks,passed:checks,sourceMaterials:source.Material_Master.length,scenario:'Role, quantity, hold, threshold, payment evidence and receipt controls'}));


