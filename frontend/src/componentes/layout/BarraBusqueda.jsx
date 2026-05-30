import {useState, useRef, useEffect} from 'react'

import {useNavigate, Link} from 'react-router-dom'

import {useAutentifica} from '../../contexto/ContextoUsuario.jsx'

export default function BarraBusqueda()
{
    const {usuario, logout} = useAutentifica()
    const navigate = useNavigate()
    const [busqueda, setBusqueda] = useState('')
    const [menuAbierto, setMenuAbierto] = useState(false)
    const ref = useRef(null)

    //Cierra el menu al hacer click fuera
    useEffect(() =>
    {
        function maneja_click_fuera(e)
        {
            if(ref.current && !ref.current.contains(e.target))
            {
                setMenuAbierto(false)
            }
        }

        document.addEventListener('mousedown', maneja_click_fuera)

        return () => document.removeEventListener('mousedown', maneja_click_fuera)}, [])

    function maneja_logout()
    {
        setMenuAbierto(false)
        logout()

        navigate('/login')
    }

    function maneja_busqueda(e)
    {
        e.preventDefault()

        if(busqueda.trim())
        {
            navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`)
            setBusqueda('')
        }
    }

    const iniciales = usuario?.nombre_usuario ? usuario.nombre_usuario.slice(0, 2).toUpperCase() : '??'

    return (
        <nav className="barra-busqueda">
            {
                //logo
            }
            <Link to="/" className="barra-busqueda-logo">
                <img src="/imagenes/Agora_logo.png" alt="Agora" className="navbar-logo-img" />
            </Link>
            {
                //buscador
            }
            <form className="barra-busqueda-search" onSubmit={maneja_busqueda}>
                <span className="barra-busqueda-icono-busqueda">
                    <img src="/imagenes/Icono_busqueda.png" alt="" aria-hidden="true" className="navbar-search-icon-img" />
                </span>
                <input
                    type="text"
                    className="navbar-search-input"
                    placeholder="Busca en Agora"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                />
            </form>

            {
                //Acciones
            }
            <div className="barra-busqueda-acciones">
                {usuario ? (
                    <div className="barra-busqueda-usuario" ref={ref}>
                        <button
                            className="navbar-avatar-btn"
                            onClick={() => setMenuAbierto(v => !v)}
                            aria-expanded={menuAbierto}
                            aria-label="Menú de usuario"
                        >
                            {usuario.foto_perfil ? (<img src={usuario.foto_perfil} alt={usuario.nombre_usuario} className="navbar-avatar-img"/>) : (
                                <span className="barra-busqueda-avatar-iniciales">{iniciales}</span>
                            )}
                            <span className="navbar-username">{usuario.nombre_usuario}</span>
                            <svg className={`navbar-chevron ${menuAbierto ? 'navbar-chevron--abierto' : ''}`}
                                 width="14" height="14" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {menuAbierto && (
                            <div className="barra-busqueda-dropdown">
                                <div className="barra-busqueda-dropdown-header">
                                    <span className="barra-busqueda-dropdown-nombre">{usuario.nombre_usuario}</span>
                                    <span className="barra-busqueda-dropdown-email">{usuario.email}</span>
                                </div>
                                <div className="barra-busqueda-dropdown-divider" />
                                <Link
                                    to={`/u/${usuario.nombre_usuario}`}
                                    className="navbar-dropdown-item"
                                    onClick={() => setMenuAbierto(false)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Mi perfil
                                </Link>
                                <Link
                                    to="/comunidades"
                                    className="navbar-dropdown-item"
                                    onClick={() => setMenuAbierto(false)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    Comunidades
                                </Link>
                                <div className="barra-busqueda-dropdown-divider" />
                                <button className="navbar-dropdown-item navbar-dropdown-item--logout" onClick={maneja_logout}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="barra-busqueda-botns-aut">
                        <Link to="/login" className="navbar-btn-login">Iniciar sesión</Link>
                        <Link to="/registro" className="navbar-btn-registro">Registrarse</Link>
                    </div>
                )}
            </div>
        </nav>
    )
}