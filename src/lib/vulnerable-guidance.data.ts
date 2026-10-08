import type { VulnerablePopulationGuidance } from "./triage";

export const VECTOR_URGENCY_MAP: Record<string, "critical" | "urgent" | "non_urgent"> = {
  pit_viper: "critical",
  coral_snake: "critical",
  scorpion: "critical",
  black_widow: "urgent",
  brown_recluse: "urgent",
  giant_centipede: "urgent",
  asp_caterpillar: "urgent",
  jellyfish: "urgent",
  stingray: "urgent",
  blacklegged_tick: "urgent",
  dog_tick: "urgent",
  brown_dog_tick: "urgent",
  lone_star_tick: "urgent",
  soft_tick: "urgent",
  kissing_bug: "urgent",
  scabies: "non_urgent",
  honey_bee: "non_urgent",
  wasp: "non_urgent",
  fire_ant: "non_urgent",
  velvet_ant: "non_urgent",
  wheel_bug: "non_urgent",
  blister_beetle: "non_urgent",
  mosquito: "non_urgent",
  no_see_um: "non_urgent",
  horse_fly: "non_urgent",
  black_fly: "non_urgent",
  flea: "non_urgent",
  bed_bug: "non_urgent",
  chigger: "non_urgent",
  lice: "non_urgent",
  yellow_sac_spider: "non_urgent",
  minute_pirate_bug: "non_urgent",
  wolf_spider: "non_urgent",
  brown_widow: "urgent",
  gulf_coast_tick: "urgent",
  wood_tick: "urgent",
  saddleback_caterpillar: "urgent",
  bird_rodent_mite: "non_urgent",
  pacific_coast_tick: "urgent",
};

