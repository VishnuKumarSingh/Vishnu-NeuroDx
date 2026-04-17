import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Brain, User, FileDown, RotateCcw, ChevronDown, ChevronUp,
} from 'lucide-react'

import UploadPanel from '../components/UploadPanel'
import ResultCard from '../components/ResultCard'
import HeatmapViewer from '../components/HeatmapViewer'
import ModelComparison from '../components/ModelComparison'
import AIExplanation from '../components/AIExplanation'
import LoadingOverlay from '../components/LoadingOverlay'

import { predictImage, explainPrediction, downloadReport } from '../services/api'
import { useScans } from '../hooks/useScans'
import { useLang }  from '../contexts/LangContext'
import type { PredictionResponse, AppState, PatientInfo } from '../types'

export default function Diagnose() {
  const { addScan } = useScans()
  const { t, lang }    = useLang()
  const [appState, setAppState] = useState<AppState>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [explanation, setExplanation] = useState<string>('')
  const [isExplaining, setIsExplaining] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [patient, setPatient] = useState<PatientInfo>({ name: '', age: '' })
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [showComparison, setShowComparison] = useState(true)

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file)
    setResult(null)
    setExplanation('')
    setAppState('idle')
  }, [])

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please upload an MRI image first.')
      return
    }

    try {
      // ── Step 1: Predict ─────────────────────────────────────────────────
      setAppState('predicting')
      const predResult = await predictImage(selectedFile)
      setResult(predResult)

      // ── Step 2: Explain ─────────────────────────────────────────────────
      setAppState('explaining')
      setIsExplaining(true)
      const exp = await explainPrediction(
        predResult.cnn.predicted_class,
        predResult.cnn.confidence,
        predResult.cnn.probabilities,
        patient.name || undefined,
      )
      setExplanation(exp)
      setIsExplaining(false)

      // Save to history
      const isTumor = predResult.cnn.predicted_class !== 'No Tumor'
      addScan({
        caseId:        'CASE-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        filename:      selectedFile!.name,
        result:        isTumor ? 'detected' : 'clear',
        tumorClass:    predResult.cnn.predicted_class,
        confidence:    predResult.cnn.confidence,
        date:          new Date().toISOString(),
        recommendation: isTumor ? t('report_rec') : t('report_rec_clear'),
        gradcam_image:  predResult.gradcam_image,
        original_image: predResult.original_image,
      })

      setAppState('done')
      toast.success(t('analysis_complete'))

    } catch (err: any) {
      setAppState('error')
      setIsExplaining(false)
      const msg = err?.response?.data?.detail ?? 'Analysis failed. Is the backend running?'
      toast.error(msg)
      console.error(err)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setResult(null)
    setExplanation('')
    setAppState('idle')
    setPatient({ name: '', age: '' })
  }

  const handleDownload = async () => {
    if (!result) return
    setIsDownloading(true)
    const toastId = toast.loading('Generating PDF report…')
    try {
      await downloadReport({
        patient_name:  patient.name || 'Anonymous',
        patient_age:   patient.age ? parseInt(patient.age) : null,
        prediction:    result.cnn,
        ml_results:    result.ml_models,
        gradcam_image: result.gradcam_image,
        original_image: result.original_image,
        explanation,
      })
      toast.success('Report downloaded!', { id: toastId })
    } catch (err: any) {
      toast.error('Report generation failed.', { id: toastId })
    } finally {
      setIsDownloading(false)
    }
  }

  const isLoading = appState === 'predicting' || appState === 'uploading'
  const isDone    = appState === 'done'

  return (
    <>
      <AnimatePresence>
        <LoadingOverlay state={appState} />
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="section-heading">AI Diagnosis Platform</p>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Brain size={24} className="text-blue-400" />
              Brain Tumor Analysis
            </h1>
          </div>
          {isDone && (
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <RotateCcw size={15} />
              New Analysis
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column: upload + patient ──────────────────────────────── */}
          <div className="space-y-5">
            {/* Upload panel */}
            <div className="glass-card p-6">
              <UploadPanel
                onFileSelected={handleFileSelected}
                disabled={isLoading}
              />
            </div>

            {/* Patient info (collapsible) */}
            <div className="glass-card overflow-hidden">
              <button
                onClick={() => setShowPatientForm(v => !v)}
                className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-400" />
                  Patient Information <span className="text-slate-500">(optional)</span>
                </div>
                {showPatientForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence initial={false}>
                {showPatientForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          className="input-dark"
                          placeholder="e.g. John Doe"
                          value={patient.name}
                          onChange={e => setPatient(p => ({ ...p, name: e.target.value }))}
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Age</label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          className="input-dark"
                          placeholder="e.g. 42"
                          value={patient.age}
                          onChange={e => setPatient(p => ({ ...p, age: e.target.value }))}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Analyze button */}
            <motion.button
              whileHover={!isLoading && selectedFile ? { scale: 1.03 } : {}}
              whileTap={!isLoading && selectedFile ? { scale: 0.97 } : {}}
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Brain size={20} />
                  {isDone ? 'Re-Analyze' : 'Start Analysis'}
                </>
              )}
            </motion.button>

            {/* Download report */}
            {isDone && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all duration-200 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 hover:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-green-300/30 border-t-green-300 rounded-full animate-spin" />
                    Generating PDF…
                  </>
                ) : (
                  <>
                    <FileDown size={20} className="text-green-400" />
                    Download PDF Report
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* ── Right column: results ───────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {!result && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-80 glass-card text-center p-10 space-y-4"
              >
                <Brain size={48} className="text-slate-600" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-400">No analysis yet</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Upload an MRI scan and click "Start Analysis"
                  </p>
                </div>
              </motion.div>
            )}

            {result && (
              <AnimatePresence>
                {/* CNN Result */}
                <ResultCard result={result.cnn} />

                {/* Heatmap */}
                {result.gradcam_image && result.original_image && (
                  <HeatmapViewer
                    originalImage={result.original_image}
                    gradcamImage={result.gradcam_image}
                  />
                )}

                {/* AI Explanation */}
                {(explanation || isExplaining) && (
                  <AIExplanation
                    explanation={explanation}
                    isLoading={isExplaining}
                  />
                )}

                {/* Model Comparison (collapsible) */}
                {result.model_comparison_stats && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowComparison(v => !v)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-slate-300"
                    >
                      <span>Model Comparison</span>
                      {showComparison ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence initial={false}>
                      {showComparison && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <ModelComparison
                            stats={result.model_comparison_stats}
                            mlResults={result.ml_models}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
