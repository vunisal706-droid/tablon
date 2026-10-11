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
  let actividades = {}, escucha = null, seccion = null;
  const ref = () => firebase.database().ref('actividades_profesorado');
  const usuario = () => { const u = firebase.auth().currentUser; return u && u.email ? u.email.split('@')[0].toLowerCase() : ''; };

  function semana(){
    const R = window.reunionesLunes; let lunes;
    if (R) lunes = new Date(R.fecha); else { lunes = new Date(); lunes.setHours(12,0,0,0); while (lunes.getDay()!==1) lunes.setDate(lunes.getDate()+1); }
    const viernes = new Date(lunes); viernes.setDate(viernes.getDate()+4);
    return {lunes, viernes, desde: iso(lunes), hasta: iso(viernes)};
  }
  const fechaLarga = ds => { const d = new Date(ds+'T12:00'); return `${DIA[d.getDay()]} ${d.getDate()} de ${MES[d.getMonth()]}`; };

  function correo(){
    const R = window.reunionesLunes, S = semana(), yo = FIRMAS[document.getElementById('dirFirma').value] || {};
    const acts = Object.values(actividades).filter(a=>a.fecha>=S.desde && a.fecha<=S.hasta).sort((a,b)=>(a.fecha+(a.hora||'')).localeCompare(b.fecha+(b.hora||'')));
    const asunto = `Reuniones y actividades de la semana del ${S.lunes.getDate()} al ${S.viernes.getDate()} de ${MES[S.viernes.getMonth()]}`;
    let t = `Buenos días, compañeros y compañeras:\n\n`;
    if (R && R.ds >= S.desde && R.ds <= S.hasta){
      t += `Os recuerdo las reuniones del ${fechaLarga(R.ds)} (${R.n}.º lunes lectivo del mes):\n`;
      t += `• ${R.tutorias}: Tutorías con familias\n`;
      R.lista.forEach(r=>{
        if (r.turnos) t += `• ${r.nombre}:\n` + r.turnos.map(x=>`   – ${x[0]}: ${x[1]}`).join('\n') + '\n';
        else t += `• ${r.hora}: ${r.nombre}${r.nota?` (${r.nota})`:''}\n`;
      });
      if (!R.lista.length) t += `• Ese lunes no hay reuniones del cuadrante.\n`;
      R.ordenes.forEach(o=>{ t += `\nOrden del día previsto · ${o.organo}:\n` + o.puntos.map((p,i)=>`${i+1}. ${p}`).join('\n') + '\n'; });
    }
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
      <div style="color:#78350f;font-size:.88rem;margin-top:2px">Semana del ${fechaLarga(S.desde)} al ${fechaLarga(S.hasta)}. Cambia de semana con las flechas de las reuniones, aquí debajo.</div>
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
    box.querySelectorAll('[data-borrar]').forEach(b=>b.onclick=()=>{ if (confirm('¿Quitar esta actividad?')) ref().child(b.dataset.borrar).remove().catch(fallo); });
    document.getElementById('dirGen').onclick = ()=>{
      const c = correo(), sal = document.getElementById('dirSalida');
      sal.innerHTML = `<div style="margin-top:10px;font-size:.88rem"><b>Asunto:</b> <span id="dirAsunto">${esc(c.asunto)}</span>
        <button type="button" id="dirCopAs" style="font:inherit;font-size:.8rem;border:1px solid #c7d2fe;background:#fff;border-radius:6px;padding:2px 8px;cursor:pointer;margin-left:6px">Copiar asunto</button></div>
        <textarea id="dirTxt" rows="16" style="width:100%;box-sizing:border-box;margin-top:6px;font:inherit;font-size:.9rem;border:1px solid #cbd5e1;border-radius:8px;padding:8px;background:#fff;color:#1f2a37">${esc(c.texto)}</textarea>
        <button type="button" id="dirCopiar" style="font:inherit;font-weight:800;border:0;border-radius:8px;height:38px;padding:0 16px;cursor:pointer;background:#16a34a;color:#fff;margin-top:6px">📋 Copiar correo</button>`;
      const copiar = (txt, b, ok) => (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .catch(()=>{ const ta=document.getElementById('dirTxt'); ta.select(); document.execCommand('copy'); })
        .then(()=>{ const o=b.textContent; b.textContent=ok; setTimeout(()=>b.textContent=o,1800); });
      document.getElementById('dirCopiar').onclick = e => copiar(document.getElementById('dirTxt').value, e.target, '✅ Copiado');
      document.getElementById('dirCopAs').onclick = e => copiar(c.asunto, e.target, '✅');
    };
  }

  window.pintarCorreo = function(sec){
    seccion = sec;
    if (sec === 'directivo' && window.adminActivo && !escucha){
      escucha = ref().on('value', s=>{ actividades = s.val() || {}; pintar(); }, e=>{ actividades = {}; pintar(); const d=document.getElementById('dirError'); if(d) d.textContent='⚠️ Firebase no deja leer «actividades_profesorado». Hay que añadir el permiso en las reglas de la base de datos.'; });
    }
    pintar();
  };
  document.addEventListener('reuniones-lunes', ()=>{ if (seccion === 'directivo') pintar(); });
})();