export const VULNERABLE_GUIDANCE_MAP: Record<string, VulnerablePopulationGuidance> = {
  pit_viper: {
    pediatric: {
      cautions: [
        "A child's small body weight creates a 5x–10x higher venom-to-mass concentration than in adults.",
        "Rapid onset of systemic coagulopathy, severe hypotension, and compartment syndrome.",
        "Initial antivenom (CroFab / Anavip) is NEVER weight-reduced; children receive the full adult starting dose (10 vials) because antivenom neutralizes a fixed mass of circulating venom molecules.",
      ],
      blackBoxWarning:
        "DO NOT use tourniquets, ice packs, incisions, or suction devices. These cause devastating localized tissue necrosis and limb ischemia in pediatric limbs.",
      weightBasedAdvice:
        "Do not reduce initial antivenom vials. Administer 10 vials CroFab IV in pediatric intensive care.",
      erCriteria: [
        "Any venomous snake encounter in a child requires immediate 911 activation and ambulance dispatch.",
        "Rapid swelling extending past a major joint within 1 hour.",
        "Spontaneous bleeding from gums, venipuncture sites, or hematuria.",
      ],
    },
    pregnancy: {
      cautions: [
        "Pit viper envenomation carries severe risk of maternal-fetal hemorrhage, placental abruption, and fetal demise.",
        "Requires immediate emergency antivenom infusion; antivenom is safe in pregnancy and protects fetal oxygenation.",
      ],
      contraindications: [
        "Delaying antivenom due to pregnancy concerns is contraindicated; maternal resuscitation protects the fetus.",
      ],
      safeAlternatives:
        "Antivenom (CroFab/Anavip) is the definitive life-saving therapy for both mother and fetus.",
      fetalRisks:
        "Maternal shock and venom metalloproteinases cause placental hypoperfusion, abruption, and fetal death.",
    },
    geriatric: {
      cautions: [
        "Severe accelerated tissue necrosis, acute kidney injury, and exacerbation of pre-existing cardiovascular disease.",
        "High risk of life-threatening hemorrhage if taking anticoagulants (e.g. Apixaban, Warfarin) or antiplatelets.",
      ],
      atypicalPresentation:
        "May exhibit blunted pain sensation or altered mental status rather than localized agitation.",
      sepsisWarningSigns: ["Systolic blood pressure < 100 mmHg, confusion, or hypothermia."],
    },
  },

  coral_snake: {
    pediatric: {
      cautions: [
        "Venom contains potent postsynaptic neurotoxins causing descending motor paralysis.",
        "Minimal initial localized pain or swelling can falsely reassure caregivers.",
        "Children have low respiratory reserve; sudden diaphragmatic paralysis can occur 8–12 hours post-bite.",
      ],
      blackBoxWarning:
        "Never wait for respiratory distress to appear. Children require immediate PICU admission with ventilatory capability.",
      weightBasedAdvice:
        "Full adult antivenom dosing protocol (CoralFab / North American Coral Snake Antivenin) applies under toxicologist direction.",
      erCriteria: [
        "Any confirmed or suspected bite from a red-on-yellow banded snake requires immediate 911 transfer.",
      ],
    },
    pregnancy: {
      cautions: [
        "Neurotoxic respiratory paralysis causes catastrophic fetal hypoxia.",
        "Requires immediate hospital admission with continuous electronic fetal monitoring.",
      ],
      contraindications: [
        "Sedatives or respiratory depressants without an established secure airway.",
      ],
      safeAlternatives: "Specific coral snake antivenom and supportive mechanical ventilation.",
      fetalRisks:
        "Maternal hypoventilation rapidly leads to fetal asphyxia and neurological injury.",
    },
    geriatric: {
      cautions: [
        "Pre-existing COPD or neuromuscular conditions greatly accelerate ventilatory collapse.",
        "Delayed symptom onset (up to 12 hours) requires mandatory 24-hour ICU observation.",
      ],
      beersCriteriaWarning:
        "Avoid any anticholinergic or sedative medications that could mask early ptosis or dysarthria.",
      sepsisWarningSigns: ["Decreasing oxygen saturation, shallow respiratory rate, or lethargy."],
    },
  },

  scorpion: {
    pediatric: {
      cautions: [
        "Arizona Bark Scorpion (*Centruroides sculpturatus*) venom causes severe neuromuscular excitability in children < 5 years.",
        "Rapid catecholamine excess causes hypertension, tachycardia, and potential pulmonary edema.",
      ],
      atypicalPresentation:
        "DO NOT MISS: Opsoclonus (wild, rapid, wandering multi-directional eye movements), tongue fasciculations, excessive drooling/hypersalivation, and extreme thrashing restlessness. Frequently misdiagnosed as seizure or encephalitis.",
      blackBoxWarning:
        "Infant drooling and opsoclonus indicate impending airway compromise. Immediate Anascorp antivenom required in PICU.",
      weightBasedAdvice:
        "Anascorp (scorpion antivenom) initial dose is 3 vials IV, regardless of weight.",
      erCriteria: [
        "Roving eye movements (opsoclonus), difficulty swallowing, drooling, or full-body jerking.",
      ],
    },
    pregnancy: {
      cautions: [
        "Severe envenomation triggers autonomic discharge and painful uterine hypertonicity.",
        "Anascorp antivenom is indicated and effective to resolve systemic envenomation.",
      ],
      contraindications: [
        "Excessive sedation with benzodiazepines without fetal heart rate monitoring.",
      ],
      safeAlternatives: "Intravenous Anascorp antivenom and local cold compresses.",
      fetalRisks:
        "Uterine contractions and maternal autonomic crisis may precipitate preterm labor.",
    },
    geriatric: {
      cautions: [
        "Severe catecholamine surge can trigger malignant hypertension, cardiac arrhythmias, or acute myocardial ischemia.",
      ],
      atypicalPresentation:
        "May present with cardiovascular collapse or hypertensive crisis rather than somatic motor hyperactivity.",
      beersCriteriaWarning:
        "Avoid sedating antihistamines to treat scorpion venom; they provide no neurotoxic relief and impair mental status checks.",
      sepsisWarningSigns: ["Severe tachycardia, diaphoresis, dyspnea, or chest pain."],
    },
  },

  black_widow: {
    pediatric: {
      cautions: [
        "Alpha-latrotoxin causes massive presynaptic neurotransmitter release (acetylcholine, norepinephrine).",
        "Puncture marks are tiny and frequently invisible on toddler skin.",
      ],
      atypicalPresentation:
        "DO NOT MISS: Inconsolable screaming and board-like rigid abdominal wall guarding in toddlers, closely mimicking acute pediatric appendicitis, intussusception, or strangulated hernia.",
      blackBoxWarning:
        "Board-like rigid abdomen in a distressed toddler with outdoor exposure warrants immediate latrodectism evaluation.",
      weightBasedAdvice:
        "IV calcium gluconate and muscle relaxants dosed strictly by weight under pediatric hospital supervision.",
      erCriteria: ["Severe abdominal spasms, diaphoresis, hypertension, or difficulty breathing."],
    },
    pregnancy: {
      cautions: [
        "Latrotoxin-induced systemic smooth muscle spasms can cause painful uterine tetany, labor contractions, or placental abruption.",
        "Mandatory hospital admission for continuous electronic tocodynamometry and fetal heart monitoring.",
      ],
      contraindications: [
        "Opioid analgesics that may cause maternal-fetal respiratory depression without adequate monitoring.",
      ],
      safeAlternatives:
        "IV calcium, gentle muscle relaxation, and equine antivenom under high-risk maternal-fetal medicine supervision if refractory.",
      fetalRisks: "Uterine hypertonus may impair uteroplacental blood flow.",
    },
    geriatric: {
      cautions: [
        "Severe latrodectism can provoke hypertensive crisis, acute heart failure, or intracranial hemorrhage in elderly patients with vascular disease.",
      ],
      atypicalPresentation:
        "Hypertensive crisis and intense lower back/flank pain mimicking aortic dissection or renal colic.",
      beersCriteriaWarning:
        "Avoid central muscle relaxants with high anticholinergic burden (e.g. Cyclobenzaprine); use cautious IV calcium and BP control.",
      sepsisWarningSigns: ["Severe diaphoresis with elevated blood pressure > 180/110 mmHg."],
    },
  },

  brown_recluse: {
    pediatric: {
      cautions: [
        "Young children are at high risk for Systemic Loxoscelism (life-threatening complication of sphingomyelinase D venom).",
        "Systemic loxoscelism causes massive intravascular hemolysis, acute renal failure, and disseminated intravascular coagulation (DIC).",
      ],
      atypicalPresentation:
        "Tea-colored or cola-colored urine (hemoglobinuria), yellow jaundice, high fever, and morbilliform rash 24–72 hours post-bite.",
      blackBoxWarning:
        "Monitor pediatric urine color closely. Tea-colored urine indicates severe hemolysis requiring immediate pediatric intensive care.",
      weightBasedAdvice:
        "Supportive IV hydration, serial complete blood count (CBC) with reticulocyte count, and urinalysis.",
      erCriteria: [
        "Tea-colored urine, jaundice, petechiae, fever, or vomiting within 72 hours of a spider bite.",
      ],
    },
    pregnancy: {
      cautions: [
        "Severe systemic loxoscelism with maternal hemolysis can compromise fetal oxygen delivery.",
        "Avoid Dapsone during pregnancy due to maternal methemoglobinemia and neonatal hyperbilirubinemia risk.",
      ],
      contraindications: ["Dapsone is contraindicated in pregnancy and G6PD deficiency."],
      safeAlternatives:
        "Cold compresses, strict wound cleanliness, and oral cephalexin if secondary bacterial infection develops.",
      fetalRisks: "Maternal anemia and systemic hemolysis can lead to fetal distress.",
    },
    geriatric: {
      cautions: [
        "Slow-healing necrotic ulceration (dermonecrosis) often taking 8–12 weeks to re-epithelialize.",
        "Impaired microcirculation from diabetes or peripheral arterial disease elevates secondary gangrene or osteomyelitis risk.",
      ],
      atypicalPresentation:
        "Large indolent, non-healing necrotic crater mistaken for a diabetic foot ulcer or decubitus ulcer.",
      beersCriteriaWarning:
        "Avoid empiric polypharmacy; conservative dry wound care and debridement only after margins demarcate.",
      sepsisWarningSigns: [
        "Spreading erythema beyond the central ischemic eschar, purulence, or fever.",
      ],
    },
  },

  giant_centipede: {
    pediatric: {
      cautions: [
        "Venom contains cytotoxic enzymes and histamine triggers causing excruciating sharp pain that can cause syncope in young children.",
        "Pronounced localized edema that may compress small distal digits.",
      ],
      blackBoxWarning:
        "Never apply tourniquets or attempt incision. Use clean ice packs wrapped in a cloth for 15-minute intervals.",
      weightBasedAdvice:
        "Acetaminophen (15 mg/kg) or Ibuprofen (10 mg/kg if > 6 months) for pain control.",
      erCriteria: [
        "Rapidly swelling digit with numbness, pale or cool fingers/toes, or systemic allergic reaction.",
      ],
    },
    pregnancy: {
      cautions: [
        "Extreme pain can provoke vasovagal episodes or stress-induced contractions.",
        "Use safe localized non-pharmacologic pain relief (cold compresses).",
      ],
      contraindications: [
        "NSAIDs in the third trimester (premature closure of ductus arteriosus).",
      ],
      safeAlternatives:
        "Acetaminophen for pain, cold pack, elevation, and topical 1% hydrocortisone cream.",
      fetalRisks:
        "Severe maternal pain stress; maintain hydration and reassuring fetal monitoring.",
    },
    geriatric: {
      cautions: [
        "Intense pain response can trigger ischemic cardiac symptoms or hypertensive surges.",
      ],
      beersCriteriaWarning:
        "Avoid prescribing opioid analgesics or sedating muscle relaxants due to acute fall risks.",
      sepsisWarningSigns: [
        "Surrounding cellulitic warmth spreading up the limb 24–48 hours post-bite.",
      ],
    },
  },

  asp_caterpillar: {
    pediatric: {
      cautions: [
        "Puss caterpillar (*Megalopyge opercularis*) spines inject venom producing severe radiating bone-deep pain.",
        "Children frequently present with intense nausea, vomiting, localized grid-pattern petechiae, and vasovagal collapse.",
      ],
      blackBoxWarning:
        "Immediately apply cellophane/duct tape over the sting site and pull up repeatedly to remove embedded venomous setae.",
      weightBasedAdvice:
        "Weight-based acetaminophen or ibuprofen for pain; ice pack to deactivate thermal venom components.",
      erCriteria: [
        "Intractable vomiting, severe abdominal pain, chest tightness, or dizziness in a child.",
      ],
    },
    pregnancy: {
      cautions: [
        "Excruciating radiating pain up the affected limb can trigger tachycardia and stress.",
      ],
      contraindications: ["NSAIDs during the 3rd trimester."],
      safeAlternatives: "Tape stripping of setae, cold compress, and safe acetaminophen.",
      fetalRisks:
        "Maternal stress response; localized venom does not cross placenta in meaningful amounts.",
    },
    geriatric: {
      cautions: [
        "Severe radiating pain mimicking myocardial infarction (when stung on left arm or torso).",
      ],
      beersCriteriaWarning:
        "Diphenhydramine will cause sedation and confusion; use ice packs and non-sedating analgesics.",
      sepsisWarningSigns: [
        "Persistent grid-pattern blistering with secondary bacterial purulence.",
      ],
    },
  },

  jellyfish: {
    pediatric: {
      cautions: [
        "High body surface area exposed to tentacles increases systemic stinging load.",
        "Children have delicate, thin epidermis easily scarred by nematocyst discharges.",
      ],
      blackBoxWarning:
        "SCALD PREVENTION: Water immersion for jellyfish stings must NEVER exceed 104°F (40°C) in children. Water must be tested on an adult caregiver's arm first to prevent debilitating second-degree scald burns.",
      weightBasedAdvice:
        "Rinse with household vinegar (5% acetic acid) for 30 seconds to halt nematocysts, then warm soak < 104°F.",
      erCriteria: [
        "Stings covering > 10% of body surface area, stings near eyes, or difficulty breathing.",
      ],
    },
    pregnancy: {
      cautions: [
        "Systemic envenomation from multiple tentacle tracks can trigger maternal hypotension.",
        "Topical vinegar is safe and effective.",
      ],
      contraindications: [
        "Freshwater rinse (causes massive osmotic discharge of remaining nematocysts).",
      ],
      safeAlternatives: "Vinegar rinse, warm water soak (110°F/43°C), and topical hydrocortisone.",
      fetalRisks: "Maternal anaphylaxis or hypovolemic shock can compromise placental blood flow.",
    },
    geriatric: {
      cautions: [
        "Diabetic neuropathy reduces thermal sensation; hot water soaks must be checked with a thermometer to prevent deep-tissue burns.",
      ],
      beersCriteriaWarning:
        "Avoid 1st-generation antihistamines for marine stings in older adults; use safe topical treatments.",
      sepsisWarningSigns: [
        "Secondary *Vibrio vulnificus* infection with hemorrhagic bullae or rapid ascending erythema.",
      ],
    },
  },

  stingray: {
    pediatric: {
      cautions: [
        "Venomous serrated spine produces intense, agonizing localized pain and deep lacerations.",
        "Retained spine fragments or sheath tissue cause severe foreign body granulomas or chronic infection.",
        "Verify child's tetanus immunization status (DTaP/Tdap).",
      ],
      blackBoxWarning:
        "SCALD WARNING: Hot water soak must be capped at 104°F (40°C) for children. Test with adult hand first.",
      weightBasedAdvice:
        "Immerse affected foot/hand in hot water < 104°F for 30–90 minutes to denature heat-labile venom enzymes.",
      erCriteria: [
        "Deep puncture over joint capsule, retained barb fragment visible or palpated, or uncontrolled bleeding.",
      ],
    },
    pregnancy: {
      cautions: [
        "Deep penetrating trauma carries risk of marine infection (*Vibrio*, *Aeromonas*).",
        "May require local anesthesia and surgical exploration for retained barb.",
      ],
      contraindications: ["Delaying wound exploration or imaging if a retained barb is suspected."],
      safeAlternatives:
        "Hot water soak (110°F–115°F for adult), ultrasound/X-ray imaging, and safe cephalosporin prophylaxis if indicated.",
      fetalRisks: "Maternal marine bacterial sepsis; prompt debridement is essential.",
    },
    geriatric: {
      cautions: [
        "High risk of fulminant marine bacterial infections (*Vibrio vulnificus*), especially in patients with chronic liver disease, diabetes, or hemochromatosis.",
        "Patients with neuropathy can suffer third-degree burns from hot water soaks.",
      ],
      atypicalPresentation:
        "Rapid septic shock with bullous lesions out of proportion to initial puncture size.",
      sepsisWarningSigns: [
        "Fever, purple skin discoloration, hemorrhagic bullae, or hypotension within 24 hours of marine exposure.",
      ],
    },
  },

  blacklegged_tick: {
    pediatric: {
      cautions: [
        "Transmits Lyme disease (*Borrelia burgdorferi*), Babesiosis, and Anaplasmosis.",
        "Children aged 5–9 have the highest incidence of Lyme disease in the United States.",
        "AAP and CDC now permit short courses of Doxycycline (< 21 days) for all pediatric ages with confirmed Lyme, as dental staining requires prolonged repeated courses.",
        "Amoxicillin (50 mg/kg/day divided TID, max 500 mg TID) remains a widely utilized first-line alternative.",
      ],
      atypicalPresentation:
        "DO NOT MISS: Pediatric acute facial nerve palsy (unilateral Bell's palsy) or painless large joint effusion (swollen Lyme knee).",
      weightBasedAdvice:
        "Amoxicillin 50 mg/kg/day PO in 3 divided doses (max 500 mg/dose) for 14–21 days.",
      erCriteria: [
        "Facial drooping, stiff neck with severe headache, confusion, or inability to bear weight on a swollen joint.",
      ],
    },
    pregnancy: {
      cautions: [
        "Congenital Lyme infection can occur if active maternal infection is left untreated.",
        "DOXYCYCLINE IS CONTRAINDICATED in pregnancy (FDA Category D: permanent discoloration of deciduous teeth, enamel hypoplasia, and suppression of fetal bone growth).",
      ],
      blackBoxWarning:
        "NEVER prescribe Doxycycline to a pregnant patient. Single-dose post-tick prophylaxis with Doxycycline is CONTRAINDICATED.",
      safeAlternatives:
        "First-line ACOG/CDC treatment: Amoxicillin 500 mg orally 3 times daily for 14–21 days. Penicillin-allergic alternative: Cefuroxime axetil 500 mg PO BID for 14–21 days.",
      contraindications: [
        "Doxycycline, Minocycline, and Tetracyclines are strictly contraindicated in all trimesters of pregnancy.",
      ],
      fetalRisks:
        "Untreated maternal Lyme disease has been linked to spontaneous miscarriage and stillbirth.",
    },
    geriatric: {
      cautions: [
        "Older adults frequently exhibit atypical Erythema Migrans (faint, irregular, or brownish plaques rather than vibrant bullseyes).",
        "Higher false-negative serologic testing rates early in infection due to blunted immune response.",
        "High risk of severe co-infection with *Babesia microti*, producing hemolytic anemia, thrombocytopenia, and renal failure in patients with splenic hypofunction.",
      ],
      atypicalPresentation:
        "Faint non-classic rash mistaken for stasis dermatitis; acute fatigue or cognitive slowing mistaken for normal aging.",
      beersCriteriaWarning:
        "Avoid sedating medications during systemic infection; check renal function before antibiotic dosing.",
      sepsisWarningSigns: [
        "New confusion, severe dark urine (hemolysis from Babesia), or temperature > 101°F.",
      ],
    },
  },

  lone_star_tick: {
    pediatric: {
      cautions: [
        "Transmits Alpha-gal syndrome (galactose-alpha-1,3-galactose carbohydrate allergy) and Ehrlichiosis.",
        "Alpha-gal causes delayed anaphylaxis appearing 3–6 hours after eating mammalian meat (beef, pork, lamb, dairy).",
      ],
      blackBoxWarning:
        "Delayed midnight hives, vomiting, or breathing difficulty 3-6 hours after dinner in a child with tick history suggests Alpha-gal.",
      weightBasedAdvice:
        "EpiPen Jr (0.15 mg) prescription for pediatric patients with confirmed Alpha-gal and systemic reactions.",
      erCriteria: ["Delayed nocturnal wheezing, vomiting, or hives several hours after a meal."],
    },
    pregnancy: {
      cautions: [
        "Alpha-gal syndrome poses risks during labor/delivery if gelatin-based surgical products or certain medications are administered.",
      ],
      contraindications: [
        "Avoid gelatin-coated capsules or medications derived from bovine/porcine tissues without checking ingredients.",
      ],
      safeAlternatives:
        "Strict mammalian meat and byproduct avoidance; fish and poultry remain completely safe.",
      fetalRisks:
        "Anaphylaxis during pregnancy risks severe maternal hypotension and fetal hypoxia.",
    },
    geriatric: {
      cautions: [
        "Ehrlichiosis (*Ehrlichia chaffeensis*) causes severe acute illness in older adults: thrombocytopenia, leukopenia, and acute kidney injury.",
      ],
      atypicalPresentation:
        "Severe persistent headache and confusion without an identifiable rash.",
      sepsisWarningSigns: [
        "Platelets < 100k, creatinine elevation, or sudden mental status change.",
      ],
    },
  },

  dog_tick: {
    pediatric: {
      cautions: [
        "Primary vector of Rocky Mountain Spotted Fever (RMSF - *Rickettsia rickettsii*) in eastern/central US.",
        "RMSF is a pediatric medical emergency; delay in treatment past day 5 dramatically increases fatality rates.",
        "DOXYCYCLINE IS FIRST-LINE FOR ALL CHILDREN WITH SUSPECTED RMSF, REGARDLESS OF AGE (AAP exemption due to life-saving necessity).",
      ],
      blackBoxWarning:
        "NEVER withhold Doxycycline from a child with suspected RMSF. The risk of dental staining is negligible compared to the mortality of untreated RMSF.",
      weightBasedAdvice:
        "Doxycycline 2.2 mg/kg per dose twice daily (max 100 mg/dose) started immediately upon clinical suspicion.",
      erCriteria: [
        "High fever, severe headache, and maculopapular rash appearing on wrists and ankles and spreading centripetally to palms and soles.",
      ],
    },
    pregnancy: {
      cautions: [
        "RMSF in pregnancy carries catastrophic maternal and fetal mortality.",
        "Immediate maternal-fetal medicine and infectious disease consultation required.",
      ],
      contraindications: [
        "Delaying treatment while awaiting laboratory serologies is life-threatening.",
      ],
      safeAlternatives:
        "Doxycycline is recommended even in pregnancy when RMSF is suspected due to lack of effective alternatives and extreme mortality.",
      fetalRisks: "Disseminated vasculitis and fetal death in > 50% of untreated maternal cases.",
    },
    geriatric: {
      cautions: [
        "Elderly patients have significantly higher mortality from RMSF due to underlying vascular disease and delayed diagnosis.",
      ],
      atypicalPresentation:
        "Rash may be absent ('spotless RMSF') in up to 20% of elderly patients.",
      sepsisWarningSigns: [
        "Altered sensorium, acute renal failure, pulmonary edema, or petechial purpura.",
      ],
    },
  },

  brown_dog_tick: {
    pediatric: {
      cautions: [
        "Emerging vector of RMSF in the Southwestern US and northern Mexico.",
        "Rapid clinical progression in children; start empiric Doxycycline immediately.",
      ],
      blackBoxWarning:
        "Start Doxycycline on clinical suspicion of RMSF; do not wait for serologic antibody confirmation.",
      weightBasedAdvice: "Doxycycline 2.2 mg/kg/dose PO/IV BID (max 100 mg/dose).",
      erCriteria: [
        "High fever, lethargy, vomiting, and rash on palms/soles in a child living in or visiting the Southwest.",
      ],
    },
    pregnancy: {
      cautions: ["Severe rickettsial vasculitis endangering maternal and fetal life."],
      safeAlternatives:
        "Urgent infectious disease specialist consultation; Doxycycline is the life-saving standard.",
      fetalRisks: "Placental vasculitis, spontaneous abortion, and maternal-fetal coagulopathy.",
    },
    geriatric: {
      cautions: ["Accelerated multisystem organ failure; requires immediate hospitalization."],
      atypicalPresentation: "Confusion, profound weakness, and hyponatremia without classic rash.",
      sepsisWarningSigns: ["Hypotension, purpura fulminans, or oliguria."],
    },
  },

  soft_tick: {
    pediatric: {
      cautions: [
        "Vectors Tick-Borne Relapsing Fever (TBRF - *Borrelia hermsii*), commonly acquired in rustic cabins or rodent-infested vacation homes.",
        "Recurrent high fever cycles (104°F+) lasting ~3 days, followed by afebrile periods and sudden relapses.",
        "High risk of Jarisch-Herxheimer reaction upon initial antibiotic administration.",
      ],
      blackBoxWarning:
        "Administer the first dose of antibiotics in a monitored medical setting due to risk of the Jarisch-Herxheimer reaction (fever spike, rigors, hypotension).",
      weightBasedAdvice:
        "Amoxicillin (50 mg/kg/day) or Doxycycline (if > 8 years) under physician supervision.",
      erCriteria: [
        "High fever (> 103°F), shaking chills, and delirium in a child following a stay in a mountain cabin.",
      ],
    },
    pregnancy: {
      cautions: [
        "TBRF causes severe maternal morbidity, high risk of spontaneous abortion, preterm delivery, and congenital transmission.",
      ],
      contraindications: ["Doxycycline is contraindicated in pregnancy."],
      safeAlternatives:
        "Intravenous Penicillin G or Ceftriaxone (safe in pregnancy) administered under monitored inpatient care.",
      fetalRisks:
        "Spirochetes cross the placenta, causing congenital relapsing fever, fetal distress, and stillbirth.",
    },
    geriatric: {
      cautions: [
        "Severe hemodynamic collapse and cardiac arrhythmias during the Jarisch-Herxheimer crisis upon treatment.",
      ],
      beersCriteriaWarning:
        "Requires inpatient telemetry monitoring during initial antibiotic therapy.",
      sepsisWarningSigns: [
        "Profound rigors followed by precipitous blood pressure drop during treatment initiation.",
      ],
    },
  },

  kissing_bug: {
    pediatric: {
      cautions: [
        "Vectors Chagas disease (*Trypanosoma cruzi*); transmission occurs when infectious feces are rubbed into the bite wound or mucous membranes.",
        "Children are at highest risk for acute Chagas disease with high parasitemia.",
      ],
      atypicalPresentation:
        "DO NOT MISS: Romaña's sign (unilateral, painless, violaceous periorbital edema and conjunctivitis).",
      weightBasedAdvice:
        "Immediate pediatric infectious disease referral for antiparasitic treatment with Benznidazole (weight-dosed).",
      erCriteria: [
        "Unilateral eye swelling, high fever, lymphadenopathy, or signs of acute myocarditis (tachycardia out of proportion to fever).",
      ],
    },
    pregnancy: {
      cautions: [
        "CONGENITAL CHAGAS TRANSMISSION: *T. cruzi* crosses the placenta in 1%–10% of infected mothers.",
        "Maternal screening allows early neonatal diagnosis; antiparasitic treatment of infected infants at birth cures > 90% of congenital infections.",
      ],
      blackBoxWarning:
        "Congenital transmission occurs during any trimester. Infants of seropositive mothers must be evaluated at birth via cord blood microscopy and PCR.",
      contraindications: [
        "Benznidazole and Nifurtimox are generally contraindicated during pregnancy due to teratogenicity; defer maternal treatment until after lactation, but treat infected infants immediately.",
      ],
      safeAlternatives:
        "Supportive prenatal care and immediate post-partum neonatal cord blood screening.",
      fetalRisks:
        "Congenital Chagas causes low birth weight, prematurity, hepatosplenomegaly, and infant meningoencephalitis.",
    },
    geriatric: {
      cautions: [
        "Chronic Chagas disease manifests decades after initial exposure as dilated cardiomyopathy, apical ventricular aneurysm, or megacolon.",
      ],
      atypicalPresentation:
        "Syncope or heart failure in patients with prior rural Latin America or southern US exposure.",
      sepsisWarningSigns: [
        "Ventricular arrhythmias, complete heart block, or thromboembolic stroke.",
      ],
    },
  },

  scabies: {
    pediatric: {
      cautions: [
        "In infants and toddlers < 2 years, scabies has an ATYPICAL DISTRIBUTION and DOES NOT spare the head.",
        "Serpentine burrows, inflammatory papules, and pustules cover the scalp, face, neck, palms of hands, and soles of feet.",
        "Secondary bacterial impetigo (*Staphylococcus aureus*) from constant scratching is very common.",
      ],
      blackBoxWarning:
        "In infants under 2 years, 5% Permethrin cream must be applied to the ENTIRE body including the scalp, hairline, behind ears, and soles of feet (avoiding mouth/eyes).",
      weightBasedAdvice:
        "Permethrin 5% cream is FDA approved for infants aged 2 months and older. In infants < 2 months, consult a pediatric dermatologist.",
      erCriteria: [
        "Secondary skin infection with honey-colored crusted lesions (impetigo), surrounding cellulitis, or fever.",
      ],
    },
    pregnancy: {
      cautions: [
        "Permethrin 5% cream is FDA Pregnancy Category B and the DOCUMENTED SAFE FIRST-LINE THERAPY in all trimesters of pregnancy and during breastfeeding.",
        "ORAL IVERMECTIN IS CONTRAINDICATED in pregnancy due to animal teratogenicity and embryotoxicity data.",
      ],
      blackBoxWarning:
        "NEVER use oral Ivermectin or Lindane in pregnant or lactating patients. Use Permethrin 5% cream only.",
      contraindications: [
        "Oral Ivermectin and Lindane 1% lotion are strictly contraindicated in pregnancy.",
      ],
      safeAlternatives:
        "Permethrin 5% cream applied neck-down (left on 8–14 hours then washed off), repeated in 7 days. Topical sulfur ointment (6%) is an alternative.",
      fetalRisks:
        "Maternal sleep disruption from severe nocturnal itching; no direct fetal mite invasion.",
    },
    geriatric: {
      cautions: [
        "CRUSTED (NORWEGIAN) SCABIES: In immunocompromised patients or nursing home residents, mites multiply into millions.",
        "Forms thick, psoriasiform hyperkeratotic crusts on palms, soles, and body, frequently with MINIMAL OR ABSENT ITCHING.",
        "Extremely contagious; requires environmental decontamination and institutional isolation protocols.",
      ],
      atypicalPresentation:
        "Thick scaly or crusted plaques on hands and feet with no itch; mistaken for severe psoriasis or eczema.",
      beersCriteriaWarning:
        "Avoid 1st-generation antihistamines for itching; use Cetirizine or topical Pramoxine to prevent acute delirium and falls.",
      sepsisWarningSigns: [
        "Cracked hyperkeratotic fissures developing secondary bacterial cellulitis or bacteremia.",
      ],
    },
  },

  honey_bee: {
    pediatric: {
      cautions: [
        "Immediately remove the barbed stinger by scraping with a fingernail or plastic card (do not squeeze the venom sac).",
        "Anaphylaxis can develop rapidly on repeated stings.",
      ],
      blackBoxWarning:
        "FATAL REYE'S SYNDROME WARNING: NEVER give Aspirin, baby aspirin, or bismuth subsalicylate (Pepto-Bismol) to children or teens with stings/viral symptoms.",
      weightBasedAdvice:
        "EpiPen Jr (0.15 mg) for children 7.5 kg to 30 kg (16.5–66 lbs). Adult EpiPen (0.30 mg) for > 30 kg (> 66 lbs). Liquid Cetirizine dosed by weight with an oral calibrated syringe.",
      erCriteria: [
        "Hives spreading beyond the sting site, lip/tongue swelling, stridor, wheezing, or vomiting.",
      ],
    },
    pregnancy: {
      cautions: [
        "Anaphylaxis induces maternal hypovolemia and uterine hypoperfusion, endangering the fetus.",
        "IM Epinephrine is the first-line life-saving treatment in pregnancy; benefits far outweigh risks.",
      ],
      contraindications: [
        "Withholding Epinephrine during anaphylaxis out of concern for uterine vasoconstriction is contraindicated.",
      ],
      safeAlternatives:
        "IM Epinephrine (0.3 mg) immediately for anaphylaxis, cold compresses, and topical 1% hydrocortisone.",
      fetalRisks:
        "Maternal anaphylactic shock causes severe fetal hypoxia and emergency delivery risk.",
    },
    geriatric: {
      cautions: [
        "Multiple stings can trigger myocardial ischemia, atrial fibrillation, or acute coronary syndrome (Kounis syndrome).",
      ],
      beersCriteriaWarning:
        "Diphenhydramine (Benadryl) causes urinary retention, confusion, and fall fractures in adults 65+; use Cetirizine (Zyrtec) or Loratadine.",
      sepsisWarningSigns: ["Hypotension, syncope, or chest tightness following a sting."],
    },
  },

  wasp: {
    pediatric: {
      cautions: [
        "Wasps (yellowjackets, hornets, paper wasps) have unbarbed stingers and can sting multiple times in rapid succession.",
        "High risk of rapid localized swelling when stung around the face or neck.",
      ],
      blackBoxWarning:
        "Strictly avoid Aspirin in children due to fatal Reye's syndrome risk. Use weight-based Ibuprofen or Acetaminophen.",
      weightBasedAdvice:
        "EpiPen Jr (0.15 mg) for 7.5–30 kg. Oral liquid Cetirizine dosed by weight.",
      erCriteria: ["Stridor, drooling, hoarseness, throat tightness, or widespread urticaria."],
    },
    pregnancy: {
      cautions: ["Aggressive allergic reactions require immediate emergency intervention."],
      safeAlternatives:
        "Cold packs, elevation, topical hydrocortisone, and immediate IM Epinephrine for systemic symptoms.",
      fetalRisks: "Maternal hypoxia from anaphylactic bronchospasm.",
    },
    geriatric: {
      cautions: [
        "Stings can precipitate Kounis syndrome (allergic angina or myocardial infarction).",
      ],
      beersCriteriaWarning:
        "Beers Criteria warning against Diphenhydramine; use non-sedating 2nd-generation antihistamines.",
      sepsisWarningSigns: ["Chest pain, arrhythmias, or dizziness post-sting."],
    },
  },

  fire_ant: {
    pediatric: {
      cautions: [
        "Toddlers stepping on mounds receive dozens of synchronized stings within seconds.",
        "Sterile pustules form within 24 hours. Scratching introduces *Staph* or *Strep*, leading to secondary impetigo or cellulitis.",
      ],
      blackBoxWarning:
        "Do not rupture or pop pustules. Keep toddler nails trimmed short and wash with antimicrobial soap.",
      weightBasedAdvice: "Weight-based liquid antihistamines; topical calamine lotion.",
      erCriteria: [
        "Systemic hives, facial swelling, difficulty breathing, or lethargy following fire ant stings.",
      ],
    },
    pregnancy: {
      cautions: [
        "Multiple stings cause intense pruritus and stress; manage with safe topical agents.",
      ],
      safeAlternatives: "Topical 1% hydrocortisone cream, cold packs, and oral Cetirizine.",
      fetalRisks:
        "Minimal from localized stings; systemic anaphylaxis requires immediate 911 dispatch.",
    },
    geriatric: {
      cautions: [
        "Elderly patients with immobility can suffer massive attacks with hundreds of stings, leading to rhabdomyolysis and renal failure.",
      ],
      beersCriteriaWarning:
        "Avoid sedating 1st-generation antihistamines; use Cetirizine or Fexofenadine.",
      sepsisWarningSigns: [
        "Ruptured pustules developing spreading redness, warmth, or purulent drainage.",
      ],
    },
  },

  velvet_ant: {
    pediatric: {
      cautions: [
        "The 'cow killer' flightless female wasp delivers an excruciating sting (Schmidt index 3.0).",
        "Can cause immediate screaming, panic, and vasovagal fainting in young children.",
      ],
      blackBoxWarning:
        "Avoid Aspirin in children. Reassure the child that despite extreme pain, the sting does not cause tissue necrosis.",
      weightBasedAdvice:
        "Weight-based acetaminophen or ibuprofen; cold pack wrapped in cloth for 15 minutes.",
      erCriteria: ["Syncope with prolonged unresponsiveness or systemic allergic symptoms."],
    },
    pregnancy: {
      cautions: ["Severe pain stress; manage with non-pharmacologic cooling and safe analgesics."],
      safeAlternatives:
        "Cold compresses, topical lidocaine cream if prescribed, and acetaminophen.",
      fetalRisks: "Maternal stress and transient tachycardia.",
    },
    geriatric: {
      cautions: [
        "Severe pain spike can elevate blood pressure significantly in hypertensive patients.",
      ],
      beersCriteriaWarning: "Avoid opioid prescriptions for acute insect sting pain.",
      sepsisWarningSigns: ["Persistent pain beyond 24 hours with local induration."],
    },
  },

  wheel_bug: {
    pediatric: {
      cautions: [
        "North America's largest assassin bug delivers an intensely painful cytotoxic bite.",
        "Pain is often described as worse than a hornet sting and can persist for hours to days.",
      ],
      blackBoxWarning:
        "Do not squeeze or press the bite wound. Wash thoroughly with soap and water.",
      weightBasedAdvice: "Weight-based acetaminophen or ibuprofen for pain; cold compress.",
      erCriteria: ["Signs of secondary infection or systemic allergic reaction."],
    },
    pregnancy: {
      cautions: ["Painful bite requiring supportive local care."],
      safeAlternatives: "Cold compresses, elevation, and acetaminophen.",
      fetalRisks: "No teratogenic venom components; localized cytotoxic enzymes.",
    },
    geriatric: {
      cautions: [
        "Can leave a small necrotic center that heals slowly in diabetic or elderly patients.",
      ],
      sepsisWarningSigns: ["Spreading erythema or purulent drainage after 48 hours."],
    },
  },

  blister_beetle: {
    pediatric: {
      cautions: [
        "Crushing the beetle against skin releases cantharidin, a potent vesicant causing large flaccid blisters.",
        "Children touching beetles can rub their eyes, producing 'Nairobi eye' (severe keratoconjunctivitis, corneal ulceration, and eyelid edema).",
      ],
      blackBoxWarning:
        "DO NOT POP BLISTERS. Wash hands thoroughly with soap and water immediately if a beetle was handled. Avoid touching eyes.",
      weightBasedAdvice:
        "Leave blister roof intact as a biological sterile dressing; apply sterile petrolatum gauze.",
      erCriteria: [
        "Cantharidin contact with eyes (eye pain, redness, photophobia) or extensive body blistering.",
      ],
    },
    pregnancy: {
      cautions: ["Cantharidin is absorbed locally. Keep blisters intact and clean."],
      safeAlternatives: "Sterile non-adherent dressings and cool water compresses.",
      fetalRisks:
        "Localized skin blistering; avoid ingesting beetles (systemic cantharidin toxicity).",
    },
    geriatric: {
      cautions: [
        "Fragile, atrophic skin in elderly patients can tear easily if blisters deroof, creating deep secondary wounds.",
      ],
      beersCriteriaWarning:
        "Avoid harsh topical antiseptics (alcohol, iodine) that retard epithelialization.",
      sepsisWarningSigns: ["Infected blister base with surrounding cellulitis."],
    },
  },

  mosquito: {
    pediatric: {
      cautions: [
        "Toddlers often exhibit 'Skeeter syndrome' (exaggerated local hypersensitivity with extensive periorbital or limb swelling).",
        "High risk of secondary impetigo from fingernail excoriation.",
      ],
      blackBoxWarning:
        "REPELLENT RULES: Do NOT use DEET on infants under 2 months old. Use 10%–30% DEET on children ≥ 2 months. NEVER use Oil of Lemon Eucalyptus (OLE/PMD) on children under 3 years old.",
      weightBasedAdvice:
        "Liquid Cetirizine dosed by weight; topical calamine or 1% hydrocortisone.",
      erCriteria: [
        "Orbital cellulitis signs (fever, pain with eye movement, proptosis) if bitten near eyelid.",
      ],
    },
    pregnancy: {
      cautions: [
        "Avoid travel to Zika-endemic areas (causes congenital Zika syndrome: microcephaly, intracranial calcifications, ocular abnormalities).",
        "EPA-registered DEET (up to 30%) and Picaridin (20%) are proven safe and recommended during pregnancy by CDC.",
      ],
      safeAlternatives:
        "EPA-registered DEET (20%–30%), Picaridin, and Permethrin-treated clothing.",
      fetalRisks:
        "Zika virus transplacental infection causes microcephaly and severe fetal brain defects.",
    },
    geriatric: {
      cautions: [
        "West Nile Virus (WNV) causes severe neuroinvasive disease (encephalitis, meningitis, acute flaccid paralysis) primarily in adults 65+.",
      ],
      atypicalPresentation:
        "Sudden onset high fever, severe weakness, coarse tremors, ataxia, or confusion.",
      sepsisWarningSigns: [
        "Altered mental status, neck stiffness, tremors, or flaccid muscle weakness.",
      ],
    },
  },

  flea: {
    pediatric: {
      cautions: [
        "Children crawling on carpet or playing with pets can accidentally ingest fleas carrying dog tapeworm (*Dipylidium caninum*).",
        "Vectors Cat Scratch Disease (*Bartonella henselae*) and murine typhus.",
      ],
      blackBoxWarning:
        "Check child's stool for white rice-like tapeworm segments if persistent flea exposure occurs.",
      weightBasedAdvice:
        "Weight-based antihistamines for pruritus; treat household pets with veterinarian-approved flea control.",
      erCriteria: [
        "Prolonged high fever with enlarged tender lymph nodes (Bartonella) or petechial rash.",
      ],
    },
    pregnancy: {
      cautions: ["Flea bites cause itchy papular urticaria; safe topical relief is recommended."],
      safeAlternatives: "Calamine lotion, cold compresses, and 1% hydrocortisone cream.",
      fetalRisks:
        "Minimal from localized bites; avoid unapproved systemic antiparasitic medications.",
    },
    geriatric: {
      cautions: [
        "Murine typhus (*Rickettsia typhi*) in older adults causes severe persistent headache, fever, and confusion.",
      ],
      atypicalPresentation: "Confusion and delirium in elderly patients with flea contact.",
      sepsisWarningSigns: ["Fever, headache, and leukopenia requiring Doxycycline therapy."],
    },
  },

  bed_bug: {
    pediatric: {
      cautions: [
        "Bites typically occur in linear clusters of 3 or 4 ('breakfast, lunch, dinner').",
        "Intense nocturnal pruritus causes sleep disruption and aggressive scratching, leading to impetigo.",
      ],
      blackBoxWarning:
        "Do not apply harsh chemical pesticides to cribs or children's beds. Use heat treatment and professional pest control.",
      weightBasedAdvice:
        "Oral cetirizine or diphenhydramine dosed strictly by weight for sleep comfort.",
      erCriteria: ["Extensive honey-colored crusting (impetigo) or surrounding cellulitis."],
    },
    pregnancy: {
      cautions: ["Stress and severe sleep deprivation during pregnancy from infestation."],
      safeAlternatives:
        "Topical calamine, cool compresses, and safe laundering of all bedding in hot water (120°F+).",
      fetalRisks: "No pathogen transmission; maternal sleep loss and stress.",
    },
    geriatric: {
      cautions: [
        "Chronic excoriation can cause non-healing ulcers in patients with chronic venous insufficiency.",
      ],
      beersCriteriaWarning:
        "Avoid prescribing Diphenhydramine for sleep in elderly bed bug patients; causes delirium and fall risk.",
      sepsisWarningSigns: ["Purulent drainage from scratched bite lesions."],
    },
  },

  chigger: {
    pediatric: {
      cautions: [
        "Mite larvae inject digestive enzymes into hair follicles, creating intense pruritus that peaks at 24–48 hours.",
        "Young boys frequently present with 'Summer Penile Syndrome' (acute hypersensitivity with marked penile swelling, erythema, and dysuria).",
      ],
      blackBoxWarning:
        "Summer Penile Syndrome is a benign hypersensitivity reaction; reassure parents and avoid invasive catheterization.",
      weightBasedAdvice:
        "Oral Cetirizine dosed by weight; cool water soaks and topical hydrocortisone.",
      erCriteria: ["Inability to urinate (urinary retention) from severe penile edema."],
    },
    pregnancy: {
      cautions: ["Intense pruritus around waistband and skin folds."],
      safeAlternatives: "Cold compresses, calamine lotion, and oatmeal baths.",
      fetalRisks: "No pathogen transmission to fetus.",
    },
    geriatric: {
      cautions: [
        "Severe lower extremity excoriation predisposing to secondary bacterial cellulitis.",
      ],
      beersCriteriaWarning:
        "Avoid 1st-generation antihistamines; use 2nd-generation non-sedating agents.",
      sepsisWarningSigns: ["Ascending warmth, redness, or fever from lower leg bite sites."],
    },
  },

  lice: {
    pediatric: {
      cautions: [
        "Head lice (*Pediculus humanus capitis*) are very common in preschool and school-age children.",
        "Spread by head-to-head contact; not a sign of poor hygiene.",
      ],
      blackBoxWarning:
        "LINDANE CONTRAINDICATION: Lindane 1% is STRICTLY CONTRAINDICATED in children, infants, and patients weighing < 50 kg due to severe neurotoxicity and seizures.",
      weightBasedAdvice:
        "First-line: Permethrin 1% lotion or Ivermectin 0.5% lotion applied to wet hair, combined with wet combing with a fine-toothed nit comb.",
      erCriteria: [
        "Secondary bacterial infection of the scalp with impetigo, fever, or painful occipital lymphadenopathy.",
      ],
    },
    pregnancy: {
      cautions: [
        "Wet combing with a fine-toothed nit comb is completely non-pharmacologic and 100% safe in pregnancy.",
        "Permethrin 1% lotion is Category B and the safe first-line pharmacologic option.",
      ],
      contraindications: [
        "Lindane and Malathion are contraindicated during pregnancy and breastfeeding.",
      ],
      safeAlternatives: "Wet combing with conditioner and Permethrin 1% lotion.",
      fetalRisks: "Lindane crosses the placenta and causes fetal neurotoxicity; avoid completely.",
    },
    geriatric: {
      cautions: [
        "Body lice (*Pediculus humanus humanus*) in nursing home or shelter settings vector epidemic typhus (*Rickettsia prowazekii*) and trench fever.",
      ],
      atypicalPresentation:
        "Excoriated linear dermatitis on torso and axillae with lice found in clothing seams.",
      sepsisWarningSigns: [
        "Fever, headache, and rash in an institutional resident with poor hygiene.",
      ],
    },
  },

  no_see_um: {
    pediatric: {
      cautions: [
        "Biting midges (*Culicoides*) cause small puncture bites that erupt into intensely itchy papules or vesicles.",
        "Children frequently develop severe localized hypersensitivity.",
      ],
      blackBoxWarning:
        "Keep child's nails trimmed and apply cool compresses to prevent excoriation.",
      weightBasedAdvice: "Weight-based cetirizine; topical 1% hydrocortisone.",
      erCriteria: ["Signs of secondary bacterial cellulitis."],
    },
    pregnancy: {
      cautions: ["Safe topical antipruritic measures."],
      safeAlternatives: "Calamine lotion and cool water compresses.",
      fetalRisks: "No pathogen transmission in the US.",
    },
    geriatric: {
      cautions: ["Chronic itching can cause excoriation dermatitis in fragile skin."],
      beersCriteriaWarning: "Use non-sedating antihistamines (Cetirizine, Loratadine).",
      sepsisWarningSigns: ["Expanding erythema with warmth."],
    },
  },

  horse_fly: {
    pediatric: {
      cautions: [
        "Scissor-like mouthparts tear open flesh, causing immediate sharp pain, bleeding, and large localized swelling.",
        "Toddlers often exhibit marked localized inflammatory wheals.",
      ],
      blackBoxWarning:
        "Wash the open bite wound thoroughly with soap and water to prevent secondary infection.",
      weightBasedAdvice: "Weight-based acetaminophen or ibuprofen for pain; ice pack.",
      erCriteria: ["Large swelling crossing a major joint or systemic allergic signs."],
    },
    pregnancy: {
      cautions: ["Painful lacerating bite; keep clean to avoid secondary bacterial infection."],
      safeAlternatives: "Soap and water wash, ice pack, and topical hydrocortisone.",
      fetalRisks: "Localized trauma only.",
    },
    geriatric: {
      cautions: [
        "Open wound at high risk for bacterial cellulitis in immunocompromised or diabetic individuals.",
      ],
      sepsisWarningSigns: ["Spreading redness > 5 cm from bite site after 24 hours."],
    },
  },

  black_fly: {
    pediatric: {
      cautions: [
        "'Black fly fever' syndrome in children: headache, fever, nausea, and generalized painful cervical lymphadenopathy following multiple bites.",
        "Marked facial and periorbital edema if bitten around head/neck.",
      ],
      blackBoxWarning:
        "Reassure parents that 'black fly fever' is an inflammatory reaction to salivary toxins, not an active viral infection.",
      weightBasedAdvice: "Hydration, weight-based acetaminophen, and cool compresses.",
      erCriteria: ["Difficulty swallowing or breathing from neck swelling."],
    },
    pregnancy: {
      cautions: ["Multiple bites can cause systemic malaise and localized edema."],
      safeAlternatives: "Rest, hydration, cold compresses, and acetaminophen.",
      fetalRisks: "No viral or bacterial transmission in the US.",
    },
    geriatric: {
      cautions: [
        "Prominent regional lymphadenopathy may mimic lymphoma; obtain clear outdoor exposure history.",
      ],
      sepsisWarningSigns: ["Persistent fever and tender lymphadenopathy."],
    },
  },

  yellow_sac_spider: {
    pediatric: {
      cautions: [
        "Cytotoxic bite produces mild burning followed by an erythematous papule or small blister.",
        "Rarely causes significant necrosis; much milder than brown recluse.",
      ],
      blackBoxWarning:
        "Avoid unnecessary antibiotics or aggressive wound debridement; simple first aid is curative.",
      weightBasedAdvice:
        "Clean with soap and water, apply cold pack, dose acetaminophen for discomfort.",
      erCriteria: ["Expanding ulceration or red streaks."],
    },
    pregnancy: {
      cautions: ["Supportive wound care."],
      safeAlternatives: "Cold packs and topical antibacterial ointment if excoriated.",
      fetalRisks: "No systemic fetal risks.",
    },
    geriatric: {
      cautions: ["Delayed healing in diabetic patients; avoid picking at the crust."],
      sepsisWarningSigns: ["Secondary bacterial cellulitis."],
    },
  },

  minute_pirate_bug: {
    pediatric: {
      cautions: [
        "Tiny predatory insect (*Anthocoridae*) that bites humans probing for moisture during late summer/autumn.",
        "Sharp surprising pinch out of proportion to its 2–5 mm size.",
      ],
      blackBoxWarning:
        "Completely harmless. Does NOT inject venom, feed on blood, or transmit any diseases.",
      weightBasedAdvice: "Reassurance, wash with soap and water, cold pack for 5 minutes.",
      erCriteria: ["No emergency criteria; completely benign."],
    },
    pregnancy: {
      cautions: ["Completely harmless nuisance bite."],
      safeAlternatives: "Reassurance and cold water wash.",
      fetalRisks: "Zero fetal risk.",
    },
    geriatric: {
      cautions: ["Reassurance; no treatment required."],
      sepsisWarningSigns: ["None."],
    },
  },

  bird_rodent_mite: {
    pediatric: {
      cautions: [
        "Infants and toddlers present with extensive excoriated papules on covered trunk and extremities.",
        "Crucial: Do NOT repeatedly apply neurotoxic permethrin 5% cream; bird/rodent mites do not burrow in human tissue like scabies.",
        "Primary resolution is environmental: identify and remove bird nests in roof eaves, chimneys, or window AC units, or exterminate rodents.",
      ],
      blackBoxWarning:
        "Avoid continuous application of high-potency fluorinated topical steroids on pediatric skin to prevent dermal atrophy and systemic hypothalamic-pituitary-adrenal (HPA) axis suppression.",
      weightBasedAdvice:
        "Cetirizine: 6mo–2yr: 2.5 mg once daily; 2–5yr: 2.5–5 mg once daily; 6yr+: 5–10 mg daily for intense nocturnal pruritus.",
      erCriteria: [
        "Spreading cellulitis with warmth, tender lymphadenopathy, or high fever from secondary excoriation.",
      ],
    },
    pregnancy: {
      cautions: [
        "Intense itching can cause significant sleep deprivation and emotional distress.",
        "Reassurance: bird and rodent mites cannot establish ongoing human infestation.",
      ],
      safeAlternatives:
        "Topical pramoxine 1% lotion or mild hydrocortisone 1% sparingly. Oral second-generation antihistamines (cetirizine/loratadine - Category B) after consulting prenatal care provider.",
      fetalRisks:
        "No direct teratogenicity or fetal transmission; primary risk is maternal secondary skin infection.",
    },
    geriatric: {
      cautions: [
        "Elderly individuals often suffer severe pruritus with prominent excoriations due to senile xerosis and thinning epidermis.",
        "High risk of secondary Staphylococcus aureus impetiginization.",
      ],
      sepsisWarningSigns: [
        "Spreading cellulitis, purulent crusts, chills, altered mental status, or hypotension.",
      ],
    },
  },

  pacific_coast_tick: {
    pediatric: {
      cautions: [
        "Pacific Coast tick fever (caused by Rickettsia 364D / Rickettsia philipii) produces a pathognomonic black crusted necrotic eschar ('tache noire') with regional lymphadenopathy and fever.",
        "Immediate full pediatric body exam: inspect scalp, groin, and ears for attached Dermacentor occidentalis ticks.",
      ],
      blackBoxWarning:
        "DO NOT withhold doxycycline in pediatric patients with suspected rickettsial infection. The AAP Red Book affirms that short courses of doxycycline (<21 days) do NOT cause significant tooth staining in children of any age.",
      weightBasedAdvice:
        "Doxycycline oral or IV: 2.2 mg/kg per dose twice daily (maximum 100 mg per dose) for 7–10 days.",
      erCriteria: [
        "Ascending limb weakness or ataxia (tick paralysis warning sign; requires immediate full body search and tick removal).",
        "High fever with expanding necrotic eschar or petechial purpura.",
      ],
    },
    pregnancy: {
      cautions: [
        "Rickettsial infections can precipitate preterm labor and maternal morbidity.",
        "Prompt infectious disease consultation required upon appearance of an inoculation eschar and systemic fever.",
      ],
      safeAlternatives:
        "Doxycycline is generally contraindicated in 2nd/3rd trimesters due to potential bone growth effects; maternal-fetal medicine consultation is mandatory to evaluate risk/benefit or alternative therapies.",
      fetalRisks:
        "Maternal systemic rickettsial fever poses risks of placental insufficiency and fetal distress.",
    },
    geriatric: {
      cautions: [
        "Older adults have increased vulnerability to severe rickettsial vasculitis and delayed eschar healing.",
        "Assess for concurrent tularemia or Colorado tick fever co-infections.",
      ],
      sepsisWarningSigns: [
        "Hypotension, acute kidney injury, confusion, spreading cellulitis around the eschar, or rigors.",
      ],
    },
  },
};
