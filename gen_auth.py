import os

PAGES = r'C:\Users\VAP\.gemini\antigravity\scratch\urbanfix\frontend|src\pages'
os.makedirs(PAGES, exist_ok=True)

def write_file(name, content):
    p = os.path.join(PAGES, name)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Wrote {name} ({len(content)} bytes)')
