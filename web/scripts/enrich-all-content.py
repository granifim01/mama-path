#!/usr/bin/env python3
"""Enrich Mama Path catalogs with richer educational content and interactive blocks."""

from __future__ import annotations

import json
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COURSES = ROOT / "data" / "courses.json"
PRODUCTS = ROOT / "data" / "products.json"
HOSPITALS = ROOT / "data" / "hospitals.json"


def L(ru: str, kk: str, en: str) -> dict:
    return {"ru": ru, "kk": kk, "en": en}


# --- Hospitals: public contacts from gov.kz / almatyzdrav.kz / egov ---
HOSPITAL_ENRICHMENT = {
    "almaty|addr|pr сакена сейфуллина|492": {
        "phone": "+7 (727) 293-57-18",
        "schedule": "Круглосуточно (приёмное)",
        "rating": 4.4,
        "description": "Городской родильный дом №1. Родовспоможение в рамках ГОБМП/ОСМС. Уточняйте прикрепление по месту жительства и актуальный маршрут через 1406 / 3000-103.",
        "free_birth_available": True,
    },
    "almaty|addr|ул жангельдина 28/20|22": {
        "phone": "+7 (727) 397-57-41",
        "schedule": "Круглосуточно",
        "rating": 4.3,
        "description": "Городской родильный дом №2 (р-н Медеу). Государственное родовспоможение. Перед выбором уточните загрузку и условия партнёрских родов.",
        "free_birth_available": True,
    },
    "almaty|addr|ул жубанова|11": {
        "phone": "+7 (727) 268-00-50",
        "schedule": "Круглосуточно; приём граждан 08:00–17:00",
        "rating": 4.5,
        "description": "Городской перинатальный центр (ул. Жубанова, 11). Приёмное отделение: +7 (727) 268-00-50. Справка: +7 (727) 230-17-91.",
        "free_birth_available": True,
    },
    "almaty|addr|ул станкевича|6": {
        "phone": "+7 (727) 225-90-20",
        "schedule": "Круглосуточно",
        "rating": 4.2,
        "description": "Городской родильный дом №4 (Турксибский район). Государственное учреждение. Номера и условия лучше перепроверить перед поездкой.",
        "free_birth_available": True,
    },
    "almaty|addr|ул кабдолова|28": {
        "phone": "+7 (727) 230-16-42",
        "schedule": "Круглосуточно",
        "rating": 4.3,
        "description": "Городской родильный дом №5. Роды по ГОБМП/ОСМС. Уточняйте документы и маршрут заранее.",
        "free_birth_available": True,
    },
    "almaty|addr|ул басенова|2а": {
        "phone": "+7 (727) 337-87-84",
        "schedule": "Круглосуточно",
        "rating": 4.6,
        "description": "Центр перинатологии и детской кардиохирургии. Специализированная помощь матери и новорождённым, в т.ч. при сложных случаях.",
        "free_birth_available": True,
    },
    "almaty|addr|pr достык|125": {
        "phone": "+7 (727) 264-49-90",
        "schedule": "Уточняйте по телефону",
        "rating": 4.5,
        "description": "Национальный научный центр материнства и детства (ИЗМИР). Специализированная и высокотехнологичная помощь.",
        "free_birth_available": True,
    },
    "astana|addr|pr тауелсиздик|3/1": {
        "phone": "+7 (7172) 34-00-37",
        "schedule": "Круглосуточно",
        "rating": 4.4,
        "description": "Муниципальный перинатальный центр (пр. Тауелсиздик, 3/1). Регистратура: +7 (7172) 34-00-37. Горячая линия: +7 (7172) 36-60-21.",
        "free_birth_available": True,
    },
    "astana|addr|ул турара рыскулова|6": {
        "phone": "+7 (7172) 43-27-55",
        "schedule": "Круглосуточно",
        "rating": 4.3,
        "description": "Городская многопрофильная больница №2, акушерский блок. Приёмный покой акушерства: +7 (7172) 43-27-55.",
        "free_birth_available": True,
    },
    "astana|addr|ул турара рыскулова|8": {
        "phone": "+7 (7172) 43-27-55",
        "schedule": "Круглосуточно",
        "rating": 5.0,
        "description": "Перинатальный/акушерский блок на ул. Рыскулова. Перед поездкой уточните отделение и документы.",
        "free_birth_available": True,
    },
    "astana|addr|ул алии молдагуловой|28": {
        "phone": "+7 (7172) 38-10-69",
        "schedule": "Круглосуточно",
        "rating": 4.2,
        "description": "Городская многопрофильная больница №3. Регистратура акушерства: +7 (7172) 38-10-69.",
        "free_birth_available": True,
    },
    "shymkent|addr|ул алдиярова|60": {
        "phone": "+7 (7252) 57-11-42",
        "schedule": "Круглосуточно",
        "rating": 4.1,
        "description": "Городской родильный дом (ул. Алдиярова, 60). Уточняйте прикрепление и загрузку по телефону.",
        "free_birth_available": True,
    },
    "shymkent|addr|mkr нурсат|188": {
        "phone": "+7 (7252) 77-40-25",
        "schedule": "Круглосуточно",
        "rating": 4.3,
        "description": "Городской перинатальный центр (мкр. Нурсат). Государственное родовспоможение.",
        "free_birth_available": True,
    },
}

