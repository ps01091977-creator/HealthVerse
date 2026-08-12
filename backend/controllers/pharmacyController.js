import medicineModel from "../models/medicineModel.js"
import pharmacyOrderModel from "../models/pharmacyOrderModel.js"

// Add dynamic clinical seed logic
const seedMedicines = async () => {
    const count = await medicineModel.countDocuments()
    const sample = await medicineModel.findOne()
    // If empty or if medicines lack clinical fields (like genericName), reset and seed
    if (count === 0 || (sample && !sample.genericName)) {
        await medicineModel.deleteMany({}) // Clear old data
        const defaultMedicines = [
            {
                name: "Paracetamol 500mg",
                category: "Analgesics & Antipyretics",
                price: 15,
                stock: 120,
                sku: "RX-PARA-500",
                supplier: { name: "AstraZeneca Pharma", phone: "+91-9988776655", email: "orders@astra.com" },
                description: "Standard pain reliever and antipyretic for fever, headache, and body aches.",
                diseases: ["Fever", "Headache", "Body Pain", "Pain Relief"],
                genericName: "Paracetamol (Acetaminophen)",
                sideEffects: ["Nausea", "Allergic skin rash", "Liver impairment (in case of overdose)"],
                interactions: ["Alcohol (increases risk of liver damage)", "Warfarin (may increase bleeding risk)"],
                alternatives: ["Calpol 500mg", "Crocin 500mg", "Dolo 650mg"],
                date: Date.now()
            },
            {
                name: "Metformin 850mg",
                category: "Antidiabetics",
                price: 45,
                stock: 80,
                sku: "RX-METF-850",
                supplier: { name: "Pfizer Labs", phone: "+91-9988776644", email: "billing@pfizer.com" },
                description: "First-line oral medication for type 2 diabetes management, helping regulate glucose levels.",
                diseases: ["Type-2 Diabetes", "Diabetes", "High Blood Sugar"],
                genericName: "Metformin Hydrochloride",
                sideEffects: ["Nausea & vomiting", "Diarrhea", "Metallic taste in mouth", "Lactic acidosis (rare but serious)"],
                interactions: ["Contrast dyes (kidney injury risk)", "Cimetidine (increases metformin levels)"],
                alternatives: ["Glycomet 850mg", "Obimet 850mg", "Metformin Generic"],
                date: Date.now()
            },
            {
                name: "Amoxicillin 500mg",
                category: "Antibiotics",
                price: 110,
                stock: 55,
                sku: "RX-AMOX-500",
                supplier: { name: "GSK Pharmaceuticals", phone: "+91-9988776633", email: "dist@gsk.com" },
                description: "Broad-spectrum beta-lactam antibiotic used to treat streptococcal throat and bacterial infections.",
                diseases: ["Bacterial Infections", "Fever", "Cough", "Throat Infection"],
                genericName: "Amoxicillin Trihydrate",
                sideEffects: ["Diarrhea", "Nausea", "Skin rash or hives", "Oral thrush (yeast infection)"],
                interactions: ["Oral contraceptives (may reduce efficacy)", "Allopurinol (increases risk of skin rash)"],
                alternatives: ["Almox 500mg", "Mox 500mg", "Novamox 500mg"],
                date: Date.now()
            },
            {
                name: "Atorvastatin 20mg",
                category: "Cardiovascular",
                price: 85,
                stock: 90,
                sku: "RX-ATOR-20",
                supplier: { name: "Pfizer Labs", phone: "+91-9988776644", email: "billing@pfizer.com" },
                description: "Statin class drug used to lower lipid levels, cholesterol, and prevent cardiovascular disease.",
                diseases: ["High Cholesterol", "Cholesterol", "Heart Disease Prevention"],
                genericName: "Atorvastatin Calcium",
                sideEffects: ["Muscle pain (myalgia)", "Headache", "Increased blood sugar levels", "Liver enzyme abnormalities"],
                interactions: ["Grapefruit juice (increases side effect risks)", "Gemfibrozil (increases muscle damage risk)"],
                alternatives: ["Lipvas 20mg", "Atorva 20mg", "Storvas 20mg"],
                date: Date.now()
            },
            {
                name: "Amlodipine 5mg",
                category: "Cardiovascular",
                price: 55,
                stock: 100,
                sku: "RX-AMLO-5",
                supplier: { name: "Sun Pharma", phone: "+91-9988776622", email: "sales@sunpharma.com" },
                description: "Calcium channel blocker that lowers blood pressure and treats angina (chest pain).",
                diseases: ["Hypertension", "High Blood Pressure", "Heart Health"],
                genericName: "Amlodipine Besylate",
                sideEffects: ["Ankle swelling (peripheral edema)", "Dizziness", "Palpitations", "Flushing"],
                interactions: ["Sildenafil (increased risk of low blood pressure)", "Simvastatin (increases simvastatin toxicity)"],
                alternatives: ["Amlopin 5mg", "Amlokind 5mg", "Stamp 5mg"],
                date: Date.now()
            },
            {
                name: "Pantoprazole 40mg",
                category: "Gastrointestinal",
                price: 60,
                stock: 150,
                sku: "RX-PANT-40",
                supplier: { name: "Cipla Ltd", phone: "+91-9988776611", email: "orders@cipla.com" },
                description: "Proton pump inhibitor (PPI) that decreases stomach acid secretion to treat heartburn and GERD.",
                diseases: ["Acidity", "Acid Reflux", "GERD", "Stomach Ulcer", "Heartburn"],
                genericName: "Pantoprazole Sodium",
                sideEffects: ["Headache", "Diarrhea", "Flatulence", "Vitamin B12 deficiency (long term use)"],
                interactions: ["Ketoconazole (reduced absorption of antifungal)", "Iron supplements (reduced absorption of iron)"],
                alternatives: ["Pan 40mg", "Pantocid 40mg", "Pantodac 40mg"],
                date: Date.now()
            },
            {
                name: "Cetirizine 10mg",
                category: "Antihistamines",
                price: 20,
                stock: 200,
                sku: "RX-CETI-10",
                supplier: { name: "Lupin Pharma", phone: "+91-9988776600", email: "dist@lupin.com" },
                description: "Second-generation antihistamine used to relieve allergy symptoms like runny nose and sneezing.",
                diseases: ["Allergies", "Sneezing", "Runny Nose", "Itching", "Skin Rash"],
                genericName: "Cetirizine Hydrochloride",
                sideEffects: ["Mild drowsiness or sleepiness", "Dry mouth", "Fatigue", "Sore throat"],
                interactions: ["Alcohol (increases drowsiness)", "Sedatives/sleeping pills (additive sleepiness)"],
                alternatives: ["Okacet 10mg", "Cetzine 10mg", "Alerid 10mg"],
                date: Date.now()
            },
            {
                name: "Montelukast 10mg",
                category: "Respiratory",
                price: 95,
                stock: 110,
                sku: "RX-MONT-10",
                supplier: { name: "Cipla Ltd", phone: "+91-9988776611", email: "orders@cipla.com" },
                description: "Leukotriene receptor antagonist for the chronic maintenance of asthma and allergic rhinitis.",
                diseases: ["Asthma", "Allergies", "Cough", "Allergic Rhinitis"],
                genericName: "Montelukast Sodium",
                sideEffects: ["Headache", "Abdominal pain", "Cough", "Mood changes or sleep disturbances"],
                interactions: ["Phenobarbital (reduces montelukast levels)", "Rifampin (reduces efficacy)"],
                alternatives: ["Montair 10mg", "Montek 10mg", "Romilast 10mg"],
                date: Date.now()
            },
            {
                name: "Ibuprofen 400mg",
                category: "Analgesics & NSAIDs",
                price: 30,
                stock: 130,
                sku: "RX-IBU-400",
                supplier: { name: "AstraZeneca Pharma", phone: "+91-9988776655", email: "orders@astra.com" },
                description: "Nonsteroidal anti-inflammatory drug (NSAID) for pain relief, reducing swelling and fever.",
                diseases: ["Joint Pain", "Migraine", "Muscle Pain", "Fever", "Pain Relief"],
                genericName: "Ibuprofen",
                sideEffects: ["Stomach upset or heartburn", "Increased risk of stomach ulcers", "Dizziness", "Fluid retention"],
                interactions: ["Aspirin (increases bleeding risk)", "Antihypertensive drugs (reduces BP-lowering effect)"],
                alternatives: ["Brufen 400mg", "Ibugesic 400mg", "Combiflam (Ibuprofen+Paracetamol)"],
                date: Date.now()
            },
            {
                name: "Azithromycin 500mg",
                category: "Antibiotics",
                price: 125,
                stock: 75,
                sku: "RX-AZIT-500",
                supplier: { name: "GSK Pharmaceuticals", phone: "+91-9988776633", email: "dist@gsk.com" },
                description: "Macrolide antibiotic used for respiratory tract, skin, ear, and throat infections.",
                diseases: ["Bacterial Infections", "Sinusitis", "Bronchitis", "Throat Infection"],
                genericName: "Azithromycin Dihydrate",
                sideEffects: ["Loose stools/diarrhea", "Abdominal pain", "Nausea", "Temporary hearing changes (rare, high dose)"],
                interactions: ["Antacids containing magnesium or aluminum (delays absorption)", "Amiodarone (increases risk of abnormal heart rhythms)"],
                alternatives: ["Azithral 500mg", "Azee 500mg", "Azibact 500mg"],
                date: Date.now()
            },
            {
                name: "Omeprazole 20mg",
                category: "Gastrointestinal",
                price: 40,
                stock: 140,
                sku: "RX-OMEP-20",
                supplier: { name: "Cipla Ltd", phone: "+91-9988776611", email: "orders@cipla.com" },
                description: "Decreases stomach acid output, supporting ulcer recovery and treating gastroesophageal reflux.",
                diseases: ["Acidity", "Heartburn", "Acid Reflux", "Stomach Ulcer"],
                genericName: "Omeprazole",
                sideEffects: ["Nausea", "Headache", "Stomach pain", "Increased risk of bone fractures (long term)"],
                interactions: ["Clopidogrel (may reduce antiplatelet efficacy)", "Atazanavir (reduces HIV drug levels)"],
                alternatives: ["Omez 20mg", "Omee 20mg", "Nogacid 20mg"],
                date: Date.now()
            },
            {
                name: "Loperamide 2mg",
                category: "Gastrointestinal",
                price: 25,
                stock: 95,
                sku: "RX-LOPE-2",
                supplier: { name: "Sun Pharma", phone: "+91-9988776622", email: "sales@sunpharma.com" },
                description: "Antidiarrheal medication to reduce bowel movement frequency and improve stool consistency.",
                diseases: ["Diarrhea", "Loose Motions", "IBS"],
                genericName: "Loperamide Hydrochloride",
                sideEffects: ["Constipation", "Dizziness", "Dry mouth", "Abdominal cramps"],
                interactions: ["Quinidine (increases loperamide levels)", "Ritonavir (increases toxicity risk)"],
                alternatives: ["Lopamide 2mg", "Imodium 2mg", "Roko 2mg"],
                date: Date.now()
            },
            {
                name: "Multivitamin Tablets",
                category: "Nutritional Supplements",
                price: 150,
                stock: 180,
                sku: "RX-MVIT-100",
                supplier: { name: "Abbott Laboratories", phone: "+91-9988776677", email: "sales@abbott.com" },
                description: "Comprehensive multivitamin and mineral complex for general wellness and immunity support.",
                diseases: ["General Weakness", "Vitamin Deficiency", "Fatigue", "Immunity Boost"],
                genericName: "Multivitamins & Minerals Complex",
                sideEffects: ["Upset stomach", "Unpleasant taste in mouth", "Constipation or dark stools (iron content)"],
                interactions: ["Antacids (reduces mineral absorption)", "Certain antibiotics like tetracyclines (chelates and reduces efficacy)"],
                alternatives: ["Zincovit", "Becadexamin", "Supradyn"],
                date: Date.now()
            },
            {
                name: "Salbutamol Inhaler 100mcg",
                category: "Respiratory",
                price: 210,
                stock: 60,
                sku: "RX-SALB-100",
                supplier: { name: "Cipla Ltd", phone: "+91-9988776611", email: "orders@cipla.com" },
                description: "Fast-acting bronchodilator for prompt relief of asthma, wheezing, and breathing difficulty.",
                diseases: ["Asthma", "COPD", "Bronchospasm", "Breathing Difficulty"],
                genericName: "Salbutamol (Albuterol)",
                sideEffects: ["Hand tremors", "Rapid heart rate (tachycardia)", "Muscle cramps", "Headache"],
                interactions: ["Beta-blockers like Propranolol (blocks salbutamol action)", "Diuretics (increases hypokalemia risk)"],
                alternatives: ["Asthalin Inhaler", "Aerocort Inhaler", "Duolin Inhaler"],
                date: Date.now()
            },
            {
                name: "Clotrimazole Cream 1%",
                category: "Dermatologicals",
                price: 75,
                stock: 85,
                sku: "RX-CLOT-15",
                supplier: { name: "Glenmark Pharmaceuticals", phone: "+91-9988776688", email: "orders@glenmark.com" },
                description: "Topical antifungal cream for ringworm, athlete's foot, and localized skin fungal infections.",
                diseases: ["Fungal Infections", "Ringworm", "Athlete's Foot", "Skin Rash", "Itching"],
                genericName: "Clotrimazole Topical USP",
                sideEffects: ["Skin irritation or burning sensation", "Redness (erythema)", "Peeling of skin", "Itching"],
                interactions: ["Topical corticosteroids (may mask fungal spread if combined inappropriately)"],
                alternatives: ["Candid Cream", "Canesten Cream", "Clocip Cream"],
                date: Date.now()
            }
        ]
        await medicineModel.insertMany(defaultMedicines)
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
