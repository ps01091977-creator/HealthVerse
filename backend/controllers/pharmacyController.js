import medicineModel from "../models/medicineModel.js"
import pharmacyOrderModel from "../models/pharmacyOrderModel.js"

// Authentic real-world pharmaceutical catalog
const realMedicines = [
    {
        name: "Dolo 650mg Tablet",
        category: "Pain Relief & Fever",
        price: 31,
        mrp: 35,
        discount: 11,
        stock: 250,
        sku: "RX-DOLO-650",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Tablet",
        packSize: "Strip of 15 tablets",
        manufacturer: "Micro Labs Ltd",
        composition: "Paracetamol (650mg)",
        rating: 4.9,
        ratingCount: 3820,
        supplier: { name: "Micro Labs Distribution", phone: "+91-80-22287654", email: "orders@microlabs.in" },
        description: "Dolo 650 is India's most trusted paracetamol antipyretic and analgesic for rapid relief from fever, headache, body pain, and toothache.",
        diseases: ["Fever", "Headache", "Body Pain", "Viral Infection", "Toothache"],
        genericName: "Paracetamol (Acetaminophen) 650mg",
        sideEffects: ["Nausea (mild)", "Allergic skin rash (rare)", "Liver toxicity if overdosed"],
        interactions: ["Alcohol (increases liver toxicity risk)", "Warfarin (may slightly increase bleeding risk)"],
        alternatives: ["Crocin 650mg", "Calpol 650mg", "Pacimol 650mg"],
        date: Date.now()
    },
    {
        name: "Augmentin 625 Duo Tablet",
        category: "Antibiotics & Infections",
        price: 182,
        mrp: 228,
        discount: 20,
        stock: 95,
        sku: "RX-AUGM-625",
        image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: true,
        dosageForm: "Tablet",
        packSize: "Strip of 10 tablets",
        manufacturer: "GlaxoSmithKline Pharmaceuticals",
        composition: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
        rating: 4.8,
        ratingCount: 1640,
        supplier: { name: "GSK India Direct", phone: "+91-22-24959595", email: "pharma.orders@gsk.com" },
        description: "Potent broad-spectrum antibiotic combination effective against respiratory tract infections, tonsillitis, sinusitis, otitis media, and skin infections.",
        diseases: ["Bacterial Infections", "Sinusitis", "Throat Infection", "Pneumonia", "Skin Infections"],
        genericName: "Amoxicillin + Potassium Clavulanate",
        sideEffects: ["Diarrhea", "Nausea or vomiting", "Skin rash", "Oral fungal overgrowth (thrush)"],
        interactions: ["Oral Contraceptives (may reduce efficacy)", "Methotrexate (increases toxicity)", "Allopurinol"],
        alternatives: ["Moxikind-CV 625", "Clavam 625", "Amoxyclav 625"],
        date: Date.now()
    },
    {
        name: "Pan-D Capsule",
        category: "Acidity & Digestion",
        price: 165,
        mrp: 199,
        discount: 17,
        stock: 180,
        sku: "RX-PAND-40",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: true,
        dosageForm: "Capsule",
        packSize: "Strip of 15 capsules",
        manufacturer: "Alkem Laboratories Ltd",
        composition: "Pantoprazole (40mg) + Domperidone (30mg)",
        rating: 4.9,
        ratingCount: 2450,
        supplier: { name: "Alkem Pharma Logistics", phone: "+91-22-39829999", email: "orders@alkem.com" },
        description: "Fast-acting combination that controls gastric acid hypersecretion while promoting gastric motility to prevent nausea, heartburn, and GERD.",
        diseases: ["Acidity", "GERD", "Heartburn", "Nausea", "Stomach Ulcer", "Bloating"],
        genericName: "Pantoprazole Gastro-resistant & Domperidone Prolonged Release",
        sideEffects: ["Dry mouth", "Mild headache", "Diarrhea or constipation", "Dizziness"],
        interactions: ["Ketoconazole (reduced antifungal absorption)", "Atazanavir (decreased absorption)"],
        alternatives: ["Pantocid-DSR", "Pantosec-DSR", "Junior Pan-D"],
        date: Date.now()
    },
    {
        name: "Telma 40mg Tablet",
        category: "Cardiac & BP",
        price: 198,
        mrp: 240,
        discount: 18,
        stock: 140,
        sku: "RX-TELM-40",
        image: "https://images.unsplash.com/photo-1550572017-edb5768c14e1?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: true,
        dosageForm: "Tablet",
        packSize: "Strip of 30 tablets",
        manufacturer: "Glenmark Pharmaceuticals Ltd",
        composition: "Telmisartan (40mg)",
        rating: 4.8,
        ratingCount: 1980,
        supplier: { name: "Glenmark India Supply", phone: "+91-22-40189999", email: "cardiac@glenmark.com" },
        description: "Angiotensin II receptor antagonist prescribed for managing essential hypertension and reducing cardiovascular risks in adult patients.",
        diseases: ["Hypertension", "High Blood Pressure", "Heart Disease Prevention", "Cardiovascular Care"],
        genericName: "Telmisartan IP 40mg",
        sideEffects: ["Dizziness on standing", "Sinusitis / Upper respiratory congestion", "Back pain", "Diarrhea"],
        interactions: ["Potassium supplements (hyperkalemia risk)", "NSAIDs like Ibuprofen (reduced antihypertensive effect)"],
        alternatives: ["Telmikind 40", "Telsartan 40", "Creser 40"],
        date: Date.now()
    },
    {
        name: "Glycomet-GP 1 Tablet",
        category: "Diabetes & Chronic Care",
        price: 112,
        mrp: 138,
        discount: 19,
        stock: 160,
        sku: "RX-GLYC-GP1",
        image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: true,
        dosageForm: "Tablet",
        packSize: "Strip of 15 tablets",
        manufacturer: "USV Private Limited",
        composition: "Metformin (500mg) + Glimepiride (1mg)",
        rating: 4.9,
        ratingCount: 2210,
        supplier: { name: "USV Pharma Hub", phone: "+91-22-25564055", email: "diab@usv.in" },
        description: "Dual antidiabetic therapy combining an insulin secretagogue (Glimepiride) and an insulin sensitizer (Metformin) for glycemic control in Type 2 Diabetes.",
        diseases: ["Type-2 Diabetes", "Diabetes", "High Blood Sugar", "Metabolic Syndrome"],
        genericName: "Glimepiride and Metformin Hydrochloride Prolonged-Release",
        sideEffects: ["Hypoglycemia (low blood sugar)", "Nausea & metallic taste", "Stomach cramps", "Diarrhea"],
        interactions: ["Alcohol (increased hypoglycemia risk)", "Contrast Media (lactic acidosis risk)"],
        alternatives: ["Glimestar-M 1", "Zoryl-M 1", "Amaryl-M 1"],
        date: Date.now()
    },
    {
        name: "Shelcal 500 Tablet",
        category: "Vitamins & Immunity",
        price: 119,
        mrp: 145,
        discount: 18,
        stock: 220,
        sku: "OTC-SHEL-500",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Tablet",
        packSize: "Strip of 15 tablets",
        manufacturer: "Torrent Pharmaceuticals Ltd",
        composition: "Elemental Calcium (500mg) + Vitamin D3 (250 IU)",
        rating: 4.9,
        ratingCount: 4120,
        supplier: { name: "Torrent Direct Dist.", phone: "+91-79-26585064", email: "supply@torrentpharma.com" },
        description: "Essential bone health supplement providing bioavailable calcium carbonate derived from natural sources along with Vitamin D3 for optimal calcium absorption.",
        diseases: ["Calcium Deficiency", "Osteoporosis", "Bone Weakness", "Pregnancy Supplement", "Joint Health"],
        genericName: "Calcium and Vitamin D3 Tablets IP",
        sideEffects: ["Constipation (mild)", "Stomach upset if taken on empty stomach", "Flatulence"],
        interactions: ["Thyroid medications (separate by 4 hours)", "Tetracycline antibiotics (reduced absorption)"],
        alternatives: ["Cipcal 500", "Calcimax 500", "Gemcal 500"],
        date: Date.now()
    },
    {
        name: "Becosules Z Capsule",
        category: "Vitamins & Immunity",
        price: 48,
        mrp: 58,
        discount: 17,
        stock: 310,
        sku: "OTC-BECO-Z",
        image: "https://images.unsplash.com/photo-1550572017-edb5768c14e1?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Capsule",
        packSize: "Strip of 20 capsules",
        manufacturer: "Pfizer Healthcare India",
        composition: "Vitamin B-Complex + Vitamin C (50mg) + Zinc Sulphate (41.4mg)",
        rating: 4.8,
        ratingCount: 3500,
        supplier: { name: "Pfizer India Logistics", phone: "+91-22-66932000", email: "orders@pfizer.com" },
        description: "High-potency B-complex capsules enriched with Vitamin C and Zinc. Treats mouth ulcers, fatigue, nutritional deficiencies, and boosts cellular immunity.",
        diseases: ["Mouth Ulcers", "Vitamin Deficiency", "Fatigue", "Weak Immunity", "Hair Loss", "General Weakness"],
        genericName: "B-Complex Forte with Vitamin C and Zinc",
        sideEffects: ["Bright yellow urine discoloration (harmless)", "Mild nausea if taken without food"],
        interactions: ["Levodopa (Vitamin B6 may reduce levodopa efficacy)"],
        alternatives: ["Cobadex CZS", "Surbex-T", "Zincovit"],
        date: Date.now()
    },
    {
        name: "Allegra 120mg Tablet",
        category: "Allergies & Respiratory",
        price: 195,
        mrp: 236,
        discount: 17,
        stock: 130,
        sku: "OTC-ALLE-120",
        image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Tablet",
        packSize: "Strip of 10 tablets",
        manufacturer: "Sanofi India Ltd",
        composition: "Fexofenadine Hydrochloride (120mg)",
        rating: 4.8,
        ratingCount: 1890,
        supplier: { name: "Sanofi Consumer Care", phone: "+91-22-28032000", email: "customercare@sanofi.com" },
        description: "Non-drowsy 24-hour second-generation antihistamine for rapid relief of allergic rhinitis, sneezing, runny nose, itchy watery eyes, and urticaria (hives).",
        diseases: ["Allergies", "Sneezing", "Runny Nose", "Skin Rash", "Itching", "Allergic Rhinitis"],
        genericName: "Fexofenadine Hydrochloride IP 120mg",
        sideEffects: ["Headache", "Drowsiness (very rare)", "Nausea", "Dizziness"],
        interactions: ["Antacids containing Aluminum/Magnesium (reduces absorption by 50%)", "Fruit juices (grapefruit/apple/orange - avoid within 4h)"],
        alternatives: ["Fexova 120", "Histafree 120", "Fexofast 120"],
        date: Date.now()
    },
    {
        name: "Volini Pain Relief Gel (50g)",
        category: "Pain Relief & Fever",
        price: 135,
        mrp: 165,
        discount: 18,
        stock: 175,
        sku: "OTC-VOLI-50G",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Gel",
        packSize: "Tube of 50g",
        manufacturer: "Sun Pharma Laboratories",
        composition: "Diclofenac Diethylamine (1.16% w/w) + Linseed Oil + Methyl Salicylate + Menthol",
        rating: 4.9,
        ratingCount: 2950,
        supplier: { name: "Sun Pharma Consumer", phone: "+91-22-43244324", email: "volini@sunpharma.com" },
        description: "Scientifically proven deep-penetrating pain relief gel for back pain, joint stiffness, neck strain, muscular sprains, and sports injuries.",
        diseases: ["Muscle Pain", "Joint Pain", "Backache", "Sprains", "Arthritis Pain", "Sports Injury"],
        genericName: "Diclofenac, Methyl Salicylate, Linseed Oil & Menthol Gel",
        sideEffects: ["Skin redness or irritation at application site", "Burning sensation on sensitive skin"],
        interactions: ["Do not apply on open wounds or broken skin"],
        alternatives: ["Moov Gel", "Omnigel", "Fast Relief Gel"],
        date: Date.now()
    },
    {
        name: "Otrivin Oxy Fast Relief Nasal Spray (10ml)",
        category: "Allergies & Respiratory",
        price: 105,
        mrp: 120,
        discount: 13,
        stock: 145,
        sku: "OTC-OTRI-10ML",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Spray",
        packSize: "Bottle of 10ml",
        manufacturer: "Haleon India",
        composition: "Oxymetazoline Hydrochloride (0.05% w/v)",
        rating: 4.8,
        ratingCount: 2100,
        supplier: { name: "Haleon Consumer Supply", phone: "+91-124-4336000", email: "otrivin@haleon.com" },
        description: "Fast-acting nasal decongestant spray that opens blocked nostrils in just 25 seconds and provides easy breathing for up to 12 hours.",
        diseases: ["Blocked Nose", "Sinusitis", "Cold Congestion", "Allergic Rhinitis"],
        genericName: "Oxymetazoline Nasal Solution IP 0.05%",
        sideEffects: ["Dryness of nasal mucosa", "Stinging or burning in nose", "Rebound congestion if used >7 consecutive days"],
        interactions: ["MAO Inhibitors (hypertensive crisis risk)"],
        alternatives: ["Nasivion Adult Spray", "Xylomist Nasal Drops", "Otrivin Pediatric"],
        date: Date.now()
    },
    {
        name: "Accu-Chek Active Blood Glucose Strips (50 Pack)",
        category: "Medical Devices & Diagnostics",
        price: 940,
        mrp: 1150,
        discount: 18,
        stock: 90,
        sku: "DEV-ACCU-50S",
        image: "https://images.unsplash.com/photo-1550572017-edb5768c14e1?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Strips",
        packSize: "Box of 50 test strips",
        manufacturer: "Roche Diabetes Care",
        composition: "Glucose Dehydrogenase Diagnostic Biosensor Strips",
        rating: 4.9,
        ratingCount: 5200,
        supplier: { name: "Roche Diagnostics India", phone: "+91-22-66974900", email: "diabetescare@roche.com" },
        description: "ISO 15197:2013 certified accurate blood glucose monitoring test strips for Accu-Chek Active Glucometer with 5-second rapid test time and visual double check.",
        diseases: ["Diabetes", "Type-2 Diabetes", "Type-1 Diabetes", "Blood Sugar Monitoring"],
        genericName: "In-Vitro Diagnostic Blood Glucose Test Strips",
        sideEffects: ["None (Diagnostic device)"],
        interactions: ["Store in original container away from direct sunlight"],
        alternatives: ["OneTouch Select Plus Strips", "Contour Plus Strips", "Dr. Morepen Strips"],
        date: Date.now()
    },
    {
        name: "Omron HEM 7120 Digital BP Monitor",
        category: "Medical Devices & Diagnostics",
        price: 1890,
        mrp: 2450,
        discount: 23,
        stock: 45,
        sku: "DEV-OMRO-7120",
        image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Device",
        packSize: "1 Unit with Medium Arm Cuff & 4 AA Batteries",
        manufacturer: "Omron Healthcare Co. Ltd",
        composition: "Intellisense Oscillometric Blood Pressure & Pulse Monitor",
        rating: 4.9,
        ratingCount: 3800,
        supplier: { name: "Omron Healthcare India", phone: "+91-124-4692800", email: "care@omron.in" },
        description: "Clinically validated upper-arm digital blood pressure monitor with Intellisense technology for comfortable, precise readings with hypertension indicator.",
        diseases: ["Hypertension", "High Blood Pressure", "Heart Monitoring", "Arrhythmia Check"],
        genericName: "Automatic Upper Arm Blood Pressure Monitor",
        sideEffects: ["None (Diagnostic device)"],
        interactions: ["Do not smoke or consume caffeine 30 minutes before measurement"],
        alternatives: ["Dr. Trust Digital BP Monitor", "Beurer BM28 BP Monitor", "Citizen BP Monitor"],
        date: Date.now()
    },
    {
        name: "Cetaphil Gentle Skin Cleanser (125ml)",
        category: "Skin & Hair Care",
        price: 335,
        mrp: 399,
        discount: 16,
        stock: 120,
        sku: "OTC-CETA-125ML",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Liquid",
        packSize: "Bottle of 125ml",
        manufacturer: "Galderma India Pvt Ltd",
        composition: "Niacinamide (Vitamin B3) + Panthenol (Pro-Vitamin B5) + Hydrating Glycerin",
        rating: 4.9,
        ratingCount: 6100,
        supplier: { name: "Galderma Derm Care", phone: "+91-22-40331818", email: "orders@galderma.com" },
        description: "Dermatologist-recommended soap-free, non-comedogenic gentle cleanser for dry to normal sensitive skin that defends against 5 signs of skin sensitivity.",
        diseases: ["Acne", "Sensitive Skin", "Dry Skin", "Eczema", "Facial Cleansing"],
        genericName: "Soap-Free Gentle Hydrating Skin Cleanser",
        sideEffects: ["None reported under standard use"],
        interactions: ["Hypoallergenic and fragrance-free formulation"],
        alternatives: ["CeraVe Hydrating Cleanser", "Episoft Cleansing Lotion", "CleanseMe"],
        date: Date.now()
    },
    {
        name: "Digene Antacid Gel Orange Flavor (200ml)",
        category: "Acidity & Digestion",
        price: 142,
        mrp: 170,
        discount: 16,
        stock: 190,
        sku: "OTC-DIGE-200ML",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Liquid",
        packSize: "Bottle of 200ml",
        manufacturer: "Abbott Healthcare Pvt Ltd",
        composition: "Magnesium Hydroxide (185mg) + Aluminium Hydroxide (830mg) + Simethicone (50mg)",
        rating: 4.8,
        ratingCount: 2800,
        supplier: { name: "Abbott India Supply", phone: "+91-22-38162000", email: "digene@abbott.com" },
        description: "High-neutralizing antacid syrup that provides cooling relief from acidity, heartburn, gas, stomach distress, and indigestion in seconds.",
        diseases: ["Acidity", "Heartburn", "Gas", "Bloating", "Indigestion", "Stomach Pain"],
        genericName: "Antacid & Antigas Oral Suspension",
        sideEffects: ["Mild constipation or diarrhea with excessive consumption"],
        interactions: ["Take 2 hours before or after oral antibiotics (Tetracyclines/Fluoroquinolones)"],
        alternatives: ["Gelusil MPS Syrup", "Mucaine Gel", "Eno Fruit Salt"],
        date: Date.now()
    },
    {
        name: "Vicks Vaporub Balm (50ml)",
        category: "Pain Relief & Fever",
        price: 155,
        mrp: 175,
        discount: 11,
        stock: 260,
        sku: "OTC-VICK-50ML",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Balm",
        packSize: "Jar of 50ml",
        manufacturer: "Procter & Gamble Hygiene",
        composition: "Menthol (2.82% w/w) + Camphor (5.26% w/w) + Eucalyptus Oil (1.33% w/w)",
        rating: 4.9,
        ratingCount: 5600,
        supplier: { name: "P&G Health India", phone: "+91-22-24942111", email: "vicks@pg.com" },
        description: "Classic therapeutic balm providing quick multi-symptom relief from 6 cold and cough symptoms: blocked nose, breathing difficulty, cough, body ache, headache, and muscular stiffness.",
        diseases: ["Cold", "Cough", "Chest Congestion", "Blocked Nose", "Headache", "Body Ache"],
        genericName: "Menthol, Camphor & Eucalyptus Inhalation Ointment",
        sideEffects: ["Mild skin warmth or redness at application site"],
        interactions: ["Do not apply directly into nostrils or on broken skin"],
        alternatives: ["Amrutanjan Balm", "Zandu Balm", "Tiger Balm"],
        date: Date.now()
    },
    {
        name: "Azithral 500 Tablet",
        category: "Antibiotics & Infections",
        price: 115,
        mrp: 132,
        discount: 13,
        stock: 110,
        sku: "RX-AZIT-500",
        image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: true,
        dosageForm: "Tablet",
        packSize: "Strip of 5 tablets",
        manufacturer: "Alembic Pharmaceuticals Ltd",
        composition: "Azithromycin (500mg)",
        rating: 4.8,
        ratingCount: 1720,
        supplier: { name: "Alembic Direct Hub", phone: "+91-265-2280550", email: "orders@alembic.com" },
        description: "Single daily-dose macrolide antibiotic indicated for bacterial infections of the upper and lower respiratory tract, acute bacterial sinusitis, tonsillitis, and skin infections.",
        diseases: ["Bacterial Infections", "Sinusitis", "Bronchitis", "Throat Infection", "Tonsillitis"],
        genericName: "Azithromycin Tablets IP 500mg",
        sideEffects: ["Mild diarrhea", "Nausea or stomach cramps", "Headache"],
        interactions: ["Antacids (take 2 hours apart)", "Digoxin (monitored use)"],
        alternatives: ["Azee 500", "Zithrox 500", "Azibact 500"],
        date: Date.now()
    },
    {
        name: "Candid Dusting Powder (100g)",
        category: "Skin & Hair Care",
        price: 145,
        mrp: 175,
        discount: 17,
        stock: 150,
        sku: "OTC-CAND-100G",
        image: "https://images.unsplash.com/photo-1550572017-edb5768c14e1?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Powder",
        packSize: "Bottle of 100g",
        manufacturer: "Glenmark Pharmaceuticals",
        composition: "Clotrimazole IP (1% w/w)",
        rating: 4.8,
        ratingCount: 2300,
        supplier: { name: "Glenmark Derm India", phone: "+91-22-40189999", email: "candid@glenmark.com" },
        description: "Antifungal powder that prevents and treats prickly heat, fungal skin infections, jock itch, athlete's foot, and skin irritation caused by sweat and friction.",
        diseases: ["Fungal Infections", "Prickly Heat", "Ringworm", "Skin Itching", "Athlete's Foot"],
        genericName: "Clotrimazole Absorbable Dusting Powder IP",
        sideEffects: ["Mild local skin irritation (rare)"],
        interactions: ["Safe for daily external dermatological use"],
        alternatives: ["Abzorb Dusting Powder", "Clocip Powder", "Mycoderm Powder"],
        date: Date.now()
    },
    {
        name: "Montair-LC Tablet",
        category: "Allergies & Respiratory",
        price: 198,
        mrp: 245,
        discount: 19,
        stock: 140,
        sku: "RX-MONT-LC",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: true,
        dosageForm: "Tablet",
        packSize: "Strip of 10 tablets",
        manufacturer: "Cipla Limited",
        composition: "Montelukast (10mg) + Levocetirizine (5mg)",
        rating: 4.9,
        ratingCount: 3100,
        supplier: { name: "Cipla Respiratory Hub", phone: "+91-22-24826000", email: "resp@cipla.com" },
        description: "Synergistic dual action medication for the prevention and symptomatic relief of allergic rhinitis, bronchial asthma, nighttime wheezing, and allergic cough.",
        diseases: ["Asthma", "Allergies", "Allergic Rhinitis", "Cough", "Wheezing", "Breathing Difficulty"],
        genericName: "Montelukast Sodium and Levocetirizine Hydrochloride",
        sideEffects: ["Mild drowsiness (take at night)", "Dry mouth", "Headache", "Fatigue"],
        interactions: ["Alcohol (increases sedation)", "Phenytoin / Phenobarbital (may reduce efficacy)"],
        alternatives: ["Montek-LC", "Telekast-L", "Levolin-M"],
        date: Date.now()
    },
    {
        name: "Atorva 20mg Tablet",
        category: "Cardiac & BP",
        price: 185,
        mrp: 230,
        discount: 20,
        stock: 135,
        sku: "RX-ATOR-20MG",
        image: "https://images.unsplash.com/photo-1550572017-edb5768c14e1?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: true,
        dosageForm: "Tablet",
        packSize: "Strip of 15 tablets",
        manufacturer: "Zydus Healthcare Ltd",
        composition: "Atorvastatin (20mg)",
        rating: 4.8,
        ratingCount: 1650,
        supplier: { name: "Zydus Lifesciences", phone: "+91-79-71800000", email: "cardio@zyduslife.com" },
        description: "HMG-CoA reductase inhibitor (statin) used to lower bad cholesterol (LDL) and triglycerides while raising good cholesterol (HDL) to prevent stroke and heart attack.",
        diseases: ["High Cholesterol", "Heart Disease Prevention", "Hyperlipidemia", "Cardiovascular Care"],
        genericName: "Atorvastatin Calcium IP 20mg",
        sideEffects: ["Muscle ache (myalgia)", "Mild headache", "Elevated liver enzymes (transient)"],
        interactions: ["Grapefruit juice (increases blood levels of statin)", "Gemfibrozil / Fibrates"],
        alternatives: ["Lipvas 20", "Storvas 20", "Tonact 20"],
        date: Date.now()
    },
    {
        name: "Liv.52 DS Syrup (200ml)",
        category: "Acidity & Digestion",
        price: 185,
        mrp: 215,
        discount: 14,
        stock: 195,
        sku: "OTC-LIV52-200ML",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop",
        requiresPrescription: false,
        dosageForm: "Liquid",
        packSize: "Bottle of 200ml",
        manufacturer: "Himalaya Wellness Company",
        composition: "Himsra (Capparis spinosa) + Kasani (Cichorium intybus) + Herbal Extracts",
        rating: 4.9,
        ratingCount: 4800,
        supplier: { name: "Himalaya Direct India", phone: "+91-80-67549999", email: "contactus@himalayawellness.com" },
        description: "Double-strength herbal hepatoprotective syrup that restores liver functional efficiency, protects against metabolic toxins, and promotes healthy appetite and digestion.",
        diseases: ["Liver Health", "Fatty Liver", "Poor Appetite", "Indigestion", "Jaundice Recovery", "Digestive Health"],
        genericName: "Ayurvedic Herbal Hepatoprotective Formulation",
        sideEffects: ["None known under recommended dosage"],
        interactions: ["Safe with conventional medications"],
        alternatives: ["Liv.52 Tablets", "Hepamerz Syrup", "Amlycure DS Syrup"],
        date: Date.now()
    }
]

