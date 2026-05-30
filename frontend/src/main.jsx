import {StrictMode} from 'react'

import {createRoot} from 'react-dom/client'

import App from './App.jsx'

import './styles.css'

import {VerificaAutenticacion} from './contexto/ContextoUsuario.jsx'

createRoot(document.getElementById('root')).render(<StrictMode><VerificaAutenticacion><App /></VerificaAutenticacion></StrictMode>)
