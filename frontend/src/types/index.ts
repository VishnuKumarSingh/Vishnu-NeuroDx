// ── Shared TypeScript types ──────────────────────────────────────────────────

export interface ClassProbabilities {
  Glioma: number
  Meningioma: number
  'No Tumor': number
  'Pituitary Tumor': number
  [key: string]: number
}

export interface CNNResult {
  predicted_class: string
  confidence: number
  probabilities: ClassProbabilities
}

export interface MLModelResult {
  predicted_class: string
  confidence: number
  probabilities: ClassProbabilities
}

export interface MLResults {
  svm: MLModelResult
  random_forest: MLModelResult
}

export interface ModelComparisonStat {
  model: string
  accuracy: number
  precision: number
  recall: number
  f1_score: number
}

export interface PredictionResponse {
  cnn: CNNResult
  gradcam_image: string     // base64 PNG data URI
  original_image: string    // base64 PNG data URI
  ml_models: MLResults
  model_comparison_stats: ModelComparisonStat[]
}

export interface ExplainResponse {
  explanation: string
}

export interface PatientInfo {
  name: string
  age: string
}

// Persisted scan record (localStorage)
export interface ScanRecord {
  caseId: string
  filename: string
  result: 'detected' | 'clear'
  tumorClass: string
  confidence: number
  date: string
  recommendation: string
  gradcam_image?: string
  original_image?: string
}

// Chat message
export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  ts: string
  file?: string
}

// Feedback
export interface FeedbackRecord {
  text: string
  rating: number
  category: string
  date: string
  user: string
}

// UI state
export type AppState =
  | 'idle'
  | 'uploading'
  | 'predicting'
  | 'explaining'
  | 'done'
  | 'error'
