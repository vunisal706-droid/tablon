"""Genera familias.json: avisos automáticos para las familias en la portada del Tablón.
- Previsión de lluvia a la entrada o salida del próximo día de cole (protocolo del Plan de Centro).
- Calor fuerte, avisos naranja/rojo de AEMET, polen alto y calidad del aire.
- Trámites con plazo abierto (tramites.json) y novedades del BOJA que afectan a las familias.
- Días señalados de la semana.
Se ejecuta con GitHub Actions por la mañana y por la tarde."""
import json, re, datetime, urllib.request, unicodedata, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from i18n_familias import LANGS, tx, fen, cuando as cuando_l, fecha as fecha_l, SENALADOS as SEN_L
from zoneinfo import ZoneInfo

TZ = ZoneInfo('Europe/Madrid')
AHORA = datetime.datetime.now(TZ)
HOY = AHORA.date()
SF = (37.1887, -3.7178)          # Santa Fe
BASE = 'https://vunisal706-droid.github.io'
UA = {'User-Agent': 'Tablon CEIP Capitulaciones (avisos para familias)'}
DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

def get_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
        return json.loads(r.read())

def norm(t):
    return unicodedata.normalize('NFD', (t or '').lower()).encode('ascii', 'ignore').decode()

def bonito(d):
    return f'{DIAS[d.weekday()]} {d.day} de {MESES[d.month-1]}'

# ---------- Calendario común (agenda/calendario.json) ----------
try:
    CAL = get_json(f'{BASE}/agenda/calendario.json')
    CURSOS = CAL.get('cursos') or ([CAL] if CAL.get('inicio') else [])
except Exception:
    CURSOS = []
FIJOS = {'10-12', '11-01', '12-06', '12-08', '01-01', '01-06', '02-28', '05-01'}

def sin_cole(d):
    if d.weekday() >= 5:
        return True
    s = d.isoformat()
    ini = d.year if d.month >= 9 else d.year - 1
    c = next((c for c in CURSOS if c.get('inicio', '')[:4] == str(ini)), None)
    if not c:
        md = s[5:]
        return md in FIJOS or d.month in (7, 8) or (d.month == 9 and d.day < 10) or (d.month == 6 and d.day >= 23) \
            or (d.month == 12 and d.day >= 23) or (d.month == 1 and d.day <= 6)
    if any(x['fecha'] == s for x in c.get('dias', [])):
        return True
    if any(p['desde'] <= s <= p['hasta'] for p in c.get('periodos', [])):
        return True
    return s < c['inicio'] or s > c['fin']

def proximo_dia_cole():
    """Hoy si aún no han salido (antes de las 14:00); si no, el siguiente día con cole."""
    d = HOY if AHORA.hour < 14 else HOY + datetime.timedelta(days=1)
    for _ in range(30):
        if not sin_cole(d):
            return d
        d += datetime.timedelta(days=1)
    return None

def cuando(d):
    k = (d - HOY).days
    return 'hoy' if k == 0 else 'mañana' if k == 1 else f'el {bonito(d)}'

avisos = []
def aviso(orden, emoji, render, nivel='info'):
    """render(l) -> (título, texto) en el idioma l"""
    avisos.append({'orden': orden, 'emoji': emoji, 'render': render, 'nivel': nivel})

