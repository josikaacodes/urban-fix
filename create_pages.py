# UrbanFix Frontend Generator
import os
import sys

FRONTEND_SRC = r'C:\Users\VAP\.gemini\antigravity\scratch\urbanfix\frontend\src'
PAGES_DIR = os.path.join(FRONTEND_SRC, 'pages')
os.makedirs(PAGES_DIR, exist_ok=True)

def write_file(rel_path, content):
    full_path = os.path.join(FRONTEND_SRC, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Wrote {rel_path} ({len(content)} bytes)')

print('Page generator initialized.')
