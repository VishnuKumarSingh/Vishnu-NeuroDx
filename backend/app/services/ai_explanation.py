"""
Generative AI Explanation Service
Converts model predictions into human-readable medical explanations
using the Anthropic Claude API (falls back to template if no key).
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# ── Template fallback ─────────────────────────────────────────────────────────

_TEMPLATES = {
    "Glioma": (
        "The MRI analysis indicates findings consistent with a **Glioma** tumor, "
        "a type of tumor that arises from the glial cells of the brain. "
        "Gliomas are the most common primary brain tumors, accounting for approximately "
        "33% of all brain tumors. They are classified by grade (WHO Grade I–IV), "
        "with higher grades indicating more aggressive behavior. "
        "The detected confidence level suggests a notable presence of characteristic "
        "imaging features such as irregular borders, signal intensity changes, and "
        "possible surrounding edema. "
        "**Immediate referral to a neuro-oncologist is strongly recommended** for "
        "confirmatory biopsy, MR spectroscopy, and treatment planning."
    ),
    "Meningioma": (
        "The MRI analysis indicates findings consistent with a **Meningioma**, "
        "a typically benign tumor arising from the meninges — the protective membranes "
        "surrounding the brain and spinal cord. Meningiomas account for approximately "
        "36% of all primary brain tumors and are more common in women aged 40–60. "
        "Most meningiomas are slow-growing and may remain asymptomatic for years. "
        "Key imaging features include a well-defined dural-based mass with homogeneous "
        "enhancement. "
        "**Neurosurgical consultation is recommended** to assess the size, location, "
        "and impact on surrounding structures before deciding on observation vs. intervention."
    ),
    "Pituitary Tumor": (
        "The MRI analysis indicates findings consistent with a **Pituitary Tumor** "
        "(pituitary adenoma), a growth on the pituitary gland at the base of the brain. "
        "Most pituitary tumors are benign and are classified as microadenomas (<10 mm) "
        "or macroadenomas (≥10 mm). They may be functioning (hormone-secreting) or "
        "non-functioning, and can cause visual disturbances, hormonal imbalances, or "
        "headaches depending on their size and activity. "
        "**Endocrinology and neurosurgery consultation is recommended** to evaluate "
        "hormonal profiles and determine appropriate management (medication, surgery, or radiation)."
    ),
    "No Tumor": (
        "The MRI analysis did **not detect** any significant tumor-like abnormalities "
        "in the provided scan. The image features are consistent with normal brain tissue "
        "morphology. No irregular masses, abnormal signal intensities, or characteristic "
        "tumor patterns were identified. "
        "While this is a reassuring finding, it is important to note that this AI tool "
        "is intended as a **screening aid only** and does not replace professional "
        "radiological or neurological evaluation. If symptoms persist, further imaging "
        "(e.g., contrast-enhanced MRI, PET scan) and clinical assessment are advised."
    ),
}

_DISCLAIMER = (
    "\n\n---\n*This AI-generated explanation is for informational purposes only and "
    "does not constitute medical advice. Always consult a qualified healthcare professional "
    "for diagnosis and treatment decisions.*"
)


async def generate_explanation(
    predicted_class: str,
    confidence: float,
    probabilities: dict,
    patient_name: Optional[str] = None,
) -> str:
    """
    Generate a medical explanation for the tumor prediction.

    Tries Claude API first; falls back to rich template if unavailable.
    """
    if ANTHROPIC_API_KEY:
        try:
            return await _claude_explanation(
                predicted_class, confidence, probabilities, patient_name
            )
        except Exception as exc:
            logger.warning(f"Claude API call failed, using template: {exc}")

    return _template_explanation(predicted_class, confidence, patient_name)


async def _claude_explanation(
    predicted_class: str,
    confidence: float,
    probabilities: dict,
    patient_name: Optional[str],
) -> str:
    """Call the Anthropic Claude API for a personalized explanation."""
    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    prob_text = "\n".join(
        f"  - {cls}: {prob:.1f}%" for cls, prob in probabilities.items()
    )
    patient_line = f"Patient name: {patient_name}" if patient_name else ""

    prompt = f"""You are a senior neuroradiologist writing a diagnostic impression for a clinical report.

An AI model analyzed an MRI scan and produced the following results:
- Primary Diagnosis: {predicted_class}
- Confidence: {confidence:.1f}%
- All class probabilities:
{prob_text}
{patient_line}

Write a concise, professional clinical impression in 3–4 paragraphs covering:
1. What the findings suggest and key imaging characteristics
2. Clinical significance and typical patient presentation
3. Recommended next steps (further imaging, specialist referral, etc.)
4. Important caveats about AI-assisted screening

Use plain language where possible. Do not exceed 350 words. Do NOT make definitive diagnoses."""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text.strip()
    return text + _DISCLAIMER


def _template_explanation(
    predicted_class: str,
    confidence: float,
    patient_name: Optional[str],
) -> str:
    """Return a rich canned explanation when the API is unavailable."""
    base = _TEMPLATES.get(predicted_class, _TEMPLATES["No Tumor"])
    header = ""
    if patient_name:
        header = f"**Patient:** {patient_name}\n\n"
    confidence_note = f"\n\n**Model Confidence:** {confidence:.1f}%"
    return header + base + confidence_note + _DISCLAIMER
