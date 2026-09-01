import os, base64, json, subprocess, re, time

BASE='/Users/zyekr/cleannest-site'
env=open(os.path.expanduser('~/.hermes/profiles/pro/.env')).read()
KEY=''
for line in env.splitlines():
    if line.startswith('OPENCODE_GO_API_KEY='):
        KEY=line.split('=',1)[1].strip().strip('"').strip("'")

html=open(os.path.join(BASE,'index.html'),encoding='utf-8').read()
g=re.search(r'<!-- Gallery.*?(?=<!-- Gallery lightbox)', html, re.S).group(0)
imgs=re.findall(r'data-full="([^"]+)"', g)

PROMPT=("You are checking photos for a cleaning company's website gallery. "
        "For the image, answer ONLY with one of these exact labels: "
        "REAL (genuine photograph of a real cleaned room/surface/fixture), "
        "AI (AI-generated / heavily edited / fake before-after with mismatched geometry), "
        "or UNSURE. Then a short reason (max 12 words). Format: LABEL: reason")

def analyze(rel):
    fp=os.path.join(BASE, rel)
    if not os.path.exists(fp):
        return "MISSING"
    b64='data:image/webp;base64,'+base64.b64encode(open(fp,'rb').read()).decode()
    payload={"model":"qwen3.8-max","messages":[{"role":"user","content":[
        {"type":"text","text":PROMPT},
        {"type":"image_url","image_url":{"url":b64}}
    ]}]}
    p=os.path.join(BASE,'.hermes','_vp.json'); open(p,'w').write(json.dumps(payload))
    # call via curl (urllib returns 403 for unclear reasons; curl works)
    out=subprocess.run([
        "curl","-s","https://opencode.ai/zen/go/v1/chat/completions",
        "-H",f"Authorization: Bearer {KEY}",
        "-H","Content-Type: application/json",
        "--data",f"@{p}"
    ], capture_output=True, text=True, timeout=120)
    try:
        j=json.loads(out.stdout)
        return j['choices'][0]['message']['content'].strip()
    except Exception as e:
        return f"ERR: {e} | {out.stdout[:120]}"

results={}
for rel in imgs:
    res=analyze(rel)
    results[rel]=res
    print(rel, "->", res)
    time.sleep(0.4)

json.dump(results, open(os.path.join(BASE,'.hermes','vision_audit.json'),'w'), indent=2)
print("\nSAVED .hermes/vision_audit.json")
