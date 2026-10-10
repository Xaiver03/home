#!/usr/bin/env python3
"""push 前置闸的**字节臂**：这批要推出去的提交里，有没有把某枚在册值"第一次"推上公开面。

为什么形状尺（gitleaks）不够：它按新增行判，而"把口令从文档里删掉"那一笔的 diff 里，
那枚值作为**删除行**照样进了提交对象 ⇒ 形状尺一个字不报，字节尺看得见。
本臂只报值名与计数，任何路径都不打印值；值只从 0600 目录读进内存，不进 argv。

用法: tfa-prepush-bytearm.py <仓路径> "<射程 rev-opts>"
  射程例："HEAD --not --remotes"（=这次 push 会新送出去的那批提交）
  TFA_SECRET_STORE 可换值目录（验牙用的合成目录），默认 ~/.config/tfa-credentials

退出码：0=没有"首次公开的活值"；1=有（该拦）；3=射程取不出或提交头解析坏了（本臂没跑成，别读成"过了"）。
"是否已公开"的尺：拿 refs/remotes 的那些 tip 各扫一趟它们可达的历史，看这枚值在不在其中（带缓存，
键＝远端 tip 集合＋值名集合；缓存里只有计数与名字，没有值）。
"""
import json
import os
import re
import subprocess
import sys
import zlib

COMMIT_LINE = re.compile(b'^\\x01([0-9a-f]{40})$')
repo = sys.argv[1] if len(sys.argv) > 1 else '.'
range_opts = sys.argv[2] if len(sys.argv) > 2 else ''
STORE = os.path.expanduser(os.environ.get('TFA_SECRET_STORE', '~/.config/tfa-credentials'))

if not range_opts.strip():
    print('字节臂：没给射程 ⇒ 这一臂没跑（不许读成"没命中"）', file=sys.stderr)
    sys.exit(3)

# 文件名臂（不需要值目录 ⇒ 在没装存储的机器上照样有效）：私钥材料以"路径形状"进射程就拦。
# 豁免 debug.keystore：那是跟仓走的公开模板件（heyta 里已跟踪，台账十七 §4 记的就是它），拦它只会逼人 --no-verify 绕闸。
NAME_SHAPE = re.compile(r'(?:^|/)(?:keystore|signing|key)\.properties$|\.(?:keystore|jks|p12|mobileprovision|pk8)$')
NAME_EXEMPT = re.compile(r'(?:^|/)debug\.keystore$')
ns = subprocess.run(['git', '-c', 'core.quotepath=off', '-C', repo, 'log', *range_opts.split(),
                     '--format=', '--name-status', '--no-color'],
                    capture_output=True, text=True)
if ns.returncode != 0:
    print('文件名臂：射程取不出（%s）⇒ 本臂作废（退 3）' % (ns.stderr.strip()[:120] or 'rev 选项坏了'), file=sys.stderr)
    sys.exit(3)
bad_names = []
for line in ns.stdout.splitlines():
    parts = line.split('\t')
    if len(parts) < 2 or not parts[0]:
        continue
    status, paths = parts[0], parts[1:]
    if status[0] not in ('A', 'R', 'C'):
        continue
    # R/C 只看落地那一个路径：把私钥文件改名成普通文件是允许的，反过来（普通→私钥形状）才算新增。
    checked = [paths[-1]] if status[0] in ('R', 'C') else paths
    for p in checked:
        if NAME_SHAPE.search(p) and not NAME_EXEMPT.search(p):
            bad_names.append('%s %s' % (status, p))
if bad_names:
    print('文件名臂：射程里有 %d 枚私钥形状的新增/改名路径 ⇒ 拦（这类路径的值不在值目录里也拦，'
          '因为判的是形状不是值）' % len(bad_names), file=sys.stderr)
    for b in bad_names[:20]:
        print('  ✗ ' + b, file=sys.stderr)
    sys.exit(1)
print('文件名臂：射程内私钥形状新增/改名=0 枚（豁免 debug.keystore）')

if not os.path.isdir(STORE):
    print('字节臂：本机没有值目录 %s ⇒ 这一臂没跑（形状尺照跑；换机时要么把值目录装齐，'
          '要么别指望这一臂）' % STORE, file=sys.stderr)
    sys.exit(0)