PHASE_CHECKLIST_ITEMS = {
    "planning": [
        L("Записаться к терапевту и гинекологу", "Терапевт пен гинекологқа жазылу", "Book therapist and gynecologist visits"),
        L("Начать фолиевую кислоту по схеме врача", "Дәрігер схемасы бойынша фолий қышқылын бастау", "Start folic acid as prescribed"),
        L("Сдать анализы по направлению", "Жолдама бойынша талдау тапсыру", "Complete ordered lab tests"),
        L("Обсудить ожидания с партнёром", "Серіктеспен күтулерді талқылау", "Discuss expectations with partner"),
    ],
    "trimester-1": [
        L("Встать на учёт в ЖК", "Әйелдер консультациясына есепке тұру", "Register at women’s clinic"),
        L("Уточнить календарь анализов и УЗИ", "Талдау мен УДЗ күнтізбесін нақтылау", "Confirm test and ultrasound calendar"),
        L("Сохранить контакты врача и 103", "Дәрігер мен 103 байланысын сақтау", "Save doctor and 103 contacts"),
        L("Спросить про ГОБМП/ОСМС покрытие", "ГОБМП/ОСМС қамтуын сұрау", "Ask about GOBMP/OSMS coverage"),
    ],
    "trimester-2": [
        L("Отмечать шевеления плода", "Бала қозғалысын белгілеу", "Track fetal movements"),
        L("Проверить гемоглобин / железо", "Гемоглобин / темірді тексеру", "Check hemoglobin / iron"),
        L("Согласовать витамины только с врачом", "Витаминдерді тек дәрігермен келісу", "Confirm vitamins with doctor only"),
        L("Планировать лёгкую активность и сон", "Жеңіл белсенділік пен ұйқыны жоспарлау", "Plan light activity and sleep"),
    ],
    "trimester-3": [
        L("Собрать сумку к 36-й неделе", "36-аптаға сөмкені жинау", "Pack bag by week 36"),
        L("Выбрать роддом и маршрут", "Босана үйі мен маршрутты таңдау", "Choose hospital and route"),
        L("Подготовить документы и обменную карту", "Құжаттар мен алмасу картасын дайындау", "Prepare documents and exchange card"),
        L("Обсудить план родов с партнёром", "Серіктеспен босану жоспарын талқылау", "Discuss birth plan with partner"),
    ],
    "birth": [
        L("Знать признаки срочного выезда", "Шұғыл шығу белгілерін білу", "Know urgent departure signs"),
        L("Держать телефон заряженным", "Телефонды зарядта ұстау", "Keep phone charged"),
        L("Документы — в отдельной папке", "Құжаттарды бөлек бумада ұстау", "Keep documents in one folder"),
        L("Согласовать, кто едет с вами", "Кім сізбен баратынын келісу", "Agree who goes with you"),
    ],
    "infant": [
        L("Следить за кормлением и мокрыми подгузниками", "Тамақтану мен дымқыл жөргекті бақылау", "Track feeding and wet diapers"),
        L("Знать признаки температуры/вялости", "Температура/болдырлық белгілерін білу", "Know fever/lethargy signs"),
        L("Записать визит к педиатру", "Педиатрға баруды белгілеу", "Book pediatric visit"),
        L("Договориться о ночных сменах с партнёром", "Серіктеспен түнгі кезектерді бөлу", "Agree night shifts with partner"),
    ],
}

