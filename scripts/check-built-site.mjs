import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parse } from 'parse5';
import assert from 'node:assert/strict';

const root=resolve('dist');
const files=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]);
const walk=(node,callback)=>{callback(node);for(const child of node.childNodes??[])walk(child,callback);};
const retired=/courtier-pret-immobilier-(reze|vertou|bouguenais|les-sorinieres|la-haye-fouassiere)/;
let checkedLinks=0;
for(const file of files(root).filter(p=>p.endsWith('.html'))){
  const html=readFileSync(file,'utf8');
  const tree=parse(html);
  const ids=new Set();
  let h1=0;
  walk(tree,node=>{
    const attrs=Object.fromEntries((node.attrs??[]).map(a=>[a.name,a.value]));
    if(node.tagName==='h1')h1++;
    if(attrs.id){assert.ok(!ids.has(attrs.id),`Duplicate ID ${attrs.id}: ${file}`);ids.add(attrs.id);}
    assert.ok(!attrs.style,`Inline CSS: ${file}`);
    if(node.tagName==='a'&&attrs.href?.startsWith('/')){
      assert.ok(!retired.test(attrs.href),attrs.href);
      const url=new URL(attrs.href,'https://321courtierimmobilier.fr');
      const target=join(root,decodeURIComponent(url.pathname),url.pathname.endsWith('/')?'index.html':'');
      assert.ok(existsSync(target),`Broken internal link ${attrs.href}: ${file}`);
      checkedLinks++;
    }
  });
  assert.equal(h1,1,`H1 count: ${file}`);
}
const sitemap=readFileSync(join(root,'sitemap-0.xml'),'utf8');
for(const city of ['nantes','rennes','reims'])assert.ok(sitemap.includes(`/courtier-pret-immobilier-${city}/`));
assert.ok(!retired.test(sitemap));
const counts={nantes:9,rennes:8,reims:10};
for(const [city,count] of Object.entries(counts)){
  const html=readFileSync(join(root,`courtier-pret-immobilier-${city}/index.html`),'utf8');
  assert.equal((html.match(/data-courtier/g)??[]).length,count);
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema.mainEntity.numberOfItems,count);
  assert.ok(!html.includes('aggregateRating'));
}
console.log(`Built site passed: ${checkedLinks} internal links, 3 city pages, correct sitemap, unique IDs, one H1 per page, no inline CSS.`);
