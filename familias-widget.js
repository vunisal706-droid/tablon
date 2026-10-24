/* Portada del Tablón: avisos automáticos para las familias (familias.json, lo genera GitHub Actions),
   información fija del Plan de Centro, en varios idiomas y con lectura en voz alta. */
(function(){
  const el = document.getElementById('familiasBox'); if (!el) return;
  const esc = t => String(t||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const LANGS = [
    {id:'es', name:'Español', corto:'ES', voz:'es-ES'},
    {id:'ar', name:'العربية', corto:'ع', voz:'ar', rtl:true},
    {id:'ro', name:'Română', corto:'RO', voz:'ro-RO'},
    {id:'en', name:'English', corto:'EN', voz:'en-GB'},
    {id:'fr', name:'Français', corto:'FR', voz:'fr-FR'}];
  const UI = {
    es:{tram:'📌 Trámites con plazo', sem:'📅 Agenda del cole', boja:'📢 Novedades de la Junta para familias', escuchar:'🔊 Escuchar', parar:'⏹️ Parar', info:'📖 Información para familias', novoz:'Este móvil no tiene voz instalada para este idioma.', bojaNota:''},
    ar:{tram:'📌 إجراءات لها آجال', sem:'📅 مواعيد المدرسة', boja:'📢 مستجدات حكومة الأندلس للأسر', escuchar:'🔊 استمع', parar:'⏹️ إيقاف', info:'📖 معلومات للأسر', novoz:'لا يوجد صوت مثبّت لهذه اللغة في هذا الهاتف.', bojaNota:'(باللغة الإسبانية)'},
    ro:{tram:'📌 Proceduri cu termen', sem:'📅 Agenda școlii', boja:'📢 Noutăți de la Junta pentru familii', escuchar:'🔊 Ascultă', parar:'⏹️ Oprește', info:'📖 Informații pentru familii', novoz:'Acest telefon nu are voce instalată pentru această limbă.', bojaNota:'(în spaniolă)'},
    en:{tram:'📌 Deadlines and procedures', sem:'📅 School calendar', boja:'📢 Regional government news for families', escuchar:'🔊 Listen', parar:'⏹️ Stop', info:'📖 Information for families', novoz:'This phone has no voice installed for this language.', bojaNota:'(in Spanish)'},
    fr:{tram:'📌 Démarches et délais', sem:'📅 Agenda de l’école', boja:'📢 Actualités de la Junta pour les familles', escuchar:'🔊 Écouter', parar:'⏹️ Arrêter', info:'📖 Informations pour les familles', novoz:'Ce téléphone n’a pas de voix installée pour cette langue.', bojaNota:'(en espagnol)'}};
  const INFO = {
    es:[['🌧️ Días de lluvia.','El alumnado de Infantil y del aula TEA entra por el patio de Infantil directamente a sus clases, y la recogida se hace igual por ese patio. El alumnado de Primaria sube directamente a clase sin hacer la fila.'],
        ['📱 Comunicación con el colegio.','El canal oficial es iPasen (Séneca): mensajes, notas, faltas y citas de tutoría. Informad al centro de cualquier situación familiar relevante.'],
        ['👩‍🏫 Tutorías.','Podéis pedir reunión con el tutor o la tutora cuando lo necesitéis, en persona o por iPasen (tutoría telemática).'],
        ['📝 Faltas de asistencia.','Hay que justificar todas las faltas, sea cual sea el motivo (Orden de 19 de septiembre de 2005). Se puede hacer por iPasen. La asistencia y la puntualidad son obligatorias entre los 6 y los 16 años.'],
        ['💊 Medicación.','Como norma general, el profesorado no da medicación. Si vuestro hijo o hija necesita un medicamento en horario escolar por una enfermedad crónica, la enfermera o el enfermero de referencia prepara con el equipo docente un protocolo individual. Hablad con el tutor o la tutora.'],
        ['🤝 Vuestros derechos (ROF, art. 26).','Ser tratados con respeto, participar en la educación de vuestros hijos e hijas, recibir información periódica sobre su evolución, los criterios de evaluación, las faltas y los libros de texto, ser oídos en las decisiones que les afecten y participar en el Consejo Escolar.'],
        ['✋ Vuestro compromiso (ROF, art. 27).','Colaborar en las actividades del centro, respetar sus normas y a su personal, cuidar el material escolar, justificar las faltas y cumplir los compromisos educativos y de convivencia que se firmen.']],
    ar:[['🌧️ أيام المطر.','يدخل تلاميذ الروضة (Infantil) وقسم التوحد (TEA) من ساحة الروضة مباشرة إلى أقسامهم، ويتمّ استلامهم أيضاً من نفس الساحة. ويصعد تلاميذ الابتدائي مباشرة إلى القسم دون الوقوف في الصف.'],
        ['📱 التواصل مع المدرسة.','القناة الرسمية هي تطبيق iPasen (نظام Séneca): الرسائل والنقاط والغيابات ومواعيد لقاء المعلم. أخبروا المدرسة بأي وضع عائلي مهم.'],
        ['👩‍🏫 لقاءات مع المعلم.','يمكنكم طلب لقاء مع المعلم أو المعلمة متى احتجتم، حضورياً أو عبر iPasen.'],
        ['📝 الغياب.','يجب تبرير كل الغيابات مهما كان السبب (قرار 19 سبتمبر 2005)، ويمكن ذلك عبر iPasen. الحضور والالتزام بالوقت إلزاميان من 6 إلى 16 سنة.'],
        ['💊 الأدوية.','كقاعدة عامة لا يعطي المعلمون الأدوية. إذا احتاج طفلكم دواءً أثناء الدوام بسبب مرض مزمن، يُعِدّ الممرض أو الممرضة المرجعية مع الفريق التربوي بروتوكولاً خاصاً. تحدّثوا مع المعلم أو المعلمة.'],
        ['🤝 حقوقكم (النظام الداخلي، المادة 26).','أن تُعامَلوا باحترام، وأن تشاركوا في تعليم أطفالكم، وأن تتلقّوا معلومات دورية عن تقدّمهم ومعايير التقييم والغيابات والكتب المدرسية، وأن يُستمع إليكم في القرارات التي تخصّهم، وأن تشاركوا في المجلس المدرسي.'],
        ['✋ التزامكم (النظام الداخلي، المادة 27).','التعاون في أنشطة المدرسة، واحترام قواعدها والعاملين فيها، والعناية بالأدوات المدرسية، وتبرير الغيابات، والوفاء بالالتزامات التربوية والسلوكية الموقّعة.']],
    ro:[['🌧️ Zilele cu ploaie.','Elevii de la Infantil și din clasa TEA intră prin curtea de la Infantil direct în clasele lor, iar ridicarea copiilor se face tot pe acolo. Elevii de la Primaria urcă direct în clasă, fără să se mai așeze la rând.'],
        ['📱 Comunicarea cu școala.','Canalul oficial este iPasen (Séneca): mesaje, note, absențe și programări la învățător. Anunțați școala despre orice situație familială importantă.'],
        ['👩‍🏫 Întâlniri cu învățătorul.','Puteți cere o întâlnire cu învățătorul sau învățătoarea oricând aveți nevoie, în persoană sau prin iPasen.'],
        ['📝 Absențele.','Toate absențele trebuie justificate, oricare ar fi motivul (Ordinul din 19 septembrie 2005). Se poate face prin iPasen. Prezența și punctualitatea sunt obligatorii între 6 și 16 ani.'],
        ['💊 Medicamentele.','De regulă, profesorii nu dau medicamente. Dacă copilul are nevoie de un medicament în timpul orelor din cauza unei boli cronice, asistenta sau asistentul medical de referință pregătește împreună cu profesorii un protocol individual. Vorbiți cu învățătorul sau învățătoarea.'],
        ['🤝 Drepturile voastre (ROF, art. 26).','Să fiți tratați cu respect, să participați la educația copiilor, să primiți periodic informații despre progresul lor, criteriile de evaluare, absențe și manuale, să fiți ascultați în deciziile care îi privesc și să participați în Consiliul Școlar.'],
        ['✋ Angajamentul vostru (ROF, art. 27).','Să colaborați la activitățile școlii, să respectați regulile și personalul, să aveți grijă de materialele școlare, să justificați absențele și să respectați angajamentele educative și de conviețuire semnate.']],
    en:[['🌧️ Rainy days.','Infant (Infantil) and TEA classroom pupils go in through the Infantil playground straight to their classrooms, and are collected through the same playground. Primary pupils go straight up to class without lining up.'],
        ['📱 Contacting the school.','The official channel is the iPasen app (Séneca): messages, marks, absences and teacher appointments. Please tell the school about any important family situation.'],
        ['👩‍🏫 Meetings with the teacher.','You can ask to meet the class teacher whenever you need, in person or through iPasen.'],
        ['📝 Absences.','All absences must be justified, whatever the reason (Order of 19 September 2005). You can do it through iPasen. Attendance and punctuality are compulsory from 6 to 16.'],
        ['💊 Medicines.','As a general rule, teachers do not give medicines. If your child needs medicine during school hours because of a long-term illness, the school nurse prepares an individual plan with the teachers. Talk to the class teacher.'],
        ['🤝 Your rights (school rules, art. 26).','To be treated with respect, to take part in your children’s education, to receive regular information about their progress, assessment criteria, absences and textbooks, to be heard in decisions that affect them and to take part in the School Council.'],
        ['✋ Your commitment (school rules, art. 27).','To take part in school activities, respect the school rules and staff, look after school materials, justify absences and keep any education and behaviour agreements you sign.']],
    fr:[['🌧️ Jours de pluie.','Les élèves d’Infantil et de la classe TEA entrent par la cour d’Infantil directement dans leurs classes, et on vient les chercher par cette même cour. Les élèves de Primaire montent directement en classe sans faire la file.'],
        ['📱 Communiquer avec l’école.','Le canal officiel est l’application iPasen (Séneca) : messages, notes, absences et rendez-vous avec l’enseignant. Informez l’école de toute situation familiale importante.'],
        ['👩‍🏫 Rencontres avec l’enseignant.','Vous pouvez demander un rendez-vous avec l’enseignant ou l’enseignante quand vous en avez besoin, sur place ou via iPasen.'],
        ['📝 Absences.','Toutes les absences doivent être justifiées, quel que soit le motif (Arrêté du 19 septembre 2005). On peut le faire via iPasen. L’assiduité et la ponctualité sont obligatoires de 6 à 16 ans.'],
        ['💊 Médicaments.','En règle générale, les enseignants ne donnent pas de médicaments. Si votre enfant a besoin d’un médicament pendant l’école à cause d’une maladie chronique, l’infirmier ou l’infirmière de référence prépare un protocole individuel avec l’équipe. Parlez-en à l’enseignant.'],
        ['🤝 Vos droits (règlement, art. 26).','Être traités avec respect, participer à l’éducation de vos enfants, recevoir régulièrement des informations sur leurs progrès, les critères d’évaluation, les absences et les manuels, être écoutés pour les décisions qui les concernent et participer au Conseil d’école.'],
        ['✋ Votre engagement (règlement, art. 27).','Collaborer aux activités de l’école, respecter ses règles et son personnel, prendre soin du matériel scolaire, justifier les absences et respecter les engagements éducatifs et de vivre-ensemble signés.']]};

  let datos = null, lang = 'es', acts = {};
  const pad = n => String(n).padStart(2,'0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  // Actividades marcadas para familias: salen en cuanto se guardan y hasta que pasa su día
  function actsFam(){
    const hoy = iso(new Date());
    return Object.values(acts).filter(a=>a && a.familias && a.fecha>=hoy);
  }
  const LOC = {es:'es-ES', ar:'ar', ro:'ro-RO', en:'en-GB', fr:'fr-FR'};
  // Texto limpio: sin espacios antes de comas o puntos y con mayúscula inicial
  const limpio = t => String(t||'').replace(/\s+([,.;:])/g,'$1').replace(/\s+/g,' ').trim().replace(/^./,c=>c.toUpperCase()).replace(/([.!?]\s+)(\p{Ll})/gu,(m,a,b)=>a+b.toUpperCase());
  // Agenda bonita: una ficha por día (calendario a la izquierda) con sus actividades y la hora
  function agenda(items, L){
    const loc = LOC[L.id]||'es-ES', dias = {};
    items.forEach(x=>{ (dias[x.fecha] = dias[x.fecha] || []).push(x); });
    return Object.keys(dias).sort().map(f=>{
      const fd = f ? new Date(f+'T12:00') : null;
      let sem = '', num = '', mes = '';
      if (fd){ try{ sem = fd.toLocaleDateString(loc,{weekday:'short'}).replace('.',''); mes = fd.toLocaleDateString(loc,{month:'short'}).replace('.',''); }catch(e){} num = fd.getDate(); }
      const l = dias[f].sort((a,b)=>(a.hora||'').localeCompare(b.hora||''));
      const tile = fd ? `<div style="flex:0 0 54px;text-align:center;border-radius:12px;overflow:hidden;border:1px solid #cddcf5;background:#fff;align-self:flex-start">
          <div style="background:#1f5fbf;color:#fff;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:2px 0">${esc(sem)}</div>
          <div style="font-size:1.45rem;font-weight:800;color:#14306b;line-height:1.15;padding-top:2px">${num}</div>
          <div style="font-size:.7rem;color:#1f5fbf;text-transform:uppercase;padding-bottom:3px">${esc(mes)}</div></div>` : '';
      const lista = l.map((x,i)=>`<div style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;${i<l.length-1?'border-bottom:1px dashed #cddcf5;':''}">
          ${x.hora?`<span style="flex:0 0 auto;background:#eaf2fd;color:#17489a;font-weight:800;font-size:.8rem;border-radius:999px;padding:1px 9px;margin-top:2px" dir="ltr">${esc(x.hora)}</span>`:''}
          <span style="flex:1;color:#1f2a37;line-height:1.4">${esc(limpio(x.texto))}${!fd&&x.cuando?` <span style="color:#64748b">· ${esc(x.cuando)}</span>`:''}</span></div>`).join('');
      return `<div class="fam-card" style="display:flex;gap:12px;background:#fff;border:1px solid rgba(20,48,107,.10);border-radius:14px;padding:10px 12px;margin:8px 0">${tile}<div style="flex:1;min-width:0">${lista}</div></div>`;
    }).join('');
  }
  function cuandoFam(f, l){ try { return f.toLocaleDateString(LOC[l]||'es-ES', {weekday:'long', day:'numeric', month:'long'}); } catch(e){ return iso(f); } }
  try { lang = localStorage.getItem('tablon-idioma') || ''; } catch(e) {}
  if (!LANGS.some(l=>l.id===lang)) { const n=(navigator.language||'es').slice(0,2); lang = LANGS.some(l=>l.id===n) ? n : 'es'; }

  // Nota del tablón: punto de color (rojo importante, azul aviso, verde información) y texto
  const card = (borde, fondo, html) => `<div class="fam-card fam-aviso" style="--c:${borde}">${html}</div>`;
  const COL = {importante:['#dc2626','#fef2f2'], aviso:['#0284c7','#f0f9ff'], info:['#16a34a','#f0fdf4']};
  const titulo = t => `<div class="fam-tit">${t}</div>`;

  function contenido(){
    const L = LANGS.find(l=>l.id===lang), u = UI[lang];
    const d = !datos ? null : lang==='es' ? datos : ((datos.idiomas||{})[lang] || datos);
    let h = '';
    h += `<div dir="${L.rtl?'rtl':'ltr'}" style="text-align:${L.rtl?'right':'left'}">`;
    if (d){
      (d.avisos||[]).forEach(a=>{ const [b,f]=COL[a.nivel]||COL.info;
        h += card(b, f, `<b>${esc(a.emoji)} ${esc(a.titulo)}</b><div style="margin-top:3px">${esc(a.texto)}</div>`); });
      if ((d.tramites||[]).length){
        h += titulo(u.tram);
        d.tramites.forEach(t=> h += card(t.abierto?'#d97706':'#94a3b8', t.abierto?'#fffbeb':'#f8fafc',
          `<b>${esc(t.emoji)} ${esc(t.nombre)}</b> <span class="fam-estado" style="--c:${t.abierto?'#b45309':'#64748b'}">${esc(t.estado)}</span>${t.detalle?`<div style="margin-top:3px;color:#475569">${esc(t.detalle)}</div>`:''}`));
      }
    }
    // Agenda: lo automático (familias.json) + lo que el Equipo Directivo marca «también para familias», agrupado por día
    const items = ((d && d.semana) || []).map(s=>({fecha:s.fecha||'', hora:'', texto:s.texto||'', cuando:s.cuando||''}))
      .concat(actsFam().map(a=>({fecha:a.fecha, hora:a.hora||'', texto:a.texto||''})));
    if (items.length){
      h += titulo(u.sem);
      h += agenda(items, L);
    }
    if (d){
      if ((datos.boja||[]).length){
        h += titulo(u.boja + (u.bojaNota ? ' ' + u.bojaNota : ''));
        h += `<ul class="fam-boja" dir="ltr">` + datos.boja.map(b=>`<li><a href="${esc(b.url)}" target="_blank" rel="noopener" title="${esc(b.t)}"><span class="txt">${esc(b.t)}</span><span class="ir">Leer en el BOJA ↗</span></a></li>`).join('') + `</ul>`;
      }
    }
    h += `<details id="famInfo" style="background:rgba(255,255,255,.95);border:1.5px solid #e2e8f0;border-radius:14px;padding:10px 14px;margin:14px 0 4px;color:#1f2a37;font-size:.95rem;line-height:1.55">
      <summary style="cursor:pointer;font-weight:800;min-height:32px;color:#1f2a37">${u.info}</summary>
      ${INFO[lang].map(([t,x])=>`<p style="color:#1f2a37;margin:10px 0 0"><b>${esc(t)}</b> ${esc(x)}</p>`).join('')}
      <p style="color:#1f2a37;margin:12px 0 0"><a href="https://calendar.google.com/calendar/r?cid=${encodeURIComponent('webcal://vunisal706-droid.github.io/agenda/calendario-familias.ics')}" target="_blank" rel="noopener" style="color:#0f766e;font-weight:800">📲 Google Calendar</a> · <a href="webcal://vunisal706-droid.github.io/agenda/calendario-familias.ics" style="color:#0f766e;font-weight:800">📅 iPhone / Outlook</a></p>
    </details></div>`;
    return h;
  }

  // ----- Lectura en voz alta -----
  const synth = window.speechSynthesis;
  function vozPara(code){
    const vs = synth ? synth.getVoices() : [];
    return vs.find(v=>v.lang.toLowerCase()===code.toLowerCase()) || vs.find(v=>v.lang.toLowerCase().startsWith(code.slice(0,2).toLowerCase()));
  }
  function leer(){
    const u = UI[lang], L = LANGS.find(l=>l.id===lang);
    if (!synth) { alert(u.novoz); return; }
    if (synth.speaking) { synth.cancel(); setTimeout(controles, 50); return; }
    const voz = vozPara(L.voz);
    if (!voz && synth.getVoices().length) { alert(u.novoz); return; }
    // Se lee lo que está a la vista: avisos, trámites y semana (y la información fija si está abierta)
    const zona = el.querySelector('[dir]'); const partes = [];
    zona.querySelectorAll('.fam-card').forEach(c=>{ if (!c.querySelector('a')) partes.push(c.innerText.replace(/\s+/g,' ')); });
    const info = document.getElementById('famInfo');
    if (info && (info.open || !partes.length)) INFO[lang].forEach(([t,x])=>partes.push(t+' '+x));
    const texto = partes.join('. ').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu,'');
    const frases = texto.match(/[^.!?؟]+[.!?؟]?/g) || [texto];
    frases.forEach((f,i)=>{ const ut = new SpeechSynthesisUtterance(f.trim()); ut.lang = L.voz; if (voz) ut.voice = voz; ut.rate = .95;
      if (i===frases.length-1) ut.onend = ()=>controles();
      synth.speak(ut); });
    setTimeout(controles, 100);
  }

  // ----- Controles discretos en la cabecera (arriba a la derecha) -----
  function controles(){
    const hr = document.getElementById('headerRight'); if (!hr) return;
    let c = document.getElementById('famCtl');
    if (!c){
      const st = document.createElement('style');
      st.textContent = `#headerRight{display:flex;align-items:center;gap:8px}
        #famCtl{position:relative;display:flex;gap:6px;align-items:center}
        #famCtl .fc-b{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:#fff;font:inherit;font-size:.8rem;font-weight:600;
          height:32px;padding:0 10px;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;line-height:1}
        #famCtl .fc-b:hover,#famCtl .fc-b[aria-expanded=true]{background:rgba(255,255,255,.28)}
        #famCtl .fc-v{width:32px;padding:0;justify-content:center}
        #famCtl .fc-m{position:absolute;top:38px;right:0;background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:6px;min-width:150px;z-index:200;display:none}
        #famCtl .fc-m.on{display:block}
        #famCtl .fc-m button{display:block;width:100%;text-align:start;background:none;border:0;font:inherit;font-size:.9rem;color:#1f2a37;padding:9px 12px;border-radius:8px;cursor:pointer}
        #famCtl .fc-m button:hover{background:#f1f5f9}
        #famCtl .fc-m button[aria-current=true]{font-weight:800;color:#0f766e}
        #famCtl svg{width:15px;height:15px}`;
      document.head.appendChild(st);
      c = document.createElement('div'); c.id = 'famCtl';
      hr.insertBefore(c, hr.firstChild);
      document.addEventListener('click', e=>{ if (!c.contains(e.target)) { const m=c.querySelector('.fc-m'); if(m){m.classList.remove('on'); c.querySelector('.fc-l').setAttribute('aria-expanded','false');} } });
    }
    const L = LANGS.find(l=>l.id===lang), u = UI[lang], hablando = synth && synth.speaking;
    const globo = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';
    const alt = hablando ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
    c.innerHTML = `<button type="button" class="fc-b fc-v" id="famVoz" title="${hablando?u.parar:u.escuchar}" aria-label="${hablando?u.parar:u.escuchar}">${alt}</button>
      <button type="button" class="fc-b fc-l" aria-haspopup="true" aria-expanded="false" title="Idioma · Language · اللغة">${globo}<span>${L.corto}</span></button>
      <div class="fc-m" role="menu">${LANGS.map(l=>`<button type="button" role="menuitem" data-lang="${l.id}" aria-current="${l.id===lang}" dir="${l.rtl?'rtl':'ltr'}">${l.name}</button>`).join('')}</div>`;
    const m = c.querySelector('.fc-m'), lb = c.querySelector('.fc-l');
    lb.onclick = e=>{ e.stopPropagation(); m.classList.toggle('on'); lb.setAttribute('aria-expanded', m.classList.contains('on')); };
    c.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{ lang=b.dataset.lang; try{localStorage.setItem('tablon-idioma',lang)}catch(e){} pintar(); });
    c.querySelector('#famVoz').onclick = leer;
  }
  // Agenda del cole también dentro de la sección Familias (actividades del Equipo Directivo + familias.json)
  let secAgenda = null;
  function pintarAgendaSec(){
    const box = document.getElementById('agendaBox'); if (!box) return;
    if (secAgenda !== 'familias'){ box.innerHTML = ''; return; }
    const d = !datos ? null : lang==='es' ? datos : ((datos.idiomas||{})[lang] || datos), L = LANGS.find(l=>l.id===lang), u = UI[lang];
    const items = ((d && d.semana) || []).map(s=>({fecha:s.fecha||'', hora:'', texto:s.texto||'', cuando:s.cuando||''}))
      .concat(actsFam().map(a=>({fecha:a.fecha, hora:a.hora||'', texto:a.texto||''})));
    box.innerHTML = items.length ? `<div dir="${L.rtl?'rtl':'ltr'}" style="text-align:${L.rtl?'right':'left'};margin:0 0 14px">${titulo(u.sem)}${agenda(items, L)}</div>` : '';
  }
  window.pintarAgendaSeccion = function(sec){ secAgenda = sec; pintarAgendaSec(); };
  function pintar(){
    if (synth && synth.speaking) synth.cancel();
    el.innerHTML = contenido();
    controles();
    pintarAgendaSec();
  }
  if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = ()=>{};
  pintar();
  try { firebase.database().ref('actividades_profesorado').on('value', s=>{ acts = s.val() || {}; pintar(); }, ()=>{ acts = {}; }); } catch(e) {}
  fetch('familias.json?_=' + Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{ if(j){ datos=j; pintar(); } }).catch(()=>{});
})();
