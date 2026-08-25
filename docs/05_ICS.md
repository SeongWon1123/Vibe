# 05. 공지 → 캘린더 (.ics) (진짜 심장 2)

> 목표: 공지 붙여넣기 → "저장해줘" → .ics 다운로드 → 캘린더 등록
> 예상 소요: 2~3시간

---

## A. .ics 생성 유틸 — `src/lib/ics.js`

작업 지시 (Cursor):

```js
export function buildIcs({ title, date, time = '09:00', location = '' }) {
  const dt = date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DongHak//KR',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@donghak`,
    `DTSTART;TZID=Asia/Seoul:${dt}`,
    `SUMMARY:${title}`,
    location ? `LOCATION:${location}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title} 하루 전 알림`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

export function downloadIcs(icsString, filename = 'donghak-event.ics') {
  const blob = new Blob([icsString], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
```

## B. 응답 파싱 & 버튼 — `IcsButton.jsx` + `ChatWindow.jsx`

1. 어시스턴트 응답에서 `[ICS]...[/ICS]` 패턴을 정규식으로 추출, JSON 파싱
2. 파싱 성공 시: 채팅 말풍선에서 해당 원문 라인은 숨기고, 대신 메시지 아래에 카드 렌더:
   ```
   📅 토익 정기시험 접수 마감
   2026-09-12 (토) 09:00 · 온라인
   [ 내 캘린더에 저장 ]
   ```
3. 버튼 클릭 → `buildIcs` → `downloadIcs`
4. 파싱 실패(JSON 깨짐) 시 카드 없이 텍스트만 표시 (앱이 죽으면 안 됨)

## C. 데모용 공지 샘플 준비

`docs/demo_notice.txt`로 저장해두고 데모 때 복붙:

```
[교무처] 2026학년도 2학기 공인영어성적 제출 안내
졸업예정자는 토익 성적표를 9월 25일(금)까지 제출해야 합니다.
다음 토익 정기시험: 2026년 9월 12일(토) 오전 9시, 접수 마감 9월 1일(화)
```

- 이 공지를 붙여넣고 "저장해줘" → LLM이 [ICS] JSON 출력 → 카드 → 다운로드 → 폰 캘린더에 뜨는 화면까지가 데모 장면
- **주의**: 날짜가 2개 이상인 공지에서 LLM이 어떤 날짜를 고르는지 확인. "접수 마감일을 저장해줘"처럼 명시하는 흐름으로 데모 대본 확정

## 완료 기준

- [ ] 샘플 공지 → "접수 마감일 저장해줘" → 카드 표시 → .ics 다운로드 성공
- [ ] 다운로드한 .ics를 실제 구글 캘린더(또는 아이폰 캘린더)에서 열면 일정이 정상 등록됨 — **날짜/시간/제목 3개 모두 정확**
- [ ] [ICS] 원문 JSON이 사용자에게 노출되지 않음
- [ ] JSON 파싱 실패 시에도 앱 정상 동작

## 검증 보고 (Claude에게)

- 캘린더에 등록된 일정 스크린샷
- LLM이 출력한 [ICS] JSON 원문 2~3개 사례
