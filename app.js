/* =====================================================================
   Maria Stavreva – site renderer.
   You do NOT need to edit this file. All text is in content/content.js.
   Each HTML page has <body data-page="..."> and this script draws the
   header, the page and the footer from the content file.
   ===================================================================== */
(function () {
  'use strict';

  var DRAFT_KEY = 'msStavrevaDraft';
  var LANG_KEY = 'msLang';
  var params = new URLSearchParams(location.search);
  var C = window.SITE_CONTENT;
  var preview = false;

  // Draft preview (used by the editor in admin/): ?preview=draft
  if (params.get('preview') === 'draft') {
    try {
      var d = localStorage.getItem(DRAFT_KEY);
      if (d) { C = JSON.parse(d); preview = true; }
    } catch (e) { /* ignore */ }
  }
  if (!C) { document.body.innerHTML = '<p style="padding:2rem">content/content.js could not be loaded.</p>'; return; }

  var PAGES = [
    { id: 'home', file: 'index.html' },
    { id: 'about', file: 'about.html' },
    { id: 'coaching', file: 'coaching.html' },
    { id: 'online', file: 'online-coaching.html' },
    { id: 'international', file: 'international.html' },
    { id: 'camps', file: 'camps.html' },
    { id: 'business', file: 'business.html' },
    { id: 'projects', file: 'projects.html' },
    { id: 'contact', file: 'contact.html' }
  ];
  var NAV = ['about', 'coaching', 'online', 'international', 'camps', 'business', 'projects', 'contact'];

  var def = C.defaultLanguage || C.languages[0].code;
  var lang = pickLang();
  var page = document.body.getAttribute('data-page') || 'home';

  /* ---------- helpers ---------- */
  function hasLang(c) { return C.languages.some(function (l) { return l.code === c; }); }
  function pickLang() {
    var q = params.get('lang');
    if (q && hasLang(q)) return q;
    try { var s = localStorage.getItem(LANG_KEY); if (s && hasLang(s)) return s; } catch (e) { /* ignore */ }
    return def;
  }
  // t(): pick the text in the current language (falls back to the default language)
  function t(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return v[lang] || v[def] || '';
  }
  function ui(k) { return t((C.ui || {})[k]); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function paras(v) {
    return t(v).split(/\n{2,}/).map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }
  function isExternal(u) { return /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(u); }
  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (isExternal(u)) return '';           // blocks javascript:, data:, etc.
    return u;
  }
  // link(): internal link that keeps the chosen language (and draft preview)
  function link(href) {
    href = safeUrl(href);
    if (!href) return '#';
    if (isExternal(href)) return href;
    var hash = '', i = href.indexOf('#');
    if (i > -1) { hash = href.slice(i); href = href.slice(0, i); }
    var path = href, q = '';
    i = href.indexOf('?');
    if (i > -1) { path = href.slice(0, i); q = href.slice(i + 1); }
    var sp = new URLSearchParams(q);
    if (lang !== def) sp.set('lang', lang);
    if (preview) sp.set('preview', 'draft');
    var qs = sp.toString();
    return path + (qs ? '?' + qs : '') + hash;
  }
  function fileOf(id) { return PAGES.filter(function (p) { return p.id === id; })[0].file; }
  function diamond() { return '<span class="diamond" aria-hidden="true"></span>'; }
  function btn(label, href, style) {
    return '<a class="btn' + (style === 'secondary' ? ' secondary' : '') + '" href="' + esc(link(href)) + '">' + esc(t(label)) + '</a>';
  }
  function trim(s) { return String(s || '').trim(); }

  /* ---------- header / footer ---------- */
  function renderHeader() {
    var nav = NAV.map(function (id) {
      return '<li><a href="' + esc(link(fileOf(id))) + '"' + (id === page ? ' aria-current="page"' : '') + '>' + esc(ui('nav_' + id)) + '</a></li>';
    }).join('');
    var langs = C.languages.map(function (l) {
      return '<button type="button" data-lang="' + esc(l.code) + '" aria-pressed="' + (l.code === lang) + '" lang="' + esc(l.htmlLang || l.code) + '" title="' + esc(l.name) + '">' + esc(l.label) + '</button>';
    }).join('');
    return '<a class="skip" href="#main">' + esc(ui('skip')) + '</a>' + (preview ? '<div class="preview-bar">' + esc(ui('previewBanner')) + '</div>' : '') +
      '<header class="site-header"><div class="container header-inner">' +
      '<a class="brand" href="' + esc(link('index.html')) + '"><span class="brand-name">' + esc(C.site.name) + '</span><span class="brand-sub">' + esc(t(C.site.tagline)) + '</span></a>' +
      '<div class="nav-wrap"><nav class="nav" id="nav" aria-label="Main"><ul>' + nav + '</ul></nav>' +
      '<div class="lang" role="group" aria-label="' + esc(ui('language')) + '">' + langs + '</div>' +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="' + esc(ui('menu')) + '"><span></span><span></span><span></span></button></div>' +
      '</div></header>';
  }

  function contactRows(forFooter) {
    var c = C.contact || {}, rows = [];
    function row(label, valueHtml, raw) {
      if (forFooter && !raw) return;
      rows.push('<div><dt>' + esc(label) + '</dt><dd' + (raw ? '' : ' class="placeholder"') + '>' + (raw ? valueHtml : esc(ui('tbd'))) + '</dd></div>');
    }
    var em = trim(c.email), ph = trim(c.phone);
    row(ui('email'), em ? '<a href="mailto:' + esc(em) + '">' + esc(em) + '</a>' : '', !!em);
    row(ui('phone'), ph ? '<a href="tel:' + esc(ph.replace(/[^\d+]/g, '')) + '">' + esc(ph) + '</a>' : '', !!ph);
    var soc = (c.social || []).filter(function (s) { return safeUrl(s.url); });
    row(ui('social'), '<ul>' + soc.map(function (s) {
      return '<li><a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a></li>';
    }).join('') + '</ul>', soc.length > 0);
    return rows.join('');
  }

  function renderFooter() {
    var nav = PAGES.map(function (p) {
      return '<li><a href="' + esc(link(p.file)) + '">' + esc(ui('nav_' + p.id)) + '</a></li>';
    }).join('');
    var rows = contactRows(true);
    return '<footer class="site-footer"><div class="container"><div class="footer-grid">' +
      '<div><h3>' + esc(C.site.name) + '</h3><p>' + esc(t(C.site.positioning)) + '</p><span class="rule"></span>' +
      '<p class="tag">' + esc(t(C.site.taglineAlt)) + '</p><p>' + esc(t(C.site.affiliation)) + '</p></div>' +
      '<div><h4>' + esc(ui('footerExplore')) + '</h4><ul>' + nav + '</ul></div>' +
      '<div><h4>' + esc(ui('contactDetails')) + '</h4>' + (rows ? '<dl class="details" style="gap:12px">' + rows.replace(/class="placeholder"/g, '') + '</dl>' : '<p>' + esc(t(C.site.affiliation)) + '</p>') + '</div>' +
      '</div><div class="copy"><span>© ' + new Date().getFullYear() + ' ' + esc(C.site.name) + '. ' + esc(ui('footerRights')) + '</span><span>' + esc(t(C.site.tagline)) + '</span></div></div></footer>';
  }

  /* ---------- page pieces ---------- */
  function pageHead(title, lead) {
    return '<section class="page-head"><div class="container"><h1>' + esc(t(title)) + '</h1>' +
      (lead ? '<span class="rule"></span><p class="lead">' + esc(t(lead)) + '</p>' : '') + '</div></section>';
  }
  function ornament() {
    // Two overlapping circles – a nod to the "figure eight" of compulsory figures.
    return '<svg class="ornament" viewBox="0 0 600 400" fill="none" stroke="#B99A5B" stroke-width="1" aria-hidden="true" focusable="false">' +
      '<circle cx="230" cy="200" r="150"/><circle cx="370" cy="200" r="150"/><circle cx="230" cy="200" r="110" stroke-opacity=".55"/><circle cx="370" cy="200" r="110" stroke-opacity=".55"/>' +
      '<line x1="300" y1="30" x2="300" y2="370" stroke-opacity=".4"/></svg>';
  }

  /* ---------- pages ---------- */
  var R = {};

  R.home = function () {
    var h = C.home;
    var dirs = h.directions.map(function (d, i) {
      return '<article class="card"><span class="num">0' + (i + 1) + '</span><h3>' + esc(t(d.title)) + '</h3><p>' + esc(t(d.text)) + '</p>' +
        '<a class="more" href="' + esc(link(d.href)) + '">' + esc(ui('learnMore')) + '</a></article>';
    }).join('');
    var btns = h.buttons.map(function (b) { return btn(b.label, b.href, b.style); }).join('');
    return '<section class="hero on-navy"><div class="container">' + ornament() +
      '<h1>' + esc(C.site.name) + '</h1>' +
      '<p class="positioning">' + esc(t(C.site.positioning)) + '</p><span class="rule"></span>' +
      '<p class="tagline">' + esc(t(C.site.tagline)) + '</p>' +
      '<p class="intro">' + esc(t(h.intro)) + '</p><div class="btn-row">' + btns + '</div></div></section>' +
      '<section class="section ecru"><div class="container"><p class="eyebrow">' + esc(t(h.directionsTitle)) + '</p>' +
      '<div class="grid two">' + dirs + '</div></div></section>';
  };

  R.about = function () {
    var a = C.about;
    var edu = a.education.items.map(function (e) {
      return '<div class="edu"><h4>' + esc(t(e.institution)) + '</h4><p class="deg">' + esc(t(e.degree)) + '</p>' +
        '<span class="badge">' + esc(ui('status')) + ': ' + esc(t(e.status)) + '</span></div>';
    }).join('');
    function block(b, extra) {
      return '<div><h2 class="section-title">' + esc(t(b.title)) + '</h2><span class="rule"></span>' + paras(b.text) + (extra || '') + '</div>';
    }
    var ie = a.internationalExperience;
    return pageHead(a.title, a.lead) +
      '<section class="section"><div class="container narrow">' + a.bio.map(function (p) { return '<p class="lead" style="color:var(--ink)">' + esc(t(p)) + '</p>'; }).join('') +
      '<div class="affil"><p class="k">' + esc(t(a.affiliationLabel)) + '</p><p class="v">' + esc(t(C.site.affiliation)) + '</p></div></div></section>' +
      '<section class="section alt"><div class="container two-col">' + block(a.background) +
      '<div><h2 class="section-title">' + esc(t(a.education.title)) + '</h2><span class="rule"></span>' + edu + '</div></div></section>' +
      '<section class="section"><div class="container two-col">' + block(a.coachingExperience) +
      block(ie, '<p><a class="btn secondary" href="' + esc(link(ie.href)) + '">' + esc(t(ie.linkLabel)) + '</a></p>') + '</div></section>';
  };

  R.coaching = function () {
    var c = C.coaching;
    var facts = c.facts.map(function (f) { return '<div class="fact"><dt>' + esc(t(f.label)) + '</dt><dd>' + esc(t(f.value)) + '</dd></div>'; }).join('');
    var sv = c.services.map(function (s, i) {
      var n = i + 1;
      return '<article class="card"><span class="num">' + (n < 10 ? '0' : '') + n + '</span><h3>' + esc(t(s.title)) + '</h3>' + (t(s.text) ? '<p>' + esc(t(s.text)) + '</p>' : '') + '</article>';
    }).join('');
    return pageHead(c.title, c.lead) +
      '<section class="section"><div class="container two-col"><div><h2>' + esc(t(c.philosophyTitle)) + '</h2><span class="rule"></span><p class="lead">' + esc(t(c.philosophy)) + '</p></div>' +
      '<dl class="facts" style="margin:0">' + facts + '</dl></div></section>' +
      '<section class="section alt"><div class="container"><h2>' + esc(t(c.servicesTitle)) + '</h2><span class="rule"></span><div class="grid three">' + sv + '</div>' +
      '<p class="callout">' + esc(t(c.affiliationNote)) + '</p><div class="btn-row">' + btn(c.button, 'contact.html?topic=coaching') + '</div></div></section>';
  };

  var warnIcon = '<svg class="icon" viewBox="0 0 84 84" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true" focusable="false"><circle cx="42" cy="42" r="36"/><line x1="16" y1="68" x2="68" y2="16"/></svg>';
  R.online = function () {
    var o = C.online, ip = o.inPerson;
    var inc = o.includes.map(function (i) { return '<li>' + diamond() + '<span class="t">' + esc(t(i)) + '</span></li>'; }).join('');
    return '<a class="banner-inperson" href="#in-person"><strong>' + esc(ui('important')) + ':</strong>' + esc(t(ip.title)) + '</a>' +
      pageHead(o.title, o.intro) +
      '<section class="section"><div class="container narrow"><h2>' + esc(t(o.includesTitle)) + '</h2><span class="rule"></span><ul class="list-lines serif">' + inc + '</ul></div></section>' +
      '<section class="section ecru" id="in-person" tabindex="-1"><div class="container"><div class="notice on-navy" role="note">' + warnIcon +
      '<div><span class="label">' + esc(ui('important')) + '</span><h2>' + esc(t(ip.title)) + '</h2>' + ip.paragraphs.map(function (p) { return '<p>' + esc(t(p)) + '</p>'; }).join('') + '</div></div>' +
      '<div class="btn-row">' + btn(o.button, 'contact.html?topic=online') + '</div></div></section>';
  };

  R.international = function () {
    var n = C.international;
    var cs = n.countries.map(function (c) { return '<div class="country">' + diamond() + '<span>' + esc(t(c.name)) + '</span></div>'; }).join('');
    var ath = '';
    if (n.athletes && n.athletes.length) {
      ath = '<section class="section alt"><div class="container"><h2>' + esc(t(n.athletesTitle)) + '</h2><span class="rule"></span><div class="grid three">' +
        n.athletes.map(function (a) {
          return '<article class="card"><h3>' + esc(a.name) + '</h3>' + (t(a.country) ? '<p class="meta">' + esc(t(a.country)) + '</p>' : '') + (t(a.description) ? '<p>' + esc(t(a.description)) + '</p>' : '') + '</article>';
        }).join('') + '</div></div></section>';
    }
    return pageHead(n.title, n.intro) +
      '<section class="section"><div class="container"><h2>' + esc(t(n.countriesTitle)) + '</h2><span class="rule"></span><div class="countries">' + cs + '</div></div></section>' + ath;
  };

  R.camps = function () {
    var c = C.camps;
    var items = (c.items || []).map(function (k) {
      return '<article class="camp"><div class="camp-main on-navy"><span class="diamond" aria-hidden="true"></span><h2 style="margin-top:14px">' + esc(t(k.title)) + '</h2><span class="rule"></span><p class="dates">' + esc(t(k.dates)) + '</p></div>' +
        '<div class="camp-body"><dl>' +
        (t(k.location) ? '<div><dt>' + esc(ui('location')) + '</dt><dd>' + esc(t(k.location)) + '</dd></div>' : '') +
        (t(k.coach) ? '<div><dt>' + esc(ui('coach')) + '</dt><dd>' + esc(t(k.coach)) + '</dd></div>' : '') + '</dl>' +
        (t(k.description) ? '<p>' + esc(t(k.description)) + '</p>' : '') +
        '<div class="btn-row" style="margin-top:20px">' + btn(k.button, 'contact.html?topic=camps') + '</div></div></article>';
    }).join('');
    return pageHead(c.title, c.lead) + '<section class="section"><div class="container">' +
      (items || '<div class="empty">' + esc(ui('emptyCamps')) + '</div>') + '</div></section>';
  };

  R.business = function () {
    var b = C.business;
    var ints = b.interests.map(function (i) { return '<li>' + diamond() + '<span class="t">' + esc(t(i)) + '</span></li>'; }).join('');
    return pageHead(b.title, b.tagline) +
      '<section class="section"><div class="container two-col"><div><span class="badge">' + esc(t(b.status)) + '</span><span class="rule"></span>' +
      b.paragraphs.map(function (p) { return '<p class="lead" style="color:var(--ink)">' + esc(t(p)) + '</p>'; }).join('') + '</div>' +
      '<div><h2>' + esc(t(b.interestsTitle)) + '</h2><span class="rule"></span><ul class="list-lines serif">' + ints + '</ul>' +
      '<div class="btn-row">' + btn(b.button, 'contact.html?topic=business') + '</div></div></div></section>';
  };

  R.projects = function () {
    var p = C.projects;
    var cats = p.categories.map(function (cat) {
      var items = (p.items || []).filter(function (it) { return it.category === cat.id; });
      var body = items.length ? '<div class="grid three">' + items.map(function (it) {
        var meta = [t(it.date), t(it.location)].filter(Boolean).join(' · ');
        return '<article class="card"><h3>' + esc(t(it.title)) + '</h3>' + (meta ? '<p class="meta">' + esc(meta) + '</p>' : '') +
          (t(it.role) ? '<p class="meta"><strong>' + esc(ui('role')) + ':</strong> ' + esc(t(it.role)) + '</p>' : '') +
          (t(it.description) ? '<p>' + esc(t(it.description)) + '</p>' : '') + '</article>';
      }).join('') + '</div>' : '<div class="empty">' + esc(ui('emptyProjects')) + '</div>';
      return '<div class="cat"><h2>' + diamond() + esc(t(cat.title)) + '</h2>' + body + '</div>';
    }).join('');
    return pageHead(p.title, p.lead) + '<section class="section"><div class="container">' + cats + '</div></section>';
  };

  R.contact = function () {
    var c = C.contact, topic = params.get('topic') || '';
    var pills = c.categories.map(function (k) {
      return '<label class="pill"><input type="radio" name="category" value="' + esc(k.id) + '"' + (k.id === topic ? ' checked' : '') + '><span>' + esc(t(k.name)) + '</span></label>';
    }).join('');
    return pageHead(C.seo.contact.title, c.intro) +
      '<section class="section"><div class="container contact-grid">' +
      '<div><h2>' + esc(ui('contactDetails')) + '</h2><span class="rule"></span><dl class="details">' + contactRows(false) +
      '<div><dt>' + esc(t(C.contact.affLabel || C.about.affiliationLabel)) + '</dt><dd>' + esc(t(C.site.affiliation)) + '</dd></div></dl></div>' +
      '<form class="contact" id="contact-form" novalidate>' +
      '<fieldset><legend>' + esc(ui('inquiryArea')) + '</legend><div class="pills">' + pills + '</div></fieldset>' +
      '<div><label class="lbl" for="f-name">' + esc(ui('fullName')) + ' *</label><input type="text" id="f-name" name="name" autocomplete="name" required></div>' +
      '<div><label class="lbl" for="f-email">' + esc(ui('email')) + ' *</label><input type="email" id="f-email" name="email" autocomplete="email" required></div>' +
      '<div><label class="lbl" for="f-subject">' + esc(ui('subject')) + '</label><input type="text" id="f-subject" name="subject"></div>' +
      '<div><label class="lbl" for="f-msg">' + esc(ui('message')) + ' *</label><textarea id="f-msg" name="message" required></textarea></div>' +
      '<div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<div><button class="btn" type="submit">' + esc(ui('send')) + '</button></div><p class="status" id="form-status" role="status" aria-live="polite"></p></form>' +
      '</div></section>';
  };

  /* ---------- contact form ---------- */
  function setupForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = document.getElementById('form-status');
    function say(msg, ok) { status.textContent = msg; status.className = 'status ' + (ok ? 'ok' : 'err'); }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = form.elements;
      if (f.website.value) return; // spam trap
      var data = { name: trim(f.name.value), email: trim(f.email.value), subject: trim(f.subject.value), message: trim(f.message.value) };
      var cat = form.querySelector('input[name=category]:checked');
      var catName = '';
      if (cat) { C.contact.categories.forEach(function (k) { if (k.id === cat.value) catName = t(k.name); }); }
      if (!data.name || !data.email || !data.message) { say(ui('required'), false); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) { say(ui('invalidEmail'), false); return; }
      var endpoint = trim(C.contact.formEndpoint), to = trim(C.contact.email);
      if (endpoint) {
        say(ui('sending'), true);
        var body = { name: data.name, email: data.email, subject: data.subject || catName || 'Website inquiry', category: catName, message: data.message };
        if (trim(C.contact.formAccessKey)) body.access_key = trim(C.contact.formAccessKey);
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body) })
          .then(function (r) { if (!r.ok) throw new Error('bad'); form.reset(); say(ui('sentOk'), true); })
          .catch(function () { say(ui('sentFail'), false); });
      } else if (to) {
        var subj = (catName ? '[' + catName + '] ' : '') + (data.subject || 'Website inquiry');
        var text = data.message + '\n\n— ' + data.name + ' (' + data.email + ')';
        location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text);
        say(ui('mailtoOpen'), true);
      } else {
        say(ui('formUnavailable'), false);
      }
    });
  }

  /* ---------- meta / render ---------- */
  function setMeta() {
    var seo = (C.seo || {})[page] || {};
    var title = t(seo.title);
    document.title = (page === 'home' ? C.site.name + ' – ' + title : title + ' | ' + C.site.name);
    var desc = t(seo.description);
    var m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute('content', desc);
    [['og:title', document.title], ['og:description', desc]].forEach(function (p) {
      var el = document.querySelector('meta[property="' + p[0] + '"]');
      if (el) el.setAttribute('content', p[1]);
    });
    var l = C.languages.filter(function (x) { return x.code === lang; })[0];
    document.documentElement.setAttribute('lang', (l && l.htmlLang) || lang);
  }

  function render() {
    // keep what the visitor already typed in the contact form when the language is switched
    var saved = {};
    var old = document.getElementById('contact-form');
    if (old) Array.prototype.forEach.call(old.elements, function (el) {
      if (el.name && el.type !== 'radio' && el.type !== 'submit') saved[el.name] = el.value;
      if (el.type === 'radio' && el.checked) saved.category = el.value;
    });
    setMeta();
    document.getElementById('site-header').innerHTML = renderHeader();
    document.getElementById('main').innerHTML = (R[page] || R.home)();
    document.getElementById('site-footer').innerHTML = renderFooter();
    var form = document.getElementById('contact-form');
    if (form) {
      Object.keys(saved).forEach(function (k) {
        if (k === 'category') { var r = form.querySelector('input[name=category][value="' + saved[k] + '"]'); if (r) r.checked = true; }
        else if (form.elements[k]) form.elements[k].value = saved[k];
      });
    }
    setupForm();
    bindHeader();
  }

  function bindHeader() {
    var header = document.getElementById('site-header');
    var menu = header.querySelector('.menu-btn'), nav = header.querySelector('.nav');
    if (menu) menu.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', open);
    });
    Array.prototype.forEach.call(header.querySelectorAll('.lang button'), function (b) {
      b.addEventListener('click', function () {
        lang = b.getAttribute('data-lang');
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
        var sp = new URLSearchParams(location.search);
        if (lang === def) sp.delete('lang'); else sp.set('lang', lang);
        var qs = sp.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
        render();
      });
    });
  }

  render();
})();
