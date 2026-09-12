"""Build an allowlisted public demo from the source workbook; no dependencies."""
import json, pathlib, zipfile, xml.etree.ElementTree as ET
ROOT = pathlib.Path(__file__).resolve().parents[1]
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def read_sheet(z, number, strings):
    rows = []
    for row in ET.fromstring(z.read(f'xl/worksheets/sheet{number}.xml')).findall('.//s:sheetData/s:row', NS):
        cells = {}
        for c in row:
            letters = ''.join(x for x in c.attrib['r'] if x.isalpha())
            index = 0
            for char in letters: index = index * 26 + ord(char) - 64
            v = c.find('s:v', NS)
            value = v.text if v is not None else ''.join(c.itertext())
            cells[index - 1] = strings[int(value)] if c.get('t') == 's' else value
        rows.append([cells.get(i, '') for i in range(max(cells, default=-1) + 1)])
    return [dict(zip(rows[0], row)) for row in rows[1:]]
def build():
    with zipfile.ZipFile(ROOT / 'ramayana_tree_in_forest_directory.xlsx') as z:
        strings = [''.join(t.itertext()) for t in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si', NS)] if 'xl/sharedStrings.xml' in z.namelist() else []
        people, relationships, events, registrations = [read_sheet(z, i, strings) for i in (2,3,4,5)]
    ids = {p['Member ID'] for p in people}
    event_ids = {e['Event ID'] for e in events}
    assert len(ids) == len(people)
    external = {r['To Member ID']: r['To Name'] for r in relationships if r['To Member ID'] not in ids}
    assert all(r['From Member ID'] in ids for r in relationships)
    assert all(r['Member ID'] in ids and r['Event ID'] in event_ids for r in registrations)
    data = {
        'externalPeople': external,
        'people': [{k:p[v] for k,v in {'id':'Member ID','name':'Directory Display Name','first':'First Name','clan':'Clan / Lineage','origin':'Ancestral Home','city':'US Home City','languages':'Languages','aliases':'Aliases','type':'Type'}.items()} for p in people],
        'relationships': [{k:r[v] for k,v in {'id':'Relationship ID','from':'From Member ID','to':'To Member ID','type':'Relationship','category':'Category','note':'Source/Note'}.items()} for r in relationships],
        'events': [{'id':e['Event ID'],'name':e['Event Name'],'location':e['Location'],'people':[r['Member ID'] for r in registrations if r['Event ID']==e['Event ID']]} for e in events]
    }
    (ROOT/'site/data.json').write_text(json.dumps(data, indent=2, ensure_ascii=False)+'\n')
    print(f"Built {len(people)} people, {len(relationships)} relationships, {len(events)} events. References validated.")
if __name__ == '__main__': build()
