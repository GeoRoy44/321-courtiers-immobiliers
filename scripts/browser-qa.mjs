const { default: assert } = await import('node:assert/strict');

export async function runBrowserQA(page, base='http://127.0.0.1:4173') {
  const counts={nantes:9,rennes:8,reims:10};
  const results=[];
  for(const [city,count] of Object.entries(counts)){
    const url=`${base}/courtier-pret-immobilier-${city}/`;
    const response=await page.goto(url);
    assert.equal(response.status(),200);
    assert.equal(await page.locator('[data-courtier]').count(),count);
    assert.equal(await page.locator('[data-courtier] a[href^="tel:"]').count(),count-(city==='nantes'?0:1));
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),`https://321courtierimmobilier.fr/courtier-pret-immobilier-${city}/`);
    for(const width of [1440,375]){
      await page.setViewportSize({width,height:1000});
      await page.evaluate(()=>window.scrollTo(0,0));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:`/home/user/workspace/pilot-${city}-${width}-hero.png`});
      await page.getByRole('link',{name:`Consulter les ${count} agences`,exact:true}).click();
      assert.equal(new URL(page.url()).hash,'#agences');
      await page.locator('.directory-grid').scrollIntoViewIfNeeded();
      await page.screenshot({path:`/home/user/workspace/pilot-${city}-${width}-cards.png`});
    }
    results.push({city,cards:count});
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${base}/annuaire-courtiers-pret-immobilier/`);
  const visible=()=>page.locator('[data-courtier]:visible').count();
  assert.equal(await visible(),27);
  for(const [city,total] of [['Nantes',9],['Rennes',8],['Reims',10]]){
    await page.getByLabel('Ville',{exact:true}).selectOption(city);
    assert.equal(await visible(),total);
  }
  await page.getByLabel('Nom, adresse ou service').fill('CAFPI');
  assert.equal(await visible(),1);
  await page.getByRole('button',{name:'Tout afficher'}).click();
  assert.equal(await visible(),27);
  await page.getByLabel('Nom, adresse ou service').fill('CRÉDITS ET CONSEILS');
  assert.equal(await visible(),1);
  await page.getByLabel('Nom, adresse ou service').fill('<script>alert(1)</script>');
  assert.equal(await visible(),0);
  assert.ok(await page.getByText('Aucune fiche pour cette recherche',{exact:true}).isVisible());
  await page.screenshot({path:'/home/user/workspace/pilot-directory-empty.png'});
  await page.getByRole('button',{name:'Tout afficher'}).click();
  await page.locator('[data-courtier]').first().locator('summary').click();
  assert.ok(await page.locator('[data-courtier]').first().locator('details').getAttribute('open')!==null);
  await page.locator('[data-courtier]').first().locator('summary').press('Enter');
  assert.equal(await page.locator('[data-courtier]').first().locator('details').getAttribute('open'),null);
  await page.locator('[data-directory]').scrollIntoViewIfNeeded();
  await page.screenshot({path:'/home/user/workspace/pilot-directory-desktop.png'});
  for(const [query,total] of [['Nantes',9],['35000',8],['51100',10],['Rezé',0]]){
    await page.goto(`${base}/`);
    await page.getByLabel('Votre ville ou votre code postal').fill(query);
    await page.getByRole('button',{name:'Trouver un courtier',exact:true}).click();
    await page.waitForURL('**/trouver-mon-courtier/**');
    await page.waitForFunction(expected=>document.querySelectorAll('[data-courtier]:not([hidden])').length===expected,total);
    assert.equal(await visible(),total);
  }
  await page.goto(`${base}/annuaire-courtiers-pret-immobilier/?ville=Rennes#cafpi-nantes`);
  assert.equal(await visible(),27);
  assert.ok(await page.locator('#cafpi-nantes').isVisible());
  await page.setViewportSize({width:375,height:812});
  for(const path of ['/','/annuaire-courtiers-pret-immobilier/','/trouver-mon-courtier/','/a-propos/','/plan-du-site/']){
    await page.goto(base+path);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,path);
  }
  await page.goto(`${base}/annuaire-courtiers-pret-immobilier/?ville=Rennes`);
  await page.locator('.directory-filters').scrollIntoViewIfNeeded();
  await page.screenshot({path:'/home/user/workspace/pilot-directory-mobile.png'});
  results.push({filters:'passed',search:'passed',emptyState:'passed',detailsKeyboard:'passed',mobileOverflow:false});
  return results;
}
