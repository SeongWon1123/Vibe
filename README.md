# 동학 (同學, DongHak)

4학년이 되어서야 알게 되는 것들을, 1학년부터 같이 봐 주는 국립순천대학교 AI 학사 선배.
같은 질문 "이번 학기에 뭘 해야 할까?"에도 학년·이수과목·목표에 따라 다른 답을 준다.

- 데모: https://donghak.vercel.app
- 바이브코딩 경진대회 "우리가 만드는 더 나은 대학생활" 출품작 · 최성원

## 기능

| 기능 | 설명 |
|---|---|
| 성장형 프로필 상담 | 한 학생(최성원)의 1~4학년 프로필을 골라 같은 질문을 던지면 학년마다 다른 답 |
| 졸업요건 체크 | 이수 학점 / 130학점 진행률과 아직 안 닫힌 요건 |
| 공지 → 캘린더 | 학과 공지를 붙여 넣으면 접수 마감만 뽑아 `.ics` 다운로드 (하루 전 알림 포함) |

## 화면

인트로 → 학년 선택 → 홈 · 상담 · 공지 · 내 정보 (하단 4탭). 폰에서는 앱처럼, PC에서는 폰 프레임으로 보인다.

## 실행 (3줄)

```powershell
npm install
copy .env.example .env.local   # LLM_API_KEY 채우기 (OpenRouter 권장)
npm run dev                     # http://localhost:3000
```

`.env.local`:

```
LLM_API_KEY=sk-or-v1-...
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=openai/gpt-4o-mini
```

키가 없으면 로컬 규칙 기반 답변으로 대체되어 데모는 계속 동작한다.

## 구조

```
api/chat.js          LLM 프록시 (Vercel Function) — 키는 서버에만, IP당 분당 10회
src/App.jsx          화면 상태(intro/pick/home/chat/notice/me)
src/hooks/useChat.js 대화 상태 + 시스템 프롬프트 조립
src/components/      Intro, PersonaPicker, Home, Chat, Notice, Profile, TabBar, Scene
src/data/            personas.json (최성원 1~4학년), knowledge.js (학사 지식베이스 · 샘플)
src/lib/             ics.js (.ics 생성), notice.js (공지에서 마감일 추출), urgency.js (로컬 조언)
docs/                계획 문서 00~07, 제출 문구, 디자인 참고 시안
submission/          대표 이미지 · 발표자료 PDF 소스
```

## 배포

Vercel. 환경변수 `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`을 Production에 등록하면 끝.

※ 데모는 가상 학생 데이터와 샘플 교육과정을 사용한다. 실서비스에는 본인 인증과 학사시스템 연동이 필요하다.
