import os

SRC = r'C:\Users\VAP\.gemini\antigravity\scratch\urbanfix\frontend\src'
 
def save(rel, text):
    p = os.path.join(SRC, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(text.strip() + '\n')
    print('Wrote', rel)

LOGIN_CODE = r'''
import React, { state as useState, useEffect } from 'react';
