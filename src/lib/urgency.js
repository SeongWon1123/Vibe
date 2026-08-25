export function studentName(persona) {
  return persona.label.trim()
}

export function urgency(persona) {
  if (persona.id === 'freshman') {
    return [
      {
        when: '이번 학기',
        title: '자료구조입문',
        detail: '2학기 전공 기초인데 아직 수강 기록이 없음',
        ask: '이번 학기에 뭘 해야 할까?',
      },
      {
        when: '이번 학기',
        title: '이산수학',
        detail: '알고리즘 가기 전에 구멍이 나면 이후가 힘듦',
        ask: '이번 학기에 뭘 해야 할까?',
      },
    ]
  }
  if (persona.id === 'sophomore') {
    return [
      {
        when: '이번 학기',
        title: '알고리즘',
        detail: '2학기 핵심. 비우면 3학년이 같이 흔들림',
        ask: '이번 학기에 뭘 해야 할까?',
      },
      {
        when: '이번 학기',
        title: '운영체제',
        detail: '클라우드 가기 전에 필요한 기둥',
        ask: '이번 학기에 뭘 해야 할까?',
      },
    ]
  }
  if (persona.id === 'junior') {
    return [
      {
        when: '이번 학기',
        title: '클라우드컴퓨팅',
        detail: '네이버클라우드 가려면 이 과목이 비어 있음',
        ask: '이번 학기에 뭘 해야 할까?',
      },
      {
        when: '졸업 공백',
        title: '예술 교양 2학점',
        detail: '전공만 쌓아도 영역이 안 닫힘',
        ask: '들을 만한 교양 추천해줘',
      },
    ]
  }
  return [
    {
      when: '졸업 보류',
      title: '공인영어성적',
      detail: '학점 121이어도 미제출이면 졸업이 막힐 수 있음',
      ask: '졸업까지 뭐가 남았어?',
    },
    {
      when: '그다음',
      title: '졸업작품 최종발표',
      detail: '캡스톤디자인1은 끝났고 발표가 남음',
      ask: '졸업까지 뭐가 남았어?',
    },
  ]
}

export function openingNote(persona) {
  const name = studentName(persona)
  if (persona.id === 'freshman') {
    return `${name}, 지금은 1학년 2학기야. 프로그래밍기초만 들었어.
이번 학기는 자료구조입문이랑 이산수학이 먼저야. 자격증은 아직 이르게.`
  }
  if (persona.id === 'sophomore') {
    return `${name}, 1학년 기초는 끝났고 이번이 전공 기둥 학기야.
운영체제, 알고리즘, 데이터베이스, 확률및통계. 진로가 아직 흔들려도 이 네 개는 나중에 다 써.`
  }
  if (persona.id === 'junior') {
    return `${name}, 네이버클라우드로 마음이 기울었으면 이번 학기 구멍은 분명해.
클라우드컴퓨팅이 아직이고, 예술 교양 2학점도 비어 있어.`
  }
  return `${name}, 학점 121이면 수업은 거의 끝났어.
남은 건 공인영어성적이랑 졸업작품 최종발표. 영어가 먼저야. 공지는 옆에 붙여 넣으면 돼.`
}

export function localAdvice(persona, question) {
  const name = studentName(persona)
  const q = question.replace(/\s+/g, '')

  if (/저장|캘린더|ics|마감/i.test(question) && /공지|토익|영어|교무/i.test(question)) {
    return null
  }

  if (q.includes('졸업')) {
    if (!persona.profile.gradAudit) {
      return `${name}, 1학년은 아직 졸업사정 대상이 아니야.
지금 볼 건 교양 영역을 하나씩 열어두는 것과 2학기 전공 기초.
자료구조입문, 이산수학부터 들으면 이후 학기가 편해져.`
    }
    if (persona.id === 'sophomore') {
      return `${name}, 2학년은 졸업 체크보다 전공 기둥이 급해.
지금 구멍은 이거야.
- [ ] ${persona.profile.gradAudit.missing.join('\n- [ ] ')}

학점 ${persona.profile.gradAudit.totalCredits}. 이번 학기는 운영체제·알고리즘·DB·확통을 닫는 쪽이 맞아.`
    }
    const missing = persona.profile.gradAudit.missing
      .map((item) => `- [ ] ${item}`)
      .join('\n')
    return `${name}, 지금 남은 건 이거야.
${missing}

학점 ${persona.profile.gradAudit.totalCredits}까지는 왔어. 빈칸부터 닫는 게 수강 추가보다 급해.`
  }

  if (q.includes('교양')) {
    if (persona.id === 'sophomore') {
      return `${name}, 4영역 외국어가 비어 있어.
영어회화나 비즈니스영어 한 과목이면 닫혀. 전공 네 기둥과 같은 학기에 넣어도 돼.`
    }
    if (persona.id === 'junior') {
      return `${name}, 예술 교양이 비어 있어.
클라우드·백엔드면 음악의이해나 현대예술의이해처럼 부담 적은 2학점부터.
데이터리터러시만 반복하면 졸업사정에서 손해야.`
    }
    if (persona.id === 'senior') {
      return `${name}, 교양보다 영어성적이 먼저야.
교양 영역이 궁금하면 학과 사무실 확인이 필요해. 지금 남은 교양 공백은 없어.`
    }
    return `${name}, 지금은 탐색 구간이라 한 영역에 몰지 마.
1영역 예술(음악의이해), 4영역 영어회화 하나씩이면 충분해.`
  }

  if (persona.id === 'freshman') {
    return `${name}, 이번 학기는 기초만 닫으면 돼.
- 자료구조입문
- 이산수학
- 동아리나 작은 토이 프로젝트 하나
자격증은 아직 일러. 프로그래밍기초 위에 쌓는 학기야.`
  }
  if (persona.id === 'sophomore') {
    return `${name}, 2학년 2학기는 이 네 개야.
- 운영체제
- 알고리즘
- 데이터베이스
- 확률및통계
나중에 클라우드로 가든 AI로 가든, 지금 비우면 3학년이 고생해. 자격증은 방학에.`
  }
  if (persona.id === 'junior') {
    return `${name}, 목표가 네이버클라우드면 이번 학기는 이거야.
- 클라우드컴퓨팅 수강
- 리눅스·네트워크는 이미 있으니 NCA 준비
- 예술 교양 2학점
공모전은 방학에 넣는 편이 시간표랑 안 싸워.`
  }
  return `${name}, 수업을 더 넣는 게 급한 게 아니야.
공인영어성적부터 막아. 토익 접수 공지가 있으면 붙여 줘. 마감일을 캘린더에 넣을게.
졸업작품 최종발표는 그다음이야.`
}
