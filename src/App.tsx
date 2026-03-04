import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Auth from './pages/Auth'
import Today from './pages/Today'
import Portfolio from './pages/Portfolio'
import ProjectDetail from './pages/ProjectDetail'
import AllTasks from './pages/AllTasks'
import Calendar from './pages/Calendar'
import Invitations from './pages/Invitations'
import AllowlistGuard from './components/auth/AllowlistGuard'
import Layout from './components/layout/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111114',
            color: '#e8e8f0',
            border: '1px solid #1e1e24',
          },
        }}
      />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<AllowlistGuard><Layout><Today /></Layout></AllowlistGuard>} />
        <Route path="/portfolio" element={<AllowlistGuard><Layout><Portfolio /></Layout></AllowlistGuard>} />
        <Route path="/project/:id" element={<AllowlistGuard><Layout><ProjectDetail /></Layout></AllowlistGuard>} />
        <Route path="/tasks" element={<AllowlistGuard><Layout><AllTasks /></Layout></AllowlistGuard>} />
        <Route path="/calendar" element={<AllowlistGuard><Layout><Calendar /></Layout></AllowlistGuard>} />
        <Route path="/invitations" element={<AllowlistGuard><Layout><Invitations /></Layout></AllowlistGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
