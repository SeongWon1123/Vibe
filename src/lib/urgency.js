import { audit, curriculumCheck } from './audit.js'

export const MODES = {
  senior: { id: 'senior', label: '선배 모드', short: '선배', desc: '먼저 겪어 본 선배가 피드백을 줘요. 다정한 반말.' },
  mate: { id: 'mate', label: '메이트 모드', short: '메이트', desc: '같이 학기를 굴리는 학업 메이트. 편한 친구 말투.' },
}

/** 인사말은 한 문장. 조언은 물어봐야 나온다. */
export function openingNote(profile, mode = 'senior') {
  const g = profile.grade
  if (mode === 'mate') return g === 4 ? '마지막 학기네. 뭐부터 같이 볼까?' : `${profile.semester} 시작! 뭐부터 볼까?`
  return g === 4 ? '마지막 학기구나. 뭐가 궁금해?' : `${profile.semester}네. 뭐가 궁금해?`
}

/** API 키가 없거나 응답이 없을 때 — 물어본 것에만 짧게. 선배 톤. */
export function localAdvice(profile, question) {
  const q = question.replace(/\s+/g, '')
  const a = audit(profile)
  const chk = curriculumCheck(profile)
  const courses = profile.timetable.map((c) => c.name)
  const first = profile.interests[0]

  if (/저장|캘린더|ics|마감/i.test(question) && /공지|안내|접수|교무|학과/i.test(question)) return null

  if (q.includes('시간표') || q.includes('교육과정')) {
    if (!profile.timetable.length) return `시간표가 아직 비어 있어. 시간표 탭에서 과목을 넣으면 교육과정이랑 바로 대조해 줄게.`
    return `교육과정표랑 대조해 봤어.\n${chk.lines.map((l) => `- ${l}`).join('\n')}\n- ${chk.load}`
  }
  if (q.includes('포트폴리오')) {
    return `순서는 이렇게 가면 돼.
1. GitHub 프로필이랑 README부터 — 첫인상이야
2. 캡스톤을 "문제 → 내가 한 일 → 결과" 한 장으로
3. 자격증·수상은 한 줄씩만
${courses.includes('캡스톤디자인2') ? '시간표에 캡스톤디자인2가 있으니 그 결과물이 메인이야.' : '캡스톤이 없으면 개인 프로젝트 하나를 메인으로.'}`
  }
  if (q.includes('이력서')) {
    return `이력서는 한 장이면 충분해.
- 프로젝트 2~3개: 뭘 만들었는지보다 어떤 문제를 어떻게 풀었는지
- 기술 스택은 실제로 써 본 것만
- 자격증·수상·인턴
${profile.goal === '취업' ? '지원 직무 키워드를 상단에 두면 눈에 잘 띄어.' : '목표가 정해지면 그에 맞춰 순서를 바꾸자.'}`
  }
  if (q.includes('자격증')) {
    if (profile.interests.includes('클라우드·인프라')) return `클라우드 쪽이면 **NCA**(네이버클라우드)가 제일 자연스럽고, 다음이 AWS Cloud Practitioner. 둘 다 졸업인증에 쓸 수 있어.`
    if (profile.interests.includes('AI·데이터')) return `데이터 쪽이면 **SQLD**가 무난하고, 빅데이터분석기사는 4학년 때. 공모전 수상도 졸업인증으로 인정돼.`
    return `정보처리기사가 가장 범용이야. 관심 분야가 정해지면 그쪽 자격증으로 바꿔도 늦지 않아.`
  }
  if (q.includes('활동') || q.includes('동아리')) {
    return first && first !== '아직 모르겠어'
      ? `${first} 쪽이면 학과 스터디나 관련 동아리에 먼저 들어가 봐. 한 학기 해 보고 재미없으면 바꿔도 돼.`
      : `아직 모르겠으면 여러 개 살짝 발 담그는 게 맞아. 코딩 동아리 하나, 흥미 위주 하나. 한 학기면 감이 와.`
  }
  if (q.includes('졸업')) {
    if (!a.entered) return `학점이 아직 입력 안 됐어. 내 정보에서 총/전공/교양 학점을 넣으면 졸업까지 남은 걸 계산해 줄게.`
    return `입력한 학점 기준으로:
- 이수 ${profile.credits.total} + 이번 학기 ${a.planned} = 예상 ${a.expected}학점
- 졸업 ${a.grad.total}학점까지 ${a.remaining}학점 남음 (${profile.entryYear}학번 기준)
${a.missing.length ? '- ' + a.missing.join('\n- ') : '- 학점 요건은 채워져. 졸업인증·졸업작품만 확인'}`
  }
  if (q.includes('교양')) {
    return a.generalLeft > 0
      ? `교양이 ${a.generalLeft}학점 남았어. ${first === '게임' ? '영상예술입문' : '음악의이해나 현대예술의이해'}처럼 부담 적은 2학점부터 넣자.`
      : `교양 학점은 다 채웠어. 영역이 비었는지는 향림통 졸업사정에서 한 번만 확인해.`
  }
  if (q.includes('3학년') || q.includes('미리')) {
    return `3학년은 트랙이 갈리는 해야. ${first === '클라우드·인프라' ? '클라우드컴퓨팅·웹서버프로그래밍' : first === 'AI·데이터' ? '머신러닝·데이터엔지니어링' : '네트워크·머신러닝을 둘 다 들어 보고'} 쪽으로 잡으면 돼.`
  }
  if (q.includes('프로젝트')) {
    return `작게, 배포까지가 포인트야. ${first === '웹 개발' ? '게시판 하나를 로그인까지 붙여서 배포' : first === '클라우드·인프라' ? '리눅스 서버에 직접 올려 보는 홈랩' : '관심 있는 데이터로 간단한 분석 페이지'} 정도면 충분해.`
  }
  if (q.includes('자료구조')) return `리스트·스택·큐·트리를 직접 구현해 보는 게 답이야. 과제 복붙하면 알고리즘 때 두 배로 돌아와.`

  if (!profile.timetable.length) return `시간표를 먼저 넣어 줘. 그래야 이번 학기 기준으로 말할 수 있어.`
  return `시간표 기준으로는 ${courses.slice(0, 3).join(', ')}${courses.length > 3 ? ' 등' : ''} ${a.planned}학점이야.
${chk.lines[0] ? chk.lines[0] + '\n' : ''}${profile.grade === 1 ? '기초 과목 잘 잡고, 관심 분야 하나만 찔러 보면 충분해.' : profile.grade === 2 ? '전공 기둥 학기야. 트랙은 이 과목들 듣다 보면 보여.' : profile.grade === 3 ? '수업 + 자격증 하나. 인턴은 겨울에 지원.' : '수업보다 포트폴리오·졸업작품이 우선이야.'}`
}
