export const GRAD = { total: 130, major: 70, general: 30 }

export const INTERESTS = ['웹 개발', '클라우드·인프라', 'AI·데이터', '게임', '보안', '임베디드', '아직 모르겠어']
export const GOALS = ['취업', '대학원', '창업', '아직 없음']

export const DAYS = ['월', '화', '수', '목', '금']
/** 1교시 = 9:00, 1시간 단위 9교시까지 */
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
export const periodLabel = (p) => `${8 + p}:00`

export const semesterLabel = (grade) => `${grade}학년 2학기`

/** 학년별 "다음 한 걸음" — 홈 카드. 성향·관심을 넓히는 1학년 → 포트폴리오를 닫는 4학년. */
export function nextSteps(profile) {
  const g = profile.grade
  const cloud = profile.interests.includes('클라우드·인프라')
  const ai = profile.interests.includes('AI·데이터')
  const unsure = profile.interests.includes('아직 모르겠어') || profile.interests.length === 0
  if (g === 1) {
    return [
      { when: '이번 학기', title: '관심 분야 하나 찔러보기', detail: unsure ? '동아리나 작은 토이 프로젝트로 뭐가 재밌는지부터' : `${profile.interests[0]} 쪽 스터디나 동아리에 발 담가 보기`, ask: '내 관심사에 맞는 활동 뭐가 있어?' },
      { when: '기초', title: '자료구조·이산수학', detail: '2학년 전공의 출발점. 여기만 잘 잡아도 다음 학기가 편해요', ask: '자료구조입문 어떻게 공부해?' },
    ]
  }
  if (g === 2) {
    return [
      { when: '이번 학기', title: '트랙 정하기', detail: unsure ? '운영체제·DB·알고리즘 듣다 보면 끌리는 쪽이 보여요' : `${profile.interests[0]} 트랙 기준으로 3학년 과목 미리 보기`, ask: '3학년에 뭘 들으면 좋을지 미리 알려줘' },
      { when: '방학', title: '첫 개인 프로젝트', detail: '작아도 배포까지. 포트폴리오 첫 줄이 돼요', ask: '2학년 방학에 할 만한 프로젝트 추천해줘' },
    ]
  }
  if (g === 3) {
    return [
      { when: '방학 전', title: cloud ? 'NCA · AWS 자격증' : ai ? '데이터·AI 공모전' : '자격증 하나', detail: '졸업인증에도 쓰이고 이력서 한 줄이 돼요', ask: '내 진로에 맞는 자격증 뭐가 좋아?' },
      { when: '이번 학기', title: '인턴·현장실습 알아보기', detail: '4학년 1학기 현장실습은 3학년 겨울에 지원해요', ask: '현장실습 언제 뭘 준비해?' },
    ]
  }
  return [
    { when: '지금', title: '포트폴리오 정리', detail: '캡스톤·개인 프로젝트를 문제→해결→결과로. GitHub README부터', ask: '포트폴리오 뭐부터 정리해?' },
    { when: '10월', title: '이력서·채용 일정', detail: profile.goal === '대학원' ? '연구실 컨택과 자기소개서를 먼저' : '하반기 공채·상시 채용 캘린더 만들기', ask: profile.goal === '대학원' ? '대학원 준비 뭐부터 해?' : '이력서에 뭘 써야 해?' },
  ]
}

export function quickQuestions(grade) {
  if (grade === 1) return ['내 시간표 교육과정이랑 맞아?', '내 관심사에 맞는 활동 뭐가 있어?', '들을 만한 교양 추천해줘']
  if (grade === 2) return ['내 시간표 교육과정이랑 맞아?', '3학년에 뭘 들으면 좋을지 미리 알려줘', '들을 만한 교양 추천해줘']
  if (grade === 3) return ['내 시간표 교육과정이랑 맞아?', '내 진로에 맞는 자격증 뭐가 좋아?', '졸업까지 뭐가 남았어?']
  return ['포트폴리오 뭐부터 정리해?', '이력서에 뭘 써야 해?', '졸업까지 뭐가 남았어?']
}

export const PORTFOLIO = [
  { id: 'github', label: 'GitHub 프로필·README 정리' },
  { id: 'capstone', label: '캡스톤을 프로젝트 소개 1장으로' },
  { id: 'cert', label: '자격증·수상 정리 (졸업인증 겸용)' },
  { id: 'resume', label: '이력서 초안 1장' },
  { id: 'apply', label: '지원할 곳 5개 리스트' },
]

/** 상담에서 언급되면 관심 키워드로 쌓이는 단어 */
export const KEYWORDS = ['클라우드', '백엔드', '프론트', 'AI', '데이터', '게임', '보안', '임베디드', '대학원', '취업', '창업', '공모전', '자격증', '인턴', '포트폴리오', '알고리즘', '네트워크']
