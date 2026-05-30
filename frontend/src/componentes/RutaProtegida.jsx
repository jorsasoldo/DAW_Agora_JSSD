import {Navigate, useLocation} from 'react-router-dom'

import {useAutentifica} from '../contexto/ContextoUsuario.jsx'

export default function RutaProtegida({ children })
{
    const {usuario, cargando} = useAutentifica()
    const localizacion = useLocation()

    if(cargando)
    {
        return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p style={{ color: '#878a8c', fontSize: '14px' }}>Cargando…</p></div>)
    }

    if(!usuario)
        return <Navigate to="/login" state={{ from: localizacion }} replace />

    return children
}