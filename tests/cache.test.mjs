import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../public/'+name,import.meta.url),'utf8');
test('HTML and the complete geometry module chain bypass legacy unversioned cache',()=>{
 const html=read('index.html');
 const urls=[...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css)(?:\?[^"]+)?)"/g)].map(m=>m[1]);
 for(const file of ['assets/js/companion.js','assets/js/geometry.mjs'])urls.push(...[...read(file).matchAll(/from '([^']+)'/g)].map(m=>m[1]));
 assert.equal(urls.length,5);
 const versions=urls.map(url=>new URL(url,'https://example.com').searchParams.get('v'));
 assert(versions.every(Boolean),'An unversioned resource can reuse incompatible old cache');
 assert.equal(new Set(versions).size,1,'Mixed release versions');
 assert.match(read('_headers'),/\/\*\s+Cache-Control: no-cache/);
});
