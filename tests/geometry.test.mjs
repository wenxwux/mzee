import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {geometryPaths} from '../public/assets/js/geometry.mjs';
import {knotContours} from '../public/assets/js/knot-contours.mjs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const parse=path=>[...path.matchAll(/(-?\d+\.\d+),(-?\d+\.\d+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
test('initial SVG and apertures exist and agree with JS before scripts load',()=>{
  const outline=html.match(/class="companion-outline"[^>]+d="([^"]+)"/)[1];
  const holes=[...html.matchAll(/class="companion-hole" fill="black" d="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(outline,geometryPaths(0).outer);
  assert.deepEqual(holes,geometryPaths(0).holes);
  assert(html.includes('mask="url(#companion-apertures)"'));
});
test('the interactive element has no visible text, meter, or tooltip',()=>{
  const part=html.slice(html.indexOf('<div class="breathing-companion"'),html.indexOf('<div class="caption"'));
  assert.equal(part.replace(/<[^>]*>/g,'').trim(),'');assert(!part.includes('title='));assert(!part.includes('companion-meter'));
});
test('closed outer silhouette and all seven apertures stay finite and in view',()=>{
 for(let step=0;step<=100;step++)for(const breath of [-1,0,1]){
  const g=geometryPaths(step/100,breath);assert.equal(g.holes.length,7);
  for(const path of [g.outer,...g.holes]){assert(path.endsWith(' Z'));assert(!path.includes('NaN'));for(const p of parse(path))assert(Math.hypot(...p)<68,'Clipped geometry');}
 }
});
test('fully open silhouette and apertures match the reference knot contours',()=>{
 const g=geometryPaths(1);const paths=[...g.holes,g.outer];
 paths.forEach((path,i)=>assert.deepEqual(parse(path),knotContours[i]));
 const min=level=>Math.min(...parse(geometryPaths(level).holes[3]).map(p=>Math.hypot(...p)));
 assert(min(0)<4);assert(min(1)>12);
});
