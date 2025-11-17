import { useState } from 'react'

function App() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const handleUpload = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!file) {
      setError('Please select an RFP file to upload (txt, pdf, docx).')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const res = await fetch(`${backend}/api/rfps/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const viewProposal = async () => {
    if (!result?.proposal_id) return
    try {
      const res = await fetch(`${backend}/api/proposals/${result.proposal_id}`)
      const data = await res.json()
      setResult({ ...result, proposal: data })
    } catch (err) {
      setError('Failed to fetch proposal')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">RFP → Proposal Generator</h1>
        <p className="text-gray-600 mb-6 text-center">Upload an RFP (TXT, PDF, DOCX). We’ll generate a structured proposal automatically.</p>

        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="file"
            accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border border-gray-300 rounded-lg p-3"
          />
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {uploading ? 'Generating…' : 'Upload & Generate'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Result</h2>
            <p className="text-gray-600">RFP saved. Proposal created.</p>
            <div className="mt-3 text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><span className="font-semibold">RFP ID:</span> {result.rfp_id}</div>
              <div><span className="font-semibold">Proposal ID:</span> {result.proposal_id}</div>
            </div>

            {!result.proposal && (
              <button onClick={viewProposal} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">View Generated Proposal</button>
            )}

            {result.proposal && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-2xl font-bold text-gray-900">{result.proposal.title}</h3>
                <p className="text-gray-700 mt-2">{result.proposal.summary}</p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded p-3"><span className="font-semibold">Client:</span> {result.proposal.client_name || '—'}</div>
                  <div className="bg-gray-50 rounded p-3"><span className="font-semibold">Project:</span> {result.proposal.project_name || '—'}</div>
                  <div className="bg-gray-50 rounded p-3"><span className="font-semibold">Due:</span> {result.proposal.due_date || '—'}</div>
                </div>

                <div className="mt-6 space-y-4">
                  {result.proposal.sections?.map((s, i) => (
                    <div key={i} className="">
                      <h4 className="text-lg font-semibold text-gray-800">{s.heading}</h4>
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">{s.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">Backend: {backend}</div>
      </div>
    </div>
  )
}

export default App