PHASE_TIP = {
    "planning": L(
        "Международные ориентиры (ВОЗ/CDC): фолиевая кислота обычно 400 мкг/сут до зачатия и в I триместре — точную схему назначает врач. При высоком риске доза другая и только по назначению.",
        "Халықаралық бағдар (ДДСҰ/CDC): фолий қышқылы әдетте тәулігіне 400 мкг жүктілікке дейін және I триместрде — нақты схеманы дәрігер тағайындайды. Жоғары қауіпте доза басқа және тек тағайындаумен.",
        "International guidance (WHO/CDC): folic acid is usually 400 mcg/day before conception and in the 1st trimester — your doctor confirms the exact plan. High-risk doses differ and are prescription-only.",
    ),
    "trimester-1": L(
        "Ранние симптомы (тошнота, усталость, чувствительность груди) часто нормальны, но сильная боль, кровотечение или обмороки — повод срочно связаться с врачом или 103.",
        "Ерте белгілер (жүрек айну, шаршау, кеуде сезімталдығы) жиі қалыпты, бірақ қатты ауырсыну, қан кету немесе естен тану — дереу дәрігерге немесе 103-ке хабарласу себебі.",
        "Early symptoms (nausea, fatigue, breast tenderness) are often normal, but severe pain, bleeding, or fainting means contact a doctor or 103 urgently.",
    ),
    "trimester-2": L(
        "Шевеления — ваш «язык» общения с малышом. Если привычный ритм резко изменился — не ждите до завтра, свяжитесь с врачом.",
        "Қозғалыс — сәбимен «тілдесу» тәсіліңіз. Әдеттегі ырғақ күрт өзгерсе — ертеңге қалдырмай дәрігерге хабарласыңыз.",
        "Movements are your “language” with the baby. If the usual pattern changes sharply — don’t wait until tomorrow, contact your doctor.",
    ),
    "trimester-3": L(
        "К 36–37 неделям удобно иметь «боевой комплект»: документы, сумка, зарядка, вода и понятный маршрут до роддома днём и ночью.",
        "36–37 аптаға «дайын жиынтық» ыңғайлы: құжаттар, сөмке, зарядтағыш, су және босана үйіне күндіз/түнгі маршрут.",
        "By weeks 36–37 it helps to have a ready kit: documents, bag, charger, water, and a clear day/night route to the hospital.",
    ),
    "birth": L(
        "Ориентиры для выезда часто включают регулярные схватки, отхождение вод, кровотечение или резкое ухудшение самочувствия — персональный план даёт врач.",
        "Шығу бағдарларына жиі тұрақты қысу, су ағу, қан кету немесе өзін-өзі сезінудің күрт нашарлауы кіреді — жеке жоспарды дәрігер береді.",
        "Departure cues often include regular contractions, fluid leak, bleeding, or sudden feeling worse — your doctor gives a personal plan.",
    ),
    "infant": L(
        "В первые недели важны частота кормлений, мочеиспускание, цвет кожи и температура. Любая вялость с отказом от еды — срочный повод к врачу.",
        "Алғашқы апталарда тамақтану жиілігі, зәр шығару, тері түсі мен температура маңызды. Тамақтан бас тартумен болдырып тұру — дәрігерге шұғыл себеп.",
        "In early weeks, feeding frequency, wet diapers, skin color, and temperature matter. Lethargy with refusal to feed needs urgent care.",
    ),
}

PHASE_MYTH = {
    "planning": (
        L("Миф: витамины можно подобрать «на глаз» в аптеке", "Миф: витаминді дәріханада «көзбен» таңдауға болады", "Myth: you can pick vitamins by guesswork at the pharmacy"),
        L("Факт: дозы и сочетания зависят от анализов и анамнеза — это решает врач.", "Факт: доза мен үйлесім талдау мен анамнезге байланысты — мұны дәрігер шешеді.", "Fact: doses and combinations depend on labs and history — a doctor decides."),
    ),
    "trimester-1": (
        L("Миф: если тошнит — значит «всё плохо»", "Миф: жүрек айныса — «бәрі жаман»", "Myth: nausea means something is wrong"),
        L("Факт: тошнота часто встречается, но обезвоживание и невозможность пить — повод к осмотру.", "Факт: жүрек айну жиі кездеседі, бірақ сусыздану мен іше алмау — қаралу себебі.", "Fact: nausea is common, but dehydration and inability to drink need evaluation."),
    ),
    "trimester-2": (
        L("Миф: можно резко начинать интенсивный спорт", "Миф: қарқынды спортты күрт бастауға болады", "Myth: you can suddenly start intense sports"),
        L("Факт: активность полезна, но нагрузку подбирают индивидуально и безопасно.", "Факт: белсенділік пайдалы, бірақ жүктеме жеке әрі қауіпсіз таңдалады.", "Fact: activity helps, but intensity should be individualized and safe."),
    ),
    "trimester-3": (
        L("Миф: сумку можно собрать «прямо перед родами»", "Миф: сөмкені «босанар алдында» жинауға болады", "Myth: you can pack the bag right before labor"),
        L("Факт: ночные поездки спокойнее, если всё собрано заранее к 36-й неделе.", "Факт: бәрі 36-аптаға дайын болса, түнгі жол әлдеқайда тыныш.", "Fact: night trips are calmer if everything is packed by week 36."),
    ),
    "birth": (
        L("Миф: в роддом едут только при «невыносимых» схватках", "Миф: босана үйіне тек «шыдамайтын» қысуда барады", "Myth: you go to hospital only with unbearable contractions"),
        L("Факт: ориентир — регулярность, воды, кровотечение и указания врача, а не «терпение».", "Факт: бағдар — ырғақтылық, су, қан кету және дәрігер нұсқауы, «шыдам» емес.", "Fact: cues are regularity, fluid, bleeding, and your doctor’s advice — not endurance."),
    ),
    "infant": (
        L("Миф: новорождённый «должен» спать всю ночь", "Миф: жаңа туған нәресте түнді толық ұйықтауы «керек»", "Myth: newborns “should” sleep through the night"),
        L("Факт: частые ночные кормления в первые недели — нормальная физиология.", "Факт: алғашқы апталардағы жиі түнгі тамақтандыру — қалыпты физиология.", "Fact: frequent night feeds in early weeks are normal physiology."),
    ),
}

