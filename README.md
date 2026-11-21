# 원탭링크 스튜디오 (OneTapLink Studio)

**리틀리 로고 없이, 광고 없이, 월 0원.** 프로필 링크 페이지와 1분 견적 문의폼을 만들고
**외부 요청 0건의 HTML 한 파일(`index.html`)** 로 내보내는 무서버 빌더.

리틀리·인포크링크·링크트리 무료 플랜의 불만(로고 강제 노출, 테마·문의폼은 월 1~3만 원,
갑작스러운 유료 전환)을 그대로 뒤집는 것을 목표로 만들었다. 계정도, 구독도, 서버도 없다.

- 앱: `apps/linkhub-studio/index.html` (폴더·저장 키 이름은 배포 주소 호환을 위해 그대로 둔다)
- 결과물: 내보낸 `index.html` 한 장 (CSS·JS·아이콘·사진·썸네일 전부 파일 안에)
- 실행: 이 폴더를 아무 정적 서버에 올리거나, 그냥 `index.html`을 열어도 된다.

---

## 1. 무엇을 하는 앱인가

| 화면 | 하는 일 |
| --- | --- |
| 01 프로필 | 사진(320px로 줄여 data URI로 내장), 이름, @아이디, 한 줄 소개, 사진 모양(원형·둥근 사각·아치), SNS 5종(스레드·인스타·유튜브·블로그·카카오톡), 페이지 제목·설명·하단 문구 |
| 02 링크 | 링크 블록 최대 20개. 제목·소제목·배지(NEW/HOT/마감 임박/OPEN/한정/직접 입력)·썸네일·강조 카드·**문구 복사 블록**·**예약 게시(공개 시작/종료)**. 손잡이를 끌어 순서 변경, ↑↓ 버튼, 문의폼 카드도 같은 목록에서 이동 |
| 03 문의폼 | 내장 빠른 문의 · 구글폼/노션폼 · 카카오 오픈채팅 · 메일(mailto) 4모드. 받을 곳(메일·오픈채팅·문자), 추가 질문(문의 종류·예산), 받게 될 문구 실시간 미리보기 |
| 04 디자인 | 디자인 레퍼런스 엔진 v2 프리셋 8종, 폰트 믹스 6종, 종이·필름 그레인 4종, 포인트 색, 모서리, WCAG AA 대비 검사, **브랜드 키트 고정**(지문·JSON 재사용) |
| 오른쪽 | 발행 준비 점검 13항목(점수), 파일 크기, 링크·글자 수, 3단계 배포 안내 |

가운데의 폰 미리보기는 **내보낼 문서를 그대로 `iframe`에 띄운다.** 편집 결과와 내보낸 파일이
같은 코드 경로(`core.js → exportDocument`)를 쓰므로 미리보기와 실제 페이지가 어긋나지 않는다.
미리보기에서 카드를 누르면 그 블록이 편집 패널에서 열린다.

### 문의폼은 서버 없이 어떻게 동작하나

방문자가 이름·연락처·문의 내용을 적고 **문의 문구 만들기**를 누르면, 페이지 안에서
`[문의] 페이지 이름 / 이름 / 연락처 / 문의 종류 / 예산 / 문의 내용 / — 보낸 곳` 형식의
텍스트를 만들어 준다. 그다음

- **문구 복사** — 클립보드 복사(실패 시 `execCommand` 폴백, 실패하면 길게 눌러 복사 안내)
- **메일로 보내기** — `mailto:` 링크에 제목·본문을 미리 채움
- **카톡으로 보내기** — 문구를 복사한 뒤 오픈채팅방을 엽니다
- **문자로 보내기** — 번호를 넣은 경우 `sms:` 링크

문의 내용은 **어디로도 자동 전송되지 않는다.** 방문자가 직접 보낸다. 서버·DB·폼 백엔드가
필요 없고, 개인정보를 보관하지 않는다. (문구 조합 함수는 화면 스크립트와 `core.js`가 같은
함수 본문을 공유해 결과가 100% 같다 — `test.js`에서 검증)

### 예약 게시

