export function studentName(persona) {
  return persona.label.trim()
}

/** 부를 때 쓰는 이름. 최성원 → 성원 */
export function callName(persona) {
  const full = studentName(persona)
  return full.length >= 3 ? full.slice(1) : full
}

export const MODES = {
  senior: {
    id: 'senior',
    label: '선배 모드',
    short: '선배',
    desc: '먼저 겪어 본 선배가 피드백을 줘요. 다정한 반말.',
  },
  mate: {
    id: 'mate',
    label: '메이트 모드',
    short: '메이트',
    desc: '같이 학기를 굴리는 학업 메이트. 편한 친구 말투.',
  },
}

/** 홈 "이번 학기 체크" 카드 */
export function urgency(persona) {
  if (persona.id === 'freshman') {
    return [
      {
        when: '이번 학기',
        title: '자료구조입문',
        detail: '2학년 전공의 출발점. 여기서 막히면 뒤가 다 밀려요',
        ask: '자료구조입문이 왜 중요한지 알려줘',
      },
      {
        when: '2학기 안에',
        title: '교양 영역 하나 열기',
        detail: '음악의이해로 예술 영역을 먼저 채워 두면 나중에 편해요',
        ask: '들을 만한 교양 추천해줘',
      },
    ]
  }
  if (persona.id === 'sophomore') {
    return [
      {
        when: '이번 학기',
        title: '운영체제 · 알고리즘',
        detail: '3학년 전공과 코딩테스트가 여기서 갈려요',
        ask: '이번 학기에 뭘 해야 할까?',
      },
      {
        when: '다음 학기까지',
        title: '외국어 교양 1과목',
        detail: '4영역이 비어 있어요. 영어회화 한 과목이면 닫혀요',
        ask: '들을 만한 교양 추천해줘',
      },
    ]
  }
  if (persona.id === 'junior') {
    return [
      {
        when: '이번 학기',
        title: '클라우드컴퓨팅',
        detail: '네이버클라우드 목표면 지금 듣고 방학에 NCA까지',
        ask: '이번 학기에 뭘 해야 할까?',
      },
      {
        when: '졸업 전까지',
        title: '예술 교양 2학점',
        detail: '전공만 쌓으면 교양 영역이 안 닫혀요',
        ask: '들을 만한 교양 추천해줘',
      },
    ]
  }
  return [
    {
      when: '10/30 마감',
      title: '졸업작품 발표 신청',
      detail: '캡스톤디자인2 결과물을 등록해야 최종발표를 할 수 있어요',
      ask: '졸업까지 뭐가 남았어?',
    },
    {
      when: '11/6 마감',
      title: '졸업인증 서류',
      detail: '자격증·공모전·어학 중 하나. NCA 합격증이면 돼요',
      ask: '졸업인증 뭘로 내는 게 좋을까?',
    },
  ]
}

const OPENING = {
  senior: {
    freshman: (n) => `${n}아, 1학년 2학기 잘 버티고 있어? 프로그래밍기초 끝냈으면 이번 학기는 자료구조입문이랑 이산수학이 핵심이야.
자격증은 지금 신경 안 써도 돼. 뭐 궁금한 거 있으면 편하게 물어봐.`,
    sophomore: (n) => `${n}아, 2학년 2학기면 전공 기둥 세우는 학기야. 운영체제·알고리즘·데이터베이스·확통, 이 넷은 나중에 진로가 뭐든 다 써.
진로 아직 못 정했어도 괜찮아. 같이 정리해 보자.`,
    junior: (n) => `${n}아, 네이버클라우드 쪽으로 마음 굳혔다며. 그럼 이번 학기 클라우드컴퓨팅은 꼭 챙기고, 방학에 NCA 하나 따 두면 좋아.
예술 교양 2학점도 비어 있으니까 같이 보자.`,
    senior: (n) => `${n}아, 121학점이면 수업은 거의 끝났네. 남은 건 졸업작품 최종발표랑 졸업인증 서류야.
발표 신청이 10/30 마감이니까 그것부터 챙기자. 공지 오면 공지 탭에 붙여 넣어 줘, 마감일 캘린더에 넣어 줄게.`,
  },
  mate: {
    freshman: (n) => `${n}, 2학기 시작했네! 우리 이번 학기는 자료구조입문이랑 이산수학만 확실히 잡자.
자격증은 아직 아니고. 뭐부터 볼까?`,
    sophomore: (n) => `${n}, 이번 학기 운영체제·알고리즘·DB·확통 풀세트네. 진로 아직 애매해도 이 넷은 어디 가든 쓰이니까 같이 버텨 보자.
과제 일정이랑 같이 정리해 줄까?`,
    junior: (n) => `${n}, 네이버클라우드 가기로 했으니 이번 학기는 클라우드컴퓨팅이 메인이야. 방학엔 NCA 같이 준비하자.
예술 교양 2학점 남은 것도 잊지 말고!`,
    senior: (n) => `${n}, 이제 진짜 마지막 학기다. 졸업작품 발표 신청(10/30)이랑 졸업인증 서류(11/6), 이 두 개만 넘기면 끝이야.
공지 붙여 넣으면 마감일 캘린더에 바로 넣어 줄게.`,
  },
}

