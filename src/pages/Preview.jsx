import { useEffect, useState } from 'react'

export default function Preview() {
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(()=>{
    const id = new URLSearchParams(window.location.search).get('id')
    if (!id) { setError('Missing proposal id'); setLoading(false); return }

    const load = async () => {
      try {
        const res = await fetch(`${backend}/api/proposals-docs/${id}`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setDoc(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [backend])

  const handleSend = async () => {
    alert('Email step would send DOCX/PDF to the current user with the provided subject/body.')
  }

  const handleRegenerate = async () => {
    if (!doc) return
    try {
      const res = await fetch(`${backend}/api/proposals-docs/${doc.id}/regenerate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeholdersJson: doc.placeholdersJson, status: 'draft' })
      })
      if (!res.ok) throw new Error('Failed to regenerate')
      const data = await res.json()
      window.location.href = `/preview?id=${data.id}`
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading…</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{doc.projectTitle}</h1>
            <p className="text-gray-600">Client: {doc.clientName}</p>
            <p className="text-gray-500 text-sm">Version {doc.version} — {doc.status}</p>
          </div>
          <div className="flex gap-3">
            <a href="#" className="px-4 py-2 rounded bg-gray-800 text-white" onClick={(e)=>{e.preventDefault(); alert('Download would fetch generated files')}}>Download</a>
            <button onClick={handleSend} className="px-4 py-2 rounded bg-blue-600 text-white">Email Draft</button>
            <button onClick={handleRegenerate} className="px-4 py-2 rounded bg-purple-600 text-white">Regenerate</button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800">Placeholders JSON</h2>
          <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-[70vh]">{JSON.stringify(doc.placeholdersJson, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
