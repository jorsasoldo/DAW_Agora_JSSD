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
                            <img
                                src={menuAbierto ? '/imagenes/flecha_arriba_perfil.png' : '/imagenes/flecha_abajo_perfil.png'}
                                alt={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                                className="navbar-chevron-img"
                            />
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
                                    <img
                                        src="/imagenes/perfil.png"
                                        alt=""
                                        aria-hidden="true"
                                        className="navbar-dropdown-icon-img"
                                    />
                                    Mi perfil
                                </Link>
                                <Link
                                    to="/comunidades"
                                    className="navbar-dropdown-item"
                                    onClick={() => setMenuAbierto(false)}
                                >
                                    <img
                                        src="/imagenes/comunidad.png"
                                        alt=""
                                        aria-hidden="true"
                                        className="navbar-dropdown-icon-img"
                                    />
                                    Comunidades
                                </Link>
                                <div className="barra-busqueda-dropdown-divider" />
                                <button className="navbar-dropdown-item navbar-dropdown-item--logout" onClick={maneja_logout}>
                                    <img
                                        src="/imagenes/cerrar_sesion.png"
                                        alt=""
                                        aria-hidden="true"
                                        className="navbar-dropdown-icon-img"
                                    />
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