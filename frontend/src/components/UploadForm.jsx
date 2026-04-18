import { useState, useRef } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000/verify-evidence/'

export default function UploadForm() {
  const [grievanceId, setGrievanceId] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!grievanceId || !latitude || !longitude || !imageFile) {
      setError('All fields are required. Please fill in all inputs and upload an image.')
      return
    }

    const formData = new FormData()
    formData.append('grievance_id', grievanceId)
    formData.append('target_latitude', latitude)
    formData.append('target_longitude', longitude)
    formData.append('image', imageFile)

    setLoading(true)
    try {
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(response.data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to connect to the verification server. Please ensure the backend is running at localhost:8000.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setGrievanceId('')
    setLatitude('')
    setLongitude('')
    setImageFile(null)
    setImagePreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isPassed = result?.verification_status === 'PASSED'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
      {/* Left: Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gov-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-gov-900 to-gov-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="font-heading text-white text-lg">Grievance Evidence Verification</h2>
              <p className="text-gov-300 text-xs mt-0.5">Submit field evidence for geo-tagged verification</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Grievance ID */}
          <div>
            <label className="block text-xs font-semibold text-gov-600 uppercase tracking-wider mb-1.5">
              Grievance ID
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gov-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </span>
              <input
                type="text"
                value={grievanceId}
                onChange={(e) => setGrievanceId(e.target.value)}
                placeholder="e.g. GRV-2024-00123"
                className="w-full pl-9 pr-4 py-2.5 border border-gov-200 rounded-lg text-sm text-gov-900
                  focus:outline-none focus:ring-2 focus:ring-gov-400 focus:border-transparent
                  placeholder-gov-300 font-mono transition"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gov-600 uppercase tracking-wider mb-1.5">
                Target Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 22.5726"
                className="w-full px-3 py-2.5 border border-gov-200 rounded-lg text-sm text-gov-900
                  focus:outline-none focus:ring-2 focus:ring-gov-400 focus:border-transparent
                  placeholder-gov-300 font-mono transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gov-600 uppercase tracking-wider mb-1.5">
                Target Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 88.3639"
                className="w-full px-3 py-2.5 border border-gov-200 rounded-lg text-sm text-gov-900
                  focus:outline-none focus:ring-2 focus:ring-gov-400 focus:border-transparent
                  placeholder-gov-300 font-mono transition"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gov-600 uppercase tracking-wider mb-1.5">
              Evidence Image
            </label>
            <div
              className="border-2 border-dashed border-gov-200 rounded-xl p-5 text-center cursor-pointer
                hover:border-gov-400 hover:bg-gov-50 transition-all duration-200"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-40 object-cover rounded-lg shadow"
                  />
                  <p className="text-xs text-gov-500 font-mono">{imageFile?.name}</p>
                </div>
              ) : (
                <div className="space-y-2 py-3">
                  <svg className="w-10 h-10 text-gov-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gov-500">Drop image here or <span className="text-gov-600 font-semibold">browse</span></p>
                  <p className="text-xs text-gov-400">JPEG, PNG, WEBP accepted</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm animate-slide-up">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gov-600 hover:bg-gov-700 active:bg-gov-800 text-white font-semibold
                py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Evidence
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 border border-gov-200 text-gov-600 rounded-lg hover:bg-gov-50
                text-sm font-medium transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Right: Result Panel */}
      <div className="flex flex-col gap-5">
        {result ? (
          <div className={`bg-white rounded-2xl shadow-xl border-2 overflow-hidden animate-slide-up
            ${isPassed ? 'border-green-400' : 'border-red-400'}`}>
            {/* Status Banner */}
            <div className={`px-6 py-5 ${isPassed
              ? 'bg-gradient-to-r from-green-600 to-emerald-500'
              : 'bg-gradient-to-r from-red-600 to-rose-500'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                  ${isPassed ? 'bg-green-400/30' : 'bg-red-400/30'}`}>
                  {isPassed ? '✅' : '❌'}
                </div>
                <div>
                  <p className="text-white/70 text-xs font-mono uppercase tracking-wider">Verification Result</p>
                  <h2 className="font-heading text-white text-2xl">{result.verification_status}</h2>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              {result.distance_message && (
                <div className={`rounded-xl px-4 py-3 flex items-center gap-3
                  ${isPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <svg className={`w-5 h-5 ${isPassed ? 'text-green-600' : 'text-red-500'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className={`text-sm font-medium ${isPassed ? 'text-green-800' : 'text-red-700'}`}>
                    {result.distance_message}
                  </p>
                </div>
              )}

              {/* Coordinates Table */}
              {(result.submitted_latitude !== undefined || result.target_latitude !== undefined) && (
                <div>
                  <p className="text-xs font-semibold text-gov-600 uppercase tracking-wider mb-2">
                    Coordinate Details
                  </p>
                  <div className="rounded-xl border border-gov-100 overflow-hidden text-sm font-mono">
                    {[
                      ['Grievance ID', result.grievance_id],
                      ['Submitted Lat', result.submitted_latitude ?? result.image_latitude],
                      ['Submitted Lng', result.submitted_longitude ?? result.image_longitude],
                      ['Target Lat', result.target_latitude],
                      ['Target Lng', result.target_longitude],
                      ['Distance (m)', result.distance_meters !== undefined ? `${result.distance_meters} m` : null],
                    ]
                      .filter(([, v]) => v !== null && v !== undefined)
                      .map(([label, value], i) => (
                        <div key={label} className={`flex justify-between px-4 py-2.5
                          ${i % 2 === 0 ? 'bg-white' : 'bg-gov-50'}`}>
                          <span className="text-gov-500 text-xs">{label}</span>
                          <span className="text-gov-900 text-xs font-semibold">{String(value)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Raw JSON fallback */}
              {!result.submitted_latitude && !result.image_latitude && (
                <div>
                  <p className="text-xs font-semibold text-gov-500 uppercase tracking-wider mb-2">Response Payload</p>
                  <pre className="bg-gov-950 text-green-300 rounded-xl p-4 text-xs overflow-auto max-h-48 font-mono">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-xl border border-gov-100 p-8 flex flex-col
            items-center justify-center text-center h-full min-h-64 gap-4">
            <div className="w-20 h-20 bg-gov-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gov-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="font-heading text-gov-700 text-lg">Awaiting Verification</p>
              <p className="text-gov-400 text-sm mt-1">
                Fill in the form and submit evidence to see the verification result here.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full mt-2">
              {['Submit Form', 'API Check', 'View Result'].map((step, i) => (
                <div key={step} className="bg-gov-50 rounded-lg px-3 py-2.5 text-center">
                  <div className="w-6 h-6 bg-gov-200 rounded-full flex items-center justify-center
                    text-gov-600 text-xs font-bold mx-auto mb-1">{i + 1}</div>
                  <p className="text-gov-500 text-xs">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-gov-900 rounded-2xl p-5 text-white text-sm shadow-xl">
          <p className="font-semibold text-accent-400 text-xs uppercase tracking-wider font-mono mb-2">
            How it works
          </p>
          <ul className="space-y-1.5 text-gov-300 text-xs leading-relaxed">
            <li className="flex gap-2"><span className="text-accent-400">→</span> Upload geo-tagged image as field evidence</li>
            <li className="flex gap-2"><span className="text-accent-400">→</span> System extracts EXIF coordinates from image</li>
            <li className="flex gap-2"><span className="text-accent-400">→</span> Compares with declared target location</li>
            <li className="flex gap-2"><span className="text-accent-400">→</span> Returns PASSED if within acceptable radius</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
