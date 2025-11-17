import { useState } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">RFP → Proposal Generator</h1>
        <p className="text-gray-600 mb-6 text-center">Upload an RFP and generate a structured proposal. Use the pages below to complete the workflow.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/login" className="block p-4 rounded-lg border hover:shadow bg-white">Login</Link>
          <Link to="/new-proposal" className="block p-4 rounded-lg border hover:shadow bg-white">New Proposal</Link>
          <Link to="/preview" className="block p-4 rounded-lg border hover:shadow bg-white">Preview</Link>
          <Link to="/proposals" className="block p-4 rounded-lg border hover:shadow bg-white">Proposals</Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">Backend: {backend}</div>
      </div>
    </div>
  )
}

export default Home
