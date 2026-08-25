export function givenName(label) {
  const parts = label.trim().split(/\s+/)
  return parts[parts.length - 1] || label
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
        detail: '2학기 핵심. 비우면 3학년 면접·전공이 같이 흔들림',
        ask: '이번 학기에 뭘 해야 할까?',
      },
      {
        when: '이번 학기',
        title: '운영체제',
        detail: '클라우드·백엔드 가기 전에 필요한 기둥',
        ask: '이번 학기에 뭘 해야 할까?',
      },
    ]
  }
  if (persona.id === 'junior') {
    return [
      {
        when: '이번 학기',
        title: '클라우드컴퓨팅',
        detail: '네이버클라우드 목표인데 전공 심화가 비어 있음',
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
  const name = givenName(persona.label)
  if (persona.id === 'freshman') {
    return `${name}, 1학년 2학기고 아직 프로그래밍기초만 들었어요.
이번 학기는 자료구조입문이랑 이산수학이 먼저입니다. 자격증은 지금 필요 없어요.`
  }
  if (persona.id === 'sophomore') {
    return `${name}, 1학년 기초는 끝났고 이번이 전공 기둥 학기예요.
운영체제, 알고리즘, 데이터베이스, 확률및통계. 진로가 미정이어도 이 네 개는 나중에 다 씁니다.`
  }
  if (persona.id === 'junior') {
    return `${name}, 네이버클라우드 가려면 이번 학기 구멍은 분명해요.
클라우드컴퓨팅이 아직이고, 예술 교양 2학점도 비어 있습니다.`
  }
  return `${name}, 학점 121이면 수업은 거의 끝났어요.
남은 건 공인영어성적이랑 졸업작품 최종발표. 영어가 먼저예요. 공지는 왼쪽에 붙여 넣으면 됩니다.`
}

export function localAdvice(persona, question) {
  const name = givenName(persona.label)
  const q = question.replace(/\s+/g, '')

  if (/저장|캘린더|ics|마감/i.test(question) && /공지|토익|영어|교무/i.test(question)) {
    return null
  }

  if (q.includes('졸업')) {
    if (!persona.profile.gradAudit) {
      return `${name}, 1학년은 아직 졸업사정 대상이 아니에요.
지금 볼 건 교양 영역을 하나씩 열어두는 것과 2학기 전공 기초입니다.
자료구조입문, 이산수학부터 들으면 이후 학기가 편해집니다.`
    }
    if (persona.id === 'sophomore') {
      return `${name}, 2학년은 졸업 체크보다 전공 기둥이 급해요.
장부에 보이는 구멍은 이거예요.
- [ ] ${persona.profile.gradAudit.missing.join('\n- [ ] ')}

학점 ${persona.profile.gradAudit.totalCredits}입니다. 이번 학기는 운영체제·알고리즘·DB·확통을 닫는 쪽이 맞아요.`
    }
    const missing = persona.profile.gradAudit.missing
      .map((item) => `- [ ] ${item}`)
      .join('\n')
    return `${name}, 지금 장부에 남은 건 이거예요.
${missing}

학점 ${persona.profile.gradAudit.totalCredits}까지는 와 있습니다. 빈칸부터 닫는 게 수강 추가보다 급해요.`
  }

  if (q.includes('교양')) {
    if (persona.id === 'sophomore') {
      return `${name}, 4영역 외국어가 비어 있어요.
영어회화나 비즈니스영어 한 과목이면 닫힙니다. 전공 네 기둥과 같은 학기에 넣어도 됩니다.`
    }
    if (persona.id === 'junior') {
      return `${name}, 예술 교양이 비어 있어요.
전공이 클라우드·백엔드니까 음악의이해나 현대예술의이해처럼 부담 적은 2학점부터 닫는 게 맞습니다.
데이터리터러시만 반복하면 졸업사정에서 손해요.`
    }
    if (persona.id === 'senior') {
      return `${name}, 교양보다 영어성적이 먼저입니다.
교양 영역이 궁금하면 학과 사무실 확인이 필요해요. 지금 장부에 남은 교양 공백은 없어요.`
    }
    return `${name}, 지금은 탐색 구간이라 한 영역에 몰지 마세요.
1영역 예술(음악의이해), 4영역 영어회화 하나씩이면 충분합니다.
게임 쪽이 끌리면 영상예술입문도 괜찮아요.`
  }

  if (persona.id === 'freshman') {
    return `${name}, 이번 학기는 기초만 닫으면 됩니다.
- 자료구조입문
- 이산수학
- 동아리나 작은 게임 하나
자격증은 아직 이릅니다. 프로그래밍기초 위에 쌓는 학기예요.`
  }
  if (persona.id === 'sophomore') {
    return `${name}, 2학년 2학기는 이 네 개입니다.
- 운영체제
- 알고리즘
- 데이터베이스
- 확률및통계
진로가 웹이든 클라우드든 AI든, 지금 비우면 3학년이 고생합니다. 자격증은 방학에 넣으세요.`
  }
  if (persona.id === 'junior') {
    return `${name}, 목표가 네이버클라우드면 이번 학기 우선순위는 이겁니다.
- 클라우드컴퓨팅 수강
- 리눅스·네트워크는 이미 있으니 NCA 준비
- 예술 교양 2학점
공모전은 방학에 넣는 편이 시간표랑 안 싸웁니다.`
  }
  return `${name}, 이번 학기에 수업을 더 넣는 게 급한 게 아니에요.
공인영어성적부터 막으세요. 토익 접수 공지가 있으면 붙여 주세요. 마감일을 캘린더에 넣겠습니다.
졸업작품 최종발표는 그다음입니다.`
}
