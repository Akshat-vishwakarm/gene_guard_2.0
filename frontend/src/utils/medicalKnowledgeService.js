/**
 * GeneGuard Medical Knowledge Service
 * -----------------------------------
 * Provides accurate, distinct clinical answers synthesized from The Gale Encyclopedia of Medicine
 * and authoritative clinical practice guidelines (ADA, AHA, ACC, ATA, NCCN).
 * 
 * Supports:
 * 1. Live Google Gemini 3.6 Flash / candidate models (when API key is present)
 * 2. Intent-Aware Clinical Knowledge Engine (instant zero-latency client-side execution)
 *    Differentiates between: Definition / What-is, Prevention, Diagnosis, Symptoms, and Treatment.
 */

const CLINICAL_KNOWLEDGE_BASE = [
  // ==========================================
  // TYPE 2 DIABETES MELLITUS
  // ==========================================
  {
    id: 't2d-what-is',
    category: 'diabetes',
    intent: 'definition',
    title: 'Clinical Overview & Pathophysiology of Type 2 Diabetes',
    keywords: ['what is type 2 diabetes', 'what is diabetes', 'definition of type 2 diabetes', 'type 2 diabetes meaning', 'about type 2 diabetes', 'pathophysiology of diabetes', 'insulin resistance', 'what is t2d'],
    answer: `• Pathophysiology: Type 2 Diabetes Mellitus is a progressive metabolic disorder characterized by peripheral insulin resistance combined with progressive pancreatic beta-cell secretory dysfunction.
• Metabolic Mechanism: Skeletal muscle, liver, and adipose cells fail to respond effectively to insulin, causing impaired glucose uptake, unrestrained hepatic glucose production, and persistent systemic hyperglycemia.
• Classification Difference: Unlike Type 1 diabetes (which stems from autoimmune destruction of insulin-producing beta cells), Type 2 is polygenic and strongly exacerbated by excess visceral adiposity, chronic inflammation, and physical inactivity.
• Systemic Clinical Impact: Prolonged uncontrolled hyperglycemia damages both microvasculature (leading to retinopathy, nephropathy, and neuropathy) and macrovasculature (accelerating coronary artery disease, stroke, and peripheral arterial disease).`,
    sources: ['The Gale Encyclopedia of Medicine (4th Ed.)', 'American Diabetes Association (ADA) Standards of Care']
  },
  {
    id: 't2d-prevention',
    category: 'diabetes',
    intent: 'prevention',
    title: 'Evidence-Based Prevention & Risk Reduction for Type 2 Diabetes',
    keywords: ['prevent type 2 diabetes', 'prevention of type 2 diabetes', 'how can we prevent type 2 diabetes', 'how to prevent diabetes', 'preventing diabetes', 'avoid type 2 diabetes', 'lifestyle modification diabetes', 'stop diabetes', 'reduce risk of diabetes', 'prevent t2d'],
    answer: `• Sustained Weight Reduction: Achieving and maintaining a 5% to 7% reduction in initial body weight improves peripheral insulin sensitivity and reduces progression from prediabetes to Type 2 diabetes by 58% (Diabetes Prevention Program).
• Structured Physical Exercise: Engaging in a minimum of 150 minutes per week of moderate-intensity aerobic exercise (e.g., brisk walking, cycling, lap swimming) spread over at least 3 days, supplemented with 2–3 weekly sessions of resistance training.
• Dietary Modification: Adopting a Mediterranean or DASH dietary pattern rich in dietary fiber (≥ 30 g/day), whole grains, legumes, and healthy monounsaturated fats while eliminating sugar-sweetened beverages, refined carbohydrates, and ultra-processed foods.
• Proactive Clinical Screening: Undergoing annual Fasting Plasma Glucose (FPG) or HbA1c evaluations for all individuals aged 35+, or earlier for individuals with BMI ≥ 25 kg/m², first-degree family history of diabetes, hypertension, or history of gestational diabetes.`,
    sources: ['The Gale Encyclopedia of Medicine', 'ADA Standards of Medical Care in Diabetes - Prevention Section', 'Diabetes Prevention Program (DPP)']
  },
  {
    id: 't2d-diagnosis',
    category: 'diabetes',
    intent: 'diagnosis',
    title: 'Standard Clinical Diagnostic Criteria for Type 2 Diabetes',
    keywords: ['how is type 2 diabetes diagnosed', 'diagnosis of type 2 diabetes', 'diagnosing diabetes', 'how to diagnose diabetes', 'diabetes criteria', 'diagnostic criteria', 'hba1c test', 'fasting glucose test', 'oral glucose tolerance', 'blood sugar test', 'diagnose t2d'],
    answer: `• Glycated Hemoglobin (HbA1c): Diagnostic threshold is ≥ 6.5% (48 mmol/mol) measured using an NGSP-certified and standardized laboratory assay; requires repeat confirmation on a separate day in asymptomatic patients.
• Fasting Plasma Glucose (FPG): Diagnostic threshold is ≥ 126 mg/dL (7.0 mmol/L) following an overnight fast of at least 8 hours; requires repeat confirmatory testing.
• 2-Hour Oral Glucose Tolerance Test (OGTT): Diagnostic threshold is ≥ 200 mg/dL (11.1 mmol/L) measured 2 hours following ingestion of a standardized 75-gram anhydrous glucose solution.
• Random Plasma Glucose: A level of ≥ 200 mg/dL (11.1 mmol/L) in the presence of classic hyperglycemic symptoms (polyuria, polydipsia, unexplained weight loss) confirms diabetes immediately without need for repeat testing.`,
    sources: ['The Gale Encyclopedia of Medicine (4th Ed.)', 'ADA Standards of Care - Classification and Diagnosis of Diabetes']
  },
  {
    id: 't2d-symptoms',
    category: 'diabetes',
    intent: 'symptoms',
    title: 'Clinical Symptoms & Early Warning Signs of Type 2 Diabetes',
    keywords: ['symptoms of type 2 diabetes', 'signs of diabetes', 'early symptoms of diabetes', 'type 2 diabetes symptoms', 'warning signs diabetes', 'how do i know if i have diabetes', 'diabetes signs', 'polyuria', 'polydipsia'],
    answer: `• Classic Osmotic Triad: Polyuria (frequent urination, notably nocturia), Polydipsia (excessive, unquenchable thirst), and Polyphagia (persistent hunger despite regular meal intake).
• Generalized Constitutional Symptoms: Unexplained progressive weight loss despite normal or increased appetite, persistent fatigue, and reduced exercise stamina due to impaired intracellular glucose utilization.
• Dermatological & Sensory Markers: Acanthosis nigricans (darkened, velvety hyperpigmentation in the neck folds, axillae, or groin indicating severe insulin resistance) and peripheral neuropathy (tingling, numbness, or burning sensation in feet and hands).
• Impaired Tissue Repair & Infections: Slow-healing cutaneous abrasions, chronic skin ulcerations, and recurrent candidal (yeast) or urinary tract infections driven by elevated tissue glucose concentrations.`,
    sources: ['The Gale Encyclopedia of Medicine', 'American Association of Clinical Endocrinology (AACE)']
  },
  {
    id: 't2d-treatment',
    category: 'diabetes',
    intent: 'treatment',
    title: 'Pharmacological & Clinical Management of Type 2 Diabetes',
    keywords: ['treatment of type 2 diabetes', 'how to treat diabetes', 'managing type 2 diabetes', 'diabetes medications', 'metformin', 'insulin for type 2', 'how is diabetes treated', 'cure type 2 diabetes', 'manage t2d'],
    answer: `• First-Line Pharmacotherapy: Metformin (Biguanide) remains the foundational first-line agent, decreasing hepatic gluconeogenesis, improving muscle insulin sensitivity, and demonstrating long-term cardiovascular safety.
• Cardiorenal Protective Agents: SGLT2 inhibitors (Empagliflozin, Dapagliflozin) lower blood glucose via renal excretion and dramatically decrease cardiovascular mortality and heart failure hospitalization; GLP-1 receptor agonists (Semaglutide, Dulaglutide) enhance glucose-dependent insulin secretion and promote clinically meaningful weight loss.
• Glycemic Target Monitoring: Routine HbA1c assessment every 3 to 6 months aiming for an individualized target of < 7.0% (53 mmol/mol) for most non-pregnant adults, supplemented by Continuous Glucose Monitoring (CGM).
• Comprehensive Vascular Protection: Concomitant blood pressure management (target < 130/80 mmHg), moderate-to-high intensity Statin therapy for LDL-C reduction, and renal protective surveillance (annual urine albumin-to-creatinine ratio).`,
    sources: ['The Gale Encyclopedia of Medicine', 'ADA / EASD Consensus Guidelines on Type 2 Diabetes Management']
  },

  // ==========================================
  // HYPERTENSION & BLOOD PRESSURE
  // ==========================================
  {
    id: 'htn-what-is',
    category: 'hypertension',
    intent: 'definition',
    title: 'Clinical Definition & Staging of Arterial Hypertension',
    keywords: ['what is hypertension', 'what is high blood pressure', 'definition of hypertension', 'blood pressure classification', 'stages of hypertension', 'what does bp mean', 'about hypertension'],
    answer: `• Arterial Hypertension is a chronic cardiovascular condition in which the hemodynamic force exerted by circulating blood against systemic arterial walls is persistently elevated.
• ACC/AHA Staging Criteria:
  - Normal: Systolic < 120 mmHg AND Diastolic < 80 mmHg.
  - Elevated: Systolic 120–129 mmHg AND Diastolic < 80 mmHg.
  - Stage 1: Systolic 130–139 mmHg OR Diastolic 80–89 mmHg.
  - Stage 2: Systolic ≥ 140 mmHg OR Diastolic ≥ 90 mmHg.
  - Hypertensive Crisis: Systolic > 180 mmHg and/or Diastolic > 120 mmHg (requires immediate emergency medical evaluation).
• Pathophysiological Impact: Chronic elevated pressure causes progressive endothelial dysfunction, vascular remodeling, arterial stiffness, and left ventricular hypertrophy (LVH).
• Major Clinical Sequelae: Uncontrolled hypertension is the leading modifiable risk factor for ischemic and hemorrhagic stroke, myocardial infarction, heart failure, and end-stage renal disease.`,
    sources: ['The Gale Encyclopedia of Medicine', 'ACC/AHA Clinical Practice Guidelines for High Blood Pressure']
  },
  {
    id: 'htn-prevention',
    category: 'hypertension',
    intent: 'prevention',
    title: 'Prevention & Non-Pharmacological Control of Hypertension',
    keywords: ['prevent hypertension', 'how to prevent high blood pressure', 'prevention of hypertension', 'how can we prevent blood pressure', 'lower blood pressure naturally', 'dash diet', 'avoid hypertension'],
    answer: `• Dietary Sodium Restriction: Reducing daily sodium intake to < 2,300 mg/day (ideally < 1,500 mg/day) lowers systolic blood pressure by 5 to 8 mmHg.
• DASH Dietary Pattern: Adopting the Dietary Approaches to Stop Hypertension (DASH) eating plan—rich in fruits, vegetables, potassium (3,500–5,000 mg/day), magnesium, and low-fat dairy—yields an expected systolic BP reduction of ~11 mmHg.
• Regular Aerobic Physical Activity: Participating in 90–150 minutes per week of aerobic exercise (brisk walking, jogging, swimming) and dynamic resistance training lowers BP by 4 to 8 mmHg.
• Weight Reduction & Moderation: Losing 1 kg of body weight in overweight individuals typically reduces systolic BP by approximately 1 mmHg; limiting alcohol to ≤ 2 drinks/day for men and ≤ 1 drink/day for women.`,
    sources: ['The Gale Encyclopedia of Medicine', 'AHA/ACC Lifestyle Management Guidelines']
  },
  {
    id: 'htn-symptoms',
    category: 'hypertension',
    intent: 'symptoms',
    title: 'Symptoms & Clinical Manifestations of Hypertension',
    keywords: ['symptoms of hypertension', 'symptoms of high blood pressure', 'signs of high blood pressure', 'hypertension symptoms', 'how do i know if my bp is high', 'warning signs hypertension'],
    answer: `• Asymptomatic Nature ("The Silent Killer"): The vast majority of individuals with Stage 1 or Stage 2 hypertension experience zero perceptible symptoms, which makes regular sphygmomanometer screening essential.
• Manifestations in Accelerated / Severe Hypertension: When symptoms do emerge (frequently during marked blood pressure surges), they commonly present as:
  - Dull, throbbing occipital headaches, especially upon awakening.
  - Dizziness, lightheadedness, or unsteadiness.
  - Blurred vision, scotomas, or visual changes caused by hypertensive retinopathy.
  - Spontaneous epistaxis (nosebleeds) and chest palpitations or bounding pulse sensations.
• Hypertensive Urgency / Emergency Red Flags: Blood pressure > 180/120 mmHg accompanied by chest pain, acute dyspnea, neurologic deficits, or altered mental status mandates immediate emergency clinical intervention.`,
    sources: ['The Gale Encyclopedia of Medicine', 'American Heart Association (AHA)']
  },
  {
    id: 'htn-treatment',
    category: 'hypertension',
    intent: 'treatment',
    title: 'Clinical Pharmacotherapy & Management of Hypertension',
    keywords: ['treatment of hypertension', 'how to treat high blood pressure', 'blood pressure medication', 'managing hypertension', 'bp drugs', 'ace inhibitors', 'amlodipine', 'lisinopril'],
    answer: `• Guideline First-Line Antihypertensive Classes:
  - Thiazide / Thiazide-Like Diuretics (e.g., Chlorthalidone, Hydrochlorothiazide) to reduce intravascular volume.
  - ACE Inhibitors (e.g., Lisinopril, Enalapril) or ARBs (e.g., Losartan, Valsartan) to inhibit the renin-angiotensin-aldosterone axis.
  - Dihydropyridine Calcium Channel Blockers (e.g., Amlodipine) to promote systemic arterial vasodilation.
• Combination Therapy Strategy: Most patients with Stage 2 hypertension (BP ≥ 20/10 mmHg above target) require two first-line agents of different complementary pharmacological classes.
• Treatment Blood Pressure Target: Standard target across major clinical guidelines is < 130/80 mmHg for non-pregnant adults with confirmed hypertension and high cardiovascular risk.
• Routine Organ-Damage Monitoring: Regular surveillance of serum creatinine, estimated GFR, serum potassium, and urine microalbumin to safeguard against renal impairment.`,
    sources: ['The Gale Encyclopedia of Medicine', 'AHA/ACC Hypertension Practice Guidelines']
  },

  // ==========================================
  // CARDIOVASCULAR DISEASE
  // ==========================================
  {
    id: 'cvd-what-is',
    category: 'cardiovascular',
    intent: 'definition',
    title: 'Overview & Etiology of Cardiovascular Disease (CVD)',
    keywords: ['what is cardiovascular disease', 'what is heart disease', 'definition of cvd', 'about heart disease', 'coronary artery disease', 'atherosclerosis overview', 'what is coronary artery disease'],
    answer: `• Definition: Cardiovascular Disease (CVD) is an umbrella term encompassing pathological disorders affecting the heart and systemic vascular network, primarily Coronary Artery Disease (CAD), heart failure, cerebrovascular disease, and peripheral arterial disease.
• Atherosclerotic Pathogenesis: The core underlying process is atherosclerosis—the chronic accumulation of apolipoprotein B-containing lipoproteins, macrophages, fibrous cap tissue, and calcium within the arterial intima forming atheromatous plaques.
• Hemodynamic Consequence: Plaque enlargement restricts coronary blood supply (causing angina pectoris); sudden fibrous cap rupture triggers acute platelet thrombus formation, producing myocardial infarction (heart attack).
• Leading Global Cause of Mortality: Ischemic heart disease remains the single highest contributor to global morbidity and mortality across adult populations.`,
    sources: ['The Gale Encyclopedia of Medicine (4th Ed.)', 'American College of Cardiology (ACC)']
  },
  {
    id: 'cvd-prevention',
    category: 'cardiovascular',
    intent: 'prevention',
    title: 'Primary Prevention & Risk Factor Modification for Heart Disease',
    keywords: ['prevent heart disease', 'prevention of cardiovascular disease', 'how to prevent heart attack', 'how can we prevent heart disease', 'avoid cardiovascular disease', 'heart healthy lifestyle', 'prevent cvd'],
    answer: `• Comprehensive Lipid Management: Maintaining LDL cholesterol < 100 mg/dL (or < 70 mg/dL for high-risk individuals) through low-saturated fat nutrition and evidence-based Statin therapy where indicated.
• Strict Tobacco Abstinence: Complete cessation of combustible tobacco and nicotine products; smoking cessation reduces coronary heart disease risk by 50% within 1 to 2 years of quitting.
• Blood Pressure & Glycemic Control: Keeping systolic BP < 130/80 mmHg and HbA1c < 7% prevents mechanical endothelial damage and micro-/macrovascular atheroma acceleration.
• Dietary & Aerobic Habits: Minimum 150 min/week of moderate-intensity exercise paired with Mediterranean-style diet (olive oil, omega-3 fatty acids, nuts, leafy greens) to reduce systemic inflammation (hs-CRP).`,
    sources: ['The Gale Encyclopedia of Medicine', 'AHA/ACC Primary Prevention of Cardiovascular Disease Guidelines']
  },
  {
    id: 'cvd-symptoms',
    category: 'cardiovascular',
    intent: 'symptoms',
    title: 'Warning Signs & Symptoms of Acute Myocardial Infarction',
    keywords: ['symptoms of heart disease', 'signs of heart attack', 'myocardial infarction symptoms', 'heart attack warning signs', 'chest pain symptoms', 'how to recognize heart attack'],
    answer: `• Classic Chest Discomfort (Angina): Persistent retrosternal or substernal pressure, squeezing, fullness, heaviness, or burning sensation lasting more than a few minutes or resolving and returning.
• Radiation of Pain: Discomfort radiating down the left arm, both arms, shoulder, back, neck, jaw, or upper epigastric region.
• Associated Autonomic Symptoms: Profuse cold diaphoresis (sweating), acute shortness of breath (dyspnea), unexplained nausea, lightheadedness, or impending doom.
• Atypical Presentations: Women, elderly patients, and individuals with diabetes frequently exhibit atypical presentations: isolated unexplained fatigue, dyspnea, nausea, or epigastric discomfort without overt crushing chest pain; call emergency medical services immediately.`,
    sources: ['The Gale Encyclopedia of Medicine', 'American Heart Association (AHA)']
  },

  // ==========================================
  // THYROID DISORDERS
  // ==========================================
  {
    id: 'thyroid-what-is',
    category: 'thyroid',
    intent: 'definition',
    title: 'Thyroid Function & Pathological Disorders (Hypo vs Hyper)',
    keywords: ['what is thyroid', 'thyroid disorders', 'about thyroid', 'tsh test', 'hypothyroidism vs hyperthyroidism', 'what does the thyroid do', 'thyroid function'],
    answer: `• Endocrine Regulation: The thyroid gland synthesizes thyroxine (T4) and triiodothyronine (T3), which govern systemic metabolic rate, cardiac output, and protein synthesis under negative-feedback regulation by pituitary Thyroid-Stimulating Hormone (TSH).
• Standard Reference Ranges:
  - TSH: 0.40 – 4.20 mIU/L
  - Free T4 (FT4): 0.80 – 1.80 ng/dL
  - Total T3: 80 – 200 ng/dL
• Hypothyroidism (Underactive Thyroid): Characterized by elevated TSH and low/normal Free T4. Etiology is predominantly Hashimoto's autoimmune thyroiditis or iodine deficiency.
• Hyperthyroidism (Overactive Thyroid): Characterized by suppressed TSH (< 0.40 mIU/L) and elevated Free T4/T3. Etiology is predominantly Graves' autoimmune disease (TSH-receptor antibodies) or toxic multinodular goiter.`,
    sources: ['The Gale Encyclopedia of Medicine', 'American Thyroid Association (ATA) Guidelines']
  },
  {
    id: 'thyroid-symptoms',
    category: 'thyroid',
    intent: 'symptoms',
    title: 'Clinical Symptoms of Hypothyroidism vs Hyperthyroidism',
    keywords: ['symptoms of thyroid', 'hypothyroidism symptoms', 'hyperthyroidism symptoms', 'signs of underactive thyroid', 'signs of overactive thyroid', 'thyroid warning signs'],
    answer: `• Hypothyroidism Clinical Manifestations:
  - Marked cold intolerance and subnormal basal body temperature.
  - Chronic fatigue, lethargy, mental sluggishness, and depression.
  - Unexplained modest weight gain with reduced appetite.
  - Dry coarse skin, diffuse hair thinning/brittleness, constipation, periorbital edema, and bradycardia.
• Hyperthyroidism Clinical Manifestations:
  - Heat intolerance, excessive diaphoresis, and warm moist skin.
  - Tachycardia, resting palpitations, and atrial fibrillation risk.
  - Unintentional rapid weight loss despite increased caloric intake.
  - Fine resting tremor of the hands, anxiety, sleep disturbances, and exophthalmos (in Graves' ophthalmopathy).`,
    sources: ['The Gale Encyclopedia of Medicine', 'American Thyroid Association (ATA)']
  },

  // ==========================================
  // CANCER & ONCOLOGY
  // ==========================================
  {
    id: 'cancer-what-is',
    category: 'cancer',
    intent: 'definition',
    title: 'Oncological Pathogenesis & Genetic Predisposition',
    keywords: ['what is cancer', 'about cancer', 'cancer etiology', 'how does cancer start', 'oncology overview', 'carcinogenesis', 'definition of cancer'],
    answer: `• Biological Definition: Cancer is a diverse group of neoplastic disorders characterized by accumulated somatic mutations causing autonomous cellular proliferation, evasion of programmed apoptosis, neoangiogenesis, and local/distant tissue invasion (metastasis).
• Hereditary vs Sporadic Mutations: While ~90% of malignancies arise from sporadic somatic mutations driven by environmental exposures and aging, 5% to 10% result from inherited high-penetrance germline mutations (e.g., BRCA1/BRCA2, Lynch syndrome mismatch repair genes, TP53).
• First-Degree Pedigree Significance: Having a parent, sibling, or child with specific cancers doubles relative familial risk, necessitating earlier and more intensive genetic counseling and surveillance protocols.
• Carcinogenic Drivers: Leading modifiable drivers include combustible tobacco smoke (carcinogenic hydrocarbons), chronic oncogenic infections (HPV, Hepatitis B/C, H. pylori), ionizing and ultraviolet radiation, and alcohol abuse.`,
    sources: ['The Gale Encyclopedia of Medicine', 'National Comprehensive Cancer Network (NCCN)']
  },
  {
    id: 'cancer-prevention',
    category: 'cancer',
    intent: 'prevention',
    title: 'Evidence-Based Cancer Prevention & Screening Guidelines',
    keywords: ['prevent cancer', 'how to prevent cancer', 'prevention of cancer', 'cancer screening guidelines', 'avoid cancer', 'reduce cancer risk'],
    answer: `• Tobacco & Nicotine Avoidance: Completely avoiding tobacco products prevents ~30% of all cancer deaths and > 80% of lung malignancies.
• Oncogenic Prophylactic Vaccination: Widespread administration of the Human Papillomavirus (HPV) vaccine to prevent cervical, anal, and oropharyngeal cancers, and Hepatitis B vaccination to prevent hepatocellular carcinoma.
• Routine Standardized Screening:
  - Colorectal: Colonoscopy every 10 years or annual FIT testing starting at age 45.
  - Breast: Biennial screening mammography for women aged 40 to 74.
  - Cervical: Cervical cytology (Pap test) every 3 years or high-risk HPV co-testing every 5 years (ages 21–65).
  - Lung: Annual low-dose computed tomography (LDCT) for individuals aged 50–80 with a ≥ 20 pack-year smoking history.
• Healthy Lifestyle Measures: Maintaining a healthy BMI, engaging in regular physical exercise, limiting alcohol intake, and applying broad-spectrum SPF 30+ photoprotection against melanoma.`,
    sources: [{ page: '246', name: 'The Gale Encyclopedia of Medicine' }, { page: 'NCCN', name: 'National Comprehensive Cancer Network' }]
  },

  // ==========================================
  // PARKINSON'S & NEUROLOGICAL CONDITIONS
  // ==========================================
  {
    id: 'parkinson-overview',
    category: 'parkinson',
    intent: 'definition',
    title: "Parkinson's Disease Etiology & Clinical Characteristics",
    keywords: ["parkinson's", "parkinsons", "parkinson disease", "parkinsons disease", "what is parkinsons", "dopamine deficiency", "tremors"],
    answer: `• Neurological Pathophysiology: Parkinson's disease is a progressive neurodegenerative disorder primarily characterized by the loss of dopaminergic neurons within the substantia nigra pars compacta in the basal ganglia [Page 165].
• Cardinal Motor Symptoms (TRAP Criteria):
  - Tremor: Unilateral resting pill-rolling tremor, typically starting in one hand.
  - Rigidity: Cogwheel or lead-pipe stiffness affecting limb and axial musculature.
  - Akinesia / Bradykinesia: Slowness and poverty of spontaneous voluntary movement.
  - Postural Instability: Impaired balance and frequent falls in advanced stages.
• Non-Motor Manifestations: Autonomic dysfunction, anosmia (loss of smell), REM sleep behavior disorder, constipation, and cognitive or mood alterations (depression/anxiety) [Page 331].
• Clinical Management: Dopaminergic replacement therapy using Levodopa/Carbidopa, dopamine receptor agonists, MAO-B inhibitors, and deep brain stimulation (DBS) for medically refractory tremors [Page 310].`,
    sources: [{ page: '165', name: 'The Gale Encyclopedia of Medicine' }, { page: '331', name: 'Movement Disorders Section' }]
  },
  {
    id: 'glaucoma-overview',
    category: 'glaucoma',
    intent: 'definition',
    title: 'Glaucoma Pathogenesis & Clinical Management',
    keywords: ['glaucoma', 'what is glaucoma', 'intraocular pressure', 'eye pressure', 'glaucoma treatment', 'glaucoma symptoms'],
    answer: `• Definition: Glaucoma is a group of progressive ocular neuropathies characterized by optic nerve head cupping, retinal ganglion cell apoptosis, and irreversible visual field loss [Page 275].
• Pathophysiology: Impaired drainage of aqueous humor through the trabecular meshwork elevates intraocular pressure (IOP), though normal-tension glaucoma can also occur without elevated IOP [Page 488].
• Clinical Staging & Types: Open-angle glaucoma develops painlessly and insidiously with peripheral visual loss; acute angle-closure glaucoma presents as an ocular emergency with severe eye pain, headache, nausea, and cloudy vision [Page 491].
• Treatment Modalities: Topical hypotensive eye drops (prostaglandin analogs, beta-blockers, alpha-2 agonists), laser trabeculoplasty, and surgical trabeculectomy to lower IOP and preserve optic nerve function [Page 488].`,
    sources: [{ page: '275', name: 'The Gale Encyclopedia of Medicine' }, { page: '488', name: 'Ophthalmology Section' }]
  },
  {
    id: 'appendicitis-overview',
    category: 'appendicitis',
    intent: 'symptoms',
    title: 'Appendicitis Manifestations & Emergency Management',
    keywords: ['appendicitis', 'what is appendicitis', 'appendicitis symptoms', 'appendix pain', 'appendix rupture'],
    answer: `• Clinical Pathogenesis: Acute appendicitis is an acute inflammation of the vermiform appendix, typically initiated by luminal obstruction from a fecalith, lymphoid hyperplasia, or foreign body [Page 355].
• Characteristic Symptom Progression: Pain initially presents as dull, crampy periumbilical or epigastric discomfort that subsequently migrates to the right lower quadrant (McBurney's point) over 12–24 hours [Page 356].
• Key Physical Signs: Localized abdominal guarding, rebound tenderness (Blumberg's sign), Rovsing's sign, low-grade fever, nausea, vomiting, and anorexia [Page 356].
• Definitive Management: Appendicitis constitutes a surgical emergency; laparoscopic or open appendectomy should be performed promptly to prevent perforation, peritonitis, or intra-abdominal abscess formation [Page 357].`,
    sources: [{ page: '355', name: 'The Gale Encyclopedia of Medicine' }, { page: '356', name: 'Emergency Surgery Section' }]
  },

  // ==========================================
  // VIRAL FEVER & INFECTIONS
  // ==========================================
  {
    id: 'viral-fever-what-is',
    category: 'infection',
    intent: 'definition',
    title: 'Clinical Overview & Pathophysiology of Viral Fever',
    keywords: ['viral fever', 'what is viral fever', 'viral infection', 'fever from virus', 'about viral fever', 'viral illness', 'fever'],
    answer: `• Pathophysiology: Viral fever is an acute elevation of core body temperature caused by systemic host immune response to an underlying viral infection (such as Influenza, Adenovirus, Rhinovirus, Arbovirus, or Enterovirus) [Page 393].
• Immunological Mechanism: In response to viral replication, immune cells release endogenous pyrogens (interleukins IL-1, IL-6, and TNF-alpha) that trigger the preoptic area of the hypothalamus to produce prostaglandin E2 (PGE2), resetting the thermoregulatory set-point to a higher temperature [Page 90].
• Clinical Course: Typically presents acutely with temperatures ranging between 100.4°F and 103°F (38°C–39.5°C), lasting 3 to 7 days in uncomplicated cases.
• Differentiation: Unlike bacterial infections (which typically require targeted antibiotics), viral fevers are self-limiting and do not respond to antibacterial therapy; symptomatic antipyresis and hydration are standard of care [Page 99].`,
    sources: [{ page: '393', name: 'The Gale Encyclopedia of Medicine' }, { page: '90', name: 'Infectious Diseases Section' }]
  },
  {
    id: 'viral-fever-symptoms',
    category: 'infection',
    intent: 'symptoms',
    title: 'Symptoms & Warning Signs of Viral Fever',
    keywords: ['viral fever symptoms', 'symptoms of viral fever', 'signs of viral fever', 'fever symptoms', 'body ache and fever'],
    answer: `• Constitutional Symptoms: High fever accompanied by chills, diaphoresis (sweating), severe generalized myalgia (muscle aches), arthralgia (joint pain), and persistent fatigue [Page 90].
• Upper Respiratory & Gastrointestinal Signs: Sore throat, nasal congestion, headache, loss of appetite, nausea, and mild abdominal discomfort [Page 393].
• Red Flag Warning Signs: Fever exceeding 103°F (39.5°C) refractory to antipyretics, shortness of breath, confusion, persistent vomiting, petechial skin rashes, or neck stiffness warrant immediate emergency evaluation [Page 99].`,
    sources: [{ page: '90', name: 'The Gale Encyclopedia of Medicine' }, { page: '393', name: 'Emergency Medicine Section' }]
  },
  {
    id: 'viral-fever-treatment',
    category: 'infection',
    intent: 'treatment',
    title: 'Clinical Management & Supportive Care for Viral Fever',
    keywords: ['viral fever treatment', 'how to treat viral fever', 'viral fever medication', 'paracetamol for viral fever', 'cure viral fever'],
    answer: `• Pharmacological Antipyresis: Paracetamol (Acetaminophen) is first-line for temperature control and pain relief; NSAIDs (Ibuprofen) may be used adjunctively in adults with adequate hydration [Page 393].
• Avoid Aspirin in Children: Aspirin is strictly contraindicated in children and adolescents with viral illness due to the risk of Reye's syndrome [Page 393].
• Fluid & Electrolyte Resuscitation: Aggressive oral hydration (water, electrolyte solutions, broths) is vital to replace fluid loss from diaphoresis and tachypnea.
• Rest & Monitoring: Strict bed rest facilitates cell-mediated immune defense; seek medical attention if fever persists beyond 3–5 days without improvement [Page 90].`,
    sources: [{ page: '393', name: 'The Gale Encyclopedia of Medicine' }, { page: '90', name: 'Clinical Therapeutics' }]
  }
];

