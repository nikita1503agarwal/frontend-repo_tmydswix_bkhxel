import { useEffect, useMemo, useState } from 'react'

const TRANSPARENT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAuMBgThmO8kAAAAASUVORK5CYII='

export default function NewProposal() {
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const [file, setFile] = useState(null)
  const [extracting, setExtracting] = useState(false)

  const [clientName, setClientName] = useState('')
  const [projectTitle, setProjectTitle] = useState('')

  const [team, setTeam] = useState([])
  const [teamOptions, setTeamOptions] = useState([])
  const [highlights, setHighlights] = useState([])
  const [highlightOptions, setHighlightOptions] = useState([])

  const [scope, setScope] = useState({
    stakeholderConsultation: true,
    dataCollection: true,
    modellingDepth: 'Standard',
  })

  const [deliverablesCount, setDeliverablesCount] = useState(5)
  const [placeholders, setPlaceholders] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=>{
    // fetch lists
    const load = async () => {
      try {
        const [tm, ph] = await Promise.all([
          fetch(`${backend}/api/team-members`).then(r=>r.json()),
          fetch(`${backend}/api/project-highlights`).then(r=>r.json()),
        ])
        setTeamOptions(tm || [])
        setHighlightOptions(ph || [])
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [backend])

  const handleExtract = async () => {
    if (!file) { setError('Please upload an RFP (PDF/DOCX).'); return }
    setError('')
    setExtracting(true)

    try {
      // Use existing upload endpoint to parse and heuristically extract names
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${backend}/api/rfps/upload`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()

      // Grab generated proposal to prefill client/project names
      const prop = await fetch(`${backend}/api/proposals/${data.proposal_id}`).then(r=>r.json())
      setClientName(prop.client_name || '')
      setProjectTitle(prop.project_name || prop.title || '')
    } catch (e) {
      setError(e.message)
    } finally {
      setExtracting(false)
    }
  }

  const toggleTeam = (id) => {
    setTeam(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }

  const toggleHighlight = (id) => {
    setHighlights(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }

  const buildAiPromptContext = () => {
    const selectedTeam = teamOptions.filter(t=>team.includes(t.id))
    const selectedHighlights = highlightOptions.filter(h=>highlights.includes(h.id))

    return {
      client_name: clientName || null,
      project_title: projectTitle || null,
      team: selectedTeam,
      highlights: selectedHighlights,
      scope,
      deliverablesCount,
    }
  }

  const generatePlaceholders = async () => {
    // In this environment, we simulate AI with a deterministic builder
    const ctx = buildAiPromptContext()

    const bullets = (str) => (str ? str.split('\n').map(s=>s.trim()).filter(Boolean) : [])

    const memberSlots = (idx) => {
      const member = (ctx.team[idx])
      return {
        [`Member${idx+1}Name`]: member?.name || '',
        [`Member${idx+1}Role`]: member?.role || '',
        [`Member${idx+1}TitleQual`]: member?.titleQual || '',
        [`Member${idx+1}Blurb`]: member?.blurb || '',
        [`Member${idx+1}Bullets`]: bullets(member?.bullets) || [],
        [`Member${idx+1}Photo`]: member?.photo_url || TRANSPARENT,
      }
    }

    const out = {
      ClientName: ctx.client_name || 'Client',
      ProjectTitle: ctx.project_title || 'Project',
      CoverLetter: 'Thank you for the opportunity to submit this proposal. Our team will deliver a practical, evidence-based approach aligned to the Terms of Reference.',
      ProjectBackground: 'Based on the RFP materials provided, we understand the project requires an applied economic lens with clear deliverables and milestones.',
      ProjectUnderstanding: 'We understand the objectives and will deliver the scope accordingly. Objectives will be refined during initiation.',
      Methodology: `Stage 1: Project Initiation & Start-up\n- Mobilise team\n- Inception meeting\n- Confirm scope and schedule`,
      DeliverablesText: 'AEC will deliver the following during the project:\n- ...',
      AssumptionsText: 'Key assumptions made in the development of the above scope of works include:\n- ...',
      ExclusionsText: 'The following are assumed to be excluded from the preceding scope of works:\n- ...',
      TeamOverviewText: 'The AEC team brings relevant experience and qualifications to deliver the assignment efficiently.',
      ProjectExperience: '- Example highlight 1.\n- Example highlight 2.',
      CaseStudiesText: 'Case studies will be tailored to the client sector and project type.',
      ScheduleSummaryText: 'Activities will progress through initiation, analysis and reporting with logical sequencing.',
      InvoicingSchedule: '- Milestone 1 – 40%\n- Milestone 2 – 40%\n- Milestone 3 – 20%',
      ...memberSlots(0),
      ...memberSlots(1),
      ...memberSlots(2),
    }

    setPlaceholders(out)
  }

  const createProposalDoc = async () => {
    setCreating(true)
    setError('')
    try {
      const res = await fetch(`${backend}/api/proposals-docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          projectTitle,
          placeholdersJson: placeholders || {},
          teamMemberIds: team,
          projectHighlightIds: highlights,
          status: 'draft',
        })
      })
      if (!res.ok) throw new Error('Failed to save proposal')
      const data = await res.json()
      window.location.href = `/preview?id=${data.id}`
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Create a New Proposal</h1>
        <p className="text-gray-600 mt-1">Upload the RFP, extract key details, select team and highlights, then generate.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800">Upload RFP</h2>
            <input type="file" accept=".pdf,.docx" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="mt-3 w-full border rounded p-3" />
            <div className="mt-3 flex gap-3">
              <button onClick={handleExtract} disabled={!file || extracting} className={`px-4 py-2 rounded text-white ${extracting? 'bg-gray-400':'bg-blue-600 hover:bg-blue-700'}`}>{extracting? 'Extracting…':'Extract key details'}</button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input value={clientName} onChange={(e)=>setClientName(e.target.value)} className="w-full border rounded p-3" placeholder="Client Pty Ltd" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input value={projectTitle} onChange={(e)=>setProjectTitle(e.target.value)} className="w-full border rounded p-3" placeholder="Project Title" />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Scope options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={scope.stakeholderConsultation} onChange={(e)=>setScope(s=>({...s, stakeholderConsultation: e.target.checked}))} /> Stakeholder consultation</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={scope.dataCollection} onChange={(e)=>setScope(s=>({...s, dataCollection: e.target.checked}))} /> Data collection</label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelling depth</label>
                  <select value={scope.modellingDepth} onChange={(e)=>setScope(s=>({...s, modellingDepth: e.target.value}))} className="w-full border rounded p-2">
                    <option>Light</option>
                    <option>Standard</option>
                    <option>Deep</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables count</label>
                  <input type="number" min={1} max={20} value={deliverablesCount} onChange={(e)=>setDeliverablesCount(parseInt(e.target.value||'1'))} className="w-full border rounded p-2" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={generatePlaceholders} className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700">Generate placeholders</button>
              {placeholders && <button onClick={createProposalDoc} className="px-4 py-2 rounded text-white bg-purple-600 hover:bg-purple-700">Save & Continue</button>}
            </div>

            {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800">Pick Team (multi-select)</h2>
            <div className="mt-2 space-y-2">
              {teamOptions.map(t=> (
                <label key={t.id} className="flex items-start gap-3">
                  <input type="checkbox" checked={team.includes(t.id)} onChange={()=>toggleTeam(t.id)} />
                  <div>
                    <div className="font-medium">{t.name} <span className="text-gray-500">— {t.role}</span></div>
                    <div className="text-xs text-gray-500">{t.titleQual}</div>
                  </div>
                </label>
              ))}
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mt-6">Pick Project Highlights</h2>
            <div className="mt-2 space-y-2">
              {highlightOptions.map(h=> (
                <label key={h.id} className="flex items-start gap-3">
                  <input type="checkbox" checked={highlights.includes(h.id)} onChange={()=>toggleHighlight(h.id)} />
                  <div>
                    <div className="font-medium">{h.title} <span className="text-gray-500">{h.sector? `— ${h.sector}`: ''}</span></div>
                    <div className="text-xs text-gray-500 line-clamp-2">{h.summary}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {placeholders && (
          <div className="mt-6 bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800">Preview placeholders</h2>
            <pre className="mt-3 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-80">{JSON.stringify(placeholders, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
