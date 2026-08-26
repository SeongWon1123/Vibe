"""parsed.json → src/data/curriculum.js (입학년도별 교육과정 + 졸업기준)"""
import json, re, io, sys, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
os.chdir(os.path.dirname(os.path.abspath(__file__)))
data = json.load(open('parsed.json', encoding='utf-8'))

# 연도별 대표 파일 (2학기 판이 있으면 그것)
PICK = {
    2021: '2021 교육과정', 2022: '2022학년도', 2023: '2023학년도',
    2024: '2024학년도 2학기', 2025: '2025학년도 2학기', 2026: '2026학년 2학기',
}

def grad_of(year, r):
    nums = [n for n in r['grad']['nums']]
    if year >= 2025:
        # 10 6 14 12 60 - 72 이상 140 45 이상
        basic, core, creative, req, elec, major, total, double = map(int, nums[:8])
        return {'total': total, 'major': major, 'majorRequired': req, 'majorElective': elec,
                'general': basic + core + creative, 'generalMax': basic + core + creative, 'double': double,
                'generalParts': {'기초': basic, '핵심': core, '창의': creative}}
    # 5 6 2 2 [(2)] 15~31 30~46 9 63 [(8)] 72이상 130 36
    line = r['grad']['line']
    m = re.search(r'(\d+)~(\d+)\s+(\d+)~(\d+)\s+(\d+)\s+(\d+)\s+(?:\((\d+)\)|-)\s+(\d+)이상\s+(\d+)\s+(\d+)', line)
    dmin, dmax, gmin, gmax, req, elec, _, major, total, double = m.groups()
    head = re.findall(r'\d+', line.split(f'{dmin}~{dmax}')[0])
    parts = {'기초': int(head[0]), '핵심': int(head[1]), '글로벌의사소통': int(head[2]), '인성': int(head[3])}
    if len(head) > 4:
        parts['브릿지'] = int(head[4])
    parts['학과지정'] = f'{dmin}~{dmax}'
    return {'total': int(total), 'major': int(major), 'majorRequired': int(req), 'majorElective': int(elec),
            'general': int(gmin), 'generalMax': int(gmax), 'double': int(double), 'generalParts': parts}

def norm_sem(s):
    if not s:
        return None
    s = s.replace(' ', '')
    if '여름' in s or '계절' in s:
        return '여름'
    m = re.match(r'(\d)', s)
    return int(m.group(1)) if m else None

def norm_year(y):
    if not y:
        return None
    return [int(x) for x in re.findall(r'\d', y)] or None

out = {}
for year, key in PICK.items():
    r = data[key]
    courses = []
    seen = set()
    for c in r['courses']:
        if c['code'] in seen:
            continue
        seen.add(c['code'])
        note = c['note'] or ''
        courses.append({
            'code': c['code'], 'name': c['name'], 'credits': c['credits'],
            'years': norm_year(c['year']), 'semester': norm_sem(c['semester']),
            'system': c['system'], 'required': c['required'],
            'capstone': '캡스톤' in note, 'lab': '실험실습' in note,
            'other': not c['code'].startswith('IC'),
        })
    out[year] = {'year': year, 'dept': r['dept'], 'source': r['file'], 'grad': grad_of(year, r), 'courses': courses}
    print(year, r['dept'], len(courses), 'courses; grad', out[year]['grad'])

js = "// 자동 생성: data/curriculum/convert.py — 국립순천대학교 교육과정 PDF에서 추출한 인공지능공학(부/전공) 전공 교과목표와 졸업기준.\n"
js += "// 입학년도(학번)별. 교양 과목 목록은 포함하지 않는다 (학점 기준만).\n\n"
js += "export const CURRICULA = " + json.dumps(out, ensure_ascii=False, indent=1) + "\n\n"
js += """export const ENTRY_YEARS = Object.keys(CURRICULA).map(Number).sort()

export function getCurriculum(entryYear) {
  const y = ENTRY_YEARS.includes(Number(entryYear)) ? Number(entryYear) : ENTRY_YEARS[ENTRY_YEARS.length - 1]
  return CURRICULA[y]
}

const norm = (s) => String(s || '').replace(/\\s+/g, '').toLowerCase()

export function findCourse(name, entryYear) {
  const list = getCurriculum(entryYear).courses
  const key = norm(name)
  return (
    list.find((c) => norm(c.name) === key) ||
    list.find((c) => key.length >= 3 && (norm(c.name).includes(key) || key.includes(norm(c.name))))
  )
}

/** 이 학년·학기에 교육과정이 배치한 전공 과목 */
export function plannedFor(grade, semester, entryYear) {
  return getCurriculum(entryYear).courses.filter(
    (c) => !c.other && c.years?.includes(grade) && (c.semester === semester || c.semester === null),
  )
}
"""
open('../../src/data/curriculum.js', 'w', encoding='utf-8').write(js)
print('wrote src/data/curriculum.js')
