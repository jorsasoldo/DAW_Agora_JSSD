import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAutentifica } from '../contexto/ContextoUsuario.jsx'
import ComponenteVotos from '../componentes/publicacion/ComponenteVotos.jsx'
import ArbolComentarios from '../componentes/publicacion/ArbolComentarios.jsx'

//Formatea la fecha/hora de cada publicacion
//(Recicle la misma funcion de tiempo relativo que en la clase de la tarjeta de publicacion)
function tiempo_relativo(fecha)
{
    if(!fecha)
        return ''

    const ahora = new Date()
    const entonces = new Date(fecha)
    const diferencia = ahora - entonces
    const dif_min = Math.floor(diferencia / 60000)
    const dif_hr = Math.floor(dif_min / 60)
    const dif_dia = Math.floor(dif_hr / 24)

    if(dif_min < 1)
        return 'hace un momento'

    if(dif_min < 60)
        return `hace ${dif_min} min`

    if(dif_hr < 24)
        return `hace ${dif_hr} hrs`

    if(dif_dia < 30)
        return `hace ${dif_dia} días`

    return entonces.toLocaleDateString('es-MX', {day: 'numeric', month: 'short', year: 'numeric'})
}

const etiquetas_tipo = {texto: 'Texto', enlace: 'Enlace', imagen: 'Imagen'}

