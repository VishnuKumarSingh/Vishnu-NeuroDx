"""
/api/v1/chat  — Proxy AI chat messages through the backend (keeps API key server-side)
"""

import os
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

SYSTEM_PROMPT = """You are NeuroAI Assistant, a helpful medical AI assistant for a brain tumor detection platform.
You assist doctors and healthcare professionals with neurological queries, MRI scan interpretations,
brain health questions, and medical guidance.
Be empathetic, professional, and always recommend consulting a qualified physician for medical decisions.
Keep responses concise, clear, and medically accurate. Use paragraph breaks for readability.
Never make definitive diagnoses — always frame findings as possibilities requiring expert confirmation."""


class ChatMessage(BaseModel):
    role: str    # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    lang: Optional[str] = "en"   # "en" | "hi"


@router.post("/chat", summary="Send a message to NeuroAI Assistant")
async def chat(req: ChatRequest):
    """
    Proxies a conversation to Ollama Mistral and returns the assistant reply.
    Falls back to rule-based responses if Ollama is not available.
    """
    last_user_msg = next(
        (m.content for m in reversed(req.messages) if m.role == "user"), ""
    )

    # Try Ollama first (local, free LLM)
    try:
        import requests
        
        lang_instruction = (
            "जवाब हिंदी में दीजिए। मेडिकल टर्म्स अंग्रेजी में भी दे सकते हैं।"
            if req.lang == "hi" else "Reply in English."
        )
        system = f"{SYSTEM_PROMPT}\n{lang_instruction}"

        # Build conversation history
        conversation = []
        for m in req.messages[-10:]:  # last 10 messages for context
            if m.role in ("user", "assistant"):
                conversation.append(f"{m.role.capitalize()}: {m.content}")
        
        full_context = "\n".join(conversation)
        
        # Call Ollama Mistral on port 11434
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": f"{system}\n\nConversation:\n{full_context}\n\nAssistant:",
                "stream": False,
                "temperature": 0.7,
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            reply = data.get("response", "").strip()
            if reply:
                logger.info("Ollama response generated successfully")
                return {"reply": reply}
    
    except requests.exceptions.ConnectionError:
        logger.warning("Ollama not available on port 11434 - using fallback")
    except Exception as exc:
        logger.warning(f"Ollama error: {exc} - using fallback")

    # Fallback to rule-based responses
    return {"reply": _fallback(last_user_msg, req.lang or "en")}


