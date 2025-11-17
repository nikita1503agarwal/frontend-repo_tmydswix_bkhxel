import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './App'
import Test from './Test'
import Login from './pages/Login'
import NewProposal from './pages/NewProposal'
import Preview from './pages/Preview'
import Proposals from './pages/Proposals'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/login" element={<Login />} />
        <Route path="/new-proposal" element={<NewProposal />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/proposals" element={<Proposals />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)