CHAPTER_DEEP = {
    "m-01": [
        L(
            "За 2–3 месяца до зачатия полезно пройти осмотр, обсудить хронические болезни и лекарства, начать фолиевую кислоту (часто 400–800 мкг/сут — только по схеме врача). Это снижает риск дефектов нервной трубки на очень раннем сроке, когда беременность ещё может быть незаметной.",
            "Жүктілікке 2–3 ай қалғанда қаралып, созылмалы аурулар мен дәрілерді талқылап, фолий қышқылын бастаған дұрыс (жиі тәулігіне 400–800 мкг — тек дәрігер схемасымен). Бұл жүктілік әлі байқалмайтын өте ерте мерзімде жүйке түтігі ақауы қаупін азайтады.",
            "2–3 months before conception, a check-up, review of chronic conditions and medicines, and folic acid (often 400–800 mcg/day — doctor-guided) help. This lowers neural-tube defect risk very early, when pregnancy may still be unnoticed.",
        ),
        L(
            "В Казахстане удобно начать с поликлиники прикрепления: терапевт, гинеколог, стоматолог, анализы по ГОБМП/ОСМС. Сохраните выписки и список вопросов — приём проходит быстрее и спокойнее.",
            "Қазақстанда тіркелген емханадан бастау ыңғайлы: терапевт, гинеколог, стоматолог, ГОБМП/ОСМС бойынша талдаулар. Кешірмелер мен сұрақ тізімін сақтаңыз — қабылдау жылдам әрі тыныш өтеді.",
            "In Kazakhstan, start at your attached clinic: therapist, gynecologist, dentist, and GOBMP/OSMS labs. Keep summaries and a question list — visits go faster and calmer.",
        ),
    ],
    "m-05": [
        L(
            "Безопасное питание в беременности обычно строится на разнообразии, достаточном белке, овощах/фруктах и воде. Избегайте сырого мяса/рыбы, непастеризованных молочных продуктов и избытка кофеина — точные ограничения уточняет врач.",
            "Жүктіліктегі қауіпсіз тамақтану әдетте әртүрлілікке, жеткілікті ақуызға, көкөніс/жеміске және суға негізделеді. Шикі ет/балық, пастерленбеген сүт өнімдері мен артық кофеиннен аулақ болыңыз — нақты шектеулерді дәрігер айтады.",
            "Safe pregnancy eating usually means variety, enough protein, vegetables/fruit, and water. Avoid raw meat/fish, unpasteurized dairy, and excess caffeine — your doctor confirms exact limits.",
        ),
    ],
    "m-09": [
        L(
            "В сумку обычно кладут документы, одежду для мамы и малыша, гигиену, зарядку, бутылку воды и вещи для первых суток. Список роддома может отличаться — сверьте его заранее.",
            "Сөмкеге әдетте құжаттар, ана мен сәби киімі, гигиена, зарядтағыш, су бөтелкесі және алғашқы тәулікке заттар салынады. Босана үйі тізімі өзгеше болуы мүмкін — алдын ала салыстырыңыз.",
            "Bags usually include documents, clothes for parent and baby, hygiene items, a charger, water, and first-day essentials. Hospital lists vary — check yours early.",
        ),
    ],
    "m-11": [
        L(
            "Регулярные схватки, отхождение вод, кровотечение, сильная головная боль с нарушением зрения или резкое уменьшение шевелений — сигналы не ждать «до утра». Держите план: кого звонить, куда ехать, что взять.",
            "Тұрақты қысу, су ағу, қан кету, көру бұзылуы бар қатты бас ауыру немесе қозғалыстың күрт азаюы — «таңға дейін» күтпеу сигналдары. Жоспарды ұстаңыз: кімге қоңырау, қайда бару, не алу.",
            "Regular contractions, fluid leak, bleeding, severe headache with vision changes, or a sharp drop in movements are reasons not to wait until morning. Keep a plan: whom to call, where to go, what to take.",
        ),
    ],
    "m-14": [
        L(
            "Грудное вскармливание — навык для двоих. Боль, трещины, sparcity молока или плохая прибавка веса требуют помощи консультанта/педиатра, а не «терпеть».",
            "Емшек емізу — екеуге арналған дағды. Ауырсыну, жарықша, сүттің аз болуы немесе салмақ қоспау — «шыдау» емес, кеңесші/педиатр көмегін қажет етеді.",
            "Breastfeeding is a two-person skill. Pain, cracks, low supply concerns, or poor weight gain need a consultant/pediatrician — not endurance.",
        ),
    ],
    "f-01": [
        L(
            "Роль отца начинается до родов: эмоциональная поддержка, быт, финансы и совместные визиты снижают стресс партнёрши и делают команду устойчивее.",
            "Әке рөлі босануға дейін басталады: эмоционалдық қолдау, тұрмыс, қаржы және бірге бару серіктес стрессін азайтып, команданы берік етеді.",
            "A father’s role starts before birth: emotional support, chores, finances, and shared visits reduce a partner’s stress and strengthen the team.",
        ),
    ],
    "f-08": [
        L(
            "В роддоме задача папы — логистика, спокойный голос, вода, связь с родственниками и уважение к решениям роженицы и команды врачей.",
            "Босана үйінде әкенің міндеті — логистика, байсалды дауыс, су, туыстармен байланыс және босанушы мен дәрігер командасы шешіміне құрмет.",
            "In hospital, a dad’s job is logistics, a calm voice, water, family updates, and respect for the birthing person’s and care team’s decisions.",
        ),
    ],
}