def _fallback(msg: str, lang: str) -> str:
    m = msg.lower()
    
    # English responses
    if lang != "hi":
        # MRI & Scans
        if any(kw in m for kw in ["mri", "scan", "imaging", "radiography"]):
            return "MRI is a non-invasive imaging technique that provides detailed brain images. Our AI analyzes these scans for tumor detection. Upload your scan in the Detection section for immediate analysis. Always have a radiologist review results."
        
        # Tumors
        if any(kw in m for kw in ["tumor", "cancer", "mass", "lesion", "growth"]):
            return "Brain tumors can be primary (originating in the brain) or secondary (metastatic). Early detection significantly improves treatment outcomes. Use our Detection feature to analyze MRI scans, and always consult a neurologist for diagnosis and treatment planning."
        
        # Specific conditions
        if "glioma" in m:
            return "Gliomas are tumors from glial cells, graded I-IV by WHO. Grade IV (Glioblastoma) is most aggressive. Treatment: surgery, radiation, chemotherapy. Early neurosurgeon consultation is critical."
        if "meningioma" in m:
            return "Meningiomas are usually benign, arise from meninges. Most grow slowly. Treatment includes observation, surgery, radiation. Regular MRI monitoring essential."
        if "pituitary" in m or "adenoma" in m:
            return "Pituitary adenomas affect hormones. Treatment depends on size/function: medication, transsphenoidal surgery, or radiation. Endocrinology + neurosurgery consultation recommended."
        if "stroke" in m or "ischemic" in m:
            return "Brain strokes require emergency care. Seek immediate medical attention (call 911/emergency services). Time-critical treatments like thrombolytics can prevent permanent damage."
        
        # Symptoms
        if any(kw in m for kw in ["headache", "pain", "dizzy", "dizziness"]):
            return "Persistent headaches have multiple causes. If severe, recurring, or accompanied by vision changes, weakness, or confusion, seek immediate medical attention. Document frequency and severity."
        if any(kw in m for kw in ["memory", "forget", "cognitive"]):
            return "Memory issues can stem from various causes. Persistent cognitive changes warrant neurological evaluation. Maintain healthy habits: sleep, exercise, mental stimulation, stress management."
        if "seizure" in m or "convulsion" in m:
            return "Seizures require neurological evaluation. Report all episodes to a neurologist. Treatment depends on cause and type. Emergency care needed if seizing."
        
        # General info
        if any(kw in m for kw in ["brain health", "healthy brain", "prevention"]):
            return "Brain health tips: Stay physically active, maintain cognitive engagement, manage stress, ensure quality sleep, eat antioxidant-rich foods, maintain social connections. Regular check-ups important as you age."
        if "ai" in m or "artificial intelligence" in m:
            return "Our AI uses deep learning (Convolutional Neural Networks) to analyze brain MRI scans. It detects tumor patterns with high accuracy and provides heatmap visualization showing exact locations. Always consult medical professionals for final diagnosis."
        
        return "Thank you for your question. NeuroAI Assistant can help with: MRI analysis, tumor information, brain health tips, and scan interpretation. Please ask more specific questions about brain conditions or use our Detection feature. For emergencies, contact medical professionals immediately."
    
    # Hindi responses
    else:
        # MRI & Scans
        if any(kw in m for kw in ["mri", "स्कैन", "imaging", "तस्वीर"]):
            return "MRI एक non-invasive imaging तकनीक है जो दिमाग की विस्तृत तस्वीरें देती है। हमारा AI इन scans का विश्लेषण करके tumor detect करता है। Detection section में अपना scan upload करें और तुरंत analysis प्राप्त करें। हमेशा किसी radiologist से परिणाम की पुष्टि करवाएं।"
        
        # Tumors
        if any(kw in m for kw in ["ट्यूमर", "कैंसर", "गांठ", "वृद्धि"]):
            return "ब्रेन ट्यूमर primary (दिमाग में बने) या secondary (metastatic) हो सकते हैं। शुरुआती पता लगना treatment के परिणाम को बेहतर करता है। हमारे Detection feature से MRI scans का विश्लेषण करें और diagnosis के लिए neurologist से मिलें।"
        
        # Specific conditions
        if "ग्लियोमा" in m or "glioma" in m:
            return "ग्लियोमा glial cells से बने ट्यूमर हैं, WHO द्वारा Grade I-IV में classify हैं। Grade IV (Glioblastoma) सबसे aggressive है। इलाज: surgery, radiation, chemotherapy। तुरंत neurosurgeon से consultation लें।"
        if "मेनिंजियोमा" in m or "meningioma" in m:
            return "मेनिंजियोमा आमतौर पर benign होते हैं, meninges से बनते हैं। अधिकतर धीमी गति से बढ़ते हैं। इलाज: observation, surgery, radiation। नियमित MRI monitoring ज़रूरी है।"
        if "पिट्यूटरी" in m or "pituitary" in m:
            return "पिट्यूटरी adenomas hormones को प्रभावित करते हैं। इलाज size/function पर निर्भर करता है: medicine, transsphenoidal surgery, radiation। Endocrinology + neurosurgery consultation लें।"
        
        # Symptoms
        if any(kw in m for kw in ["सिरदर्द", "दर्द", "बेहोशी", "चक्कर"]):
            return "लगातार सिरदर्द के कई कारण हो सकते हैं। अगर severity बढ़ रही है या vision changes, weakness, confusion साथ हो तो तुरंत doctor जाएं। frequency और intensity record करें।"
        if any(kw in m for kw in ["याद", "भूलना", "memory", "cognitive"]):
            return "Memory issues कई कारणों से हो सकते हैं। लगातार cognitive changes के लिए neurological evaluation ज़रूरी है। Health tips: पर्याप्त नींद, व्यायाम, mental stimulation, stress management।"
        if "दौरा" in m or "seizure" in m:
            return "दौरे के लिए neurological evaluation ज़रूरी है। सभी episodes neurologist को report करें। Treatment cause और type पर निर्भर करता है। Emergency care लें अगर दौरा आ रहा हो।"
        
        # General info
        if any(kw in m for kw in ["दिमाग स्वास्थ्य", "स्वास्थ्य", "रोकथाम"]):
            return "दिमाग की health के लिए: Regular exercise, mental engagement, stress management, quality sleep, antioxidant-rich खाना, social connections। उम्र बढ़ने पर regular check-ups ज़रूरी हैं।"
        if "ai" in m or "artificial" in m or "कृत्रिम" in m:
            return "हमारा AI deep learning (CNN) use करता है brain MRI scans analyze करने के लिए। यह tumor patterns को high accuracy से detect करता है और heatmap से exact location दिखाता है। Final diagnosis के लिए doctors से consult करें।"
        
        return "आपके प्रश्न के लिए धन्यवाद। NeuroAI Assistant मदद कर सकता है: MRI analysis, tumor information, brain health tips, scan interpretation में। ज़्यादा specific सवाल पूछें या Detection feature use करें। Emergencies में तुरंत medical professionals को contact करें।"
