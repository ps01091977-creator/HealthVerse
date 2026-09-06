import appointment_img from './appointment_img.png'
import header_img from './header_img.png'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.png'
import about_image from './about_image.png'
import logo from './logo.png'
import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import upload_icon from './upload_icon.png'
import stripe_logo from './stripe_logo.png'
import razorpay_logo from './razorpay_logo.png'
import doc1 from './doc1.png'
import doc2 from './doc2.png'
import doc3 from './doc3.png'
import doc4 from './doc4.png'
import doc5 from './doc5.png'
import doc6 from './doc6.png'
import doc7 from './doc7.png'
import doc8 from './doc8.png'
import doc9 from './doc9.png'
import doc10 from './doc10.png'
import doc11 from './doc11.png'
import doc12 from './doc12.png'
import doc13 from './doc13.png'
import doc14 from './doc14.png'
import doc15 from './doc15.png'
import Dermatologist from './Dermatologist.svg'
import Gastroenterologist from './Gastroenterologist.svg'
import General_physician from './General_physician.svg'
import Gynecologist from './Gynecologist.svg'
import Neurologist from './Neurologist.svg'
import Pediatricians from './Pediatricians.svg'


export const assets = {
    appointment_img,
    header_img,
    group_profiles,
    logo,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    stripe_logo,
    razorpay_logo
}

