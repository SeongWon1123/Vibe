// ※ 데모용 샘플 교육과정 (knowledge.js와 같은 내용을 구조화). 실서비스에서는 학과 제공 교육과정표로 교체한다.
// type: 전필 | 전선 | 교필 | 교선
export const CURRICULUM = [
  // 1학년
  { name: '프로그래밍기초', credits: 3, grade: 1, semester: 1, type: '전필' },
  { name: '대학수학', credits: 3, grade: 1, semester: 1, type: '전선' },
  { name: '컴퓨터개론', credits: 3, grade: 1, semester: 1, type: '전필' },
  { name: '대학생활과목표설정', credits: 1, grade: 1, semester: 1, type: '교필' },
  { name: '독서와표현', credits: 2, grade: 1, semester: 1, type: '교필' },
  { name: '자료구조입문', credits: 3, grade: 1, semester: 2, type: '전필', requires: ['프로그래밍기초'] },
  { name: '이산수학', credits: 3, grade: 1, semester: 2, type: '전필' },
  { name: '컴퓨터시스템입문', credits: 3, grade: 1, semester: 2, type: '전선' },
  { name: '정량적사고와컴퓨팅사고', credits: 2, grade: 1, semester: 2, type: '교필' },
  // 2학년
  { name: '자료구조', credits: 3, grade: 2, semester: 1, type: '전필', requires: ['자료구조입문'] },
  { name: '컴퓨터구조', credits: 3, grade: 2, semester: 1, type: '전필' },
  { name: '객체지향프로그래밍', credits: 3, grade: 2, semester: 1, type: '전필', requires: ['프로그래밍기초'] },
  { name: '선형대수', credits: 3, grade: 2, semester: 1, type: '전선' },
  { name: '운영체제', credits: 3, grade: 2, semester: 2, type: '전필', requires: ['컴퓨터구조'] },
  { name: '알고리즘', credits: 3, grade: 2, semester: 2, type: '전필', requires: ['자료구조'] },
  { name: '데이터베이스', credits: 3, grade: 2, semester: 2, type: '전필' },
  { name: '확률및통계', credits: 3, grade: 2, semester: 2, type: '전선' },
  // 3학년
  { name: '네트워크', credits: 3, grade: 3, semester: 1, type: '전필', requires: ['운영체제'] },
  { name: '머신러닝', credits: 3, grade: 3, semester: 1, type: '전선', requires: ['선형대수', '확률및통계'] },
  { name: '소프트웨어공학', credits: 3, grade: 3, semester: 1, type: '전선' },
  { name: '리눅스시스템', credits: 3, grade: 3, semester: 1, type: '전선', requires: ['운영체제'] },
  { name: '클라우드컴퓨팅', credits: 3, grade: 3, semester: 2, type: '전선', requires: ['네트워크', '리눅스시스템'], track: '클라우드·인프라' },
  { name: '데이터엔지니어링', credits: 3, grade: 3, semester: 2, type: '전선', requires: ['데이터베이스'], track: 'AI·데이터' },
  { name: '인공지능개론', credits: 3, grade: 3, semester: 2, type: '전선', requires: ['머신러닝'], track: 'AI·데이터' },
  { name: '웹서버프로그래밍', credits: 3, grade: 3, semester: 2, type: '전선', requires: ['데이터베이스'], track: '웹 개발' },
  // 4학년
  { name: '캡스톤디자인1', credits: 3, grade: 4, semester: 1, type: '전필' },
  { name: '딥러닝', credits: 3, grade: 4, semester: 1, type: '전선', requires: ['머신러닝'], track: 'AI·데이터' },
  { name: '정보보안', credits: 3, grade: 4, semester: 1, type: '전선', requires: ['네트워크'], track: '보안' },
  { name: '캡스톤디자인2', credits: 3, grade: 4, semester: 2, type: '전필', requires: ['캡스톤디자인1'] },
  { name: '현장실습', credits: 3, grade: 4, semester: 2, type: '전선' },
  // 교양선택 (영역)
  { name: '사고와글쓰기', credits: 2, grade: 0, semester: 0, type: '교선', area: '1영역 인문' },
  { name: '음악의이해', credits: 2, grade: 0, semester: 0, type: '교선', area: '1영역 예술' },
  { name: '현대예술의이해', credits: 2, grade: 0, semester: 0, type: '교선', area: '1영역 예술' },
  { name: '영상예술입문', credits: 2, grade: 0, semester: 0, type: '교선', area: '1영역 예술' },
  { name: '데이터리터러시', credits: 2, grade: 0, semester: 0, type: '교선', area: '3영역 과학' },
  { name: '영어회화', credits: 2, grade: 0, semester: 0, type: '교선', area: '4영역 외국어' },
  { name: '비즈니스영어', credits: 2, grade: 0, semester: 0, type: '교선', area: '4영역 외국어' },
  { name: '학술영어', credits: 2, grade: 0, semester: 0, type: '교선', area: '4영역 외국어' },
]

const norm = (s) => String(s || '').replace(/\s+/g, '').toLowerCase()

export function findCourse(name) {
  const key = norm(name)
  return CURRICULUM.find((c) => norm(c.name) === key) || CURRICULUM.find((c) => key.length >= 3 && (norm(c.name).includes(key) || key.includes(norm(c.name))))
}

/** 이 학년·학기에 교육과정이 배치한 과목 */
export function plannedFor(grade, semester) {
  return CURRICULUM.filter((c) => c.grade === grade && c.semester === semester)
}

/** 전공 필수 전체 (이수 여부는 학생이 직접 확인) */
export const MAJOR_REQUIRED = CURRICULUM.filter((c) => c.type === '전필').map((c) => c.name)
