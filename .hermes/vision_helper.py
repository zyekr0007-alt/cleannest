import os, base64, json, subprocess, sys

BASE='/Users/zyekr/cleannest-site'
env=open(os.path.expanduser('~/.hermes/profiles/pro/.env')).read()
KEY=''
for line in env.splitlines():
    if line.startswith('OPENCODE_GO_API_KEY='):
        KEY=line.split('=',1)[1].strip().strip('"').strip("'")

def vision(image_path, prompt):
    b64='data:image/png;base64,'+base64.b64encode(open(image_path,'rb').read()).decode()
    payload={"model":"qwen3.8-max","messages":[{"role":"user","content":[
        {"type":"text","text":prompt},
        {"type":"image_url","image_url":{"url":b64}}
    ]}]}
    p='/tmp/_vp.json'; open(p,'w').write(json.dumps(payload))
    out=subprocess.run(["curl","-s","https://opencode.ai/zen/go/v1/chat/completions",
        "-H",f"Authorization: Bearer {KEY}","-H","Content-Type: application/json",
        "--data",f"@{p}"], capture_output=True, text=True, timeout=120)
    try:
        return json.loads(out.stdout)['choices'][0]['message']['content'].strip()
    except Exception as e:
        return f"ERR: {e} | {out.stdout[:200]}"

if __name__=='__main__':
    img=sys.argv[1]
    prompt=sys.argv[2] if len(sys.argv)>2 else "Describe what is wrong with this webpage screenshot. List visual defects: broken images (missing/red X), asymmetry, misalignment, overlap, unreadable text, missing icons, layout problems, broken UI. Be specific and concise."
    print(vision(img, prompt))