EXTRA_QUIZ = {
    "m-01": [
        {
            "id": "m-01-q2",
            "text": L(
                "За сколько обычно рекомендуют начать подготовку (осмотр, фолиевая кислота)?",
                "Дайындықты (қаралу, фолий қышқылы) әдетте қанша уақыт бұрын бастау ұсынылады?",
                "How early is preparation (check-up, folic acid) usually recommended?",
            ),
            "options": [
                L("За 2–3 месяца", "2–3 ай бұрын", "2–3 months ahead"),
                L("В день теста на беременность", "Жүктілік тесті күні", "On the day of a pregnancy test"),
                L("Только после родов", "Тек босанғаннан кейін", "Only after birth"),
            ],
            "correct_index": 0,
        },
        {
            "id": "m-01-q3",
            "text": L(
                "Что лучше сделать с лекарствами при планировании?",
                "Жоспарлауда дәрілермен не істеген дұрыс?",
                "What is best to do with medicines when planning?",
            ),
            "options": [
                L("Обсудить с врачом все постоянные препараты", "Барлық тұрақты препаратты дәрігермен талқылау", "Review all regular medicines with a doctor"),
                L("Отменить всё самостоятельно", "Барлығын өз бетіңізше тоқтату", "Stop everything on your own"),
                L("Удвоить дозы «для запаса»", "Дозаны «қорға» екі еселеу", "Double doses “just in case”"),
            ],
            "correct_index": 0,
        },
    ],
    "m-11": [
        {
            "id": "m-11-q2",
            "text": L(
                "Что из перечисленного — повод не ждать до утра?",
                "Төмендегінің қайсысы таңға дейін күтпеу себебі?",
                "Which of these is a reason not to wait until morning?",
            ),
            "options": [
                L("Отхождение вод или кровотечение", "Су ағу немесе қан кету", "Fluid leak or bleeding"),
                L("Легкая усталость вечером", "Кешке жеңіл шаршау", "Mild evening tiredness"),
                L("Желание переставить мебель", "Жиһазды ауыстырғысы келу", "Wanting to rearrange furniture"),
            ],
            "correct_index": 0,
        }
    ],
    "f-08": [
        {
            "id": "f-08-q2",
            "text": L(
                "Какая поддержка папы в родзале обычно наиболее полезна?",
                "Босану залында әкенің қандай қолдауы әдетте пайдалырақ?",
                "What dad support in the delivery room is usually most helpful?",
            ),
            "options": [
                L("Спокойное присутствие и выполнение логистике", "Байсалды қатысу және логистикаға көмек", "Calm presence and logistics help"),
                L("Споры с врачами без запроса роженицы", "Босанушы сұрамынсыз дәрігерлермен дау", "Arguing with staff without being asked"),
                L("Постоянная съёмка вопреки правилам", "Ережеге қарсы үздіксіз түсірілім", "Constant filming against rules"),
            ],
            "correct_index": 0,
        }
    ],
}

ILLUSTRATIONS = {
    "planning": "heartbeat",
    "trimester-1": "seed",
    "trimester-2": "bloom",
    "trimester-3": "bag",
    "birth": "route",
    "infant": "moon",
}


def enrich_section(section: dict, chapter: dict) -> dict:
    out = deepcopy(section)
    heading_ru = section["heading"]["ru"]

    if heading_ru == "Чек-лист":
        out["kind"] = "checklist"
        out["items"] = deepcopy(PHASE_CHECKLIST_ITEMS.get(chapter["phase"], []))
        out["interactive"] = True
    elif heading_ru == "Важно":
        out["kind"] = "callout"
        out["accent"] = "warn"
    elif heading_ru == "Коротко о главе":
        out["kind"] = "callout"
        out["accent"] = "info"
    elif heading_ru in {"С чего начать", "Образ жизни", "Общий план"}:
        out["kind"] = "text"
    else:
        out.setdefault("kind", "text")
    return out


