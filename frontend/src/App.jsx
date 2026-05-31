import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'

import Login from './paginas/Login'

import Registro from './paginas/Registro'

import PerfilSetup from './paginas/PerfilSetup'

import Inicio from './paginas/Inicio'

import RutaProtegida from './componentes/RutaProtegida'

import RutaPublica from './componentes/RutaPublica'

import LayoutPrincipal from './componentes/layout/LayoutPrincipal'

function App() {
  //Rutas publicas redirigen al inicio si ya hay una sesion
  //Rutas protegidas redirigen al login si no hay una sesion
  return (<BrowserRouter><Routes>{}<Route path="/login" element={<RutaPublica><Login /></RutaPublica>} /><Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} /><Route path="/perfil-setup" element={<RutaPublica><PerfilSetup /></RutaPublica>} />{}<Route path="/" element={<RutaProtegida><LayoutPrincipal><Inicio /></LayoutPrincipal></RutaProtegida>} />{}<Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter>)
}

export default App