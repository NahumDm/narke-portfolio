const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Exercise browser event paths without sending email or adding runtime dependencies.
function contact(clipboard) {
  const ids = ['intent','scopeForm','clientName','clientEmail','clientFields','recruiterFields','stage','budget','roleType','workMode','timeline','details','summaryBox','sendBtn','copyBtn','copiedMsg','formSubject','formattedSummary'];
  const elements = Object.fromEntries(ids.map(id => [id, {
    value: '', style: {}, dataset: {}, attrs: {}, validity: { valid: true }, events: {},
    addEventListener(name, handler) { this.events[name] = handler; },
    setAttribute(name, value) { this.attrs[name] = value; },
    focus() { this.focused = true; },
  }]));
  Object.entries({intent:'mobile',clientEmail:'qa@example.com',stage:'idea',budget:'under-1k',roleType:'backend-role',workMode:'remote',timeline:'asap'}).forEach(([id,value]) => { elements[id].value = value; });
  elements.scopeForm.reportValidity = () => elements.clientEmail.validity.valid;
  const requests = [];
  let timer;
  const context = {
    document: {getElementById: id => elements[id], querySelectorAll: () => [], createRange: () => ({selectNodeContents() {}})},
    window: {getSelection: () => ({removeAllRanges() {}, addRange() {}})},
    navigator: {clipboard}, AbortController,
    FormData: class { constructor() { this.details = elements.details.value; } },
    fetch: (url, options) => new Promise((resolve, reject) => {
      requests.push({url, options, resolve, reject});
      options.signal.addEventListener('abort', () => reject(Object.assign(new Error('timeout'), {name:'AbortError'})));
    }),
    setTimeout(fn) { timer = fn; return 1; }, clearTimeout() {},
  };
  vm.runInNewContext(fs.readFileSync('js/funnel.js', 'utf8'), context);
  return {elements, requests, expire: () => timer(), submit: () => elements.scopeForm.events.submit({preventDefault() {}})};
}

test('pending requests reject duplicate sends and preserve later edits', async () => {
  const {elements:e, requests, submit} = contact();
  e.details.value = 'Original';
  const pending = submit();
  e.details.value = 'Edited draft';
  e.details.events.input();
  assert.equal(e.sendBtn.disabled, true);
  await submit();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.body.details, 'Original');
  requests[0].resolve({ok:true});
  await pending;
  assert.equal(e.details.value, 'Edited draft');
  assert.equal(e.sendBtn.disabled, false);
  assert.equal(e.copiedMsg.dataset.state, 'success');
});

test('switching inquiry type disables the inactive fieldset', () => {
  const {elements:e} = contact();
  assert.equal(e.recruiterFields.disabled, true);
  e.intent.value = 'hire'; e.intent.events.change();
  assert.equal(e.clientFields.disabled, true);
  assert.equal(e.clientFields.hidden, true);
  assert.equal(e.recruiterFields.disabled, false);
  assert.equal(e.recruiterFields.hidden, false);
});

test('invalid email never reaches the network', async () => {
  const {elements:e,requests,submit} = contact();
  e.clientEmail.validity.valid = false;
  await submit();
  assert.equal(requests.length, 0);
});

test('failed and timed-out requests keep the draft and allow recovery', async () => {
  for (const timeout of [false,true]) {
    const {elements:e,requests,submit,expire} = contact();
    e.details.value = 'Keep this';
    const pending = submit();
    if (timeout) expire(); else requests[0].resolve({ok:false});
    await pending;
    assert.equal(e.details.value, 'Keep this');
    assert.equal(e.sendBtn.disabled, false);
    assert.equal(e.copiedMsg.dataset.state, 'error');
  }
});

test('missing or denied clipboard offers a selectable summary', async () => {
  for (const clipboard of [undefined,{writeText: async () => {throw new Error('denied');}}]) {
    const {elements:e} = contact(clipboard);
    await e.copyBtn.events.click();
    assert.equal(e.summaryBox.focused, true);
    assert.match(e.copiedMsg.textContent, /Select and copy/);
  }
});

