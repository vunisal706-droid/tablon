/* Portada del Tablón: avisos automáticos para las familias (familias.json, lo genera GitHub Actions)
   y la información fija para familias sacada del Plan de Centro. */
(function(){
  const el = document.getElementById('familiasBox'); if (!el) return;
  const esc = t => String(t||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const card = (borde, fondo, html) => `<div style="background:${fondo};border:1.5px solid ${borde};border-left:6px solid ${borde};border-radius:14px;padding:10px 14px;margin:8px 0;color:#1f2a37;font-size:.95rem;line-height:1.45;text-align:left">${html}</div>`;
  const COL = {importante:['#dc2626','#fef2f2'], aviso:['#0284c7','#f0f9ff'], info:['#16a34a','#f0fdf4']};
  const titulo = t => `<div style="font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#475569;margin:14px 0 2px;text-align:left">${t}</div>`;

  const INFO = `
  <details style="background:rgba(255,255,255,.92);border:1.5px solid #e2e8f0;border-radius:14px;padding:10px 14px;margin:14px 0 4px;text-align:left;color:#1f2a37;font-size:.95rem;line-height:1.5">
    <summary style="cursor:pointer;font-weight:800;min-height:32px">📖 Información para familias</summary>
    <p><b>🌧️ Días de lluvia.</b> El alumnado de Infantil y del aula TEA entra por el patio de Infantil directamente a sus clases, y la recogida se hace igual por ese patio. El alumnado de Primaria sube directamente a clase sin hacer la fila.</p>
    <p><b>📱 Comunicación con el colegio.</b> El canal oficial es <b>iPasen</b> (Séneca): mensajes, notas, faltas y citas de tutoría. Informad al centro de cualquier situación familiar relevante.</p>
    <p><b>👩‍🏫 Tutorías.</b> Podéis pedir reunión con el tutor o la tutora cuando lo necesitéis, en persona o por iPasen (tutoría telemática).</p>
    <p><b>📝 Faltas de asistencia.</b> Hay que justificar <b>todas</b> las faltas, sea cual sea el motivo (Orden de 19 de septiembre de 2005). Se puede hacer por iPasen. La asistencia y la puntualidad son obligatorias entre los 6 y los 16 años.</p>
    <p><b>💊 Medicación.</b> Como norma general, el profesorado no da medicación. Si vuestro hijo o hija necesita un medicamento en horario escolar por una enfermedad crónica, la enfermera o el enfermero de referencia prepara con el equipo docente un protocolo individual. Hablad con el tutor o la tutora.</p>
    <p><b>🤝 Vuestros derechos</b> (ROF, art. 26): ser tratados con respeto, participar en la educación de vuestros hijos e hijas, recibir información periódica sobre su evolución, los criterios de evaluación, las faltas y los libros de texto, ser oídos en las decisiones que les afecten y participar en el Consejo Escolar.</p>
    <p><b>✋ Vuestro compromiso</b> (ROF, art. 27): colaborar en las actividades del centro, respetar sus normas y a su personal, cuidar el material escolar, justificar las faltas y cumplir los compromisos educativos y de convivencia que se firmen.</p>
    <p style="color:#64748b;font-size:.85rem">Más información: AMPA, delegados y delegadas de familias de cada clase y Consejo Escolar.</p>
  </details>`;

  function pintar(j){
    let h = '';
    (j.avisos||[]).forEach(a=>{ const [b,f]=COL[a.nivel]||COL.info;
      h += card(b, f, `<b>${esc(a.emoji)} ${esc(a.titulo)}</b><div style="margin-top:3px">${esc(a.texto)}</div>`); });
    if ((j.tramites||[]).length){
      h += titulo('📌 Trámites con plazo');
      j.tramites.forEach(t=> h += card(t.abierto?'#d97706':'#94a3b8', t.abierto?'#fffbeb':'#f8fafc',
        `<b>${esc(t.emoji)} ${esc(t.nombre)}</b> <span style="display:inline-block;background:${t.abierto?'#d97706':'#64748b'};color:#fff;border-radius:999px;padding:1px 9px;font-size:.78rem;font-weight:800;margin-left:4px">${esc(t.estado)}</span>${t.detalle?`<div style="margin-top:3px;color:#475569">${esc(t.detalle)}</div>`:''}`));
    }
    if ((j.semana||[]).length){
      h += titulo('📅 Esta semana en el cole');
      h += card('#7c3aed', '#faf5ff', j.semana.map(s=>`<div><b>${esc(s.texto)}</b> · ${esc(s.cuando)}</div>`).join(''));
    }
    if ((j.boja||[]).length){
      h += titulo('📢 Novedades de la Junta para familias');
      h += card('#283593', '#eef2ff', j.boja.map(b=>`<div style="margin:2px 0"><a href="${esc(b.url)}" target="_blank" rel="noopener" style="color:#283593;font-weight:700">${esc(b.t)}</a></div>`).join(''));
    }
    el.innerHTML = h + INFO;
  }
  el.innerHTML = INFO;
  fetch('familias.json?_=' + Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{ if(j) pintar(j); }).catch(()=>{});
})();
