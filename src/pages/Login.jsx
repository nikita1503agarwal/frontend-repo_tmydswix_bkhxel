import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    // Built-in auth placeholder: accept any email/password for demo
    setTimeout(() => {
      setLoading(false)
      setMessage('Signed in. You can now create a new proposal.')
      window.location.href = '/new-proposal'
    }, 600)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Sign in</h1>
        <p className="text-gray-600 mb-6 text-center">Use your work email to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{loading ? 'Signing in…' : 'Continue'}</button>
        </form>

        {message && <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">{message}</div>}

        <div className="mt-6 text-sm text-center text-gray-500">
          By continuing you agree to our Terms and Privacy Policy.
        </div>
      </div>
    </div>
  )
}
