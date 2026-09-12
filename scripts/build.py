"""Build an allowlisted public demo from the source workbook; no dependencies."""
import json, pathlib, zipfile, datetime, xml.etree.ElementTree as ET
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
    art = json.loads((ROOT/'scripts/event-art.json').read_text())
    calendar_dir = ROOT/'site/calendars'
    calendar_dir.mkdir(exist_ok=True)
    def ics_escape(value):
        return value.replace('\\', '\\\\').replace(';', '\\;').replace(',', '\\,').replace('\n', '\\n')
    for index, event in enumerate(data['events']):
        event.update(art[event['id']])
        assert (ROOT/'site'/event['image']).is_file()
        event['dates'] = [f'2027-{month:02d}-{index+9:02d}' for month in (1,3,5,7,9,11)]
        lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tree in the Forest//2027 Demo//EN', 'CALSCALE:GREGORIAN']
        for date in event['dates']:
            day = datetime.date.fromisoformat(date)
            lines.extend(['BEGIN:VEVENT', f"UID:{event['id']}-{date}@imrc-community-site", 'DTSTAMP:20260912T000000Z',
                'DTSTART;VALUE=DATE:'+day.strftime('%Y%m%d'),
                'DTEND;VALUE=DATE:'+(day+datetime.timedelta(days=1)).strftime('%Y%m%d'),
                'SUMMARY:'+ics_escape(event['name']+' (demo programme)'),
                'LOCATION:'+ics_escape(event['location']),
                'DESCRIPTION:Planned demonstration event. Not a confirmed public gathering.', 'END:VEVENT'])
        lines.append('END:VCALENDAR')
        # Fold long lines to RFC 5545's 75-octet limit (all source event text is ASCII).
        folded=[]
        for line in lines:
            while len(line.encode('utf-8'))>75:
                cut=75
                while len(line[:cut].encode('utf-8'))>75: cut-=1
                folded.append(line[:cut]); line=' '+line[cut:]
            folded.append(line)
        (calendar_dir/(event['id']+'.ics')).write_bytes(('\r\n'.join(folded)+'\r\n').encode('utf-8'))
    (ROOT/'site/data.json').write_text(json.dumps(data, indent=2, ensure_ascii=False)+'\n')
    print(f"Built {len(people)} people, {len(relationships)} relationships, {len(events)} events. References validated.")
if __name__ == '__main__': build()
