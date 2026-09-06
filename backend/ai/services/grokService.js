import OpenAI from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

let grokClient = null;
let xaiQuotaExceeded = true; // Auto-skip xAI if quota is depleted to prevent 2s delay

export const getGrokClient = () => {
  const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (!apiKey) return null;

  if (!grokClient) {
    grokClient = new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
    });
    console.log('[GrokService] Initialized xAI Grok client with baseURL https://api.x.ai/v1');
  }
  return grokClient;
};

/**
 * Call Gemini / Gemma models in parallel race for fastest response time
 */
const callGeminiFlash = async (messages) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  try {
    const rawContents = [];
    let systemInstructionText = '';

    messages.forEach((m) => {
      if (m.role === 'system') {
        systemInstructionText += (systemInstructionText ? '\n\n' : '') + m.content;
      } else if (m.role === 'user') {
        rawContents.push({
          role: 'user',
          parts: [{ text: m.content || '' }]
        });
      } else if (m.role === 'assistant') {
        rawContents.push({
          role: 'model',
          parts: [{ text: m.content || '' }]
        });
      } else if (m.role === 'tool') {
        rawContents.push({
          role: 'user',
          parts: [{ text: `[Database/Tool Result]:\n${m.content}` }]
        });
      }
    });

    if (systemInstructionText && rawContents.length > 0) {
      if (rawContents[0].role === 'user') {
        rawContents[0].parts[0].text = `[Clinical Context & Instructions]:\n${systemInstructionText}\n\n[User Message]:\n${rawContents[0].parts[0].text}`;
      } else {
        rawContents.unshift({
          role: 'user',
          parts: [{ text: `[Clinical Context & Instructions]:\n${systemInstructionText}` }]
        });
      }
    }

    // Merge consecutive turns with same role for Gemini API compliance
    const formattedContents = [];
    for (const turn of rawContents) {
      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === turn.role) {
        const prevText = formattedContents[formattedContents.length - 1].parts[0].text;
        const newText = turn.parts[0].text;
        formattedContents[formattedContents.length - 1].parts[0].text = `${prevText}\n\n${newText}`;
      } else {
        formattedContents.push(turn);
      }
    }

    // Active high-speed Google Gemini models in parallel race
    const candidateModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    const startTime = Date.now();

    const requestPromises = candidateModels.map(async (model) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedContents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          }
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(`${model} status ${response.status}: ${errJson.error?.message || 'Request failed'}`);
      }

      const responseData = await response.json();
      const candidate = responseData?.candidates?.[0];
      const rawText = candidate?.content?.parts?.[0]?.text;
      if (!rawText || !rawText.trim()) throw new Error(`Empty response from ${model}`);

      // Clean thought trace if model returned scratchpad
      let cleanedText = rawText.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
      if (cleanedText.startsWith('*   Question:') || cleanedText.includes('Constraint:')) {
        const lines = cleanedText.split('\n').filter(l => !l.startsWith('*   ') && !l.includes('Constraint:'));
        cleanedText = lines.join('\n').replace(/"/g, '').trim();
      }

      return {
        model,
        text: cleanedText,
        time: Date.now() - startTime,
      };
    });

    try {
      const winner = await Promise.any(requestPromises);
      console.log(`[GrokService] Fast Gemini model winner: ${winner.model} (${winner.time}ms)`);
      return {
        success: true,
        message: {
          role: 'assistant',
          content: winner.text,
        },
        finish_reason: 'stop',
        provider: `google-${winner.model}`,
      };
    } catch (allErr) {
      console.warn('[GrokService] Cloud Gemini API race failed/busy:', allErr.errors?.map(e => e.message) || allErr.message);
    }
  } catch (error) {
    console.warn('[GrokService] Gemini Flash error:', error.message);
  }
  return null;
};

import Groq from 'groq-sdk';

let groqSdkClient = null;

const getGroqSdkClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  if (!groqSdkClient) {
    groqSdkClient = new Groq({ apiKey });
  }
  return groqSdkClient;
};

/**
 * Call Groq Cloud LLM (gpt-oss-120b / gpt-oss-20b) with sub-second latency
 */
const callGroqLlm = async (messages) => {
  const groq = getGroqSdkClient();
  if (!groq) return null;

  const candidateModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'groq/compound'];
  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
    content: m.content || '',
  }));

  for (const model of candidateModels) {
    try {
      const response = await groq.chat.completions.create({
        messages: formattedMessages,
        model,
        temperature: 0.3,
        max_tokens: 1000,
      });

      const rawText = response.choices?.[0]?.message?.content;
      if (rawText && rawText.trim()) {
        console.log(`[GrokService] Groq LLM success with model: ${model}`);
        return {
          success: true,
          message: {
            role: 'assistant',
            content: rawText.trim(),
          },
          finish_reason: 'stop',
          provider: `groq-${model}`,
        };
      }
    } catch (err) {
      console.warn(`[GrokService] Groq model ${model} error:`, err.message);
    }
  }
  return null;
};

