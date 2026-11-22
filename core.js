/* ============================================================
   원탭링크 스튜디오 · core.js
   ------------------------------------------------------------
   DOM을 만지지 않는 순수 함수만 둔다. 브라우저는 window.OneTapLinkCore,
   node는 require('./core.js')로 쓴다.

   - 프로필·링크·문의폼·디자인 상태 모델과 정규화(입력 검증·XSS 차단)
   - 디자인 레퍼런스 엔진 v2 연결(프리셋 8종 · 폰트 믹스 · 그레인 · 브랜드 키트)
   - 내보낼 단일 index.html 생성 (외부 CDN·폰트·이미지 요청 0건)
   - 문의 문구 조합(화면 스크립트와 같은 함수를 문자열로 내보내 결과 일치)
   - 내보낸 파일 감사(외부 요청·로고·광고·크기)
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./engines/design-ref-engine.js'));
  } else {
    root.OneTapLinkCore = factory(root.DesignRef);
  }
})(typeof self !== 'undefined' ? self : this, function (DR) {
  'use strict';

  var VERSION = '1.0.0';

  if (!DR) throw new Error('engines/design-ref-engine.js를 먼저 불러와야 합니다.');

  /* ==========================================================
     0. 문자열 · 숫자 · URL 안전장치
     ========================================================== */

  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  /** 모든 사용자 입력은 이 함수를 거쳐 HTML에 들어간다. */
  function esc(v) {
    return String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; });
  }

  function isStr(v) { return typeof v === 'string'; }

  /** 저장용: 앞뒤 공백·연속 공백을 정리하고 길이만 자른다(말줄임표 없음). */
  function cut(v, n) {
    var s = String(v === null || v === undefined ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
    if (n && s.length > n) s = s.slice(0, n).trim();
    return s;
  }

  /** 화면 표시용: 한 줄로 접고 넘치면 … */
  function clipText(v, n) {
    var s = String(v === null || v === undefined ? '' : v).replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, Math.max(1, n - 1)).trim() + '…' : s;
  }

  function clampNum(v, lo, hi) {
    var n = Number(v);
    if (!isFinite(n)) return lo;
    return Math.min(hi, Math.max(lo, n));
  }

  function clone(v) {
    return v === null || v === undefined ? v : JSON.parse(JSON.stringify(v));
  }

  var ID_CHARS = 'abcdefghijkmnpqrstuvwxyz23456789';
  function uid(prefix) {
    var s = '';
    for (var i = 0; i < 6; i++) s += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
    return (prefix || 'b') + '_' + s;
  }

  function safeId(v, prefix) {
    var s = String(v === null || v === undefined ? '' : v).trim();
    if (/^[a-z]{1,3}_[a-z0-9]{4,12}$/.test(s)) return s;
    return uid(prefix);
  }

  /** http(s)·mailto·sms·tel 만 통과. 스킴이 없으면 https:// 를 붙인다. */
  function normalizeHref(raw, opts) {
    opts = opts || {};
    var s = String(raw === null || raw === undefined ? '' : raw).trim();
    if (!s) return '';
    if (/^(javascript|data|vbscript|file|blob):/i.test(s)) return '';
    var allowed = opts.allowed || ['http:', 'https:', 'mailto:', 'sms:', 'tel:'];
    var hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s);
    if (!hasScheme) {
      if (opts.requireScheme) return '';
      s = 'https://' + s.replace(/^\/+/, '');
    }
    try {
      var u = new URL(s);
      if (allowed.indexOf(u.protocol) < 0) return '';
      if ((u.protocol === 'http:' || u.protocol === 'https:') && !u.hostname) return '';
      return u.protocol === 'mailto:' || u.protocol === 'sms:' || u.protocol === 'tel:' ? s : u.href;
    } catch (e) {
      return '';
    }
  }

  function hrefIsSafe(v) {
    return /^(https?:\/\/|mailto:|sms:|tel:)/i.test(String(v || ''));
  }

  /** 내보낼 파일에 넣어도 되는 이미지 data URI만 통과(외부 요청 0건 유지). */
  function normalizeImage(v, maxBytes) {
    var s = String(v === null || v === undefined ? '' : v).trim();
    if (!s) return '';
    if (!/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(s)) return '';
    if (maxBytes && s.length > maxBytes) return '';
    return s.replace(/\s+/g, '');
  }

  function isHex(v) { return isStr(v) && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim()); }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /** 'YYYY-MM-DDTHH:mm' 로컬 시각 → Date (없거나 틀리면 null) */
  function parseLocalDateTime(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(v === null || v === undefined ? '' : v).trim());
    if (!m) return null;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), 0, 0);
    if (isNaN(d.getTime())) return null;
    if (d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[3])) return null;
    return d;
  }

  function toLocalInput(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function fmtMD(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function firstChar(v) {
    var s = String(v || '').trim();
    return s ? Array.from(s)[0] : '·';
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }

  /* ==========================================================
     1. 상수
     ========================================================== */

  var LIMITS = {
    name: 30, handle: 24, tagline: 70, pageTitle: 60, pageDesc: 140,
    linkTitle: 42, linkSub: 64, badge: 10, copyText: 400, url: 500,
    links: 20, footer: 80, formTitle: 34, formNote: 120,
    inqName: 40, inqContact: 60, inqMessage: 800,
    avatarBytes: 700000, thumbBytes: 500000
  };

  /** SNS 아이콘: 외부 아이콘 폰트 없이 SVG path를 직접 넣는다. */
  var SOCIALS = [
    {
      id: 'threads', label: '스레드', placeholder: 'https://www.threads.com/@내아이디',
      svg: '<path d="M12.3 21c-4.9 0-7.8-3-7.8-9s2.9-9 7.8-9c3.7 0 6.1 1.8 7 4.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.9 12.6c0-1.9 1.4-3.2 3.5-3.2 2.3 0 3.7 1.4 3.7 3.9 0 2.6-1.5 4.2-3.6 4.2-1.4 0-2.3-.8-2.3-1.9 0-1.2 1.1-2 2.7-2 2.1 0 3.6 1.1 4.4 2.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
    },
    {
      id: 'instagram', label: '인스타그램', placeholder: 'https://www.instagram.com/내아이디',
      svg: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="16.9" cy="7.1" r="1.15" fill="currentColor"/>'
    },
    {
      id: 'youtube', label: '유튜브', placeholder: 'https://www.youtube.com/@내채널',
      svg: '<rect x="2.6" y="5.4" width="18.8" height="13.2" rx="4.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10.4 9.4l4.6 2.6-4.6 2.6z" fill="currentColor"/>'
    },
    {
      id: 'blog', label: '블로그', placeholder: 'https://blog.naver.com/내아이디',
      svg: '<path d="M5.4 3.8h9l4.2 4.2v12.2H5.4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M14.2 3.9v4.3h4.3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.6 12.2h6.8M8.6 15.4h4.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
    },
    {
      id: 'kakao', label: '카카오톡', placeholder: 'https://open.kakao.com/o/내방',
      svg: '<path d="M12 4.2c-4.4 0-7.9 2.8-7.9 6.3 0 2.2 1.4 4.2 3.6 5.4l-.8 3.1 3.4-2c.5.1 1.1.1 1.7.1 4.4 0 7.9-2.8 7.9-6.3S16.4 4.2 12 4.2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'
    }
  ];

  var SOCIAL_INDEX = (function () {
    var m = {};
    SOCIALS.forEach(function (s) { m[s.id] = s; });
    return m;
  })();

  var BADGE_PRESETS = ['NEW', 'HOT', '마감 임박', 'OPEN', '한정'];

  var BUDGET_OPTIONS = ['~50만 원', '50~150만 원', '150~300만 원', '300만 원 이상', '아직 미정'];
  var TYPE_OPTIONS = ['제작 문의', '협업·제휴', '강의·클래스', '기타'];

  var AVATAR_SHAPES = [
    { id: 'circle', label: '원형' },
    { id: 'round', label: '둥근 사각' },
    { id: 'arch', label: '아치' }
  ];

  var FORM_MODES = [
    { id: 'builtin', label: '내장 빠른 문의', desc: '이름·연락처·내용을 받아 보낼 문구를 만들어 줍니다.' },
    { id: 'link', label: '구글폼·노션폼', desc: '이미 만든 폼 주소로 보냅니다.' },
    { id: 'kakao', label: '카카오 오픈채팅', desc: '오픈채팅방으로 바로 보냅니다.' },
    { id: 'mail', label: '메일(mailto)', desc: '작성한 내용을 메일 앱으로 넘깁니다.' }
  ];

  var PRESET_IDS = ['swiss-magazine', 'cream-editorial', 'minimal-luxury', 'bento-saas', 'commerce-clean', 'vivid-pop', 'dark-neon', 'neo-brutalism'];

  var FMIX = DR.listFontMixes();
  var GRAINS = DR.listGrains();

  /* ==========================================================
     2. 기본 상태 · 정규화
     ========================================================== */

  var DEMO_TITLE = '한서연 · 브랜드 디자이너';
  var DEMO_DESCRIPTION = '로고·패키지·편집 디자인. 11월 신규 프로젝트 두 건만 받습니다.';
  var AUTO_TITLES = ['내 링크 페이지', '내 이름 링크', '내 링크'];

  /** 이름만 넣었을 때 쓰는 기본 페이지 제목. 내보낸 HTML의 <title>도 이 값을 쓴다. */
  function autoTitle(name) {
    var n = String(name || '').trim();
    return (n && n !== '내 이름' ? n : '내') + ' 링크';
  }

  /** 사용자가 직접 쓴 제목과, 이름을 따라 바뀌어야 하는 제목을 구분한다. */
  function isAutoTitle(title, name) {
    var t = String(title || '').trim();
    if (!t) return true;
    if (AUTO_TITLES.indexOf(t) !== -1) return true;
    if (name && (t === name || t === autoTitle(name))) return true;
    if (name && name !== '한서연' && t === DEMO_TITLE) return true;
    return false;
  }

  /**
   * 이름을 바꾸면 페이지 제목도 따라 바꾼다.
   *  - 비어 있거나 기본값이면 새 이름 + ' 링크'
   *  - '이름 · 직함'처럼 옛 이름으로 시작하면 이름 부분만 교체
   *  - 그 밖에 직접 쓴 제목은 그대로 둔다
   */
  function retitleForName(title, oldName, newName) {
    var current = String(title == null ? '' : title);
    var next = String(newName || '').trim();
    if (!next || next === '내 이름') return current;
    if (isAutoTitle(current, oldName)) return cut(autoTitle(next), LIMITS.pageTitle);
    var from = String(oldName || '').trim();
    if (from && from !== next && current.indexOf(from) === 0) {
      return cut(next + current.slice(from.length), LIMITS.pageTitle);
    }
    return current;
  }

  function defaultState() {
    return {
      v: 1,
      meta: { title: '내 링크 페이지', description: '', footer: '', credit: false },
      profile: { name: '내 이름', handle: '', tagline: '', avatar: '', avatarShape: 'circle' },
      socials: [],
      blocks: [],
      form: {
        enabled: false, mode: 'builtin',
        title: '1분 견적 · 협업 문의', note: '아래에 적어 주시면 보낼 문구를 만들어 드려요.',
        url: '', email: '', kakao: '', phone: '',
        fields: { type: true, budget: true }
      },
      design: { preset: 'cream-editorial', fontMix: 'myeongjo-title', grain: 'paper-3', accent: '', radius: null },
      brandKit: null
    };
  }

  function makeLink(patch) {
    var p = patch || {};
    return {
      id: safeId(p.id, 'b'),
      kind: 'link',
      title: cut(p.title, LIMITS.linkTitle),
      subtitle: cut(p.subtitle, LIMITS.linkSub),
      url: normalizeHref(p.url),
      thumb: normalizeImage(p.thumb, LIMITS.thumbBytes),
      badge: cut(p.badge, LIMITS.badge),
      featured: !!p.featured,
      mode: p.mode === 'copy' ? 'copy' : 'link',
      copyText: cut(p.copyText, LIMITS.copyText),
      schedule: {
        from: parseLocalDateTime(p.schedule && p.schedule.from) ? p.schedule.from : '',
        to: parseLocalDateTime(p.schedule && p.schedule.to) ? p.schedule.to : ''
      }
    };
  }

  function normalizeState(raw) {
    var s = defaultState();
    if (!raw || typeof raw !== 'object') return s;

    var meta = raw.meta || {};
    s.meta.title = cut(meta.title, LIMITS.pageTitle) || s.meta.title;
    s.meta.description = cut(meta.description, LIMITS.pageDesc);
    s.meta.footer = cut(meta.footer, LIMITS.footer);
    s.meta.credit = !!meta.credit;

    var pr = raw.profile || {};
    s.profile.name = cut(pr.name, LIMITS.name) || '내 이름';
    s.profile.handle = cut(pr.handle, LIMITS.handle).replace(/^@+/, '');
    s.profile.tagline = cut(pr.tagline, LIMITS.tagline);
    s.profile.avatar = normalizeImage(pr.avatar, LIMITS.avatarBytes);
    s.profile.avatarShape = AVATAR_SHAPES.some(function (x) { return x.id === pr.avatarShape; }) ? pr.avatarShape : 'circle';

    var socialSeen = {};
    (Array.isArray(raw.socials) ? raw.socials : []).forEach(function (item) {
      if (!item || !SOCIAL_INDEX[item.type] || socialSeen[item.type]) return;
      var url = normalizeHref(item.url);
      if (!url) return;
      socialSeen[item.type] = true;
      s.socials.push({ type: item.type, url: url });
    });
    var socialOrder = SOCIALS.map(function (x) { return x.id; });
    s.socials.sort(function (a, b) { return socialOrder.indexOf(a.type) - socialOrder.indexOf(b.type); });

    var form = raw.form || {};
    s.form.enabled = !!form.enabled;
    s.form.mode = FORM_MODES.some(function (m) { return m.id === form.mode; }) ? form.mode : 'builtin';
    s.form.title = cut(form.title, LIMITS.formTitle) || s.form.title;
    s.form.note = cut(form.note, LIMITS.formNote);
    s.form.url = normalizeHref(form.url);
    s.form.email = /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(String(form.email || '').trim()) ? String(form.email).trim() : '';
    s.form.kakao = normalizeHref(form.kakao);
    s.form.phone = String(form.phone || '').replace(/[^\d+]/g, '').slice(0, 20);
    s.form.fields = {
      type: !(form.fields && form.fields.type === false),
      budget: !(form.fields && form.fields.budget === false)
    };

    var seenIds = {};
    var formBlockAdded = false;
    (Array.isArray(raw.blocks) ? raw.blocks : []).forEach(function (b) {
      if (!b || typeof b !== 'object') return;
      if (b.kind === 'form') {
        if (!s.form.enabled || formBlockAdded) return;
        formBlockAdded = true;
        s.blocks.push({ id: safeId(b.id, 'f'), kind: 'form' });
        return;
      }
      var linkCount = s.blocks.filter(function (x) { return x.kind === 'link'; }).length;
      if (linkCount >= LIMITS.links) return;
      var l = makeLink(b);
      if (!l.title && !l.url) return;
      if (!l.title) l.title = hostOf(l.url) || '링크';
      if (l.mode === 'copy' && !l.copyText) l.mode = 'link';
      while (seenIds[l.id]) l.id = uid('b');
      seenIds[l.id] = true;
      s.blocks.push(l);
    });
    if (s.form.enabled && !formBlockAdded) s.blocks.push({ id: uid('f'), kind: 'form' });

    var d = raw.design || {};
    s.design.preset = PRESET_IDS.indexOf(d.preset) >= 0 ? d.preset : s.design.preset;
    s.design.fontMix = FMIX.some(function (m) { return m.id === d.fontMix; }) ? d.fontMix : s.design.fontMix;
    s.design.grain = GRAINS.some(function (g) { return g.id === d.grain; }) ? d.grain : s.design.grain;
    s.design.accent = isHex(d.accent) ? String(d.accent).trim() : '';
    s.design.radius = d.radius === null || d.radius === undefined || d.radius === '' ? null : Math.round(clampNum(d.radius, 0, 28));

    if (raw.brandKit) {
      var parsed = DR.parseBrandKit(raw.brandKit);
      s.brandKit = parsed.ok ? parsed.kit : null;
    }
    return s;
  }

  /* ==========================================================
     3. 상태 조작 (전부 새 상태를 돌려준다)
     ========================================================== */

  function addLink(state, patch) {
    var s = clone(state);
    var count = s.blocks.filter(function (b) { return b.kind === 'link'; }).length;
    if (count >= LIMITS.links) return normalizeState(s);
    var l = makeLink(patch || {});
    if (!l.title) l.title = '새 링크';
    if (count === 0) l.featured = true;
    s.blocks.push(l);
    return normalizeState(s);
  }

  function updateBlock(state, id, patch) {
    var s = clone(state);
    s.blocks = s.blocks.map(function (b) {
      if (b.id !== id) return b;
      if (b.kind === 'form') return b;
      return Object.assign({}, b, makeLink(Object.assign({}, b, patch, { id: b.id })));
    });
    return normalizeState(s);
  }

  function removeBlock(state, id) {
    var s = clone(state);
    s.blocks = s.blocks.filter(function (b) { return b.id !== id; });
    return normalizeState(s);
  }

  function duplicateBlock(state, id) {
    var s = clone(state);
    var i = s.blocks.findIndex(function (b) { return b.id === id; });
    if (i < 0 || s.blocks[i].kind !== 'link') return normalizeState(s);
    var copy = clone(s.blocks[i]);
    copy.id = uid('b');
    copy.featured = false;
    s.blocks.splice(i + 1, 0, copy);
    return normalizeState(s);
  }

  function moveBlock(state, id, delta) {
    var s = clone(state);
    var i = s.blocks.findIndex(function (b) { return b.id === id; });
    if (i < 0) return normalizeState(s);
    var j = clampNum(i + delta, 0, s.blocks.length - 1);
    if (i === j) return normalizeState(s);
    var item = s.blocks.splice(i, 1)[0];
    s.blocks.splice(j, 0, item);
    return normalizeState(s);
  }

  /** 드래그: 드래그한 블록을 targetId 앞/뒤로 옮긴다. */
  function moveBlockTo(state, id, targetId, after) {
    var s = clone(state);
    var from = s.blocks.findIndex(function (b) { return b.id === id; });
    if (from < 0) return normalizeState(s);
    var item = s.blocks.splice(from, 1)[0];
    var to = s.blocks.findIndex(function (b) { return b.id === targetId; });
    if (to < 0) { s.blocks.splice(from, 0, item); return normalizeState(s); }
    s.blocks.splice(after ? to + 1 : to, 0, item);
    return normalizeState(s);
  }

  /** ids 순서대로 재배열(없는 id는 무시, 빠진 블록은 뒤에 붙인다). */
  function reorderBlocks(state, ids) {
    var s = clone(state);
    var order = Array.isArray(ids) ? ids : [];
    var map = {};
    s.blocks.forEach(function (b) { map[b.id] = b; });
    var out = [];
    order.forEach(function (id) { if (map[id]) { out.push(map[id]); delete map[id]; } });
    s.blocks.forEach(function (b) { if (map[b.id]) out.push(b); });
    s.blocks = out;
    return normalizeState(s);
  }

  function setFormEnabled(state, on) {
    var s = clone(state);
    s.form.enabled = !!on;
    var hasBlock = s.blocks.some(function (b) { return b.kind === 'form'; });
    if (s.form.enabled && !hasBlock) s.blocks.push({ id: uid('f'), kind: 'form' });
    if (!s.form.enabled) s.blocks = s.blocks.filter(function (b) { return b.kind !== 'form'; });
    return normalizeState(s);
  }

  function updateForm(state, patch) {
    var s = clone(state);
    s.form = Object.assign({}, s.form, patch || {});
    if (patch && patch.fields) s.form.fields = Object.assign({}, s.form.fields, patch.fields);
    return normalizeState(s);
  }

  function updateProfile(state, patch) {
    var s = clone(state);
    var before = s.profile.name;
    s.profile = Object.assign({}, s.profile, patch || {});
    if (patch && Object.prototype.hasOwnProperty.call(patch, 'name') && patch.name !== before) {
      s.meta = Object.assign({}, s.meta, { title: retitleForName(s.meta.title, before, patch.name) });
    }
    return normalizeState(s);
  }

  function updateMeta(state, patch) {
    var s = clone(state);
    s.meta = Object.assign({}, s.meta, patch || {});
    return normalizeState(s);
  }

  function updateSocial(state, type, url) {
    var s = clone(state);
    s.socials = s.socials.filter(function (x) { return x.type !== type; });
    var href = normalizeHref(url);
    if (href && SOCIAL_INDEX[type]) s.socials.push({ type: type, url: href });
    return normalizeState(s);
  }

  function updateDesign(state, patch) {
    var s = clone(state);
    s.design = Object.assign({}, s.design, patch || {});
    return normalizeState(s);
  }

  /* ==========================================================
     4. 예약 게시
     ========================================================== */

  /** 화면(내보낸 페이지)에서도 쓰는 함수라 바깥 변수를 참조하지 않는다. */
  function isLiveClient(from, to, nowMs) {
    if (!from && !to) return true;
    var f = from ? new Date(from).getTime() : null;
    var t = to ? new Date(to).getTime() : null;
    if (f !== null && !isNaN(f) && nowMs < f) return false;
    if (t !== null && !isNaN(t) && nowMs >= t) return false;
    return true;
  }

  function isBlockLive(block, now) {
    if (!block || !block.schedule) return true;
    var t = now instanceof Date ? now : new Date(now === undefined ? Date.now() : now);
    return isLiveClient(block.schedule.from, block.schedule.to, t.getTime());
  }

  /** 'live' | 'scheduled' | 'ended' | 'always' */
  function scheduleStatus(block, now) {
    var sc = (block && block.schedule) || {};
    if (!sc.from && !sc.to) return 'always';
    var t = (now instanceof Date ? now : new Date(now === undefined ? Date.now() : now)).getTime();
    if (isLiveClient(sc.from, sc.to, t)) return 'live';
    var f = sc.from ? new Date(sc.from).getTime() : null;
    return f !== null && t < f ? 'scheduled' : 'ended';
  }

  function scheduleLabel(block) {
    var sc = (block && block.schedule) || {};
    if (!sc.from && !sc.to) return '';
    var f = parseLocalDateTime(sc.from), t = parseLocalDateTime(sc.to);
    if (f && t) return fmtMD(f) + ' ~ ' + fmtMD(t);
    if (f) return fmtMD(f) + ' 공개';
    if (t) return fmtMD(t) + ' 까지';
    return '';
  }

  /* ==========================================================
     5. 문의 문구
     ========================================================== */

  /**
   * 문의 문구 조합. 내보낸 페이지에도 같은 함수 본문(toString)이 들어가므로
   * 이 함수는 바깥 스코프를 참조하지 않는다.
   * cfg: { page, title, email, mode, fields:{type,budget} }
   * vals: { name, contact, message, type, budget }
   */
  function inquiryClient(cfg, vals) {
    cfg = cfg || {};
    vals = vals || {};
    function s(v, n) {
      var x = String(v === null || v === undefined ? '' : v).replace(/\s+/g, ' ').trim();
      return n && x.length > n ? x.slice(0, n) : x;
    }
    function enc(v) { return encodeURIComponent(v); }
    var errors = [];
    var name = s(vals.name, 40);
    var contact = s(vals.contact, 60);
    var message = String(vals.message === null || vals.message === undefined ? '' : vals.message).replace(/[ \t]+\n/g, '\n').trim().slice(0, 800);
    if (!name) errors.push({ field: 'name', msg: '이름을 적어 주세요.' });
    if (!contact) errors.push({ field: 'contact', msg: '연락처(전화·메일·카톡 아이디)를 적어 주세요.' });
    else if (contact.length < 4) errors.push({ field: 'contact', msg: '연락처가 너무 짧습니다.' });
    if (!message) errors.push({ field: 'message', msg: '문의 내용을 적어 주세요.' });
    else if (message.length < 5) errors.push({ field: 'message', msg: '문의 내용을 조금 더 적어 주세요.' });

    /* 개인정보보호법 제15조: 수집·이용 동의 없이는 제출할 수 없다. */
    var rawConsent = vals.consent;
    var consentText = String(rawConsent === undefined || rawConsent === null ? '' : rawConsent).trim();
    var agreed = rawConsent === true || /^(on|true|1|yes|y|agree|checked|동의|동의함)$/i.test(consentText);
    if (!agreed) errors.push({ field: 'consent', msg: '개인정보 수집·이용에 동의해야 문의를 보낼 수 있습니다.' });

    var page = s(cfg.page, 40) || '문의';
    var kind = cfg.fields && cfg.fields.type ? s(vals.type, 20) : '';
    var budget = cfg.fields && cfg.fields.budget ? s(vals.budget, 20) : '';

    var lines = ['[문의] ' + page];
    lines.push('');
    lines.push('이름: ' + name);
    lines.push('연락처: ' + contact);
    if (kind) lines.push('문의 종류: ' + kind);
    if (budget) lines.push('예산: ' + budget);
    lines.push('문의 내용:');
    lines.push(message);
    lines.push('');
    lines.push('— ' + page + ' 링크 페이지에서 보냄');

    var subject = '[문의] ' + name + ' · ' + page;
    var text = lines.join('\n');
    var mailto = cfg.email ? 'mailto:' + cfg.email + '?subject=' + enc(subject) + '&body=' + enc(text) : '';
    var phone = String(cfg.phone || '').replace(/[^\d+]/g, '');
    var sms = phone ? 'sms:' + phone + '?&body=' + enc(text) : '';
    return { ok: errors.length === 0, errors: errors, subject: subject, text: text, mailto: mailto, sms: sms, name: name, contact: contact, message: message };
  }

  function formCfg(state) {
    return {
      page: state.profile.name,
      title: state.form.title,
      email: state.form.email,
      phone: state.form.phone,
      kakao: state.form.kakao,
      mode: state.form.mode,
      fields: state.form.fields
    };
  }

  function composeInquiry(state, vals) {
    return inquiryClient(formCfg(state), vals || {});
  }

  /* ==========================================================
     6. 디자인 (엔진 v2)
     ========================================================== */

  var SYS_STACKS = {
    sans: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif",
    serif: "'Nanum Myeongjo', 'Noto Serif KR', 'AppleMyungjo', 'Batang', Georgia, 'Times New Roman', serif",
    mono: "ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace",
    rounded: "'SF Pro Rounded', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"
  };

  function presetList() {
    return PRESET_IDS.map(function (id) {
      var p = DR.get(id);
      var tk = DR.tokens(p);
      return {
        id: p.id, name: p.name, nameEn: p.nameEn, tagline: p.tagline,
        keywords: (p.keywords || []).slice(0, 3),
        palette: clone(p.palette), radius: p.layout.radius, border: p.layout.border,
        mood: (p.moods || []).slice(0, 3),
        contrast: tk.a11y.allPass
      };
    });
  }

  function fontMixList() {
    return FMIX.map(function (m) {
      return { id: m.id, name: m.name, note: m.note, title: clone(m.title), body: clone(m.body) };
    });
  }

  function grainList() {
    return GRAINS.map(function (g) { return { id: g.id, name: g.name, amount: g.amount, note: g.note }; });
  }

  /**
   * 현재 디자인 → 엔진 결과. 브랜드 키트가 있으면 키트가 이긴다.
   * 포인트 색·모서리만 바꾼 경우에도 serializeBrandKit을 거쳐
   * 대비(WCAG)가 보정된 팔레트를 쓴다.
   */
  function designOf(state) {
    var d = state.design || {};
    var grain = d.grain;
    var fontMix = d.fontMix;
    var base = { presetId: d.preset, fontMix: fontMix, grain: grain };
    if (state.brandKit) {
      var parsed = DR.parseBrandKit(state.brandKit);
      if (parsed.ok) {
        var r = DR.applyBrandKit(parsed.kit);
        if (r.ok) {
          return {
            ok: true, tokens: r.tokens, preset: r.preset, kit: r.kit, presetId: r.kit.base.presetId,
            name: r.kit.name, fontMix: r.kit.type.fontMix, grain: r.kit.grain,
            radius: r.kit.shape.radius, border: r.kit.shape.border,
            contrast: r.tokens.a11y.contrast, allPass: r.tokens.a11y.allPass,
            warnings: r.warnings.filter(function (w) { return w.indexOf('구조는') !== 0; })
          };
        }
      }
    }
    var patched = false;
    var opts = { fontMix: fontMix, grain: grain };
    if (isHex(d.accent)) { opts.palette = { accent: d.accent }; patched = true; }
    if (d.radius !== null && d.radius !== undefined) { opts.radius = d.radius; patched = true; }
    if (patched) {
      var kit = DR.serializeBrandKit(d.preset, opts);
      var res = DR.applyBrandKit(kit);
      if (res.ok) {
        return {
          ok: true, tokens: res.tokens, preset: res.preset, kit: kit, presetId: d.preset,
          name: (DR.get(d.preset).name + ' · 브랜드 색'), fontMix: kit.type.fontMix, grain: kit.grain,
          radius: kit.shape.radius, border: kit.shape.border,
          contrast: res.tokens.a11y.contrast, allPass: res.tokens.a11y.allPass, warnings: []
        };
      }
    }
    var out = DR.applyDesignRef(d.preset, {}, {});
    return {
      ok: true, tokens: out.tokens, preset: out.preset, kit: null, presetId: d.preset,
      name: out.name, fontMix: fontMix, grain: { id: d.grain, amount: DR.grainAmount(d.grain) },
      radius: d.radius === null || d.radius === undefined ? out.tokens.shape.radius : d.radius,
      border: out.tokens.shape.border,
      contrast: out.tokens.a11y.contrast, allPass: out.tokens.a11y.allPass, warnings: out.warnings || []
    };
  }

  /** 폰 화면에 맞춘 글자 크기. 프리셋의 모듈러 비율을 유지한다. */
  function phoneScale(tokens) {
    var base = Number(tokens.type.base) || 16;
    var r = Number(tokens.type.ratio) || 1.25;
    function step(n) { return base * Math.pow(r, n); }
    return {
      name: Math.round(clampNum(step(2.3), 24, 34)),
      formTitle: Math.round(clampNum(step(1.1), 17, 24)),
      cardTitle: Math.round(clampNum(step(0.85), 15, 17)),
      cardSub: Math.round(clampNum(step(-0.55), 12, 15)),
      body: Math.round(clampNum(step(0), 14, 17)),
      micro: Math.round(clampNum(step(-1.9), 10, 12)),
      badge: Math.round(clampNum(step(-1.5), 10, 12))
    };
  }

  function fontOf(mixId, tokens) {
    var m, stacks;
    try { m = DR.fontMix(mixId); stacks = DR.fontMixStacks(mixId); } catch (e) { m = null; }
    var titleFamily = m ? m.title.family : (tokens.type.family.display || 'sans');
    var bodyFamily = m ? m.body.family : (tokens.type.family.body || 'sans');
    return {
      titleStack: SYS_STACKS[titleFamily] || SYS_STACKS.sans,
      bodyStack: SYS_STACKS[bodyFamily] || SYS_STACKS.sans,
      titleWeight: m ? m.title.weight : tokens.type.roles.display.weight,
      bodyWeight: m ? m.body.weight : tokens.type.roles.body.weight,
      titleTracking: m ? m.title.tracking : tokens.type.roles.display.tracking,
      titleLh: m ? m.title.lineHeight : tokens.type.roles.display.lineHeight,
      bodyLh: m ? m.body.lineHeight : tokens.type.roles.body.lineHeight,
      bodyTracking: m ? m.body.tracking : tokens.type.roles.body.tracking
    };
  }

  function grainOf(grainId) {
    var g = DR.normalizeGrain(grainId);
    var amount = g.amount || 0;
    var freq = 0.75;
    try { freq = DR.grainPreset(g.id).freq || 0.75; } catch (e) { freq = 0.75; }
    return {
      id: g.id, amount: amount,
      uri: amount > 0 ? DR.grainSVGDataUri({ freq: freq, size: 120, seed: 7 }) : '',
      opacity: Math.round(clampNum(amount * 2.4, 0.02, 0.16) * 1000) / 1000
    };
  }

  function luminanceOf(hex) {
    try { return DR.color.relativeLuminance(hex); } catch (e) { return 0.8; }
  }

  /** 프리셋별 시그니처 한 스푼 (색·구조는 토큰이 이미 정한다). */
  var PRESET_FLAVOR = {
    'swiss-magazine':
      '.lh-head{text-align:left;align-items:flex-start;border-bottom:2px solid var(--lh-ink);padding-bottom:22px}\n' +
      '.lh-social{justify-content:flex-start}\n' +
      '.lh-kicker{letter-spacing:.18em}\n' +
      '.lh-form-title{border-bottom:1px solid var(--lh-line);padding-bottom:8px}',
    'cream-editorial':
      '.lh-name{font-weight:var(--lh-title-weight)}\n' +
      '.lh-tagline{font-size:var(--lh-card-sub);letter-spacing:.01em}\n' +
      '.lh-card{box-shadow:none}\n' +
      '.lh-form{border-style:solid;box-shadow:none}',
    'minimal-luxury':
      '.lh-head{gap:4px;padding-top:8px}\n' +
      '.lh-name{font-weight:400;letter-spacing:.07em}\n' +
      '.lh-handle{letter-spacing:.3em;text-transform:none}\n' +
      '.lh-card{border-color:transparent;border-bottom:1px solid var(--lh-line);border-radius:0;background:transparent;box-shadow:none;padding-left:2px;padding-right:2px}\n' +
      '.lh-card--feature{background:transparent;color:var(--lh-ink);border-bottom:2px solid var(--lh-accent)}\n' +
      '.lh-card--feature .lh-sub{color:var(--lh-sub)}\n' +
      '.lh-card--feature .lh-kicker,.lh-card--feature .lh-go{color:var(--lh-accent)}\n' +
      '.lh-form{background:transparent;box-shadow:none;border-radius:0}',
    'bento-saas':
      '.lh-card{border-color:transparent}\n' +
      '.lh-thumb{border-radius:calc(var(--lh-radius) * 0.8)}',
    'vivid-pop':
      '.lh-card{border-color:transparent}\n' +
      '.lh-name{letter-spacing:-.035em}',
    'dark-neon':
      '.lh-card--feature{box-shadow:0 0 0 1px var(--lh-accent),0 0 30px -10px var(--lh-accent)}\n' +
      '.lh-avatar{box-shadow:0 0 0 1px var(--lh-accent),0 0 34px -12px var(--lh-accent)}\n' +
      '.lh-submit{box-shadow:0 0 24px -8px var(--lh-accent)}',
    'neo-brutalism':
      '.lh-card{box-shadow:4px 4px 0 var(--lh-ink)}\n' +
      '.lh-card--feature{box-shadow:4px 4px 0 var(--lh-ink)}\n' +
      '.lh-submit{box-shadow:3px 3px 0 var(--lh-ink)}',
    'commerce-clean':
      '.lh-kicker{color:var(--lh-sub)}'
  };

  function buildCSS(state, d, scale) {
    var tk = d.tokens;
    var f = fontOf(d.fontMix, tk);
    var p = tk.color;
    var dark = luminanceOf(p.bg) < 0.35;
    var grain = grainOf(d.grain.id || d.grain);
    var pad = Math.round(clampNum(tk.space.margin * 0.46, 18, 30));
    var gap = Math.round(clampNum(tk.space.sectionGap * 0.42, 14, 26));
    var cardPad = tk.shape.density === 'high' ? '12px 14px' : (tk.shape.density === 'low' ? '18px 20px' : '15px 16px');
    var danger = dark ? '#FF9C8E' : '#B42318';
    var flavor = PRESET_FLAVOR[d.presetId] || '';

    var rules = [];
    rules.push(':root{');
    rules.push('--lh-bg:' + p.bg + ';--lh-surface:' + p.surface + ';--lh-ink:' + p.ink + ';--lh-sub:' + p.sub + ';--lh-line:' + p.line + ';');
    rules.push('--lh-accent:' + p.accent + ';--lh-accent-ink:' + p.accentInk + ';--lh-accent-soft:' + p.accentSoft + ';');
    rules.push('--lh-radius:' + Math.round(d.radius) + 'px;--lh-border:' + Math.round(d.border) + 'px;--lh-shadow:' + (tk.shape.shadow || 'none') + ';');
    rules.push('--lh-pad:' + pad + 'px;--lh-gap:' + gap + 'px;--lh-card-pad:' + cardPad + ';');
    rules.push('--lh-title-font:' + f.titleStack + ';--lh-body-font:' + f.bodyStack + ';');
    rules.push('--lh-title-weight:' + f.titleWeight + ';--lh-body-weight:' + f.bodyWeight + ';');
    rules.push('--lh-title-tracking:' + f.titleTracking + ';--lh-title-lh:' + f.titleLh + ';--lh-body-lh:' + f.bodyLh + ';--lh-body-tracking:' + f.bodyTracking + ';');
    rules.push('--lh-name-size:' + scale.name + 'px;--lh-form-title:' + scale.formTitle + 'px;--lh-card-title:' + scale.cardTitle + 'px;');
    rules.push('--lh-card-sub:' + scale.cardSub + 'px;--lh-body:' + scale.body + 'px;--lh-micro:' + scale.micro + 'px;--lh-badge:' + scale.badge + 'px;');
    rules.push('--lh-danger:' + danger + ';');
    rules.push('}');

    rules.push('*,*::before,*::after{box-sizing:border-box}');
    rules.push('html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}');
    rules.push('body{margin:0;background:var(--lh-bg);color:var(--lh-ink);font-family:var(--lh-body-font);font-size:var(--lh-body);line-height:var(--lh-body-lh);letter-spacing:var(--lh-body-tracking);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}');
    rules.push('[hidden]{display:none!important}');
    rules.push('img{max-width:100%}');
    rules.push('a{color:inherit}');
    rules.push('.lh{position:relative;z-index:1;width:100%;max-width:480px;margin:0 auto;padding:calc(var(--lh-pad) * 1.15) var(--lh-pad) calc(var(--lh-pad) * 1.6);min-height:100vh;min-height:100dvh;display:flex;flex-direction:column}');
    rules.push('.lh-grain{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:url("' + (grain.uri || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=') + '");background-repeat:repeat;opacity:' + (grain.amount > 0 ? grain.opacity : 0) + ';mix-blend-mode:' + (dark ? 'screen' : 'multiply') + '}');
    rules.push('.lh-head{display:flex;flex-direction:column;align-items:center;text-align:center;gap:7px}');
    rules.push('.lh-avatar{width:88px;height:88px;display:grid;place-items:center;overflow:hidden;background:var(--lh-accent-soft);color:var(--lh-accent);flex:0 0 auto;margin-bottom:4px}');
    rules.push('.lh-avatar--circle{border-radius:50%}');
    rules.push('.lh-avatar--round{border-radius:22px}');
    rules.push('.lh-avatar--arch{border-radius:44px 44px 12px 12px}');
    rules.push('.lh-avatar img{width:100%;height:100%;object-fit:cover;display:block}');
    rules.push('.lh-avatar-initial{font-family:var(--lh-title-font);font-size:34px;font-weight:var(--lh-title-weight);line-height:1}');
    rules.push('.lh-handle{margin:0;font-family:' + SYS_STACKS.mono + ';font-size:var(--lh-micro);letter-spacing:.12em;color:var(--lh-sub)}');
    rules.push('.lh-name{margin:0;font-family:var(--lh-title-font);font-size:var(--lh-name-size);font-weight:var(--lh-title-weight);line-height:var(--lh-title-lh);letter-spacing:var(--lh-title-tracking);word-break:keep-all}');
    rules.push('.lh-tagline{margin:2px 0 0;font-size:var(--lh-card-sub);line-height:1.55;color:var(--lh-sub);max-width:34ch;word-break:keep-all}');
    rules.push('.lh-social{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;list-style:none;margin:10px 0 0;padding:0}');
    rules.push('.lh-social a{width:40px;height:40px;display:grid;place-items:center;border-radius:999px;border:1px solid var(--lh-line);background:var(--lh-surface);color:var(--lh-ink);text-decoration:none;transition:border-color .16s,color .16s}');
    rules.push('.lh-social svg{width:20px;height:20px;display:block}');
    rules.push('.lh-blocks{display:flex;flex-direction:column;gap:var(--lh-gap);margin-top:calc(var(--lh-gap) + 6px)}');
    rules.push('.lh-card{display:flex;align-items:center;gap:13px;width:100%;padding:var(--lh-card-pad);border-radius:var(--lh-radius);border:var(--lh-border) solid var(--lh-line);background:var(--lh-surface);color:var(--lh-ink);text-align:left;text-decoration:none;box-shadow:var(--lh-shadow);font:inherit;cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}');
    rules.push('.lh-copywrap{display:flex;flex-direction:column;min-width:0;flex:1 1 auto}');
    rules.push('.lh-title{display:block;font-family:var(--lh-title-font);font-size:var(--lh-card-title);font-weight:600;line-height:1.34;letter-spacing:-.005em;word-break:keep-all;overflow-wrap:anywhere}');
    rules.push('.lh-sub{display:block;font-size:var(--lh-card-sub);line-height:1.45;color:var(--lh-sub);margin-top:3px;overflow-wrap:anywhere}');
    rules.push('.lh-thumb{width:48px;height:48px;flex:0 0 48px;overflow:hidden;border-radius:calc(var(--lh-radius) * .72);background:var(--lh-accent-soft);display:grid;place-items:center}');
    rules.push('.lh-thumb img{width:100%;height:100%;object-fit:cover;display:block}');
    rules.push('.lh-kicker{display:block;margin-bottom:2px;font-family:var(--lh-body-font);font-size:var(--lh-badge);font-weight:700;letter-spacing:.12em;line-height:1.3;color:var(--lh-accent);text-transform:uppercase}');
    rules.push('.lh-go{flex:0 0 auto;margin-left:auto;font-size:13px;color:var(--lh-sub);opacity:.9}');

    rules.push('.lh-card--feature{background:var(--lh-accent);border-color:var(--lh-accent);color:var(--lh-accent-ink)}');
    rules.push('.lh-card--feature .lh-sub{color:var(--lh-accent-ink);opacity:.86}');
    rules.push('.lh-card--feature .lh-kicker{color:var(--lh-accent-ink);opacity:.9}');
    rules.push('.lh-card--feature .lh-go{color:var(--lh-accent-ink)}');
    rules.push('.lh-card--feature .lh-thumb{background:rgba(255,255,255,.16)}');
    rules.push('.lh-card--copy .lh-go{font-size:15px}');
    rules.push('.lh-card--copy.is-done{border-color:var(--lh-accent)}');
    rules.push('.lh-empty{margin:0;padding:22px 18px;border:1px dashed var(--lh-line);border-radius:var(--lh-radius);color:var(--lh-sub);font-size:var(--lh-card-sub);text-align:center}');
    rules.push('.lh-form{margin:0;padding:18px;border-radius:calc(var(--lh-radius) + 4px);border:var(--lh-border) solid var(--lh-line);background:var(--lh-surface);box-shadow:var(--lh-shadow)}');
    rules.push('.lh-form-title{margin:0;font-family:var(--lh-title-font);font-size:var(--lh-form-title);font-weight:var(--lh-title-weight);line-height:1.3;letter-spacing:var(--lh-title-tracking)}');
    rules.push('.lh-form-note{margin:6px 0 14px;font-size:var(--lh-card-sub);line-height:1.5;color:var(--lh-sub);word-break:keep-all}');
    rules.push('.lh-field{display:block;margin:0 0 10px}');
    rules.push('.lh-field>span{display:block;margin-bottom:5px;font-size:var(--lh-micro);font-weight:600;letter-spacing:.04em;color:var(--lh-sub)}');
    rules.push('.lh-field input,.lh-field textarea,.lh-field select{display:block;width:100%;font:inherit;font-size:15px;line-height:1.45;color:var(--lh-ink);background:var(--lh-bg);border:1px solid var(--lh-line);border-radius:calc(var(--lh-radius) * .8);padding:11px 12px;-webkit-appearance:none;appearance:none}');
    rules.push('.lh-field input::placeholder,.lh-field textarea::placeholder{color:var(--lh-sub);opacity:.72}');
    rules.push('.lh-field textarea{min-height:84px;resize:vertical}');
    var chevron = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'>" +
      "<path d='M1 1.5 6 6.5 11 1.5' fill='none' stroke='" + p.sub + "' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/></svg>");
    rules.push('.lh-field select{background-image:url("' + chevron + '");background-repeat:no-repeat;background-position:right 12px center;background-size:11px;padding-right:34px}');
    rules.push('.lh-field.is-bad input,.lh-field.is-bad textarea{border-color:var(--lh-danger)}');
    rules.push('.lh-field--check{display:flex;align-items:flex-start;gap:8px;margin:2px 0 4px}');
    rules.push('.lh-field--check input{display:inline-block;width:15px;height:15px;flex:0 0 15px;margin:3px 0 0;padding:0;accent-color:var(--lh-accent);border-radius:3px}');
    rules.push('.lh-field--check>span{margin:0;font-size:var(--lh-micro);font-weight:500;letter-spacing:0;line-height:1.5;color:var(--lh-ink)}');
    rules.push('.lh-field--check em{font-style:normal;font-weight:700;color:var(--lh-danger)}');
    rules.push('.lh-field.is-bad.lh-field--check>span{color:var(--lh-danger)}');
    rules.push('.lh-consent-note{margin:0 0 12px;font-size:calc(var(--lh-micro) * .98);line-height:1.55;color:var(--lh-sub);word-break:keep-all}');
    rules.push('.lh-submit{display:block;width:100%;margin-top:4px;padding:13px 16px;border:0;border-radius:calc(var(--lh-radius) * .8);background:var(--lh-accent);color:var(--lh-accent-ink);font-family:var(--lh-title-font);font-size:15px;font-weight:700;letter-spacing:.01em;cursor:pointer;transition:filter .16s ease}');
    rules.push('.lh-form-err{margin:8px 0 0;font-size:var(--lh-micro);line-height:1.5;color:var(--lh-danger)}');
    rules.push('.lh-result{margin-top:12px;padding:14px;border:1px dashed var(--lh-line);border-radius:calc(var(--lh-radius) * .9);background:var(--lh-bg)}');
    rules.push('.lh-result p{margin:0}');
    rules.push('.lh-result-lead{font-size:var(--lh-card-sub);color:var(--lh-sub);line-height:1.5}');
    rules.push('.lh-result-text{margin:9px 0;padding:11px 12px;white-space:pre-wrap;word-break:break-word;font-family:var(--lh-body-font);font-size:13px;line-height:1.62;background:var(--lh-surface);border-radius:calc(var(--lh-radius) * .7);border:1px solid var(--lh-line)}');
    rules.push('.lh-result-actions{display:flex;flex-wrap:wrap;gap:7px}');
    rules.push('.lh-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:9px 13px;border-radius:calc(var(--lh-radius) * .7);border:1px solid var(--lh-line);background:var(--lh-surface);color:var(--lh-ink);font-family:inherit;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer}');
    rules.push('.lh-btn--main{background:var(--lh-accent);border-color:var(--lh-accent);color:var(--lh-accent-ink)}');
    rules.push('.lh-foot{margin-top:auto;padding-top:calc(var(--lh-gap) + 8px);text-align:center;font-size:var(--lh-micro);line-height:1.6;color:var(--lh-sub)}');
    rules.push('.lh-foot p{margin:2px 0}');
    rules.push('.lh-toast{position:fixed;left:50%;bottom:22px;z-index:40;max-width:calc(100% - 32px);padding:10px 16px;border-radius:999px;background:var(--lh-ink);color:var(--lh-bg);font-size:13px;line-height:1.4;text-align:center;opacity:0;transform:translate(-50%,14px);transition:opacity .18s ease,transform .18s ease;pointer-events:none}');
    rules.push('.lh-toast.is-on{opacity:1;transform:translate(-50%,0)}');
    rules.push('@media (hover:hover){.lh-card:hover{transform:translateY(-1px)}.lh-social a:hover{border-color:var(--lh-ink)}.lh-submit:hover{filter:brightness(1.05)}}');
    rules.push('@media (prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}}');
    rules.push(':focus-visible{outline:2px solid var(--lh-accent);outline-offset:2px}');
    if (flavor) rules.push(flavor);
    return rules.join('\n');
  }

  /* ==========================================================
     7. 브랜드 키트
     ========================================================== */

  function makeBrandKit(state, name) {
    var d = state.design;
    var opts = { name: name || (state.profile.name + ' 브랜드'), fontMix: d.fontMix, grain: d.grain };
    if (isHex(d.accent)) opts.palette = { accent: d.accent };
    if (d.radius !== null && d.radius !== undefined) opts.radius = d.radius;
    return DR.serializeBrandKit(d.preset, opts);
  }

  function kitSummary(kit) {
    var parsed = DR.parseBrandKit(kit);
    if (!parsed.ok) return { ok: false, errors: parsed.errors };
    var k = parsed.kit;
    return {
      ok: true, id: k.id, name: k.name, fingerprint: k.fingerprint, presetId: k.base.presetId,
      palette: clone(k.palette), radius: k.shape.radius, border: k.shape.border,
      grain: clone(k.grain), fontMix: k.type.fontMix, rules: k.rules.slice(), drift: parsed.drift
    };
  }

  function applyKit(state, kit) {
    var parsed = DR.parseBrandKit(kit);
    if (!parsed.ok) return { ok: false, errors: parsed.errors, state: state };
    var s = clone(state);
    s.brandKit = parsed.kit;
    return { ok: true, errors: [], state: normalizeState(s) };
  }

  function clearKit(state) {
    var s = clone(state);
    s.brandKit = null;
    return normalizeState(s);
  }

  /* ==========================================================
     8. HTML 렌더
     ========================================================== */

  function renderSocials(s) {
    if (!s.socials.length) return '';
    var items = s.socials.map(function (x) {
      var def = SOCIAL_INDEX[x.type];
      if (!def || !hrefIsSafe(x.url)) return '';
      return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(def.label) + '" title="' + esc(def.label) + '">'
        + '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + def.svg + '</svg></a></li>';
    }).join('');
    return items ? '<ul class="lh-social">' + items + '</ul>' : '';
  }

  function scheduleAttrs(block, now) {
    var sc = block.schedule || {};
    var attrs = '';
    if (sc.from) attrs += ' data-live-from="' + esc(sc.from) + '"';
    if (sc.to) attrs += ' data-live-to="' + esc(sc.to) + '"';
    if ((sc.from || sc.to) && !isBlockLive(block, now)) attrs += ' hidden';
    return attrs;
  }

  function renderLinkCard(block, now) {
    var live = scheduleAttrs(block, now);
    var thumb = block.thumb ? '<span class="lh-thumb"><img src="' + esc(block.thumb) + '" alt="" width="52" height="52" loading="lazy" decoding="async"></span>' : '';
    var badge = block.badge ? '<span class="lh-kicker">' + esc(block.badge) + '</span>' : '';
    var title = '<span class="lh-title">' + esc(block.title) + '</span>';
    var sub = block.subtitle ? '<span class="lh-sub">' + esc(block.subtitle) + '</span>' : '';
    var cls = 'lh-card' + (block.featured ? ' lh-card--feature' : '') + (block.mode === 'copy' ? ' lh-card--copy' : '');

    if (block.mode === 'copy') {
      var hint = block.subtitle ? esc(block.subtitle) : '눌러서 복사';
      return '<button type="button" class="' + cls + '" data-block="' + esc(block.id) + '" data-copy="' + esc(block.copyText) + '" data-copy-label="' + esc(block.title) + '"' + live + '>'
        + thumb + '<span class="lh-copywrap">' + badge + title + '<span class="lh-sub" data-copy-hint="1">' + hint + '</span></span>'
        + '<span class="lh-go" aria-hidden="true">⧉</span></button>';
    }
    var href = hrefIsSafe(block.url) ? block.url : '#';
    var go = '<span class="lh-go" aria-hidden="true">↗</span>';
    return '<a class="' + cls + '" data-block="' + esc(block.id) + '" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer"' + live + '>'
      + thumb + '<span class="lh-copywrap">' + badge + title + sub + '</span>' + go + '</a>';
  }

  function renderForm(s, now) {
    var f = s.form;
    var block = s.blocks.filter(function (b) { return b.kind === 'form'; })[0] || { id: 'form', schedule: {} };
    var live = scheduleAttrs(block, now);
    var head = '<h2 class="lh-form-title">' + esc(f.title) + '</h2>'
      + (f.note ? '<p class="lh-form-note">' + esc(f.note) + '</p>' : '');

    if (f.mode === 'link' || f.mode === 'kakao') {
      var url = f.mode === 'kakao' ? f.kakao : f.url;
      var cta = f.mode === 'kakao' ? '오픈채팅 열기' : '폼 작성하기';
      return '<section class="lh-form" data-block="' + esc(block.id) + '"' + live + '>' + head
        + (url
          ? '<a class="lh-btn lh-btn--main" style="display:flex;width:100%;padding:12px;font-size:14px" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(cta) + ' <span aria-hidden="true">↗</span></a>'
          : '<p class="lh-form-err">주소가 아직 없습니다. 스튜디오에서 주소를 넣어 주세요.</p>')
        + '</section>';
    }

    var fields = [];
    fields.push('<label class="lh-field"><span>이름</span><input name="name" type="text" autocomplete="name" maxlength="' + LIMITS.inqName + '" placeholder="홍길동" required></label>');
    fields.push('<label class="lh-field"><span>연락처</span><input name="contact" type="text" autocomplete="tel" maxlength="' + LIMITS.inqContact + '" placeholder="010-0000-0000 · 메일 · 카톡 아이디" required></label>');
    if (f.fields.type) {
      fields.push('<label class="lh-field"><span>문의 종류</span><select name="type">'
        + TYPE_OPTIONS.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('')
        + '</select></label>');
    }
    if (f.fields.budget) {
      fields.push('<label class="lh-field"><span>예산</span><select name="budget">'
        + BUDGET_OPTIONS.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('')
        + '</select></label>');
    }
    fields.push('<label class="lh-field"><span>문의 내용</span><textarea name="message" rows="3" maxlength="' + LIMITS.inqMessage + '" placeholder="무엇을 만들고 싶으신지, 일정과 참고 링크를 적어 주세요." required></textarea></label>');
    /* 수집·이용 동의 (필수) — 미동의 시 스크립트가 제출을 막는다. */
    fields.push('<label class="lh-field lh-field--check"><input type="checkbox" name="consent" value="agree" required>'
      + '<span>개인정보 수집·이용에 동의합니다 <em>(필수)</em></span></label>');
    fields.push('<p class="lh-consent-note">수집 항목: 이름·연락처·문의 내용 / 목적: 문의에 대한 답변 / 보관: 이 페이지에 저장하지 않음. 입력한 내용은 보낼 문의 문구를 만드는 데만 쓰이며 서버로 전송되지 않습니다.</p>');

    var submit = f.mode === 'mail' ? '메일로 보내기' : '문의 문구 만들기';
    var note = f.mode === 'mail' ? '버튼을 누르면 메일 앱이 열리고, 내용이 그대로 채워집니다.' : '';

    return '<section class="lh-form" data-block="' + esc(block.id) + '" data-mode="' + esc(f.mode) + '"' + live + '>'
      + head
      + (note ? '<p class="lh-form-note" style="margin-top:-8px">' + esc(note) + '</p>' : '')
      + '<form novalidate>' + fields.join('')
      + '<button class="lh-submit" type="submit">' + esc(submit) + '</button>'
      + '<p class="lh-form-err" role="alert" hidden></p>'
      + '</form>'
      + '<div class="lh-result" hidden>'
      + '<p class="lh-result-lead">아래 문구를 복사해서 보내 주세요.</p>'
      + '<pre class="lh-result-text" tabindex="0"></pre>'
      + '<div class="lh-result-actions">'
      + '<button type="button" class="lh-btn lh-btn--main" data-act="copy">문구 복사</button>'
      + '<a class="lh-btn" data-act="mail" hidden>메일로 보내기</a>'
      + '<a class="lh-btn" data-act="sms" hidden>문자로 보내기</a>'
      + '<a class="lh-btn" data-act="kakao" target="_blank" rel="noopener noreferrer" hidden>카톡으로 보내기</a>'
      + '<button type="button" class="lh-btn" data-act="reset">다시 쓰기</button>'
      + '</div></div>'
      + '</section>';
  }

  function pageBlocks(s, now) {
    var out = s.blocks.map(function (b) {
      if (b.kind === 'form') return s.form.enabled ? renderForm(s, now) : '';
      return renderLinkCard(b, now);
    }).filter(Boolean);
    if (!s.blocks.some(function (b) { return b.kind === 'form'; }) && s.form.enabled) out.push(renderForm(s, now));
    if (!out.length) out.push('<p class="lh-empty">아직 링크가 없습니다. 스튜디오에서 첫 링크를 추가해 보세요.</p>');
    return out.join('');
  }

  function renderPage(state, opts) {
    opts = opts || {};
    var s = opts.normalized ? state : normalizeState(state);
    var now = opts.now === undefined ? new Date() : opts.now;
    var blockAttrs = opts.preview ? ' data-preview="1"' : '';
    var foot = [];
    if (s.meta.footer) foot.push('<p>' + esc(s.meta.footer) + '</p>');
    if (s.meta.credit) foot.push('<p>Made with OneTapLink</p>');
    return '<div class="lh-grain" aria-hidden="true"></div>'
      + '<main class="lh"' + blockAttrs + '>'
      + '<header class="lh-head">'
      + '<div class="lh-avatar lh-avatar--' + esc(s.profile.avatarShape) + '">'
      + (s.profile.avatar
        ? '<img src="' + esc(s.profile.avatar) + '" alt="' + esc(s.profile.name) + ' 프로필 사진" width="96" height="96" decoding="async">'
        : '<span class="lh-avatar-initial" aria-hidden="true">' + esc(firstChar(s.profile.name)) + '</span>')
      + '</div>'
      + (s.profile.handle ? '<p class="lh-handle">@' + esc(s.profile.handle) + '</p>' : '')
      + '<h1 class="lh-name">' + esc(s.profile.name) + '</h1>'
      + (s.profile.tagline ? '<p class="lh-tagline">' + esc(s.profile.tagline) + '</p>' : '')
      + renderSocials(s)
      + '</header>'
      + '<div class="lh-blocks">' + pageBlocks(s, now) + '</div>'
      + (foot.length ? '<footer class="lh-foot">' + foot.join('') + '</footer>' : '')
      + '</main>'
      + '<div class="lh-toast" id="lhToast" role="status" aria-live="polite"></div>';
  }

  /* ---------- 내보낸 페이지에서 도는 스크립트 ---------- */

  function clientScript(cfg) {
    return [
      '(function(){',
      '"use strict";',
      'var CFG=' + jsonForScript(cfg || formCfgPlaceholder) + ';',
      'var isLive=' + isLiveClient.toString() + ';',
      'var inquiry=' + inquiryClient.toString() + ';',
      'var toastEl=null,toastTimer=null;',
      'function toast(msg){toastEl=toastEl||document.getElementById("lhToast");if(!toastEl)return;toastEl.textContent=msg;toastEl.className="lh-toast is-on";clearTimeout(toastTimer);toastTimer=setTimeout(function(){toastEl.className="lh-toast"},1900);}',
      'function copy(text,cb){',
      '  function fallback(){try{var ta=document.createElement("textarea");ta.value=text;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.top="-1000px";ta.style.left="-1000px";document.body.appendChild(ta);ta.select();var ok=document.execCommand("copy");document.body.removeChild(ta);return ok;}catch(e){return false;}}',
      '  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){cb(true);},function(){cb(fallback());});}else{cb(fallback());}',
      '}',
      'function tick(){',
      '  var now=Date.now();',
      '  var nodes=document.querySelectorAll("[data-live-from],[data-live-to]");',
      '  for(var i=0;i<nodes.length;i++){var n=nodes[i];n.hidden=!isLive(n.getAttribute("data-live-from")||"",n.getAttribute("data-live-to")||"",now);}',
      '}',
      'function bindCopy(){',
      '  var btns=document.querySelectorAll("[data-copy]");',
      '  for(var i=0;i<btns.length;i++){(function(btn){',
      '    btn.addEventListener("click",function(){',
      '      var text=btn.getAttribute("data-copy")||"";',
      '      var hint=btn.querySelector("[data-copy-hint]");',
      '      try{window.parent&&window.parent!==window&&window.parent.postMessage({source:"onetap",type:"select",id:btn.getAttribute("data-block")},"*");}catch(e){}',
      '      copy(text,function(ok){',
      '        btn.className=btn.className.replace(" is-done","")+(ok?" is-done":"");',
      '        if(hint){if(!hint.getAttribute("data-orig"))hint.setAttribute("data-orig",hint.textContent);hint.textContent=ok?"복사했어요 ✓":hint.getAttribute("data-orig");}',
      '        toast(ok?"복사했어요. 원하는 곳에 붙여넣으세요.":"복사가 막혔어요. 문구를 길게 눌러 복사해 주세요.");',
      '        setTimeout(function(){btn.className=btn.className.replace(" is-done","");if(hint)hint.textContent=hint.getAttribute("data-orig")||"";},2400);',
      '      });',
      '    });',
      '  })(btns[i]);}',
      '}',
      'function bindForm(){',
      '  var sec=document.querySelector(".lh-form[data-mode]");if(!sec)return;',
      '  var form=sec.querySelector("form");if(!form)return;',
      '  var res=sec.querySelector(".lh-result");var pre=sec.querySelector(".lh-result-text");',
      '  var err=sec.querySelector(".lh-form-err");',
      '  var mail=sec.querySelector("[data-act=mail]"),sms=sec.querySelector("[data-act=sms]"),kakao=sec.querySelector("[data-act=kakao]"),cp=sec.querySelector("[data-act=copy]");',
      '  function clearBad(){var bs=form.querySelectorAll(".lh-field.is-bad");for(var i=0;i<bs.length;i++)bs[i].className=bs[i].className.replace(" is-bad","");}',
      '  form.addEventListener("submit",function(ev){',
      '    ev.preventDefault();',
      '    var vals={};var els=form.querySelectorAll("[name]");',
      '    for(var i=0;i<els.length;i++){var el=els[i];',
      '      vals[el.getAttribute("name")]=(el.type==="checkbox")?(el.checked?el.value:""):el.value;}',
      '    var out=inquiry(CFG,vals);',
      '    clearBad();',
      '    if(!out.ok){',
      '      for(var k=0;k<out.errors.length;k++){var f=out.errors[k].field;var el=form.querySelector("[name="+f+"]");if(el&&el.parentNode)el.parentNode.className+=" is-bad";}',
      '      err.textContent=out.errors[0].msg;err.hidden=false;',
      '      var first=form.querySelector(".lh-field.is-bad input,.lh-field.is-bad textarea,.lh-field.is-bad select");if(first)first.focus();',
      '      return;',
      '    }',
      '    err.hidden=true;',
      '    if(CFG.mode==="mail"){if(!out.mailto){err.textContent="받을 메일 주소가 설정되지 않았습니다.";err.hidden=false;return;}window.location.href=out.mailto;return;}',
      '    pre.textContent=out.text;',
      '    if(mail){if(out.mailto){mail.href=out.mailto;mail.hidden=false;}else{mail.hidden=true;}}',
      '    if(sms){if(out.sms){sms.href=out.sms;sms.hidden=false;}else{sms.hidden=true;}}',
      '    if(kakao){if(CFG.kakao){kakao.href=CFG.kakao;kakao.hidden=false;}else{kakao.hidden=true;}}',
      '    if(cp)cp.setAttribute("data-text",out.text);',
      '    res.hidden=false;',
      '    res.scrollIntoView({block:"nearest"});',
      '    toast("문의 문구를 만들었습니다.");',
      '  });',
      '  if(cp)cp.addEventListener("click",function(){copy(pre.textContent||cp.getAttribute("data-text")||"",function(ok){toast(ok?"문의 문구를 복사했어요.":"복사가 막혔어요. 문구를 길게 눌러 복사해 주세요.");});});',
      '  if(kakao)kakao.addEventListener("click",function(){copy(pre.textContent||"",function(){});toast("문구를 복사했어요. 카톡에 붙여넣으세요.");});',
      '  var reset=sec.querySelector("[data-act=reset]");',
      '  if(reset)reset.addEventListener("click",function(){res.hidden=true;form.reset();var first=form.querySelector("input,textarea");if(first)first.focus();});',
      '}',
      'if(window.parent&&window.parent!==window){',
      '  document.addEventListener("click",function(e){',
      '    var t=e.target;while(t&&t!==document&&!(t.getAttribute&&t.getAttribute("data-block")))t=t.parentNode;',
      '    if(!t||t===document)return;',
      '    try{window.parent.postMessage({source:"onetap",type:"select",id:t.getAttribute("data-block")},"*");}catch(err){}',
      '    if(t.tagName==="A")e.preventDefault();',
      '  },true);',
      '}',
      'tick();setInterval(tick,30000);bindCopy();bindForm();',
      '})();'
    ].join('\n');
  }

  /* 플레이스홀더는 exportDocument에서 CFG로 치환된다. */
  var formCfgPlaceholder = { page: '', title: '', email: '', phone: '', mode: 'builtin', fields: { type: true, budget: true } };

  function jsonForScript(v) {
    return JSON.stringify(v).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }

  function iconDataUri(initial, bg, fg) {
    var ch = String(initial || '·').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]; });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="' + bg + '"/><text x="32" y="42" font-family="sans-serif" font-size="30" font-weight="700" text-anchor="middle" fill="' + fg + '">' + ch + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function exportDocument(state, opts) {
    opts = opts || {};
    var s = opts.normalized ? state : normalizeState(state);
    var d = designOf(s);
    var scale = phoneScale(d.tokens);
    var css = buildCSS(s, d, scale);
    var dark = luminanceOf(d.tokens.color.bg) < 0.35;
    var title = s.meta.title;
    var genericTitle = !title || AUTO_TITLES.indexOf(title) !== -1 || (title === DEMO_TITLE && s.profile.name !== '한서연');
    if (genericTitle) title = autoTitle(s.profile.name);
    var desc = s.meta.description;
    if (!desc || (desc === DEMO_DESCRIPTION && s.profile.name !== '한서연')) {
      desc = clipText(s.profile.tagline || (s.profile.name + '의 링크 모음'), 120);
    }
    var favicon = iconDataUri(firstChar(s.profile.name), d.tokens.color.accent, d.tokens.color.accentInk);
    var body = renderPage(s, { normalized: true, now: opts.now });
    var script = clientScript(formCfg(s));

    return '<!DOCTYPE html>\n<html lang="ko" data-lh-preset="' + esc(d.presetId) + '">\n<head>\n'
      + '<meta charset="utf-8">\n'
      + '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
      + '<title>' + esc(title) + '</title>\n'
      + '<meta name="description" content="' + esc(desc) + '">\n'
      + '<meta name="color-scheme" content="' + (dark ? 'dark' : 'light') + '">\n'
      + '<meta name="theme-color" content="' + esc(d.tokens.color.bg) + '">\n'
      + '<meta name="robots" content="index,follow">\n'
      + '<meta property="og:type" content="profile">\n'
      + '<meta property="og:title" content="' + esc(title) + '">\n'
      + '<meta property="og:description" content="' + esc(desc) + '">\n'
      + '<link rel="icon" href="' + esc(favicon) + '">\n'
      + '<!-- 원탭링크 스튜디오 ' + VERSION + ' · ' + esc(d.name) + ' · 외부 요청 0건 -->\n'
      + '<style>\n' + css + '\n</style>\n'
      + '</head>\n<body>\n' + body + '\n<script>\n' + script + '\n</script>\n</body>\n</html>\n';
  }

  /* ==========================================================
     9. 감사 · 점검
     ========================================================== */

  var EXTERNAL_PATTERNS = [
    { id: 'script-src', re: /<script[^>]+src\s*=/i, label: '외부 스크립트' },
    { id: 'css-link', re: /<link[^>]+rel\s*=\s*["']?stylesheet/i, label: '외부 스타일시트' },
    { id: 'import', re: /@import/i, label: 'CSS @import' },
    { id: 'http-url', re: /url\(\s*["']?https?:/i, label: 'CSS 외부 이미지·폰트' },
    { id: 'img-src', re: /<img[^>]+src\s*=\s*["']https?:/i, label: '외부 이미지' },
    { id: 'iframe', re: /<iframe/i, label: 'iframe' },
    { id: 'font-face-src', re: /@font-face[\s\S]{0,200}?https?:/i, label: '외부 폰트' },
    { id: 'preconnect', re: /<link[^>]+rel\s*=\s*["']?(preconnect|dns-prefetch)/i, label: '외부 preconnect' }
  ];

  /** 내보낸 HTML이 정말 단독으로 도는지 확인한다. */
  function verifyExport(html) {
    var src = String(html || '');
    var issues = [];
    EXTERNAL_PATTERNS.forEach(function (p) {
      var m = src.match(p.re);
      if (m) issues.push({ id: p.id, label: p.label, sample: clipText(m[0], 80) });
    });
    var textLower = src.toLowerCase();
    ['littly', '리틀리', 'inpock', '링크트리', 'linktree', 'googletagmanager', 'adsbygoogle', 'doubleclick'].forEach(function (brand) {
      if (textLower.indexOf(brand) >= 0) issues.push({ id: 'brand', label: '타사 브랜드·광고 흔적', sample: brand });
    });
    var hasDoctype = /^<!DOCTYPE html>/i.test(src);
    var hasViewport = /name="viewport"/.test(src);
    var hasLang = /<html[^>]+lang="ko"/.test(src);
    var hasInlineScript = /<script>[\s\S]*<\/script>/.test(src);
    var hasStyle = /<style>[\s\S]*<\/style>/.test(src);
    var blocks = (src.match(/data-block="/g) || []).length;
    var bytes = utf8Bytes(src);
    return {
      ok: issues.length === 0 && hasDoctype && hasViewport && hasLang && hasStyle && hasInlineScript,
      issues: issues, hasDoctype: hasDoctype, hasViewport: hasViewport, hasLang: hasLang,
      hasInlineScript: hasInlineScript, hasStyle: hasStyle, blocks: blocks,
      bytes: bytes, kb: Math.round(bytes / 102.4) / 10
    };
  }

  function utf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str).length;
    return Buffer.byteLength(str, 'utf8');
  }

  /**
   * 앱 오른쪽 '발행 준비 점검'.
   * level: 'error' | 'warn' | 'ok'
   */
  function auditState(state, opts) {
    opts = opts || {};
    var s = opts.normalized ? state : normalizeState(state);
    var items = [];
    var links = s.blocks.filter(function (b) { return b.kind === 'link'; });
    var copyBlocks = links.filter(function (b) { return b.mode === 'copy'; });
    var scheduled = links.filter(function (b) { return b.schedule.from || b.schedule.to; });
    var noUrl = links.filter(function (b) { return b.mode === 'link' && !hrefIsSafe(b.url); });
    var badCopy = copyBlocks.filter(function (b) { return !b.copyText; });
    var longTitle = links.filter(function (b) { return b.title.length > 22; });
    var d;
    try { d = designOf(s); } catch (e) { d = null; }

    function add(id, label, level, detail, fix) {
      items.push({ id: id, label: label, level: level, detail: detail || '', fix: fix || '' });
    }

    add('name', '프로필 이름', s.profile.name && s.profile.name !== '내 이름' ? 'ok' : 'warn',
      s.profile.name === '내 이름' ? '이름이 아직 기본값입니다.' : s.profile.name);
    add('avatar', '프로필 사진', s.profile.avatar ? 'ok' : 'warn',
      s.profile.avatar ? '사진이 페이지 안에 함께 들어갑니다.' : '사진이 없으면 이름 첫 글자로 대신합니다.');
    add('tagline', '한 줄 소개', s.profile.tagline ? 'ok' : 'warn',
      s.profile.tagline ? clipText(s.profile.tagline, 40) : '무엇을 하는 사람인지 한 줄이 있으면 문의 전환이 올라갑니다.');
    add('socials', 'SNS 아이콘', s.socials.length ? 'ok' : 'warn',
      s.socials.length ? s.socials.length + '개 연결' : '스레드·인스타·유튜브 등 1개 이상 연결하세요.');
    add('links', '링크 개수', links.length >= 3 ? 'ok' : (links.length ? 'warn' : 'error'),
      links.length + '개 · 최대 ' + LIMITS.links + '개', '링크 추가');
    add('url', '링크 주소', noUrl.length ? 'error' : 'ok',
      noUrl.length ? noUrl.length + '개 링크에 올바른 주소가 없습니다.' : '모든 링크 주소가 정상입니다.', noUrl.length ? '주소 확인' : '');
    add('copy', '복사 블록 문구', badCopy.length ? 'error' : 'ok',
      badCopy.length ? '복사 블록에 넣을 문구가 비어 있습니다.' : (copyBlocks.length ? copyBlocks.length + '개 복사 블록' : '사용 안 함'));
    add('form', '문의폼', !s.form.enabled ? 'warn' : (formReady(s) ? 'ok' : 'error'),
      !s.form.enabled ? '문의폼을 켜면 1분 견적 문의를 받을 수 있습니다.'
        : (formReady(s) ? FORM_MODES.filter(function (m) { return m.id === s.form.mode; })[0].label : formIssue(s)), '문의폼 설정');
    add('schedule', '예약 게시', scheduled.length ? 'ok' : 'ok',
      scheduled.length ? scheduled.length + '개 링크가 시간에 맞춰 열리고 닫힙니다.' : '예약된 링크 없음');
    add('meta', '페이지 제목·설명', s.meta.title && s.meta.description ? 'ok' : 'warn',
      s.meta.description ? '검색·공유 미리보기에 쓰입니다.' : '설명이 비어 있으면 한 줄 소개로 대신합니다.');
    add('contrast', '색 대비(WCAG AA)', d && d.allPass ? 'ok' : 'warn',
      d ? (d.allPass ? '본문·버튼 모두 기준 통과' : '일부 조합이 기준 미달 — 다른 프리셋을 권합니다.') : '확인 실패');
    add('density', '카드 글자 길이', longTitle.length ? 'warn' : 'ok',
      longTitle.length ? longTitle.length + '개 링크 제목이 22자를 넘습니다. 모바일에서 두 줄이 됩니다.' : '모두 22자 이하');
    var html = opts.html || exportDocument(s, { normalized: true });
    add('size', '내보낼 파일 크기', 'ok', '약 ' + Math.max(1, Math.round(utf8Bytes(html) / 1024)) + 'KB · 외부 요청 0건');

    var weight = { error: 0, warn: 0, ok: 1 };
    var total = items.reduce(function (n, it) { return n + weight[it.level]; }, 0);
    return {
      items: items,
      errors: items.filter(function (i) { return i.level === 'error'; }).length,
      warns: items.filter(function (i) { return i.level === 'warn'; }).length,
      score: Math.round((total / items.length) * 100)
    };
  }

  function formReady(s) {
    if (!s.form.enabled) return false;
    if (s.form.mode === 'builtin' || s.form.mode === 'mail') return !!(s.form.email || s.form.kakao || s.form.phone);
    if (s.form.mode === 'link') return !!s.form.url;
    if (s.form.mode === 'kakao') return !!s.form.kakao || !!s.form.url;
    return false;
  }

  function formIssue(s) {
    if (s.form.mode === 'link') return '폼 주소가 비어 있습니다.';
    if (s.form.mode === 'kakao') return '오픈채팅 주소가 비어 있습니다.';
    return '받을 메일·카톡·문자번호 중 하나가 필요합니다.';
  }

  function exportFileName() { return 'index.html'; }

  /* ==========================================================
     10. 텍스트 요약 (복사·보고용)
     ========================================================== */

  function pageSummary(state) {
    var s = state;
    var links = s.blocks.filter(function (b) { return b.kind === 'link'; });
    var lines = [];
    lines.push(s.profile.name + (s.profile.handle ? ' (@' + s.profile.handle + ')' : ''));
    if (s.profile.tagline) lines.push(s.profile.tagline);
    lines.push('');
    links.forEach(function (l, i) {
      lines.push((i + 1) + '. ' + l.title + (l.badge ? ' [' + l.badge + ']' : '') + (l.featured ? ' ★' : ''));
      if (l.subtitle) lines.push('   ' + l.subtitle);
      lines.push('   ' + (l.mode === 'copy' ? '복사 · ' + clipText(l.copyText, 40) : l.url));
      if (l.schedule.from || l.schedule.to) lines.push('   예약: ' + scheduleLabel(l));
    });
    if (s.form.enabled) lines.push('\n문의폼: ' + s.form.title + ' (' + s.form.mode + ')');
    lines.push('\n디자인: ' + s.design.preset + ' · ' + s.design.fontMix + ' · ' + s.design.grain);
    return lines.join('\n');
  }

  function subtitleHint(state) {
    var s = state;
    if (s.form.enabled && formReady(s)) return '';
    return '문의폼을 켜면 이 페이지가 1분 견적서가 됩니다.';
  }

  /* ==========================================================
     11. 내보내기
     ========================================================== */

  return {
    version: VERSION,
    LIMITS: LIMITS,
    SOCIALS: SOCIALS,
    SOCIAL_INDEX: SOCIAL_INDEX,
    BADGE_PRESETS: BADGE_PRESETS,
    BUDGET_OPTIONS: BUDGET_OPTIONS,
    TYPE_OPTIONS: TYPE_OPTIONS,
    AVATAR_SHAPES: AVATAR_SHAPES,
    FORM_MODES: FORM_MODES,
    PRESET_IDS: PRESET_IDS,

    esc: esc, cut: cut, clipText: clipText, clone: clone, uid: uid, isHex: isHex,
    normalizeHref: normalizeHref, hrefIsSafe: hrefIsSafe, normalizeImage: normalizeImage,
    parseLocalDateTime: parseLocalDateTime, toLocalInput: toLocalInput, fmtMD: fmtMD,
    hostOf: hostOf, firstChar: firstChar, utf8Bytes: utf8Bytes,

    defaultState: defaultState, normalizeState: normalizeState, makeLink: makeLink,

    addLink: addLink, updateBlock: updateBlock, removeBlock: removeBlock,
    duplicateBlock: duplicateBlock, moveBlock: moveBlock, moveBlockTo: moveBlockTo,
    reorderBlocks: reorderBlocks, setFormEnabled: setFormEnabled, updateForm: updateForm,
    updateProfile: updateProfile, updateMeta: updateMeta, updateSocial: updateSocial,
    updateDesign: updateDesign,

    isLiveClient: isLiveClient, isBlockLive: isBlockLive, scheduleStatus: scheduleStatus,
    scheduleLabel: scheduleLabel,

    inquiryClient: inquiryClient, composeInquiry: composeInquiry, formCfg: formCfg,

    presetList: presetList, fontMixList: fontMixList, grainList: grainList,
    designOf: designOf, phoneScale: phoneScale, buildCSS: buildCSS, grainOf: grainOf,
    makeBrandKit: makeBrandKit, kitSummary: kitSummary, applyKit: applyKit, clearKit: clearKit,

    renderPage: renderPage, exportDocument: exportDocument, verifyExport: verifyExport,
    auditState: auditState, formReady: formReady, formIssue: formIssue,
    exportFileName: exportFileName, pageSummary: pageSummary, subtitleHint: subtitleHint,
    clientScript: clientScript, jsonForScript: jsonForScript
  };
});