export default function PaginaPublicacion()
{
    const {id} = useParams()
    const navigate = useNavigate()
    const {usuario} = useAutentifica()

    const [publicacion, setPublicacion] = useState(null)
    const [comentarios, setComentarios] = useState([])
    const [nombreComunidad, setNombreComunidad] = useState('')
    const [nombreAutor, setNombreAutor] = useState('')
    const [cargando, setCargando] = useState(true)
    const [cargandoComentarios, setCargandoComentarios] = useState(true)
    const [error, setError] = useState(null)
    const [puntajeLocal, setPuntajeLocal] = useState(0)

    //Carga la publicacion con sus metadatos
    const carga_publicacion = useCallback(async () =>
    {
        setCargando(true)
        setError(null)

        try
        {
            //Busca la publicacion en el listado general
            const resp = await fetch('/api/publicaciones', {credentials: 'include'})

            if(!resp.ok)
                throw new Error(`Error ${resp.status} al cargar la publicación`)

            const todas = await resp.json()
            const pub = todas.find(p => p.id === id)

            if(!pub)
                throw new Error('Publicación no encontrada')

            setPublicacion(pub)
            setPuntajeLocal(pub.puntaje_votos ?? 0)

            if(pub.comunidad)
            {
                try
                {
                    const respComunidad = await fetch(`/api/comunidades/${pub.comunidad}`, {credentials: 'include'})

                    if(respComunidad.ok)
                    {
                        const com = await respComunidad.json()

                        setNombreComunidad(com.nombre || pub.comunidad)
                    }

                }

                catch
                {
                }

            }

            if(pub.autor)
            {
                try
                {
                    const ator = await fetch(`/api/usuarios/${pub.autor}`, {credentials: 'include'})

                    if(ator.ok)
                    {
                        const aut = await ator.json()
                        setNombreAutor(aut.nombre_usuario || pub.autor)
                    }
                }

                catch
                {
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
    }, [id])

    //Carga el arbol de comentarios
    const carga_comentarios = useCallback(async () =>
    {
        setCargandoComentarios(true)

        try
        {
            const resp = await fetch(`/api/comentarios?publicacion=${id}`, {credentials: 'include'})

            if(!resp.ok)
                return

            const datos = await resp.json()
            setComentarios(datos)

        }

        catch
        {
        }

        finally
        {
            setCargandoComentarios(false)
        }
    }, [id])

    useEffect(() => { carga_publicacion() }, [carga_publicacion])
    useEffect(() => { carga_comentarios() }, [carga_comentarios])

    //Inserta el comentario nuevo al arbol
    function inserta_comentario_nuevo(comentario_nuevo)
    {
        setComentarios(prev => [comentario_nuevo, ...prev])

        //Actualiza el contador de comentarios visual
        setPublicacion(prev => prev ? { ...prev, total_comentarios: (prev.total_comentarios ?? 0) + 1 } : prev)
    }

    if(cargando)
    {
        return (
                <div className="pagina-inicio-estado">
                    <div className="pagina-inicio-spinner" />
                    <p className="pagina-inicio-estado-texto">Cargando publicación...</p>
                </div>
                )
    }

    if(error)
    {
        return (
                <div className="pagina-inicio-estado">
                    <p className="pagina-inicio-error">{error}</p>
                    <button className="btn-primary" onClick={() => navigate(-1)}>Volver</button>
                </div>
                )
    }

    const {titulo = '', tipos = [], tipo: _tipo = '', contenido = '', enlace = '', url_imagen = '', comunidad, autor, etiqueta = '', fijada = false, creado_en, total_comentarios = 0,} = publicacion

    const tipo = tipos.length > 0 ? tipos.join('+') : _tipo

    return (
        <div className="pagina-publicacion">
            {
            }

            <nav className="pagina-publicacion-breadcrumb">
                {nombreComunidad ?
                    (
                        <Link to={`/c/${comunidad}`} className="pagina-publicacion-breadcrumb-link">
                            c/{nombreComunidad}
                        </Link>
                    )

                    :
                    (
                        <Link to="/" className="pagina-publicacion-breadcrumb-link">Inicio</Link>
                    )
                }
                <span className="pagina-publicacion-breadcrumb-sep">›</span>
                <span className="pagina-publicacion-breadcrumb-actual">{titulo}</span>
            </nav>

            {
                //Tarjeta principal
            }
            <article className="pagina-publicacion-tarjeta">
                {
                    //Columna de votos
                }
                <div className="pagina-publicacion-votos">
                    <ComponenteVotos
                        objetivo_id={id}
                        tipo_objetivo="publicacion"
                        puntaje_inicial={puntajeLocal}
                        orientacion="vertical"
                        al_votar={setPuntajeLocal}
                    />
                </div>
                {
                }
                <div className="pagina-publicacion-cuerpo">
                    {
                    }
                    <div className="pagina-publicacion-meta">
                        {nombreComunidad &&
                            (
                                <>
                                    <Link to={`/c/${comunidad}`} className="tarjeta-publicacion-comunidad">
                                        c/{nombreComunidad}
                                    </Link>
                                    <span className="tarjeta-publicacion-separador">·</span>
                                </>
                            )
                        }
                        <Link to={`/u/${nombreAutor}`} className="tarjeta-publicacion-autor">u/{nombreAutor}</Link>
                        {creado_en &&
                            (
                                <>
                                    <span className="tarjeta-publicacion-separador">·</span>
                                    <span className="tarjeta-publicacion-tiempo">{tiempo_relativo(creado_en)}</span>
                                </>
                            )
                        }
                        {fijada && <span className="tarjeta-publicacion-fijada">Fijada</span>}
                    </div>
                    {
                    }
                    <h1 className="pagina-publicacion-titulo">{titulo}</h1>
                    {
                        //Etiquetas
                    }
                    <div className="tarjeta-publicacion-etiquetas">
                        {tipos.length > 0 && tipos.map(t =>
                            (
                                <span key={t} className={`tarjeta-publicacion-etiqueta-tipo tarjeta-publicacion-etiqueta-tipo--${t}`}>
                                    {etiquetas_tipo[t] || t}
                                </span>
                            )
                        )
                        }

                        {etiqueta &&
                            (
                                <span className="tarjeta-publicacion-etiqueta-custom">{etiqueta}</span>
                            )
                        }
                    </div>
                    {
                        //Tipo de contenido
                    }
                    {tipos.includes('texto') && contenido &&
                        (
                            <div className="pagina-publicacion-contenido-texto">
                                {contenido.split('\n').map((parrafo, i) => (parrafo.trim() ? <p key={i}>{parrafo}</p> : <br key={i} />))}
                            </div>
                        )
                    }

                    {tipos.includes('enlace') && enlace &&
                        (
                            <a
                                href={enlace}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pagina-publicacion-enlace"
                            >
                                {enlace}
                            </a>
                        )
                    }

                    {tipos.includes('imagen') && url_imagen &&
                        (
                            <div className="pagina-publicacion-imagen-contenedor">
                                <img
                                    src={url_imagen}
                                    alt={titulo}
                                    className="pagina-publicacion-imagen"
                                />
                            </div>
                        )
                    }
                    {
                        //Comentarios
                    }
                    <div className="pagina-publicacion-pie">
                        <span className="pagina-publicacion-pie-comentarios">
                            <img src="/imagenes/Comentario.png" alt="Comentarios" width="15" height="15" />
                            {total_comentarios} comentario{total_comentarios !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </article>

            {
            }
            <section className="pagina-publicacion-comentarios">
                <h2 className="pagina-publicacion-comentarios-titulo">
                    Comentarios
                </h2>

                {
                }
                {usuario &&
                    (
                        <FormularioComentario
                            publicacion_id={id}
                            padre_id={null}
                            al_enviar={inserta_comentario_nuevo}
                            placeholder="¿Qué opinas?"
                        />
                    )
                }

                {!usuario &&
                    (
                        <div className="pagina-publicacion-aviso-login">
                            <Link to="/login" className="btn-primary">Inicia sesión</Link>
                            <span> para comentar</span>
                        </div>
                    )
                }

                {
                    //Arbol de comentarios
                }
                {cargandoComentarios ?
                    (
                        <div className="pagina-inicio-estado">
                            <div className="pagina-inicio-spinner" />
                        </div>
                    ): comentarios.length === 0 ?
                        (
                            <p className="pagina-publicacion-sin-comentarios">
                                Sé el primero en comentar!
                            </p>
                        ):

                        (
                            <ArbolComentarios
                                comentarios={comentarios}
                                publicacion_id={id}
                                al_comentar={inserta_comentario_nuevo}
                            />
                        )
                }
            </section>
        </div>
    )
}

export function FormularioComentario({ publicacion_id, padre_id, al_enviar, placeholder = 'Escribe un comentario...', al_cancelar = null })
{
    const [texto, setTexto] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState(null)

    async function maneja_envio()
    {
        const contenido = texto.trim()

        if(!contenido)
            return

        setEnviando(true)
        setError(null)

        try
        {
            const body = {publicacion_id, contenido}

            if(padre_id)
                body.padre_id = padre_id

            const resp = await fetch('/api/comentarios', {method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body),})

            if(!resp.ok)
                throw new Error(`Error ${resp.status} al enviar el comentario`)

            const nuevo = await resp.json()

            setTexto('')

            if(al_enviar)
                al_enviar(nuevo)

            if(al_cancelar)
                al_cancelar()
        }

        catch(e)
        {
            setError(e.message)
        }

        finally
        {
            setEnviando(false)
        }
    }

    return (
        <div className="formulario-comentario">
            <textarea
                className="formulario-comentario-textarea"
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder={placeholder}
                rows={3}
                disabled={enviando}
            />
            {error && <p className="formulario-comentario-error">{error}</p>}
            <div className="formulario-comentario-acciones">
                {al_cancelar &&
                    (
                        <button
                            className="formulario-comentario-btn-cancelar"
                            onClick={al_cancelar}
                            disabled={enviando}
                        >
                            Cancelar
                        </button>
                    )
                }
                <button
                    className="btn-primary formulario-comentario-btn-enviar"
                    onClick={maneja_envio}
                    disabled={enviando || !texto.trim()}
                >
                    {enviando ? 'Enviando...' : 'Comentar'}
                </button>
            </div>
        </div>
    )
}