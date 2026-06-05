import {useState, useEffect} from 'react'

import {useSearchParams, Link} from 'react-router-dom'

export default function PaginaBusqueda()
{
    const [searchParams] = useSearchParams()
    const q = searchParams.get('q') || ''

    const [resultados, setResultados] = useState({comunidades: [], publicaciones: [], usuarios: []})
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null)
    const [ventana, setVentana] = useState('todo')

    useEffect(() =>
    {
        if(!q.trim())
            return

        setCargando(true)
        setError(null)

        fetch(`/api/buscar?q=${encodeURIComponent(q)}`, {credentials: 'include'}).then(r =>
            {
                if(!r.ok)
                    throw new Error(`Error ${r.status}`)

                return r.json()
            }).then(datos => setResultados(datos)).catch(e => setError(e.message)).finally(() => setCargando(false))
    }, [q])

    const total = resultados.comunidades.length + resultados.publicaciones.length + resultados.usuarios.length

    const ventanas =
        [
            {id: 'todo', label: `Todo (${total})` },
            {id: 'comunidades', label: `Comunidades (${resultados.comunidades.length})`},
            {id: 'publicaciones', label: `Publicaciones (${resultados.publicaciones.length})`},
            {id: 'usuarios', label: `Usuarios (${resultados.usuarios.length})`},
        ]

    const muestra_comunidades = ventana === 'todo' || ventana === 'comunidades'
    const muestra_publicaciones = ventana === 'todo' || ventana === 'publicaciones'
    const muestra_usuarios = ventana === 'todo' || ventana === 'usuarios'

    return (
        <div className="pagina-busqueda">
            <div className="pagina-busqueda-encabezado">
                <h1 className="pagina-busqueda-titulo">
                    Resultados para: <span className="pagina-busqueda-termino">"{q}"</span>
                </h1>
            </div>

            <div className="pagina-busqueda-tabs">
                {ventanas.map(t =>
                    (
                        <button
                            key={t.id}
                            className={`pagina-busqueda-tab ${ventana === t.id ? 'pagina-busqueda-tab--activo' : ''}`}
                            onClick={() => setVentana(t.id)}
                        >
                            {t.label}
                        </button>
                    )
                )}
            </div>

            {cargando &&
                (
                    <div className="pagina-inicio-estado">
                        <div className="pagina-inicio-spinner" />
                        <p className="pagina-inicio-estado-texto">Buscando...</p>
                    </div>
                )
            }

            {!cargando && error &&
                (
                    <div className="pagina-inicio-estado">
                        <p className="pagina-inicio-error">{error}</p>
                    </div>
                )
            }

            {!cargando && !error && total === 0 &&
                (
                    <div className="pagina-inicio-estado">
                        <p className="pagina-inicio-estado-texto">No se encontraron resultados para "{q}"</p>
                    </div>
                )
            }

            {!cargando && !error && total > 0 &&
                (
                    <div className="pagina-busqueda-resultados">

                        {muestra_comunidades && resultados.comunidades.length > 0 && (
                            <section className="pagina-busqueda-seccion">
                                <h2 className="pagina-busqueda-seccion-titulo">Comunidades</h2>
                                <div className="pagina-busqueda-lista">
                                    {resultados.comunidades.map(c =>
                                        (
                                            <Link key={c.id} to={`/c/${c.id}`} className="pagina-busqueda-item pagina-busqueda-item--comunidad">
                                                {c.icono
                                                    ? <img src={c.icono} alt={c.nombre} className="pagina-busqueda-item-avatar" />
                                                    : <div className="pagina-busqueda-item-avatar pagina-busqueda-item-avatar--placeholder">{c.nombre.slice(0, 2).toUpperCase()}</div>
                                                }
                                                <div className="pagina-busqueda-item-info">
                                                    <span className="pagina-busqueda-item-nombre">c/{c.nombre}</span>
                                                    {c.descripcion && <span className="pagina-busqueda-item-desc">{c.descripcion}</span>}
                                                    <span className="pagina-busqueda-item-meta">{c.total_miembros?.toLocaleString('es-MX') || 0} miembros</span>
                                                </div>
                                                {c.es_privada && <span className="tarjeta-comunidad-privada">Privada</span>}
                                            </Link>
                                        )
                                    )}
                                </div>
                            </section>
                        )}

                        {muestra_publicaciones && resultados.publicaciones.length > 0 &&
                            (
                                <section className="pagina-busqueda-seccion">
                                    <h2 className="pagina-busqueda-seccion-titulo">Publicaciones</h2>
                                    <div className="pagina-busqueda-lista">
                                        {resultados.publicaciones.map(p =>
                                            (
                                                <Link key={p.id} to={`/p/${p.id}`} className="pagina-busqueda-item pagina-busqueda-item--publicacion">
                                                    <div className="pagina-busqueda-item-info">
                                                        <span className="pagina-busqueda-item-nombre">{p.titulo}</span>
                                                        <span className="pagina-busqueda-item-meta">
                                                            {p.puntaje_votos} votos · {p.total_comentarios} comentarios
                                                        </span>
                                                    </div>
                                                </Link>
                                            ))}
                                    </div>
                                </section>
                            )
                        }

                        {muestra_usuarios && resultados.usuarios.length > 0 &&
                            (
                                <section className="pagina-busqueda-seccion">
                                    <h2 className="pagina-busqueda-seccion-titulo">Usuarios</h2>
                                    <div className="pagina-busqueda-lista">
                                        {resultados.usuarios.map(u =>
                                            (
                                                <Link key={u.id} to={`/u/${u.nombre_usuario}`} className="pagina-busqueda-item pagina-busqueda-item--usuario">
                                                    {u.foto_perfil
                                                        ? <img src={u.foto_perfil} alt={u.nombre_usuario} className="pagina-busqueda-item-avatar" />
                                                        : <div className="pagina-busqueda-item-avatar pagina-busqueda-item-avatar--placeholder">{u.nombre_usuario.slice(0, 2).toUpperCase()}</div>
                                                    }
                                                    <div className="pagina-busqueda-item-info">
                                                        <span className="pagina-busqueda-item-nombre">u/{u.nombre_usuario}</span>
                                                        <span className="pagina-busqueda-item-meta">{u.karma} karma</span>
                                                    </div>
                                                </Link>
                                            ))}
                                    </div>
                                </section>
                        )
                    }
                </div>
                )
            }
        </div>
    )
}