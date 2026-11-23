# 서드파티 고지 (Third-Party Notices)

이 스튜디오는 아래 오픈소스를 **저장소 안에 함께 넣어(벤더링)** 씁니다. 실행할 때 외부 서버로 요청하지 않습니다.
무거운 라이브러리(heic2any)는 사진을 실제로 올릴 때만 같은 저장소에서 불러옵니다.

| 구성 요소 | 버전 | 라이선스 | 쓰는 곳 | 원본 |
| --- | --- | --- | --- | --- |
| heic2any | 0.0.4 | MIT | `assets/vendor/heic2any.min.js` — 아이폰 HEIC/HEIF 사진을 JPEG로 변환 (필요할 때만 로드) | https://github.com/alexcorvi/heic2any |
| Cropper.js | 1.6.2 | MIT | `assets/vendor/cropper.min.js`, `cropper.min.css` — 프로필 사진 정사각 자르기 | https://github.com/fengyuanchen/cropperjs |
| qr-code-styling | 1.9.2 | MIT | `assets/vendor/qr-code-styling.js` — 공유 주소 QR(SVG/PNG) 생성 | https://github.com/kozakdenys/qr-code-styling |

내보낸 `index.html`에는 위 라이브러리가 들어가지 않습니다. 결과물은 순수 HTML+CSS+인라인 스크립트 한 파일입니다.
QR은 data URI(SVG) 그림으로만 삽입되므로 외부 요청이 0건입니다.

## MIT License

Copyright (c) the respective authors:

- heic2any — Copyright (c) Alex Corvi
- Cropper.js — Copyright (c) Chen Fengyuan
- qr-code-styling — Copyright (c) Denys Kozak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