링크마다 공개 시작·종료 시각(`YYYY-MM-DDTHH:mm`, 방문자 기기 로컬 시간)을 넣을 수 있다.
내보낸 페이지는 로드 시점과 30초마다 `data-live-from` / `data-live-to`를 확인해 `hidden`을
토글한다. 서버 스케줄러 없이 "11/25 10시에 열리는 공지"가 된다.

---

## 2. 내보낸 파일의 약속

`index.html` 한 파일을 열면:

- **외부 CDN·폰트·이미지 요청 0건** — `<script src>`, `<link rel="stylesheet">`, `@import`,
  `url(http…)`, `<img src="http…">`, `preconnect`, `iframe`을 쓰지 않는다. 아이콘은 SVG path,
  사진·썸네일은 data URI, 그레인은 `feTurbulence` SVG data URI, 폰트는 기기 기본 스택.
- **리틀리 로고 0%, 광고 0%, 추적 코드 0%** — `verifyExport()`가 타사 브랜드 문자열과
  광고 스크립트 이름까지 검사한다. 크레딧("Made with OneTapLink")은 **선택 사항이며 기본 꺼짐**.
- **`file://`에서도 그대로 동작** — 스타일·스크립트 인라인. GitHub Pages·Netlify·Vercel·
  Cloudflare Pages·S3·사내 웹서버 어디든 파일 하나만 올리면 끝.
- **WYSIWYG** — 스튜디오의 폰 미리보기와 같은 HTML/CSS.
- 기본 크기 약 27KB(예시 기준). 사진을 넣으면 그만큼 늘어난다(프로필 320px, 썸네일 480×360 JPEG).
- `prefers-reduced-motion`, `:focus-visible`, 라벨·`aria-label`, `role="status"` 토스트,
  `<h1>` 한 개, `lang="ko"`, viewport, OG 제목·설명, 인라인 파비콘.

### 배포 3단계 (GitHub Pages)

1. 스튜디오에서 **HTML 1파일 내보내기** → `index.html` 저장
2. GitHub 저장소(예: `my-links`)에 `index.html` 업로드 — 저장소 Settings → Pages → Branch `main` / `/root` 저장
3. 1~2분 뒤 `https://<아이디>.github.io/my-links/` 접속

Netlify·Cloudflare Pages는 폴더째 끌어다 놓으면 된다. (노션 임베드는 iframe이 필요해
"외부 요청 0건" 약속과 맞지 않으므로 권하지 않는다 — HTML 파일 호스팅을 쓸 것)

---

## 3. 화면 디자인 시스템 — A안 Crisp Bento

스튜디오 화면(툴 자체)의 스킨은 2026-11-22 **A안(Crisp Bento SaaS)** 으로 통일했다.
내보낸 페이지의 프리셋 8종은 이용자가 고르는 결과물 톤이라 그대로 두었고, 여기서 말하는 토큰은
**스튜디오 UI 전용**이다(`styles.css` 상단 `:root`, `html[data-design="crisp-bento/v1"]`).

| 토큰 | 값 | 쓰는 곳 |
| --- | --- | --- |
| paper / surface / surface-2 | `#FAFAFA` / `#FFFFFF` / `#F5F6F7` | 바탕 · 카드 · 안쪽 면 |
| ink / ink-2 / ink-3 | `#0C0D0F` / `#3C4045` / `#6B7076` | 제목 · 본문 · 보조(모두 4.5:1 이상) |
| line / line-2 | `#E7E8EA` / `#D7D9DD` | 1px 보더, 입력 테두리 |
| accent (단일) | `#2F5BFF` (hover `#2449D8`) | 지금 눌러야 할 것 — 내보내기 CTA·포커스·선택 |
| accent-soft / accent-text | `#EEF2FF` / `#2445C9` | 선택 카드 바탕 / 그 위 글자 |
| ok / warn / bad | `#0B7A55` / `#8A5A0B` / `#B3261E` | 점검 통과·주의·오류 |
| radius | 카드 16 · 버튼 12 · 입력 10 · 필 999 | |
| type | 패널 제목 21px/800, 자간 `-.045em` · 라벨 11px/700 대문자 · 숫자 tabular | |