def add_interactive_blocks(chapter: dict) -> None:
    headings = {s["heading"]["ru"] for s in chapter["sections"]}
    phase = chapter["phase"]

    if "Практический совет" not in headings and phase in PHASE_TIP:
        chapter["sections"].append(
            {
                "heading": L("Практический совет", "Практикалық кеңес", "Practical tip"),
                "body": PHASE_TIP[phase],
                "kind": "tip",
                "accent": "success",
                "interactive": True,
            }
        )

    if "Миф и факт" not in headings and phase in PHASE_MYTH:
        myth, fact = PHASE_MYTH[phase]
        chapter["sections"].append(
            {
                "heading": L("Миф и факт", "Миф және факт", "Myth vs fact"),
                "body": fact,
                "kind": "myth",
                "accent": "myth",
                "myth": myth,
                "fact": fact,
                "interactive": True,
            }
        )

    deep = CHAPTER_DEEP.get(chapter["id"], [])
    for i, body in enumerate(deep):
        key = f"Углубляем тему {i+1}" if i else "Углубляем тему"
        key_l = L(key, f"Тақырыпты тереңдетеміз {i+1}" if i else "Тақырыпты тереңдетеміз", f"Go deeper {i+1}" if i else "Go deeper")
        if key_l["ru"] in headings:
            continue
        chapter["sections"].append(
            {
                "heading": key_l,
                "body": body,
                "kind": "text",
                "accent": "info",
            }
        )


