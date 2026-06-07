import {useState, useEffect, useCallback, useRef} from 'react'

import {useParams, Link} from 'react-router-dom'

import {useAutentifica} from '../contexto/ContextoUsuario.jsx'

import TarjetaPublicacion from '../componentes/publicacion/TarjetaPublicacion.jsx'

export default function PaginaPerfil()
{
    const {nombreUsuario} = useParams()
    const {usuario, login, verifica_sesion} = useAutentifica()

    const [perfil, setPerfil] = useState(null)
    const [publicaciones, setPublicaciones] = useState([])
    const [nombresComunidades, setNombresComunidades] = useState({})
    const [nombresAutores, setNombresAutores] = useState({})
    const [cargando, setCargando] = useState(true)
    const [cargandoPubs, setCargandoPubs] = useState(true)
    const [error, setError] = useState(null)
    const [editando, setEditando] = useState(false)

    //Si el perfil que esta viendo es del propio usuario logeado
    const es_propio = usuario && perfil && usuario.nombre_usuario === perfil.nombre_usuario

    //Carga el perfil
    const carga_perfil = useCallback(async () =>
    {
        setCargando(true)
        setError(null)

        try
        {
            let datos = null

            if(usuario && usuario.nombre_usuario === nombreUsuario)
            {
                //Si es el propio usuario se usa los datos del contexto para obtener el id
                const resp = await fetch(`/api/usuarios/${usuario.id}`, {credentials: 'include'})

                if(!resp.ok)
                    throw new Error(`Error ${resp.status} al cargar el perfil`)

                datos = await resp.json()
            }

            else
            {
                //Busca por nombre de usuario
                const resp = await fetch(`/api/usuarios/buscar?nombre_usuario=${encodeURIComponent(nombreUsuario)}`, {credentials: 'include'})

                if(resp.ok)
                    datos = await resp.json()
            }

            if(!datos)
                throw new Error('Usuario no encontrado')

            setPerfil(datos)
        }

        catch(e)
        {
            setError(e.message)
        }

        finally
        {
            setCargando(false)
        }
    }, [nombreUsuario, usuario])

    const carga_publicaciones = useCallback(async () =>
    {
        if(!perfil)
            return

        setCargandoPubs(true)

        try
        {
            const resp = await fetch(`/api/publicaciones?autor=${encodeURIComponent(perfil.id)}&limite=100`, {credentials: 'include'})

            if(!resp.ok)
                return

            const datos = await resp.json()
            const del_usuario = datos.publicaciones ?? []

            setPublicaciones(del_usuario)

            //Encuentra nombres de comunidades
            const ids_comunidades = [...new Set(del_usuario.map(p => p.comunidad).filter(Boolean))]
            const mapa_comunidades = {}

            await Promise.all
            (
                ids_comunidades.map(async id =>
                {
                    try
                    {
                        const res = await fetch(`/api/comunidades/${id}`, { credentials: 'include' })

                        if(res.ok)
                        {
                            const c = await res.json()
                            mapa_comunidades[id] = c.nombre || id
                        }
                    }

                    catch
                    {

                    }
                })
            )

            setNombresComunidades(mapa_comunidades)
            setNombresAutores({[perfil.id]: perfil.nombre_usuario})
        }

        catch
        {

        }

        finally
        {
            setCargandoPubs(false)
        }
    }, [perfil])

    useEffect(() => {carga_perfil()}, [carga_perfil])

    useEffect(() => {if(perfil) carga_publicaciones()}, [perfil, carga_publicaciones])

    if(cargando)
    {
        return  (
                    <div className="pagina-inicio-estado">
                        <div className="pagina-inicio-spinner" />
                        <p className="pagina-inicio-estado-texto">Cargando perfil...</p>
                    </div>
                )
    }

    if(error || !perfil)
    {
        return (
                    <div className="pagina-inicio-estado">
                        <p className="pagina-inicio-error">{error || 'Usuario no encontrado'}</p>
                        <Link to="/" className="btn-primary perfil-btn-volver">Volver al inicio</Link>
                    </div>
                )
    }

    return (
        <div className="pagina-perfil">
            {
                //Cabecera del peerfil
            }
            <div className="perfil-cabecera">
                <div className="perfil-cabecera-banner" />

                <div className="perfil-cabecera-contenido">
                    <div className="perfil-avatar-contenedor">
                        <img
                            src={perfil.foto_perfil || '/imagenes/no_foto.png'}
                            alt={`Avatar de ${perfil.nombre_usuario}`}
                            className="perfil-avatar"
                        />
                    </div>

                    <div className="perfil-identidad">
                        <h1 className="perfil-nombre-usuario">u/{perfil.nombre_usuario}</h1>

                        {perfil.biografia &&
                            (
                                <p className="perfil-biografia">{perfil.biografia}</p>
                            )
                        }

                        {!perfil.biografia && es_propio &&
                            (
                                <p className="perfil-biografia perfil-biografia--vacia">
                                    Aún no has añadido una biografía
                                </p>
                            )
                        }
                    </div>

                    <div className="perfil-estadisticas">
                        <div className="perfil-stat">
                            <span className="perfil-stat-numero">{perfil.karma ?? 0}</span>
                            <span className="perfil-stat-etiqueta">Karma</span>
                        </div>

                        <div className="perfil-stat">
                            <span className="perfil-stat-numero">{publicaciones.length}</span>
                            <span className="perfil-stat-etiqueta">Publicaciones</span>
                        </div>

                        {perfil.creado_en &&
                            (
                                <div className="perfil-stat">
                                    <span className="perfil-stat-numero">
                                        {new Date(perfil.creado_en).toLocaleDateString('es-MX', {month: 'short', year: 'numeric'})}
                                    </span>
                                    <span className="perfil-stat-etiqueta">Miembro desde</span>
                                </div>
                            )
                        }
                    </div>

                    {es_propio &&
                        (
                        <button
                                className="perfil-btn-editar"
                                onClick={() => setEditando(true)}
                            >
                                Editar perfil
                            </button>
                        )
                    }
                </div>
            </div>

            {
                //Publicaciones dele usuario
            }
            <section className="perfil-publicaciones">
                <h2 className="perfil-publicaciones-titulo">
                    Publicaciones de u/{perfil.nombre_usuario}
                </h2>

                {cargandoPubs &&
                    (
                        <div className="pagina-inicio-estado">
                            <div className="pagina-inicio-spinner" />
                            <p className="pagina-inicio-estado-texto">Cargando publicaciones...</p>
                        </div>
                    )
                }

                {!cargandoPubs && publicaciones.length === 0 &&
                    (
                        <div className="pagina-inicio-estado">
                            <p className="pagina-inicio-estado-texto">
                                {es_propio ? 'Aún no has hecho ninguna publicación' : 'Este usuario aún no ha hecho publicaciones'}
                            </p>

                            {es_propio &&
                                (
                                    <Link to="/publicar" className="btn-primary perfil-btn-volver">
                                        Crear primera publicación
                                    </Link>
                                )
                            }
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
                                        nombresComunidades={nombresComunidades}
                                        nombresAutores={nombresAutores}
                                    />
                                )
                            )}
                        </div>
                    )
                }
            </section>
            {
                //Modal de edicion de perfil
            }
            {editando &&
                (
                    <ModalEditarPerfil
                        perfil={perfil}

                        al_guardar={async (datos_actualizados) =>
                        {
                            setPerfil(prev => ({ ...prev, ...datos_actualizados}))
                            setEditando(false)

                            if(usuario)
                                login({ ...usuario, ...datos_actualizados })

                            await verifica_sesion()
                        }}

                        al_cancelar={() => setEditando(false)}
                    />
                )
            }
        </div>
    )
}

