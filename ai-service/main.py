import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("HealthVerse-AI-Service")

app = FastAPI(title="HealthVerse AI Service", version="1.0.0")

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LLM Selection
llm = None
provider = "mock"

openai_api_key = os.getenv("OPENAI_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

if openai_api_key:
    try:
        from langchain_openai import ChatOpenAI
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, api_key=openai_api_key)
        provider = "openai"
        logger.info("Using OpenAI GPT-4o-mini as LLM Provider")
    except Exception as e:
        logger.error(f"Error loading OpenAI: {e}")

elif gemini_api_key:
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0.2, api_key=gemini_api_key)
        provider = "gemini"
        logger.info("Using Google Gemini 3.5 Flash as LLM Provider")
    except Exception as e:
        logger.error(f"Error loading Gemini: {e}")

if not llm:
    logger.warning("No LLM API keys provided. Running in Demo Mock mode.")

# Pydantic Schemas
class SymptomRequest(BaseModel):
    symptoms: str
    patient_info: Optional[str] = None

class SymptomResponse(BaseModel):
    analysis: str
    specialties: List[str]
    urgency: str  # Low, Medium, High, Critical
    suggestions: List[str]
    provider: str

class VisitSummaryRequest(BaseModel):
    patient_name: str
    patient_age: int
    gender: str
    symptoms: str
    doctor_notes: str
    history: Optional[str] = None

class VisitSummaryResponse(BaseModel):
    summary: str
    suggested_diagnoses: List[str]
    suggested_questions: List[str]
    recommended_follow_ups: List[str]
    provider: str

class HistoryAnalysisRequest(BaseModel):
    appointments: List[dict]
    patient_profile: dict

class HistoryAnalysisResponse(BaseModel):
    health_trajectory: str
    risk_factors: List[str]
    preventative_steps: List[str]
    provider: str

class ChatbotRequest(BaseModel):
    message: str
    chat_history: Optional[List[dict]] = None

class ChatbotResponse(BaseModel):
    reply: str
    provider: str

class MedicineRequest(BaseModel):
    medicine_name: str

class MedicineResponse(BaseModel):
    description: str
    side_effects: List[str]
    interactions: List[str]
    typical_dosage: str
    provider: str

class DietRequest(BaseModel):
    health_conditions: List[str]
    goals: str

class DietResponse(BaseModel):
    recommended_foods: List[str]
    avoid_foods: List[str]
    meal_plan_suggestion: str
    nutrition_tips: List[str]
    provider: str

class ReportRequest(BaseModel):
    report_text: str

class ReportResponse(BaseModel):
    summary: str
    key_findings: List[str]
    abnormal_values: List[str]
    recommended_questions: List[str]
    provider: str

class FollowUpRequest(BaseModel):
    diagnosis: str
    treatment: str

class FollowUpResponse(BaseModel):
    follow_up_weeks: int
    warnings_to_watch: List[str]
    suggestions: List[str]
    provider: str



@app.get("/")
def read_root():
    return {"status": "healthy", "service": "HealthVerse AI Service", "provider": provider}


