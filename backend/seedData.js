import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import doctorModel from './models/doctorModel.js';
import { syncDoctors, initQdrant } from './ai/services/qdrantService.js';
import 'dotenv/config';

const doctorsData = [
  {
    name: "Dr. Richard James",
    email: "richard.james@healthverse.ai",
    speciality: "General physician",
    degree: "MBBS, MD - General Medicine",
    experience: "8 Years",
    about: "Dr. Richard James is a dedicated General Physician with extensive clinical experience in diagnosis, preventive care, lifestyle medicine, and treating adult acute/chronic diseases.",
    fees: 500,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    address: { line1: "17th Cross, Richmond Road", line2: "Central Medical Plaza, New Delhi" },
    averageRating: 4.9,
    ratingCount: 142
  },
  {
    name: "Dr. Emily Larson",
    email: "emily.larson@healthverse.ai",
    speciality: "Gynecologist",
    degree: "MBBS, MS - Obstetrics & Gynaecology",
    experience: "6 Years",
    about: "Dr. Emily Larson provides compassionate, world-class maternal healthcare, prenatal management, fertility guidance, and advanced gynecological treatments.",
    fees: 700,
    image: "https://images.unsplash.com/photo-1594824813633-8982438234e1?q=80&w=400&auto=format&fit=crop",
    address: { line1: "27th Cross, Koramangala", line2: "Mother & Child Health Center, Bangalore" },
    averageRating: 4.8,
    ratingCount: 98
  },
  {
    name: "Dr. Sarah Patel",
    email: "sarah.patel@healthverse.ai",
    speciality: "Dermatologist",
    degree: "MBBS, MD - Dermatology, Venereology & Leprosy",
    experience: "5 Years",
    about: "Dr. Sarah Patel specializes in aesthetic skin rejuvenation, acne scar remodeling, chronic eczema, psoriasis, and clinical hair and nail disorders.",
    fees: 650,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    address: { line1: "37th Cross, Indiranagar", line2: "Dermal Care Aesthetics, Bangalore" },
    averageRating: 4.9,
    ratingCount: 120
  },
  {
    name: "Dr. Christopher Lee",
    email: "christopher.lee@healthverse.ai",
    speciality: "Pediatricians",
    degree: "MBBS, DCH, MD - Pediatrics",
    experience: "7 Years",
    about: "Dr. Christopher Lee is a caring pediatrician focused on neonatal care, childhood development milestones, pediatric vaccinations, and adolescent healthcare.",
    fees: 600,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop",
    address: { line1: "47th Cross, Bandra West", line2: "Junior Care Children Clinic, Mumbai" },
    averageRating: 4.9,
    ratingCount: 165
  },
  {
    name: "Dr. Jennifer Garcia",
    email: "jennifer.garcia@healthverse.ai",
    speciality: "Neurologist",
    degree: "MBBS, DM - Neurology",
    experience: "9 Years",
    about: "Dr. Jennifer Garcia has deep clinical acumen in treating migraine disorders, stroke rehabilitation, neuropathies, epilepsy, and neurodegenerative conditions.",
    fees: 900,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=400&auto=format&fit=crop",
    address: { line1: "57th Cross, Cyber City", line2: "Neuroscience Institute, Gurugram" },
    averageRating: 4.8,
    ratingCount: 88
  },
  {
    name: "Dr. Andrew Williams",
    email: "andrew.williams@healthverse.ai",
    speciality: "Neurologist",
    degree: "MBBS, MD, DM - Neurology",
    experience: "11 Years",
    about: "Dr. Andrew Williams is a senior neurological consultant with specialization in spine health, sleep neurology, tremor evaluation, and memory disorders.",
    fees: 1000,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop",
    address: { line1: "88 Ring Road, Vasant Kunj", line2: "Apex Brain & Spine Center, New Delhi" },
    averageRating: 5.0,
    ratingCount: 210
  },
  {
    name: "Dr. Christopher Davis",
    email: "christopher.davis@healthverse.ai",
    speciality: "General physician",
    degree: "MBBS, MD - Internal Medicine",
    experience: "10 Years",
    about: "Dr. Christopher Davis is renowned for diagnostic excellence in hypertension, diabetes management, metabolic syndromes, and comprehensive geriatric medicine.",
    fees: 550,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=400&auto=format&fit=crop",
    address: { line1: "12 Park Avenue, Connaught Place", line2: "Metro Health Polyclinic, New Delhi" },
    averageRating: 4.7,
    ratingCount: 130
  },
  {
    name: "Dr. Timothy White",
    email: "timothy.white@healthverse.ai",
    speciality: "Gynecologist",
    degree: "MBBS, DGO, DNB - Obstetrics & Gynecology",
    experience: "8 Years",
    about: "Dr. Timothy White provides comprehensive wellness exams, minimally invasive laparoscopic surgery, high-risk obstetrics, and PCOS management.",
    fees: 750,
    image: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?q=80&w=400&auto=format&fit=crop",
    address: { line1: "74 Green Park Main", line2: "NovaCare Women's Health, New Delhi" },
    averageRating: 4.9,
    ratingCount: 94
  },
  {
    name: "Dr. Ava Mitchell",
    email: "ava.mitchell@healthverse.ai",
    speciality: "Dermatologist",
    degree: "MBBS, MD - Dermatology",
    experience: "4 Years",
    about: "Dr. Ava Mitchell focuses on acne treatments, hyperpigmentation solutions, laser therapy, skin barrier repair, and advanced cosmetic dermatology.",
    fees: 600,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    address: { line1: "19 Jubilee Hills", line2: "Luminous Skin Studio, Hyderabad" },
    averageRating: 4.8,
    ratingCount: 76
  },
  {
    name: "Dr. Jeffrey King",
    email: "jeffrey.king@healthverse.ai",
    speciality: "Pediatricians",
    degree: "MBBS, MD - Pediatrics",
    experience: "6 Years",
    about: "Dr. Jeffrey King excels in treating pediatric infectious diseases, child nutrition planning, allergy management, and developmental assessments.",
    fees: 550,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400&auto=format&fit=crop",
    address: { line1: "31 MG Road", line2: "Rainbow Children Care, Pune" },
    averageRating: 4.9,
    ratingCount: 115
  },
  {
    name: "Dr. Zoe Kelly",
    email: "zoe.kelly@healthverse.ai",
    speciality: "Neurologist",
    degree: "MBBS, MD, DM - Neurology",
    experience: "5 Years",
    about: "Dr. Zoe Kelly is a dynamic neurological clinician specialized in neuromuscular diagnostics, EEG interpretation, autonomic dysfunction, and migraine relief.",
    fees: 850,
    image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=400&auto=format&fit=crop",
    address: { line1: "9 South Extension Part II", line2: "NeuroVibe Care Clinic, New Delhi" },
    averageRating: 4.8,
    ratingCount: 82
  },
  {
    name: "Dr. Patrick Harris",
    email: "patrick.harris@healthverse.ai",
    speciality: "Gastroenterologist",
    degree: "MBBS, MD, DM - Gastroenterology",
    experience: "9 Years",
    about: "Dr. Patrick Harris is an acclaimed specialist in acid reflux (GERD), IBS management, liver health, endoscopy, inflammatory bowel disease, and colonoscopy.",
    fees: 800,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=400&auto=format&fit=crop",
    address: { line1: "55 HSR Layout Sector 4", line2: "Digestive Health & Liver Clinic, Bangalore" },
    averageRating: 4.9,
    ratingCount: 153
  },
  {
    name: "Dr. Chloe Evans",
    email: "chloe.evans@healthverse.ai",
    speciality: "General physician",
    degree: "MBBS, MRCGP",
    experience: "6 Years",
    about: "Dr. Chloe Evans provides holistic primary medical care, preventive health screenings, chronic disease monitoring, and annual full-body checkups.",
    fees: 500,
    image: "https://images.unsplash.com/photo-1594824813633-8982438234e1?q=80&w=400&auto=format&fit=crop",
    address: { line1: "82 Anna Nagar", line2: "City Family Wellness Clinic, Chennai" },
    averageRating: 4.8,
    ratingCount: 91
  },
  {
    name: "Dr. Ryan Martinez",
    email: "ryan.martinez@healthverse.ai",
    speciality: "Dermatologist",
    degree: "MBBS, MD - Dermatology & Cosmetology",
    experience: "7 Years",
    about: "Dr. Ryan Martinez specializes in skin allergy testing, mole evaluations, anti-aging therapies, hair loss solutions (PRP), and scar therapies.",
    fees: 700,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    address: { line1: "44 Marine Drive", line2: "OceanView Dermatology Center, Mumbai" },
    averageRating: 4.9,
    ratingCount: 138
  },
  {
    name: "Dr. Amelia Hill",
    email: "amelia.hill@healthverse.ai",
    speciality: "Gastroenterologist",
    degree: "MBBS, MD, DM - Gastroenterology & Hepatology",
    experience: "8 Years",
    about: "Dr. Amelia Hill provides expert care in fatty liver disease, gastritis, food intolerances, gut microbiota balance, and therapeutic endoscopy.",
    fees: 850,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    address: { line1: "63 Whitefield Main Road", line2: "GastroHep Center of Excellence, Bangalore" },
    averageRating: 5.0,
    ratingCount: 172
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas.");

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("Doctor@123", salt);

    console.log(`Seeding ${doctorsData.length} doctors...`);

    for (const doc of doctorsData) {
      const existing = await doctorModel.findOne({ email: doc.email });
      if (existing) {
        existing.name = doc.name;
        existing.speciality = doc.speciality;
        existing.degree = doc.degree;
        existing.experience = doc.experience;
        existing.about = doc.about;
        existing.fees = doc.fees;
        existing.image = doc.image;
        existing.address = doc.address;
        existing.available = true;
        existing.averageRating = doc.averageRating;
        existing.ratingCount = doc.ratingCount;
        existing.password = defaultPassword;
        await existing.save();
        console.log(`Updated doctor: ${doc.name} (${doc.speciality})`);
      } else {
        const newDoc = new doctorModel({
          ...doc,
          password: defaultPassword,
          available: true,
          slots_booked: {},
          date: Date.now()
        });
        await newDoc.save();
        console.log(`Created doctor: ${doc.name} (${doc.speciality})`);
      }
    }

    // Keep test doctor as well
    const testDoc = await doctorModel.findOne({ email: "testdoctor@appointy.com" });
    if (testDoc) {
      testDoc.password = defaultPassword;
      testDoc.available = true;
      await testDoc.save();
      console.log("Verified test doctor (testdoctor@appointy.com)");
    }

    // Synchronize doctors to Qdrant vector database
    try {
      console.log("Initializing Qdrant and syncing doctor vector embeddings...");
      await initQdrant();
      const allDoctors = await doctorModel.find({ available: true });
      await syncDoctors(allDoctors);
      console.log(`Successfully synced ${allDoctors.length} doctors with Qdrant Vector Search!`);
    } catch (qErr) {
      console.warn("Qdrant sync warning:", qErr.message);
    }

    console.log("Doctor seeding complete!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