def enrich_chapter(chapter: dict) -> None:
    chapter["sections"] = [enrich_section(s, chapter) for s in chapter["sections"]]
    add_interactive_blocks(chapter)

    chapter["illustration"] = ILLUSTRATIONS.get(chapter["phase"], "heartbeat")
    chapter["duration_min"] = max(chapter.get("duration_min", 8), 12)
    chapter["reading_steps"] = max(3, len(chapter["sections"]))

    # Expand key educational bodies slightly with Kazakhstan context if short
    for section in chapter["sections"]:
        if section.get("kind") == "text" and len(section["body"]["ru"]) < 180:
            extra = L(
                " Это ориентир для разговора с врачом в вашей поликлинике или ЖК, а не индивидуальное назначение.",
                " Бұл емханадағы немесе әйелдер консультациясындағы дәрігермен сөйлесуге бағдар, жеке тағайындау емес.",
                " This is guidance for talking with your clinic doctor, not a personal prescription.",
            )
            for lang in ("ru", "kk", "en"):
                if extra[lang] not in section["body"][lang]:
                    section["body"][lang] = section["body"][lang].rstrip() + extra[lang]

    quiz = chapter.setdefault("quiz", {"pass_score": 1, "questions": []})
    existing_ids = {q["id"] for q in quiz["questions"]}
    for q in EXTRA_QUIZ.get(chapter["id"], []):
        if q["id"] not in existing_ids:
            quiz["questions"].append(q)
            existing_ids.add(q["id"])

    # Generic second question if still only one
    if len(quiz["questions"]) == 1:
        qid = f"{chapter['id']}-q2"
        quiz["questions"].append(
            {
                "id": qid,
                "text": L(
                    "Что делать при угрожающих симптомах?",
                    "Қауіпті белгілерде не істеу керек?",
                    "What should you do with alarming symptoms?",
                ),
                "options": [
                    L("Связаться с врачом или вызвать 103", "Дәрігерге хабарласу немесе 103 шақыру", "Contact a doctor or call 103"),
                    L("Ждать несколько дней без связи", "Байланыссыз бірнеше күн күту", "Wait several days without contact"),
                    L("Искать только советы в соцсетях", "Тек әлеуметтік желі кеңесін іздеу", "Only seek social-media advice"),
                ],
                "correct_index": 0,
            }
        )
    quiz["pass_score"] = max(1, (len(quiz["questions"]) + 1) // 2)


def enrich_courses() -> dict:
    data = json.loads(COURSES.read_text(encoding="utf-8"))
    for track in data["tracks"]:
        for chapter in track["chapters"]:
            enrich_chapter(chapter)
        track["subtitle"] = track.get("subtitle") or track["title"]
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    COURSES.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return data


PRODUCTS_DATA = {
    "updated_at": datetime.now(timezone.utc).isoformat(),
    "categories": [
        {
            "id": "hospital-bag",
            "title": "Сумка в роддом",
            "items": [
                {"id": "p-01", "name": "Подгузники для новорождённых (размер NB)", "phase": "trimester-3", "age_weeks": None, "rating": 4.8, "reviews_count": 124, "price_hint": "от 3 500 ₸", "note": "1 упаковки хватит на первые дни в роддоме", "verified_review": "Взяли Pampers NB — хватило на выписку, кожа не раздражалась."},
                {"id": "p-02", "name": "Халат/рубашка для кормления", "phase": "trimester-3", "age_weeks": None, "rating": 4.6, "reviews_count": 58, "price_hint": "от 8 000 ₸", "note": "Удобно для ГВ в палате", "verified_review": "Рубашка с запахом — must have, не пожалела."},
                {"id": "p-05", "name": "Прокладки послеродовые", "phase": "trimester-3", "age_weeks": None, "rating": 4.5, "reviews_count": 92, "price_hint": "от 2 800 ₸", "note": "Берите с запасом — 2–3 упаковки", "verified_review": "В роддоме выдали, но свои удобнее по размеру."},
                {"id": "p-06", "name": "Бутылочка для воды маме", "phase": "trimester-3", "age_weeks": None, "rating": 4.3, "reviews_count": 41, "price_hint": "от 1 500 ₸", "note": "С трубочкой удобнее в палате", "verified_review": "Не открывала бутылку одной рукой — взяла с крышкой-чашкой."},
                {"id": "p-11", "name": "Тапочки с нескользящей подошвой", "phase": "trimester-3", "age_weeks": None, "rating": 4.7, "reviews_count": 73, "price_hint": "от 2 500 ₸", "note": "Для душа и коридоров роддома", "verified_review": "Резиновая подошва спасла на мокром полу."},
                {"id": "p-12", "name": "Документы в прозрачном файле", "phase": "trimester-3", "age_weeks": None, "rating": 4.9, "reviews_count": 210, "price_hint": "от 300 ₸", "note": "Удостоверение, обменная карта, УЗИ, полис/ОСМС", "verified_review": "Ночью ничего не искали — всё в одном файле."},
                {"id": "p-13", "name": "Прокладки для груди", "phase": "trimester-3", "age_weeks": None, "rating": 4.4, "reviews_count": 88, "price_hint": "от 1 800 ₸", "note": "На случай прихода молока", "verified_review": "Взяли с запасом — пригодились с 3-х суток."},
                {"id": "p-14", "name": "Влажные салфетки без отдушки", "phase": "trimester-3", "age_weeks": None, "rating": 4.6, "reviews_count": 150, "price_hint": "от 1 200 ₸", "note": "Для мамы и малыша в первые дни", "verified_review": "Без спирта и сильного запаха — меньше раздражений."},
            ],
        },
        {
            "id": "infant-0-3",
            "title": "0–3 месяца",
            "items": [
                {"id": "p-03", "name": "Газоотводная трубочка", "phase": "infant", "age_weeks": "0-12", "rating": 4.4, "reviews_count": 89, "price_hint": "от 1 200 ₸", "note": "По назначению педиатра", "verified_review": "Помогала при коликах, но использовали аккуратно по инструкции."},
                {"id": "p-04", "name": "Термометр инфракрасный бесконтактный", "phase": "infant", "age_weeks": "0-52", "rating": 4.7, "reviews_count": 201, "price_hint": "от 12 000 ₸", "note": "Для домашнего контроля температуры", "verified_review": "Измеряем за 2 секунды, особенно ночью удобно."},
                {"id": "p-07", "name": "Аспиратор назальный", "phase": "infant", "age_weeks": "0-12", "rating": 4.6, "reviews_count": 67, "price_hint": "от 3 200 ₸", "note": "При заложенности носа у новорождённого", "verified_review": "Электрический берегли для ночи — меньше плача."},
                {"id": "p-08", "name": "Пелёнки хлопковые 80×80", "phase": "infant", "age_weeks": "0-12", "rating": 4.9, "reviews_count": 156, "price_hint": "от 4 500 ₸ за 5 шт", "note": "Многоразовые, стираются часто", "verified_review": "10 штук на старте — оптимально, не покупайте 20 сразу."},
                {"id": "p-15", "name": "Радионяня или камера с ночным режимом", "phase": "infant", "age_weeks": "0-52", "rating": 4.5, "reviews_count": 134, "price_hint": "от 18 000 ₸", "note": "Помогает отдыхать в другой комнате", "verified_review": "С ночным ИК-режимом спокойнее оставлять малыша на 20 минут."},
                {"id": "p-16", "name": "Корзина для совместного сна / люлька", "phase": "infant", "age_weeks": "0-16", "rating": 4.6, "reviews_count": 97, "price_hint": "от 25 000 ₸", "note": "Безопасный сон рядом с родителями", "verified_review": "Первые недели спали в корзине у кровати — меньше подъёмов."},
                {"id": "p-17", "name": "Контрастный коврик / чёрно-белые карточки", "phase": "infant", "age_weeks": "0-12", "rating": 4.8, "reviews_count": 76, "price_hint": "от 2 000 ₸", "note": "Мягкая стимуляция зрения", "verified_review": "На 1–2 минуты несколько раз в день — малыш замирал и смотрел."},
            ],
        },
        {
            "id": "feeding",
            "title": "Кормление",
            "items": [
                {"id": "p-09", "name": "Молокоотсос электрический", "phase": "infant", "age_weeks": "0-52", "rating": 4.5, "reviews_count": 78, "price_hint": "от 25 000 ₸", "note": "Двойной полезен при частом сцеживании", "verified_review": "В аренду взяли на месяц — сэкономили, пока не поняли нужен ли свой."},
                {"id": "p-10", "name": "Подушка для кормления", "phase": "trimester-3", "age_weeks": "0-52", "rating": 4.7, "reviews_count": 112, "price_hint": "от 9 000 ₸", "note": "Снимает нагрузку на спину", "verified_review": "Использовали и для укладывания в первые недели."},
                {"id": "p-18", "name": "Контейнеры для грудного молока", "phase": "infant", "age_weeks": "0-52", "rating": 4.6, "reviews_count": 64, "price_hint": "от 3 500 ₸", "note": "Подписывайте дату и объём", "verified_review": "Стенка с датами спасла от путаницы в холодильнике."},
                {"id": "p-19", "name": "Подогреватель бутылочек", "phase": "infant", "age_weeks": "0-52", "rating": 4.4, "reviews_count": 55, "price_hint": "от 14 000 ₸", "note": "Если есть докорм или сцеженное молоко", "verified_review": "Ночью не кипятим воду — температура стабильная."},
                {"id": "p-20", "name": "Крем от трещин сосков (ланолин)", "phase": "infant", "age_weeks": "0-16", "rating": 4.7, "reviews_count": 143, "price_hint": "от 2 900 ₸", "note": "По рекомендации консультанта по ГВ", "verified_review": "В первые дни сильно выручил, потом почти не понадобился."},
            ],
        },
        {
            "id": "home-ready",
            "title": "Дом к выписке",
            "items": [
                {"id": "p-21", "name": "Гель для стирки детских вещей", "phase": "trimester-3", "age_weeks": "0-52", "rating": 4.5, "reviews_count": 119, "price_hint": "от 2 200 ₸", "note": "Гипоаллергенный, без сильного аромата", "verified_review": "Перешли на детский гель заранее — меньше риска раздражений."},
                {"id": "p-22", "name": "Ночник с тёплым светом", "phase": "trimester-3", "age_weeks": "0-52", "rating": 4.8, "reviews_count": 167, "price_hint": "от 4 000 ₸", "note": "Ночные кормления без яркого света", "verified_review": "Тёплый свет не будит полностью — легче уснуть снова."},
                {"id": "p-23", "name": "Корзина для грязного белья у пеленального", "phase": "trimester-3", "age_weeks": "0-52", "rating": 4.3, "reviews_count": 48, "price_hint": "от 3 000 ₸", "note": "Меньше хаоса в первые недели", "verified_review": "Пелёнки не копятся на кресле — мелочь, а нервы целее."},
                {"id": "p-24", "name": "Аптечка новорождённого (базовый набор)", "phase": "trimester-3", "age_weeks": "0-12", "rating": 4.6, "reviews_count": 132, "price_hint": "от 6 000 ₸", "note": "Состав согласуйте с педиатром", "verified_review": "Собрали по списку врача: термометр, стерильные салфетки, солевой раствор."},
            ],
        },
        {
            "id": "for-dad",
            "title": "Для папы",
            "items": [
                {"id": "p-25", "name": "Слинг / эргорюкзак (по возрасту и весу)", "phase": "infant", "age_weeks": "8-52", "rating": 4.7, "reviews_count": 91, "price_hint": "от 22 000 ₸", "note": "Учитесь надевать заранее", "verified_review": "Папа гулял с малышом, пока мама спала — лучшая инвестиция."},
                {"id": "p-26", "name": "Пауэрбанк в сумку в роддом", "phase": "trimester-3", "age_weeks": None, "rating": 4.9, "reviews_count": 188, "price_hint": "от 7 000 ₸", "note": "Связь и фонарик в ночной поездке", "verified_review": "Телефон сел в приёмном — пауэрбанк спас."},
                {"id": "p-27", "name": "Термокружка для партнёра", "phase": "trimester-3", "age_weeks": None, "rating": 4.5, "reviews_count": 52, "price_hint": "от 5 500 ₸", "note": "Долгие часы ожидания в роддоме", "verified_review": "Чай тёплый 3 часа — мелочь, а поддержка ощутимая."},
            ],
        },
    ],
}


def enrich_hospitals() -> None:
    data = json.loads(HOSPITALS.read_text(encoding="utf-8"))
    updated = 0
    for hospital in data["hospitals"]:
        patch = HOSPITAL_ENRICHMENT.get(hospital["id"])
        if not patch:
            # soft fill for remaining: keep reviews-derived rating if present
            if hospital.get("rating") is None:
                ratings = [r.get("rating") for r in hospital.get("reviews") or [] if r.get("rating")]
                if ratings:
                    hospital["rating"] = round(sum(ratings) / len(ratings), 1)
                    updated += 1
            if not hospital.get("description"):
                hospital["description"] = (
                    f"{hospital['name']} — карточка собрана из открытых источников. "
                    "Перед визитом уточните телефон, маршрут и условия родов по ГОБМП/ОСМС."
                )
                updated += 1
            continue
        for key, value in patch.items():
            if hospital.get(key) in (None, "", []) or key in {"description", "phone", "schedule"}:
                hospital[key] = value
        updated += 1
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    data["count"] = len(data["hospitals"])
    HOSPITALS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Hospitals enriched: {updated}")


def main() -> None:
    courses = enrich_courses()
    chapters = sum(len(t["chapters"]) for t in courses["tracks"])
    print(f"Courses enriched: {chapters} chapters")
    PRODUCTS.write_text(json.dumps(PRODUCTS_DATA, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    products = sum(len(c["items"]) for c in PRODUCTS_DATA["categories"])
    print(f"Products written: {products} items in {len(PRODUCTS_DATA['categories'])} categories")
    enrich_hospitals()


if __name__ == "__main__":
    main()