test('clipboard success announces completion', async () => {
  let copied;
  const {elements:e} = contact({writeText: async value => {copied=value;}});
  await e.copyBtn.events.click();
  assert.equal(copied, e.summaryBox.textContent);
  assert.match(e.copiedMsg.textContent, /Copied/);
});

test('mobile navigation closes on desktop change and Escape restores focus', () => {
  const media = {matches:true, addEventListener(name,fn) {this.change=fn;}};
  const toggle = {attrs:{},setAttribute(k,v) {this.attrs[k]=v;},addEventListener(n,fn) {this.click=fn;},closest() {return {classList:{add() {}}};},focus() {this.focused=true;}};
  const menu = {querySelectorAll: () => []};
  let keydown;
  vm.runInNewContext(fs.readFileSync('js/nav.js','utf8'), {
    window:{matchMedia: () => media},
    document:{getElementById:id => id === 'navToggle' ? toggle : menu,addEventListener(n,fn) {keydown=fn;}},
  });
  toggle.click(); assert.equal(menu.hidden,false); assert.equal(toggle.attrs['aria-label'],'Close menu');
  keydown({key:'Escape'}); assert.equal(menu.hidden,true); assert.equal(toggle.focused,true);
  toggle.click(); media.matches=false; media.change();
  assert.equal(menu.hidden,true); assert.equal(toggle.attrs['aria-expanded'],'false');
});

test('accordion responds to content resizing and excludes collapsed links', () => {
  const content = {scrollHeight:600, getBoundingClientRect() {return {height:this.scrollHeight};}};
  const panel = {style:{},querySelector: () => content,closest: () => ({classList:{add() {}}}),setAttribute() {}};
  const button = {dataset:{defaultExpanded:'true'},attrs:{'aria-controls':'case-1'},getAttribute(k) {return this.attrs[k];},setAttribute(k,v) {this.attrs[k]=v;},addEventListener(n,fn) {this.click=fn;}};
  let resized;
  class Observer {constructor(fn) {resized=fn;} observe() {}}
  vm.runInNewContext(fs.readFileSync('js/accordion.js','utf8'),{document:{querySelectorAll:()=>[button],getElementById:()=>panel},window:{ResizeObserver:Observer},ResizeObserver:Observer});
  assert.equal(panel.style.maxHeight,'600px');
  content.scrollHeight=900; resized(); assert.equal(panel.style.maxHeight,'900px');
  button.click(); assert.equal(panel.inert,true); assert.equal(panel.style.maxHeight,'0px');
});


test('page preserves no-script content, matching controls, and form fallback', () => {
  const html = fs.readFileSync('index.html','utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/aria-controls="([^"]+)"/g)) assert(ids.includes(match[1]));
  assert.equal([...html.matchAll(/class="case-head" aria-expanded="true"/g)].length, 4);
  assert.match(html, /id="scopeForm" action="https:\/\/formspree.io\/f\/xgogblyr" method="post"/);
  assert.match(html, /type="submit" form="scopeForm"/);
  assert.match(html, /id="copiedMsg" role="status" aria-live="polite"/);
  assert.doesNotMatch(html, /platforms.*iOS/);
});

test('secondary text maintains 4.5:1 contrast across page surfaces', () => {
  const css = fs.readFileSync('css/variables.css','utf8');
  function color(token) {return css.match(new RegExp('--'+token+':#([0-9A-Fa-f]{6})'))[1];}
  function luminance(hex) {
    const [r,g,b] = hex.match(/../g).map(value => parseInt(value,16)/255).map(value => value <= .04045 ? value/12.92 : ((value+.055)/1.055)**2.4);
    return .2126*r+.7152*g+.0722*b;
  }
  for (const surface of ['bg','bg-elevated','surface','surface-2']) {
    const ratio = (luminance(color('text-faint'))+.05)/(luminance(color(surface))+.05);
    assert(ratio >= 4.5, surface+' contrast '+ratio);
  }
});