@app.post("/api/ai/symptom-check", response_model=SymptomResponse)
async def symptom_check(request: SymptomRequest):
    logger.info(f"Processing symptom check: {request.symptoms[:50]}...")
    
    if provider == "mock":
        # Rule-based fallback response
        symptoms_lower = request.symptoms.lower()
        specialties = ["General physician"]
        urgency = "Low"
        suggestions = ["Ensure adequate hydration and rest.", "Monitor temperature and note any new symptoms."]
        analysis = (
            f"Based on the symptoms described ('{request.symptoms}'), there are mild indications "
            f"of general discomfort. This does not appear to be an emergency."
        )

        if any(w in symptoms_lower for w in ["heart", "chest", "cardiac", "stroke", "numb"]):
            specialties = ["Cardiologist", "General physician"]
            urgency = "High"
            suggestions = ["Avoid heavy physical exertion.", "Consult a doctor immediately if pain radiates to the arm or jaw."]
            analysis = "Possible cardiovascular concern. Chest pain or related symptoms require prompt professional evaluation."
        elif any(w in symptoms_lower for w in ["skin", "rash", "acne", "itch", "spots"]):
            specialties = ["Dermatologist"]
            urgency = "Low"
            suggestions = ["Avoid scratching or applying harsh chemical soaps.", "Keep the area dry and clean."]
            analysis = "A localized dermatological issue is suggested. Standard dermatological evaluation is recommended."
        elif any(w in symptoms_lower for w in ["child", "baby", "pediatric", "toddler"]):
            specialties = ["Pediatrician"]
            urgency = "Medium"
            suggestions = ["Keep the child well-hydrated.", "Monitor temperature closely."]
            analysis = "Symptoms reported in a pediatric patient. A consultation with a pediatrician is advised to evaluate correctly."
        elif any(w in symptoms_lower for w in ["ear", "nose", "throat", "cough", "sinus", "tonsil"]):
            specialties = ["ENT specialist", "General physician"]
            urgency = "Medium"
            suggestions = ["Warm salt water gargles.", "Avoid cold liquids."]
            analysis = "Indication of upper respiratory or ear-nose-throat irritation. Typically managed by an ENT specialist."
        elif any(w in symptoms_lower for w in ["bone", "joint", "muscle", "fracture", "sprain", "backache"]):
            specialties = ["Orthopedist"]
            urgency = "Medium"
            suggestions = ["Restrict movement of the affected area.", "Apply cold compress if swollen."]
            analysis = "Potential musculoskeletal involvement. Evaluation by an orthopedist is recommended if pain persists."
        elif any(w in symptoms_lower for w in ["stomach", "vomit", "acid", "gas", "indigestion", "diarrhea"]):
            specialties = ["Gastroenterologist", "General physician"]
            urgency = "Medium"
            suggestions = ["Eat bland food in small portions.", "Stay hydrated with electrolytes."]
            analysis = "Indications of gastrointestinal discomfort. General physician or gastroenterologist consultation is appropriate."

        return SymptomResponse(
            analysis=analysis,
            specialties=specialties,
            urgency=urgency,
            suggestions=suggestions,
            provider="demo-mock"
        )

    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser
        from pydantic import Field

        # Schema for JSON output validation
        class LlmSymptomResponse(BaseModel):
            analysis: str = Field(description="Clinical assessment and summary of the symptoms.")
            specialties: List[str] = Field(description="List of suggested specialist categories from: General physician, Gastroenterologist, Dermatologist, Pediatrician, Neurologist, Cardiologist, ENT specialist, Gynecologist, Orthopedist.")
            urgency: str = Field(description="Urgency scale: Low, Medium, High, Critical.")
            suggestions: List[str] = Field(description="List of safe, conservative home care or precautionary suggestions.")

        parser = JsonOutputParser(pydantic_object=LlmSymptomResponse)
        
        prompt = ChatPromptTemplate.from_template(
            "You are a helpful, expert AI medical assistant. Analyze the following patient symptoms. "
            "Suggest appropriate medical specialties, gauge the urgency level, and provide safe, general care tips.\n"
            "Patient Symptoms: {symptoms}\n"
            "Patient Background Info: {patient_info}\n"
            "\n{format_instructions}\n"
            "Ensure the output conforms exactly to the JSON format. Do not add markdown backticks or any other text outside the JSON."
        )

        chain = prompt | llm | parser
        res = chain.invoke({
            "symptoms": request.symptoms,
            "patient_info": request.patient_info or "No background details provided.",
            "format_instructions": parser.get_format_instructions()
        })

        return SymptomResponse(
            analysis=res.get("analysis", ""),
            specialties=res.get("specialties", ["General physician"]),
            urgency=res.get("urgency", "Medium"),
            suggestions=res.get("suggestions", []),
            provider=provider
        )

    except Exception as e:
        logger.error(f"Error in LLM Symptom Check: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/copilot/visit-summary", response_model=VisitSummaryResponse)
