/* =====================================================================
   Content editor. Works entirely in the browser (no server, no account).
   It reads content/content.js, lets you edit it with forms, keeps a draft
   in this browser, and gives you a new content.js to upload.
   ===================================================================== */
(function () {
  'use strict';
  var DRAFT_KEY = 'msStavrevaDraft';
  var published = window.SITE_CONTENT;
  var data, draftLoaded = false;

  /* ---------- field definitions (what shows up in the forms) ---------- */
  function T(k, label, help) { return { type: 'text', k: k, label: label, help: help }; }
  function L(k, label, help) { return { type: 'l', k: k, label: label, help: help }; }
  function LA(k, label, help) { return { type: 'l', k: k, label: label, help: help, area: true }; }
  function ARR(k, label, add, help) { return { type: 'larray', k: k, label: label, add: add, help: help, area: true }; }
  function LIST(k, label, fields, o) { o = o || {}; return { type: 'list', k: k, label: label, fields: fields, titleKey: o.titleKey, add: o.add || 'Add', help: o.help, itemName: o.itemName }; }
  function G(k, label, fields, flat) { return { type: 'group', k: k, label: label, fields: fields, flat: flat }; }
  function SEL(k, label, options, help) { return { type: 'select', k: k, label: label, options: options, help: help }; }
  function DICT(k, label, help) { return { type: 'dict', k: k, label: label, help: help }; }

  var PAGE_LINKS = [
    ['index.html', 'Home'], ['about.html', 'About'], ['coaching.html', 'Coaching'], ['online-coaching.html', 'Online coaching'],
    ['international.html', 'International'], ['camps.html', 'Training camps'], ['business.html', 'Sports business'],
    ['projects.html', 'Projects'], ['contact.html', 'Contact'],
    ['contact.html?topic=coaching', 'Contact – coaching inquiry'], ['contact.html?topic=online', 'Contact – online coaching inquiry'],
    ['contact.html?topic=camps', 'Contact – camps inquiry'], ['contact.html?topic=business', 'Contact – business inquiry']
  ];
  function pageOptions() { return PAGE_LINKS.map(function (p) { return { value: p[0], label: p[1] }; }); }

  var SECTIONS = [
    { id: 'site', label: 'Name, tagline & club', hint: 'Shown in the header, home page and footer.', fields: [
      G('site', '', [T('name', 'Your name'), L('positioning', 'Professional title'), L('tagline', 'Tagline'), L('taglineAlt', 'Second tagline (footer)'), L('affiliation', 'Current club / affiliation', 'For example “Ice Star – Varna, Bulgaria”. Change it here when your club changes – it updates everywhere.')], true)] },
    { id: 'home', label: 'Home page', hint: 'The first page visitors see.', fields: [
      G('home', '', [LA('intro', 'Introduction'), L('directionsTitle', 'Heading above the two directions'),
        LIST('directions', 'The two professional directions', [L('title', 'Title'), LA('text', 'Short text'), SEL('href', 'Opens page', pageOptions)], { titleKey: 'title', add: 'Add a direction' }),
        LIST('buttons', 'Buttons in the top section', [L('label', 'Button text'), SEL('href', 'Opens page', pageOptions), SEL('style', 'Look', [{ value: 'primary', label: 'Filled' }, { value: 'secondary', label: 'Outline' }])], { titleKey: 'label', add: 'Add a button' })], true)] },
    { id: 'about', label: 'About & biography', hint: 'Your biography, education and background.', fields: [
      G('about', '', [L('title', 'Page title'), L('lead', 'Short line under the title'),
        ARR('bio', 'Biography – one paragraph per box', 'Add a paragraph', 'To update your biography, edit the paragraphs here.'),
        L('affiliationLabel', 'Label above the club name'),
        G('background', 'Professional background', [L('title', 'Heading'), LA('text', 'Text')]),
        G('education', 'Education & qualifications', [L('title', 'Heading'), LIST('items', 'Qualifications', [L('institution', 'University / institution'), L('degree', 'Degree'), L('status', 'Status', 'For example Completed / Currently pursuing')], { titleKey: 'institution', add: 'Add a qualification' })]),
        G('coachingExperience', 'Coaching experience', [L('title', 'Heading'), LA('text', 'Text')]),
        G('internationalExperience', 'International experience', [L('title', 'Heading'), LA('text', 'Text'), L('linkLabel', 'Button text')])], true)] },
    { id: 'coaching', label: 'Coaching page', hint: 'Services and your coaching approach.', fields: [
      G('coaching', '', [L('title', 'Page title'), L('lead', 'Short line under the title'), L('philosophyTitle', 'Heading for your approach'),
        LA('philosophy', 'Your coaching approach / philosophy', 'Write your own words here – this is a good place for your personal philosophy.'),
        LIST('facts', 'Key facts (experience, who you work with…)', [L('label', 'Label'), L('value', 'Value')], { titleKey: 'label', add: 'Add a fact' }),
        L('servicesTitle', 'Heading for the services'),
        LIST('services', 'Services', [L('title', 'Service name'), LA('text', 'Optional description (can stay empty)')], { titleKey: 'title', add: 'Add a service', help: 'Add, rename, reorder or delete services here.' }),
        L('affiliationNote', 'Line about your current club'), L('button', 'Button text')], true)] },
    { id: 'online', label: 'Online coaching', hint: 'The in-person-only notice is a fixed, highlighted block. Edit its wording carefully.', fields: [
      G('online', '', [L('title', 'Page title'), LA('intro', 'Introduction'), L('includesTitle', 'Heading for the list'),
        ARR('includes', 'What online sessions can include', 'Add an item'),
        G('inPerson', 'Highlighted notice: choreography & programmes in person only', [L('title', 'Notice title'), ARR('paragraphs', 'Notice text – one paragraph per box', 'Add a paragraph')]),
        L('button', 'Button text')], true)] },
    { id: 'international', label: 'International experience', hint: 'Countries and (optionally) athlete profiles.', fields: [
      G('international', '', [L('title', 'Page title'), LA('intro', 'Introduction'), L('countriesTitle', 'Heading above the countries'),
        LIST('countries', 'Countries', [L('name', 'Country name')], { titleKey: 'name', add: 'Add a country', help: 'To add a country, click “Add a country” and type the name in English and Bulgarian.' }),
        L('athletesTitle', 'Heading for athlete profiles'),
        LIST('athletes', 'Athlete profiles (hidden on the website while this list is empty)', [T('name', 'Athlete name', 'Only publish names and details of athletes (or their parents/guardians for minors) who have agreed.'), L('country', 'Country'), LA('description', 'Short description')], { titleKey: null, add: 'Add an athlete profile' })], true)] },
    { id: 'camps', label: 'Training camps', hint: 'Each camp appears as a card. Camps are shown in the order listed.', fields: [
      G('camps', '', [L('title', 'Page title'), L('lead', 'Short line under the title'),
        LIST('items', 'Camps & events', [L('title', 'Camp name'), L('dates', 'Dates', 'Write it the way it should appear, e.g. 05–31 July 2027'), L('location', 'Location'), L('coach', 'Coach'), LA('description', 'Description'), L('button', 'Button text')], { titleKey: 'title', add: 'Add a camp', help: 'To add a camp click the button below. To remove one, open it and click Delete.' })], true)] },
    { id: 'business', label: 'Sports business', hint: 'Presented as an academic and developing direction.', fields: [
      G('business', '', [L('title', 'Page title'), L('tagline', 'Tagline'), L('status', 'Small label above the text'),
        ARR('paragraphs', 'Text – one paragraph per box', 'Add a paragraph'), L('interestsTitle', 'Heading for the interests'),
        ARR('interests', 'Areas of professional interest', 'Add an interest'), L('button', 'Button text')], true)] },
    { id: 'projects', label: 'Projects & events', hint: 'Add projects to show them under their category. While a category has none, the website shows a friendly empty message.', fields: [
      G('projects', '', [L('title', 'Page title'), L('lead', 'Short line under the title'),
        LIST('categories', 'Categories', [T('id', 'Internal ID (no spaces, leave as is)'), L('title', 'Category name')], { titleKey: 'title', add: 'Add a category' }),
        LIST('items', 'Projects', [SEL('category', 'Category', function (d) { return d.projects.categories.map(function (c) { return { value: c.id, label: (c.title && (c.title.en || c.title[d.defaultLanguage])) || c.id }; }); }),
          L('title', 'Project title'), L('date', 'Date'), L('location', 'Location'), L('role', 'Your role'), LA('description', 'Description')], { titleKey: 'title', add: 'Add a project' })], true)] },
    { id: 'contact', label: 'Contact details & form', hint: 'Leave a field empty and the website shows “To be added”.', fields: [
      G('contact', '', [T('email', 'Email address'), T('phone', 'Phone'),
        LIST('social', 'Social media links', [T('label', 'Name (e.g. Instagram)'), T('url', 'Full link (https://…)')], { titleKey: null, add: 'Add a social link' }),
        LA('intro', 'Text above the form'),
        LIST('categories', 'Inquiry categories', [T('id', 'Internal ID (leave as is)'), L('name', 'Category name')], { titleKey: 'name', add: 'Add a category' }),
        T('formEndpoint', 'Contact form address (optional)', 'Paste the free Formspree or Web3Forms address here to receive messages by email. See README. If empty, the form opens the visitor’s email app instead (needs your email above).'),
        T('formAccessKey', 'Web3Forms access key (optional)', 'Only needed if you use Web3Forms.')], true)] },
    { id: 'seo', label: 'Search engine titles', hint: 'The title and description Google may show for each page.', fields: [
      G('seo', '', ['home', 'about', 'coaching', 'online', 'international', 'camps', 'business', 'projects', 'contact'].map(function (p) {
        return G(p, 'Page: ' + p, [L('title', 'Title'), LA('description', 'Description (about 150 characters)')]);
      }), true)] },
    { id: 'labels', label: 'Menu & button labels', hint: 'Small texts used across the site (menu, form labels, messages).', fields: [DICT('ui', '')] }
  ];

  /* ---------- helpers ---------- */
  var langs = function () { return data.languages; };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function blankL() { var o = {}; langs().forEach(function (l) { o[l.code] = ''; }); return o; }
  function blank(fields) {
    var o = {};
    fields.forEach(function (f) {
      if (f.type === 'text') o[f.k] = '';
      else if (f.type === 'l') o[f.k] = blankL();
      else if (f.type === 'larray' || f.type === 'list') o[f.k] = [];
      else if (f.type === 'group') o[f.k] = blank(f.fields);
      else if (f.type === 'select') { var opts = typeof f.options === 'function' ? f.options(data) : f.options; o[f.k] = opts[0] ? opts[0].value : ''; }
    });
    return o;
  }
  function isL(o) { var codes = langs().map(function (l) { return l.code; }); var ks = o && typeof o === 'object' && !Array.isArray(o) ? Object.keys(o) : []; return ks.length > 0 && ks.every(function (k) { return codes.indexOf(k) > -1 && typeof o[k] === 'string'; }) && ks.indexOf(data.defaultLanguage) > -1; }
  function normalize(o) {
    if (Array.isArray(o)) { o.forEach(normalize); return; }
    if (o && typeof o === 'object') {
      if (isL(o)) { langs().forEach(function (l) { if (typeof o[l.code] !== 'string') o[l.code] = ''; }); return; }
      Object.keys(o).forEach(function (k) { normalize(o[k]); });
    }
  }
  function countMissing(o) {
    var n = 0;
    (function walk(x) {
      if (Array.isArray(x)) { x.forEach(walk); return; }
      if (x && typeof x === 'object') {
        if (isL(x)) { var v = Object.keys(x).map(function (k) { return x[k].trim(); }); if (v.some(Boolean) && v.some(function (s) { return !s; })) n++; return; }
        Object.keys(x).forEach(function (k) { walk(x[k]); });
      }
    })(o);
    return n;
  }

  /* ---------- state: draft ---------- */
  var saveTimer;
  function changed() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); draftLoaded = true; } catch (e) { /* ignore */ }
      status();
    }, 250);
    status(true);
  }
  function status(saving) {
    var m = countMissing(data);
    document.getElementById('draft-state').textContent =
      (saving ? 'Saving draft…' : (draftLoaded ? 'Draft saved in this browser – not published yet. ' : 'Showing the published content. ')) +
      (m ? m + ' text' + (m > 1 ? 's' : '') + ' with a missing translation (highlighted in yellow).' : 'All texts have every language.');
  }
  var toastT;
  function toast(msg) { var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 3500); }

  /* ---------- building forms ---------- */
  var openItems = new WeakSet();
  var current = 'site', view = 'both';
  var uid = 0;

  function renderFields(parent, obj, fields) {
    fields.forEach(function (f) {
      if (f.type === 'text') parent.appendChild(textField(obj, f));
      else if (f.type === 'l') parent.appendChild(lField(obj, f));
      else if (f.type === 'larray') parent.appendChild(larrayField(obj, f));
      else if (f.type === 'list') parent.appendChild(listField(obj, f));
      else if (f.type === 'select') parent.appendChild(selectField(obj, f));
      else if (f.type === 'dict') parent.appendChild(dictField(obj, f));
      else if (f.type === 'group') {
        if (!obj[f.k] || typeof obj[f.k] !== 'object') obj[f.k] = blank(f.fields);
        var g = el('div', f.flat ? '' : 'group');
        if (!f.flat && f.label) g.appendChild(el('h3', '', esc(f.label)));
        renderFields(g, obj[f.k], f.fields);
        parent.appendChild(g);
      }
    });
  }
  function fieldWrap(f, id) {
    var w = el('div', 'field');
    var lab = el('label', '', esc(f.label)); lab.setAttribute('for', id); w.appendChild(lab);
    if (f.help) w.appendChild(el('p', 'help', esc(f.help)));
    return w;
  }
  function textField(obj, f) {
    var id = 'f' + (++uid), w = fieldWrap(f, id), i = el('input'); i.type = 'text'; i.id = id; i.value = obj[f.k] || '';
    i.addEventListener('input', function () { obj[f.k] = i.value; changed(); }); w.appendChild(i); return w;
  }
  function selectField(obj, f) {
    var id = 'f' + (++uid), w = fieldWrap(f, id), s = el('select'); s.id = id;
    var opts = typeof f.options === 'function' ? f.options(data) : f.options;
    opts.forEach(function (o) { var op = el('option', '', esc(o.label)); op.value = o.value; s.appendChild(op); });
    if (obj[f.k] && !opts.some(function (o) { return o.value === obj[f.k]; })) { var x = el('option', '', esc(obj[f.k] + ' (custom)')); x.value = obj[f.k]; s.appendChild(x); }
    s.value = obj[f.k] || ''; s.addEventListener('change', function () { obj[f.k] = s.value; changed(); }); w.appendChild(s); return w;
  }
  // a bilingual set of inputs bound to obj[key] (an object {en:'',bg:''})
  function biInputs(holder, key, area, labelFor) {
    if (!holder[key] || typeof holder[key] !== 'object') holder[key] = blankL();
    var v = holder[key], box = el('div', 'bi'); box.style.setProperty('--n', langs().length);
    var cols = [];
    langs().forEach(function (l, idx) {
      if (typeof v[l.code] !== 'string') v[l.code] = '';
      var c = el('div', 'col'); c.dataset.lang = l.code;
      var id = 'f' + (++uid);
      var tag = el('label', '', ''); tag.setAttribute('for', id);
      tag.innerHTML = '<span>' + esc(l.label) + ' – ' + esc(l.name) + '</span>';
      var inp = area ? el('textarea') : el('input'); if (!area) inp.type = 'text'; inp.id = id; inp.value = v[l.code]; inp.lang = l.htmlLang || l.code;
      inp.addEventListener('input', function () { v[l.code] = inp.value; mark(); changed(); });
      c.appendChild(tag); c.appendChild(inp); box.appendChild(c); cols.push({ c: c, l: l, inp: inp });
    });
    function mark() {
      var any = cols.some(function (x) { return x.inp.value.trim(); });
      cols.forEach(function (x) { x.c.classList.toggle('missing', any && !x.inp.value.trim()); });
    }
    mark(); return box;
  }
  function lField(obj, f) {
    var w = el('div', 'field'); w.appendChild(el('div', 'lab', esc(f.label)));
    if (f.help) w.appendChild(el('p', 'help', esc(f.help)));
    w.appendChild(biInputs(obj, f.k, f.area)); return w;
  }
  function larrayField(obj, f) {
    if (!Array.isArray(obj[f.k])) obj[f.k] = [];
    var arr = obj[f.k], w = el('div', 'field'); w.appendChild(el('div', 'lab', esc(f.label)));
    if (f.help) w.appendChild(el('p', 'help', esc(f.help)));
    arr.forEach(function (item, i) {
      var holder = { v: item }, row = el('div', 'line-row');
      arr[i] = holder.v; row.appendChild(biInputsArr(arr, i, f.area));
      row.appendChild(tools(arr, i, false)); w.appendChild(row);
    });
    var add = el('button', 'add', '+ ' + esc(f.add || 'Add')); add.type = 'button';
    add.addEventListener('click', function () { arr.push(blankL()); changed(); rerender(); }); w.appendChild(add); return w;
  }
  function biInputsArr(arr, i, area) { var h = { v: arr[i] }; var b = biInputs(h, 'v', area); arr[i] = h.v; return b; }
  function tools(arr, i, withDelete) {
    var t = el('div', 'tools');
    function b(txt, title, fn, cls) { var x = el('button', 'small ' + (cls || ''), txt); x.type = 'button'; x.title = title; x.setAttribute('aria-label', title); x.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(); }); t.appendChild(x); }
    if (i > 0) b('↑', 'Move up', function () { var x = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = x; changed(); rerender(); });
    if (i < arr.length - 1) b('↓', 'Move down', function () { var x = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = x; changed(); rerender(); });
    b('Delete', 'Delete', function () { if (confirm('Delete this item? You can undo by choosing “Discard draft” only if you have not saved a new content.js yet.')) { arr.splice(i, 1); changed(); rerender(); } }, 'danger');
    return t;
  }
  function itemTitle(item, f, i) {
    var name = (f.itemName || 'Item') + ' ' + (i + 1);
    var tk = f.titleKey, txt = '';
    if (tk && item[tk]) txt = typeof item[tk] === 'string' ? item[tk] : (item[tk][data.defaultLanguage] || '');
    if (!txt && item.name && typeof item.name === 'string') txt = item.name;
    if (!txt && item.label && typeof item.label === 'string') txt = item.label;
    return txt ? (i + 1) + '. ' + txt : name + ' (empty)';
  }
  function listField(obj, f) {
    if (!Array.isArray(obj[f.k])) obj[f.k] = [];
    var arr = obj[f.k], w = el('div', 'field'); w.appendChild(el('div', 'lab', esc(f.label)));
    if (f.help) w.appendChild(el('p', 'help', esc(f.help)));
    var box = el('div', 'items');
    arr.forEach(function (item, i) {
      var d = el('details', 'item'); if (openItems.has(item)) d.open = true;
      d.addEventListener('toggle', function () { if (d.open) openItems.add(item); else openItems.delete(item); });
      var s = el('summary'); s.appendChild(el('span', 't', esc(itemTitle(item, f, i)))); s.appendChild(tools(arr, i, true)); d.appendChild(s);
      var body = el('div', 'body'); renderFields(body, item, f.fields); d.appendChild(body); box.appendChild(d);
    });
    w.appendChild(box);
    var add = el('button', 'add', '+ ' + esc(f.add)); add.type = 'button';
    add.addEventListener('click', function () { var n = blank(f.fields); arr.push(n); openItems.add(n); changed(); rerender(); }); w.appendChild(add); return w;
  }
  function dictField(obj, f) {
    var d = obj[f.k], w = el('div', '');
    Object.keys(d).forEach(function (k) {
      var fw = el('div', 'field'); fw.appendChild(el('div', 'lab', esc(k.replace(/_/g, ' '))));
      fw.appendChild(biInputs(d, k, false)); w.appendChild(fw);
    });
    return w;
  }

  /* ---------- screen ---------- */
  function renderSide() {
    var s = document.getElementById('side'); s.innerHTML = '';
    SECTIONS.forEach(function (sec) {
      var b = el('button', '', esc(sec.label)); b.type = 'button'; if (sec.id === current) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { current = sec.id; renderSide(); renderMain(); window.scrollTo({ top: 0 }); }); s.appendChild(b);
    });
  }
  function applyView() {
    Array.prototype.forEach.call(document.querySelectorAll('#editor .bi .col'), function (c) { c.hidden = view !== 'both' && c.dataset.lang !== view; });
  }
  function renderMain() {
    var m = document.getElementById('editor'); m.innerHTML = '';
    var sec = SECTIONS.filter(function (x) { return x.id === current; })[0];
    m.appendChild(el('h2', '', esc(sec.label))); m.appendChild(el('p', 'hint', esc(sec.hint)));
    var vb = el('div', 'viewbar', 'Show: ');
    [['both', 'Both languages']].concat(langs().map(function (l) { return [l.code, l.name]; })).forEach(function (o) {
      var b = el('button', '', esc(o[1])); b.type = 'button'; b.setAttribute('aria-pressed', view === o[0]);
      b.addEventListener('click', function () { view = o[0]; Array.prototype.forEach.call(vb.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); applyView(); }); vb.appendChild(b);
    });
    m.appendChild(vb);
    renderFields(m, data, sec.fields); applyView();
  }
  function rerender() { var y = window.scrollY; renderMain(); window.scrollTo({ top: y }); status(); }

  /* ---------- toolbar ---------- */
  function serialize() {
    return '/* =====================================================================\n   MARIA STAVREVA WEBSITE – ALL TEXT LIVES IN THIS FILE\n   Easiest way to edit: open admin/index.html, edit in the forms,\n   click "Download content.js" and replace this file with the download.\n   Every text has an English (en) and Bulgarian (bg) version.\n   ===================================================================== */\nwindow.SITE_CONTENT = ' + JSON.stringify(data, null, 2) + ';\n';
  }
  document.getElementById('btn-download').addEventListener('click', function () {
    var blob = new Blob([serialize()], { type: 'text/javascript' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'content.js'; document.body.appendChild(a); a.click(); a.remove();
    var m = countMissing(data);
    toast('content.js downloaded. Replace content/content.js in your website with it.' + (m ? ' Note: ' + m + ' text(s) still miss a translation.' : ''));
  });
  document.getElementById('btn-preview').addEventListener('click', function () {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); draftLoaded = true; status(); } catch (e) { toast('Your browser does not allow saving a draft here.'); return; }
    window.open('../index.html?preview=draft', '_blank');
  });
  document.getElementById('btn-reset').addEventListener('click', function () {
    if (!confirm('Discard your draft and go back to the published content?')) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
    data = clone(published); draftLoaded = false; normalize(data); renderMain(); status(); toast('Draft discarded.');
  });
  document.getElementById('btn-import').addEventListener('click', function () { document.getElementById('file-in').click(); });
  document.getElementById('file-in').addEventListener('change', function (ev) {
    var f = ev.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var txt = String(r.result), a = txt.indexOf('{'), b = txt.lastIndexOf('}');
        var obj = JSON.parse(txt.slice(a, b + 1));
        if (!obj.languages || !obj.site) throw new Error('not a content file');
        data = obj; normalize(data); changed(); renderMain(); toast('File opened. It is now your draft.');
      } catch (e) { toast('That file could not be read. Use a content.js that was downloaded from this editor.'); }
    };
    r.readAsText(f); ev.target.value = '';
  });

  /* ---------- start ---------- */
  data = clone(published);
  try {
    var d = localStorage.getItem(DRAFT_KEY);
    if (d) { var parsed = JSON.parse(d); if (parsed && parsed.languages && parsed.site) { data = parsed; draftLoaded = JSON.stringify(parsed) !== JSON.stringify(published); } }
  } catch (e) { /* ignore */ }
  normalize(data);
  renderSide(); renderMain(); status();
})();
