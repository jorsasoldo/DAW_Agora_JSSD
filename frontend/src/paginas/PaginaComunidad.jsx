import {useState, useEffect, useCallback} from 'react'

import {useParams, Link} from 'react-router-dom'

import {useAutentifica} from '../contexto/ContextoUsuario.jsx'

import TarjetaPublicacion from '../componentes/publicacion/TarjetaPublicacion.jsx'
import PanelModeracion from '../componentes/moderacion/PanelModeracion.jsx'

function ListaModeradoresSidebar({moderadores})
{
    const [nombres, setNombres] = useState({})

    useEffect(() =>
    {
        if(!moderadores?.length)
            return

        moderadores.forEach(async mod_id =>
        {
            try
            {
                const resp = await fetch(`/api/usuarios/${mod_id}`, {credentials: 'include'})

                if(resp.ok)
                {
                    const datos = await resp.json()
                    setNombres(prev => ({...prev, [mod_id]: datos.nombre_usuario || mod_id}))
                }
            }

            catch
            {

            }
        })
    }, [moderadores])

    return (
                <ul className="comunidad-sidebar-moderadores">

                    {moderadores.map(mod_id =>
                        (
                            <li key={mod_id} className="comunidad-sidebar-moderador">
                                <Link to={`/u/${nombres[mod_id] || mod_id}`} className="comunidad-sidebar-moderador-link">
                                    u/{nombres[mod_id] || '...'}
                                </Link>
                            </li>
                        )
                    )}
                </ul>
            )
}

