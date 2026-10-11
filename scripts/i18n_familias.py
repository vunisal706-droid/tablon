"""Textos de los avisos para familias en varios idiomas (es, ar, ro, en, fr)."""
LANGS = ['es', 'ar', 'ro', 'en', 'fr']

DIAS = {
 'es': ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
 'ar': ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
 'ro': ['luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă', 'duminică'],
 'en': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
 'fr': ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']}
MESES = {
 'es': ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
 'ar': ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
 'ro': ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
 'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
 'fr': ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']}

def fecha(d, l):
    if l == 'es': return f'{DIAS[l][d.weekday()]} {d.day} de {MESES[l][d.month-1]}'
    if l == 'ar': return f'{DIAS[l][d.weekday()]} {d.day} {MESES[l][d.month-1]}'
    if l == 'ro': return f'{DIAS[l][d.weekday()]}, {d.day} {MESES[l][d.month-1]}'
    if l == 'en': return f'{DIAS[l][d.weekday()]} {d.day} {MESES[l][d.month-1]}'
    return f'{DIAS[l][d.weekday()]} {d.day} {MESES[l][d.month-1]}'

def cuando(d, hoy, l):
    k = (d - hoy).days
    W = {'es': ('hoy', 'mañana', 'el {f}'), 'ar': ('اليوم', 'غداً', 'يوم {f}'), 'ro': ('azi', 'mâine', '{f}'),
         'en': ('today', 'tomorrow', 'on {f}'), 'fr': ("aujourd'hui", 'demain', 'le {f}')}[l]
    return W[0] if k == 0 else W[1] if k == 1 else W[2].format(f=fecha(d, l))

T = {
 'lluvia_t': {'es': 'Previsión de lluvia {cuando} {momento}', 'ar': 'توقّع هطول أمطار {cuando} {momento}',
              'ro': 'Se prognozează ploaie {cuando} {momento}', 'en': 'Rain forecast {cuando} {momento}',
              'fr': 'Pluie prévue {cuando} {momento}'},
 'm_ambos': {'es': 'a la entrada y a la salida', 'ar': 'عند الدخول وعند الخروج', 'ro': 'la intrare și la ieșire',
             'en': 'at drop-off and pick-up', 'fr': "à l'entrée et à la sortie"},
 'm_ent': {'es': 'a la entrada (9:00)', 'ar': 'عند الدخول (9:00)', 'ro': 'la intrare (9:00)', 'en': 'at drop-off (9:00)', 'fr': "à l'entrée (9h00)"},
 'm_sal': {'es': 'a la salida (13:50)', 'ar': 'عند الخروج (13:50)', 'ro': 'la ieșire (13:50)', 'en': 'at pick-up (13:50)', 'fr': 'à la sortie (13h50)'},
 'prob': {'es': 'Probabilidad de lluvia: {p} %.', 'ar': 'احتمال المطر: {p}٪.', 'ro': 'Probabilitate de ploaie: {p} %.',
          'en': 'Chance of rain: {p}%.', 'fr': 'Probabilité de pluie : {p} %.'},
 'p_ent': {'es': 'Si llueve a la entrada, el alumnado de Infantil y del aula TEA entra por el patio de Infantil directamente a sus clases, y el alumnado de Primaria sube directamente a clase sin hacer la fila.',
           'ar': 'إذا كانت تمطر عند الدخول، يدخل تلاميذ مرحلة الروضة (Infantil) وقسم التوحد (TEA) من ساحة الروضة مباشرة إلى أقسامهم، ويصعد تلاميذ الابتدائي مباشرة إلى القسم دون الوقوف في الصف.',
           'ro': 'Dacă plouă la intrare, elevii de la Infantil și din clasa TEA intră prin curtea de la Infantil direct în clasele lor, iar elevii de la Primaria urcă direct în clasă, fără să se mai așeze la rând.',
           'en': 'If it rains at drop-off, Infant (Infantil) and TEA classroom pupils go in through the Infantil playground straight to their classrooms, and Primary pupils go straight up to class without lining up.',
           'fr': "S'il pleut à l'entrée, les élèves d'Infantil et de la classe TEA entrent par la cour d'Infantil directement dans leurs classes, et les élèves de Primaire montent directement en classe sans faire la file."},
 'p_sal': {'es': 'Si llueve a la salida, la recogida del alumnado de Infantil y del aula TEA se hace también por el patio de Infantil.',
           'ar': 'إذا كانت تمطر عند الخروج، يتمّ استلام تلاميذ الروضة وقسم التوحد (TEA) أيضاً من ساحة الروضة.',
           'ro': 'Dacă plouă la ieșire, copiii de la Infantil și din clasa TEA se ridică tot prin curtea de la Infantil.',
           'en': 'If it rains at pick-up, Infantil and TEA classroom pupils are also collected through the Infantil playground.',
           'fr': "S'il pleut à la sortie, les élèves d'Infantil et de la classe TEA se récupèrent aussi par la cour d'Infantil."},
 'calor_t': {'es': 'Calor {cuando}: hasta {g}°', 'ar': 'حرارة {cuando}: حتى {g}°', 'ro': 'Căldură {cuando}: până la {g}°',
             'en': 'Hot weather {cuando}: up to {g}°', 'fr': 'Chaleur {cuando} : jusqu’à {g}°'},
 'calor_x': {'es': 'Que traigan botella de agua, gorra y ropa fresca. Si es posible, crema solar puesta desde casa.',
             'ar': 'يُرجى إحضار قارورة ماء وقبعة وملابس خفيفة، ووضع واقي الشمس من البيت إن أمكن.',
             'ro': 'Să aducă o sticlă cu apă, șapcă și haine lejere. Dacă se poate, cu cremă de soare pusă de acasă.',
             'en': 'Please send a water bottle, a cap and light clothes. If possible, put on sun cream at home.',
             'fr': "Prévoir une gourde, une casquette et des vêtements légers. Si possible, mettre de la crème solaire à la maison."},
 'frio_t': {'es': 'Mucho frío {cuando} a primera hora', 'ar': 'برد شديد {cuando} في الصباح الباكر', 'ro': 'Foarte frig {cuando} dimineața',
            'en': 'Very cold {cuando} in the morning', 'fr': 'Très froid {cuando} le matin'},
 'frio_x': {'es': 'Abrigo, gorro y guantes para la entrada y el recreo.', 'ar': 'معطف وقبعة صوفية وقفازات للدخول ووقت الاستراحة.',
            'ro': 'Geacă, căciulă și mănuși pentru intrare și pauză.', 'en': 'Coat, hat and gloves for drop-off and break time.',
            'fr': "Manteau, bonnet et gants pour l'entrée et la récréation."},
 'sol_t': {'es': 'Sol muy fuerte {cuando}', 'ar': 'شمس قوية جداً {cuando}', 'ro': 'Soare foarte puternic {cuando}', 'en': 'Very strong sun {cuando}', 'fr': 'Soleil très fort {cuando}'},
 'sol_x': {'es': 'Gorra y crema solar para el recreo.', 'ar': 'قبعة وواقي شمس لوقت الاستراحة.', 'ro': 'Șapcă și cremă de soare pentru pauză.',
           'en': 'Cap and sun cream for break time.', 'fr': 'Casquette et crème solaire pour la récréation.'},
 'aemet_t': {'es': 'Aviso {nivel} de AEMET por {fen}', 'ar': 'تحذير {nivel} من وكالة الأرصاد (AEMET): {fen}', 'ro': 'Avertizare {nivel} AEMET: {fen}',
             'en': 'AEMET {nivel} weather warning: {fen}', 'fr': 'Alerte {nivel} AEMET : {fen}'},
 'aemet_x': {'es': 'Sigue las indicaciones de Protección Civil y del centro.', 'ar': 'اتّبعوا تعليمات الحماية المدنية والمدرسة.',
             'ro': 'Urmați indicațiile Protecției Civile și ale școlii.', 'en': 'Follow the instructions of Civil Protection and the school.',
             'fr': 'Suivez les consignes de la Protection civile et de l’école.'},
 'naranja': {'es': 'naranja', 'ar': 'برتقالي', 'ro': 'portocalie', 'en': 'orange', 'fr': 'orange'},
 'rojo': {'es': 'rojo', 'ar': 'أحمر', 'ro': 'roșie', 'en': 'red', 'fr': 'rouge'},
 'polen_t': {'es': 'Polen alto {cuando}: {partes}', 'ar': 'نسبة لقاح مرتفعة {cuando}: {partes}', 'ro': 'Polen ridicat {cuando}: {partes}',
             'en': 'High pollen {cuando}: {partes}', 'fr': 'Pollen élevé {cuando} : {partes}'},
 'polen_x': {'es': 'Si tu hijo o hija tiene alergia, que lleve su medicación pautada y avisa a su tutor o tutora.',
             'ar': 'إذا كان طفلكم يعاني من الحساسية، فليأخذ دواءه الموصوف وأخبروا معلّمه أو معلّمته.',
             'ro': 'Dacă copilul are alergie, să ia medicamentele prescrise și anunțați învățătorul sau învățătoarea.',
             'en': 'If your child has allergies, make sure they take their prescribed medicine and tell their class teacher.',
             'fr': "Si votre enfant est allergique, qu'il prenne son traitement prescrit et prévenez son enseignant ou son enseignante."},
 'olivo': {'es': 'olivo', 'ar': 'الزيتون', 'ro': 'măslin', 'en': 'olive', 'fr': 'olivier'},
 'gram': {'es': 'gramíneas', 'ar': 'الأعشاب', 'ro': 'graminee', 'en': 'grass', 'fr': 'graminées'},
 'alto': {'es': 'alto', 'ar': 'مرتفع', 'ro': 'ridicat', 'en': 'high', 'fr': 'élevé'},
 'malto': {'es': 'muy alto', 'ar': 'مرتفع جداً', 'ro': 'foarte ridicat', 'en': 'very high', 'fr': 'très élevé'},
 'aire_t': {'es': 'Mala calidad del aire {cuando}', 'ar': 'جودة هواء سيئة {cuando}', 'ro': 'Calitate slabă a aerului {cuando}',
            'en': 'Poor air quality {cuando}', 'fr': "Mauvaise qualité de l'air {cuando}"},
 'calima': {'es': ' por polvo en suspensión (calima)', 'ar': ' بسبب الغبار العالق', 'ro': ' din cauza prafului în suspensie',
            'en': ' due to dust in the air', 'fr': ' à cause de la poussière en suspension'},
 'aire_x': {'es': 'Se recomienda evitar el ejercicio intenso al aire libre, sobre todo con asma o problemas respiratorios.',
            'ar': 'يُنصح بتجنّب الرياضة المجهِدة في الهواء الطلق، خاصة لمن يعاني من الربو أو مشاكل التنفس.',
            'ro': 'Se recomandă evitarea efortului intens în aer liber, mai ales în caz de astm sau probleme respiratorii.',
            'en': 'Avoid intense outdoor exercise, especially with asthma or breathing problems.',
            'fr': "Il est conseillé d'éviter l'effort intense en plein air, surtout en cas d'asthme ou de problèmes respiratoires."},
 'quedan': {'es': 'Quedan {n} días', 'ar': 'بقي {n} أيام', 'ro': 'Mai sunt {n} zile', 'en': '{n} days left', 'fr': 'Plus que {n} jours'},
 'queda1': {'es': 'Queda 1 día', 'ar': 'بقي يوم واحد', 'ro': 'Mai este 1 zi', 'en': '1 day left', 'fr': 'Plus que 1 jour'},
 'ultimo': {'es': 'Último día', 'ar': 'آخر يوم', 'ro': 'Ultima zi', 'en': 'Last day', 'fr': 'Dernier jour'},
 'hoy': {'es': 'Hoy', 'ar': 'اليوم', 'ro': 'Azi', 'en': 'Today', 'fr': "Aujourd'hui"},
 'empieza': {'es': 'Empieza el {f}', 'ar': 'يبدأ يوم {f}', 'ro': 'Începe {f}', 'en': 'Starts on {f}', 'fr': 'Commence le {f}'},
 'finde': {'es': 'este fin de semana (se trabaja en clase durante la semana)', 'ar': 'نهاية هذا الأسبوع (يُحتفل به في القسم خلال الأسبوع)',
           'ro': 'în acest weekend (se lucrează în clasă în timpul săptămânii)', 'en': 'this weekend (worked on in class during the week)',
           'fr': 'ce week-end (on le travaille en classe pendant la semaine)'},
}
FEN = {  # fenómenos de AEMET
 'lluvias': {'ar': 'الأمطار', 'ro': 'ploi', 'en': 'rain', 'fr': 'pluies'},
 'tormentas': {'ar': 'العواصف الرعدية', 'ro': 'furtuni', 'en': 'thunderstorms', 'fr': 'orages'},
 'vientos': {'ar': 'الرياح', 'ro': 'vânt', 'en': 'wind', 'fr': 'vent'},
 'temperaturas máximas': {'ar': 'درجات الحرارة المرتفعة', 'ro': 'temperaturi maxime', 'en': 'high temperatures', 'fr': 'températures maximales'},
 'temperaturas mínimas': {'ar': 'درجات الحرارة المنخفضة', 'ro': 'temperaturi minime', 'en': 'low temperatures', 'fr': 'températures minimales'},
 'nevadas': {'ar': 'الثلوج', 'ro': 'ninsori', 'en': 'snow', 'fr': 'neige'},
 'costeros': {'ar': 'أمواج البحر', 'ro': 'fenomene costiere', 'en': 'coastal phenomena', 'fr': 'phénomènes côtiers'},
 'polvo en suspensión': {'ar': 'الغبار العالق', 'ro': 'praf în suspensie', 'en': 'dust', 'fr': 'poussière'}}
def fen(f, l):
    if l == 'es': return f.lower()
    for k, v in FEN.items():
        if k in f.lower(): return v[l]
    return f.lower()

SENALADOS = {
 '10-16': {'es': '🍎 Día Mundial de la Alimentación', 'ar': '🍎 اليوم العالمي للأغذية', 'ro': '🍎 Ziua Mondială a Alimentației', 'en': '🍎 World Food Day', 'fr': "🍎 Journée mondiale de l'alimentation"},
 '11-16': {'es': '💃 Día del Flamenco', 'ar': '💃 يوم الفلامنكو', 'ro': '💃 Ziua Flamenco', 'en': '💃 Flamenco Day', 'fr': '💃 Journée du flamenco'},
 '11-20': {'es': '🧒 Día de los Derechos de la Infancia', 'ar': '🧒 يوم حقوق الطفل', 'ro': '🧒 Ziua Drepturilor Copilului', 'en': "🧒 Children's Rights Day", 'fr': "🧒 Journée des droits de l'enfant"},
 '11-22': {'es': '🎶 Día de los Gitanos Andaluces', 'ar': '🎶 يوم الغجر الأندلسيين', 'ro': '🎶 Ziua Romilor Andaluzi', 'en': '🎶 Andalusian Roma Day', 'fr': '🎶 Journée des Gitans andalous'},
 '11-25': {'es': '💜 Día contra la Violencia hacia las Mujeres', 'ar': '💜 اليوم الدولي للقضاء على العنف ضد المرأة', 'ro': '💜 Ziua împotriva violenței asupra femeilor', 'en': '💜 Day against Violence towards Women', 'fr': '💜 Journée contre les violences faites aux femmes'},
 '12-03': {'es': '♿ Día de las Personas con Discapacidad', 'ar': '♿ اليوم الدولي للأشخاص ذوي الإعاقة', 'ro': '♿ Ziua Persoanelor cu Dizabilități', 'en': '♿ Day of Persons with Disabilities', 'fr': '♿ Journée des personnes handicapées'},
 '01-30': {'es': '🕊️ Día de la Paz', 'ar': '🕊️ يوم السلام', 'ro': '🕊️ Ziua Păcii', 'en': '🕊️ Peace Day', 'fr': '🕊️ Journée de la paix'},
 '02-11': {'es': '🔬 Día de la Mujer y la Niña en la Ciencia', 'ar': '🔬 يوم المرأة والفتاة في العلوم', 'ro': '🔬 Ziua Femeilor și Fetelor în Știință', 'en': '🔬 Women and Girls in Science Day', 'fr': '🔬 Journée des femmes et des filles de science'},
 '02-28': {'es': '💚 Día de Andalucía', 'ar': '💚 يوم الأندلس', 'ro': '💚 Ziua Andaluziei', 'en': '💚 Andalusia Day', 'fr': "💚 Journée de l'Andalousie"},
 '03-08': {'es': '♀️ Día Internacional de la Mujer', 'ar': '♀️ اليوم العالمي للمرأة', 'ro': '♀️ Ziua Internațională a Femeii', 'en': "♀️ International Women's Day", 'fr': '♀️ Journée internationale des femmes'},
 '03-21': {'es': '🧦 Día del Síndrome de Down', 'ar': '🧦 اليوم العالمي لمتلازمة داون', 'ro': '🧦 Ziua Sindromului Down', 'en': '🧦 Down Syndrome Day', 'fr': '🧦 Journée de la trisomie 21'},
 '04-02': {'es': '🧩 Día de Concienciación sobre el Autismo', 'ar': '🧩 اليوم العالمي للتوعية بالتوحد', 'ro': '🧩 Ziua Conștientizării Autismului', 'en': '🧩 Autism Awareness Day', 'fr': "🧩 Journée de sensibilisation à l'autisme"},
 '04-23': {'es': '📖 Día del Libro', 'ar': '📖 اليوم العالمي للكتاب', 'ro': '📖 Ziua Cărții', 'en': '📖 World Book Day', 'fr': '📖 Journée du livre'},
 '06-05': {'es': '🌍 Día del Medio Ambiente', 'ar': '🌍 اليوم العالمي للبيئة', 'ro': '🌍 Ziua Mediului', 'en': '🌍 World Environment Day', 'fr': "🌍 Journée de l'environnement"}}

def tx(key, l, **kw):
    return T[key][l].format(**kw)
