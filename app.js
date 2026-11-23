/* ============================================================
   원탭링크 스튜디오 · app.js
   ------------------------------------------------------------
   core.js의 순수 함수에 화면을 붙인다.
   · 왼쪽 레일에서 편집 → 가운데 iframe(내보낼 문서 그대로) 미리보기
   · 링크 블록 드래그 정렬 · 예약 게시 · 브랜드 키트
   · localStorage 자동 저장 · 되돌리기 · HTML 1파일 내보내기
   ============================================================ */
(function () {
  'use strict';

  var C = window.OneTapLinkCore;
  var D = window.OneTapLinkData;
  if (!C || !D) {
    document.body.innerHTML = '<p style="padding:24px;font-family:sans-serif">엔진을 불러오지 못했습니다. core.js와 data.js를 확인하세요.</p>';
    return;
  }

  /* 저장 키는 브랜드 변경 전부터 쓰던 값 그대로 둔다(기존 초안·키트가 그대로 열리도록).
     화면에 보이는 이름만 원탭링크 스튜디오다. */
  var STORE_KEY = 'linkhub.state.v1';
  var KITS_KEY = 'linkhub.kits.v1';
  var MAX_HISTORY = 40;

  var state;
  var openId = null;
  var history = [];
  var histPos = -1;
  var lastDoc = '';
  var previewTimer = null;
  var saveTimer = null;
  var historyTimer = null;
  var burstOpen = false;
  var toastTimer = null;
  var thumbTarget = null;
  var zoomMode = 'fit';

  /* ---------------- 작은 도우미 ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(v) { return C.esc(v); }
  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  function flash(msg, undoFn) {
    var el = document.getElementById('toast');
    if (!el) return;
    flash._undo = typeof undoFn === 'function' ? undoFn : null;
    el.innerHTML = esc(msg) + (flash._undo ? ' <button type="button" data-act="toast-undo">되돌리기</button>' : '');
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); flash._undo = null; }, 4200);
  }

  /* ---------------- 저장 ---------------- */
  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = C.normalizeState(JSON.parse(raw));
        if (parsed.blocks.length) return parsed;
      }
    } catch (e) { /* 저장값이 깨졌으면 예시로 시작한다 */ }
    return C.normalizeState(D.DEMO);
  }

  function saveState() {
    var el = document.getElementById('saveState');
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      if (el) { el.textContent = '저장됨'; el.classList.remove('is-dirty'); }
    } catch (e) {
      if (el) { el.textContent = '저장 실패'; el.classList.add('is-dirty'); }
    }
  }

  function scheduleSave() {
    var el = document.getElementById('saveState');
    if (el) { el.textContent = '저장 중…'; el.classList.add('is-dirty'); }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 260);
  }

  /* ---------------- 되돌리기 ---------------- */
  function snapshot() { return JSON.stringify(state); }

  /** 현재 상태를 기록에 남긴다(호출 시점의 state가 지금 화면). */
  function pushHistory() {
    var snap = snapshot();
    if (history[histPos] === snap) return;
    history = history.slice(0, histPos + 1);
    history.push(snap);
    if (history.length > MAX_HISTORY) history.shift();
    histPos = history.length - 1;
    updateUndo();
  }

  /** 타이핑 묶음이 끝나면 한 번만 기록한다. */
  function beginBurst() { burstOpen = true; }

  function endBurstSoon() {
    clearTimeout(historyTimer);
    historyTimer = setTimeout(function () {
      burstOpen = false;
      pushHistory();
    }, 600);
  }

  /** 구조 변경 전에 진행 중인 타이핑 묶음을 먼저 기록한다. */
  function flushBurst() {
    if (!burstOpen) return;
    clearTimeout(historyTimer);
    burstOpen = false;
    pushHistory();
  }

  function updateUndo() {
    var btn = document.getElementById('undoBtn');
    if (btn) btn.disabled = histPos <= 0;
  }

  function undo() {
    if (histPos <= 0) return;
    histPos -= 1;
    state = C.normalizeState(JSON.parse(history[histPos]));
    openId = null;
    renderAll();
    scheduleSave();
    updateUndo();
    flash('되돌렸습니다.');
  }

  /* ---------------- 변경 반영 ---------------- */
  function apply(next) {
    flushBurst();
    state = C.normalizeState(next);
    renderAll();
    scheduleSave();
    pushHistory();
  }

  /* 이전 이름 유지 */
  function commit(next) { apply(next); }

  /** 타이핑처럼 잦은 변경: 화면 전체를 다시 그리지 않는다. */
  function soft(next) {
    beginBurst();
    state = C.normalizeState(next);
    syncDerivedFields();
    renderStats();
    renderFormPreviewText();
    scheduleSave();
    schedulePreview();
    endBurstSoon();
  }

  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 90);
  }

  /* ---------------- 미리보기 ---------------- */
  function updatePreview() {
    clearTimeout(previewTimer);
    var doc = C.exportDocument(state);
    var frame = document.getElementById('phoneFrame');
    if (frame && doc !== lastDoc) {
      var y = 0;
      try { y = frame.contentWindow.scrollY || 0; } catch (e) { y = 0; }
      lastDoc = doc;
      frame.srcdoc = doc;
      frame.onload = function () {
        try { frame.contentWindow.scrollTo(0, y); } catch (e) { /* 무시 */ }
        applyZoom();
      };
    }
    if (!doc) lastDoc = doc;
    renderAudit(doc);
    setText('exportSize', Math.max(1, Math.round(C.utf8Bytes(doc) / 1024)) + 'KB');
    var d = C.designOf(state);
    setText('presetTag', d.name.split(' · ')[0]);
    setText('statPreset', shortPreset(d.presetId));
  }

  function shortPreset(id) {
    var found = C.presetList().filter(function (p) { return p.id === id; })[0];
    if (!found) return '—';
    return found.name.split(' ')[0];
  }

  function applyZoom() {
    var phone = document.getElementById('phone');
    var stage = document.getElementById('stage');
    if (!phone || !stage) return;
    var frameW = 412, frameH = 866;
    var scale = 1;
    if (zoomMode === 'fit') {
      var body = document.querySelector('.stage-body');
      var availW = stage.clientWidth - 10;
      if (window.innerWidth <= 900) {
        /* 모바일은 폭에 맞춰 크게 보여 주고 세로로 스크롤한다 */
        scale = Math.min(availW / frameW, 0.95);
      } else {
        var availH = body && body.clientHeight > 200 ? body.clientHeight - 8 : window.innerHeight - 200;
        scale = Math.min(availW / frameW, availH / frameH, 1);
      }
      scale = Math.max(scale, 0.42);
    } else {
      var w = stage.clientWidth - 8;
      scale = Math.min(1, w / frameW);
    }
    phone.style.setProperty('--ps', String(Math.round(scale * 1000) / 1000));
  }

  /* ---------------- 렌더: 프로필 ---------------- */
  function renderProfile() {
    var p = state.profile;
    setInput('fName', p.name === '내 이름' ? '' : p.name);
    setInput('fHandle', p.handle);
    setInput('fTagline', p.tagline);
    setInput('fPageTitle', state.meta.title);
    setInput('fPageDesc', state.meta.description);
    setInput('fFooter', state.meta.footer);
    setInput('fShareUrl', state.meta.shareUrl);
    renderQrBox();

    var av = document.getElementById('avatarPreview');
    if (av) {
      av.dataset.shape = p.avatarShape;
      av.innerHTML = p.avatar ? '<img alt="" src="' + esc(p.avatar) + '">' : esc(C.firstChar(p.name));
    }
    $$('#shapeSeg .seg-btn').forEach(function (b) {
      b.classList.toggle('is-on', b.dataset.shape === p.avatarShape);
    });
    updateCounters();
  }

  function setInput(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    if (document.activeElement === el) return;
    el.value = value || '';
  }

  function updateCounters() {
    setText('taglineCount', state.profile.tagline.length + '/70');
    setText('pageTitleCount', state.meta.title.length + '/60');
  }

  /** 다른 값을 고쳐서 따라 바뀌는 입력란(이름 → 페이지 제목)을 다시 그린다. */
  function syncDerivedFields() {
    setInput('fPageTitle', state.meta.title);
    updateCounters();
  }

  function renderSocials() {
    var host = document.getElementById('socialList');
    if (!host) return;
    host.innerHTML = C.SOCIALS.map(function (def) {
      var item = state.socials.filter(function (s) { return s.type === def.id; })[0];
      return '<div class="social-row' + (item ? ' is-on' : '') + '" data-type="' + def.id + '">'
        + '<span class="social-ico" aria-hidden="true"><svg viewBox="0 0 24 24">' + def.svg + '</svg></span>'
        + '<span class="social-label">' + esc(def.label) + '</span>'
        + '<input type="url" data-social="' + def.id + '" value="' + esc(item ? item.url : '') + '" placeholder="' + esc(def.placeholder) + '" aria-label="' + esc(def.label) + ' 주소">'
        + '</div>';
    }).join('');
  }

  /* ---------------- 렌더: 링크 ---------------- */
  function links() {
    return state.blocks.filter(function (b) { return b.kind === 'link'; });
  }

  function renderLinks() {
    var host = document.getElementById('linkList');
    if (!host) return;
    var out = [];
    state.blocks.forEach(function (b, index) {
      if (b.kind === 'form') { out.push(formBlockRow(b)); return; }
      out.push(linkRow(b, index));
    });
    if (!state.blocks.length) {
      out.push('<p class="hint" style="padding:14px 4px">링크가 없습니다. 위의 <b>+ 링크 추가</b>를 누르세요.</p>');
    }
    host.innerHTML = out.join('');
    var n = links().length;
    setText('linkCount', String(n));
    setText('linkPill', n + ' / ' + C.LIMITS.links);
  }

  function linkRow(b, index) {
    var isOpen = openId === b.id;
    var bad = b.mode === 'link' && !C.hrefIsSafe(b.url);
    var meta = [];
    if (b.mode === 'copy') {
      meta.push('복사 · ' + C.clipText(b.copyText || '문구 없음', 26));
    } else if (bad) {
      meta.push('주소를 확인하세요');
    } else {
      meta.push(C.hostOf(b.url) || '주소 없음');
    }
    if (b.schedule.from || b.schedule.to) meta.push('예약 ' + C.scheduleLabel(b));
    if (b.mode === 'copy') meta.unshift('⧉');

    var html = '<div class="link-item' + (isOpen ? ' is-open' : '') + (bad ? ' is-bad' : '') + '" data-id="' + esc(b.id) + '">'
      + '<div class="link-head">'
      + '<button type="button" class="drag-handle" data-act="drag" aria-label="순서 바꾸기"><svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true"><g fill="currentColor"><circle cx="3" cy="3" r="1.3"/><circle cx="7" cy="3" r="1.3"/><circle cx="3" cy="7" r="1.3"/><circle cx="7" cy="7" r="1.3"/><circle cx="3" cy="11" r="1.3"/><circle cx="7" cy="11" r="1.3"/></g></svg></button>'
      + '<button type="button" class="link-main" data-act="toggle" aria-expanded="' + (isOpen ? 'true' : 'false') + '">'
      + '<span class="link-name">' + esc(b.title || '(제목 없음)') + (b.featured ? '<span class="feature-star" aria-label="강조">★</span>' : '') + '</span>'
      + '<span class="link-meta' + (bad ? ' is-warn' : '') + '">' + esc(meta.join(' · ')) + '</span>'
      + '</button>'
      + '<div class="link-tools">'
      + '<button type="button" class="icon-btn" data-act="up" title="위로" aria-label="위로">↑</button>'
      + '<button type="button" class="icon-btn" data-act="down" title="아래로" aria-label="아래로">↓</button>'
      + '<button type="button" class="icon-btn' + (b.featured ? ' is-on' : '') + '" data-act="featured" title="강조 카드" aria-label="강조 카드" aria-pressed="' + (b.featured ? 'true' : 'false') + '">★</button>'
      + '<button type="button" class="icon-btn is-danger" data-act="del" title="삭제" aria-label="삭제">✕</button>'
      + '</div></div>';

    if (isOpen) html += linkBody(b);
    html += '</div>';
    return html;
  }

  function linkBody(b) {
    var badgeChips = C.BADGE_PRESETS.map(function (x) {
      return '<button type="button" class="badge-chip' + (b.badge === x ? ' is-on' : '') + '" data-act="badge" data-badge="' + esc(x) + '">' + esc(x) + '</button>';
    }).join('');
    var thumb = b.thumb
      ? '<span class="thumb-preview" data-act="thumb-pick" title="썸네일 바꾸기"><img alt="" src="' + esc(b.thumb) + '"></span>'
      : '<span class="thumb-preview" data-act="thumb-pick" title="썸네일 올리기">없음</span>';
    var scheduleStatus = C.scheduleStatus(b);
    var schedLabel = C.scheduleLabel(b);
    return '<div class="link-body">'
      + '<label class="field"><span>제목</span><input type="text" data-f="title" maxlength="' + C.LIMITS.linkTitle + '" value="' + esc(b.title) + '"></label>'
      + '<label class="field"><span>소제목(선택)</span><input type="text" data-f="subtitle" maxlength="' + C.LIMITS.linkSub + '" value="' + esc(b.subtitle) + '"></label>'
      + '<label class="field"><span>배지(선택)</span><input type="text" data-f="badge" maxlength="' + C.LIMITS.badge + '" value="' + esc(b.badge) + '" placeholder="NEW · 마감 임박"></label>'
      + '<div class="badge-chips">' + badgeChips + '<button type="button" class="badge-chip" data-act="badge" data-badge="">없음</button></div>'
      + '<div class="field"><span class="field-label">누르면</span><div class="seg" role="group" aria-label="링크 동작">'
      + '<button type="button" class="seg-btn' + (b.mode === 'link' ? ' is-on' : '') + '" data-act="mode" data-mode="link">링크 열기</button>'
      + '<button type="button" class="seg-btn' + (b.mode === 'copy' ? ' is-on' : '') + '" data-act="mode" data-mode="copy">문구 복사</button>'
      + '</div></div>'
      + (b.mode === 'copy'
        ? '<label class="field"><span>복사할 문구</span><textarea data-f="copyText" rows="3" maxlength="' + C.LIMITS.copyText + '">' + esc(b.copyText) + '</textarea></label>'
        : '<label class="field"><span>주소</span><input type="url" data-f="url" maxlength="' + C.LIMITS.url + '" value="' + esc(b.url) + '" placeholder="https://"></label>'
          + '<p class="hint" style="margin:-4px 0 9px">주소를 비우면 목록에 남지만 내보낸 페이지에서는 열리지 않습니다.</p>')
      + '<div class="thumb-row">' + thumb
      + '<div><button type="button" class="btn btn-quiet btn-sm" data-act="thumb-pick">썸네일 올리기</button>'
      + (b.thumb ? ' <button type="button" class="btn btn-quiet btn-sm" data-act="thumb-clear">지우기</button>' : '')
      + '<p class="hint">4:3으로 잘라 400px. 페이지 파일 안에 들어갑니다.</p></div></div>'
      + '<div class="toggle-row"><label class="toggle"><input type="checkbox" data-f="featured"' + (b.featured ? ' checked' : '') + '> 강조 카드(포인트 색)</label></div>'
      + '<div class="sched-row">'
      + '<label>공개 시작<input type="datetime-local" data-f="sch-from" value="' + esc(b.schedule.from) + '"></label>'
      + '<label>공개 종료<input type="datetime-local" data-f="sch-to" value="' + esc(b.schedule.to) + '"></label>'
      + '<span class="sched-status' + (scheduleStatus === 'scheduled' ? ' is-scheduled' : (scheduleStatus === 'ended' ? ' is-ended' : '')) + '">'
      + (schedLabel ? (scheduleStatus === 'scheduled' ? '예약됨 · ' + schedLabel : (scheduleStatus === 'ended' ? '기간 종료 · ' + schedLabel : '지금 공개 중 · ' + schedLabel)) : '예약하지 않으면 항상 보입니다.')
      + '</span></div></div>';
  }

  function formBlockRow(b) {
    return '<div class="form-block-row" data-id="' + esc(b.id) + '">'
      + '<button type="button" class="drag-handle" data-act="drag" aria-label="순서 바꾸기"><svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true"><g fill="currentColor"><circle cx="3" cy="3" r="1.3"/><circle cx="7" cy="3" r="1.3"/><circle cx="3" cy="7" r="1.3"/><circle cx="7" cy="7" r="1.3"/><circle cx="3" cy="11" r="1.3"/><circle cx="7" cy="11" r="1.3"/></g></svg></button>'
      + '<span class="form-row-txt">문의폼 카드 · ' + esc(state.form.title) + '</span>'
      + '<span class="tag">FORM</span>'
      + '<button type="button" class="icon-btn" data-act="up" title="위로" aria-label="문의폼 위로">↑</button>'
      + '<button type="button" class="icon-btn" data-act="down" title="아래로" aria-label="문의폼 아래로">↓</button>'
      + '<button type="button" class="btn btn-quiet btn-sm" data-act="form-open">설정</button>'
      + '</div>';
  }

  /* ---------------- 렌더: 문의폼 ---------------- */
  function renderForm() {
    var f = state.form;
    var on = document.getElementById('formEnabled');
    if (on) on.checked = f.enabled;

    var grid = document.getElementById('modeGrid');
    if (grid) {
      grid.innerHTML = C.FORM_MODES.map(function (m) {
        return '<button type="button" class="mode-card' + (f.mode === m.id ? ' is-on' : '') + '" data-mode="' + m.id + '" aria-pressed="' + (f.mode === m.id ? 'true' : 'false') + '">'
          + '<b>' + esc(m.label) + '</b><small>' + esc(m.desc) + '</small></button>';
      }).join('');
    }

    setInput('fFormTitle', f.title);
    setInput('fFormNote', f.note);
    setInput('fFormUrl', f.url);
    setInput('fFormEmail', f.email);
    setInput('fFormKakao', f.kakao);
    setInput('fFormPhone', f.phone);

    var linkFields = document.getElementById('formLinkFields');
    if (linkFields) linkFields.hidden = f.mode !== 'link';

    var t = document.getElementById('fieldType');
    var bg = document.getElementById('fieldBudget');
    if (t) t.checked = !!f.fields.type;
    if (bg) bg.checked = !!f.fields.budget;

    renderFormPreviewText();
  }

  function renderFormPreviewText() {
    var out = C.composeInquiry(state, D.SAMPLE_INQUIRY);
    setText('formPreviewText', out.ok ? out.text : '(필수 항목을 채우면 문구가 완성됩니다)');
    var note = document.getElementById('formReadyNote');
    if (!note) return;
    if (!state.form.enabled) {
      note.textContent = '문의폼이 꺼져 있습니다. 링크 목록에 카드가 나타나지 않습니다.';
      note.classList.remove('is-bad');
    } else if (C.formReady(state)) {
      note.textContent = '받을 곳이 준비됐습니다. 방문자는 문구를 복사해 메일·카톡·문자로 보냅니다.';
      note.classList.remove('is-bad');
    } else {
      note.textContent = '아직 받을 곳이 없습니다 — ' + C.formIssue(state);
      note.classList.add('is-bad');
    }
  }

  /* ---------------- 렌더: 디자인 ---------------- */
  function renderDesign() {
    var d = state.design;
    var locked = !!state.brandKit;

    var grid = document.getElementById('presetGrid');
    if (grid) {
      grid.innerHTML = C.presetList().map(function (p) {
        var radius = Math.min(6, Math.round(p.radius / 4));
        return '<button type="button" class="preset-card' + (d.preset === p.id ? ' is-on' : '') + '" data-preset="' + esc(p.id) + '" aria-pressed="' + (d.preset === p.id ? 'true' : 'false') + '"' + (locked ? ' disabled' : '') + '>'
          + '<span class="preset-mini" style="--mini-bg:' + esc(p.palette.bg) + ';--mini-ink:' + esc(p.palette.ink) + ';--mini-surface:' + esc(p.palette.surface) + ';--mini-accent:' + esc(p.palette.accent) + ';border-radius:' + radius + 'px">'
          + '<i></i><i></i><i></i><i></i><i></i></span>'
          + '<span class="preset-meta"><b>' + esc(p.name) + '</b><small>' + esc(p.mood.join(' · ')) + '</small></span>'
          + '</button>';
      }).join('');
    }
    setText('presetNote', locked ? '브랜드 고정 중' : '8종');

    var fm = document.getElementById('fontMixList');
    if (fm) {
      fm.innerHTML = C.fontMixList().map(function (m) {
        return '<button type="button" class="chip' + (d.fontMix === m.id ? ' is-on' : '') + '" data-fontmix="' + esc(m.id) + '"' + (locked ? ' disabled' : '') + '>' + esc(m.name) + '</button>';
      }).join('');
    }
    var gr = document.getElementById('grainList');
    if (gr) {
      gr.innerHTML = C.grainList().map(function (g) {
        return '<button type="button" class="chip' + (d.grain === g.id ? ' is-on' : '') + '" data-grain="' + esc(g.id) + '"' + (locked ? ' disabled' : '') + '>' + esc(g.name) + '</button>';
      }).join('');
    }

    var dres = C.designOf(state);
    var accent = dres.tokens.color.accent;
    var color = document.getElementById('accentColor');
    var hex = document.getElementById('accentHex');
    if (color) { color.value = accent.toLowerCase(); color.disabled = locked; }
    if (hex && document.activeElement !== hex) { hex.value = accent; hex.disabled = locked; }
    var range = document.getElementById('radiusRange');
    if (range && document.activeElement !== range) {
      range.value = String(dres.radius);
      range.disabled = locked;
    }
    setText('radiusVal', dres.radius + 'px');

    var list = document.getElementById('contrastList');
    if (list) {
      list.innerHTML = dres.contrast.slice(0, 8).map(function (c) {
        return '<li class="contrast-row">'
          + '<span class="swatch" style="background:' + esc(c.fg) + ';box-shadow:inset 0 0 0 6px ' + esc(c.bg) + '"></span>'
          + '<span>' + esc(c.label) + '</span>'
          + '<span class="ratio">' + c.ratio + ':1</span>'
          + '<span class="verdict ' + (c.pass ? 'is-pass' : 'is-fail') + '">' + (c.pass ? 'AA' : '미달') + '</span>'
          + '</li>';
      }).join('');
    }

    var banner = document.getElementById('kitBanner');
    var clearBtn = $('[data-action="kit-clear"]');
    if (banner) {
      if (state.brandKit) {
        var sum = C.kitSummary(state.brandKit);
        banner.hidden = false;
        banner.innerHTML = '<b>브랜드 고정 중 · ' + esc(sum.name) + '</b>색·폰트·질감·모서리가 키트 값으로 잠겼습니다. '
          + '<span style="font-family:var(--mono);font-size:10px">' + esc(sum.fingerprint || '') + '</span>';
      } else {
        banner.hidden = true;
        banner.innerHTML = '';
      }
    }
    if (clearBtn) clearBtn.hidden = !state.brandKit;

    renderKits();
  }

  function renderKits() {
    var host = document.getElementById('kitList');
    if (!host) return;
    var kits = readKits();
    if (!kits.length) { host.innerHTML = ''; return; }
    host.innerHTML = kits.map(function (k, i) {
      var sum = C.kitSummary(k);
      if (!sum.ok) return '';
      return '<div class="kit-item" data-kit="' + i + '">'
        + '<span class="dot" style="background:' + esc(sum.palette.accent) + '"></span>'
        + '<span style="min-width:0"><b>' + esc(sum.name) + '</b><small>' + esc((sum.fingerprint || '').slice(0, 14)) + '</small></span>'
        + '<button type="button" class="btn btn-quiet btn-sm" style="margin-left:auto" data-act="kit-apply" data-kit="' + i + '">적용</button>'
        + '<button type="button" class="icon-btn is-danger" data-act="kit-del" data-kit="' + i + '" aria-label="키트 삭제">✕</button>'
        + '</div>';
    }).join('');
  }

  function readKits() {
    try {
      var arr = JSON.parse(localStorage.getItem(KITS_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function writeKits(arr) {
    try { localStorage.setItem(KITS_KEY, JSON.stringify(arr.slice(0, 12))); } catch (e) { /* 무시 */ }
  }

  /* ---------------- 렌더: 점검·통계 ---------------- */
  function renderAudit(doc) {
    var host = document.getElementById('auditList');
    if (!host) return;
    var audit = C.auditState(state, { html: doc || lastDoc || undefined });
    host.innerHTML = audit.items.map(function (it) {
      var mark = it.level === 'ok' ? '✓' : (it.level === 'warn' ? '!' : '×');
      return '<li class="audit-item is-' + it.level + '">'
        + '<span class="audit-dot" aria-hidden="true">' + mark + '</span>'
        + '<span class="audit-txt"><b>' + esc(it.label) + '</b><small>' + esc(it.detail) + '</small></span>'
        + (it.fix ? '<button type="button" class="audit-fix" data-fix="' + esc(it.id) + '">' + esc(it.fix) + '</button>' : '')
        + '</li>';
    }).join('');
    setText('auditScore', String(audit.score));
  }

  function renderStats() {
    setText('statLinks', String(links().length));
    var chars = state.profile.name.length + state.profile.tagline.length;
    state.blocks.forEach(function (b) {
      if (b.kind === 'link') chars += b.title.length + b.subtitle.length + (b.badge || '').length;
    });
    if (state.form.enabled) chars += state.form.title.length + state.form.note.length;
    setText('statChars', String(chars));
  }

  function renderAll() {
    renderProfile();
    renderSocials();
    renderLinks();
    renderForm();
    renderDesign();
    renderStats();
    updateUndo();
    updatePreview();
  }

  /* ---------------- 패널 전환 ---------------- */
  function switchPanel(name) {
    $$('.rail-tab').forEach(function (t) {
      var on = t.dataset.panel === name;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $$('.panel').forEach(function (p) {
      var on = p.id === 'panel-' + name;
      p.classList.toggle('is-on', on);
      p.hidden = !on;
    });
  }

  /* ---------------- 이미지 ---------------- */
  function pickFile(accept, cb) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = function () {
      var f = input.files && input.files[0];
      if (f) cb(f);
    };
    input.click();
  }

  function shrinkImage(file, w, h, quality) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) { reject(new Error('이미지 파일이 아닙니다.')); return; }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          var sw = img.width, sh = img.height;
          var scale = Math.max(w / sw, h / sh);
          var dw = sw * scale, dh = sh * scale;
          ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
          var out = canvas.toDataURL('image/jpeg', quality);
          URL.revokeObjectURL(url);
          resolve(out);
        } catch (e) { reject(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('이미지를 읽지 못했습니다.')); };
      img.src = url;
    });
  }

  /* ---------------- 사진 엔진: HEIC 변환 · 자르기 · QR ---------------- */
  /* 무거운 라이브러리는 필요할 때만 같은 저장소에서 불러온다(첫 화면 용량 0). */
  var VENDOR = {
    heic: 'assets/vendor/heic2any.min.js',
    cropperJs: 'assets/vendor/cropper.min.js',
    cropperCss: 'assets/vendor/cropper.min.css',
    qr: 'assets/vendor/qr-code-styling.js'
  };
  var vendorLoaded = {};
  var cropper = null;
  var cropUrl = '';

  function loadScript(src) {
    if (vendorLoaded[src]) return vendorLoaded[src];
    vendorLoaded[src] = new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = src;
      el.async = true;
      el.onload = function () { resolve(); };
      el.onerror = function () { reject(new Error('스크립트를 불러오지 못했습니다: ' + src)); };
      document.head.appendChild(el);
    });
    return vendorLoaded[src];
  }

  function loadStyle(href) {
    if (vendorLoaded[href]) return vendorLoaded[href];
    vendorLoaded[href] = new Promise(function (resolve, reject) {
      var el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = href;
      el.onload = function () { resolve(); };
      el.onerror = function () { reject(new Error('스타일을 불러오지 못했습니다: ' + href)); };
      document.head.appendChild(el);
    });
    return vendorLoaded[href];
  }

  function ensureHeic() {
    if (typeof window.heic2any === 'function') return Promise.resolve();
    return loadScript(VENDOR.heic);
  }

  function ensureCropper() {
    if (typeof window.Cropper === 'function') return Promise.resolve();
    return loadScript(VENDOR.cropperJs).then(function () { return loadStyle(VENDOR.cropperCss); });
  }

  function ensureQrLib() {
    if (typeof window.QRCodeStyling === 'function') return Promise.resolve();
    return loadScript(VENDOR.qr);
  }

  /** 아이폰 HEIC/HEIF 여부 — 확장자·MIME 둘 다 본다(브라우저가 MIME을 비우는 경우가 있다) */
  function isHeic(file) {
    if (!file) return false;
    var type = String(file.type || '').toLowerCase();
    var name = String(file.name || '').toLowerCase();
    return type === 'image/heic' || type === 'image/heif' || type === 'image/heic-sequence'
      || /\.(heic|heif)$/.test(name);
  }

  /** HEIC → JPEG 변환(heic2any, MIT). 실패해도 앱이 멈추지 않게 오류를 돌려준다. */
  function toJpeg(file, quality) {
    if (!file) return Promise.reject(new Error('파일이 없습니다.'));
    if (!isHeic(file)) return Promise.resolve(file);
    return ensureHeic().then(function () {
      return window.heic2any({ blob: file, toType: 'image/jpeg', quality: quality || 0.9, multiple: false });
    }).then(function (out) {
      var blob = Array.isArray(out) ? out[0] : out;
      if (!blob) throw new Error('변환 결과가 비어 있습니다.');
      var base = String(file.name || 'photo').replace(/\.(heic|heif)$/i, '');
      try { return new File([blob], base + '.jpg', { type: 'image/jpeg' }); }
      catch (e) { blob.name = base + '.jpg'; return blob; }
    });
  }

  function openCropper(file) {
    return new Promise(function (resolve) {
      var modal = document.getElementById('cropModal');
      var stage = document.getElementById('cropStage');
      if (!modal || !stage) { resolve(null); return; }
      ensureCropper().then(function () {
        if (cropUrl) { try { URL.revokeObjectURL(cropUrl); } catch (e) {} }
        cropUrl = URL.createObjectURL(file);
        stage.innerHTML = '<img id="cropImg" alt="자를 사진" src="' + cropUrl + '">';
        var img = document.getElementById('cropImg');
        var done = false;
        function finish(val) {
          if (done) return;
          done = true;
          try { if (cropper) { cropper.destroy(); } } catch (e) {}
          cropper = null;
          if (modal.open) modal.close();
          if (cropUrl) { try { URL.revokeObjectURL(cropUrl); } catch (e) {} cropUrl = ''; }
          resolve(val);
        }
        modal._finish = finish;
        function start() {
          try {
            cropper = new window.Cropper(img, {
              aspectRatio: 1, viewMode: 1, dragMode: 'move', autoCropArea: 0.9,
              background: false, responsive: true, guides: true, center: true,
              toggleDragModeOnDblclick: false, checkOrientation: true
            });
          } catch (e) { finish(null); return; }
          if (!modal.open) modal.showModal();
        }
        if (img.complete && img.naturalWidth) start();
        else { img.onload = start; img.onerror = function () { finish(null); }; }
      }).catch(function () {
        resolve(null);
        flash('사진 도구를 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.');
      });
    });
  }

  function cropResult() {
    if (!cropper) return '';
    var canvas = cropper.getCroppedCanvas({ width: 320, height: 320, imageSmoothingQuality: 'high' });
    if (!canvas) return '';
    return canvas.toDataURL('image/jpeg', 0.86);
  }

  function closeCropper(value) {
    var modal = document.getElementById('cropModal');
    if (modal && typeof modal._finish === 'function') modal._finish(value);
  }

  /** 공유 주소 → QR(SVG data URI). 내보낸 HTML 안에 그림으로 들어간다. */
  function makeQrData(url) {
    return ensureQrLib().then(function () {
      var QR = window.QRCodeStyling;
      if (typeof QR !== 'function') throw new Error('QR 엔진 없음');
      var qr = new QR({
        width: 420, height: 420, type: 'svg', data: url, margin: 1,
        qrOptions: { errorCorrectionLevel: 'M' },
        dotsOptions: { color: '#1b1a17', type: 'rounded' },
        cornersSquareOptions: { color: '#1b1a17', type: 'extra-rounded' },
        cornersDotOptions: { color: '#1b1a17' },
        backgroundOptions: { color: '#ffffff' }
      });
      return qr.getRawData('svg').then(function (blob) {
        if (!blob) throw new Error('QR 생성 실패');
        return new Promise(function (resolve, reject) {
          var fr = new FileReader();
          fr.onload = function () { resolve(String(fr.result)); };
          fr.onerror = function () { reject(new Error('QR 읽기 실패')); };
          fr.readAsDataURL(blob);
        });
      });
    });
  }

  function renderQrBox() {
    var box = document.getElementById('qrPreview');
    var dl = document.querySelector('[data-action="qr-download"]');
    if (!box) return;
    if (state.meta.qr) {
      box.innerHTML = '<img alt="공유 QR 코드" src="' + esc(state.meta.qr) + '" width="132" height="132">'
        + '<span class="qr-host">' + esc(C.shareHost(state.meta.shareUrl)) + '</span>';
    } else {
      box.innerHTML = '<span class="qr-empty">' + (state.meta.shareUrl ? 'QR 만들기를 누르세요' : '주소를 넣고 QR 만들기를 누르세요') + '</span>';
    }
    if (dl) dl.disabled = !state.meta.qr;
  }

  function buildQr() {
    var url = state.meta.shareUrl;
    if (!url) {
      flash('먼저 공개 주소를 넣어 주세요. 올린 페이지 주소를 그대로 쓰면 됩니다.');
      var input = document.getElementById('fShareUrl');
      if (input) input.focus();
      return Promise.resolve();
    }
    return makeQrData(url).then(function (data) {
      apply(C.updateMeta(state, { qr: data }));
      flash('QR을 만들었습니다. 내보낸 페이지 아래에 함께 들어갑니다.');
    }).catch(function () {
      flash('QR을 만들지 못했습니다. 잠시 뒤 다시 시도해 주세요.');
    });
  }

  function downloadQr() {
    if (!state.meta.qr) { flash('먼저 QR을 만들어 주세요.'); return; }
    ensureQrLib().then(function () {
      var QR = window.QRCodeStyling;
      var qr = new QR({
        width: 1024, height: 1024, type: 'canvas', data: state.meta.shareUrl, margin: 2,
        qrOptions: { errorCorrectionLevel: 'M' },
        dotsOptions: { color: '#1b1a17', type: 'rounded' },
        cornersSquareOptions: { color: '#1b1a17', type: 'extra-rounded' },
        cornersDotOptions: { color: '#1b1a17' },
        backgroundOptions: { color: '#ffffff' }
      });
      return qr.download({ name: 'onetaplink-qr', extension: 'png' });
    }).then(function () {
      flash('QR PNG를 저장했습니다.');
    }).catch(function () { flash('QR 저장에 실패했습니다.'); });
  }

  /** 내보내기 전에 공개 주소가 있는데 QR이 없으면 만들어 둔다 */
  function ensureQrForExport() {
    if (!state.meta.shareUrl || state.meta.qr) return Promise.resolve();
    return makeQrData(state.meta.shareUrl).then(function (data) {
      apply(C.updateMeta(state, { qr: data }));
    }).catch(function () { /* QR 실패는 내보내기를 막지 않는다 */ });
  }

  /* ---------------- 내보내기 ---------------- */
  function buildDoc() { return C.exportDocument(state); }

  function downloadDoc(doc) {
    var blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = C.exportFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  }

  function showExportModal(doc) {
    var v = C.verifyExport(doc);
    var stats = document.getElementById('exportStats');
    if (stats) {
      stats.innerHTML = '<div class="es"><span>파일 크기</span><b>' + v.kb + 'KB</b></div>'
        + '<div class="es"><span>블록</span><b>' + v.blocks + '개</b></div>'
        + '<div class="es"><span>외부 요청</span><b>0건</b></div>';
    }
    var checks = document.getElementById('exportChecks');
    if (checks) {
      var rows = [
        ['외부 CDN·폰트·이미지 요청 0건', v.issues.length === 0],
        ['DOCTYPE · viewport · lang="ko"', v.hasDoctype && v.hasViewport && v.hasLang],
        ['스타일·스크립트가 파일 안에', v.hasStyle && v.hasInlineScript],
        ['로고·광고·타사 브랜드 흔적 0건', v.issues.filter(function (i) { return i.id === 'brand'; }).length === 0],
        ['브랜드 키트 적용', state.brandKit ? true : null]
      ];
      checks.innerHTML = rows.map(function (r) {
        if (r[1] === null) return '';
        return '<p><span class="' + (r[1] ? 'ok' : 'bad') + '">' + (r[1] ? '✓' : '×') + '</span>' + esc(r[0]) + '</p>';
      }).join('') + (v.issues.length ? '<p><span class="bad">×</span>' + esc(v.issues.map(function (i) { return i.label; }).join(', ')) + '</p>' : '');
    }
    setText('exportSummary', 'index.html · ' + v.kb + 'KB · ' + links().length + '개 링크');
    var note = document.getElementById('exportNote');
    if (note) {
      note.textContent = v.issues.length
        ? '확인이 필요한 항목이 있습니다. 위 목록을 보세요.'
        : '이 파일 하나면 됩니다. GitHub Pages에 올리면 주소가 생깁니다.';
    }
    var modal = document.getElementById('exportModal');
    if (modal && !modal.open) modal.showModal();
  }

  function doExport() {
    ensureQrForExport().then(function () {
      var doc = buildDoc();
      lastDoc = doc;
      downloadDoc(doc);
      showExportModal(doc);
      saveState();
    });
  }

  function openPage() {
    ensureQrForExport().then(function () {
      var doc = buildDoc();
      var url = URL.createObjectURL(new Blob([doc], { type: 'text/html;charset=utf-8' }));
      var win = window.open(url, '_blank');
      if (!win) flash('팝업이 막혔습니다. 브라우저의 팝업 허용을 켜 주세요.');
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    });
  }

  /* ---------------- 템플릿 ---------------- */
  function openTemplates() {
    var host = document.getElementById('tplList');
    if (host) {
      host.innerHTML = D.TEMPLATES.map(function (t, i) {
        return '<button type="button" class="tpl-card" data-tpl="' + i + '">'
          + '<span class="tpl-tag">' + esc(t.tag) + '</span>'
          + '<b>' + esc(t.name) + '</b>'
          + '<small>' + esc(t.desc) + '</small></button>';
      }).join('');
    }
    var modal = document.getElementById('tplModal');
    if (modal) modal.showModal();
  }

  function applyTemplate(i) {
    var t = D.TEMPLATES[i];
    if (!t) return;
    var before = JSON.stringify(state);
    openId = null;
    apply(C.normalizeState(t.build()));
    var modal = document.getElementById('tplModal');
    if (modal && modal.open) modal.close();
    flash('‘' + t.name + '’ 템플릿을 적용했습니다.', function () {
      state = C.normalizeState(JSON.parse(before));
      openId = null;
      renderAll();
      scheduleSave();
      pushHistory();
      flash('템플릿 적용을 되돌렸습니다.');
    });
  }

  /* ---------------- 이벤트 ---------------- */
  function bind() {
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);

    var list = document.getElementById('linkList');
    if (list) list.addEventListener('pointerdown', onDragStart);

    window.addEventListener('resize', applyZoom);
    window.addEventListener('message', function (e) {
      var d = e.data || {};
      if (d && d.source === 'onetap' && d.type === 'select') selectBlock(d.id);
    });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
        e.preventDefault();
        undo();
      }
    });

    $$('[data-mview]').forEach(function (b) {
      b.addEventListener('click', function () {
        var view = b.dataset.mview;
        document.getElementById('main').dataset.view = view;
        $$('[data-mview]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
        applyZoom();
      });
    });

    $$('[data-zoom]').forEach(function (b) {
      b.addEventListener('click', function () {
        zoomMode = b.dataset.zoom;
        $$('[data-zoom]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
        applyZoom();
      });
    });

    $$('.rail-tab').forEach(function (t) {
      t.addEventListener('click', function () { switchPanel(t.dataset.panel); });
    });

    var cropModal = document.getElementById('cropModal');
    if (cropModal) {
      cropModal.addEventListener('close', function () {
        if (typeof cropModal._finish === 'function') cropModal._finish(null);
      });
    }
  }

  function onClick(e) {
    var t = e.target;

    var toastUndo = t.closest('[data-act="toast-undo"]');
    if (toastUndo) {
      var fn = flash._undo;
      flash._undo = null;
      document.getElementById('toast').classList.remove('is-on');
      if (typeof fn === 'function') fn();
      return;
    }

    var actionEl = t.closest('[data-action]');
    if (actionEl) {
      var action = actionEl.dataset.action;
      if (action === 'reset-view') { e.preventDefault(); return; }
      if (action === 'export') { doExport(); return; }
      if (action === 'open-page') { openPage(); return; }
      if (action === 'open-templates') { openTemplates(); return; }
      if (action === 'close-modal') {
        var dlg = actionEl.closest('dialog');
        if (dlg) dlg.close();
        return;
      }
      if (action === 'undo') { undo(); return; }
      if (action === 'add-link') {
        if (links().length >= C.LIMITS.links) { flash('링크는 ' + C.LIMITS.links + '개까지 넣을 수 있습니다.'); return; }
        var before = links().length;
        var next = C.addLink(state, { title: '새 링크 ' + (before + 1), url: '' });
        var added = next.blocks.filter(function (b) { return b.kind === 'link'; }).slice(-1)[0];
        openId = added ? added.id : null;
        apply(next);
        switchPanel('links');
        flash('링크를 추가했습니다. 주소를 넣어 주세요.');
        return;
      }
      if (action === 'avatar-pick') { pickAvatar(); return; }
      if (action === 'avatar-crop') { cropCurrentAvatar(); return; }
      if (action === 'crop-apply') { closeCropper(cropResult()); return; }
      if (action === 'crop-cancel') { closeCropper(null); return; }
      if (action === 'crop-reset') { if (cropper) { try { cropper.reset(); } catch (e) {} } return; }
      if (action === 'qr-make') { buildQr(); return; }
      if (action === 'qr-download') { downloadQr(); return; }
      if (action === 'avatar-clear') {
        commit(C.updateProfile(state, { avatar: '' }));
        flash('프로필 사진을 지웠습니다.');
        return;
      }
      if (action === 'accent-reset') {
        apply(C.updateDesign(state, { accent: '' }));
        return;
      }
      if (action === 'copy-inquiry-sample') {
        var out = C.composeInquiry(state, D.SAMPLE_INQUIRY);
        copyText(out.text).then(function (ok) { flash(ok ? '문의 예시 문구를 복사했습니다.' : '복사가 막혔습니다. 문구를 직접 선택해 복사하세요.'); });
        return;
      }
      if (action === 'kit-save') { saveKit(); return; }
      if (action === 'kit-json') { openKitJson(); return; }
      if (action === 'kit-import') { openKitJson(''); return; }
      if (action === 'kit-json-apply') { applyKitJson(); return; }
      if (action === 'kit-clear') {
        apply(C.clearKit(state));
        flash('브랜드 고정을 풀었습니다.');
        return;
      }
    }

    var preset = t.closest('[data-preset]');
    if (preset) {
      apply(C.updateDesign(state, { preset: preset.dataset.preset, radius: null }));
      return;
    }
    var fontBtn = t.closest('[data-fontmix]');
    if (fontBtn) {
      apply(C.updateDesign(state, { fontMix: fontBtn.dataset.fontmix }));
      return;
    }
    var grainBtn = t.closest('[data-grain]');
    if (grainBtn) {
      apply(C.updateDesign(state, { grain: grainBtn.dataset.grain }));
      return;
    }
    var shapeBtn = t.closest('[data-shape]');
    if (shapeBtn) {
      apply(C.updateProfile(state, { avatarShape: shapeBtn.dataset.shape }));
      return;
    }
    var modeCard = t.closest('[data-mode]');
    if (modeCard && modeCard.classList.contains('mode-card')) {
      apply(C.updateForm(state, { mode: modeCard.dataset.mode }));
      return;
    }
    var tpl = t.closest('[data-tpl]');
    if (tpl) { applyTemplate(Number(tpl.dataset.tpl)); return; }

    var fix = t.closest('[data-fix]');
    if (fix) {
      var id = fix.dataset.fix;
      if (id === 'form') switchPanel('form');
      else if (id === 'links') { switchPanel('links'); if (links().length === 0) return; }
      else if (id === 'url') {
        switchPanel('links');
        var bad = links().filter(function (b) { return b.mode === 'link' && !C.hrefIsSafe(b.url); })[0];
        if (bad) { openId = bad.id; renderLinks(); }
      } else if (id === 'name') { switchPanel('profile'); document.getElementById('fName').focus(); }
      else if (id === 'tagline') { switchPanel('profile'); document.getElementById('fTagline').focus(); }
      else {
        switchPanel('profile');
      }
      return;
    }

    /* 브랜드 키트 목록 */
    var kitBtn = t.closest('[data-act="kit-apply"], [data-act="kit-del"]');
    if (kitBtn) {
      var kits = readKits();
      var idx = Number(kitBtn.dataset.kit);
      var kit = kits[idx];
      if (!kit) return;
      if (kitBtn.dataset.act === 'kit-apply') {
        var applied = C.applyKit(state, kit);
        if (!applied.ok) { flash('키트를 적용하지 못했습니다.'); return; }
        apply(applied.state);
        flash('키트 ‘' + (C.kitSummary(kit).name || '') + '’를 적용했습니다.');
      } else {
        kits.splice(idx, 1);
        writeKits(kits);
        renderKits();
        flash('키트를 목록에서 지웠습니다.');
      }
      return;
    }

    /* 링크 행 안쪽 */
    var row = t.closest('.link-item, .form-block-row');
    if (!row) return;
    var rowId = row.dataset.id;
    var act = t.closest('[data-act]');
    if (!act) {
      if (t.closest('.link-body') || t.closest('.link-tools') || t.closest('.drag-handle')) return;
      return;
    }
    var a = act.dataset.act;
    var block = state.blocks.filter(function (b) { return b.id === rowId; })[0];
    if (!block) return;

    if (a === 'toggle') {
      openId = openId === rowId ? null : rowId;
      renderLinks();
      return;
    }
    if (a === 'up' || a === 'down') {
      apply(C.moveBlock(state, rowId, a === 'up' ? -1 : 1));
      return;
    }
    if (a === 'featured') {
      apply(C.updateBlock(state, rowId, { featured: !block.featured }));
      return;
    }
    if (a === 'del') {
      var beforeState = JSON.stringify(state);
      apply(C.removeBlock(state, rowId));
      flash('링크를 지웠습니다.', function () {
        state = C.normalizeState(JSON.parse(beforeState));
        renderAll();
        scheduleSave();
        pushHistory();
        flash('삭제를 되돌렸습니다.');
      });
      return;
    }
    if (a === 'mode') {
      var patch = { mode: act.dataset.mode };
      if (act.dataset.mode === 'copy' && !block.copyText) patch.copyText = block.title + ' 링크: ' + (block.url || '');
      apply(C.updateBlock(state, rowId, patch));
      return;
    }
    if (a === 'badge') {
      apply(C.updateBlock(state, rowId, { badge: act.dataset.badge }));
      return;
    }
    if (a === 'thumb-pick') { pickThumb(rowId); return; }
    if (a === 'thumb-clear') {
      apply(C.updateBlock(state, rowId, { thumb: '' }));
      return;
    }
    if (a === 'form-open') { switchPanel('form'); return; }
  }

  function onChange(e) {
    var t = e.target;
    if (t.id === 'formEnabled') {
      apply(C.setFormEnabled(state, t.checked));
      flash(t.checked ? '문의폼 카드를 켰습니다.' : '문의폼 카드를 껐습니다.');
      return;
    }
    if (t.id === 'fieldType' || t.id === 'fieldBudget') {
      var patch = {};
      patch[t.id === 'fieldType' ? 'type' : 'budget'] = t.checked;
      apply(C.updateForm(state, { fields: patch }));
      return;
    }
    if (t.id === 'accentColor') {
      apply(C.updateDesign(state, { accent: t.value }));
      return;
    }
    if (t.id === 'radiusRange') return; /* input 이벤트에서 처리 */
    if (t.dataset.f === 'featured') {
      var row = t.closest('.link-item');
      if (!row) return;
      apply(C.updateBlock(state, row.dataset.id, { featured: t.checked }));
    }
  }

  function onInput(e) {
    var t = e.target;
    var id = t.id;

    if (id === 'fName') { soft(C.updateProfile(state, { name: t.value })); return; }
    if (id === 'fHandle') { soft(C.updateProfile(state, { handle: t.value })); return; }
    if (id === 'fTagline') { soft(C.updateProfile(state, { tagline: t.value })); return; }
    if (id === 'fPageTitle') { soft(C.updateMeta(state, { title: t.value })); return; }
    if (id === 'fPageDesc') { soft(C.updateMeta(state, { description: t.value })); return; }
    if (id === 'fFooter') { soft(C.updateMeta(state, { footer: t.value })); return; }
    if (id === 'fShareUrl') {
      var nextUrl = C.normalizeShareUrl(t.value);
      var patch = { shareUrl: nextUrl };
      if (nextUrl !== state.meta.shareUrl) patch.qr = '';   /* 주소가 바뀌면 QR은 다시 */
      soft(C.updateMeta(state, patch));
      return;
    }
    if (id === 'fFormTitle') { soft(C.updateForm(state, { title: t.value })); return; }
    if (id === 'fFormNote') { soft(C.updateForm(state, { note: t.value })); return; }
    if (id === 'fFormUrl') { soft(C.updateForm(state, { url: t.value })); return; }
    if (id === 'fFormEmail') { soft(C.updateForm(state, { email: t.value })); return; }
    if (id === 'fFormKakao') { soft(C.updateForm(state, { kakao: t.value })); return; }
    if (id === 'fFormPhone') { soft(C.updateForm(state, { phone: t.value })); return; }
    if (id === 'accentHex') {
      if (C.isHex(t.value)) { soft(C.updateDesign(state, { accent: t.value })); }
      return;
    }
    if (id === 'radiusRange') {
      soft(C.updateDesign(state, { radius: Number(t.value) }));
      setText('radiusVal', t.value + 'px');
      return;
    }
    if (t.dataset.social) {
      var srow = t.closest('.social-row');
      if (srow) srow.classList.toggle('is-on', !!C.normalizeHref(t.value));
      soft(C.updateSocial(state, t.dataset.social, t.value));
      return;
    }
    if (t.dataset.f) {
      var row = t.closest('.link-item');
      if (!row) return;
      var f = t.dataset.f;
      var patch = {};
      if (f === 'title' || f === 'subtitle' || f === 'badge' || f === 'url' || f === 'copyText') patch[f] = t.value;
      else if (f === 'sch-from') patch.schedule = Object.assign({}, currentSchedule(row.dataset.id), { from: t.value });
      else if (f === 'sch-to') patch.schedule = Object.assign({}, currentSchedule(row.dataset.id), { to: t.value });
      else return;
      soft(C.updateBlock(state, row.dataset.id, patch));
    }
  }

  function currentSchedule(id) {
    var b = state.blocks.filter(function (x) { return x.id === id; })[0];
    return (b && b.schedule) || { from: '', to: '' };
  }

  /* ---------------- 드래그 정렬 ---------------- */
  var drag = null;

  function onDragStart(e) {
    var handle = e.target.closest('[data-act="drag"]');
    if (!handle) return;
    var row = handle.closest('.link-item, .form-block-row');
    if (!row) return;
    e.preventDefault();
    var rows = $$('#linkList > .link-item, #linkList > .form-block-row');
    drag = {
      id: row.dataset.id, el: row, startY: e.clientY, rows: rows, moved: false,
      pointerId: e.pointerId
    };
    row.classList.add('is-dragging');
    try { handle.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
    window.addEventListener('pointercancel', onDragEnd);
  }

  function onDragMove(e) {
    if (!drag) return;
    var dy = e.clientY - drag.startY;
    if (Math.abs(dy) > 5) drag.moved = true;
    drag.el.style.transform = 'translateY(' + dy + 'px)';
    drag.el.style.zIndex = '5';
    var others = drag.rows.filter(function (r) { return r !== drag.el; });
    var idx = 0;
    others.forEach(function (r) {
      var box = r.getBoundingClientRect();
      if (e.clientY > box.top + box.height / 2) idx += 1;
    });
    drag.insertAt = idx;
    others.forEach(function (r, i) {
      r.classList.toggle('is-target', i === idx - 1 && drag.moved);
    });
  }

  function onDragEnd() {
    if (!drag) return;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
    window.removeEventListener('pointercancel', onDragEnd);
    var d = drag;
    drag = null;
    d.rows.forEach(function (r) { r.classList.remove('is-target'); });
    d.el.classList.remove('is-dragging');
    d.el.style.transform = '';
    d.el.style.zIndex = '';
    if (!d.moved || d.insertAt === undefined) return;
    var order = d.rows.map(function (r) { return r.dataset.id; }).filter(function (id) { return id !== d.id; });
    order.splice(Math.max(0, Math.min(order.length, d.insertAt)), 0, d.id);
    apply(C.reorderBlocks(state, order));
    flash('순서를 바꿨습니다.');
  }

  /* ---------------- 선택 동기화 ---------------- */
  function selectBlock(id) {
    var b = state.blocks.filter(function (x) { return x.id === id; })[0];
    if (!b) return;
    if (b.kind === 'form') { switchPanel('form'); flash('문의폼 카드를 선택했습니다.'); return; }
    openId = id;
    switchPanel('links');
    renderLinks();
    var el = $('#linkList .link-item[data-id="' + id + '"]');
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.classList.add('is-target');
      setTimeout(function () { el.classList.remove('is-target'); }, 1200);
    }
  }

  /* ---------------- 클립보드 ---------------- */
  function copyText(text) {
    return new Promise(function (resolve) {
      function fallback() {
        try {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.top = '-1000px';
          document.body.appendChild(ta);
          ta.select();
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          resolve(ok);
        } catch (e) { resolve(false); }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { resolve(true); }, fallback);
      } else fallback();
    });
  }

  /* ---------------- 브랜드 키트 ---------------- */
  function saveKit() {
    var nameEl = document.getElementById('kitName');
    var name = (nameEl && nameEl.value.trim()) || (state.profile.name + ' 브랜드');
    var kit = C.makeBrandKit(state, name);
    var kits = readKits().filter(function (k) { return k.fingerprint !== kit.fingerprint; });
    kits.unshift(kit);
    writeKits(kits);
    apply(C.normalizeState(Object.assign({}, state, { brandKit: kit })));
    flash('브랜드를 고정했습니다 · ' + kit.name + ' (' + kit.fingerprint + ')');
  }

  function openKitJson(prefill) {
    var ta = document.getElementById('kitJson');
    if (ta) ta.value = prefill !== undefined ? prefill : JSON.stringify(state.brandKit || C.makeBrandKit(state, state.profile.name + ' 브랜드'), null, 2);
    var modal = document.getElementById('kitModal');
    if (modal) modal.showModal();
  }

  function applyKitJson() {
    var ta = document.getElementById('kitJson');
    if (!ta) return;
    var res;
    try {
      res = C.applyKit(state, JSON.parse(ta.value));
    } catch (e) {
      flash('JSON 문법이 맞지 않습니다.');
      return;
    }
    if (!res.ok) { flash('키트를 읽지 못했습니다: ' + res.errors.join(' / ')); return; }
    apply(res.state);
    var modal = document.getElementById('kitModal');
    if (modal && modal.open) modal.close();
    flash('브랜드 키트를 적용했습니다.');
  }

  function pickAvatar() {
    pickFile('image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif', function (file) {
      var heic = isHeic(file);
      if (heic) flash('아이폰 HEIC 사진을 JPEG로 바꾸는 중…');
      toJpeg(file, 0.9).then(function (jpg) {
        if (heic) flash('HEIC 사진을 JPEG로 바꿨습니다. 자르는 위치를 맞춰 주세요.');
        return openCropper(jpg);
      }).then(function (data) {
        if (!data) return;
        if (data.length > C.LIMITS.avatarBytes) { flash('사진이 너무 큽니다. 더 작은 사진을 써 주세요.'); return; }
        apply(C.updateProfile(state, { avatar: data }));
        flash('프로필 사진을 넣었습니다.');
      }).catch(function () {
        flash('사진을 읽지 못했습니다. 아이폰 사진이면 설정 → 카메라 → 포맷을 ‘높은 호환성’으로 바꾸거나 JPEG로 저장해 주세요.');
      });
    });
  }

  function dataUrlToBlob(dataUrl) {
    var parts = String(dataUrl || '').split(',');
    var mime = /data:([^;]+)/.exec(parts[0] || '');
    var bin = atob(parts[1] || '');
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime ? mime[1] : 'image/jpeg' });
  }

  function cropCurrentAvatar() {
    if (!state.profile.avatar) { flash('먼저 사진을 올려 주세요.'); return; }
    openCropper(dataUrlToBlob(state.profile.avatar)).then(function (data) {
      if (!data) return;
      if (data.length > C.LIMITS.avatarBytes) { flash('사진이 너무 큽니다. 더 작은 사진을 써 주세요.'); return; }
      apply(C.updateProfile(state, { avatar: data }));
      flash('사진을 다시 잘랐습니다.');
    }).catch(function () { flash('자르기를 열지 못했습니다.'); });
  }

  function pickThumb(rowId) {
    pickFile('image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif', function (file) {
      var heic = isHeic(file);
      toJpeg(file, 0.85).then(function (jpg) {
        if (heic) flash('HEIC 사진을 JPEG로 바꿨습니다.');
        return shrinkImage(jpg, 480, 360, 0.8);
      }).then(function (data) {
        if (data.length > C.LIMITS.thumbBytes) { flash('썸네일이 너무 큽니다.'); return; }
        apply(C.updateBlock(state, rowId, { thumb: data }));
        flash('썸네일을 넣었습니다.');
      }).catch(function () { flash('이미지를 읽지 못했습니다.'); });
    });
  }

  /* ---------------- 시작 ---------------- */
  function init() {
    state = loadState();
    history = [snapshot()];
    histPos = 0;
    bind();
    renderAll();
    applyZoom();
    window.addEventListener('load', applyZoom);
    /* 첫 방문 안내 */
    if (!localStorage.getItem(STORE_KEY)) {
      setTimeout(function () {
        flash('예시 페이지로 시작합니다. 왼쪽에서 고치면 오른쪽 미리보기가 바로 바뀝니다.');
      }, 600);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
