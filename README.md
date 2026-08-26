# 동학 (同學, DongHak)

1학년의 관심사부터 4학년의 포트폴리오까지 — 학생의 성향과 관심분야를 학기마다 알아가며, 지금 해야 할 한 걸음을 알려주는 AI 학사 메이트.

- 데모: https://donghak.vercel.app
- 바이브코딩 경진대회 "우리가 만드는 더 나은 대학생활" 출품작 · 최성원

## 기능

| 기능 | 설명 |
|---|---|
| 성향·관심 파악 | 온보딩(학년·관심·목표) + 상담 키워드로 프로필이 자라고, 학년별 '다음 한 걸음' 제안 |
| 학점 관리 · 시간표 | 학점·시간표 직접 입력 → 교육과정표와 대조(전필 누락·선수과목·학점 부담), 졸업까지 남은 학점 계산 |
| 선배 / 메이트 모드 | 말투 선택. 물어본 것에만 답함 |
| 공지 → 캘린더 | 학과 공지를 붙여 넣으면 접수 마감만 뽑아 `.ics` 다운로드 (하루 전 알림 포함) |

## 화면

인트로 → 온보딩(학년·관심·목표·학점·말투) → 시간표 → 홈 · 상담 · 공지 · 내 정보 (하단 4탭). 프로필은 브라우저에만 저장된다. 폰에서는 앱처럼, PC에서는 폰 프레임으로 보인다.

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
src/App.jsx          화면 상태(intro/onboard/timetable/home/chat/notice/me)
src/hooks/useProfile.js 학년·관심·목표·학점·시간표·키워드 (localStorage)
src/hooks/useChat.js 대화 상태 + 시스템 프롬프트 조립
src/components/      Intro, Onboarding, Timetable, Home, Chat, Notice, Profile, TabBar, Scene
src/data/            curriculum.js (교육과정표 · 샘플), standard.js (다음 한 걸음), calendar.js, notices.js, knowledge.js
src/lib/             audit.js (학점 계산 · 교육과정 대조), ics.js, notice.js (마감일 추출), urgency.js (로컬 답변)
docs/                계획 문서 00~07, 제출 문구, 디자인 참고 시안
submission/          대표 이미지 · 발표자료 PDF 소스
```

## 배포

Vercel. 환경변수 `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`을 Production에 등록하면 끝.

※ 교육과정·학사일정·공지는 샘플이다. 실서비스에는 본인 인증과 학사시스템 연동이 필요하다.
