import os

SRC = r'C:\Users\VAP\.gemini\antigravity\scratch\urbanfix\frontend\src'

def write_f(rel, txt):
    p = os.path.join(SRC, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as out:
        out.write(txt.strip() + '\n')
    print('Generated:', rel)