- **구조 유지·스킨 교체**: HTML의 ID·클래스·역할은 그대로 두고 CSS 토큰과 컴포넌트 표면만 바꿨다.
  그래서 4탭 편집·드래그 정렬·예약 게시·문의폼 4모드·대비 검사·브랜드 키트·1파일 내보내기가
  모두 같은 코드 경로로 동작한다.
- **A안의 장치**: 상단 바는 반투명 흰색 + 1px 보더, 활성 탭은 먹색 필, 오른쪽 지표 3개는 먹색 타일
  1장, 폰 뒤에는 옅은 코발트 라디얼 한 겹. 종이 질감 오버레이는 걷어냈다(크리스프 톤).
- **가독성**: 화면에 보이는 모든 글자를 실제 렌더 값으로 재어 4.5:1(큰 글씨 3:1) 이상을 확인한다
  (`work/linkhub-a-check.py`). 2026-11-22 실측 결과 4개 패널·모달 전부 통과.
- **외부 요청 0 유지**: 폰트는 저장소 안 `assets/fonts/plexkr-*.woff2`, 아이콘은 인라인 SVG.
- `privacy.html`도 같은 토큰으로 다시 썼다(자체 인라인 CSS, 로컬 폰트만).

---

## 4. 디자인 엔진 v2

`engines/design-ref-engine.js`는 `packages/design-ref-engine.js` **v2.0.0**을 그대로 복사한
무의존성 UMD 모듈이다. 이 앱은 다음만 쓴다.

- `applyDesignRef` / `applyBrandKit` — 프리셋 8종의 60-30-10 팔레트, 모듈러 타이포, 8pt 여백,
  라운딩·보더·그림자·밀도를 토큰으로 받아 폰 화면용 CSS 변수로 옮긴다.
- `serializeBrandKit` / `parseBrandKit` / `brandKitFingerprint` — 포인트 색이나 모서리만 바꿔도
  키트를 거쳐 **대비가 보정된 팔레트**를 얻는다. "지금 디자인 고정"을 누르면 현재 톤이 키트로
  잠기고, JSON으로 다른 페이지에 그대로 붙여 넣을 수 있다.
- `listFontMixes` / `fontMix` — 명조 제목×고딕 본문 등 6종. 내보낸 페이지에서는 **시스템 폰트
  스택으로 해석**한다(외부 폰트 다운로드 금지 원칙).
- `listGrains` / `grainSVGDataUri` — 없음·필름 2%·종이 3%·신문지 4.5%. 밝은 배경은 multiply,
  어두운 배경은 screen으로 합성한다.
- `contrastReport` — WCAG 2.2 AA(본문 4.5:1, 큰 글자·UI 3:1). 디자인 패널에 8개 조합을 보여준다.

프리셋별로 색·구조는 토큰이 정하고, 이 앱은 시그니처만 얹는다: 스위스는 좌측 정렬+괘선,
미니멀 럭셔리는 배경 없는 카드+자간, 다크 네온은 글로우, 네오 브루탈리즘은 하드 섀도 등.

---

## 5. 파일

```
apps/linkhub-studio/
├─ index.html                 스튜디오 화면
├─ styles.css                 스튜디오 UI(내보낸 페이지 CSS는 core.js가 생성)
├─ core.js                    상태 모델·정규화·디자인 연결·HTML 생성·감사 (순수 함수)
├─ app.js                     화면 조립·드래그·저장·내보내기
├─ data.js                    예시 페이지 + 업종 템플릿 4종 + PNG 썸네일(data URI)
├─ engines/design-ref-engine.js   v2.0.0 (packages에서 복사)
├─ engines/README.md
├─ assets/fonts/plexkr-*.woff2    스튜디오 UI용 (내보낸 파일에는 쓰지 않음)
├─ test.js                    node 단위 테스트
├─ uitest.py                  Playwright 브라우저 검증 + 스크린샷
├─ preview-desktop.png / preview-mobile.png / preview-design.png /
│  preview-form.png / preview-export.png
└─ favicon.svg
```

### 상태 모델 (localStorage `linkhub.state.v1` — 기존 초안 호환용 키 이름 유지)

