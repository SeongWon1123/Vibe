# 동학 (DongHak)

국립순천대학교 학생의 4년을 함께하는 AI 학사 에이전트.

클라우드 에이전트는 `C:\Users\Administrator\Desktop\VIbe`에 직접 쓰지 못합니다. 코드는 GitHub `main`에 있습니다. 로컬 폴더에서 아래만 실행하면 됩니다.

## 로컬로 가져오기 (Windows)

PowerShell:

```powershell
cd C:\Users\Administrator\Desktop\VIbe

# 이미 이 저장소를 clone한 폴더라면
git fetch origin
git checkout main
git pull origin main

# 폴더만 있고 git이 아니면
# git clone https://github.com/SeongWon1123/Vibe.git .
```

## 환경 만들기

이 프로젝트는 Python venv가 아니라 **Node.js**입니다. Node 18 이상이 필요합니다.

```powershell
cd C:\Users\Administrator\Desktop\VIbe
.\setup.ps1
```

또는 수동:

```powershell
node -v
npm install
copy .env.example .env.local
notepad .env.local
npm run dev
```

브라우저: http://localhost:3000

`.env.local`의 `LLM_API_KEY`를 실제 키로 바꾼 뒤에 채팅이 살아납니다. 키가 없으면 UI는 뜨고 답은 더미입니다.

## 계획 문서

`docs/00_MASTER_PLAN.md`부터 `07`까지.