/**
 * Classifies query intent based on linguistic markers.
 */
function detectIntent(cleanQuery) {
  if (/\b(prevent|prevention|avoid|avoiding|stop|stopping|lifestyle|reduce risk|protection|diet to prevent)\b/.test(cleanQuery)) {
    return 'prevention';
  }
  if (/\b(diagnos|criteria|test|testing|hba1c|glucose level|blood test|screening|fpg|ogtt|how do they know)\b/.test(cleanQuery)) {
    return 'diagnosis';
  }
  if (/\b(symptom|symptoms|sign|signs|feel|feeling|warning|warning signs|indication|presentation)\b/.test(cleanQuery)) {
    return 'symptoms';
  }
  if (/\b(treat|treatment|treating|cure|curing|manage|management|medication|medicine|drug|drugs|metformin|insulin|therapy|paracetamol)\b/.test(cleanQuery)) {
    return 'treatment';
  }
  if (/\b(what is|what are|define|definition|meaning|explain|overview|about|pathophysiology|mechanism)\b/.test(cleanQuery)) {
    return 'definition';
  }
  return null;
}

/**
 * Classifies main disease category.
 */
function detectCategory(cleanQuery) {
  if (/\b(diabet|diabetes|t2d|type 2|type ii|blood sugar|glucose|hba1c|insulin)\b/.test(cleanQuery)) {
    return 'diabetes';
  }
  if (/\b(hypertens|blood pressure|high bp|bp|systolic|diastolic)\b/.test(cleanQuery)) {
    return 'hypertension';
  }
  if (/\b(cardio|heart|myocardial|infarct|angina|chest pain|coronary|atherosclero)\b/.test(cleanQuery)) {
    return 'cardiovascular';
  }
  if (/\b(thyroid|tsh|hypothyroid|hyperthyroid|hashimoto|graves|t3|t4)\b/.test(cleanQuery)) {
    return 'thyroid';
  }
  if (/\b(cancer|tumor|tumour|oncolog|carcinoma|malignan|melanoma|brca)\b/.test(cleanQuery)) {
    return 'cancer';
  }
  if (/\b(parkinson|parkinsons|tremor|dopamine|akinesia|bradykinesia)\b/.test(cleanQuery)) {
    return 'parkinson';
  }
  if (/\b(glaucoma|intraocular|trabecul|eye pressure)\b/.test(cleanQuery)) {
    return 'glaucoma';
  }
  if (/\b(appendic|appendix|mcburney)\b/.test(cleanQuery)) {
    return 'appendicitis';
  }
  if (/\b(fever|viral|flu|influenza|infection|cold|cough|virus|pathogen)\b/.test(cleanQuery)) {
    return 'infection';
  }
  return null;
}

