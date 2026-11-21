/* ============================================================
   원탭링크 스튜디오 · data.js
   ------------------------------------------------------------
   처음 열었을 때 보이는 예시 페이지와 업종 템플릿 4종.
   썸네일은 외부 이미지 대신 SVG data URI를 쓴다(그대로 내보내도 요청 0건).
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OneTapLinkData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* 썸네일 4종: 120px PNG(외부 요청 없이 파일 안에 들어간다) */
  var THUMBS = {
    lines: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAABoklEQVR42u3boQ0DQRAEwU7DsvOP5nMwdBjvEB4dGRVY3prF1ef9up/u972On44zHRl1uyOjbndk1O2OjLrdkVG3OzLqdkdG3e7IqNsdGXW7I6Nud2TU7Y6Mut2RUbc7Mup2R0bd7sio2x0Zdbsjo253ZNTtjoy63ZFRtzsy6nZHRt3uyKjbHRl1uyOjbndk1O2OjLrdkVG3OzLqdkdG3e7IqNsdGXW7I6MS/kYl/I1K+Hsu4a+D8NdB+Osg/Al/oxL+RiX8PZfw91zCXwfhr4PwJ/yNSvgblfA3KuHvuYS/DsJfB+Gvg/An/I1K+BuV8Pdcwl8H4a+D8NdB+BP+RiX8jUr4ey7h77mEvw7CXwfhT/gblfA3KuFvVMLfcwl/HYS/DsJfB+FP+BuV8Dcq4e+5hL/nEv46CH8dhD/hb1TC36iEv+cS/p5L+Osg/HUQ/oS/UQl/oxL+RiX8PZfw10H46yD8dRD+hL9RCX+jEv6eS/h7LuGvg/DXQfgT/kYl/I1K+BuV8Pdcwl8H4a+D8NdB+BP+RiX8jUr4ey7hr+NIxx9eNGGSA3EYRAAAAABJRU5ErkJggg==',
    dots: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAABfUlEQVR42u3buw2AMBAE0auLjNaphZyEHEQBID4+EPYLJl7ZI5C4Y2OexgX1Ei6BYBAMgkEwCAbBIJhgEAyCQTD+Jnjou08OIjdR8Ba2R/Yh5R7nRmZo5qHlnsuN7NCMQ8s9nxtvhJY8tNxruQQT7KKbE3wntMSh5V7P9QR7gl00wS66PsG+Ryv/DjZRamCSZSbcwCzaVqeBbRIs/EEwCAbBIJhgEAyCQTAIBsEgmGAQDILtZbUL/dGhXShXu1CudqFcggl20dqFWn7ahZ4kr2i5BMvVLpSrXWiSZSZsFm2ro10IC38QDIJBMMEugmAQDIJBMAgGwSCYYBAM7UJ7We1CudqFcrUL5WoX+i/aRRPsorULtfy0Cz3BXtFyCZarXSjXJMsky0xYu9BWR7sQFv4gGASDYIJBMAgGwSAYBINggkEwCIZ2oX2wdqFc7UK52oVy/Rftv2gXTbCL1i7U8tMulOsVLZdgudqFvoNNlEyyzIS1C211tAth4Y/HrK+N9+w1WEopAAAAAElFTkSuQmCC',
    arch: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAADU0lEQVR42u2cMYIbMQwD+ZM85R6Q/3fp0uQXl/o670qiAHAKt9TaY64kgmD9+v317fT5++/P1c+t53y7XrkBVoF94xnfrGUNWAG4OuRy+ZGUYau9sn8Avr2ndYCfmM0WgHcDV3nOTshWgHcBnwTZGrA67M714wGvwk7I5jGAV2CnQY4HrAT6BuQxgN+Ads7msYAV6sqdkEcDdhUQnnwAHA65umrDqvKfq0r0MWBUIT8BwR6wEnRFASES8E3YzpALkd9TJVoG7Cj0p2XzjjUqoayYLAeurlGJdeQJKtGna1RyLTlZJYoFrKr7dgoIT2KP7ehwhPyq8R05MBtyrNhwE7QS5BFqkiLorv2Ylp1wyLTsGAoITyCPFfxTIL92NqD7+kP+ARjN10dAeORsQAr0KTu+cjag++ZAtgbcCTsJcik779JBd+zH5dbJmKYSnYZcCbXkVAFhjDdJAbQr5OiOju711SBbm89Us1nO2YCA4FN2HO0uBDItO62QVeKObtlxKzsCeEBt+bE3CXH/K3o/rpPlQ6exv6qQtwPGApr1qi7kQF/I9gZwIG8wn00W+U+uqbIfl+IPmyIgSAJGDsyCXGrDyBQhK8WNsY/eAp2WxUVdOQeydamyM5s792Pso5eyWbHs+OYPE9uyM+FVHW8A78hm5SweYwAH8gCHv1PZsTNWlOB/A7J6FtfJcqKiBdTxLrvF4Z82wiHpLrvyXNEdHY7XnCOAk3XfhLts5IwOZchOWVwqNV63yTYuWWwxwoEs3gx4mkqUnMWlMnkuCbIc4EkCgmOxYgkwZUf9u+zSGCVqy9qn4GjAJyG7nIJX49j3ZJHFIYCnXnNW48Q03d2Opxonqqsy9S7bCjhRIRoPWFElmnIKXv1e1T2fQ7XsqHoKPgbYQfN1yeKbf5S6BdcFchTgE1BOg+Y1/SHgWyoOp2ABwI732AQ426bNJgw9mQD41TDSmy6E1FOw0rNIAuYUfBiwq3jAPmw2JwvAAI6Gsx2wmgwI4HDA0+FsBawq5hPjMmC1YgUxNgJOvccC+JB4QAwAEwPAxAAwgAHMKZpTNPdg4FDJAg61aACjJgEYPRjAdHTMAExP1gDAdFWGd1XSFx3UF42zIdzZgDdpgDcJd2HuW+A/6edQqReix1UAAAAASUVORK5CYII=',
    wave: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAACA0lEQVR42u3bu3ECQRAE0A5IMSg2ubIUkPKhZCsBqTCowsDA4Xau9xntd83j4NhPfi6/f9KbGAJgASyABbAAFsACGLAAFsACWAALYAEMWAALYAEsgAWwABbAgAWwAF6Ut/evpwO4EHUH7IDthg7cbuSA7YYO3G7kgO2GDtxu5MDtRs5uuK/4sIwGnlzyyME3Il97ZWrJlYNuQL51ysSSU4Z7VuT7PplUdOKTc6an+VGPTCk5fYhn7RdPSPc3TPzGdb8jxFtq91t+/M/s/p8eK0XdK22x1tu9Vh67Nd27XbHf2r1fHScmuk+cxJmn7jNjWV10h9sFK+eXlSV3ukKyan5ZUXTnu0JHzy9HlXURbM383C50u1AAC2ABLIAFsAAGLIDPkI/P76cDuBB1B+yA7YYO3G7kgO2GDtxu5IDthg7cbuTA7UbObriv+LCMBp5c8sjBNyJfe2VqyZWDbkC+dcrEklOGe1bk+z6ZVHTik3Omp/lRj0wpOX2IZ+0XT0j3N0z8xnW/I8RbavdbfvzP7P6fHitF3SttsdbbvVYeuzXdu12x39q9Xx0nJrpPnMSZp+4zY1lddIfbBSvnl5Uld7pCsmp+WVF057tCR88vR5V1EWzN/NwudLtQAAtgASyABbAABiyABbAAFsACWAADFsACWAALYAEsgAUwYAEsgAWwvCj/CB3cSAYdfZwAAAAASUVORK5CYII='
  };

  function link(id, title, subtitle, url, extra) {
    return Object.assign({
      id: id, kind: 'link', title: title, subtitle: subtitle, url: url,
      thumb: '', badge: '', featured: false, mode: 'link', copyText: '',
      schedule: { from: '', to: '' }
    }, extra || {});
  }

  function formBlock(id) { return { id: id || 'f_demo01', kind: 'form' }; }

  /* ---------- 예시: 브랜드 디자이너 ---------- */
  var DEMO = {
    v: 1,
    meta: {
      title: '한서연 · 브랜드 디자이너',
      description: '로고·패키지·편집 디자인. 11월 신규 프로젝트 두 건만 받습니다.',
      footer: '© 2026 한서연 디자인 스튜디오',
      credit: false
    },
    profile: {
      name: '한서연',
      handle: 'seoyeon.han',
      tagline: '브랜드 디자이너. 로고와 패키지, 그리고 그 사이의 언어까지.',
      avatar: '',
      avatarShape: 'circle'
    },
    socials: [
      { type: 'instagram', url: 'https://www.instagram.com/seoyeon.han' },
      { type: 'threads', url: 'https://www.threads.com/@seoyeon.han' },
      { type: 'blog', url: 'https://blog.naver.com/seoyeonhan' }
    ],
    blocks: [
      link('b_work01', '2026 작업 노트 12편', '로고·패키지·편집 디자인을 한 번에 봅니다', 'https://seoyeon-han.kr/work',
        { featured: true, badge: 'NEW', thumb: THUMBS.lines }),
      link('b_talk01', '카톡 오픈채팅 · 작업 문의', '평일 10–18시, 보통 1시간 안에 답합니다', 'https://open.kakao.com/o/seoyeonhan',
        { thumb: THUMBS.dots }),
      link('b_mail01', '이메일 주소 복사', '견적서·계약서는 메일로 주고받습니다', '',
        { mode: 'copy', copyText: 'hello@seoyeon-han.kr' }),
      link('b_yt001', '유튜브 · 작업 과정 브이로그', '한 편에 로고 하나씩, 실패한 시안까지', 'https://www.youtube.com/@seoyeonhan',
        { thumb: THUMBS.wave }),
      formBlock('f_demo01')
    ],
    form: {
      enabled: true,
      mode: 'builtin',
      title: '1분 견적 문의',
      note: '브랜드 이름과 하고 싶은 일만 적어 주세요. 하루 안에 답장드립니다.',
      url: '',
      email: 'hello@seoyeon-han.kr',
      kakao: 'https://open.kakao.com/o/seoyeonhan',
      phone: '',
      fields: { type: true, budget: true }
    },
    design: { preset: 'cream-editorial', fontMix: 'myeongjo-title', grain: 'paper-3', accent: '', radius: null },
    brandKit: null
  };

  /* ---------- 템플릿 ---------- */
  var TEMPLATES = [
    {
      id: 'freelancer',
      name: '프리랜서 · 디자이너',
      desc: '작업 노트·카톡 문의·이메일 복사. 포트폴리오 링크의 기본형.',
      tag: '가장 많이 쓰는 구성',
      preset: 'cream-editorial',
      build: function () { return JSON.parse(JSON.stringify(DEMO)); }
    },
    {
      id: 'store',
      name: '1인 스토어 · 공동구매',
      desc: '이번 주 공구·스마트스토어·오픈채팅. 주문 양식 복사 블록 포함.',
      tag: '판매',
      preset: 'commerce-clean',
      build: function () {
        return {
          v: 1,
          meta: {
            title: '달빛 상점 · 이번 주 공구',
            description: '직접 써 보고 남은 생활용품만 올립니다. 매주 수요일 새 공구.',
            footer: '달빛 상점 · 사업자등록번호는 오픈채팅 공지에 있습니다',
            credit: false
          },
          profile: {
            name: '달빛 상점',
            handle: 'dalbit.shop',
            tagline: '직접 써 보고 남은 생활용품만 올립니다',
            avatar: '', avatarShape: 'round'
          },
          socials: [
            { type: 'instagram', url: 'https://www.instagram.com/dalbit.shop' },
            { type: 'kakao', url: 'https://open.kakao.com/o/dalbitshop' }
          ],
          blocks: [
            link('b_shop01', '이번 주 공구 · 무선 핸드블렌더', '11/24(월) 밤 10시 마감 · 32,900원', 'https://smartstore.naver.com/dalbitshop',
              { featured: true, badge: '마감 임박', thumb: THUMBS.arch }),
            link('b_shop02', '주문 양식 복사', '이름·연락처·주소·수량을 적어 카톡으로', '',
              { mode: 'copy', copyText: '주문 양식\n이름:\n연락처:\n주소:\n상품명:\n수량:\n입금자명:' }),
            link('b_shop03', '지난 공구 후기 모음', '실사용 사진과 아쉬운 점까지', 'https://blog.naver.com/dalbitshop',
              { thumb: THUMBS.dots }),
            link('b_shop04', '배송·교환 안내', '평일 오후 2시 이전 주문은 당일 발송', 'https://dalbit.shop/help',
              { thumb: THUMBS.lines }),
            formBlock('f_shop01')
          ],
          form: {
            enabled: true, mode: 'kakao',
            title: '재입고 · 사이즈 문의',
            note: '오픈채팅으로 오시면 가장 빠릅니다.',
            url: 'https://open.kakao.com/o/dalbitshop', email: '', kakao: 'https://open.kakao.com/o/dalbitshop', phone: '',
            fields: { type: false, budget: false }
          },
          design: { preset: 'commerce-clean', fontMix: 'pretendard-only', grain: 'none', accent: '', radius: null },
          brandKit: null
        };
      }
    },
    {
      id: 'class',
      name: '강사 · 클래스',
      desc: '수강 신청·커리큘럼·후기. 신청 폼과 예약 링크를 한 줄로.',
      tag: '교육',
      preset: 'swiss-magazine',
      build: function () {
        return {
          v: 1,
          meta: {
            title: '김도현 · 글쓰기 8주 과정',
            description: '매주 한 편, 끝까지 쓰는 습관. 12월 기수 신청 받습니다.',
            footer: '김도현 글쓰기 연구소',
            credit: false
          },
          profile: {
            name: '김도현',
            handle: 'dohyun.writes',
            tagline: '글쓰기 8주 과정 · 12월 기수 모집 중',
            avatar: '', avatarShape: 'circle'
          },
          socials: [
            { type: 'blog', url: 'https://blog.naver.com/dohyunwrites' },
            { type: 'youtube', url: 'https://www.youtube.com/@dohyunwrites' }
          ],
          blocks: [
            link('b_cls01', '12월 기수 신청 (선착순 20명)', '12/2 시작 · 8주 · 온라인 화요일 밤 8시', 'https://forms.gle/dohyun-class',
              { featured: true, badge: 'OPEN', thumb: THUMBS.wave }),
            link('b_cls02', '커리큘럼 PDF 받기', '무엇을 쓰고 무엇을 버리는지 8주 계획', 'https://dohyun.kr/curriculum',
              { thumb: THUMBS.lines }),
            link('b_cls03', '수강생 후기 41개', '끝까지 쓴 사람들의 첫 문장', 'https://dohyun.kr/reviews',
              { thumb: THUMBS.dots }),
            link('b_cls04', '1:1 원고 진단 예약', '회당 50분 · 주 2명만', 'https://dohyun.kr/coach',
              { badge: '한정' }),
            formBlock('f_cls01')
          ],
          form: {
            enabled: true, mode: 'builtin',
            title: '수강 문의',
            note: '지금 쓰고 있는 글과 막히는 지점을 적어 주세요.',
            url: '', email: 'dohyun@dohyun.kr', kakao: '', phone: '',
            fields: { type: false, budget: false }
          },
          design: { preset: 'swiss-magazine', fontMix: 'plex-editorial', grain: 'none', accent: '', radius: null },
          brandKit: null
        };
      }
    },
    {
      id: 'creator',
      name: '뷰티 · 크리에이터',
      desc: '최신 리뷰·브랜드 제안서·DM. 협업 예산까지 받는 폼.',
      tag: '콘텐츠',
      preset: 'vivid-pop',
      build: function () {
        return {
          v: 1,
          meta: {
            title: '유하 · 스킨케어 리뷰',
            description: '민감성 피부로 3년 써 본 것만 말합니다. 협업 문의는 폼으로.',
            footer: '유하 · 모든 리뷰는 직접 구매하거나 표기 후 제공받습니다',
            credit: false
          },
          profile: {
            name: '유하',
            handle: 'yuha.skin',
            tagline: '민감성 피부로 3년 써 본 것만 말합니다',
            avatar: '', avatarShape: 'arch'
          },
          socials: [
            { type: 'instagram', url: 'https://www.instagram.com/yuha.skin' },
            { type: 'youtube', url: 'https://www.youtube.com/@yuhaskin' },
            { type: 'threads', url: 'https://www.threads.com/@yuha.skin' }
          ],
          blocks: [
            link('b_cr001', '이번 주 리뷰 · 진정 토너 5종', '7일씩 써 보고 남은 2개', 'https://www.youtube.com/watch?v=yuha-toner',
              { featured: true, badge: 'HOT', thumb: THUMBS.dots }),
            link('b_cr002', '브랜드 협업 제안서', '단가·일정·촬영 컷 수가 적혀 있습니다', 'https://yuha.skin/media-kit',
              { thumb: THUMBS.arch }),
            link('b_cr003', '내 피부 타입·톤 정보', '제품 추천 전에 봐 주세요', 'https://yuha.skin/about',
              { thumb: THUMBS.lines }),
            formBlock('f_cr001')
          ],
          form: {
            enabled: true, mode: 'builtin',
            title: '협업 · 제품 문의',
            note: '제품명과 원하는 일정을 적어 주세요. 3일 안에 답장드립니다.',
            url: '', email: 'hello@yuha.skin', kakao: 'https://open.kakao.com/o/yuhaskin', phone: '',
            fields: { type: true, budget: true }
          },
          design: { preset: 'vivid-pop', fontMix: 'rounded-pop', grain: 'film-2', accent: '', radius: null },
          brandKit: null
        };
      }
    }
  ];

  var SAMPLE_INQUIRY = {
    name: '김민지',
    contact: '010-0000-0000',
    type: '제작 문의',
    budget: '150~300만 원',
    consent: true,
    message: '카페 브랜드 로고와 컵·봉투 패키지를 같이 하고 싶습니다. 12월 초 오픈 예정이라 11월 안에 시안을 받을 수 있으면 좋겠습니다. 참고 사이트는 인스타그램에 저장해 두었습니다.'
  };

  return {
    DEMO: DEMO,
    TEMPLATES: TEMPLATES,
    THUMBS: THUMBS,
    SAMPLE_INQUIRY: SAMPLE_INQUIRY
  };
});