export const specialityData = [
    {
        speciality: 'General physician',
        image: General_physician
    },
    {
        speciality: 'Gynecologist',
        image: Gynecologist
    },
    {
        speciality: 'Dermatologist',
        image: Dermatologist
    },
    {
        speciality: 'Pediatricians',
        image: Pediatricians
    },
    {
        speciality: 'Neurologist',
        image: Neurologist
    },
    {
        speciality: 'Gastroenterologist',
        image: Gastroenterologist
    },
]

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Richard James',
        image: doc1,
        speciality: 'General physician',
        degree: 'MBBS, MD - General Medicine',
        experience: '8 Years',
        about: 'Dr. Richard James is a senior physician dedicated to comprehensive preventive medicine, chronic metabolic management, acute fever diagnostics, and holistic adult care.',
        fees: 500,
        address: {
            line1: '17th Cross, Richmond Road',
            line2: 'Central Medical Plaza, New Delhi'
        }
    },
    {
        _id: 'doc2',
        name: 'Dr. Emily Larson',
        image: doc2,
        speciality: 'Gynecologist',
        degree: 'MBBS, MS - Obstetrics & Gynaecology',
        experience: '6 Years',
        about: 'Dr. Emily Larson specializes in prenatal care, maternal health, PCOS/PCOD therapy, minimally invasive laparoscopy, and high-risk pregnancy management.',
        fees: 700,
        address: {
            line1: '27th Cross, Koramangala',
            line2: 'Mother & Child Health Center, Bangalore'
        }
    },
    {
        _id: 'doc3',
        name: 'Dr. Sarah Patel',
        image: doc3,
        speciality: 'Dermatologist',
        degree: 'MBBS, MD - Dermatology & Venereology',
        experience: '5 Years',
        about: 'Dr. Sarah Patel is a leading clinical dermatologist specializing in acne scar treatments, chronic psoriasis, hair loss PRP therapy, and cosmetic dermatology.',
        fees: 650,
        address: {
            line1: '37th Cross, Indiranagar',
            line2: 'Dermal Care Aesthetics, Bangalore'
        }
    },
    {
        _id: 'doc4',
        name: 'Dr. Christopher Lee',
        image: doc4,
        speciality: 'Pediatricians',
        degree: 'MBBS, DCH, MD - Pediatrics',
        experience: '7 Years',
        about: 'Dr. Christopher Lee provides compassionate care for infants and children, covering pediatric vaccinations, growth milestones, and acute childhood infections.',
        fees: 600,
        address: {
            line1: '47th Cross, Bandra West',
            line2: 'Junior Care Children Clinic, Mumbai'
        }
    },
    {
        _id: 'doc5',
        name: 'Dr. Jennifer Garcia',
        image: doc5,
        speciality: 'Neurologist',
        degree: 'MBBS, DM - Neurology',
        experience: '9 Years',
        about: 'Dr. Jennifer Garcia has deep clinical expertise in migraine management, stroke rehabilitation, neuropathies, epilepsy, and neurodegenerative disorders.',
        fees: 900,
        address: {
            line1: '57th Cross, Cyber City',
            line2: 'Neuroscience Institute, Gurugram'
        }
    },
    {
        _id: 'doc6',
        name: 'Dr. Andrew Williams',
        image: doc6,
        speciality: 'Neurologist',
        degree: 'MBBS, MD, DM - Neurology',
        experience: '11 Years',
        about: 'Dr. Andrew Williams is a veteran neurological consultant specializing in neuromuscular disorders, sleep neurology, spine evaluation, and memory disorders.',
        fees: 1000,
        address: {
            line1: '88 Ring Road, Vasant Kunj',
            line2: 'Apex Brain & Spine Center, New Delhi'
        }
    },
    {
        _id: 'doc7',
        name: 'Dr. Christopher Davis',
        image: doc7,
        speciality: 'General physician',
        degree: 'MBBS, MD - Internal Medicine',
        experience: '10 Years',
        about: 'Dr. Christopher Davis is renowned for diagnostic acumen in hypertension, diabetes management, metabolic syndromes, and geriatric health.',
        fees: 550,
        address: {
            line1: '12 Park Avenue, Connaught Place',
            line2: 'Metro Health Polyclinic, New Delhi'
        }
    },
    {
        _id: 'doc8',
        name: 'Dr. Timothy White',
        image: doc8,
        speciality: 'Gynecologist',
        degree: 'MBBS, DGO, DNB - Obstetrics & Gynecology',
        experience: '8 Years',
        about: 'Dr. Timothy White provides specialized care in women’s wellness, fertility counseling, menstrual irregularities, and postpartum recovery.',
        fees: 750,
        address: {
            line1: '74 Green Park Main',
            line2: 'NovaCare Women Health, New Delhi'
        }
    },
    {
        _id: 'doc9',
        name: 'Dr. Ava Mitchell',
        image: doc9,
        speciality: 'Dermatologist',
        degree: 'MBBS, MD - Dermatology',
        experience: '4 Years',
        about: 'Dr. Ava Mitchell focuses on pigmentary disorders, eczema, laser therapies, skin barrier restoration, and anti-aging treatments.',
        fees: 600,
        address: {
            line1: '19 Jubilee Hills',
            line2: 'Luminous Skin Studio, Hyderabad'
        }
    },
    {
        _id: 'doc10',
        name: 'Dr. Jeffrey King',
        image: doc10,
        speciality: 'Pediatricians',
        degree: 'MBBS, MD - Pediatrics',
        experience: '6 Years',
        about: 'Dr. Jeffrey King excels in treating pediatric allergies, nutritional deficiencies, newborn screenings, and adolescent healthcare.',
        fees: 550,
        address: {
            line1: '31 MG Road',
            line2: 'Rainbow Children Care, Pune'
        }
    },
    {
        _id: 'doc11',
        name: 'Dr. Zoe Kelly',
        image: doc11,
        speciality: 'Neurologist',
        degree: 'MBBS, MD, DM - Neurology',
        experience: '5 Years',
        about: 'Dr. Zoe Kelly is a dedicated neurologist specializing in autonomic nervous dysfunction, tension headaches, vertigo, and EEG diagnostics.',
        fees: 850,
        address: {
            line1: '9 South Extension Part II',
            line2: 'NeuroVibe Care Clinic, New Delhi'
        }
    },
    {
        _id: 'doc12',
        name: 'Dr. Patrick Harris',
        image: doc12,
        speciality: 'Gastroenterologist',
        degree: 'MBBS, MD, DM - Gastroenterology',
        experience: '9 Years',
        about: 'Dr. Patrick Harris is an acclaimed specialist in acid reflux (GERD), irritable bowel syndrome (IBS), liver health, and therapeutic endoscopy.',
        fees: 800,
        address: {
            line1: '55 HSR Layout Sector 4',
            line2: 'Digestive Health & Liver Clinic, Bangalore'
        }
    },
    {
        _id: 'doc13',
        name: 'Dr. Chloe Evans',
        image: doc13,
        speciality: 'General physician',
        degree: 'MBBS, MRCGP',
        experience: '6 Years',
        about: 'Dr. Chloe Evans provides evidence-based primary medical care, annual wellness checkups, viral illness treatment, and cardiovascular screening.',
        fees: 500,
        address: {
            line1: '82 Anna Nagar',
            line2: 'City Family Wellness Clinic, Chennai'
        }
    },
    {
        _id: 'doc14',
        name: 'Dr. Ryan Martinez',
        image: doc14,
        speciality: 'Dermatologist',
        degree: 'MBBS, MD - Dermatology & Cosmetology',
        experience: '7 Years',
        about: 'Dr. Ryan Martinez specializes in skin allergy diagnostics, mole evaluations, anti-aging therapies, hair regrowth solutions, and scar revision.',
        fees: 700,
        address: {
            line1: '44 Marine Drive',
            line2: 'OceanView Dermatology Center, Mumbai'
        }
    },
    {
        _id: 'doc15',
        name: 'Dr. Amelia Hill',
        image: doc15,
        speciality: 'Gastroenterologist',
        degree: 'MBBS, MD, DM - Gastroenterology & Hepatology',
        experience: '8 Years',
        about: 'Dr. Amelia Hill provides expert care in fatty liver disease, gastritis, food intolerances, gut microbiota balance, and colonoscopy.',
        fees: 850,
        address: {
            line1: '63 Whitefield Main Road',
            line2: 'GastroHep Center of Excellence, Bangalore'
        }
    }
]