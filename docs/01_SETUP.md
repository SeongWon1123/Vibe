# 01. 프로젝트 셋업

> 목표: 빈 폴더 → 로컬에서 실행되는 React 골격 + Vercel Function 자리 확보
> 예상 소요: 1시간

---

## 작업 지시 (Cursor에 그대로 전달)

1. `C:\Users\Administrator\Desktop\VIbe`에서 Vite React 프로젝트를 생성한다.
   ```bash
   npm create vite@latest . -- --template react
   npm install
   npm install -D tailwindcss @tailwindcss/vite
   ```
2. Tailwind를 Vite 플러그인 방식으로 설정한다 (`vite.config.js`에 `@tailwindcss/vite` 추가, `index.css`에 `@import "tailwindcss";`).
3. 마스터 플랜 5절의 폴더 구조대로 빈 파일을 만든다:
   - `api/chat.js` (내용: `export default function handler(req, res) { res.json({ ok: true }); }`)
   - `src/components/ChatWindow.jsx`, `PersonaSwitcher.jsx`, `IcsButton.jsx` (빈 컴포넌트)
   - `src/data/personas.json` (빈 배열), `src/data/knowledge.js` (빈 문자열 export)
   - `src/lib/ics.js` (빈 함수 export)
4. `.env.local` 생성 후 `.gitignore`에 추가:
   ```
   LLM_API_KEY=발급받은키
   LLM_BASE_URL=https://api.x.ai/v1
   LLM_MODEL=grok-4-fast
   ```
5. `vercel.json` 생성:
   ```json
   { "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }] }
   ```
6. Git 초기화 + 첫 커밋. GitHub에 private 저장소로 push (제출 시 public 전환 여부는 07 단계에서 결정).
7. 로컬 개발 시 API 함수를 함께 띄우기 위해 `vercel dev` 사용을 기본으로 한다:
   ```bash
   npm i -g vercel
   vercel dev
   ```

## 완료 기준 (전부 체크)

- [ ] `vercel dev` 실행 시 브라우저에서 Vite 기본 페이지가 뜬다
- [ ] `http://localhost:3000/api/chat` 접속 시 `{ "ok": true }` 응답
- [ ] `.env.local`이 `.gitignore`에 포함되어 커밋에 노출되지 않음
- [ ] GitHub 저장소에 첫 커밋 push 완료

## 검증 보고 (Claude에게)

- 폴더 구조 스크린샷 또는 `tree /F` 출력
- `vercel dev` 실행 로그 첫 10줄
- 사용하기로 한 LLM 제공자와 모델명

## 주의

- Node 18 이상 필요. `node -v`로 먼저 확인
- Cursor가 Next.js로 바꾸자고 제안해도 거절 (Vite 유지 — 구조가 단순해야 검증이 쉬움)
