import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './paginas/Login'

import Registro from './paginas/Registro'

import PerfilSetup from './paginas/PerfilSetup'

function App()
{
  return (<BrowserRouter><Routes><Route path="/login" element={<Login />} /><Route path="/registro" element={<Registro />} /><Route path="/perfil-setup" element={<PerfilSetup />} /><Route path="/" element={<Navigate to="/login" replace />} /></Routes></BrowserRouter>)
}

export default App