function ModalEditarPerfil({perfil, al_guardar, al_cancelar})
{
    const [biografia, setBiografia] = useState(perfil.biografia || '')
    const [fotoPerfil, setFotoPerfil] = useState(perfil.foto_perfil || '')
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState(null)
    const [vistaPrevia, setVistaPrevia] = useState(perfil.foto_perfil || '')
    const [hover, setHover] = useState(false)
    const maxBio = 300
    const ref = useRef(null)
    const refArchivo = useRef(null)

    //Cierra el modal al hacer click fuera
    function maneja_clic_overlay(e)
    {
        if(e.target === ref.current)
            al_cancelar()
    }

    function maneja_cambio_foto_archivo(e)
    {
        const archivo = e.target.files[0]

        if(!archivo)
            return

        if(archivo.size > 5 * 1024 * 1024)
        {
            setError('La imagen no debe superar los 5 MB')
            e.target.value = ''
            return
        }

        setError(null)

        const lector = new FileReader()

        lector.onload = ev =>
        {
            setVistaPrevia(ev.target.result)
            setFotoPerfil(ev.target.result)
        }

        lector.readAsDataURL(archivo)
    }

    async function maneja_guardar()
    {
        setGuardando(true)
        setError(null)

        try
        {
            const resp = await fetch(`/api/usuarios/${perfil.id}`, {method: 'PUT', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({biografia, foto_perfil: fotoPerfil})})

            if(!resp.ok)
            {
                const datos = await resp.json().catch(() => ({}))

                throw new Error(datos.error || `Error ${resp.status} al actualizar el perfil`)
            }

            al_guardar({biografia, foto_perfil: fotoPerfil})
        }

        catch(e)
        {
            setError(e.message)
        }

        finally
        {
            setGuardando(false)
        }
    }

    return  (
                <div
                    className="modal-overlay"
                    ref={ref}
                    onClick={maneja_clic_overlay}
                >
                    <div className="modal-contenedor">
                        <div className="modal-cabecera">
                            <h2 className="modal-titulo">Editar perfil</h2>

                            <button
                                className="modal-btn-cerrar"
                                onClick={al_cancelar}
                                disabled={guardando}
                                aria-label="Cerrar"
                            >
                                x
                            </button>
                        </div>

                        <div className="modal-formulario">
                            {
                                //Avatar clickable
                            }
                            <div className="perfil-edicion-avatar-contenedor">
                                <div
                                    onClick={() => refArchivo.current.click()}
                                    onMouseEnter={() => setHover(true)}
                                    onMouseLeave={() => setHover(false)}
                                    style={{position: 'relative', width: '110px', height: '110px', cursor: 'pointer', margin: '0 auto'}}
                                >
                                    <img
                                        src={vistaPrevia || '/imagenes/no_foto.png'}
                                        alt="Vista previa del avatar"
                                        className="perfil-edicion-avatar"
                                        onError={e => {e.target.src = '/imagenes/no_foto.png'}}
                                        style={{width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover'}}
                                    />
                                    {hover && (
                                        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(42,112,236,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <img
                                                src="/imagenes/camara.png"
                                                alt="Cambiar foto"
                                                style={{width: '32px', height: '32px', objectFit: 'contain', filter: 'brightness(0) invert(1)'}}
                                            />
                                        </div>
                                    )}
                                </div>
                                <p style={{fontSize: '10px', color: '#878a8c', textAlign: 'center', marginTop: '6px'}}>
                                    Haz clic en la imagen para cambiar tu foto
                                </p>
                                <input
                                    ref={refArchivo}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    style={{display: 'none'}}
                                    onChange={maneja_cambio_foto_archivo}
                                />
                            </div>

                            {
                                //Biografia
                            }
                            <div className="modal-campo">
                                <label className="modal-campo-label">
                                    Biografía
                                </label>

                                <textarea
                                    className="modal-campo-textarea"
                                    placeholder="Cuéntanos algo sobre ti..."
                                    value={biografia}
                                    onChange={e => setBiografia(e.target.value)}
                                    disabled={guardando}
                                    rows={4}
                                    maxLength={maxBio}
                                />

                                <div className="perfil-edicion-contador">
                                            <span className={biografia.length >= maxBio ? 'modal-campo-contador--limite' : ''}>
                                                {biografia.length}/{maxBio}
                                            </span>
                                </div>
                            </div>

                            {error &&
                                (
                                    <div className="modal-error">{error}</div>
                                )
                            }

                            <div className="modal-pie">
                                <button
                                    className="modal-btn-cancelar"
                                    onClick={al_cancelar}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="btn-primary modal-btn-enviar"
                                    onClick={maneja_guardar}
                                    disabled={guardando}
                                >
                                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
}