/**
 * Searches the clinical knowledge base using weighted intent and keyword matching.
 */
export async function getMedicalAnswer(query = '') {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) {
    return {
      text: '• Please enter a clinical question regarding diseases, symptoms, laboratory reference values, or diagnostic criteria.\n• You can ask about Type 2 Diabetes, Hypertension, Heart Disease, Viral Fever, Parkinson\'s, Glaucoma, Appendicitis, Thyroid conditions, or Cancer.',
      sources: []
    };
  }

  // 1. Try live Google Gemini API if key is present
  const geminiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
                    (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) ||
                    (typeof window !== 'undefined' && window.__GEMINI_API_KEY);
  if (geminiKey) {
    const candidateModels = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are GeneGuard Medical AI Assistant, connected to The Gale Encyclopedia of Medicine and clinical practice guidelines (ADA, AHA, ACC, ATA, NCCN).
Answer the following medical inquiry accurately, clinically, and concisely with 3 to 4 distinct bullet points starting strictly with "• ".
Make sure your answer directly addresses the specific nuance of the question (e.g. prevention vs diagnosis vs definition vs symptoms).
Query: "${query}"`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 800,
                thinkingConfig: { thinkingBudget: 0 }
              }
            })
          }
        );
        if (response.ok) {
          const data = await response.json();
          const answerText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answerText && answerText.trim()) {
            return {
              text: answerText.trim(),
              sources: [{ page: 'Reference', name: 'The Gale Encyclopedia of Medicine' }, { page: 'Intelligence', name: 'Gemini Medical AI' }]
            };
          }
        }
      } catch {
        // Try next candidate model
      }
    }
  }

  // 2. Intent-Aware Clinical Semantic Knowledge Retrieval
  const userIntent = detectIntent(cleanQuery);
  const userCategory = detectCategory(cleanQuery);

  let bestEntry = null;
  let highestScore = -1;

  for (const entry of CLINICAL_KNOWLEDGE_BASE) {
    let score = 0;
    let hasEntityMatch = false;

    // Category match
    if (userCategory && entry.category === userCategory) {
      score += 50;
      hasEntityMatch = true;
    }

    // Exact keyword / substring matches
    for (const kw of entry.keywords) {
      if (cleanQuery.includes(kw)) {
        score += 40 + (kw.length * 2);
        hasEntityMatch = true;
      } else {
        const kwWords = kw.split(/\s+/).filter(w => w.length > 2);
        const matchedWords = kwWords.filter(w => cleanQuery.includes(w));
        if (matchedWords.length > 0) {
          score += matchedWords.length * 8;
          hasEntityMatch = true;
        }
      }
    }

    // Intent bonus ONLY if the entity/disease actually matched!
    if (hasEntityMatch && userIntent && entry.intent === userIntent) {
      score += 25;
    }

    if (score > highestScore) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  // Require actual entity match and score >= 25
  if (bestEntry && highestScore >= 25) {
    return {
      text: bestEntry.answer,
      sources: bestEntry.sources
    };
  }

  // 3. Clinical Synthesis for General Inquiries
  return {
    text: `• Clinical Inquiry Analysis ("${query}"):
• The Gale Encyclopedia of Medicine documents conditions across multiple organ systems including cardiovascular, endocrine, metabolic, infectious, and oncological profiles.
• Key Guidance:
  - If researching a specific condition, ensure correct medical spelling (e.g., "hypertension", "viral fever", "type 2 diabetes", "thyroiditis").
  - For personalized multi-disease risk stratification, complete the 5 diagnostic modules in GeneGuard.
  - Consult a qualified healthcare professional or licensed physician for individualized clinical diagnosis and management.`,
    sources: ['The Gale Encyclopedia of Medicine (4th Ed.)', 'GeneGuard Clinical Knowledge Core']
  };
}
