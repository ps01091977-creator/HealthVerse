import { searchKnowledgeBase, searchDoctorsVector } from './qdrantService.js';
import { callGrok } from './grokService.js';
import { CLINICAL_ASSISTANT_SYSTEM_PROMPT, MEDICAL_SAFETY_DISCLAIMER } from '../prompts/systemPrompts.js';
import { AI_TOOL_DEFINITIONS, executeTool } from './toolsService.js';

/**
 * Full RAG + Grok + Tool Calling Orchestrator
 */
export const processUserQuery = async ({
  message,
  chatHistory = [],
  userId = null,
  clientAction = null, // e.g. { type: 'confirm_booking', doctorId, slotDate, slotTime }
}) => {
  const startTime = Date.now();
  console.log(`[RAG] Processing query: "${message}" for userId: ${userId || 'anonymous'}`);

  let actionPayload = null;

  // Handle direct client-side confirmed actions (e.g. from UI buttons)
  if (clientAction) {
    if (clientAction.type === 'confirm_booking') {
      const bookRes = await executeTool('confirmAppointmentBooking', {
        doctorId: clientAction.doctorId,
        slotDate: clientAction.slotDate,
        slotTime: clientAction.slotTime,
        userConfirmed: true,
      }, { userId });

      return {
        reply: bookRes.success 
          ? `🎉 **Appointment Confirmed!**\n\nYour appointment with **${bookRes.doctorName}** (${bookRes.speciality}) has been successfully scheduled for **${bookRes.slotDate}** at **${bookRes.slotTime}**.\n\nVideo Consultation Link: [Join Consultation](${bookRes.videoLink})`
          : `⚠️ **Booking Issue**: ${bookRes.error || bookRes.message}`,
        actionPayload: bookRes,
        suggestedChips: ["View My Appointments", "Pre-appointment checklist", "How to join video call"],
        responseTimeMs: Date.now() - startTime,
      };
    }

    if (clientAction.type === 'cancel_appointment') {
      const cancelRes = await executeTool('cancelUserAppointment', {
        appointmentId: clientAction.appointmentId,
        userConfirmed: true,
      }, { userId });

      return {
        reply: cancelRes.success
          ? `✅ **Appointment Cancelled**: ${cancelRes.message}`
          : `⚠️ **Cancellation Issue**: ${cancelRes.error || cancelRes.message}`,
        actionPayload: cancelRes,
        suggestedChips: ["Book another doctor", "View Appointments", "Support Help"],
        responseTimeMs: Date.now() - startTime,
      };
    }
  }

  // 1. Retrieve Knowledge Base Context (Qdrant Semantic Search)
  const kbResults = await searchKnowledgeBase(message, 3);
  const doctorResults = await searchDoctorsVector(message, 3);

  // 2. Build Grounded Context Block
  let ragContext = '### RETRIEVED HEALTHVERSE TRUSTED KNOWLEDGE CONTEXT:\n';
  const sources = [];

  if (kbResults && kbResults.length > 0) {
    kbResults.forEach((kb, i) => {
      sources.push({ title: kb.title, category: kb.category, score: kb.score });
      ragContext += `\n[Doc ${i + 1}: ${kb.title}]\n${kb.content}\n`;
    });
  }

  if (doctorResults && doctorResults.length > 0) {
    ragContext += `\n### MATCHING DOCTOR PROFILES FROM DATABASE:\n`;
    doctorResults.forEach((doc, i) => {
      ragContext += `\n[Doctor ${i + 1}]: ID: ${doc._id}, Name: ${doc.name}, Speciality: ${doc.speciality}, Degree: ${doc.degree}, Experience: ${doc.experience}, Fees: ₹${doc.fees}, Available: ${doc.available}, Rating: ${doc.averageRating}★\nBio: ${doc.about}\n`;
    });
  }

  // 3. Assemble Conversation Messages for Grok
  const systemPromptWithContext = `${CLINICAL_ASSISTANT_SYSTEM_PROMPT}\n\n${ragContext}`;

  const messages = [
    { role: 'system', content: systemPromptWithContext }
  ];

  // Include recent chat history (up to last 6 turns)
  if (Array.isArray(chatHistory)) {
    const recent = chatHistory.slice(-6);
    recent.forEach(turn => {
      if (turn.sender === 'user' || turn.role === 'user') {
        messages.push({ role: 'user', content: turn.text || turn.content });
      } else if (turn.sender === 'ai' || turn.role === 'assistant') {
        messages.push({ role: 'assistant', content: turn.text || turn.content });
      }
    });
  }

  // Add current message
  messages.push({ role: 'user', content: message });

  // 4. Call Grok LLM with Tool Definitions
  const grokRes = await callGrok({
    messages,
    tools: AI_TOOL_DEFINITIONS,
    temperature: 0.3,
  });

  let finalReply = '';
  let toolExecuted = null;

  if (grokRes.success && grokRes.message) {
    const assistantMsg = grokRes.message;

    // Check if Grok decided to call a function/tool
    if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
      console.log(`[RAG] Grok triggered ${assistantMsg.tool_calls.length} tool call(s).`);
      
      // Execute first tool
      const toolCall = assistantMsg.tool_calls[0];
      const fnName = toolCall.function.name;
      let fnArgs = {};
      try {
        fnArgs = JSON.parse(toolCall.function.arguments);
      } catch (pErr) {
        fnArgs = {};
      }

      const toolResult = await executeTool(fnName, fnArgs, { userId });
      actionPayload = { toolName: fnName, result: toolResult };
      toolExecuted = fnName;

      // Add tool call and tool result to message history for final synthesis
      messages.push(assistantMsg);
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        name: fnName,
        content: JSON.stringify(toolResult),
      });

      // Second call to Grok to synthesize grounded response with tool output
      const secondGrokRes = await callGrok({
        messages,
        temperature: 0.2,
      });

      if (secondGrokRes.success && secondGrokRes.message) {
        finalReply = secondGrokRes.message.content || '';
      } else {
        finalReply = `I executed ${fnName} and found the requested medical information.`;
      }
    } else {
      finalReply = assistantMsg.content || '';
    }
  }

  // 4b. Proactive Tool Intent Fallback (Ensures interactive UI cards & live slots appear consistently)
  if (!toolExecuted && message) {
    const lower = message.toLowerCase();
    
    // Check for Slot Intent (Latin + Devanagari)
    if (lower.includes('slot') || lower.includes('timing') || lower.includes('samay') || lower.includes('kab milenge') || message.includes('स्लॉट') || message.includes('समय') || message.includes('टाइम')) {
      const docNameMatch = message.match(/(?:dr\.|doctor|डॉक्टर)?\s*([a-zA-Z\s]+?)(?:ke|ka|ki|'s)?\s*(?:slots?|timing|स्लॉट)/i);
      const queryName = docNameMatch ? docNameMatch[1].trim() : '';
      
      const targetDate = lower.includes('today') || lower.includes('aaj') || message.includes('आज') ? 'today' : 'tomorrow';
      const slotRes = await executeTool('getAvailableSlots', {
        doctorName: queryName || undefined,
        slotDate: targetDate,
      }, { userId });

      if (slotRes.success) {
        actionPayload = { toolName: 'getAvailableSlots', result: slotRes };
        toolExecuted = 'getAvailableSlots';
      }
    } 
    // Check for My Appointments Intent
    else if (lower.includes('my appointment') || lower.includes('mere appointment') || lower.includes('meri appointment') || lower.includes('booked appointment') || message.includes('अपॉइंटमेंट')) {
      const apptRes = await executeTool('getUserAppointments', {}, { userId });
      actionPayload = { toolName: 'getUserAppointments', result: apptRes };
      toolExecuted = 'getUserAppointments';
    }
    // Check for Doctor Search Intent (Latin + Devanagari)
    else if (
      lower.includes('doctor') || lower.includes('cardiologist') || lower.includes('physician') || 
      lower.includes('dermatologist') || lower.includes('pediatrician') || lower.includes('neurologist') || 
      lower.includes('gastroenterologist') || lower.includes('gynecologist') || lower.includes('specialist') ||
      lower.includes('dikhao') || lower.includes('dhoondo') ||
      message.includes('डॉक्टर') || message.includes('दिखाओ') || message.includes('ढूंढो') || message.includes('स्पेशलिस्ट')
    ) {
      let spec = undefined;
      if (lower.includes('cardio') || message.includes('दिल') || message.includes('हार्ट')) spec = 'Cardiologist';
      else if (lower.includes('general') || lower.includes('physician') || lower.includes('bukhar') || message.includes('बुखार')) spec = 'General physician';
      else if (lower.includes('derma') || lower.includes('skin') || message.includes('त्वचा') || message.includes('खुजली')) spec = 'Dermatologist';
      else if (lower.includes('pediat') || lower.includes('child') || lower.includes('bachhe') || message.includes('बच्चे')) spec = 'Pediatrician';
      else if (lower.includes('neuro') || lower.includes('brain') || message.includes('दिमाग') || message.includes('सिर')) spec = 'Neurologist';
      else if (lower.includes('gastro') || lower.includes('pet') || message.includes('पेट')) spec = 'Gastroenterologist';
      else if (lower.includes('gynec') || lower.includes('mahila') || message.includes('महिला')) spec = 'Gynecologist';

      const docRes = await executeTool('searchDoctors', { speciality: spec, query: message }, { userId });
      if (docRes.success && docRes.doctors && docRes.doctors.length > 0) {
        actionPayload = { toolName: 'searchDoctors', result: docRes };
        toolExecuted = 'searchDoctors';
      } else if (doctorResults && doctorResults.length > 0) {
        actionPayload = { toolName: 'searchDoctors', result: { count: doctorResults.length, doctors: doctorResults } };
        toolExecuted = 'searchDoctors';
      }
    }
  }

  // Fallback if reply is empty
  if (!finalReply) {
    finalReply = "I am your HealthVerse AI Clinical Healthcare Assistant. How can I assist you with your health today?";
  }

  // Ensure clinical safety disclaimer is subtly appended
  if (!finalReply.includes('Disclaimer:') && !finalReply.includes('emergency')) {
    finalReply += MEDICAL_SAFETY_DISCLAIMER;
  }

  // Determine dynamic suggested quick reply chips
  const suggestedChips = generateSmartSuggestions(message, toolExecuted, actionPayload);

  return {
    reply: finalReply,
    sources,
    actionPayload,
    suggestedChips,
    responseTimeMs: Date.now() - startTime,
  };
};

/**
 * Generate context-aware quick response chips
 */
const generateSmartSuggestions = (query, toolName, actionPayload) => {
  const q = (query || '').toLowerCase();

  if (toolName === 'searchDoctors' || (actionPayload && actionPayload.toolName === 'searchDoctors')) {
    return ["Check available slots", "Doctor fees & ratings", "How to book", "Other specialties"];
  }

  if (toolName === 'getAvailableSlots' || (actionPayload && actionPayload.toolName === 'getAvailableSlots')) {
    return ["Confirm this slot", "Check another date", "View Doctor Profile", "Consultation fees"];
  }

  if (q.includes('symptom') || q.includes('pain') || q.includes('fever') || q.includes('cough')) {
    return ["Find General Physician", "Consult Cardiologist", "Emergency SOS", "What to prepare for visit"];
  }

  if (q.includes('appointment') || q.includes('book')) {
    return ["Show Cardiologists", "Show Dermatologists", "My Appointments", "Cancellation Policy"];
  }

  return [
    "Find a doctor",
    "Available cardiologists",
    "My appointments",
    "What should I bring to visit?",
    "Emergency SOS Help"
  ];
};