# ---------- Tiempo del próximo día de cole ----------
dia = proximo_dia_cole()
if dia and (dia - HOY).days <= 3:
    try:
        w = get_json(f'https://api.open-meteo.com/v1/forecast?latitude={SF[0]}&longitude={SF[1]}'
                     '&hourly=precipitation_probability,precipitation,apparent_temperature,uv_index'
                     f'&timezone=Europe%2FMadrid&start_date={dia}&end_date={dia}')
        H = w['hourly']
        def hora(h):
            i = H['time'].index(f'{dia}T{h:02d}:00')
            return H['precipitation_probability'][i] or 0, H['precipitation'][i] or 0
        lluvia = lambda hs: max((hora(h) for h in hs), key=lambda x: (x[0], x[1]))
        pe, me = lluvia([8, 9]); ps, ms = lluvia([13, 14])
        ent, sal = pe >= 40 or me >= 0.2, ps >= 40 or ms >= 0.2
        if ent or sal:
            mk = 'm_ambos' if ent and sal else 'm_ent' if ent else 'm_sal'
            p = max(pe if ent else 0, ps if sal else 0)
            aviso(1, '🌧️', lambda l, d=dia: (tx('lluvia_t', l, cuando=cuando_l(d, HOY, l), momento=tx(mk, l)),
                  ' '.join([tx('prob', l, p=p)] + ([tx('p_ent', l)] if ent else []) + ([tx('p_sal', l)] if sal else []))), 'aviso')
        feel = [H['apparent_temperature'][i] for i, t in enumerate(H['time']) if 9 <= int(t[11:13]) <= 14]
        uv = [H['uv_index'][i] or 0 for i, t in enumerate(H['time']) if 9 <= int(t[11:13]) <= 14]
        if feel and max(feel) >= 32:
            g = round(max(feel))
            aviso(2, '🥵', lambda l, d=dia: (tx('calor_t', l, cuando=cuando_l(d, HOY, l), g=g), tx('calor_x', l)), 'aviso')
        elif feel and max(feel) <= 3:
            aviso(2, '🥶', lambda l, d=dia: (tx('frio_t', l, cuando=cuando_l(d, HOY, l)), tx('frio_x', l)), 'info')
        elif uv and max(uv) >= 8:
            aviso(3, '🧢', lambda l, d=dia: (tx('sol_t', l, cuando=cuando_l(d, HOY, l)), tx('sol_x', l)), 'info')
    except Exception as ex:
        print('Tiempo: no disponible', ex)

# ---------- Avisos oficiales de AEMET (los guarda Mi Tiempo) ----------
def dentro(lat, lon, poly):
    ins, j = False, len(poly) - 1
    for i in range(len(poly)):
        yi, xi = poly[i]; yj, xj = poly[j]
        if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            ins = not ins
        j = i
    return ins
try:
    for a in get_json(f'{BASE}/mitiempo/avisos.json').get('avisos', []):
        if a.get('nivel', 0) >= 2 and any(dentro(SF[0], SF[1], pg) for pg in a.get('poligonos', [])):
            nv = {2: 'naranja', 3: 'rojo'}[a['nivel']]; fe = a.get('fenomeno', '')
            aviso(0, '⚠️', lambda l: (tx('aemet_t', l, nivel=tx(nv, l), fen=fen(fe, l)), tx('aemet_x', l)), 'importante')
            break
except Exception as ex:
    print('AEMET: no disponible', ex)

# ---------- Polen y calidad del aire (hoy) ----------
try:
    q = get_json(f'https://air-quality-api.open-meteo.com/v1/air-quality?latitude={SF[0]}&longitude={SF[1]}'
                 '&hourly=olive_pollen,grass_pollen,european_aqi,dust&timezone=Europe%2FMadrid&forecast_days=2')
    QH = q['hourly']
    dq = HOY if AHORA.hour < 15 else HOY + datetime.timedelta(days=1)
    idx = [i for i, t in enumerate(QH['time']) if t.startswith(dq.isoformat()) and 8 <= int(t[11:13]) <= 20]
    mx = lambda k: max([(QH.get(k) or [0])[i] or 0 for i in idx] or [0])
    oli, gra, aqi, pol = mx('olive_pollen'), mx('grass_pollen'), mx('european_aqi'), mx('dust')
    partes = []
    if oli >= 100: partes.append(('olivo', 'malto' if oli >= 300 else 'alto'))
    if gra >= 50: partes.append(('gram', 'malto' if gra >= 150 else 'alto'))
    if partes:
        aviso(4, '🌿', lambda l: (tx('polen_t', l, cuando=cuando_l(dq, HOY, l), partes=', '.join(f'{tx(a, l)} {tx(b, l)}' for a, b in partes)),
                                  tx('polen_x', l)), 'info')
    if aqi >= 80 or pol >= 150:
        aviso(4, '😷', lambda l: (tx('aire_t', l, cuando=cuando_l(dq, HOY, l)) + (tx('calima', l) if pol >= 150 else ''), tx('aire_x', l)), 'info')
except Exception as ex:
    print('Calidad del aire: no disponible', ex)

