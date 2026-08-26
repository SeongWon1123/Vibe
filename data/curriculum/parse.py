"""교육과정 PDF → 인공지능공학(부/전공) 교과목표 + 졸업기준 JSON. 헤더 이름으로 열을 찾는다."""
import pdfplumber, glob, sys, io, os, json, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
os.chdir(os.path.dirname(os.path.abspath(__file__)))

DEPT_NAMES = ['인공지능공학전공', '인공지능공학부', 'ICT융합공학부']
TITLE = re.compile(r'^(인공지능공학전공|인공지능공학부|ICT융합공학부)\s*$', re.M)
OTHER_TITLE = re.compile(r'^[가-힣A-Z·()]+(전공|학부|학과)\s*$', re.M)

def clean(c):
    return (c or '').replace('\n', ' ').strip()

def col_map(header):
    h = [clean(c).replace(' ', '') for c in header]
    idx = {}
    for i, c in enumerate(h):
        if '코드' in c and 'code' not in idx: idx['code'] = i
        elif ('교과목명' in c or c == '교과목') and 'name' not in idx: idx['name'] = i
        elif c == '학점' and 'credits' not in idx: idx['credits'] = i
        elif c in ('이수구분', '구분') and i > 3 and 'kind' not in idx: idx['kind'] = i
        elif ('권장' in c or c == '이수학년' or c == '학년') and 'year' not in idx: idx['year'] = i
        elif ('개설학기' in c or c == '학기') and 'sem' not in idx: idx['sem'] = i
        elif c in ('체계', '구분') and i <= 1 and 'system' not in idx: idx['system'] = i
        elif '비고' in c: idx['note'] = i
    return idx if {'code', 'name', 'credits'} <= idx.keys() else None

def parse_file(f):
    out = {'file': f, 'dept': None, 'courses': [], 'grad': None, 'pages': []}
    with pdfplumber.open(f) as pdf:
        texts = [(p.extract_text() or '') for p in pdf.pages]
        for i, t in enumerate(texts):
            if '최소' in t and '이수학점' in t:
                for line in t.split('\n'):
                    if any(line.startswith(d) for d in DEPT_NAMES):
                        out['grad'] = {'page': i + 1, 'line': line, 'nums': re.findall(r'\d+', line)}
                        break
                if out['grad']:
                    break
        start, best = None, 0
        for i, t in enumerate(texts):
            m = TITLE.search(t)
            if m and m.start() < 400 and '교과목' in t and '코드' in t and '학점' in t:
                n = len(re.findall(r'IC\d{4}', t))
                if n > best:
                    start, best = i, n
                    out['dept'] = m.group(1)
        if start is None:
            return out
        i = start
        carry = {'system': None, 'sem': None, 'year': None}
        while i < len(texts):
            t = texts[i]
            head = t[:400]
            if i > start:
                if OTHER_TITLE.search(head) and not TITLE.search(head):
                    break
                if '교과목' not in t:
                    break
            got = 0
            for tb in pdf.pages[i].extract_tables():
                if not tb:
                    continue
                idx = None
                for row in tb:
                    cells = [clean(c) for c in row]
                    if idx is None:
                        idx = col_map(row)
                        if idx:
                            continue
                        # 헤더가 두 줄로 나뉜 표: 첫 두 줄을 합쳐 본다
                        continue
                    for k in ('system', 'sem', 'year'):
                        if k in idx and cells[idx[k]]:
                            carry[k] = cells[idx[k]].replace(' ', '')
                    code = cells[idx['code']]
                    name = cells[idx['name']].replace(' ', '')
                    if not re.match(r'^[A-Z]{2}\d{4}$', code) or not name:
                        continue
                    credits = cells[idx['credits']]
                    kind = cells[idx['kind']] if 'kind' in idx else ''
                    note = cells[idx['note']].replace(' ', '') if 'note' in idx and idx['note'] < len(cells) else ''
                    out['courses'].append({
                        'code': code, 'name': name,
                        'credits': int(credits) if credits.isdigit() else credits,
                        'system': carry['system'], 'semester': carry['sem'], 'year': carry['year'],
                        'required': kind == '필수', 'note': note,
                    })
                    got += 1
            if i > start and got == 0:
                break
            out['pages'].append(i + 1)
            i += 1
    return out

results = {}
for f in sorted(glob.glob('*.pdf')):
    if '2025학년도 1학기' in f:
        print(f, ': skipped (font-encoded, unreadable)')
        continue
    r = parse_file(f)
    results[re.sub(r'\.pdf$', '', f)] = r
    req = [c['name'] for c in r['courses'] if c['required']]
    print(f, '| dept', r['dept'], '| pages', r['pages'], '| courses', len(r['courses']), '| required', req)
    print('   grad:', r['grad'] and r['grad']['line'])
json.dump(results, open('parsed.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