vals = []
for fn in sorted(os.listdir(STORE)):
    p = os.path.join(STORE, fn)
    if not os.path.isfile(p) or os.path.islink(p):
        continue
    v = open(p, 'rb').read().rstrip(b'\n')
    if len(v) < 6:
        continue
    vals.append((fn, v, '.retired' in fn))
if not vals:
    print('字节臂：值目录里没有一枚 ≥6 字节的可用值 ⇒ 这一臂没跑', file=sys.stderr)
    sys.exit(3)


def scan(revopts):
    """扫 revopts 可达的历史：返回 {'rows','ncommits','hits':{值名:{rows,commits}}}；读不出返回 None。"""
    n = subprocess.run(['git', '-C', repo, 'rev-list', '--count', *revopts],
                       capture_output=True, text=True)
    if n.returncode != 0:
        return None
    proc = subprocess.Popen(['git', '-c', 'core.quotepath=off', '-C', repo, 'log', *revopts,
                             '--format=\x01%H', '-U0', '--no-color'],
                            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    commit, rows, hits = None, 0, {}
    for raw in proc.stdout:
        rows += 1
        line = raw.rstrip(b'\n')
        m = COMMIT_LINE.match(line)
        if m:
            commit = m.group(1).decode()
            continue
        if raw[:1] not in (b'+', b'-') or raw[:3] in (b'+++', b'---'):
            continue
        for name, v, _ in vals:
            if v in raw:
                st = hits.setdefault(name, {'rows': 0, 'commits': set()})
                st['rows'] += 1
                if commit:
                    st['commits'].add(commit)
    if proc.wait() not in (0, -9, 143) and rows == 0:
        return None
    return {'rows': rows, 'ncommits': n.stdout.strip(), 'hits': hits}


rng = scan(range_opts.split())
if rng is None:
    print('字节臂：射程 [%s] 取不出（rev 选项坏了或仓读不了）⇒ 本臂作废（退 3）' % range_opts, file=sys.stderr)
    sys.exit(3)
if rng['ncommits'] in ('0', ''):
    # 空射程是一种正当形状：这条 ref 要推的提交已全部在别的远端可达处 ⇒ 这次一个新对象都不送。
    # 它和"射程写坏了"分开写：后者走上面那条退 3，不许混进来当放行。
    print('字节臂：射程 [%s] 内 0 笔提交 ⇒ 这次 push 不新送任何对象，没有可比的东西（退 0，不是"没命中"那种打空）'
          % range_opts)
    sys.exit(0)
if not rng['hits']:
    print('字节臂：射程内提交=%s 笔、diff 行=%d、在册值 %d 枚 ⇒ 0 命中（新增行与删除行都比过）'
          % (rng['ncommits'], rng['rows'], len(vals)))
    sys.exit(0)
if all(not h['commits'] for h in rng['hits'].values()):
    print('字节臂：命中行>0 而提交集合恒空 ⇒ 提交头解析坏了，本臂读数作废（退 3）', file=sys.stderr)
    sys.exit(3)

tips = subprocess.run(['git', '-C', repo, 'for-each-ref', '--format=%(objectname)', 'refs/remotes'],
                      capture_output=True, text=True).stdout.split()
# 缓存键故意不用 hashlib：今晚这台机上 `import hashlib` 出现过"模块在、sha256 不在"的一闪
# （conda 目录被并发改动时的 ImportError 形状），闸不能挂在一枚会闪的依赖上。
# 键的内容是远端 tip 的公开 sha ＋ 值名集合，都不是秘密，crc32 只当文件名用。
key = '%08x' % (zlib.crc32(('|'.join(sorted(tips)) + '#' + ','.join(n for n, _, _ in vals)).encode()) & 0xffffffff)
cache_dir = os.path.expanduser(os.environ.get('TFA_CACHE_DIR', '~/.cache/tfa-prepush'))
cache_dir = os.path.expanduser(cache_dir)
cache_f = os.path.join(cache_dir, '%s-%s.json' % (os.path.basename(repo.rstrip('/')), key))

pub, remote_rows = None, None
if not tips:
    pub = {}
    print('字节臂：本仓远端跟踪引用=0 枚 ⇒ 无可对照的"已公开侧"，射程内每枚活值都按首次公开算')
elif os.path.isfile(cache_f):
    try:
        j = json.load(open(cache_f))
        cached = j['pub']
        # 「缓存里没有这枚键」≠「已公开侧 0 笔」：缓存是上一发射程写下的，上一发没命中的值名压根不在表里。
        # 现量撞到的那一发：同一射程连跑两发，第一发射程没带 volc-supabase.anon.key（那枚值这时还没进这批复射），
        # 第二发带上了 ⇒ 拿 .get(name,0) 读出「已公开侧 0 笔 ⇒ 这次 push 第一次推上公开面」，
        # 而这枚值实测在已推侧全部 4 笔提交的树里，自 2026-06-05 根提交就在。缺任何一枚在册名 ⇒ 整份缓存作废、重扫。
        missing = [n for n, _, _ in vals if n not in cached]
        if missing:
            pub = None
            print('字节臂：缓存缺 %d 枚在册名（上一发射程没命中它们，不是"已公开侧 0 笔"）⇒ 整份重扫' % len(missing))
        else:
            pub = cached
            print('字节臂：已公开侧读数取自缓存（键=%s 远端引用=%d 枚；远端 tip 一变键就变）' % (key, len(tips)))
    except Exception:
        pub = None
if pub is None and tips:
    seen = {}
    remote_rows = 0
    for i in range(0, len(tips), 25):
        sub = scan(tips[i:i + 25])
        if sub is None:
            print('字节臂：已公开侧扫不出来 ⇒ 本臂作废（退 3），不许读成"没公开"', file=sys.stderr)
            sys.exit(3)
        remote_rows += sub['rows']
        for name, h in sub['hits'].items():
            st = seen.setdefault(name, set())
            st.update(h['commits'])
    # 写缓存时按**全部在册名**建表，不按"这一发命中的名"建表：只存命中名会让下一发把缺键读成 0（上面那条注释的形状）。
    pub = {name: len(seen.get(name, set())) for name, _, _ in vals}
    os.makedirs(cache_dir, exist_ok=True)
    fd = os.open(cache_f, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w') as f:
        json.dump({'tips': len(tips), 'pub': pub}, f)

blocked = []
for name, h in sorted(rng['hits'].items(), key=lambda kv: -kv[1]['rows']):
    retired = any(n == name and r for n, _, r in vals)
    already = pub.get(name, 0)
    if retired:
        print('  · 「%s」 射程内命中行=%d 提交=%d ⇒ 退役值（已失效，只作数不拦）'
              % (name, h['rows'], len(h['commits'])))
    elif already:
        print('  · 「%s」 射程内命中行=%d 提交=%d；已公开侧另有 %d 笔提交带着它'
              '⇒ 不拦：推它不会新增暴露，但这枚值现在是活的 ⇒ 该轮的不是该删的'
              % (name, h['rows'], len(h['commits']), already))
    else:
        print('  ✗ 「%s」 射程内命中行=%d 提交=%d，已公开侧 0 笔 ⇒ 这次 push 会把它第一次推上公开面'
              % (name, h['rows'], len(h['commits'])), file=sys.stderr)
        blocked.append(name)

if not tips:
    side_note = '无已公开侧可对照'
elif remote_rows is None:
    side_note = '判定取自缓存，缓存不记行数'
else:
    side_note = '其 diff 行=%d' % remote_rows
print('字节臂分母：射程=%s 笔/diff 行=%d/已公开侧引用=%d 枚(%s)/在册值=%d 枚/命中值名=%d 枚/拦=%d 枚'
      % (rng['ncommits'], rng['rows'], len(tips), side_note, len(vals), len(rng['hits']), len(blocked)))
if blocked:
    print('✗ 字节臂拦下 %d 枚：先轮换（值变死 ⇒ 改名成 *.retired-* 后本臂自动放行）或改写历史；'
          '别用 --no-verify 绕，绕过去等于交出这枚值的第一份公开副本' % len(blocked), file=sys.stderr)
    sys.exit(1)
sys.exit(0)
