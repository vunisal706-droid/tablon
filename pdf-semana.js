/* Tablón · PDF semanal para adjuntar al correo de Séneca.
   Reúne las reuniones del lunes, el orden del día con ayudas y enlaces (que funcionan al pinchar),
   los días sin clase y las otras actividades de la semana. Se genera en el navegador con pdfmake. */
(function(){
  const DIA = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const C = {azul:'#23297a', azul2:'#3b46b5', claro:'#eef0fb', linea:'#d5d9f2', texto:'#1f2433', gris:'#5b6172',
             oro:'#c47a0a', oroClaro:'#fff6e5', verde:'#0f766e', verdeClaro:'#e7f6f3', rojo:'#b42318', rojoClaro:'#fdecea'};
  const may = t => String(t||'').replace(/^./, c=>c.toUpperCase());
  const fechaLarga = ds => { const d = new Date(ds+'T12:00'); return `${DIA[d.getDay()]} ${d.getDate()} de ${MES[d.getMonth()]}`; };

  function cargar(src){ return new Promise((ok, ko)=>{ const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  let listo = null;
  function pdfmakeListo(){
    if (window.pdfMake && window.pdfMake.vfs) return Promise.resolve();
    if (!listo) listo = cargar('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js')
      .then(()=>cargar('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js'))
      .catch(e=>{ listo = null; throw e; });
    return listo;
  }
  function logo(){
    return fetch('logo-cole.jpg').then(r=>r.ok?r.blob():null).then(b=>!b?null:new Promise(ok=>{ const f = new FileReader(); f.onload = ()=>ok(f.result); f.onerror = ()=>ok(null); f.readAsDataURL(b); })).catch(()=>null);
  }

  // Título de sección con una línea de color debajo
  const seccion = (txt, color) => ({ stack:[
    {text:txt.toUpperCase(), fontSize:10.5, bold:true, color:color||C.azul, characterSpacing:1.2},
    {canvas:[{type:'rect', x:0, y:3, w:42, h:3, r:1.5, color:color||C.azul}, {type:'line', x1:46, y1:4.5, x2:515, y2:4.5, lineWidth:.6, lineColor:C.linea}]}
  ], margin:[0,16,0,8] });
  // Caja con fondo y borde izquierdo de color
  const caja = (contenido, fondo, borde) => ({ table:{widths:['*'], body:[[{stack:[].concat(contenido), margin:[10,8,10,8]}]]},
    layout:{fillColor:()=>fondo, hLineWidth:()=>0, vLineWidth:i=>i===0?3:0, vLineColor:()=>borde, paddingLeft:()=>0, paddingRight:()=>0, paddingTop:()=>0, paddingBottom:()=>0}, margin:[0,0,0,8] });
  const chip = e => ({text:e.titulo, link:e.url, color:'#1557b0', decoration:'underline', bold:true, fontSize:8.5});

  window.pdfSemana = async function(d){
    // d = {S, R, acts, sinClase, yo, asunto, enlaceOrden}
    await pdfmakeListo();
    const img = await logo();
    const S = d.S, R = d.R;
    const semanaTxt = `Semana del ${S.lunes.getDate()}${S.lunes.getMonth()!==S.viernes.getMonth()?' de '+MES[S.lunes.getMonth()]:''} al ${S.viernes.getDate()} de ${MES[S.viernes.getMonth()]} de ${S.viernes.getFullYear()}`;
    const content = [];

    // Cabecera
    content.push({ columns:[
      img ? {image:img, width:74, margin:[0,0,0,0]} : {text:''},
      {stack:[
        {text:'CEIP CAPITULACIONES · SANTA FE', fontSize:9, bold:true, color:C.gris, characterSpacing:1.5},
        {text:'Información semanal del profesorado', fontSize:20, bold:true, color:C.azul, margin:[0,3,0,2]},
        {text:semanaTxt, fontSize:12, color:C.azul2, bold:true}
      ], margin:[12,10,0,0]}
    ], columnGap:0 });
    content.push({canvas:[{type:'rect', x:0, y:8, w:515, h:4, r:2, linearGradient:[C.azul, C.azul2, '#7c86e0'], color:C.azul}], margin:[0,0,0,4]});

    // Reuniones del lunes
    content.push(seccion('Reuniones del lunes'));
    if (R){
      content.push({text:[{text:may(fechaLarga(R.ds)), bold:true}, ` · ${R.n}.º lunes lectivo del mes`], fontSize:11, color:C.texto, margin:[0,0,0,6]});
      const body = [[{text:'Hora', bold:true, color:'#fff', fontSize:9}, {text:'Reunión', bold:true, color:'#fff', fontSize:9}]];
      body.push([{text:R.tutorias, fontSize:10}, {text:'Tutorías con familias', fontSize:10}]);
      R.lista.forEach(r=>{
        if (r.turnos) body.push([{text:'Por turnos', fontSize:10, color:C.gris}, {stack:[{text:r.nombre, bold:true, fontSize:10}].concat(r.turnos.map(x=>({text:[{text:x[0]+': ', bold:true}, x[1]], fontSize:9, color:C.gris, margin:[8,1,0,0]})))}]);
        else body.push([{text:r.hora||'', fontSize:10, bold:true, color:C.verde}, {text:[{text:r.nombre, bold:true}, r.nota?{text:`  (${r.nota})`, color:C.gris}:''], fontSize:10}]);
      });
      content.push({table:{headerRows:1, widths:[90,'*'], body}, layout:{
        fillColor:(i)=> i===0 ? C.azul : (i%2 ? '#ffffff' : '#f6f7fd'), hLineWidth:(i,n)=> i===0||i===n.table.body.length ? 0 : .5, hLineColor:()=>C.linea, vLineWidth:()=>0,
        paddingTop:()=>5, paddingBottom:()=>5, paddingLeft:()=>8, paddingRight:()=>8}});
      if (!R.lista.length) content.push({text:'Ese lunes no hay reuniones del cuadrante.', italics:true, color:C.gris, margin:[0,6,0,0]});
    } else {
      content.push(caja({text:'Esta semana no hay reuniones de los lunes.', color:C.texto}, C.claro, C.azul));
    }

    // Orden del día con ayudas y enlaces
    if (R && R.ordenes.length){
      content.push(seccion('Orden del día previsto', C.verde));
      content.push({text:'Cada punto lleva qué tratar, una propuesta y los enlaces al Drive o a las apps (se pueden pinchar).', fontSize:9, color:C.gris, margin:[0,0,0,6]});
      R.ordenes.forEach(o=>{
        const pts = o.puntos.map((p,i)=>{
          const ay0 = window.ayudaPunto ? window.ayudaPunto(p) : null;
          const prop = ay0 ? ((ay0.po && o.codigo && ay0.po[o.codigo]) || ay0.p) : '';
          const enl = window.enlacesDrive ? window.enlacesDrive(p) : [];
          const st = [{text:[{text:`${i+1}. `, color:C.verde, bold:true}, {text:p, bold:true}], fontSize:10.5, color:C.texto}];
          if (ay0) st.push({text:[{text:'Qué tratar: ', bold:true, color:C.azul}, ay0.q], fontSize:9, color:C.texto, margin:[12,2,0,0]},
                           {text:[{text:'Propuesta: ', bold:true, color:C.oro}, prop], fontSize:9, color:C.texto, margin:[12,2,0,0]});
          if (enl.length) st.push({text:[{text:'Enlaces: ', bold:true, color:C.gris}].concat(enl.flatMap((e,k)=>k?[{text:'  ·  ', color:C.gris}, chip(e)]:[chip(e)])), fontSize:9, margin:[12,3,0,0]});
          return {stack:st, margin:[0,0,0,7], unbreakable:true};
        });
        content.push({table:{widths:['*'], body:[[{text:`${o.organo}`.toUpperCase(), bold:true, color:'#fff', fontSize:10, characterSpacing:.8, margin:[10,5,10,5]}],[{stack:pts, margin:[10,8,10,2]}]]},
          layout:{fillColor:i=>i===0?C.verde:'#fbfdfc', hLineWidth:(i,n)=>i===n.table.body.length?.8:0, vLineWidth:()=>.8, hLineColor:()=>'#cfe9e4', vLineColor:()=>'#cfe9e4',
            paddingLeft:()=>0, paddingRight:()=>0, paddingTop:()=>0, paddingBottom:()=>0}, margin:[0,0,0,10]});
      });
      if (d.enlaceOrden) content.push({text:[{text:'Versión en línea del orden del día: '}, {text:'abrir en el Tablón', link:d.enlaceOrden, color:'#1557b0', decoration:'underline', bold:true}], fontSize:9, color:C.gris});
    }

    // Días sin clase
    if (d.sinClase.length){
      content.push(seccion('Días sin clase', C.rojo));
      content.push(caja(d.sinClase.map(x=>({text:[{text:may(x.dia)+': ', bold:true}, x.motivo], fontSize:10, color:C.texto, margin:[0,1,0,1]})), C.rojoClaro, C.rojo));
    }

    // Otras actividades
    content.push(seccion('Otras actividades de la semana', C.oro));
    if (d.acts.length){
      content.push({table:{widths:[110,'*'], body:d.acts.map(a=>[
        {text:[{text:may(fechaLarga(a.fecha)), bold:true}, a.hora?{text:`\n${a.hora}`, color:C.oro, bold:true}:''], fontSize:10},
        {text:a.texto + (a.familias?'':''), fontSize:10, color:C.texto}])},
        layout:{fillColor:i=>i%2?C.oroClaro:'#fffdf8', hLineWidth:()=>0, vLineWidth:i=>i===0?3:0, vLineColor:()=>C.oro, paddingTop:()=>6, paddingBottom:()=>6, paddingLeft:()=>9, paddingRight:()=>9}});
    } else content.push({text:'No hay otras actividades previstas.', italics:true, color:C.gris, fontSize:10});

    // Firma
    content.push({stack:[
      {text:'Un saludo,', fontSize:10, color:C.texto},
      {text:d.yo.nombre||'', bold:true, fontSize:11, color:C.azul, margin:[0,6,0,0]},
      {text:`${d.yo.cargo?d.yo.cargo+' · ':''}CEIP Capitulaciones`, fontSize:9.5, color:C.gris}
    ], margin:[0,20,0,0], unbreakable:true});

    const hoy = new Date();
    const doc = {
      pageSize:'A4', pageMargins:[40,40,40,50],
      info:{title:d.asunto, author:'CEIP Capitulaciones', subject:'Información semanal del profesorado'},
      defaultStyle:{font:'Roboto', fontSize:10, lineHeight:1.2, color:C.texto},
      footer:(p, n)=>({margin:[40,14,40,0], columns:[
        {text:`CEIP Capitulaciones · ${semanaTxt}`, fontSize:8, color:C.gris},
        {text:`Generado el ${hoy.getDate()} de ${MES[hoy.getMonth()]} · Página ${p} de ${n}`, fontSize:8, color:C.gris, alignment:'right'}]}),
      content
    };
    const nombre = `Semana_${S.desde}_CEIP_Capitulaciones.pdf`;
    pdfMake.createPdf(doc).download(nombre);
    return nombre;
  };
})();