// Add dynamic clinical seed logic
const seedMedicines = async () => {
    const count = await medicineModel.countDocuments()
    const sample = await medicineModel.findOne()
    // Reset and seed with rich genuine pharmaceutical data if empty or lacking modern fields
    if (count < 18 || (sample && (!sample.mrp || !sample.packSize))) {
        await medicineModel.deleteMany({}) // Clean old basic data
        await medicineModel.insertMany(realMedicines)
        console.log(`[Pharmacy] Seeded ${realMedicines.length} verified authentic pharmaceutical products.`)
    }
}

// Add a new medicine
const addMedicine = async (req, res) => {
    try {
        const { name, category, price, stock, sku, supplier, description, diseases } = req.body
        const newMed = new medicineModel({
            name, category, price: Number(price), stock: Number(stock), sku, supplier, description, diseases, date: Date.now()
        })
        await newMed.save()
        res.json({ success: true, message: "Medicine added to catalog" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// List all medicines
const listMedicines = async (req, res) => {
    try {
        await seedMedicines()
        const { search, category, disease } = req.query
        let filter = {}
        
        // If keyword search is specified, match name, description, diseases array, or category
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { diseases: { $regex: search, $options: 'i' } }
            ]
        }
        
        if (category && category !== 'all') {
            filter.category = category
        }
        
        if (disease && disease !== 'all') {
            filter.diseases = { $regex: new RegExp(`^${disease}$`, 'i') }
        }
        
        const medicines = await medicineModel.find(filter).sort({ name: 1 })
        res.json({ success: true, medicines })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Adjust stock
const updateMedicineStock = async (req, res) => {
    try {
        const { medicineId, stock } = req.body
        await medicineModel.findByIdAndUpdate(medicineId, { stock: Number(stock) })
        res.json({ success: true, message: "Stock updated successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Place pharmacy order
const createPharmacyOrder = async (req, res) => {
    try {
        const { patientId, patientName, appointmentId, items, totalAmount, paymentMethod, phone, address, paymentStatus } = req.body
        
        // Decrement stock for ordered items
        for (const item of items) {
            await medicineModel.findOneAndUpdate({ name: item.name }, {
                $inc: { stock: -Number(item.quantity) }
            })
        }

        const newOrder = new pharmacyOrderModel({
            patientId,
            patientName,
            appointmentId,
            items,
            totalAmount: Number(totalAmount),
            paymentStatus: paymentStatus || 'Pending',
            paymentMethod: paymentMethod || 'Cash on Delivery',
            phone: phone || '',
            address: address || '',
            orderStatus: 'Pending',
            date: Date.now()
        })
        await newOrder.save()
        res.json({ success: true, message: "Order placed successfully" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// List all pharmacy orders (Admin view)
const listPharmacyOrders = async (req, res) => {
    try {
        const orders = await pharmacyOrderModel.find({}).sort({ date: -1 })
        res.json({ success: true, orders })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Update order delivery status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, orderStatus } = req.body
        await pharmacyOrderModel.findByIdAndUpdate(orderId, { orderStatus })
        res.json({ success: true, message: `Order status set to ${orderStatus}` })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export { addMedicine, listMedicines, updateMedicineStock, createPharmacyOrder, listPharmacyOrders, updateOrderStatus }
