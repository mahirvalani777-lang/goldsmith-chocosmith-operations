import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as core from './core.js';
const source=JSON.parse(readFileSync(new URL('./source-data.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
const elements=new Map();const element=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',style:{},focus(){},setSelectionRange(){},querySelectorAll(){return []}});return elements.get(selector)};
const context=vm.createContext({core,fetch:async()=>({json:async()=>source}),localStorage:{getItem(){return null},setItem(){}},document:{querySelector:element,addEventListener(){},body:{style:{}}},window:{scrollTo(){}},console,setTimeout,clearTimeout,structuredClone,URL,Blob,FormData});
let code=readFileSync(new URL('./app.js',import.meta.url),'utf8').replace(/^\uFEFF/,'').replace("import {ROLES,LIMIT,seed,transact,round} from './core.js';","const {ROLES,LIMIT,seed,transact,round}=core;");
code='(async()=>{'+code+`;let checks=0;for(const target of ['overview','jobs','issues','stock','receiving','waste','quality','finance','trace','approvals','audit','blueprint']){page=target;jobId='';render();if(!document.querySelector('#app').innerHTML.includes('<h1>'))throw Error('Missing heading '+target);checks++;}page='jobs';jobId=state.jobs[0].id;render();checks++;for(const t of ['stock','catalogue','counts']){page='stock';inventoryTab=t;render();checks++;}for(const a of ['output','extra','mrsCreate','waste','quality','hold','paymentApprove','paymentProof','invoice','dispatch','count','receipt','recipe','walkthrough']){const id=['quality','hold'].includes(a)?state.lots[0].id:['paymentApprove','paymentProof','invoice'].includes(a)?'PAY-001':state.jobs[0].id;action(a,id);if(!document.querySelector('#modal-root').innerHTML.includes('role="dialog"'))throw Error('Missing dialog '+a);closeModal();checks++;}return checks;})()`;
const checks=await vm.runInContext(code,context);assert.ok(checks>=28);console.log(JSON.stringify({renderAndDialogChecks:checks,passed:true,visualInspection:'Requires browser'}));

