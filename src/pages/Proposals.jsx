import { useEffect, useState } from 'react'

export default function Proposals() {
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load = async () => {
      try {
        const res = await fetch(`${backend}/api/proposals-docs`)
        const data = await res.json()
        setItems(data)
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [backend])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading…</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <a href="/new-proposal" className="px-4 py-2 rounded bg-blue-600 text-white">New Proposal</a>
        </div>

        <div className="mt-6 grid gap-4">
          {items.map(item => (
            <a key={item.id} href={`/preview?id=${item.id}`} className="block bg-white rounded-xl shadow p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{item.projectTitle}</div>
                  <div className="text-sm text-gray-600">{item.clientName}</div>
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">v{item.version}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Status: {item.status}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
