/* Tablón · Profesorado: qué equipos se reúnen el próximo lunes lectivo (cuadrante del centro)
   y los puntos del orden del día previstos ese mes (app Teletrabajo), más las otras actividades
   de esa semana que añade el Equipo Directivo (desaparecen cuando pasa su día).
   El 1.º, 2.º, 3.º y 4.º lunes cuentan solo los lunes con clase (calendario común). */
(function(){
  const esc = t => String(t||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const DIA = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const ORD = ['', '1.er', '2.º', '3.er', '4.º', '5.º'];
  const pad = n => String(n).padStart(2,'0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const sinCole = ds => window.CalendarioCole ? CalendarioCole.sinCole(ds) : null;
  const NOMBRE_ORG = {'CLAUSTRO':'Claustro','EQUIPO DE ORIENTACIÓN':'Equipo de Orientación','EQUIPOS DE CICLO':'Equipos de ciclo','ETCP':'ETCP','EQUIPOS DOCENTES':'Equipos docentes'};
  let datos = null, cursor = null;   // cursor = lunes que se está viendo (null = el próximo)
  let acts = {}, escuchaActs = false;   // actividades de la semana que añade el Equipo Directivo (Firebase)
  // Órdenes del día editados por el Equipo Directivo (se guardan en actividades_profesorado/_ordenes/ÓRGANO/MES y mandan sobre los de Teletrabajo)
  let ovr = {};
  const puntosDe = (O, o, mes) => { const x = (ovr[o]||{})[mes]; return x ? (x.puntos||[]) : ((O[o]||{})[mes]||[]); };
  const edita = () => secActual === 'directivo' && window.adminActivo;
  const refOrden = (o, mes) => firebase.database().ref('actividades_profesorado/_ordenes/'+o+'/'+mes);
  function guardarOrden(o, mes, puntos){
    const u = firebase.auth().currentUser;
    return refOrden(o, mes).set({puntos, autor: u && u.email ? u.email.split('@')[0] : '', editado: Date.now()})
      .catch(()=>alert('⚠️ No se ha podido guardar el orden del día. Revisa la conexión.'));
  }
  function escucharActs(){
    if (escuchaActs || !window.firebase || !firebase.apps.length) return;
    escuchaActs = true;
    firebase.database().ref('actividades_profesorado').on('value', s=>{ acts = s.val() || {}; ovr = acts._ordenes || {}; delete acts._ordenes;
      const box = document.getElementById('reunionesBox'); if (box && datos && box.innerHTML) pintarCaja(box); }, ()=>{ acts = {}; });
  }
  // Actividades que añade el Equipo Directivo: salen en cuanto se guardan y hasta que pasa su día (no esperan a su semana)
  const limpio = t => String(t||'').replace(/\s+([,.;:])/g,'$1').replace(/\s+/g,' ').trim().replace(/^./,c=>c.toUpperCase()).replace(/([.!?]\s+)(\p{Ll})/gu,(m,a,b)=>a+b.toUpperCase());
  function bloqueActs(){
    const hoy = iso(new Date()), dias = {};
    Object.values(acts).filter(a=>a && a.fecha>=hoy).forEach(a=>{ (dias[a.fecha] = dias[a.fecha] || []).push(a); });
    const fechas = Object.keys(dias).sort();
    if (!fechas.length) return '';
    const fichas = fechas.map(f=>{
      const d = new Date(f+'T12:00'), l = dias[f].sort((a,b)=>(a.hora||'').localeCompare(b.hora||''));
      return `<div style="display:flex;gap:12px;background:#fff;border:1px solid #fde68a;border-radius:12px;padding:8px 10px;margin-top:6px">
        <div style="flex:0 0 52px;text-align:center;border-radius:10px;overflow:hidden;border:1.5px solid #fcd34d;align-self:flex-start">
          <div style="background:#d97706;color:#fff;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:2px 0">${DIA[d.getDay()].slice(0,3)}</div>
          <div style="font-size:1.4rem;font-weight:800;color:#78350f;line-height:1.15;padding-top:2px">${d.getDate()}</div>
          <div style="font-size:.68rem;color:#b45309;text-transform:uppercase;padding-bottom:3px">${MES[d.getMonth()].slice(0,3)}</div></div>
        <div style="flex:1;min-width:0">${l.map((a,i)=>`<div style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;${i<l.length-1?'border-bottom:1px dashed #fde68a;':''}">
          ${a.hora?`<span style="flex:0 0 auto;background:#fef3c7;color:#92400e;font-weight:800;font-size:.8rem;border-radius:999px;padding:1px 9px;margin-top:2px">${esc(a.hora)}</span>`:''}
          <span style="flex:1;line-height:1.4">${esc(limpio(a.texto))}</span></div>`).join('')}</div></div>`;
    }).join('');
    return `<div style="margin-top:10px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:8px 10px">
      <div style="font-weight:800;color:#92400e">📌 Próximas actividades</div>${fichas}</div>`;
  }

  function lunesLectivos(desde, cuantos){
    const out = []; const d = new Date(desde); d.setHours(12,0,0,0);
    while (d.getDay() !== 1) d.setDate(d.getDate()+1);
    for (let k=0; k<60 && out.length<cuantos; k++, d.setDate(d.getDate()+7)){
      const ds = iso(d); if (sinCole(ds)) continue;
      // posición entre los lunes lectivos de su mes
      let n = 0; const x = new Date(d.getFullYear(), d.getMonth(), 1, 12);
      while (x <= d){ if (x.getDay()===1 && !sinCole(iso(x))) n++; x.setDate(x.getDate()+1); }
      out.push({fecha:new Date(d), ds, n});
    }
    return out;
  }
  function lunesAnterior(d){
    const x = new Date(d); x.setHours(12,0,0,0); x.setDate(x.getDate()-1);
    while (x.getDay() !== 1) x.setDate(x.getDate()-1);
    for (let k=0; k<60; k++, x.setDate(x.getDate()-7)) if (!sinCole(iso(x))) return lunesLectivos(x,1)[0];
    return null;
  }
  function cuando(f){
    const h = new Date(); h.setHours(12,0,0,0);
    const k = Math.round((f - h)/864e5);
    return k===0 ? 'hoy' : k===1 ? 'mañana' : `el ${DIA[f.getDay()]} ${f.getDate()} de ${MES[f.getMonth()]}`;
  }
  let secActual = null;
  function chips(p, org){
    // Ayuda (qué tratar + propuesta): la ve todo el profesorado
    const ay0 = (window.AYUDAS_ORDEN||{})[p];
    const ay = ay0 ? {...ay0, p: (ay0.po && ay0.po[org]) || ay0.p} : null;
    const ayuda = ay ? `<details style="margin:3px 0 6px"><summary style="cursor:pointer;font-size:.8em;font-weight:700;color:#8a5a00">💡 Ayuda para este punto</summary><div style="font-size:.86em;background:#fff8e1;border-radius:8px;padding:8px 10px;margin-top:4px;line-height:1.45"><p style="margin:0 0 6px"><b>Qué tratar:</b> ${esc(ay.q)}</p><p style="margin:0"><b>Propuesta:</b> ${esc(ay.p)}</p></div></details>` : '';
    // Enlaces al Drive y a las apps: solo Equipo Directivo con sesión iniciada
    const enl = ((secActual === 'directivo' || secActual === 'orden') && window.enlacesDrive) ? window.enlacesDrive(p).map(e=>` <a href="${esc(e.url)}" target="_blank" rel="noopener" style="display:inline-block;font-size:.78em;font-weight:700;color:#1565c0;background:#e3f2fd;border-radius:10px;padding:1px 8px;margin:2px 0 0 4px;text-decoration:none;white-space:nowrap">${e.icono||'📁'} ${esc(e.titulo)}</a>`).join('') : '';
    return enl + ayuda;
  }
  function html(){
    const R = datos.reuniones, O = (datos.ordenes||{}).organos || {};
    const ahora = new Date(); let desde = new Date(ahora);
    if (ahora.getDay()===1 && ahora.getHours()>=19) desde.setDate(desde.getDate()+1);
    if (cursor) desde = new Date(cursor);
    const [L, sig] = lunesLectivos(desde, 2);
    if (!L) return '';
    cursor = L.fecha;
    const btn = 'font:inherit;font-weight:700;border:1px solid #c7d2fe;background:#fff;color:#283593;border-radius:8px;height:32px;min-width:32px;padding:0 8px;cursor:pointer';
    const bmini = 'font:inherit;font-size:.78rem;font-weight:700;border:0;border-radius:6px;height:24px;padding:0 7px;cursor:pointer;vertical-align:middle';
    const nav = `<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
      <button type="button" data-reu="prev" style="${btn}" aria-label="Lunes anterior">‹</button>
      <button type="button" data-reu="hoy" style="${btn}">Próximo</button>
      <button type="button" data-reu="next" style="${btn}" aria-label="Lunes siguiente">›</button>
      <input type="date" data-reu="fecha" value="${L.ds}" aria-label="Elegir fecha" style="font:inherit;border:1px solid #c7d2fe;border-radius:8px;height:32px;padding:0 6px;color:#1f2a37;background:#fff">
    </div>`;
    const lista = (R.cuadrante||{})[String(L.n)] || [];
    const mes = pad(L.fecha.getMonth()+1);
    let h = nav + `<div style="font-weight:800;font-size:1.05rem">📅 Reuniones ${cuando(L.fecha)} · ${ORD[L.n]||L.n+'.º'} lunes lectivo</div>
      <div style="color:#475569;font-size:.9rem;margin-top:2px">Tutorías con familias: ${esc(R.tutorias||'16:00 - 17:00')}</div>`;
    if (!lista.length){
      h += `<div style="margin-top:8px">Este lunes no tiene reuniones en el cuadrante.</div>`;
    } else {
      h += `<div style="margin-top:8px;display:grid;gap:6px">` + lista.map(r=>`
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:8px 12px">
          <b>${esc(r.nombre)}</b>${r.hora?` <span style="color:#0f766e;font-weight:700">· ${esc(r.hora)}</span>`:''}${r.nota?` <span style="color:#64748b">(${esc(r.nota)})</span>`:''}
          ${r.turnos?`<div style="display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:4px;font-size:.88rem;color:#334155">${r.turnos.map(t=>`<span><b>${esc(t[0])}</b> ${esc(t[1])}</span>`).join('')}</div>`:''}
        </div>`).join('') + `</div>`;
      // Orden del día previsto por órgano (una vez por órgano)
      const orgs = [...new Set(lista.map(r=>r.organo).filter(Boolean))];
      const bloques = orgs.map(o=>{ const pts = puntosDe(O,o,mes), ed = edita();
        return pts.length ? `<details style="margin-top:6px"${secActual==='orden'?' open':''}><summary style="cursor:pointer;font-weight:700;color:#283593">📋 Orden del día previsto · ${esc(NOMBRE_ORG[o]||o)} (${MES[+mes-1]})</summary>
          <ol style="margin:6px 0 0 20px;padding:0;line-height:1.45">${pts.map((p,i)=>`<li>${esc(p)}${ed?` <span style="white-space:nowrap"><button type="button" data-ord="editar" data-o="${esc(o)}" data-m="${mes}" data-i="${i}" title="Modificar este punto" style="${bmini};background:#e0e7ff;color:#283593">✏️</button> <button type="button" data-ord="borrar" data-o="${esc(o)}" data-m="${mes}" data-i="${i}" title="Borrar este punto" style="${bmini};background:#fee2e2;color:#b91c1c">✕</button></span>`:''}${chips(p, o)}</li>`).join('')}</ol>${ed?`
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><input type="text" data-nuevo="${esc(o)}" maxlength="300" placeholder="Nuevo punto del orden del día" style="font:inherit;flex:1;min-width:180px;border:1px solid #c7d2fe;border-radius:8px;height:32px;padding:0 8px;background:#fff;color:#1f2a37">
          <button type="button" data-ord="anadir" data-o="${esc(o)}" data-m="${mes}" style="${bmini};height:32px;padding:0 12px;background:#283593;color:#fff">➕ Añadir</button>
          ${(ovr[o]||{})[mes]?`<button type="button" data-ord="restaurar" data-o="${esc(o)}" data-m="${mes}" title="Volver a los puntos previstos en Teletrabajo" style="${bmini};height:32px;padding:0 12px;background:#f1f5f9;color:#475569">↺ Original</button>`:''}</div>`:''}</details>` : (ed ? `<details style="margin-top:6px"><summary style="cursor:pointer;font-weight:700;color:#283593">📋 Orden del día · ${esc(NOMBRE_ORG[o]||o)} (${MES[+mes-1]}) — sin puntos</summary>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><input type="text" data-nuevo="${esc(o)}" maxlength="300" placeholder="Nuevo punto del orden del día" style="font:inherit;flex:1;min-width:180px;border:1px solid #c7d2fe;border-radius:8px;height:32px;padding:0 8px;background:#fff;color:#1f2a37">
          <button type="button" data-ord="anadir" data-o="${esc(o)}" data-m="${mes}" style="${bmini};height:32px;padding:0 12px;background:#283593;color:#fff">➕ Añadir</button>
          ${(ovr[o]||{})[mes]?`<button type="button" data-ord="restaurar" data-o="${esc(o)}" data-m="${mes}" title="Volver a los puntos previstos en Teletrabajo" style="${bmini};height:32px;padding:0 12px;background:#f1f5f9;color:#475569">↺ Original</button>`:''}</div></details>` : ''); }).join('');
      if (bloques) h += `<div style="margin-top:8px">${bloques}</div><div style="color:#64748b;font-size:.8rem;margin-top:6px">${edita()?'Con ✏️ y ✕ modificas o borras un punto; los cambios los ve todo el profesorado y salen en el correo y el PDF. «↺ Original» vuelve a los puntos de Teletrabajo.':'Puntos previstos en la app Teletrabajo; quien convoca puede ajustarlos.'}</div>`;
    }
    h += bloqueActs();
    if (sig) h += `<div style="margin-top:10px;color:#475569;font-size:.88rem">Siguiente: ${DIA[sig.fecha.getDay()]} ${sig.fecha.getDate()} de ${MES[sig.fecha.getMonth()]} · ${ORD[sig.n]||sig.n+'.º'} lunes lectivo${((R.cuadrante||{})[String(sig.n)]||[]).length?' — '+esc(R.cuadrante[String(sig.n)].map(r=>r.nombre).join(', ')):' — sin reuniones de cuadrante'}</div>`;
    const ics = 'webcal://vunisal706-droid.github.io/agenda/calendario-profesorado.ics';
    h += `<div style="margin-top:10px;font-size:.85rem"><a href="https://calendar.google.com/calendar/r?cid=${encodeURIComponent(ics)}" target="_blank" rel="noopener" style="color:#283593;font-weight:700">📲 Añadir todas las reuniones a mi Google Calendar</a> · <a href="${ics}" style="color:#283593">otro calendario</a></div>`;
    return `<div style="background:#f8fafc;border:1.5px solid #c7d2fe;border-left:6px solid #283593;border-radius:14px;padding:12px 14px;margin:0 0 16px;color:#1f2a37;text-align:left;font-size:.95rem">${h}</div>`;
  }
  function pintarCaja(box){
    box.innerHTML = html();
    // Avisa a otros paneles (correo semanal del Equipo Directivo) del lunes que se está viendo
    try{
      const L = lunesLectivos(cursor, 1)[0];
      if (L){ const lista = (datos.reuniones.cuadrante||{})[String(L.n)] || [];
        const O = (datos.ordenes||{}).organos || {}, mes = pad(L.fecha.getMonth()+1);
        const ordenes = [...new Set(lista.map(r=>r.organo).filter(Boolean))].map(o=>({organo:NOMBRE_ORG[o]||o, codigo:o, puntos:puntosDe(O,o,mes)})).filter(x=>x.puntos.length);
        window.reunionesLunes = {fecha:L.fecha, ds:L.ds, n:L.n, lista, ordenes, tutorias:datos.reuniones.tutorias||'16:00 - 17:00'};
        document.dispatchEvent(new CustomEvent('reuniones-lunes'));
      }
    }catch(e){}
    // Editar / borrar / añadir puntos del orden del día (solo Equipo Directivo con sesión)
    box.querySelectorAll('[data-ord]').forEach(b=>b.onclick=()=>{
      if (!edita()) return;
      const a = b.dataset.ord, o = b.dataset.o, mes = b.dataset.m, i = +b.dataset.i;
      const pts = puntosDe((datos.ordenes||{}).organos || {}, o, mes).slice();
      if (a === 'editar'){ const t = prompt('Modificar el punto del orden del día:', pts[i]); if (t === null || !t.trim() || t.trim() === pts[i]) return; pts[i] = t.trim(); guardarOrden(o, mes, pts); }
      else if (a === 'borrar'){ if (!confirm('¿Borrar este punto del orden del día?\n\n' + pts[i])) return; pts.splice(i,1); guardarOrden(o, mes, pts); }
      else if (a === 'anadir'){ const inp = b.parentNode.querySelector('[data-nuevo]'), t = inp.value.trim(); if (!t){ inp.focus(); return; } pts.push(t); guardarOrden(o, mes, pts); }
      else if (a === 'restaurar'){ if (confirm('¿Volver a los puntos originales previstos en Teletrabajo?')) refOrden(o, mes).remove().catch(()=>{}); }
    });
    box.querySelectorAll('[data-nuevo]').forEach(inp=>inp.onkeydown=e=>{ if (e.key==='Enter'){ e.preventDefault(); inp.parentNode.querySelector('[data-ord="anadir"]').click(); } });
    box.querySelectorAll('[data-reu]').forEach(b=>{
      const a = b.dataset.reu;
      if (a==='fecha') b.onchange = ()=>{ if (b.value){ cursor = new Date(b.value+'T12:00'); pintarCaja(box); } };
      else b.onclick = ()=>{
        if (a==='hoy') cursor = null;
        else if (a==='next'){ const x=new Date(cursor); x.setDate(x.getDate()+1); cursor = x; }
        else { const p = lunesAnterior(cursor); if (p) cursor = p.fecha; }
        pintarCaja(box);
      };
    });
  }
  // Para el correo semanal: reuniones de un lunes concreto (null si ese lunes no hay cole)
  window.reunionesDeLunes = function(lunes){
    if (!datos) return undefined;
    const d = new Date(lunes); d.setHours(12,0,0,0);
    if (sinCole(iso(d))) return null;
    const L = lunesLectivos(d, 1)[0]; if (!L || L.ds !== iso(d)) return null;
    const lista = (datos.reuniones.cuadrante||{})[String(L.n)] || [];
    const O = (datos.ordenes||{}).organos || {}, mes = pad(L.fecha.getMonth()+1);
    const ordenes = [...new Set(lista.map(r=>r.organo).filter(Boolean))].map(o=>({organo:NOMBRE_ORG[o]||o, codigo:o, puntos:puntosDe(O,o,mes)})).filter(x=>x.puntos.length);
    return {fecha:L.fecha, ds:L.ds, n:L.n, lista, ordenes, tutorias:datos.reuniones.tutorias||'16:00 - 17:00'};
  };
  window.pintarReuniones = async function(sec){
    const box = document.getElementById('reunionesBox'); if (!box) return;
    secActual = sec;
    if (sec === 'orden' && window.MODO_ORDEN) cursor = new Date(window.MODO_ORDEN+'T12:00');
    if (sec !== 'maestros' && sec !== 'directivo' && sec !== 'orden'){ box.innerHTML = ''; return; }
    try{
      if (!datos){
        const get = u => fetch(u+'?_='+Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
        const [reuniones, ordenes, ayudas, enlaces] = await Promise.all([get('/agenda/reuniones.json'), get('/teletrabajo/ordenes-del-dia.json'), get('/tablon/ayudas-orden.json'), get('/tablon/enlaces-orden.json'),
          window.CalendarioCole ? CalendarioCole.listo : null]);
        if (!reuniones) return;
        datos = {reuniones, ordenes};
        window.AYUDAS_ORDEN = (ayudas && ayudas.ayudas) || {};
        window.ENLACES_ORDEN = (enlaces && enlaces.enlaces) || [];
      }
      escucharActs();
      pintarCaja(box);
    }catch(e){ box.innerHTML = ''; }
  };
})();
