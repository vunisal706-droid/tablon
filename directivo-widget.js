/* Tablón · Equipo Directivo: actividades de la semana para el profesorado (las añaden Víctor, María o
   Encarna) y botón para generar el correo semanal al claustro con las reuniones del lunes lectivo.
   Se guarda en Firebase (actividades_profesorado). Solo se ve con la sesión de administración iniciada. */
(function(){
  const esc = t => String(t||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const DIA = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const pad = n => String(n).padStart(2,'0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const FIRMAS = {
    vunisal706: {nombre:'Víctor Manuel Única Salas', cargo:'Director'},
    mrodrod323: {nombre:'María Rodríguez Rodríguez', cargo:'Jefa de Estudios'},
    emunrom369: {nombre:'Encarnación Muñoz Romero', cargo:'Secretaria'}};
  // Enlaces al Drive del centro para los puntos del orden del día (solo se muestran con la sesión iniciada)
  const ENLACES = [
    {patron:"acta anterior", icono:'📁', titulo:"Reuniones y actas", url:"https://drive.google.com/drive/folders/1bRUcI0C6gE0-IZFSTxE8Bnz9GcJtuUwW"},
    {patron:"comprensión lectora", icono:'📱', titulo:"Pruebas de lectura (Registro)", url:"https://vunisal706-droid.github.io/lecturayproblemas/#pruebas"},
    {patron:"comprensión lectora|resolución de problemas|plan de lectura|día del libro|biblioteca", icono:'📱', titulo:"Ágora · Plan de Lectura y Problemas", url:"https://vunisal706-droid.github.io/leoresuelvo/"},
    {patron:"proyecto educativo", icono:'📁', titulo:"Proyecto Educativo", url:"https://drive.google.com/file/d/1cheToikm-Ms_KYWBbvgzPTSmPq9YLDgY/view"},
    {patron:"plan de centro|proyecto educativo|rof\\b|criterios de (evaluación y )?promoción|protocolo neae", icono:'📱', titulo:"App Plan de Centro", url:"https://vunisal706-droid.github.io/proyectocentro/"},
    {patron:"plan de centro", icono:'📁', titulo:"Plan de Centro 26/27", url:"https://drive.google.com/drive/folders/1UKegBfwBwCXplZGPdUN6AgmNGiDbhWL1"},
    {patron:"convivencia", icono:'📁', titulo:"Proyecto Educativo", url:"https://drive.google.com/file/d/1cheToikm-Ms_KYWBbvgzPTSmPq9YLDgY/view"},
    {patron:"programaci|propuestas? pedag", icono:'📁', titulo:"Programaciones 26/27", url:"https://drive.google.com/drive/folders/1b4yXrE54-4xiFQglLYX9R6wwoMXHJlTi"},
    {patron:"acta competencial", icono:'📁', titulo:"Modelo de acta competencial", url:"https://drive.google.com/file/d/1Z_LCZJFs9oGuBHnaUzOL9eBafiAnSjwc/view"},
    {patron:"evaluación inicial", icono:'📁', titulo:"Pruebas de evaluación inicial", url:"https://drive.google.com/drive/folders/1UCYfASe96ZOuQ3qo-eANw3APJkk_wUGz"},
    {patron:"resultados|rendimiento|evaluación (final|del alumnado|del trimestre)|análisis progreso|promoción|repetidores|no promociona", icono:'📱', titulo:"Gestión de Evaluaciones", url:"https://vunisal706-droid.github.io/gestorevalu/"},
    {patron:"refuerzo", icono:'📁', titulo:"Plan de refuerzo 26/27", url:"https://drive.google.com/drive/folders/11iG_oq5ci3n72iN1AZ6jlBtkoO8tBarU"}
  ];
  let AYUDAS = null, pidiendoAyudas = false;
  function cargarAyudas(){
    if (AYUDAS || pidiendoAyudas || !window.adminActivo) return;
    pidiendoAyudas = true;
    fetch('ayudas-orden.json?_='+Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
      AYUDAS = (j && j.ayudas) || {}; pidiendoAyudas = false;
      if (window.pintarReuniones) window.pintarReuniones(seccion);
    }).catch(()=>{ pidiendoAyudas = false; });
  }
  const conAyudas = () => { const c = document.getElementById('dirAyudas'); return !!(c && c.checked); };
  window.ayudaPunto = function(p){ return (window.adminActivo && AYUDAS && AYUDAS[p]) || null; };
  window.enlacesDrive = function(p){
    if (!window.adminActivo) return [];
    const out = [];
    for (const e of ENLACES){ if (new RegExp(e.patron,'i').test(p) && !out.some(x=>x.url===e.url)) out.push(e); if (out.length>=3) break; }
    return out;
  };
  let actividades = {}, escucha = null, seccion = null, lunesSel = null;
  const ref = () => firebase.database().ref('actividades_profesorado');
  const usuario = () => { const u = firebase.auth().currentUser; return u && u.email ? u.email.split('@')[0].toLowerCase() : ''; };

  // Semana del correo: por defecto, de viernes a domingo se prepara la semana siguiente; de lunes a jueves, la actual
  function lunesPorDefecto(){
    const d = new Date(); d.setHours(12,0,0,0); const w = d.getDay();
    if (w === 0) d.setDate(d.getDate()+1); else if (w >= 5) d.setDate(d.getDate()+(8-w)); else d.setDate(d.getDate()-(w-1));
    return d;
  }
  function semana(){
    const lunes = new Date(lunesSel || lunesPorDefecto());
    const viernes = new Date(lunes); viernes.setDate(viernes.getDate()+4);
    return {lunes, viernes, desde: iso(lunes), hasta: iso(viernes)};
  }
  const fechaLarga = ds => { const d = new Date(ds+'T12:00'); return `${DIA[d.getDay()]} ${d.getDate()} de ${MES[d.getMonth()]}`; };

  function correo(){
    const S = semana(), R = window.reunionesDeLunes ? window.reunionesDeLunes(S.lunes) : null, yo = FIRMAS[document.getElementById('dirFirma').value] || {};
    const acts = Object.values(actividades).filter(a=>a.fecha>=S.desde && a.fecha<=S.hasta).sort((a,b)=>(a.fecha+(a.hora||'')).localeCompare(b.fecha+(b.hora||'')));
    const asunto = `Reuniones y actividades de la semana del ${S.lunes.getDate()}${S.lunes.getMonth()!==S.viernes.getMonth()?' de '+MES[S.lunes.getMonth()]:''} al ${S.viernes.getDate()} de ${MES[S.viernes.getMonth()]}`;
    let t = `Buenos días, compañeros y compañeras:\n\n`;
    const sc = window.CalendarioCole ? CalendarioCole.sinCole(S.desde) : null;
    if (!R && sc && sc.tipo !== 'finde') t += `El ${fechaLarga(S.desde)} no hay clase (${sc.nombre}), así que esta semana no hay reuniones de los lunes.\n`;
    if (R){
      t += `Os recuerdo las reuniones del ${fechaLarga(R.ds)} (${R.n}.º lunes lectivo del mes):\n`;
      t += `• ${R.tutorias}: Tutorías con familias\n`;
      R.lista.forEach(r=>{
        if (r.turnos) t += `• ${r.nombre}:\n` + r.turnos.map(x=>`   – ${x[0]}: ${x[1]}`).join('\n') + '\n';
        else t += `• ${r.hora}: ${r.nombre}${r.nota?` (${r.nota})`:''}\n`;
      });
      if (!R.lista.length) t += `• Ese lunes no hay reuniones del cuadrante.\n`;
      const usados = new Set(); // cada enlace solo la primera vez que aparece (Séneca limita a 3500 caracteres)
      R.ordenes.forEach(o=>{ t += `\nOrden del día previsto · ${o.organo}:\n` + o.puntos.map((p,i)=>{ const ay = conAyudas() ? window.ayudaPunto(p) : null; return `${i+1}. ${p}` + (ay?`\n   💡 Qué tratar: ${ay.q}\n   ✅ Propuesta: ${ay.p}`:'') + window.enlacesDrive(p).filter(e=>!usados.has(e.url) && usados.add(e.url)).map(e=>`\n   ${e.icono||'📁'} ${e.titulo}: ${e.url}`).join(''); }).join('\n') + '\n'; });
    }
    // Días sin clase de esa semana (festivos, vacaciones…), salvo el lunes que ya se ha explicado arriba
    const sinClase = [];
    if (window.CalendarioCole) for (let k=0; k<5; k++){
      const d = new Date(S.lunes); d.setDate(d.getDate()+k); const ds = iso(d), x = CalendarioCole.sinCole(ds);
      if (x && x.tipo !== 'finde' && !(k===0 && !R)) sinClase.push(`• ${fechaLarga(ds).replace(/^./,c=>c.toUpperCase())}: no hay clase (${x.nombre})`);
    }
    if (sinClase.length === 5) t = `Buenos días, compañeros y compañeras:\n\nEsta semana no hay clase (${CalendarioCole.sinCole(S.desde).nombre}).\n`;
    else if (sinClase.length) t += `\nDías sin clase esta semana:\n` + sinClase.join('\n') + '\n';
    if (acts.length){
      t += `\nOtras actividades de la semana:\n` + acts.map(a=>`• ${fechaLarga(a.fecha).replace(/^./,c=>c.toUpperCase())}${a.hora?`, ${a.hora}`:''}: ${a.texto}`).join('\n') + '\n';
    }
    t += `\nUn saludo,\n${yo.nombre||''}\n${yo.cargo?yo.cargo+' · ':''}CEIP Capitulaciones`;
    return {asunto, texto:t};
  }

  function html(){
    const S = semana(), yo = usuario();
    const acts = Object.entries(actividades).filter(([,a])=>a.fecha>=S.desde && a.fecha<=S.hasta).sort((a,b)=>(a[1].fecha+(a[1].hora||'')).localeCompare(b[1].fecha+(b[1].hora||'')));
    const inp = 'font:inherit;border:1px solid #cbd5e1;border-radius:8px;height:36px;padding:0 8px;background:#fff;color:#1f2a37';
    const btn = 'font:inherit;font-weight:700;border:0;border-radius:8px;height:36px;padding:0 14px;cursor:pointer';
    return `<div style="background:#fffbeb;border:1.5px solid #fcd34d;border-left:6px solid #d97706;border-radius:14px;padding:12px 14px;margin:0 0 16px;color:#1f2a37;text-align:left;font-size:.95rem">
      <div style="font-weight:800;font-size:1.05rem">✉️ Correo semanal al profesorado</div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px">
        <button type="button" data-sem="-1" style="${btn};height:30px;padding:0 10px;background:#fff;color:#92400e;border:1px solid #fcd34d" aria-label="Semana anterior">‹</button>
        <span style="font-weight:700;color:#78350f">Semana del ${fechaLarga(S.desde)} al ${fechaLarga(S.hasta)}</span>
        <button type="button" data-sem="1" style="${btn};height:30px;padding:0 10px;background:#fff;color:#92400e;border:1px solid #fcd34d" aria-label="Semana siguiente">›</button>
        ${lunesSel ? `<button type="button" data-sem="0" style="${btn};height:30px;padding:0 10px;background:#fff;color:#92400e;border:1px solid #fcd34d">Volver</button>` : ''}
      </div>
      <div style="margin-top:10px;font-weight:700">Otras actividades de la semana</div>
      <div style="display:grid;gap:4px;margin-top:4px">${acts.length ? acts.map(([k,a])=>`<div style="background:#fff;border:1px solid #fde68a;border-radius:8px;padding:6px 10px;display:flex;gap:8px;align-items:center">
        <span style="flex:1"><b>${esc(fechaLarga(a.fecha))}${a.hora?`, ${esc(a.hora)}`:''}</b> · ${esc(a.texto)} <span style="color:#94a3b8;font-size:.8rem">(${esc((FIRMAS[a.autor]||{}).nombre?.split(' ')[0]||a.autor||'')})</span></span>
        <button type="button" data-borrar="${esc(k)}" title="Quitar" style="${btn};height:28px;padding:0 8px;background:#fee2e2;color:#b91c1c">✕</button></div>`).join('') : '<div style="color:#92400e">Todavía no hay actividades añadidas para esta semana.</div>'}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
        <input type="date" id="dirFecha" value="${S.desde}" min="${S.desde}" max="${S.hasta}" style="${inp}">
        <input type="time" id="dirHora" style="${inp};width:110px" aria-label="Hora (opcional)">
        <input type="text" id="dirTexto" maxlength="200" placeholder="Actividad (p. ej. Simulacro de evacuación a las 12:00)" style="${inp};flex:1;min-width:200px">
        <button type="button" id="dirAdd" style="${btn};background:#d97706;color:#fff">➕ Añadir</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:12px">
        <label style="font-size:.9rem">Firma: <select id="dirFirma" style="${inp}">${Object.entries(FIRMAS).map(([k,f])=>`<option value="${k}" ${k===(yo in FIRMAS?yo:'mrodrod323')?'selected':''}>${esc(f.nombre)} (${esc(f.cargo)})</option>`).join('')}</select></label>
        <button type="button" id="dirGen" style="${btn};background:#283593;color:#fff">📝 Generar correo</button>
        <label style="font-size:.85rem;display:flex;align-items:center;gap:4px"><input type="checkbox" id="dirAyudas"> Incluir ayudas 💡 (alarga mucho el correo)</label>
      </div>
      <div id="dirSalida"></div>
      <div id="dirError" style="color:#b91c1c;font-weight:700;font-size:.88rem;margin-top:6px"></div>
    </div>`;
  }

  function pintar(){
    const box = document.getElementById('correoBox'); if (!box) return;
    if (seccion !== 'directivo' || !window.adminActivo){
      box.innerHTML = seccion === 'directivo' ? `<div style="color:#475569;font-size:.88rem;margin:0 0 12px;text-align:left">✉️ Para preparar el correo semanal al profesorado, inicia sesión con el botón <b>⚙️ Admin</b>.</div>` : '';
      return;
    }
    box.innerHTML = html();
    const err = m => document.getElementById('dirError').textContent = m;
    const fallo = e => err(e && /permission|PERMISSION/.test(e.message||e.code||'') ? '⚠️ Firebase no deja guardar en «actividades_profesorado». Hay que añadir el permiso en las reglas de la base de datos.' : '⚠️ No se ha podido guardar. Revisa la conexión.');
    document.getElementById('dirAdd').onclick = ()=>{
      const f = document.getElementById('dirFecha').value, h = document.getElementById('dirHora').value, t = document.getElementById('dirTexto').value.trim();
      if (!f || !t){ err('Pon la fecha y la actividad.'); return; }
      ref().push({fecha:f, hora:h||'', texto:t, autor:usuario(), creado:Date.now()}).catch(fallo);
    };
    box.querySelectorAll('[data-sem]').forEach(b=>b.onclick=()=>{
      const k = +b.dataset.sem;
      if (!k) lunesSel = null; else { const d = new Date(semana().lunes); d.setDate(d.getDate()+7*k); lunesSel = d; }
      pintar();
    });
    box.querySelectorAll('[data-borrar]').forEach(b=>b.onclick=()=>{ if (confirm('¿Quitar esta actividad?')) ref().child(b.dataset.borrar).remove().catch(fallo); });
    document.getElementById('dirGen').onclick = ()=>{
      const c = correo(), sal = document.getElementById('dirSalida');
      sal.innerHTML = `<div style="margin-top:10px;font-size:.88rem"><b>Asunto:</b> <span id="dirAsunto">${esc(c.asunto)}</span>
        <button type="button" id="dirCopAs" style="font:inherit;font-size:.8rem;border:1px solid #c7d2fe;background:#fff;border-radius:6px;padding:2px 8px;cursor:pointer;margin-left:6px">Copiar asunto</button></div>
        <textarea id="dirTxt" rows="16" style="width:100%;box-sizing:border-box;margin-top:6px;font:inherit;font-size:.9rem;border:1px solid #cbd5e1;border-radius:8px;padding:8px;background:#fff;color:#1f2a37">${esc(c.texto)}</textarea>
        <div id="dirCuenta" style="font-size:.85rem;font-weight:700;margin-top:4px"></div>
        <button type="button" id="dirCopiar" style="font:inherit;font-weight:800;border:0;border-radius:8px;height:38px;padding:0 16px;cursor:pointer;background:#16a34a;color:#fff;margin-top:6px">📋 Copiar correo</button>`;
      const copiar = (txt, b, ok) => (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .catch(()=>{ const ta=document.getElementById('dirTxt'); ta.select(); document.execCommand('copy'); })
        .then(()=>{ const o=b.textContent; b.textContent=ok; setTimeout(()=>b.textContent=o,1800); });
      // Copia con formato: los enlaces quedan en azul y se pueden pinchar al pegar en el correo
      const aHtml = txt => esc(txt).split('\n').map(l=>{
        l = l.replace(/^(\s*)(📁|📱) ([^:]+): (https?:\/\/\S+)$/u, (m,sp,ic,ti,u)=>`${sp}${ic} <a href="${u}">${ti}</a>`);
        if (!/<a /.test(l)) l = l.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
        return l.replace(/^ +/, '&nbsp; ');
      }).join('<br>');
      const copiarRico = (txt, b) => {
        const html = aHtml(txt);
        const hecho = ()=>{ const o=b.textContent; b.textContent='✅ Copiado con enlaces'; setTimeout(()=>b.textContent=o,2000); };
        if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write)
          return navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([txt],{type:'text/plain'})})]).then(hecho).catch(()=>viejo());
        viejo();
        function viejo(){ const d=document.createElement('div'); d.contentEditable='true'; d.style.cssText='position:fixed;left:-9999px;top:0'; d.innerHTML=html; document.body.appendChild(d);
          const r=document.createRange(); r.selectNodeContents(d); const sel=getSelection(); sel.removeAllRanges(); sel.addRange(r);
          try{ document.execCommand('copy'); hecho(); }catch(_){ copiar(txt, b, '✅ Copiado'); } sel.removeAllRanges(); d.remove(); }
      };
      document.getElementById('dirCopiar').onclick = e => copiarRico(document.getElementById('dirTxt').value, e.target);
      const LIM = 3500, cuenta = ()=>{ const ta=document.getElementById('dirTxt'), n=aHtml(ta.value).length, el=document.getElementById('dirCuenta');
        el.innerHTML = n<=LIM ? `✅ Cabe en Séneca: ${n} de ${LIM} caracteres` : `⚠️ Séneca admite ${LIM} caracteres y este correo ocupa ${n}. ${conAyudas()?'Desmarca «Incluir ayudas» y vuelve a generarlo, o':'Acorta algún punto o'} pégalo en dos mensajes.`;
        el.style.color = n<=LIM ? '#15803d' : '#b91c1c'; };
      document.getElementById('dirTxt').addEventListener('input', cuenta); cuenta();
      document.getElementById('dirCopAs').onclick = e => copiar(c.asunto, e.target, '✅');
    };
  }

  window.pintarCorreo = function(sec){
    seccion = sec;
    if (sec === 'directivo') cargarAyudas();
    if (window.pintarReuniones) window.pintarReuniones(sec);
    if (sec === 'directivo' && window.adminActivo && !escucha){
      escucha = ref().on('value', s=>{ actividades = s.val() || {}; pintar(); }, e=>{ actividades = {}; pintar(); const d=document.getElementById('dirError'); if(d) d.textContent='⚠️ Firebase no deja leer «actividades_profesorado». Hay que añadir el permiso en las reglas de la base de datos.'; });
    }
    pintar();
  };
  // cuando llegan los datos de reuniones, se repinta (por si ya estaba abierto)
  document.addEventListener('reuniones-lunes', ()=>{ if (seccion === 'directivo' && !document.getElementById('dirTxt')) pintar(); });
})();
