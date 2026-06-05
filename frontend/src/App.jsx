import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'

import Login from './paginas/Login'
import Registro from './paginas/Registro'
import PerfilSetup from './paginas/PerfilSetup'
import Inicio from './paginas/Inicio'
import Comunidades from './paginas/Comunidades'
import PaginaComunidad from './paginas/PaginaComunidad'
import PaginaPublicacion from './paginas/PaginaPublicacion'
import PaginaCrearPublicacion from './paginas/PaginaCrearPublicacion'
import PaginaPerfil from './paginas/PaginaPerfil'
import PaginaBusqueda from './paginas/PaginaBusqueda'

import RutaProtegida from './componentes/RutaProtegida'
import RutaPublica from './componentes/RutaPublica'
import LayoutPrincipal from './componentes/layout/LayoutPrincipal'

function App() {
  //Rutas publicas redirigen al inicio si ya hay una sesion
  //Rutas protegidas redirigen al login si no hay una sesion
  return (<BrowserRouter><Routes>{}<Route path="/login" element={<RutaPublica><Login /></RutaPublica>} /><Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} /><Route path="/perfil-setup" element={<RutaPublica><PerfilSetup /></RutaPublica>} />{}<Route path="/" element={<RutaProtegida><LayoutPrincipal><Inicio /></LayoutPrincipal></RutaProtegida>} /><Route path="/comunidades" element={<RutaProtegida><LayoutPrincipal><Comunidades /></LayoutPrincipal></RutaProtegida>} /><Route path="/c/:id" element={<RutaProtegida><LayoutPrincipal><PaginaComunidad /></LayoutPrincipal></RutaProtegida>} /><Route path="/p/:id" element={<RutaProtegida><LayoutPrincipal><PaginaPublicacion /></LayoutPrincipal></RutaProtegida>} /><Route path="/publicar" element={<RutaProtegida><LayoutPrincipal><PaginaCrearPublicacion /></LayoutPrincipal></RutaProtegida>} />{}<Route path="/u/:nombreUsuario" element={<RutaProtegida><LayoutPrincipal><PaginaPerfil /></LayoutPrincipal></RutaProtegida>} /><Route path="/buscar" element={<RutaProtegida><LayoutPrincipal><PaginaBusqueda /></LayoutPrincipal></RutaProtegida>} />{}<Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter>)
}

export default App