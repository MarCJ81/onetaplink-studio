/* ============================================================
   OneTap i18n · KO/EN runtime translation (v1)
   - ?lang=en|ko  >  localStorage 'onetap_lang'  >  navigator.language
   - DOM text and attributes are translated in place and restored on switch.
   - Elements added later by app.js are translated by a MutationObserver.
   - Missing keys are reported to console as "I18N_MISS: <korean>".
   ============================================================ */
(function (root, doc) {
  'use strict';

  var LANG_KEY = 'onetap_lang';
  var COMMON = /*__COMMON__*/ {"닫기":"Close","취소":"Cancel","저장":"Save","저장됨":"Saved","삭제":"Delete","복사":"Copy","복사됨":"Copied","다운로드":"Download","내려받기":"Download","공유":"Share","인쇄":"Print","초기화":"Reset","다시 시도":"Try again","불러오기":"Load","내보내기":"Export","적용":"Apply","추가":"Add","편집":"Edit","수정":"Edit","보기":"View","미리보기":"Preview","설정":"Settings","도움말":"Help","사용법":"Guide","예시":"Example","샘플":"Sample","무료":"Free","유료":"Paid","개인정보":"Privacy","개인정보 처리방침":"Privacy policy","개인정보 처리 안내":"Privacy notice","이용약관":"Terms","홈":"Home","뒤로":"Back","다음":"Next","이전":"Previous","확인":"OK","검색":"Search","필터":"Filter","전체":"All","없음":"None","준비 중":"Coming soon","준비 중입니다":"Coming soon","로딩 중":"Loading","불러오는 중":"Loading","처리 중":"Working","빈칸":"Blank","필수":"Required","선택":"Optional","이름":"Name","제목":"Title","날짜":"Date","시간":"Time","메모":"Note","상태":"Status","결과":"Result","요약":"Summary","상세":"Details","언어":"Language","한국어":"Korean","영어":"English","복사하기":"Copy","링크 복사":"Copy link","전체 복사":"Copy all","다크 모드로 전환":"Switch to dark mode","라이트 모드로 전환":"Switch to light mode","테마 전환":"Toggle theme","라이트/다크":"Light / dark","다크/라이트":"Dark / light","새 탭에서 보기":"Open in new tab","새 창":"New window","본문으로 건너뛰기":"Skip to content","본문으로 바로가기":"Skip to content","맨 위로":"Back to top","더 보기":"Show more","접기":"Collapse","펼치기":"Expand","자주 묻는 질문":"Frequently asked questions","이 브라우저에만 저장됩니다":"Saved only in this browser","이 브라우저에만 저장됩니다 · 서버 전송 0":"Saved only in this browser · zero uploads","서버 전송 없음":"No upload","서버 업로드 없음":"No server upload","100% 브라우저 처리":"100% in-browser","브라우저에서 처리":"Processed in your browser","파일은 서버로 전송되지 않습니다":"Files never leave your device","파일이 서버로 전송되지 않습니다":"Files never leave your device","붙여넣은 코드는 서버로 전송되지 않습니다":"Pasted code never leaves your device"};
  var APP = /*__DICT__*/ {"원탭링크 스튜디오 — 리틀리 로고 없이, 평생 무료 링크 페이지":"OneTapLink Studio — a free-for-life link page, without the Litt.ly badge","프로필 링크 페이지와 1분 견적 문의폼을 만들고 외부 요청 0건의 HTML 한 파일로 내보냅니다. 리틀리·인포크링크의 유료 테마 없이, 내 GitHub Pages에 그대로 올리면 끝.":"Build a profile link page with a one-minute quote form and export it as a single HTML file with zero external requests. No paid themes from Litt.ly or Infocurious — upload it to your own GitHub Pages and you are done.","원탭링크 스튜디오 홈":"OneTapLink Studio home","되돌리기":"Undo","되돌리기 (Ctrl+Z)":"Undo (Ctrl+Z)","편집 항목":"Edit sections","프로필 편집":"Edit profile","프로필 사진 파일 선택":"Choose a profile photo","무엇을 하는 사람인지 한 줄로":"One line on what you do","사진 모양":"Photo shape","비어 있으면 한 줄 소개를 씁니다":"Left empty, the one-line intro is used","© 2026 한서연 디자인 스튜디오":"© 2026 Han Seoyeon Design Studio","링크 편집":"Edit links","문의폼 편집":"Edit the contact form","디자인 편집":"Edit the design","포인트 색":"Accent colour","포인트 색 코드":"Accent colour code","한서연 브랜드":"Seoyeon brand","폰 미리보기":"Phone preview","미리보기 크기":"Preview size","내 링크 페이지 미리보기":"Your link page preview","발행 준비":"Ready to publish","편집 또는 미리보기":"Edit or preview","브랜드 키트 JSON":"Brand kit JSON","편집 메뉴로 바로가기":"Skip to the editor","원탭링크 스튜디오":"OneTapLink Studio","저장됨":"Saved","이 브라우저에만 저장됩니다 · 서버 전송 0":"Saved in this browser only · zero uploads","템플릿":"Templates","새 탭에서 보기":"Open in a new tab","HTML 1파일 내보내기":"Export one HTML file","내보내기":"Export","프로필":"Profile","링크":"Links","문의폼":"Contact form","디자인":"Design","사진·이름·한 줄 소개와 SNS 아이콘.":"Photo, name, one-line intro and social icons.","사진 올리기":"Upload photo","자르기":"Crop","지우기":"Clear","아이폰 HEIC 사진은 자동으로 JPEG로 바꿉니다. 320px 정사각으로 자르고 페이지 안에 함께 넣습니다.":"iPhone HEIC photos are converted to JPEG automatically, cropped square at 320px and embedded in the page.","이름":"Name","아이디(선택)":"Handle (optional)","한 줄 소개":"One-line intro","원형":"Circle","둥근 사각":"Rounded square","아치":"Arch","SNS 아이콘":"Social icons","주소를 넣은 것만 보입니다":"Only the ones with an address appear","페이지 정보":"Page details","검색·공유 미리보기":"Search and share preview","페이지 제목":"Page title","설명":"Description","하단 문구(선택)":"Footer line (optional)","공유 QR":"Share QR","명함·오픈카톡·인쇄물":"Business cards, KakaoTalk, print","공개 주소(올린 뒤 주소)":"Public address (once uploaded)","주소를 넣고 QR 만들기를 누르세요":"Enter the address and press Build QR","QR 만들기":"Build QR","PNG 저장":"Save PNG","QR은 내보낸 페이지 안에 그림으로 들어갑니다. 외부 요청도, 서버도 필요 없습니다.":"The QR goes into the exported page as a picture. No external requests, no server.","손잡이를 잡고 끌면 순서가 바뀝니다. 위·아래 버튼도 됩니다.":"Drag the handle to reorder, or use the up and down buttons.","+ 링크 추가":"+ Add link","문의폼 카드는 이 목록 안에서 원하는 위치로 옮길 수 있습니다.":"The contact form card can sit anywhere in this list.","이름·연락처·내용을 받아":"It takes a name, contact and message and","보낼 문구":"composes the message","를 만들어 줍니다. 서버가 없어도 됩니다.":" to send — no server needed.","문의폼 켜기":"Turn on the contact form","링크 목록 안에 카드로 들어갑니다":"It appears as a card in the link list","받는 방식":"How it arrives","카드 제목":"Card title","안내 문구":"Intro text","폼 주소 (구글폼·노션폼)":"Form address (Google Forms, Notion)","보낼 곳":"Where it goes","하나 이상 필요":"at least one","받을 메일":"Email to receive it","카카오 오픈채팅":"Kakao open chat","문자 번호(선택)":"SMS number (optional)","추가 질문":"Extra questions","문의 종류 (제작·협업·강의·기타)":"Enquiry type (project, partnership, class, other)","예산 범위 (5단계)":"Budget range (5 steps)","받게 될 문구":"The message you receive","디자인 레퍼런스 엔진 v2의 프리셋 8종. 색 대비는 WCAG AA로 검사합니다.":"Eight presets from the design reference engine v2. Colour contrast is checked against WCAG AA.","프리셋":"Presets","폰트 믹스":"Font mix","종이·필름 그레인":"Paper and film grain","기본값":"Defaults","모서리":"Corners","색 대비 검사":"Contrast check","브랜드 키트":"Brand kit","톤 고정 · 재사용":"Lock the tone, reuse it","키트 이름":"Kit name","지금 디자인 고정":"Lock this design","JSON 복사":"Copy JSON","JSON 붙여넣기":"Paste JSON","고정 해제":"Unlock","미리보기":"Preview","크림 에디토리얼":"Cream editorial","맞춤":"Fit","미리보기에서는 링크가 열리지 않습니다. 내보낸 파일에서는 그대로 열려요.":"Links don't open in the preview; in the exported file they do.","발행 준비 점검":"Pre-publish check","외부 요청":"External requests","리틀리 로고":"Litt.ly badge","광고":"Ads","내 페이지 HTML 내려받기":"Download my page HTML","파일 하나입니다. GitHub Pages·노션·아무 호스팅에 올리면 그대로 링크가 됩니다.":"One file. Upload it to GitHub Pages, Notion or any host and it becomes your link.","내려받기":"Download","— index.html 저장":"— save index.html","올리기":"Upload","— GitHub 저장소에 파일 추가":"— add the file to a GitHub repo","켜기":"Publish","글자":"Text","월 0원인 이유":"Why it costs ₩0 a month","— 서버가 없습니다. 이 스튜디오도, 내보낸 페이지도 브라우저에서만 돌아갑니다. 로고도 광고도 끼워 넣지 않습니다.":"— There is no server. This studio and the exported page run only in the browser, with no badge and no ads inserted.","원탭링크 스튜디오 · 서버 없음 · 계정 없음 · 외부 전송 0건 · 만든 페이지는 이 브라우저에서 HTML 파일 하나로 내려받습니다.":"OneTapLink Studio · no server · no account · zero uploads · the page is downloaded here as a single HTML file.","지금 페이지를 바꿉니다. 되돌리기로 복구할 수 있어요.":"This replaces the current page. Undo brings it back.","내보냈습니다":"Exported","다시 내려받기":"Download again","다른 페이지·시안에 그대로 붙여 넣으면 톤이 고정됩니다.":"Paste it into another page or draft to lock the tone.","이 키트 적용":"Apply this kit","사진 자르기":"Crop the photo","정사각으로 맞춥니다. 끌어서 옮기고, 모서리를 잡아 확대하세요.":"It crops square. Drag to move, pull a corner to zoom.","처음으로":"Reset","취소":"Cancel","이대로 넣기":"Use this crop","엔진을 불러오지 못했습니다. core.js와 data.js를 확인하세요.":"The engine failed to load. Check core.js and data.js.","저장 실패":"Save failed","저장 중…":"Saving…","되돌렸습니다.":"Undone.","내 이름":"My name","주소":"address","링크가 없습니다. 위의":"No links yet. Press","를 누르세요.":"above.","복사 ·":"Copy ·","문구 없음":"no message","주소를 확인하세요":"check the address","주소 없음":"no address","순서 바꾸기":"Reorder","위로":"Move up","아래로":"Move down","강조":"Featured","강조 카드":"Featured card","삭제":"Delete","썸네일 바꾸기":"Change thumbnail","썸네일 올리기":"Upload thumbnail","없음":"None","제목":"Title","소제목(선택)":"Subtitle (optional)","배지(선택)":"Badge (optional)","NEW · 마감 임박":"NEW · closing soon","누르면":"When tapped","링크 동작":"Link action","링크 열기":"Open the link","문구 복사":"Copy message","복사할 문구":"Text to copy","주소를 비우면 목록에 남지만 내보낸 페이지에서는 열리지 않습니다.":"An empty address stays in the list but does not open in the exported page.","4:3으로 잘라 400px. 페이지 파일 안에 들어갑니다.":"Cropped 4:3 at 400px and embedded in the page file.","강조 카드(포인트 색)":"Featured card (accent colour)","공개 시작":"Show from","공개 종료":"Hide after","예약됨 ·":"Scheduled ·","기간 종료 ·":"Ended ·","지금 공개 중 ·":"Live ·","예약하지 않으면 항상 보입니다.":"Without a schedule it is always visible.","문의폼 카드 ·":"Contact form card ·","문의폼 위로":"Move the form up","문의폼 아래로":"Move the form down","설정":"Settings","(필수 항목을 채우면 문구가 완성됩니다)":"(the message completes once the required fields are filled)","문의폼이 꺼져 있습니다. 링크 목록에 카드가 나타나지 않습니다.":"The contact form is off, so no card appears in the link list.","받을 곳이 준비됐습니다. 방문자는 문구를 복사해 메일·카톡·문자로 보냅니다.":"Your destination is ready. Visitors copy the message and send it by email, KakaoTalk or text.","아직 받을 곳이 없습니다 —":"No destination yet —","브랜드 고정 중":"Brand locked","8종":"8 presets","미달":"below target","적용":"Apply","키트 삭제":"Delete kit","이미지 파일이 아닙니다.":"This is not an image file.","이미지를 읽지 못했습니다.":"Could not read the image.","스크립트를 불러오지 못했습니다:":"Could not load a script:","스타일을 불러오지 못했습니다:":"Could not load a stylesheet:","파일이 없습니다.":"No file.","변환 결과가 비어 있습니다.":"The conversion produced nothing.","자를 사진":"Photo to crop","사진 도구를 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.":"The photo tool failed to load. Try again in a moment.","QR 엔진 없음":"QR engine missing","QR 생성 실패":"QR could not be built","QR 읽기 실패":"QR could not be read","공유 QR 코드":"Share QR code","QR 만들기를 누르세요":"Press Build QR","먼저 공개 주소를 넣어 주세요. 올린 페이지 주소를 그대로 쓰면 됩니다.":"Add the public address first — the address of the page once it is uploaded.","QR을 만들었습니다. 내보낸 페이지 아래에 함께 들어갑니다.":"QR built. It goes at the bottom of the exported page.","QR을 만들지 못했습니다. 잠시 뒤 다시 시도해 주세요.":"Could not build the QR. Try again in a moment.","먼저 QR을 만들어 주세요.":"Build the QR first.","QR PNG를 저장했습니다.":"QR PNG saved.","QR 저장에 실패했습니다.":"Could not save the QR.","파일 크기":"File size","블록":"Blocks","외부 CDN·폰트·이미지 요청 0건":"Zero CDN, font or image requests","스타일·스크립트가 파일 안에":"Styles and scripts are inside the file","로고·광고·타사 브랜드 흔적 0건":"Zero badges, ads or third-party branding","브랜드 키트 적용":"Brand kits applied","확인이 필요한 항목이 있습니다. 위 목록을 보세요.":"Some items need attention — see the list above.","이 파일 하나면 됩니다. GitHub Pages에 올리면 주소가 생깁니다.":"This one file is all you need. Upload it to GitHub Pages and it gets an address.","팝업이 막혔습니다. 브라우저의 팝업 허용을 켜 주세요.":"The pop-up was blocked. Allow pop-ups in your browser.","템플릿을 적용했습니다.":"template applied.","템플릿 적용을 되돌렸습니다.":"Template application undone.","링크는":"You can add up to","개까지 넣을 수 있습니다.":"links.","새 링크":"New link","링크를 추가했습니다. 주소를 넣어 주세요.":"Link added. Add its address.","프로필 사진을 지웠습니다.":"Profile photo removed.","문의 예시 문구를 복사했습니다.":"Sample enquiry message copied.","복사가 막혔습니다. 문구를 직접 선택해 복사하세요.":"Copying is blocked. Select the text and copy it yourself.","브랜드 고정을 풀었습니다.":"Brand lock released.","키트를 적용하지 못했습니다.":"Could not apply the kit.","키트를 목록에서 지웠습니다.":"Kit removed from the list.","링크를 지웠습니다.":"Link deleted.","삭제를 되돌렸습니다.":"Deletion undone.","링크:":"Link:","문의폼 카드를 켰습니다.":"Contact form card turned on.","문의폼 카드를 껐습니다.":"Contact form card turned off.","순서를 바꿨습니다.":"Order changed.","문의폼 카드를 선택했습니다.":"Contact form card selected.","브랜드를 고정했습니다 ·":"Brand locked ·","JSON 문법이 맞지 않습니다.":"The JSON is not valid.","키트를 읽지 못했습니다:":"Could not read the kit:","브랜드 키트를 적용했습니다.":"Brand kit applied.","아이폰 HEIC 사진을 JPEG로 바꾸는 중…":"Converting the iPhone HEIC photo to JPEG…","HEIC 사진을 JPEG로 바꿨습니다. 자르는 위치를 맞춰 주세요.":"HEIC photo converted to JPEG. Adjust the crop.","사진이 너무 큽니다. 더 작은 사진을 써 주세요.":"The photo is too large. Use a smaller one.","프로필 사진을 넣었습니다.":"Profile photo added.","사진을 읽지 못했습니다. 아이폰 사진이면 설정 → 카메라 → 포맷을 ‘높은 호환성’으로 바꾸거나 JPEG로 저장해 주세요.":"Could not read the photo. For iPhone photos, set Settings → Camera → Formats to “Most Compatible”, or save it as JPEG.","먼저 사진을 올려 주세요.":"Upload a photo first.","사진을 다시 잘랐습니다.":"Photo re-cropped.","자르기를 열지 못했습니다.":"Could not open the cropper.","HEIC 사진을 JPEG로 바꿨습니다.":"HEIC photo converted to JPEG.","썸네일이 너무 큽니다.":"The thumbnail is too large.","썸네일을 넣었습니다.":"Thumbnail added.","예시 페이지로 시작합니다. 왼쪽에서 고치면 오른쪽 미리보기가 바로 바뀝니다.":"Starting with a sample page. Edits on the left update the preview on the right.","engines/design-ref-engine.js를 먼저 불러와야 합니다.":"engines/design-ref-engine.js must be loaded first.","스레드":"Threads","인스타그램":"Instagram","유튜브":"YouTube","블로그":"Blog","카카오톡":"KakaoTalk","마감 임박":"Closing soon","한정":"Limited","~50만 원":"up to ₩500,000","50~150만 원":"₩500,000–1,500,000","150~300만 원":"₩1,500,000–3,000,000","300만 원 이상":"over ₩3,000,000","아직 미정":"Not decided","제작 문의":"Project enquiry","협업·제휴":"Partnership","강의·클래스":"Class or lecture","기타":"Other","내장 빠른 문의":"Built-in quick form","이름·연락처·내용을 받아 보낼 문구를 만들어 줍니다.":"Takes a name, contact and message and composes what to send.","구글폼·노션폼":"Google or Notion form","이미 만든 폼 주소로 보냅니다.":"Sends to a form you already have.","오픈채팅방으로 바로 보냅니다.":"Opens your open chat directly.","메일(mailto)":"Email (mailto)","작성한 내용을 메일 앱으로 넘깁니다.":"Hands what was written to the mail app.","한서연 · 브랜드 디자이너":"Han Seoyeon · Brand designer","로고·패키지·편집 디자인. 11월 신규 프로젝트 두 건만 받습니다.":"Logos, packaging and editorial design. Taking two new projects in November.","내 링크 페이지":"My link page","내 이름 링크":"My name link","내 링크":"My link","한서연":"Han Seoyeon","이름 · 직함":"Name · title","1분 견적 · 협업 문의":"One-minute quote or enquiry","아래에 적어 주시면 보낼 문구를 만들어 드려요.":"Fill this in and we'll compose the message for you.","공개":"public","까지":"until","이름을 적어 주세요.":"Please add your name.","연락처(전화·메일·카톡 아이디)를 적어 주세요.":"Please add a contact: phone, email or KakaoTalk ID.","연락처가 너무 짧습니다.":"That contact is too short.","문의 내용을 적어 주세요.":"Please write your message.","문의 내용을 조금 더 적어 주세요.":"Please write a little more.","개인정보 수집·이용에 동의해야 문의를 보낼 수 있습니다.":"You must agree to the collection and use of your details to send an enquiry.","문의":"Enquiry","연락처:":"Contact:","문의 종류:":"Enquiry type:","예산:":"Budget:","문의 내용:":"Message:","링크 페이지에서 보냄":"sent from the link page","구조는":"Structure","· 브랜드 색":"· brand colour","브랜드":"Brand","눌러서 복사":"Tap to copy","오픈채팅 열기":"Open the chat","폼 작성하기":"Fill the form","주소가 아직 없습니다. 스튜디오에서 주소를 넣어 주세요.":"The address is not set yet. Add it in the studio.","홍길동":"Jane Doe","010-0000-0000 · 메일 · 카톡 아이디":"phone · email · KakaoTalk ID","문의 종류":"Enquiry type","예산":"Budget","문의 내용":"Message","무엇을 만들고 싶으신지, 일정과 참고 링크를 적어 주세요.":"Tell us what you want built, your timeline and any reference links.","개인정보 수집·이용에 동의합니다":"I agree to the collection and use of my details","(필수)":"(required)","수집 항목: 이름·연락처·문의 내용 / 목적: 문의에 대한 답변 / 보관: 이 페이지에 저장하지 않음. 입력한 내용은 보낼 문의 문구를 만드는 데만 쓰이며 서버로 전송":"Collected: name, contact, message / Purpose: replying to the enquiry / Storage: not stored on this page. What you type is only used to compose the message and is never sent to a server","메일로 보내기":"Send by email","문의 문구 만들기":"Compose the message","버튼을 누르면 메일 앱이 열리고, 내용이 그대로 채워집니다.":"The mail app opens with everything filled in.","아래 문구를 복사해서 보내 주세요.":"Copy the message below and send it.","문자로 보내기":"Send by text","카톡으로 보내기":"Send on KakaoTalk","다시 쓰기":"Start over","아직 링크가 없습니다. 스튜디오에서 첫 링크를 추가해 보세요.":"No links yet. Add your first one in the studio.","페이지 QR 코드":"page QR code","휴대폰 카메라로 찍으면 바로 열립니다":"Scan it with a phone camera to open","프로필 사진":"profile photo","복사했어요. 원하는 곳에 붙여넣으세요.":"Copied. Paste it wherever you need.","복사가 막혔어요. 문구를 길게 눌러 복사해 주세요.":"Copying is blocked. Press and hold the text to copy it.","받을 메일 주소가 설정되지 않았습니다.":"No receiving email address is set.","문의 문구를 만들었습니다.":"Enquiry message composed.","문구를 복사했어요. 카톡에 붙여넣으세요.":"Message copied. Paste it into KakaoTalk.","의 링크 모음":"links","외부 스크립트":"External scripts","외부 스타일시트":"External stylesheets","CSS 외부 이미지·폰트":"External images and fonts in CSS","외부 이미지":"External images","외부 폰트":"External fonts","외부 preconnect":"External preconnect","리틀리":"Litt.ly","링크트리":"Linktree","타사 브랜드·광고 흔적":"Third-party branding or ads","프로필 이름":"Profile name","이름이 아직 기본값입니다.":"The name is still the default.","사진이 페이지 안에 함께 들어갑니다.":"The photo is embedded in the page.","사진이 없으면 이름 첫 글자로 대신합니다.":"Without a photo, the first letter of the name is used.","무엇을 하는 사람인지 한 줄이 있으면 문의 전환이 올라갑니다.":"One line on what you do lifts enquiry conversion.","개 연결":"connected","스레드·인스타·유튜브 등 1개 이상 연결하세요.":"Connect at least one: Threads, Instagram, YouTube…","링크 개수":"Links","개 · 최대":"· max","링크 추가":"Add a link","링크 주소":"Link addresses","개 링크에 올바른 주소가 없습니다.":"links have no valid address.","모든 링크 주소가 정상입니다.":"All link addresses are valid.","주소 확인":"Check addresses","복사 블록 문구":"Copy-block text","복사 블록에 넣을 문구가 비어 있습니다.":"A copy block has no text.","개 복사 블록":"copy blocks","사용 안 함":"Not used","문의폼을 켜면 1분 견적 문의를 받을 수 있습니다.":"Turn the form on to take one-minute quote enquiries.","문의폼 설정":"Contact form settings","예약 게시":"Scheduled posts","개 링크가 시간에 맞춰 열리고 닫힙니다.":"links open and close on schedule.","예약된 링크 없음":"No scheduled links","페이지 제목·설명":"Page title and description","검색·공유 미리보기에 쓰입니다.":"Used for search and share previews.","설명이 비어 있으면 한 줄 소개로 대신합니다.":"If the description is empty, the one-line intro is used.","내보낸 페이지에 QR 코드가 함께 들어갑니다.":"The QR code is included in the exported page.","공개 주소가 있습니다. QR을 만들어 주세요.":"You have a public address — build the QR.","오픈카톡·명함에 찍을 공개 주소를 넣으면 QR이 생깁니다. (선택)":"Add the public address for your KakaoTalk or business card and a QR is created. (optional)","공유 주소":"Share address","색 대비(WCAG AA)":"Contrast (WCAG AA)","본문·버튼 모두 기준 통과":"Body and buttons both pass","일부 조합이 기준 미달 — 다른 프리셋을 권합니다.":"Some combinations fall short — try another preset.","확인 실패":"Check failed","카드 글자 길이":"Card text length","개 링크 제목이 22자를 넘습니다. 모바일에서 두 줄이 됩니다.":"link titles exceed 22 characters and wrap to two lines on mobile.","모두 22자 이하":"All 22 characters or fewer","내보낼 파일 크기":"Export size","약":"about","KB · 외부 요청 0건":"KB · zero external requests","폼 주소가 비어 있습니다.":"The form address is empty.","오픈채팅 주소가 비어 있습니다.":"The open chat address is empty.","받을 메일·카톡·문자번호 중 하나가 필요합니다.":"One of email, KakaoTalk or SMS number is needed.","예약:":"Scheduled:","문의폼을 켜면 이 페이지가 1분 견적서가 됩니다.":"Turn the form on and this page becomes a one-minute quote form.","프리랜서 · 디자이너":"Freelance designer","작업 노트·카톡 문의·이메일 복사. 포트폴리오 링크의 기본형.":"Work notes, KakaoTalk and copyable email — the standard portfolio link.","가장 많이 쓰는 구성":"The most-used layout","1인 스토어 · 공동구매":"One-person shop · group buys","이번 주 공구·스마트스토어·오픈채팅. 주문 양식 복사 블록 포함.":"This week's group buy, smart store and open chat, with a copyable order form.","판매":"Sales","강사 · 클래스":"Teacher · class","수강 신청·커리큘럼·후기. 신청 폼과 예약 링크를 한 줄로.":"Enrolment, curriculum and reviews, with the form and booking on one line.","교육":"Education","뷰티 · 크리에이터":"Beauty · creator","최신 리뷰·브랜드 제안서·DM. 협업 예산까지 받는 폼.":"Latest reviews, a brand deck and DMs, with a form that takes a collaboration budget.","콘텐츠":"Content","한":"H","김민지":"Minji Kim","2026 작업 노트 12편":"12 work notes from 2026","카톡 오픈채팅 · 작업 문의":"KakaoTalk open chat · Project enquiries","이메일 주소 복사":"Copy email address","유튜브 · 작업 과정 브이로그":"YouTube · process vlogs","문의폼 카드 · 1분 견적 문의":"Contact form card · One-minute quote","브랜드 디자이너. 로고와 패키지, 그리고 그 사이의 언어까지.":"Brand designer — logos, packaging, and the language between them.","크림":"Cream","새 탭에서 열기":"Open in a new tab","스위스 타이포 매거진":"Swiss typographic magazine","정밀 · 차분 · 권위":"Precise · calm · authoritative","따뜻함 · 고급 · 차분":"Warm · refined · calm","미니멀 럭셔리 세리프":"Minimal luxury serif","고급 · 차분 · 감성":"Refined · calm · emotive","벤토 그리드 SaaS":"Bento grid SaaS","혁신 · 전문적 · 정돈":"Innovative · expert · tidy","커머스 클린 화이트":"Commerce clean white","친근 · 명확 · 실용":"Friendly · clear · practical","비비드 팝 카드":"Vivid pop cards","발랄 · 친근 · 임팩트":"Playful · friendly · bold","다크 네온 임팩트":"Dark neon impact","임팩트 · 실험적 · 혁신":"Bold · experimental · innovative","네오 브루탈리즘":"Neo-brutalism","발랄 · 실험적 · 임팩트":"Playful · experimental · bold","명조 제목 · 고딕 본문":"Serif headings · sans body","고딕 제목 · 명조 본문":"Sans headings · serif body","IBM Plex 제목 · Pretendard 본문":"IBM Plex headings · Pretendard body","Pretendard 단일":"Pretendard only","라운드 제목 · 산세리프 본문":"Rounded headings · sans body","명조 올 세리프":"Serif throughout","필름 그레인 2%":"Film grain 2%","종이 질감 3%":"Paper texture 3%","신문지 4.5%":"Newsprint 4.5%","본문/제목 · 배경":"Body/title · background","본문/제목 · 카드":"Body/title · card","보조텍스트 · 배경":"Secondary text · background","보조텍스트 · 카드":"Secondary text · card","CTA 글자 · CTA 배경":"CTA label · CTA background","보조텍스트 · 강조 틴트":"Secondary text · accent tint","CTA 면 · 배경":"CTA fill · background","본문 · 강조 틴트":"Body · accent tint","스레드 주소":"Threads address","인스타그램 주소":"Instagram address","유튜브 주소":"YouTube address","블로그 주소":"Blog address","카카오톡 주소":"KakaoTalk address","https://www.threads.com/@내아이디":"https://www.threads.com/@your_id","https://www.instagram.com/내아이디":"https://www.instagram.com/your_id","https://www.youtube.com/@내채널":"https://www.youtube.com/@your_channel","https://blog.naver.com/내아이디":"https://blog.naver.com/your_id","https://open.kakao.com/o/내방":"https://open.kakao.com/o/your_room","카페 브랜드 로고와 컵·봉투 패키지를 같이 하고 싶습니다. 12월 초 오픈 예정이라 11월 안에 시안을 받을 수 있으면 좋겠습니다. 참고 사이트는 인스타그램에 저장해 두었습니다.":"I'd like a café brand logo plus cup and bag packaging. We open in early December, so a draft within November would be ideal. I've saved reference sites on Instagram.","색·폰트·질감·모서리가 키트 값으로 잠겼습니다.":"Colour, font, texture and corners are locked to the kit.","브랜드 고정 중 ·":"Brand locked ·"};
  var PATTERNS = /*__PATTERNS__*/ [[new RegExp("^브랜드를 고정했습니다 · (.+) \\((bk1-[0-9a-z]+)\\)$", ""), "Brand locked · $1 ($2)"],[new RegExp("^브랜드를 고정했습니다 · (.+) \\((.+)\\)$", ""), "Brand locked · $1 ($2)"],[new RegExp("^브랜드 고정 중 · (.+)$", ""), "Brand locked · $1"],[new RegExp("^브랜드를 고정했습니다 · (.+)$", ""), "Brand locked · $1"],[new RegExp("^새 링크 (\\d+)$", ""), "New link $1"],[new RegExp("^(\\d+)개 링크에 올바른 주소가 없습니다\\.$", ""), "$1 links have no valid address."],[new RegExp("^(\\d+)개 연결$", ""), "$1 connected"],[new RegExp("^(\\d+)개 · 최대 (\\d+)개$", ""), "$1 of $2"],[new RegExp("^(\\d+)개 복사 블록$", ""), "$1 copy blocks"],[new RegExp("^약 (.+KB) · 외부 요청 0건$", ""), "about $1 · zero external requests"],[new RegExp("^⧉ · 복사 · (.+)$", ""), "⧉ · copy · $1"],[new RegExp("^\\[문의\\] (.+)$", ""), "Enquiry · $1"],[new RegExp("^이름: (.+)$", ""), "Name: $1"],[new RegExp("^연락처: (.+)$", ""), "Contact: $1"],[new RegExp("^문의 종류: (.+)$", ""), "Enquiry type: $1"],[new RegExp("^예산: (.+)$", ""), "Budget: $1"],[new RegExp("^— (.+) 링크 페이지에서 보냄$", ""), "— sent from $1's link page"]];

  var DICT = {};
  var k;
  for (k in COMMON) if (Object.prototype.hasOwnProperty.call(COMMON, k)) DICT[k] = COMMON[k];
  for (k in APP) if (Object.prototype.hasOwnProperty.call(APP, k)) DICT[k] = APP[k];

  var HANGUL = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, SVG: 1 };
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  var state = { lang: 'ko' };
  var records = [];
  var missing = {};
  var missingList = [];
  var observer = null;

  /* ---------- language ---------- */
  function detect() {
    try {
      var q = new URLSearchParams(root.location.search).get('lang');
      if (q === 'ko' || q === 'en') return q;
    } catch (e) { /* very old browser */ }
    try {
      var saved = root.localStorage.getItem(LANG_KEY);
      if (saved === 'ko' || saved === 'en') return saved;
    } catch (e) { /* private mode */ }
    var nav = root.navigator.language || root.navigator.userLanguage || 'ko';
    return /^ko/i.test(nav) ? 'ko' : 'en';
  }

  /* ---------- lookup ---------- */
  function report(text) {
    if (missing[text]) return;
    missing[text] = 1;
    missingList.push(text);
    if (root.console && console.warn) console.warn('I18N_MISS: ' + text);
  }

  /* Pattern with capture translation: captures that still hold Korean are looked up too. */
  function applyPattern(core, p) {
    if (!p[0].test(core)) return null;
    var m = p[0].exec(core);
    var caps = [], i, ok = true;
    for (i = 1; i < m.length; i++) {
      var c = m[i];
      if (c == null) { caps[i] = ''; continue; }
      if (HANGUL.test(c)) {
        var t = lookupSmall(c.trim());
        if (t == null) { ok = false; caps[i] = c; } else { caps[i] = t; }
      } else { caps[i] = c; }
    }
    var out = p[1].replace(/\$(\d+)/g, function (all, n) { return caps[+n] != null ? caps[+n] : all; });
    if (!ok || HANGUL.test(out)) return null;
    return out;
  }

  function tr(raw) {
    if (typeof raw !== 'string' || !HANGUL.test(raw)) return raw;
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw);
    var lead = m[1], core = m[2], tail = m[3];
    if (!core) return raw;
    var hit = DICT[core];
    if (hit == null && /\s{2,}|\n/.test(core)) hit = DICT[core.replace(/\s+/g, ' ').trim()];
    if (hit != null) return lead + hit + tail;

    /* Korean date: 2026년 11월 27일 -> November 27, 2026 */
    var dt = /^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일$/.exec(core);
    if (dt) {
      var MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var mm = parseInt(dt[2], 10);
      if (mm >= 1 && mm <= 12) return lead + MO[mm - 1] + ' ' + parseInt(dt[3], 10) + ', ' + dt[1] + tail;
    }

    /* money in Korean format: 81만 원 / 2,980,750원  ->  {0} template */
    var money = takeMoney(core);
    if (money.map.length) {
      var tpl = money.text;
      var th = DICT[tpl];
      if (th == null && /\s{2,}|\n/.test(tpl)) th = DICT[tpl.replace(/\s+/g, ' ').trim()];
      if (th == null && /^\{0\}$/.test(tpl.trim())) th = '{0}';
      if (th != null) return lead + putMoney(th, money.map) + tail;
      for (var mi = 0; mi < PATTERNS.length; mi++) {
        var mo = applyPattern(tpl, PATTERNS[mi]);
        if (mo != null) return lead + putMoney(mo, money.map) + tail;
      }
    }
    for (var i = 0; i < PATTERNS.length; i++) {
      var pout = applyPattern(core, PATTERNS[i]);
      if (pout != null) return lead + pout + tail;
    }
    var seg = trSegments(core);
    if (seg != null) return lead + seg + tail;
    report(core);
    return raw;
  }


  /* Korean money -> token template; values are formatted as ₩1,234,567 */
  function won(n) { return '₩' + n.toLocaleString('en-US'); }
  function takeMoney(core) {
    var map = [];
    var out = core.replace(/([\d,]+)\s*만(?:\s*([\d,]+))?\s*원/g, function (all, a, b) {
      var n = parseInt(a.replace(/,/g, ''), 10) * 10000 + (b ? parseInt(b.replace(/,/g, ''), 10) : 0);
      map.push(won(n));
      return '{' + (map.length - 1) + '}';
    });
    out = out.replace(/([+\-]?[\d,]+)\s*원/g, function (all, a) {
      map.push('₩' + a);
      return '{' + (map.length - 1) + '}';
    });
    return { text: out, map: map };
  }
  function putMoney(s, map) {
    return s.replace(/\{(\d+)\}/g, function (all, i) { return map[+i] != null ? map[+i] : all; });
  }

  /* A small unit: dictionary hit or pattern hit, no whitespace trimming. */
  function lookupSmall(unit) {
    var hit = DICT[unit];
    if (hit != null) return hit;
    for (var i = 0; i < PATTERNS.length; i++) {
      var pout = applyPattern(unit, PATTERNS[i]);
      if (pout != null) return pout;
    }
    return null;
  }

  function trPipe(line) {
    var parts = line.split(/\s*\|\s*/);
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var t = lookupSmall(parts[i].trim());
      if (t == null) return null;
      out.push(t);
    }
    return out.join(' | ');
  }

  function trSegments(core) {
    if (core.indexOf('\n') > -1) {
      var lines = core.split('\n');
      var out = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.trim()) { out.push(line); continue; }
        var t = line.indexOf('|') > -1 ? trPipe(line) : lookupSmall(line.trim());
        if (t == null) { if (root.__I18N_DEBUG) (root.__I18N_SEGFAIL = root.__I18N_SEGFAIL || []).push(line); return null; }
        out.push(t);
      }
      return out.join('\n');
    }
    if (core.indexOf('|') > -1) return trPipe(core);
    return null;
  }

  /* ---------- DOM walking ---------- */
  function skipped(el) {
    while (el) {
      if (el.nodeType === 1) {
        if (SKIP_TAG[el.tagName]) return true;
        if (el.getAttribute && (el.hasAttribute('data-i18n-skip') || el.getAttribute('contenteditable') === 'true')) return true;
        if (el.classList && el.classList.contains('onetap-lang')) return true;
      }
      el = el.parentNode;
    }
    return false;
  }

  function trText(node) {
    var v = node.nodeValue;
    if (!v || !HANGUL.test(v)) return;
    var out = tr(v);
    if (out !== v) {
      records.push({ n: node, v: v });
      node.nodeValue = out;
    }
  }

  function trAttrs(el) {
    var i, at, v, out;
    for (i = 0; i < ATTRS.length; i++) {
      at = ATTRS[i];
      if (!el.hasAttribute(at)) continue;
      v = el.getAttribute(at);
      if (!v || !HANGUL.test(v)) continue;
      out = tr(v);
      if (out !== v) {
        records.push({ e: el, a: at, v: v });
        el.setAttribute(at, out);
      }
    }
    if (el.tagName === 'INPUT' && el.hasAttribute('value') && el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'hidden') {
      v = el.getAttribute('value');
      if (v && HANGUL.test(v)) {
        out = tr(v);
        if (out !== v) {
          records.push({ e: el, a: 'value', v: v });
          el.setAttribute('value', out);
          if (el.value === v) el.value = out;
        }
      }
    }
    if (el.tagName === 'INPUT') {
      var ty = (el.type || '').toLowerCase();
      if (ty === 'button' || ty === 'submit' || ty === 'reset') {
        v = el.value;
        if (v && HANGUL.test(v)) {
          out = tr(v);
          if (out !== v) { records.push({ e: el, a: 'value', v: v }); el.value = out; }
        }
      }
    }
  }

  function walk(node) {
    if (node.nodeType === 3) { trText(node); return; }
    if (node.nodeType !== 1) return;
    if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'SVG' &&
        !(node.classList && node.classList.contains('onetap-lang'))) trAttrs(node);
    if (skipped(node)) return;
    if (node.tagName === 'META') return;
    for (var c = node.firstChild; c; c = c.nextSibling) walk(c);
  }

  function trMeta() {
    var list = doc.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i], v = el.getAttribute('content');
      if (v && HANGUL.test(v)) {
        var out = tr(v);
        if (out !== v) { records.push({ e: el, a: 'content', v: v }); el.setAttribute('content', out); }
      }
    }
  }

  function trJsonLd() {
    var list = doc.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      try {
        var data = JSON.parse(el.textContent);
        var changed = fixJson(data);
        if (changed) el.textContent = JSON.stringify(data);
      } catch (e) { /* leave as is */ }
    }
  }

  function fixJson(o) {
    var changed = false, i;
    if (Array.isArray(o)) {
      for (i = 0; i < o.length; i++) if (fixJson(o[i])) changed = true;
      return changed;
    }
    if (!o || typeof o !== 'object') return false;
    for (var key in o) {
      if (!Object.prototype.hasOwnProperty.call(o, key)) continue;
      var v = o[key];
      if (typeof v === 'string' && HANGUL.test(v)) {
        var out = DICT[v.trim()];
        if (out != null) { o[key] = out; changed = true; }
      } else if (v && typeof v === 'object') {
        if (fixJson(v)) changed = true;
      }
    }
    return changed;
  }

  /* ---------- apply / restore ---------- */
  function trFieldValues() {
    var list = doc.querySelectorAll('input, textarea');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var ty = (el.type || 'text').toLowerCase();
      if (ty === 'checkbox' || ty === 'radio' || ty === 'hidden' || ty === 'file' || ty === 'date' || ty === 'number') continue;
      if (el === doc.activeElement) continue;
      var v = el.value;
      if (!v || !HANGUL.test(v)) continue;
      var out = tr(v);
      if (out !== v) { records.push({ e: el, a: 'prop:value', v: v }); el.value = out; }
    }
  }

  function applyEn() {
    var title = root.__onetapTitle || (root.__onetapTitle = doc.title);
    walk(doc.body);
    trFieldValues();
    trMeta();
    trJsonLd();
    doc.documentElement.lang = 'en';
    var t = DICT[title] || DICT[title.trim()];
    doc.title = t || title;
  }

  function restoreKo() {
    for (var i = records.length - 1; i >= 0; i--) {
      var r = records[i];
      if (r.n) { if (r.n.nodeValue !== r.v) r.n.nodeValue = r.v; }
      else if (r.e) {
        if (r.a === 'value' || r.a === 'prop:value') { if (r.e.value !== r.v) r.e.value = r.v; }
        else if (r.e.getAttribute(r.a) !== r.v) r.e.setAttribute(r.a, r.v);
      }
    }
    var title = root.__onetapTitle;
    if (title) doc.title = title;
    doc.documentElement.lang = 'ko';
  }

  /* ---------- language switch UI ---------- */
  function buildSwitch() {
    var wrap = doc.createElement('div');
    wrap.className = 'onetap-lang';
    wrap.setAttribute('role', 'group');
    wrap.innerHTML = '<button type="button" data-onetap-lang="ko" aria-pressed="true">KO</button>' +
      '<button type="button" data-onetap-lang="en" aria-pressed="false">EN</button>';
    var box = doc.querySelector('.top-actions') || doc.querySelector('.topbar__inner') ||
      doc.querySelector('.topbar-inner') || doc.querySelector('.topbar-in') ||
      doc.querySelector('.topbar') || doc.querySelector('header');
    if (box) {
      if (box.classList.contains('top-actions')) box.insertBefore(wrap, box.firstChild);
      else {
        var act = box.querySelector('.top-actions');
        if (act) box.insertBefore(wrap, act); else box.appendChild(wrap);
      }
    } else {
      wrap.style.cssText = 'position:fixed;top:10px;right:10px;z-index:99999;background:rgba(255,255,255,.9);color:#111';
      doc.body.appendChild(wrap);
    }
    wrap.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-onetap-lang]');
      if (!b) return;
      setLang(b.getAttribute('data-onetap-lang'));
    });
    return wrap;
  }

  var CSS = '.onetap-lang{display:inline-flex;flex:none;align-items:center;padding:2px;border:1px solid currentColor;border-radius:999px;opacity:.72;transition:opacity .15s;vertical-align:middle;align-self:center}' +
    '.onetap-lang:hover,.onetap-lang:focus-within{opacity:1}' +
    '.onetap-lang button{appearance:none;-webkit-appearance:none;border:0;background:transparent;color:inherit;font:inherit;font-size:10.5px;font-weight:700;letter-spacing:.04em;line-height:1;padding:5px 6px;border-radius:999px;cursor:pointer;min-width:26px;text-align:center}' +
    '.onetap-lang button[aria-pressed="true"]{background:rgba(128,128,128,.3)}' +
    '@media (max-width:520px){.onetap-lang button{padding:4px 4px;font-size:10px;min-width:22px}.onetap-lang{margin-left:2px}}';

  function injectCss() {
    var s = doc.createElement('style');
    s.id = 'onetap-lang-css';
    s.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(s);
  }

  function paintSwitch() {
    var bs = doc.querySelectorAll('[data-onetap-lang]');
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-onetap-lang') === state.lang ? 'true' : 'false');
    }
    var wrap = doc.querySelector('.onetap-lang');
    if (wrap) wrap.setAttribute('aria-label', state.lang === 'ko' ? '언어' : 'Language');
  }

  /* ---------- observe ---------- */
  function startObserver() {
    if (observer || !root.MutationObserver) return;
    observer = new MutationObserver(function (muts) {
      if (state.lang !== 'en') return;
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'characterData') { trText(m.target); continue; }
        if (m.type === 'attributes') { if (m.target.nodeType === 1 && !skipped(m.target)) trAttrs(m.target); continue; }
        for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    });
    observer.observe(doc.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'] });
  }

  function setLang(lang) {
    state.lang = lang === 'en' ? 'en' : 'ko';
    try { root.localStorage.setItem(LANG_KEY, state.lang); } catch (e) { /* private mode */ }
    if (state.lang === 'en') {
      applyEn();
      startObserver();
    } else {
      if (observer) { observer.disconnect(); observer = null; }
      restoreKo();
    }
    paintSwitch();
    try { doc.dispatchEvent(new CustomEvent('onetap:lang', { detail: { lang: state.lang } })); } catch (e) { /* old */ }
  }

  function boot() {
    injectCss();
    buildSwitch();
    state.lang = detect();
    if (state.lang === 'en') {
      applyEn();
      startObserver();
    } else {
      doc.documentElement.lang = 'ko';
    }
    paintSwitch();
    root.ONETAP_I18N = {
      lang: function () { return state.lang; },
      setLang: setLang,
      t: tr,
      missing: function () { return missingList.slice(); },
      dict: DICT
    };
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
