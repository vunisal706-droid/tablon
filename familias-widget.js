/* Portada del Tablón: avisos automáticos para las familias (familias.json, lo genera GitHub Actions),
   información fija del Plan de Centro, en varios idiomas y con lectura en voz alta. */
(function(){
  const el = document.getElementById('familiasBox'); if (!el) return;
  const esc = t => String(t||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const LANGS = [
    {id:'es', flag:'🇪🇸', name:'Español', voz:'es-ES'},
    {id:'ar', flag:'🇲🇦', name:'العربية', voz:'ar', rtl:true},
    {id:'ro', flag:'🇷🇴', name:'Română', voz:'ro-RO'},
    {id:'en', flag:'🇬🇧', name:'English', voz:'en-GB'},
    {id:'fr', flag:'🇫🇷', name:'Français', voz:'fr-FR'}];
  const UI = {
    es:{tram:'📌 Trámites con plazo', sem:'📅 Esta semana en el cole', boja:'📢 Novedades de la Junta para familias', escuchar:'🔊 Escuchar', parar:'⏹️ Parar', info:'📖 Información para familias', novoz:'Este móvil no tiene voz instalada para este idioma.', bojaNota:''},
    ar:{tram:'📌 إجراءات لها آجال', sem:'📅 هذا الأسبوع في المدرسة', boja:'📢 مستجدات حكومة الأندلس للأسر', escuchar:'🔊 استمع', parar:'⏹️ إيقاف', info:'📖 معلومات للأسر', novoz:'لا يوجد صوت مثبّت لهذه اللغة في هذا الهاتف.', bojaNota:'(باللغة الإسبانية)'},
    ro:{tram:'📌 Proceduri cu termen', sem:'📅 Săptămâna aceasta la școală', boja:'📢 Noutăți de la Junta pentru familii', escuchar:'🔊 Ascultă', parar:'⏹️ Oprește', info:'📖 Informații pentru familii', novoz:'Acest telefon nu are voce instalată pentru această limbă.', bojaNota:'(în spaniolă)'},
    en:{tram:'📌 Deadlines and procedures', sem:'📅 This week at school', boja:'📢 Regional government news for families', escuchar:'🔊 Listen', parar:'⏹️ Stop', info:'📖 Information for families', novoz:'This phone has no voice installed for this language.', bojaNota:'(in Spanish)'},
    fr:{tram:'📌 Démarches et délais', sem:'📅 Cette semaine à l’école', boja:'📢 Actualités de la Junta pour les familles', escuchar:'🔊 Écouter', parar:'⏹️ Arrêter', info:'📖 Informations pour les familles', novoz:'Ce téléphone n’a pas de voix installée pour cette langue.', bojaNota:'(en espagnol)'}};
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

  let datos = null, lang = 'es';
  try { lang = localStorage.getItem('tablon-idioma') || ''; } catch(e) {}
  if (!LANGS.some(l=>l.id===lang)) { const n=(navigator.language||'es').slice(0,2); lang = LANGS.some(l=>l.id===n) ? n : 'es'; }

  const card = (borde, fondo, html) => `<div class="fam-card" style="background:${fondo};border:1.5px solid ${borde};border-inline-start:6px solid ${borde};border-radius:14px;padding:10px 14px;margin:8px 0;color:#1f2a37;font-size:.95rem;line-height:1.5">${html}</div>`;
  const COL = {importante:['#dc2626','#fef2f2'], aviso:['#0284c7','#f0f9ff'], info:['#16a34a','#f0fdf4']};
  const titulo = t => `<div style="font-size:.8rem;font-weight:800;letter-spacing:.03em;color:#334155;margin:14px 0 2px">${t}</div>`;

  function contenido(){
    const L = LANGS.find(l=>l.id===lang), u = UI[lang];
    const d = !datos ? null : lang==='es' ? datos : ((datos.idiomas||{})[lang] || datos);
    let h = `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;margin:10px 0 4px" role="group" aria-label="Idioma / Language / اللغة">` +
      LANGS.map(l=>`<button type="button" data-lang="${l.id}" aria-pressed="${l.id===lang}" style="font:inherit;font-weight:800;border:2px solid ${l.id===lang?'#0f766e':'rgba(255,255,255,.7)'};background:${l.id===lang?'#fff':'rgba(255,255,255,.85)'};color:#1f2a37;border-radius:999px;padding:6px 12px;min-height:40px;cursor:pointer">${l.flag} ${l.name}</button>`).join('') +
      `<button type="button" id="famVoz" style="font:inherit;font-weight:800;border:0;background:#0f766e;color:#fff;border-radius:999px;padding:8px 16px;min-height:40px;cursor:pointer">${u.escuchar}</button></div>`;
    h += `<div dir="${L.rtl?'rtl':'ltr'}" style="text-align:${L.rtl?'right':'left'}">`;
    if (d){
      (d.avisos||[]).forEach(a=>{ const [b,f]=COL[a.nivel]||COL.info;
        h += card(b, f, `<b>${esc(a.emoji)} ${esc(a.titulo)}</b><div style="margin-top:3px">${esc(a.texto)}</div>`); });
      if ((d.tramites||[]).length){
        h += titulo(u.tram);
        d.tramites.forEach(t=> h += card(t.abierto?'#d97706':'#94a3b8', t.abierto?'#fffbeb':'#f8fafc',
          `<b>${esc(t.emoji)} ${esc(t.nombre)}</b> <span style="display:inline-block;background:${t.abierto?'#d97706':'#64748b'};color:#fff;border-radius:999px;padding:1px 9px;font-size:.8rem;font-weight:800">${esc(t.estado)}</span>${t.detalle?`<div style="margin-top:3px;color:#475569">${esc(t.detalle)}</div>`:''}`));
      }
      if ((d.semana||[]).length){
        h += titulo(u.sem);
        h += card('#7c3aed', '#faf5ff', d.semana.map(s=>`<div><b>${esc(s.texto)}</b> · ${esc(s.cuando)}</div>`).join(''));
      }
      if ((datos.boja||[]).length){
        h += titulo(u.boja + (u.bojaNota ? ' ' + u.bojaNota : ''));
        h += card('#283593', '#eef2ff', datos.boja.map(b=>`<div dir="ltr" style="margin:2px 0;text-align:left"><a href="${esc(b.url)}" target="_blank" rel="noopener" style="color:#283593;font-weight:700">${esc(b.t)}</a></div>`).join(''));
      }
    }
    h += `<details id="famInfo" style="background:rgba(255,255,255,.95);border:1.5px solid #e2e8f0;border-radius:14px;padding:10px 14px;margin:14px 0 4px;color:#1f2a37;font-size:.95rem;line-height:1.55">
      <summary style="cursor:pointer;font-weight:800;min-height:32px;color:#1f2a37">${u.info}</summary>
      ${INFO[lang].map(([t,x])=>`<p style="color:#1f2a37;margin:10px 0 0"><b>${esc(t)}</b> ${esc(x)}</p>`).join('')}
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
    const b = document.getElementById('famVoz'), u = UI[lang], L = LANGS.find(l=>l.id===lang);
    if (!synth) { alert(u.novoz); return; }
    if (synth.speaking) { synth.cancel(); b.textContent = u.escuchar; return; }
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
      if (i===frases.length-1) ut.onend = ()=>{ b.textContent = u.escuchar; };
      synth.speak(ut); });
    b.textContent = u.parar;
  }

  function pintar(){
    if (synth && synth.speaking) synth.cancel();
    el.innerHTML = contenido();
    el.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{ lang=b.dataset.lang; try{localStorage.setItem('tablon-idioma',lang)}catch(e){} pintar(); });
    document.getElementById('famVoz').onclick = leer;
  }
  if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = ()=>{};
  pintar();
  fetch('familias.json?_=' + Date.now(), {cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{ if(j){ datos=j; pintar(); } }).catch(()=>{});
})();
