import { Routes, Route, Navigate } from 'react-router-dom'
import Landing     from './pages/Landing.jsx'
import AdminPortal from './pages/admin/AdminPortal.jsx'
import UserPortal  from './pages/user/UserPortal.jsx'
import Register    from './pages/Register.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Landing />}     />
      <Route path="/admin/*"  element={<AdminPortal />} />
      <Route path="/portal/*" element={<UserPortal />}  />
      <Route path="/registro" element={<Register />}    />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  )
}
