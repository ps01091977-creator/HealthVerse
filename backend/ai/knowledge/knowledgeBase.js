/**
 * HealthVerse Trusted Medical & Platform Knowledge Base
 * Structured documents for chunking, embedding, and vector search in Qdrant.
 */

export const KNOWLEDGE_DOCUMENTS = [
  {
    id: "kb-about-healthverse",
    category: "general",
    title: "About HealthVerse Platform Overview",
    content: `HealthVerse is a next-generation AI-assisted healthcare and doctor appointment platform.
It connects patients with board-certified doctors across multiple medical specialties, offers online video consultations, in-clinic visits, an integrated pharmacy medicine shop, blood donation registry, and emergency SOS services.
Platform features include:
- 3-tier user system: Patient, Doctor, and Administrator.
- Real-time appointment scheduling with automated slot locking.
- Telemedicine video consultations powered by encrypted WebRTC.
- Instant prescription review and medicine delivery.
- AI Clinical Assistant for symptom guidance, pre-consultation triage, and automated scheduling assistance.`
  },
  {
    id: "kb-specialties-guidance",
    category: "specialties",
    title: "Medical Specialties & When to Consult Each Specialist",
    content: `Guidance on finding the right doctor specialty based on patient symptoms:
- General Physician / Internal Medicine: For general ailments, fever, fatigue, seasonal flu, viral infections, routine health checks, hypertension, and initial evaluation.
- Cardiologist: For chest pain, shortness of breath, heart palpitations, irregular heartbeat, high blood pressure, and cardiovascular disease risk.
- Dermatologist: For skin rashes, acne, eczema, psoriasis, hair loss, skin allergies, moles, fungal infections, and cosmetic dermatology.
- Pediatrician: For infant, child, and adolescent health, vaccinations, growth monitoring, childhood fevers, and pediatric developmental concerns.
- Neurologist: For frequent migraines, severe headaches, seizures, dizziness, numbness, tremors, memory loss, and nervous system disorders.
- Gastroenterologist: For acid reflux (GERD), chronic abdominal pain, bloating, ulcers, indigestion, constipation, liver problems, and IBS.
- Orthopedic Surgeon / Specialist: For joint pain, fractures, arthritis, back/neck pain, sports injuries, ligament tears, and musculoskeletal stiffness.
- Gynecologist / Obstetrician: For women's reproductive health, prenatal care, menstrual irregularities, fertility, and hormonal health.
- Ophthalmologist: For eye strain, vision blurriness, cataracts, glaucoma, dry eyes, and eye infections.
- ENT Specialist (Otolaryngologist): For ear infections, hearing issues, chronic sinusitis, throat pain, tonsillitis, and nasal allergies.`
  },
  {
    id: "kb-appointment-rules",
    category: "appointments",
    title: "Appointment Booking, Rescheduling, and Cancellation Policy",
    content: `HealthVerse Appointment Guidelines:
1. Booking: Appointments can be booked through the web interface or via the AI Assistant. Slots are available in 30-minute intervals from 10:00 AM to 9:00 PM.
2. Slot Locking: Once a slot is selected and confirmed, it is locked immediately to prevent double bookings.
3. Rescheduling: Patients can reschedule their appointment up to 2 hours before the scheduled time without any penalty.
4. Cancellation: Patients can cancel appointments from the 'My Appointments' page or ask the AI Assistant. Cancelled slots are immediately returned to the doctor's availability pool.
5. Telehealth Video Link: For confirmed appointments, a secure video room link is automatically generated and accessible 15 minutes before the session starts.`
  },
  {
    id: "kb-pre-appointment-checklist",
    category: "guidelines",
    title: "What to Prepare and Bring for Doctor Appointments",
    content: `Patient Pre-Appointment Checklist:
- Identification: Valid government ID or HealthVerse Patient Profile.
- Past Medical Records: Previous diagnostic reports, blood test results, X-rays, or imaging scans from the past 6-12 months.
- Medication List: Complete list of all current prescription medications, over-the-counter supplements, and dosages.
- Symptom Timeline: A brief note of when symptoms began, their severity on a 1-10 scale, triggers, and any medications already taken.
- Questions for Doctor: Write down the top 2-3 specific questions or concerns to discuss during the consultation.`
  },
  {
    id: "kb-emergency-sos-guidelines",
    category: "emergency",
    title: "Emergency Situations & SOS Protocol",
    content: `CRITICAL SAFETY PROTOCOL:
If you or someone around you is experiencing life-threatening medical symptoms, DO NOT wait for an online appointment or chatbot response. Call your local emergency helpline (e.g. 911 / 112 / 108) or go directly to the nearest hospital emergency room.
Emergency symptoms include:
- Crushing chest pain or pressure radiating to the arm, neck, or jaw.
- Sudden weakness, numbness, or facial drooping (signs of stroke - FAST).
- Sudden severe shortness of breath or inability to breathe.
- Uncontrolled heavy bleeding or deep open wounds.
- Loss of consciousness, severe confusion, or unresponsive state.
- Severe allergic reaction (anaphylaxis) with swelling of lips, tongue, or throat.
HealthVerse provides an Emergency SOS module on the platform to notify emergency contacts and locate the nearest ambulance/trauma center.`
  },
  {
    id: "kb-pharmacy-medicine-rules",
    category: "pharmacy",
    title: "Pharmacy Orders and Medication Safety",
    content: `HealthVerse Integrated Pharmacy:
- Patients can purchase over-the-counter medications and upload doctor prescriptions for regulated medicines.
- Always check the dosage, active ingredients, expiry date, and manufacturer instructions before consuming any medicine.
- Never alter prescribed antibiotic courses or cardiovascular medications without consulting your prescribing physician.
- Contact our registered pharmacist helpline if you experience unexpected side effects or drug interactions.`
  },
  {
    id: "kb-blood-donation-protocol",
    category: "blood",
    title: "Blood Donation and Request Protocols",
    content: `HealthVerse Blood Donation Registry:
- Donors can register with their blood group (A+, A-, B+, B-, AB+, AB-, O+, O-), city, and contact details.
- Patients in urgent need can filter verified donors by blood type and location.
- Eligibility for donors: Age 18-65, minimum weight 50 kg, good general health, and at least 3 months since the last whole blood donation.`
  },
  {
    id: "kb-medical-disclaimer",
    category: "safety",
    title: "Clinical Safety & AI Disclaimer",
    content: `HealthVerse AI Assistant is an informational and scheduling aid designed to support patients.
- The AI does NOT provide definitive medical diagnoses, write certified prescriptions, or replace in-person professional healthcare examinations.
- Recommendations provided by the AI are based on established clinical guidelines and platform knowledge.
- Always seek the advice of a qualified physician with any questions regarding a medical condition.`
  }
];