export default function PaginaComunidad()
{
    const {id} = useParams()
    const {usuario} = useAutentifica()

    const [comunidad, setComunidad] = useState(null)
    const [publicaciones, setPublicaciones] = useState([])
    const [nombresAutores, setNombresAutores] = useState({})
    const [cargando, setCargando] = useState(true)
    const [cargandoPubs, setCargandoPubs] = useState(true)
    const [error, setError] = useState(null)
    const [suscrito, setSuscrito] = useState(false)
    const [cargandoSuscripcion, setCargandoSuscripcion] = useState(false)
    const [orden, setOrden] = useState('nuevo')

    const carga_comunidad = useCallback(async () =>
    {
        setCargando(true)

        setError(null)

        try
        {
            const resp = await fetch(`/api/comunidades/${id}`, {credentials: 'include'})

            if(!resp.ok)
                throw new Error(resp.status === 404 ? 'Comunidad no encontrada' : `Error ${resp.status}`)

            const datos = await resp.json()

            setComunidad(datos)

            //Chevca si el usuario ya está suscrito
            if(typeof datos.suscrito === 'boolean')
            {
                setSuscrito(datos.suscrito)
            }

            else
            {
                try
                {
                    const respMiembros = await fetch(`/api/comunidades/${id}/miembros`, {credentials: 'include'})

                    if(respMiembros.ok)
                    {
                        const miembros = await respMiembros.json()

                        setSuscrito(Array.isArray(miembros) && usuario?.id ? miembros.some(m => m.id === usuario.id) : false)
                    }

                    else if(usuario?.comunidades_suscritas)
                    {
                        setSuscrito(usuario.comunidades_suscritas.includes(id))
                    }
                }

                catch
                {
                    if(usuario?.comunidades_suscritas)
                        setSuscrito(usuario.comunidades_suscritas.includes(id))
                }
            }
        }

        catch(e)
        {
            setError(e.message)
        }

        finally
        {
            setCargando(false)
        }
    }, [id, usuario])

    const carga_publicaciones = useCallback(async () =>
    {
        setCargandoPubs(true)

        try
        {
            const resp = await fetch('/api/publicaciones', {credentials: 'include'})

            if(!resp.ok)
                return

            let datos = await resp.json()

            //Filtra solo las de esta comunidad
            datos = datos.filter(p => p.comunidad === id)

            if(orden === 'popular')
                datos = [...datos].sort((a, b) => b.puntaje_votos - a.puntaje_votos)

            //Muestra las fijadas primero
            datos = [...datos.filter(p => p.fijada), ...datos.filter(p => !p.fijada)]

            setPublicaciones(datos)

            //Encuentra nombres de autores
            const id_autor = [...new Set(datos.map(p => p.autor).filter(Boolean))]

            const mapa = {}

            await Promise.all(
                id_autor.map(async id_autor =>
                {
                    try
                    {
                        const resp = await fetch(`/api/usuarios/${id_autor}`, {credentials: 'include'})

                        if(resp.ok)
                        {
                            const usuario = await resp.json()

                            mapa[id_autor] = usuario.nombre_usuario || id_autor
                        }
                    }

                    catch
                    {
                    }
                })
            )

            setNombresAutores(mapa)
        }

        catch
        {
        }

        finally
        {
            setCargandoPubs(false)
        }
    }, [id, orden])

    useEffect(() => {carga_comunidad()}, [carga_comunidad])

    useEffect(() => {carga_publicaciones()}, [carga_publicaciones])

    async function maneja_suscripcion()
    {
        if(!usuario)
            return

        setCargandoSuscripcion(true)

        const endpoint= suscrito ? 'desuscribir' : 'suscribir'

        try
        {
            const resp = await fetch(`/api/comunidades/${id}/${endpoint}`, {method: 'POST', credentials: 'include'})

            if(resp.ok)
            {
                setSuscrito(!suscrito)

                //Actualiza el contador
                setComunidad(prev => prev ? { ...prev, total_miembros: prev.total_miembros + (suscrito ? -1 : 1) } : prev)
            }
        }

        catch
        {
        }

        finally
        {
            setCargandoSuscripcion(false)
        }
    }

    async function acepta_invitacion()
    {
        if(!usuario)
            return

        setCargandoSuscripcion(true)

        try
        {
            const resp = await fetch(`/api/comunidades/${id}/aceptar-invitacion`, {method: 'POST', credentials: 'include'})

            if(resp.ok)
            {
                setSuscrito(true)
                setComunidad(prev => prev ? {...prev, total_miembros: prev.total_miembros + 1} : prev)

                //Recarga para limpiar la invitacion pendiente
                carga_comunidad()
            }
        }

        catch
        {
        }

        finally
        {
            setCargandoSuscripcion(false)
        }
    }

    if(cargando)
    {
        return(
            <div className="pagina-inicio-estado">
                <div className="pagina-inicio-spinner" />
                <p className="pagina-inicio-estado-texto">Cargando comunidad...</p>
            </div>
        )
    }

    if(error)
    {
        return (
            <div className="pagina-inicio-estado">
                <p className="pagina-inicio-error">{error}</p>
                <Link to="/comunidades" className="btn-primary">
                    Ver todas las comunidades
                </Link>
            </div>
        )
    }

    const es_moderador = usuario && comunidad?.moderadores?.includes(usuario.id)

    const nombres_comunidad = comunidad ? {[id]: comunidad.nombre} : {}

    return (
        <div className="pagina-comunidad">
            {
            }
            <div className="pagina-comunidad-banner"
                 style={comunidad?.banner ? { backgroundImage: `url(${comunidad.banner})` } : {}}
            >
                <div className="pagina-comunidad-banner-contenido">
                    <div className="pagina-comunidad-identidad">
                        {comunidad?.icono ? <img src={comunidad.icono} alt={comunidad.nombre} className="pagina-comunidad-icono" />
                            :   (
                                    <div className="pagina-comunidad-icono-placeholder">
                                        {comunidad?.nombre?.slice(0, 2).toUpperCase() || 'C'}
                                    </div>
                                )
                        }

                        <div>
                            <h1 className="pagina-comunidad-nombre">c/{comunidad?.nombre}</h1>
                            <p className="pagina-comunidad-miembros">
                                {comunidad?.total_miembros?.toLocaleString('es-MX') || 0} miembro{comunidad?.total_miembros !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <div className="pagina-comunidad-acciones">
                        {usuario && !suscrito && comunidad?.es_privada && comunidad?.invitados_pendientes?.includes(usuario.id) &&
                            (
                                <button
                                    className="pagina-comunidad-btn-suscripcion"
                                    onClick={acepta_invitacion}
                                    disabled={cargandoSuscripcion}
                                >
                                    {cargandoSuscripcion ? '...' : 'Aceptar invitación'}
                                </button>
                            )
                        }

                        {usuario && (!comunidad?.es_privada || suscrito) &&
                            (
                                <button
                                    className={`pagina-comunidad-btn-suscripcion ${suscrito ? 'pagina-comunidad-btn-suscripcion--suscrito' : ''}`}
                                    onClick={maneja_suscripcion}
                                    disabled={cargandoSuscripcion}
                                >
                                    {cargandoSuscripcion
                                        ? '...'
                                        : suscrito ? 'Suscrito' : 'Unirse'
                                    }
                                </button>
                            )
                        }

                        <Link to={`/publicar?comunidad=${id}`} className="pagina-comunidad-btn-publicar">
                            Crear Publicación
                        </Link>
                    </div>
                </div>
            </div>
            {
            }
            <div className="pagina-comunidad-cuerpo">
                {
                }
                <div className="pagina-comunidad-feed">
                    <div className="pagina-inicio-encabezado">
                        <div className="pagina-inicio-controles">
                            <span className="pagina-inicio-controles-label">Ordenar:</span>

                            {[{valor: 'nuevo', etiqueta: 'Nuevo'}, {valor: 'popular', etiqueta: 'Popular'}].map(op =>
                                (
                                    <button
                                        key={op.valor}
                                        className={`pagina-inicio-btn-orden ${orden === op.valor ? 'pagina-inicio-btn-orden--activo' : ''}`}
                                        onClick={() => setOrden(op.valor)}
                                    >
                                        {op.etiqueta}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {cargandoPubs &&
                        (
                            <div className="pagina-inicio-estado">
                                <div className="pagina-inicio-spinner" />
                            </div>
                        )
                    }

                    {!cargandoPubs && publicaciones.length === 0 &&
                        (
                            <div className="pagina-inicio-estado">
                                <p className="pagina-inicio-estado-texto">
                                    Esta comunidad no tiene publicaciones todavía
                                </p>
                                <Link to={`/publicar?comunidad=${id}`} className="btn-primary pagina-inicio-btn-crear">
                                    Crear la primera publicación
                                </Link>
                            </div>
                        )
                    }

                    {!cargandoPubs && publicaciones.length > 0 &&
                        (
                            <div className="pagina-inicio-lista">
                                {publicaciones.map(pub =>
                                    (
                                        <TarjetaPublicacion
                                            key={pub.id}
                                            publicacion={pub}
                                            nombresComunidades={nombres_comunidad}
                                            nombresAutores={nombresAutores}
                                            es_moderador={es_moderador}
                                            al_eliminar={id_pub => setPublicaciones(prev => prev.filter(p => p.id !== id_pub))}
                                        />
                                    )
                                )}
                            </div>
                        )
                    }
                </div>
                {
                }
                <aside className="pagina-comunidad-sidebar">
                    {
                    }
                    <div className="comunidad-sidebar-tarjeta">
                        <div className="comunidad-sidebar-tarjeta-cabecera">
                            Acerca de c/{comunidad?.nombre}
                        </div>

                        <div className="comunidad-sidebar-tarjeta-cuerpo">
                            {comunidad?.descripcion
                                ? <p className="comunidad-sidebar-descripcion">{comunidad.descripcion}</p>
                                : <p className="comunidad-sidebar-descripcion comunidad-sidebar-descripcion--vacia">Sin descripción</p>
                            }

                            <div className="comunidad-sidebar-stat">
                                <span className="comunidad-sidebar-stat-numero">
                                    {comunidad?.total_miembros?.toLocaleString('es-MX') || 0}
                                </span>
                                <span className="comunidad-sidebar-stat-label">Miembros</span>
                            </div>

                            {comunidad?.es_privada &&
                                (
                                <span className="tarjeta-comunidad-privada">Comunidad privada</span>
                                )
                            }

                            {usuario &&
                                (
                                    <button
                                        className={`pagina-comunidad-btn-suscripcion pagina-comunidad-btn-suscripcion--bloque ${suscrito ? 'pagina-comunidad-btn-suscripcion--suscrito' : ''}`}
                                        onClick={maneja_suscripcion}
                                        disabled={cargandoSuscripcion}
                                    >
                                        {cargandoSuscripcion ? '...' : suscrito ? 'Suscrito' : 'Unirse a la comunidad'}
                                    </button>
                                )
                            }
                        </div>
                    </div>
                    {
                    }
                    {comunidad?.reglas?.length > 0 &&
                        (
                        <div className="comunidad-sidebar-tarjeta">
                            <div className="comunidad-sidebar-tarjeta-cabecera">
                                Reglas
                            </div>

                            <ol className="comunidad-sidebar-reglas">
                                {comunidad.reglas.map((regla, ind) =>
                                    (
                                        <li key={ind} className="comunidad-sidebar-regla">
                                            <span className="comunidad-sidebar-regla-titulo">
                                                {ind + 1}. {regla.titulo}
                                            </span>

                                            {regla.descripcion && (
                                                <p className="comunidad-sidebar-regla-desc">{regla.descripcion}</p>
                                            )}
                                        </li>
                                    )
                                )}
                            </ol>
                        </div>
                    )}
                    {
                    }

                    {comunidad?.moderadores?.length > 0 &&
                        (
                            <div className="comunidad-sidebar-tarjeta">
                                <div className="comunidad-sidebar-tarjeta-cabecera">
                                    Moderadores
                                </div>
                                <div className="comunidad-sidebar-tarjeta-cuerpo">
                                    <ListaModeradoresSidebar moderadores={comunidad.moderadores} />
                                </div>
                            </div>
                        )
                    }

                    {es_moderador &&
                        (
                            <PanelModeracion
                                comunidad_id={id}
                                es_moderador={es_moderador}
                                es_privada={comunidad?.es_privada}
                                al_agregar_moderador={carga_comunidad}
                                comunidad={comunidad}
                                al_actualizar_comunidad={carga_comunidad}
                            />
                        )
                    }
                </aside>
            </div>
        </div>
    )
}