import {Navigate} from 'react-router-dom'

import {useAutentifica} from '../contexto/ContextoUsuario.jsx'

export default function RutaPublica({ children })
{
    const {usuario, cargando} = useAutentifica()

    if(cargando)
    {
        return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p style={{ color: '#878a8c', fontSize: '14px' }}>Cargando…</p></div>)
    }

    if(usuario)
        return <Navigate to="/" replace />

    return children
}