async def visit_summary(request: VisitSummaryRequest):
    logger.info(f"Processing visit summary for {request.patient_name}...")

    if provider == "mock":
        return VisitSummaryResponse(
            summary=f"Patient {request.patient_name} ({request.patient_age}y, {request.gender}) presented with: {request.symptoms}. Doctor's initial assessment indicates: {request.doctor_notes}.",
            suggested_diagnoses=["Acute symptom presentation", "Observation recommended"],
            suggested_questions=["When did these symptoms first occur?", "Are they constant or intermittent?"],
            recommended_follow_ups=["Follow up in 7 days if symptoms persist", "Routine vital checks"],
            provider="demo-mock"
        )

    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser
        from pydantic import Field

        class LlmVisitSummary(BaseModel):
            summary: str = Field(description="A formal, highly professional clinical summary synthesizing patient symptoms and doctor notes.")
            suggested_diagnoses: List[str] = Field(description="List of differential diagnoses based on details.")
            suggested_questions: List[str] = Field(description="List of clinical questions the doctor might ask to narrow down diagnosis.")
            recommended_follow_ups: List[str] = Field(description="Actionable follow-up plans, tests, or lifestyle instructions.")

        parser = JsonOutputParser(pydantic_object=LlmVisitSummary)

        prompt = ChatPromptTemplate.from_template(
            "You are a clinical AI copilot for doctors. Synthesize the provided consultation notes into a "
            "professional medical summary, list potential differential diagnoses, propose clinical questions to ask the patient, "
            "and suggest follow-up steps.\n\n"
            "Patient Name: {name}\n"
            "Age/Gender: {age} / {gender}\n"
            "Symptoms: {symptoms}\n"
            "Doctor's Rough Notes: {doctor_notes}\n"
            "History: {history}\n\n"
            "{format_instructions}\n"
            "Ensure the output conforms exactly to the JSON format. Do not write markdown backticks or any other text outside the JSON."
        )

        chain = prompt | llm | parser
        res = chain.invoke({
            "name": request.patient_name,
            "age": request.patient_age,
            "gender": request.gender,
            "symptoms": request.symptoms,
            "doctor_notes": request.doctor_notes,
            "history": request.history or "None available",
            "format_instructions": parser.get_format_instructions()
        })

        return VisitSummaryResponse(
            summary=res.get("summary", ""),
            suggested_diagnoses=res.get("suggested_diagnoses", []),
            suggested_questions=res.get("suggested_questions", []),
            recommended_follow_ups=res.get("recommended_follow_ups", []),
            provider=provider
        )

    except Exception as e:
        logger.error(f"Error in LLM Visit Summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/copilot/patient-analysis", response_model=HistoryAnalysisResponse)
async def patient_analysis(request: HistoryAnalysisRequest):
    logger.info(f"Processing history analysis for patient profile...")

    if provider == "mock":
        return HistoryAnalysisResponse(
            health_trajectory="Overall health status appears stable. Past appointments show consistent follow-up.",
            risk_factors=["No chronic alerts noted"],
            preventative_steps=["Schedule annual screening", "Maintain active lifestyle"],
            provider="demo-mock"
        )

    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser
        from pydantic import Field

        class LlmHistoryAnalysis(BaseModel):
            health_trajectory: str = Field(description="Analysis of the patient's health trends over the past appointments.")
            risk_factors: List[str] = Field(description="Identified health risks based on profile and symptoms history.")
            preventative_steps: List[str] = Field(description="Actionable lifestyle and health preventative recommendations.")

        parser = JsonOutputParser(pydantic_object=LlmHistoryAnalysis)

        prompt = ChatPromptTemplate.from_template(
            "You are a clinical analyst AI. Review the patient's demographic details and appointment history "
            "to summarize their health trajectory, call out potential risk factors, and outline personalized preventative care recommendations.\n\n"
            "Patient Profile: {profile}\n"
            "Appointment History: {appointments}\n\n"
            "{format_instructions}\n"
            "Ensure the output conforms exactly to the JSON format. Do not write markdown backticks or any other text outside the JSON."
        )

        chain = prompt | llm | parser
        res = chain.invoke({
            "profile": str(request.patient_profile),
            "appointments": str(request.appointments),
            "format_instructions": parser.get_format_instructions()
        })

        return HistoryAnalysisResponse(
            health_trajectory=res.get("health_trajectory", ""),
            risk_factors=res.get("risk_factors", []),
            preventative_steps=res.get("preventative_steps", []),
            provider=provider
        )

    except Exception as e:
        logger.error(f"Error in LLM History Analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/chatbot", response_model=ChatbotResponse)
