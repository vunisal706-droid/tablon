/* Tablón · Profesorado: qué equipos se reúnen el próximo lunes lectivo (cuadrante del centro)
   y los puntos del orden del día previstos ese mes (app Teletrabajo).
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
  function chips(p){
    if (secActual !== 'directivo' || !window.enlacesDrive) return '';
    return window.enlacesDrive(p).map(e=>` <a href="${esc(e.url)}" target="_blank" rel="noopener" style="display:inline-block;font-size:.78em;font-weight:700;color:#1565c0;background:#e3f2fd;border-radius:10px;padding:1px 8px;margin:2px 0 0 4px;text-decoration:none;white-space:nowrap">📁 ${esc(e.titulo)}</a>`).join('');
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
      const bloques = orgs.map(o=>{ const pts = (O[o]||{})[mes] || [];
        return pts.length ? `<details style="margin-top:6px"><summary style="cursor:pointer;font-weight:700;color:#283593">📋 Orden del día previsto · ${esc(NOMBRE_ORG[o]||o)} (${MES[+mes-1]})</summary>
          <ol style="margin:6px 0 0 20px;padding:0;line-height:1.45">${pts.map(p=>`<li>${esc(p)}${chips(p)}</li>`).join('')}</ol></details>` : ''; }).join('');
      if (bloques) h += `<div style="margin-top:8px">${bloques}</div><div style="color:#64748b;font-size:.8rem;margin-top:6px">Puntos previstos en la app Teletrabajo; quien convoca puede ajustarlos.</div>`;
    }
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
        const ordenes = [...new Set(lista.map(r=>r.organo).filter(Boolean))].map(o=>({organo:NOMBRE_ORG[o]||o, puntos:(O[o]||{})[mes]||[]})).filter(x=>x.puntos.length);
        window.reunionesLunes = {fecha:L.fecha, ds:L.ds, n:L.n, lista, ordenes, tutorias:datos.reuniones.tutorias||'16:00 - 17:00'};
        document.dispatchEvent(new CustomEvent('reuniones-lunes'));
      }
    }catch(e){}
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
    const ordenes = [...new Set(lista.map(r=>r.organo).filter(Boolean))].map(o=>({organo:NOMBRE_ORG[o]||o, puntos:(O[o]||{})[mes]||[]})).filter(x=>x.puntos.length);
    return {fecha:L.fecha, ds:L.ds, n:L.n, lista, ordenes, tutorias:datos.reuniones.tutorias||'16:00 - 17:00'};
  };
  window.pintarReuniones = async function(sec){
    const box = document.getElementById('reunionesBox'); if (!box) return;
    secActual = sec;
    if (sec !== 'maestros' && sec !== 'directivo'){ box.innerHTML = ''; return; }
    try{
      if (!datos){
        const get = u => fetch(u+'?_='+Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
        const [reuniones, ordenes] = await Promise.all([get('/agenda/reuniones.json'), get('/teletrabajo/ordenes-del-dia.json'),
          window.CalendarioCole ? CalendarioCole.listo : null]);
        if (!reuniones) return;
        datos = {reuniones, ordenes};
      }
      pintarCaja(box);
    }catch(e){ box.innerHTML = ''; }
  };
})();
