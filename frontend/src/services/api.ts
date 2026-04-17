import axios from 'axios'
import type { PredictionResponse, ExplainResponse } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,  // 2 min — model inference can be slow on first call
})

// ── Endpoints ─────────────────────────────────────────────────────────────────

/**
 * Upload an MRI image file and get predictions + Grad-CAM.
 */
export async function predictImage(file: File): Promise<PredictionResponse> {
  const form = new FormData()
  form.append('file', file)

  const { data } = await api.post<PredictionResponse>('/predict', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * Generate AI clinical explanation for a prediction.
 */
export async function explainPrediction(
  predictedClass: string,
  confidence: number,
  probabilities: Record<string, number>,
  patientName?: string,
): Promise<string> {
  const { data } = await api.post<ExplainResponse>('/explain', {
    predicted_class: predictedClass,
    confidence,
    probabilities,
    patient_name: patientName,
  })
  return data.explanation
}

/**
 * Generate and download a PDF report.
 */
export async function downloadReport(payload: {
  patient_name: string
  patient_age: number | null
  prediction: object
  ml_results: object
  gradcam_image: string
  original_image: string
  explanation: string
}): Promise<void> {
  const response = await api.post('/generate-report', payload, {
    responseType: 'blob',
  })

  const url = URL.createObjectURL(
    new Blob([response.data], { type: 'application/pdf' })
  )
  const a = document.createElement('a')
  a.href = url
  a.download = `NeuroAI_Report_${Date.now()}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Send a message to the NeuroAI chat assistant (server-side API key).
 */
export async function sendChatMessage(
  messages: { role: string; content: string }[],
  lang: 'en' | 'hi' = 'en',
): Promise<string> {
  const { data } = await api.post<{ reply: string }>('/chat', { messages, lang })
  return data.reply
}

export default api