async def chatbot(request: ChatbotRequest):
    logger.info(f"Processing chatbot inquiry...")
    if provider == "mock":
        return ChatbotResponse(
            reply="I am here as your HealthVerse AI medical assistant. Please note: I cannot diagnose conditions. For critical emergencies, contact emergency support immediately.",
            provider="demo-mock"
        )
    try:
        from langchain_core.prompts import ChatPromptTemplate
        prompt = ChatPromptTemplate.from_template(
            "You are a helpful, professional healthcare assistant. Answer the patient's medical question clearly and accurately, adding standard safety precautions.\n"
            "Patient question: {message}\n"
            "Chat history: {history}"
        )
        chain = prompt | llm
        res = chain.invoke({
            "message": request.message,
            "history": str(request.chat_history or [])
        })
        return ChatbotResponse(reply=res.content, provider=provider)
    except Exception as e:
        logger.error(f"Error in Chatbot endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/medicine-info", response_model=MedicineResponse)
async def medicine_info(request: MedicineRequest):
    logger.info(f"Retrieving details for {request.medicine_name}...")
    if provider == "mock":
        return MedicineResponse(
            description=f"Information summary for {request.medicine_name}. Standard pharmaceutical details indicate use as target medication.",
            side_effects=["Nausea", "Headache", "Dizziness"],
            interactions=["Consult doctor if taking anticoagulants or heavy anti-inflammatory medications."],
            typical_dosage="Take as directed by doctor (typically 1 tablet daily).",
            provider="demo-mock"
        )
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser
        from pydantic import Field

        class LlmMedInfo(BaseModel):
            description: str = Field(description="Scientific explanation of the medicine usage.")
            side_effects: List[str] = Field(description="Common side effects.")
            interactions: List[str] = Field(description="Known drug/food interactions.")
            typical_dosage: str = Field(description="Standard clinical dosage recommendations.")

        parser = JsonOutputParser(pydantic_object=LlmMedInfo)
        prompt = ChatPromptTemplate.from_template(
            "You are an expert clinical pharmacist. Provide accurate detail summary for: {medicine}\n"
            "{format_instructions}"
        )
        chain = prompt | llm | parser
        res = chain.invoke({
            "medicine": request.medicine_name,
            "format_instructions": parser.get_format_instructions()
        })
        return MedicineResponse(
            description=res.get("description", ""),
            side_effects=res.get("side_effects", []),
            interactions=res.get("interactions", []),
            typical_dosage=res.get("typical_dosage", ""),
            provider=provider
        )
    except Exception as e:
        logger.error(f"Error in Medicine Info endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/diet-nutrition", response_model=DietResponse)
async def diet_nutrition(request: DietRequest):
    logger.info("Generating diet suggestions...")
    if provider == "mock":
        return DietResponse(
            recommended_foods=["Leafy greens", "Lean poultry", "Whole grains", "Hydration liquids"],
            avoid_foods=["Refined sugars", "Excess sodium", "Processed food products"],
            meal_plan_suggestion="Bland oats for breakfast; grilled chicken salad for lunch; steamed fish with rice for dinner.",
            nutrition_tips=["Eat at consistent times.", "Observe balanced caloric intake scales."],
            provider="demo-mock"
        )
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser
        from pydantic import Field

        class LlmDietResponse(BaseModel):
            recommended_foods: List[str] = Field(description="Foods suitable for these goals/conditions.")
            avoid_foods: List[str] = Field(description="Foods to avoid.")
            meal_plan_suggestion: str = Field(description="Sample single-day menu plan.")
            nutrition_tips: List[str] = Field(description="Actionable dietary advice.")

        parser = JsonOutputParser(pydantic_object=LlmDietResponse)
        prompt = ChatPromptTemplate.from_template(
            "You are a clinical nutritionist. Suggest a dietary framework based on:\n"
            "Health Conditions: {conditions}\n"
            "Goals: {goals}\n"
            "{format_instructions}"
        )
        chain = prompt | llm | parser
        res = chain.invoke({
            "conditions": ", ".join(request.health_conditions),
            "goals": request.goals,
            "format_instructions": parser.get_format_instructions()
        })
        return DietResponse(
            recommended_foods=res.get("recommended_foods", []),
            avoid_foods=res.get("avoid_foods", []),
            meal_plan_suggestion=res.get("meal_plan_suggestion", ""),
            nutrition_tips=res.get("nutrition_tips", []),
            provider=provider
        )
    except Exception as e:
        logger.error(f"Error in Diet Nutrition endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/report-summary", response_model=ReportResponse)
