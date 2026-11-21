# engines/ — 디자인 레퍼런스 엔진 v2.0.0

`packages/design-ref-engine.js`를 **그대로 복사**한 파일이다(수정 없음, 242KB).
빌드·번들러·npm 설치가 필요 없는 UMD 모듈이라 `<script src="engines/design-ref-engine.js">`
한 줄로 `window.DesignRef`가 생기고, node에서는 `require()`로 쓴다.

```
원본: packages/design-ref-engine.js
버전: v2.0.0  (내부 VERSION 상수 '2.0.0')
복사: 2026-11-21
```

## 이 앱이 쓰는 API

| 용도 | 함수 |
| --- | --- |
| 프리셋 8종 목록·토큰 | `get`, `tokens`, `applyDesignRef` |
| 브랜드 키트 고정·재사용 | `serializeBrandKit`, `parseBrandKit`, `applyBrandKit`, `brandKitFingerprint` |
| 폰트 믹스 6종 | `listFontMixes`, `fontMix`, `fontMixStacks` |
| 종이·필름 그레인 4종 | `listGrains`, `normalizeGrain`, `grainSVGDataUri` |
| WCAG AA 검사 | `tokens().a11y.contrast`, `color.relativeLuminance` |

프리셋: `swiss-magazine` · `cream-editorial` · `minimal-luxury` · `bento-saas` ·
`commerce-clean` · `vivid-pop` · `dark-neon` · `neo-brutalism`

## 주의

- 엔진은 **CSS/HTML/Canvas 출력을 만들어 주는 순수 함수 모음**이다. 이 앱은 링크 페이지에
  맞게 토큰(색·타이포·여백·라운딩·그레인)만 받아 자체 CSS를 만든다(`core.js buildCSS`).
- 엔진의 폰트 스택을 내보낸 페이지에 그대로 쓰지 않는다. 이 앱은 외부 폰트 다운로드 0건을
  지키기 위해 시스템 폰트 스택으로 해석한다(`core.js SYS_STACKS`).
- 엔진 자체 테스트는 `packages/test-engines.js`(1,972 단언)에 있다. 이 앱은 그중 링크 페이지에
  필요한 부분(프리셋 대비·키트 왕복·그레인·폰트)만 `test.js`에서 다시 확인한다.