```js
{
  v: 1,
  meta:    { title, description, footer, credit:false },
  profile: { name, handle, tagline, avatar, avatarShape },
  socials: [{ type:'instagram', url:'https://…' }],
  blocks:  [ { id, kind:'link', title, subtitle, url, thumb, badge, featured,
               mode:'link'|'copy', copyText, schedule:{from,to} },
             { id, kind:'form' } ],
  form:    { enabled, mode:'builtin'|'link'|'kakao'|'mail', title, note, url,
             email, kakao, phone, fields:{ type, budget } },
  design:  { preset, fontMix, grain, accent, radius },
  brandKit: null | designref.brandkit/2 객체
}
```

모든 입력은 `normalizeState()`를 거친다: 길이 제한, `javascript:`·`data:`·`file:` 스킴 차단,
`data:image/(png|jpeg|webp)`만 허용(SVG는 스크립트 위험으로 거부), 중복 SNS 제거,
블록 최대 20개, 폼 블록은 `form.enabled`와 항상 일치.

---

## 6. 검증

```bash
# 1) 단위 테스트 (217 단언)
/workspace/scratch/node/node-v20.18.0-linux-x64/bin/node test.js

# 2) 브라우저 검증 (Chrome --no-sandbox · 기동 재시도 포함)
python3 uitest.py
```

- `test.js` — 정규화·URL 안전성·상태 조작·예약 판정·문의 문구·프리셋 8종 대비·브랜드 키트
  왕복·**템플릿 4 × 프리셋 8 = 32조합 전부 외부 요청 0건**·XSS 이스케이프·감사 점수·결정성.
- `uitest.py` — 데스크톱 1440×900, 모바일 390×844(DPR 2, 터치). 콘솔 에러 0, 외부 요청 0,
  404 0, 가로 넘침 0. 편집→미리보기 반영, 배지·복사 블록·예약 숨김, 드래그 정렬, Ctrl+Z,
  문의폼 4모드·문구 생성·클립보드, 프리셋/폰트/그레인/포인트 색/브랜드 키트, 키트 JSON 왕복,
  템플릿 4종 적용·되돌리기, 새 탭(blob) 미리보기, 새로고침 유지,
  **내보내기 다운로드 → `file://`로 다시 열어 단독 렌더·문의 제출·복사·필수값 오류**까지 확인.
- 결과: **단위 217/217 · 브라우저 153/153 통과** (2026-11-22, A안 리디자인 후).

> 디자인 토큰·대비·폭별 넘침만 따로 보는 검사도 있다(배포 후 실서버에 그대로 돌린다):
> `python3 work/linkhub-a-check.py` — 화면에 보이는 모든 글자의 실측 대비(4.5:1/큰 글씨 3:1),
> 1440·1280·1024·834·768·390·360·320 가로 넘침 0, 외부 요청 0, 토큰 값(바탕·보더·라운드·액센트).

> 이 컨테이너는 프로세스 한도가 빡빡해 Chrome 기동이 간헐적으로 실패한다. `uitest.py`는
> `launch_browser()`에서 최대 7회 재시도하고, 3회째부터 `--no-zygote --single-process`로
> 낮춰 기동한다. 그래도 실패하면 잠시 뒤 다시 실행하면 된다. (Chrome 라이브러리는
> `uitest.py`가 `libnss3.so`가 있는 폴더를 찾아 쓴다 — 이 환경은 `scratch/chromelibs`.)

---

## 7. 이 앱이 하지 않는 일

- 계정·로그인·서버 저장·통계 수집 (모든 데이터는 그 브라우저의 localStorage에만)
- 외부 폰트·이미지 CDN 로드 (내보낸 파일의 "외부 요청 0건" 약속)
- 자동 발송·자동 결제·광고 삽입
- GitHub 푸시 (이번 작업 범위에서 보류 — 배포는 사용자가 결정)

## 8. 라이선스·크레딧

- 앱 코드: 이 저장소의 다른 앱과 같은 규칙(의존성 없음, 빌드 없음).
- 디자인 엔진: `packages/design-ref-engine.js` (v2.0.0).
- 폰트: IBM Plex Sans KR (SIL Open Font License) — 스튜디오 UI 전용.
- 내보낸 페이지에는 어떤 라이선스 표시도 강제하지 않는다(크레딧 기본 꺼짐).
