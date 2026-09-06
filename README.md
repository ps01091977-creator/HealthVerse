# Novacare - Doctor Appointment Web App

**Appinty** is a full-stack web application designed to make healthcare more accessible by simplifying the process of booking doctor appointments. It offers three levels of login: **Patient**, **Doctor**, and **Admin**, each with distinct features tailored to their roles. The app integrates **online payment gateways (Stripe and Razorpay)** to facilitate seamless and secure payments. Built using the **MERN stack** (MongoDB, Express.js, React.js, and Node.js), Appointy provides an efficient, user-friendly experience for both patients and healthcare providers.

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Payment Gateways**: Razorpay
- **Authentication**: JSON Web Token (JWT)

## 🔑 Key Features

### 1. Three-Level Authentication

- **Patient Login**: 
  - Patients can sign up, log in, and book appointments with doctors.
  - Manage appointments (view, cancel, or reschedule).
  - Secure online payment options available (cash, Stripe, Razorpay).
  - User profile with editable information (name, email, address, gender, birthday, profile picture).

- **Doctor Login**:
  - Doctors can log in and manage appointments.
  - Dashboard displays earnings, number of patients, number of appointments, and latest bookings.
  - Update profile details (description, fees, address, availability status).
  - View appointment details (patient info, payment mode, appointment status).

- **Admin Login**:
  - Admins can create and manage doctor profiles.
  - Dashboard with analytics: total doctors, total appointments, total patients, and recent bookings.
  - Add new doctors (image, specialty, degree, experience, address, fees, etc.).
  - View and manage all appointments (cancel or mark as completed).

## 🏠 Home Page

- Features a user-friendly layout where users can:
  - **Search for doctors** based on specialties.
  - **View top doctors** and their profiles.
  - Explore additional sections: About Us, Delivery Information, Privacy Policy, and Get in Touch.
- **Footer** includes navigation links: Home, About Us, Delivery Info, Privacy Policy, Contact Us.

## 🩺 All Doctors Page

- Lists all available doctors.
- Users can **filter doctors by specialty**.
- Clicking on a doctor's profile redirects to the **Doctor Appointment Page**.

## 📄 About Page

- Provides information about **Appointy’s vision** and mission.
- **Why Choose Us** section highlights:
  - **Efficiency**: Streamlined appointment process.
  - **Convenience**: Online booking and payment.
  - **Personalization**: Tailored experience based on user preferences.
- Footer section with additional links.

## 📞 Contact Page

- Contains **office address** and contact details.
- Section to explore job opportunities.
- Footer navigation links.

## 📅 Doctor Appointment Page

- Displays detailed information about the selected doctor:
  - **Profile picture, qualification, experience**, and a brief description.
  - **Appointment booking form**: Choose date, time, and payment method.
  - Online payment options: **Cash, Stripe, or Razorpay**.
  - **Related doctors** section at the bottom.
- Users need to **create an account or log in** before booking an appointment.

## 👤 User Profile

- Accessible after login.
- Users can view and edit their profile:
  - **Upload profile picture**.
  - Update **name, email, address, gender, and birthday**.
- View list of upcoming and past appointments.
- **Logout** option available.

## 🗄️ Admin Panel

- **Dashboard**:
  - Displays statistics: **Number of doctors**, **appointments**, **patients**, and **latest bookings**.
  - Option to **cancel bookings** if needed.
- **Add Doctor**:
  - Form to add a new doctor profile (image, specialty, email, password, degree, address, experience, fees, description).
- **Doctor List**:
  - View all registered doctors with options to edit or delete profiles.
- **Appointments**:
  - List of all appointments including patient name, age, date, time, doctor name, fees.
  - Admin actions: **Cancel** or **Mark as Completed**.

## 🩺 Doctor Dashboard

- **Earnings Overview**:
  - Total earnings from completed appointments.
- **Appointments List**:
  - View detailed list of patient appointments (name, age, date, time, payment mode, status).
  - Actions: **Mark appointment as completed** or **Cancel appointment**.
- **Profile Management**:
  - Doctors can update their **profile information**, including description, fees, address, and availability status.

## 💳 Payment Integration

- Supports multiple payment methods:
  - **Cash Payment**
  - **Razorpay Integration**
## 🤖 AI-Powered Healthcare Assistant & Smart Appointments

NovaCare includes an AI clinical assistant and intelligent appointment booking engine powered by **xAI Grok**, **Qdrant Vector Database**, **RAG (Retrieval-Augmented Generation)**, and **Inworld Voice / Web Speech Engine**.

### AI Capabilities:
1. **Conversational Clinical Guidance**: Empathic, safe triage assistant guiding users to appropriate medical specialties with strict medical safety guardrails (non-prescriptive, emergency escalation).
2. **RAG (Retrieval-Augmented Generation)**: Grounded vector search over trusted NovaCare knowledge base documents, clinic policies, preparation checklists, and FAQs.
3. **Qdrant Vector Search**: Cosine similarity search over indexed doctor profiles and medical documents with seamless in-memory fallback.
4. **Natural Voice Input & Output**:
   - **Speech-to-Text (STT)**: Real-time microphone audio recognition with animated listening waveform.
   - **Text-to-Speech (TTS)**: Voice audio playback with Inworld AI integration and browser speech synthesis.
5. **Backend Tool Calling & Smart Booking**:
   - `searchDoctors`: Semantic doctor recommendations matching symptoms and specialties.
   - `getAvailableSlots`: Real-time calendar slot retrieval.
   - Multi-turn booking preview and explicit user confirmation dialogs.

---

## 🔑 AI Environment Variables (`backend/.env`)

```env
# Primary LLM Provider (xAI Grok)
GROK_API_KEY=your_xai_grok_api_key

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333 # or https://your-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key

# Embedding Model Provider (OpenAI text-embedding-3-small)
EMBEDDING_API_KEY=your_openai_or_embedding_key

# Inworld AI Voice (STT & TTS)
INWORLD_API_KEY=your_inworld_key
INWORLD_API_SECRET=your_inworld_secret
INWORLD_SCENE=your_inworld_scene_or_character
```

---

## 🌐 Project Setup

To run NovaCare locally:

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:8080`*

2. **Frontend Patient Portal**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

3. **Admin & Doctor Portal**:
   ```bash
   cd admin
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5180`*

---

## 📦 Folder Structure

```plaintext
appointy/
├── backend/
│   ├── ai/
│   │   ├── config/          # Qdrant client connection
│   │   ├── controllers/     # AI chat, voice, and knowledge sync controllers
│   │   ├── knowledge/       # Trusted medical KB and doctor seed documents
│   │   ├── prompts/         # Clinical safety and system prompts
│   │   ├── routes/          # /api/ai endpoints
│   │   └── services/        # Grok, Qdrant, Embedding, RAG, Tools & Inworld services
│   ├── controllers/         # Core API controllers
│   ├── models/              # MongoDB Schemas
│   └── routes/              # Express API Routes
├── frontend/
│   ├── src/
│   │   ├── components/      # AiVoiceChat, SymptomChecker, Navbar, TopDoctors
│   │   ├── pages/           # AiHub, Doctors, MyAppointment, PharmacyShop
│   │   └── context/         # AppContext
└── admin/                   # Doctor & Admin Portal
```

## 🤝 Contributing
We welcome contributions! Feel free to submit issues or pull requests.

## 🌟 Acknowledgements
Thanks to the open-source community, xAI Grok, Qdrant, Inworld AI, MongoDB, Express, React, and Node.js.