/**
 * Call Grok / Gemini / Groq LLM with multi-engine speed race
 */
export const callGrok = async ({
  messages,
  tools = undefined,
  temperature = 0.3,
  model = 'grok-2-latest',
}) => {
  // 1. Race Google Gemini Flash and Groq Cloud LLM in parallel for ultra-fast response
  const activeEngines = [];
  if (process.env.GEMINI_API_KEY) {
    activeEngines.push(callGeminiFlash(messages));
  }
  if (process.env.GROQ_API_KEY) {
    activeEngines.push(callGroqLlm(messages));
  }

  if (activeEngines.length > 0) {
    try {
      const winner = await Promise.any(
        activeEngines.map(p => p.then(res => {
          if (!res || !res.success) throw new Error('Engine response invalid');
          return res;
        }))
      );
      if (winner) return winner;
    } catch (e) {
      console.warn('[GrokService] Parallel AI race fallback notice, trying direct engines...');
    }
  }

  const geminiRes = await callGeminiFlash(messages);
  if (geminiRes) return geminiRes;

  const groqRes = await callGroqLlm(messages);
  if (groqRes) return groqRes;

  // 2. Doctor-grade Local Clinical Engine fallback
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  return {
    success: true,
    message: {
      role: 'assistant',
      content: generateLocalClinicalReply(lastUserMsg),
    },
    finish_reason: 'stop',
    provider: 'healthverse-clinical-engine',
  };
};

/**
 * Intelligent local clinical reply generator with doctor-grade English communication
 */
