import os

SRC = 'C:/Users/VAP/.gemini/antigravity/scratch/urbanfix/frontend/src'

def save(rel, txt):
    p = os.path.join(SRC, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(txt.strip() + '\n')
    print('Wrote:', rel)
