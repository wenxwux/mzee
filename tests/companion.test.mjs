import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {geometryPaths} from '../public/assets/js/geometry.mjs';
const source=readFileSync(new URL('../public/assets/js/companion.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'');
function setup({reduced=false,noAnimationAPI=false}={}){
  let now=0,id=0,clock=0;const frames=new Map(),events={};
  const node=()=>({style:{},attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,f){this[k]=f;},getBoundingClientRect(){return {left:100,top:100,width:100,height:100};}});
  const outline=node(),holes=Array.from({length:7},node);outline.attrs.d=geometryPaths().outer;
  const page={classList:{contains:()=>false}};
  const touch=node(),shape=node();shape.querySelector=()=>outline;
  const photo=noAnimationAPI?{}:{getAnimations:()=>[{animationName:'rotate',currentTime:clock}]};
  const document={hidden:false,getElementById:id=>id==='page'?page:id==='companion-touch'?touch:shape,querySelector:()=>photo,querySelectorAll:()=>holes,addEventListener:(name,fn)=>events[name]=fn};
  vm.runInNewContext(source,{document,window:{addEventListener(){}},geometryPaths,matchMedia:()=>({matches:reduced}),performance:{now:()=>now},requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)});
  return {document,events,outline:()=>outline.attrs.d,aperture:()=>holes[3].attrs.d,angle:()=>Number(shape.attrs.transform.match(/[-\d.]+/)[0]),click:()=>touch.click(),snapshot:()=>JSON.stringify([outline,...holes].map(n=>n.attrs)),color:()=>shape.style.fill,frames:()=>frames.size,advance(ms,pause=false){for(let i=0;i<ms;i+=20){now+=20;if(!pause)clock+=20;const fs=[...frames.values()];frames.clear();fs.forEach(fn=>fn(now));}}};
}
test('clicks open the shape, inactivity closes it, pause freezes breathing',()=>{
 const s=setup();s.advance(400);const initial=s.snapshot();s.advance(400);assert.notEqual(s.snapshot(),initial);
 for(let i=0;i<4;i++)s.click();s.advance(300);s.click();s.advance(400);assert.equal(s.color(),'rgb(172,230,192)');
 s.advance(2500);assert.equal(s.color(),'rgb(228,151,124)');
 // Allow the pending 30fps draw to sample the newly paused animation clock.
 s.advance(80,true);const paused=s.snapshot();s.advance(400,true);assert.equal(s.snapshot(),paused);
});
test('only nearby motion charges the shape and a parked pointer releases it',()=>{
 const s=setup();for(let i=0;i<30;i++)s.events.pointermove({clientX:900+i,clientY:900,pointerId:1});s.advance(500);assert.equal(s.color(),'rgb(228,151,124)');
 for(let i=0;i<40;i++)s.events.pointermove({clientX:150+i%2*20,clientY:150,pointerId:1});s.advance(500);assert.notEqual(s.color(),'rgb(228,151,124)');s.advance(2500);assert.equal(s.color(),'rgb(228,151,124)');
});
test('hidden tabs stop the loop and recover according to elapsed time',()=>{
 const s=setup();s.click();s.advance(500);s.document.hidden=true;s.events.visibilitychange();assert.equal(s.frames(),0);s.advance(10000);s.document.hidden=false;s.events.visibilitychange();s.advance(1200);assert.equal(s.color(),'rgb(228,151,124)');
});
test('reduced motion and unavailable optional browser APIs preserve the symbol',()=>{
 const s=setup({reduced:true,noAnimationAPI:true});const initial=s.snapshot();s.advance(1000);assert.equal(s.snapshot(),initial);s.click();s.advance(100);assert.notEqual(s.color(),'rgb(228,151,124)');
});
test('without interaction the solid silhouette visibly breathes, including without a portrait animation API',()=>{
 const radius=path=>{const [x,y]=path.match(/-?\d+\.\d+/g).slice(0,2).map(Number);return Math.hypot(x,y);};
 for(const noAnimationAPI of [false,true]){
  const s=setup({noAnimationAPI});
  s.advance(1500);const inhale=radius(s.outline());assert.equal(radius(s.aperture()),0);
  s.advance(3000);const exhale=radius(s.outline());assert.equal(radius(s.aperture()),0);
  assert(inhale/exhale>1.20&&inhale/exhale<1.24,'The silhouette should expand and contract by about ten percent');
  assert.equal(s.color(),'rgb(228,151,124)','Breathing must not count as interaction');
 }
});
test('the asymmetric symbol does not jump when the portrait completes a turn',()=>{
 const s=setup();s.advance(35920);const before=s.angle();s.advance(160);const after=s.angle();
 assert(after>before&&after-before<1,'Rotation must remain continuous across the portrait turn');
});