async def report_summary(request: ReportRequest):
    logger.info("Summarizing diagnostic report...")
    if provider == "mock":
        return ReportResponse(
            summary="Lab metrics check. General parameters appear normal. Mild markers present.",
            key_findings=["Blood profile normal", "Electrolytes balanced"],
            abnormal_values=["Vitamins level slightly low"],
            recommended_questions=["Should I take vitamins supplements?", "When is the next lab run recommended?"],
            provider="demo-mock"
        )
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser
        from pydantic import Field

        class LlmReportResponse(BaseModel):
            summary: str = Field(description="SaaSy, clear summary of the diagnostic medical report text.")
            key_findings: List[str] = Field(description="Key scientific findings.")
            abnormal_values: List[str] = Field(description="Any abnormal lab values or parameters.")
            recommended_questions: List[str] = Field(description="Questions the patient should discuss with their doctor.")

        parser = JsonOutputParser(pydantic_object=LlmReportResponse)
        prompt = ChatPromptTemplate.from_template(
            "You are an expert clinical lab analyst. Analyze this medical report text and synthesize findings.\n"
            "Report content: {report}\n"
            "{format_instructions}"
        )
        chain = prompt | llm | parser
        res = chain.invoke({
            "report": request.report_text,
            "format_instructions": parser.get_format_instructions()
        })
        return ReportResponse(
            summary=res.get("summary", ""),
            key_findings=res.get("key_findings", []),
            abnormal_values=res.get("abnormal_values", []),
            recommended_questions=res.get("recommended_questions", []),
            provider=provider
        )
    except Exception as e:
        logger.error(f"Error in Report Summary endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/follow-up", response_model=FollowUpResponse)
async def follow_up(request: FollowUpRequest):
    logger.info("Formulating follow-up interval...")
    if provider == "mock":
        return FollowUpResponse(
            follow_up_weeks=4,
            warnings_to_watch=["Dizziness", "Persistent elevated temperature", "Difficulty breathing"],
            suggestions=["Observe rest guidelines.", "Schedule doctor visit if symptoms recur."],
            provider="demo-mock"
        )
    try:
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser
        from pydantic import Field

        class LlmFollowUp(BaseModel):
            follow_up_weeks: int = Field(description="Ideal follow-up interval in number of weeks.")
            warnings_to_watch: List[str] = Field(description="Warning signs or red flags that require immediate attention.")
            suggestions: List[str] = Field(description="Lifestyle or monitoring steps to take until follow-up.")

        parser = JsonOutputParser(pydantic_object=LlmFollowUp)
        prompt = ChatPromptTemplate.from_template(
            "You are a clinical coordinator. Suggest follow-up protocol details based on:\n"
            "Diagnosis: {diagnosis}\n"
            "Treatment: {treatment}\n"
            "{format_instructions}"
        )
        chain = prompt | llm | parser
        res = chain.invoke({
            "diagnosis": request.diagnosis,
            "treatment": request.treatment,
            "format_instructions": parser.get_format_instructions()
        })
        return FollowUpResponse(
            follow_up_weeks=res.get("follow_up_weeks", 4),
            warnings_to_watch=res.get("warnings_to_watch", []),
            suggestions=res.get("suggestions", []),
            provider=provider
        )
    except Exception as e:
        logger.error(f"Error in Follow Up endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