export function openingNote(persona, mode = 'senior') {
  const table = OPENING[mode] || OPENING.senior
  return (table[persona.id] || table.senior)(callName(persona))
}

/** API 키가 없거나 응답이 없을 때 쓰는 로컬 답변. 선배 톤. */
export function localAdvice(persona, question) {
  const n = callName(persona)
  const q = question.replace(/\s+/g, '')
  const audit = persona.profile.gradAudit

  if (/저장|캘린더|ics|마감/i.test(question) && /공지|안내|접수|교무|학과/i.test(question)) {
    return null
  }

  if (q.includes('졸업인증')) {
    return `${n}아, 졸업인증은 자격증·공모전·어학 중 하나만 내면 돼.
네이버클라우드 목표면 **NCA**가 제일 자연스러워. 취업 준비랑 같이 가니까.
- 이미 딴 자격증이 있으면 그걸로 바로 제출
- 없으면 NCA 시험 일정부터 잡고, 11/6 전에 합격증 제출
정보처리기사도 인정되는데 일정이 빠듯할 수 있어.`
  }

  if (q.includes('졸업')) {
    if (!audit) {
      return `${n}아, 1학년은 아직 졸업사정 대상이 아니라 걱정 안 해도 돼.
지금은 교양 영역을 하나씩 열어 두고, 자료구조입문·이산수학 같은 전공 기초를 잘 다지는 게 전부야.
그거면 2학년이 훨씬 편해져.`
    }
    if (persona.id === 'sophomore') {
      return `${n}아, 2학년은 졸업 체크보다 전공 기둥이 먼저야. 그래도 지금 보이는 빈칸은 하나 있어.
- [ ] ${audit.missing.join('\n- [ ] ')}

학점은 ${audit.totalCredits}. 이번 학기는 운영체제·알고리즘·DB·확통 잘 마무리하고, 외국어 교양은 다음 학기에 넣어도 늦지 않아.`
    }
    const missing = audit.missing.map((item) => `- [ ] ${item}`).join('\n')
    return `${n}아, 지금 남은 건 이거야.
${missing}

학점은 ${audit.totalCredits}까지 왔으니까 수업 추가보다 이 빈칸부터 닫는 게 우선이야. 발표 신청 마감(10/30) 놓치지 말자.`
  }

  if (q.includes('교양')) {
    if (persona.id === 'sophomore') {
      return `${n}아, 4영역 외국어가 비어 있어. 영어회화나 비즈니스영어 중 하나면 닫혀.
전공 네 과목이랑 같은 학기에 넣어도 부담은 크지 않아.`
    }
    if (persona.id === 'junior') {
      return `${n}아, 예술 교양이 비어 있어. 음악의이해나 현대예술의이해처럼 가벼운 2학점부터 넣자.
데이터리터러시만 반복해서 듣는 건 졸업사정에서 손해야.`
    }
    if (persona.id === 'senior') {
      return `${n}아, 교양은 다 채웠어. 지금은 교양보다 졸업작품 발표 신청이랑 졸업인증 서류가 먼저야.
혹시 영역이 헷갈리면 향림통 졸업사정 조회 한 번 해 보자.`
    }
    return `${n}아, 지금은 탐색 구간이라 한 영역에 몰지 마.
음악의이해로 예술 영역, 영어회화로 외국어 영역 하나씩이면 충분해.
전공이 재밌어지면 그때 교양은 자연스럽게 정리돼.`
  }

  if (q.includes('자료구조')) {
    return `${n}아, 자료구조입문은 2학년 자료구조·알고리즘의 밑바탕이야.
여기서 리스트·스택·큐·트리를 손에 익혀 두면 알고리즘 수업이 훨씬 수월해.
과제는 직접 구현해 보는 게 답이야. 복붙하면 나중에 두 배로 돌아와.`
  }

  if (persona.id === 'freshman') {
    return `${n}아, 이번 학기는 기초만 잘 닫으면 돼.
- 자료구조입문
- 이산수학
- 동아리나 작은 토이 프로젝트 하나
자격증은 아직 일러. 프로그래밍기초 위에 차근차근 쌓는 학기야.`
  }
  if (persona.id === 'sophomore') {
    return `${n}아, 2학년 2학기는 이 네 개가 핵심이야.
- 운영체제
- 알고리즘
- 데이터베이스
- 확률및통계
나중에 클라우드로 가든 AI로 가든 다 쓰이니까 지금 비우면 3학년이 고생해. 자격증은 방학에 보자.`
  }
  if (persona.id === 'junior') {
    return `${n}아, 네이버클라우드가 목표면 이번 학기는 이렇게 가자.
- 클라우드컴퓨팅 수강
- 리눅스·네트워크는 이미 있으니 방학에 NCA 준비
- 예술 교양 2학점 채우기
공모전은 방학에 넣는 편이 시간표랑 안 싸워.`
  }
  return `${n}아, 이번 학기에 수업을 더 넣을 필요는 없어.
- 졸업작품 발표 신청 (10/30 마감)
- 졸업인증 서류 (11/6 마감) — NCA 합격증이면 돼
- 캡스톤디자인2 결과물 마무리
공지 오면 붙여 넣어 줘. 마감일 캘린더에 넣어 줄게.`
}