const generateLocalClinicalReply = (userQuery) => {
  const query = (userQuery || '').toLowerCase();

  // Emergency Symptoms
  if (query.includes('chest') || query.includes('heart') || query.includes('breathing') || query.includes('stroke') || query.includes('faint') || query.includes('seene')) {
    return `### ⚠️ Immediate Medical Alert\nSevere chest pain, sudden difficulty breathing, palpitations, or neurological weakness can be signs of an acute medical emergency.\n\n### 💡 Critical Steps:\n1. **Call Emergency Services Immediately**: Dial **112 / 911 / 108** or proceed directly to the nearest hospital Emergency Room.\n2. **Emergency SOS**: You can trigger the **Emergency SOS** on the HealthVerse top navigation bar for immediate assistance.\n3. **Do Not Drive Yourself**: Have someone transport you or wait for paramedics.\n\nFor non-emergency cardiac evaluations, our board-certified **Cardiologists** are available for consultation.`;
  }

  // Fever, Headache, Cold & Flu
  if (query.includes('fever') || query.includes('bukhar') || query.includes('headache') || query.includes('cold') || query.includes('cough') || query.includes('throat')) {
    return `### 🩺 Clinical Overview: Fever & Flu Symptoms\nFever and associated headaches typically indicate an active immune response to a viral or bacterial infection.\n\n### 💡 Recommended Immediate Care:\n*   **Hydration**: Drink plenty of fluids (water, electrolyte solutions, warm soups) to prevent dehydration.\n*   **Rest**: Ensure adequate physical rest in a well-ventilated, comfortable room.\n*   **Temperature Monitoring**: Check and record body temperature every 4-6 hours.\n\n### 👨‍⚕️ Specialist Consultation:\n*   If your fever exceeds 102°F (38.9°C), persists for more than 48-72 hours, or is accompanied by a severe stiff neck, consult a **General Physician**.\n*   You can ask me to *"Show available general physicians"* to browse verified doctors and book a consultation.`;
  }

  // Cardiologist
  if (query.includes('cardiologist') || query.includes('heart') || query.includes('blood pressure') || query.includes('bp')) {
    return `### 🩺 Cardiology Specialist Care\nCardiologists specialize in diagnosing and managing hypertension, coronary artery health, and cardiovascular wellness.\n\n### 💡 Consultation Preparation:\n*   Have your recent ECG reports, lipid profile test results, and list of daily medications ready.\n*   Keep a log of your recent blood pressure readings if you have a home monitor.\n\n### 👨‍⚕️ Available Doctors:\n*   You can ask me to *"Show available cardiologists"* or *"Check Dr. Test User slots"* to schedule an appointment.`;
  }

  // Dermatologist
  if (query.includes('dermatologist') || query.includes('skin') || query.includes('rash') || query.includes('acne') || query.includes('itch')) {
    return `### 🌸 Dermatological Care & Skin Assessment\nFor skin rashes, acute acne, dermatitis, allergic flare-ups, or skin lesions, a certified **Dermatologist** should examine the condition.\n\n### 💡 Pre-Consultation Guidance:\n*   Do not apply heavy medicated creams or makeup to the affected area before your appointment so the doctor can accurately inspect the skin barrier.\n*   Take clear well-lit photos of the rash progression if scheduling a video consultation.\n\n### 👨‍⚕️ Next Steps:\n*   Ask me to *"Find dermatologists"* to view doctor profiles, fees, and available slots.`;
  }

  // Neurologist & Migraines
  if (query.includes('migraine') || query.includes('dizziness') || query.includes('neuro') || query.includes('brain') || query.includes('nerve')) {
    return `### 🧠 Neurological & Migraine Evaluation\nChronic migraines, persistent dizziness, tingling sensations, or cluster headaches warrant evaluation by a **Neurologist**.\n\n### 💡 Supportive Relief Tips:\n*   Rest in a quiet, dark, and cool room.\n*   Limit screen time and stay well-hydrated.\n*   Track headache triggers (e.g. lack of sleep, skipping meals, sensory overload).\n\n### 👨‍⚕️ Schedule a Visit:\n*   Ask me to *"Show neurologists"* to view top specialists and open appointment timings.`;
  }

  // Orthopedic & Joint Pain
  if (query.includes('joint') || query.includes('knee') || query.includes('bone') || query.includes('back pain') || query.includes('ortho')) {
    return `### 🦴 Orthopedic Consultation for Joint & Bone Pain\nJoint stiffness, knee pain, chronic lower back ache, or post-injury swelling should be evaluated by an **Orthopedic Specialist**.\n\n### 💡 Safe Home Care:\n*   Avoid high-impact activities or heavy lifting.\n*   Apply cold compresses for acute swelling or warm compresses for chronic muscle stiffness.\n*   Carry any previous X-rays or MRI scans to your appointment.\n\n### 👨‍⚕️ Next Steps:\n*   Ask me to *"Show orthopedic doctors"* to find available specialists.`;
  }

  // Gastroenterologist & Stomach Issues
  if (query.includes('stomach') || query.includes('acidity') || query.includes('gas') || query.includes('constipation') || query.includes('vomit') || query.includes('digest')) {
    return `### 🩺 Gastroenterology & Digestive Health\nPersistent abdominal cramps, severe acid reflux, bloating, or gastrointestinal discomfort should be assessed by a **Gastroenterologist** or **General Physician**.\n\n### 💡 Dietary & Care Guidelines:\n*   Consume light, non-spicy, easily digestible meals and avoid caffeinated or carbonated beverages.\n*   Stay hydrated with water and oral rehydration fluids.\n\n### 👨‍⚕️ Next Steps:\n*   Ask me to *"Show doctors for stomach pain"* to book a consultation slot.`;
  }

  // Pediatrician (Children)
  if (query.includes('child') || query.includes('baby') || query.includes('pediatrician') || query.includes('infant') || query.includes('kid')) {
    return `### 👶 Pediatric Care for Children\nFor infant or child fever, respiratory infections, growth milestones, and vaccinations, consulting a certified **Pediatrician** is essential.\n\n### 💡 Checklist for Parents:\n*   Keep the child's immunization record and temperature logs ready.\n*   Ensure adequate fluid intake and gentle comfort.\n\n### 👨‍⚕️ Schedule a Doctor:\n*   Ask me to *"Show pediatricians"* to book an appointment with our child care specialists.`;
  }

  // Gynecologist (Women's Health)
  if (query.includes('gynecologist') || query.includes('pregnancy') || query.includes('period') || query.includes('women')) {
    return `### 🌸 Women's Health & Gynecological Care\nFor menstrual cycle concerns, pregnancy planning, hormonal evaluations, or routine checkups, consulting a **Gynecologist** is recommended.\n\n### 💡 What to Prepare:\n*   Note down your last menstrual cycle dates and any specific symptoms.\n*   Bring prior ultrasound scans or blood test reports.\n\n### 👨‍⚕️ Next Steps:\n*   Ask me to *"Show gynecologists"* to view certified doctors and available consultation slots.`;
  }

  // How to book / Slots
  if (query.includes('book') || query.includes('slot') || query.includes('appointment')) {
    return `### 📅 How to Book an Appointment on HealthVerse:\n1. **Select a Specialist**: Specify the medical specialty or doctor's name (e.g. *Cardiologist*, *General Physician*).\n2. **Choose Time Slot**: Review open dates and real-time appointment slots.\n3. **Confirm Booking**: Confirm your selection to receive instant scheduling and a secure video consultation link!`;
  }

  // Default Greeting / General Healthcare
  return `### 🩺 HealthVerse AI Healthcare Intelligence\nHello! I am your AI clinical assistant, ready to assist you with medical symptom analysis and doctor scheduling.\n\n*   **Symptom Guidance**: Describe your symptoms (e.g. *"I have had fever for 2 days"*, *"Chest tightness"*).\n*   **Find Specialists**: Ask for doctors (e.g. *"Show cardiologists"*, *"Available dermatologists"*).\n*   **Check Slots**: Ask for real-time doctor availability (e.g. *"Dr. Test User appointment slots"*).\n\n*How can I assist your health and wellness today?*`;
};