# ---------- Trámites con plazo ----------
tramites = []
try:
    T = json.load(open('tramites.json', encoding='utf-8'))
    items = []
    for t in T.get('anuales', []):
        for y in (HOY.year - 1, HOY.year, HOY.year + 1):
            d0 = datetime.date.fromisoformat(f'{y}-{t["desde"]}'); d1 = datetime.date.fromisoformat(f'{y}-{t["hasta"]}')
            items.append((d0, d1, t))
    for t in T.get('puntuales', []):
        items.append((datetime.date.fromisoformat(t['fecha']), datetime.date.fromisoformat(t.get('fechaFin', t['fecha'])), t))
    for d0, d1, t in items:
        if d0 <= HOY <= d1:
            k = (d1 - HOY).days
            est = ('hoy', {}) if d0 == d1 else ('ultimo', {}) if k == 0 else ('queda1', {}) if k == 1 else ('quedan', {'n': k})
            tramites.append({'t': t, 'est': est, 'hasta': d1.isoformat(), 'abierto': True})
        elif 0 < (d0 - HOY).days <= 10:
            tramites.append({'t': t, 'est': ('empieza', {'d0': d0}), 'hasta': d1.isoformat(), 'abierto': False})
    tramites.sort(key=lambda x: (not x['abierto'], x['hasta']))
except Exception as ex:
    print('Trámites: error', ex)

# ---------- Novedades del BOJA para familias (las vigila la Agenda ED) ----------
boja = []
try:
    FAM = re.compile(r'becas?|ayudas?|comedor|aula matinal|escolarizacion|admision|gratuidad|libros de texto|bonificac|'
                     r'transporte escolar|actividades extraescolares|calendario escolar|matricula', re.I)
    lim = (HOY - datetime.timedelta(days=21)).isoformat()
    for x in get_json(f'{BASE}/agenda/boja.json').get('items', []):
        if x.get('fecha', '') >= lim and not x.get('ruido') and FAM.search(norm(x['t'])):
            boja.append({'t': x['t'], 'url': x['url'], 'fecha': x['fecha']})
    boja = boja[:4]
except Exception as ex:
    print('BOJA: no disponible', ex)

# ---------- Días señalados de esta semana ----------
SENALADOS = {'10-16': '🍎 Día Mundial de la Alimentación', '11-16': '💃 Día del Flamenco', '11-20': '🧒 Día de los Derechos de la Infancia',
             '11-22': '🎶 Día de los Gitanos Andaluces', '11-25': '💜 Día contra la Violencia hacia las Mujeres',
             '12-03': '♿ Día de las Personas con Discapacidad', '01-30': '🕊️ Día de la Paz', '02-11': '🔬 Día de la Mujer y la Niña en la Ciencia',
             '02-28': '💚 Día de Andalucía', '03-08': '♀️ Día Internacional de la Mujer', '03-21': '🧦 Día del Síndrome de Down',
             '04-02': '🧩 Día de Concienciación sobre el Autismo', '04-23': '📖 Día del Libro', '06-05': '🌍 Día del Medio Ambiente'}
lunes = HOY - datetime.timedelta(days=HOY.weekday())
if HOY.weekday() >= 5:      # en fin de semana se mira la semana que viene
    lunes += datetime.timedelta(days=7)
semana = []
for k in range(7):
    d = lunes + datetime.timedelta(days=k)
    if d.strftime('%m-%d') in SEN_L:
        semana.append(d)

avisos.sort(key=lambda a: a['orden'])
def en_idioma(l):
    av = []
    for a in avisos:
        ti, te = a['render'](l)
        av.append({'emoji': a['emoji'], 'titulo': ti, 'texto': te, 'nivel': a['nivel']})
    tr = []
    for x in tramites:
        t = x['t']; loc = (t.get('i18n') or {}).get(l, {}) if l != 'es' else {}
        k, kw = x['est']
        est = tx(k, l, f=fecha_l(kw['d0'], l)) if k == 'empieza' else tx(k, l, **kw)
        tr.append({'emoji': t['emoji'], 'nombre': loc.get('nombre', t['nombre']), 'detalle': loc.get('detalle', t.get('detalle', '')),
                   'estado': est, 'hasta': x['hasta'], 'abierto': x['abierto']})
    se = [{'fecha': d.isoformat(), 'texto': SEN_L[d.strftime('%m-%d')][l],
           'cuando': fecha_l(d, l) if d.weekday() < 5 else tx('finde', l)} for d in semana]
    return {'avisos': av, 'tramites': tr, 'semana': se}
salida = {'actualizado': AHORA.isoformat(timespec='minutes'), **en_idioma('es'), 'boja': boja,
          'idiomas': {l: en_idioma(l) for l in LANGS if l != 'es'}}
json.dump(salida, open('familias.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'familias.json: {len(avisos)} avisos, {len(tramites)} trámites, {len(boja)} BOJA, {len(semana)} días señalados, {len(LANGS)} idiomas')
