import {useState, useEffect, useCallback, useRef} from 'react'

import {useNavigate, useSearchParams, Link} from 'react-router-dom'

import {useAutentifica} from '../contexto/ContextoUsuario.jsx'

const tipos =
    [
        {valor: 'texto',  etiqueta: 'Texto'},
        {valor: 'enlace', etiqueta: 'Enlace'},
        {valor: 'imagen', etiqueta: 'Imagen'},
    ]

export default function PaginaCrearPublicacion()
{
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const {usuario} = useAutentifica()
    const ref = useRef(null)
    const refImagenArchivo = useRef(null)

    const [titulo, setTitulo] = useState('')
    const [etiqueta, setEtiqueta] = useState('')
    const [comunidadId, setComunidadId] = useState(params.get('comunidad') || '')

    const [tiposActivos, setTiposActivos] = useState({texto: true, enlace: false, imagen: false})

    const [contenido, setContenido] = useState('')
    const [enlace, setEnlace] = useState('')
    const [urlImagen, setUrlImagen] = useState('')

    const [busquedaComunidad, setBusquedaComunidad] = useState('')
    const [comunidadNombre, setComunidadNombre] = useState('')
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
    const refBuscador = useRef(null)

    const [modoImagen, setModoImagen] = useState('url')
    const [archivoImagen, setArchivoImagen] = useState(null)
    const [previewArchivo, setPreviewArchivo] = useState(null)

    //Estado de interfaz
    const [comunidades, setComunidades] = useState([])
    const [cargandoComs, setCargandoComs] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState(null)
    const [erroresCampo, setErroresCampo] = useState({})

    const carga_comunidades = useCallback(async () =>
    {
        try
        {
            const resp = await fetch('/api/comunidades', {credentials: 'include'})

            if(resp.ok)
            {
                const datos = await resp.json()

                const lista = Array.isArray(datos) ? datos : Array.isArray(datos?.comunidades) ? datos.comunidades : []

                setComunidades(lista)
            }

            else
            {
                setComunidades([])
            }
        }

        catch
        {
            setComunidades([])
        }

        finally
        {
            setCargandoComs(false)
        }
    }, [])

    useEffect(() => {carga_comunidades()}, [carga_comunidades])

    useEffect(() => {ref.current?.focus()}, [])

    useEffect(() =>
    {
        function sugerencias(e)
        {
            if(refBuscador.current && !refBuscador.current.contains(e.target))
                setMostrarSugerencias(false)
        }

        document.addEventListener('mousedown', sugerencias)

        return () => document.removeEventListener('mousedown', sugerencias)
    }, [])

    //Alterna el tipo sin afectar los otros ni borrar su contenido
    function alterna_tipo(valor)
    {
        setTiposActivos(prev =>
        {
            const siguiente = {...prev, [valor]: !prev[valor]}

            //Almenos alguno debe estar activo
            const alguno_activo = Object.values(siguiente).some(Boolean)

            return alguno_activo ? siguiente : prev
        })

        setErroresCampo(prev => ({...prev, [valor]: undefined}))
    }

    function valida_campos()
    {
        const errores = {}

        if(!titulo.trim())
            errores.titulo = 'El título es obligatorio'

        else if(titulo.trim().length < 4)
            errores.titulo = 'Mínimo 4 caracteres'

        else if(titulo.trim().length > 300)
            errores.titulo = 'Máximo 300 caracteres'

        if(!comunidadId)
            errores.comunidad = 'Elige una comunidad'

        if(tiposActivos.enlace && !enlace.trim())
            errores.enlace = 'El enlace es obligatorio cuando el tipo Enlace está activo'

        else if(tiposActivos.enlace && !/^https?:\/\/.+/.test(enlace.trim()))
            errores.enlace = 'Debe comenzar con http:// o https://'

        if(tiposActivos.imagen)
        {
            if(modoImagen === 'url' && !urlImagen.trim())
                errores.imagen = 'La URL de imagen es obligatoria'

            else if(modoImagen === 'url' && !/^https?:\/\/.+/.test(urlImagen.trim()))
                errores.imagen = 'Debe comenzar con http:// o https://'

            else if(modoImagen === 'archivo' && !archivoImagen)
                errores.imagen = 'Selecciona un archivo de imagen'
        }

        return errores
    }

    const formulario_valido = (() =>
    {
        if(!titulo.trim() || titulo.trim().length < 4 || !comunidadId)
            return false

        if(tiposActivos.enlace && !/^https?:\/\/.+/.test(enlace.trim()))
            return false

        if(tiposActivos.imagen)
        {
            if(modoImagen === 'url' && !/^https?:\/\/.+/.test(urlImagen.trim()))
                return false

            if(modoImagen === 'archivo' && !archivoImagen)
                return false
        }

        return true
    })()

    async function maneja_envio(e)
    {
        e.preventDefault()

        const errores = valida_campos()

        if(Object.keys(errores).length > 0)
        {
            setErroresCampo(errores)
            return
        }

        setEnviando(true)
        setError(null)
        setErroresCampo({})

        //Construye el tipo compuesto
        const tipos_seleccionados = tipos.map(t => t.valor).filter(v => tiposActivos[v])

        const tipo_final = tipos_seleccionados.join('+')

        let url_imagen_final = null

        if(tiposActivos.imagen)
        {
            if(modoImagen === 'url')
                url_imagen_final = urlImagen.trim()

            else if(archivoImagen)
                url_imagen_final = await new Promise(res =>
                {
                    const reader = new FileReader()
                    reader.onload = e => res(e.target.result)
                    reader.readAsDataURL(archivoImagen)
                })
        }

        const cuerpo = {titulo: titulo.trim(), tipos: tipos_seleccionados, comunidad: comunidadId, etiqueta: etiqueta.trim() || null, contenido: tiposActivos.texto ? (contenido.trim() || null) : null, enlace: tiposActivos.enlace ? enlace.trim() : null, url_imagen: url_imagen_final,}

        try
        {
            const resp = await fetch('/api/publicaciones', {method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(cuerpo),})

            const datos = await resp.json()

            if(!resp.ok)
            {
                setError(datos.error || 'No se pudo crear la publicación')
                return
            }

            if(datos.id)
                navigate(`/p/${datos.id}`)

            else
                setError('La publicación se creó pero no se pudo redirigir')
        }

        catch
        {
            setError('Error de conexión, intenta de nuevo')
        }

        finally
        {
            setEnviando(false)
        }
    }

    function selecciona_comunidad(c)
    {
        setComunidadId(c.id)
        setComunidadNombre(c.nombre)
        setBusquedaComunidad('')
        setMostrarSugerencias(false)
        setErroresCampo(prev => ({...prev, comunidad: undefined}))
    }

    function maneja_archivo_imagen(e)
    {
        const archivo = e.target.files[0]

        if(!archivo)
            return

        setArchivoImagen(archivo)

        const reader = new FileReader()
        reader.onload = ev => setPreviewArchivo(ev.target.result)
        reader.readAsDataURL(archivo)

        setUrlImagen('')
        setErroresCampo(prev => ({...prev, imagen: undefined}))
    }

    return (
        <div className="pagina-publicar">
            {
                //Encabezado
            }
            <div className="pagina-publicar-encabezado">
                <h1 className="pagina-publicar-titulo">Crear publicación</h1>
                <Link to="/" className="pagina-publicar-volver">Volver al feed</Link>
            </div>

            <div className="pagina-publicar-contenedor">
                {
                }

                <form onSubmit={maneja_envio} className="pagina-publicar-formulario" noValidate>
                    {
                        //Selector de comunidad
                    }

                    <div className="publicar-campo">
                        <label className="publicar-campo-label" htmlFor="buscador-comunidad">
                            Comunidad <span className="publicar-campo-requerido">*</span>
                        </label>

                        <div className="publicar-comunidad-wrapper" ref={refBuscador}>
                            {comunidadId && !mostrarSugerencias
                                ?
                                (
                                    <div className="publicar-comunidad-seleccionada">
                                        <span className="publicar-comunidad-chip">
                                            c/{comunidadNombre || (Array.isArray(comunidades) ? comunidades.find(c => c.id === comunidadId)?.nombre : null) || comunidadId}
                                        </span>
                                        <button
                                            type="button"
                                            className="publicar-comunidad-btn-cambiar"
                                            onClick={() => { setComunidadId(''); setComunidadNombre(''); setMostrarSugerencias(false) }}
                                            disabled={enviando}
                                        >
                                            Cambiar
                                        </button>
                                    </div>
                                )
                                :
                                (
                                    <input
                                        id="buscador-comunidad"
                                        type="text"
                                        className={`publicar-campo-input ${erroresCampo.comunidad ? 'publicar-campo-input--error' : ''}`}
                                        value={busquedaComunidad}
                                        onChange={e => { setBusquedaComunidad(e.target.value); setMostrarSugerencias(true) }}
                                        onFocus={() => setMostrarSugerencias(true)}
                                        placeholder={cargandoComs ? 'Cargando comunidades…' : 'Buscar comunidad…'}
                                        disabled={enviando || cargandoComs}
                                        autoComplete="off"
                                    />
                                )
                            }

                            {mostrarSugerencias && !comunidadId &&
                                (
                                    <div className="publicar-comunidad-dropdown">
                                        {(Array.isArray(comunidades) ? comunidades : [])
                                            .filter(c => c.nombre.toLowerCase().includes(busquedaComunidad.toLowerCase()))
                                            .map(c =>
                                                (
                                                    <div
                                                        key={c.id}
                                                        className="publicar-comunidad-opcion"
                                                        onMouseDown={() => selecciona_comunidad(c)}
                                                    >
                                                        <span className="publicar-comunidad-opcion-prefijo">c/</span>{c.nombre}
                                                    </div>
                                                )
                                            )
                                        }
                                        {(Array.isArray(comunidades) ? comunidades : []).filter(c => c.nombre.toLowerCase().includes(busquedaComunidad.toLowerCase())).length === 0 &&
                                            <div className="publicar-comunidad-vacio">Sin resultados</div>
                                        }
                                    </div>
                                )
                            }
                        </div>

                        {erroresCampo.comunidad &&
                            <p className="publicar-campo-error">{erroresCampo.comunidad}</p>
                        }
                    </div>

                    {
                        //Titulo
                    }
                    <div className="publicar-campo">
                        <label className="publicar-campo-label" htmlFor="campo-titulo">
                            Título <span className="publicar-campo-requerido">*</span>
                        </label>

                        <input
                            id="campo-titulo"
                            ref={ref}
                            type="text"
                            className={`publicar-campo-input ${erroresCampo.titulo ? 'publicar-campo-input--error' : ''}`}
                            value={titulo}
                            onChange={e => { setTitulo(e.target.value); setErroresCampo(prev => ({...prev, titulo: undefined})) }}
                            placeholder="Un título descriptivo para tu publicación"
                            maxLength={300}
                            disabled={enviando}
                        />

                        <div className="publicar-campo-pie">
                            {erroresCampo.titulo
                                ? <p className="publicar-campo-error">{erroresCampo.titulo}</p>
                                : <span />
                            }
                            <span className={`publicar-campo-contador ${titulo.length > 270 ? 'publicar-campo-contador--limite' : ''}`}>
                                {titulo.length}/300
                            </span>
                        </div>
                    </div>
                    {
                        //Selector de tipo
                    }
                    <div className="publicar-campo">
                        <span className="publicar-campo-label">
                            Tipos de contenido
                            <span className="publicar-campo-opcional"> (puedes combinar varios)</span>
                        </span>

                        <div className="publicar-tipo-grupo" role="group" aria-label="Tipos de contenido">
                            {tipos.map(t =>
                                (
                                    <button
                                        key={t.valor}
                                        type="button"
                                        className={`publicar-tipo-btn ${tiposActivos[t.valor] ? 'publicar-tipo-btn--activo' : ''}`}
                                        onClick={() => alterna_tipo(t.valor)}
                                        disabled={enviando}
                                        aria-pressed={tiposActivos[t.valor]}
                                    >
                                        {tiposActivos[t.valor] ? '*' : ''}{t.etiqueta}
                                    </button>
                                )
                            )}
                        </div>

                        <p className="publicar-campo-ayuda">
                            Activa uno o más tipos. El contenido de cada tipo activo se guardará junto.
                        </p>
                    </div>
                    {

                    }
                    {tiposActivos.texto &&
                        (
                            <div className="publicar-campo publicar-campo--seccion">
                                <label className="publicar-campo-label publicar-campo-label--seccion" htmlFor="campo-contenido">
                                    <span className="publicar-seccion-indicador publicar-seccion-indicador--texto">T</span>
                                    Texto
                                </label>

                                <textarea
                                    id="campo-contenido"
                                    className="publicar-campo-textarea"
                                    value={contenido}
                                    onChange={e => setContenido(e.target.value)}
                                    placeholder="Escribe el cuerpo de tu publicación (opcional)"
                                    rows={5}
                                    maxLength={10000}
                                    disabled={enviando}
                                />

                                {contenido.length > 0 &&
                                    (
                                        <p className="publicar-campo-ayuda">
                                            <span className={`publicar-campo-contador ${contenido.length > 9500 ? 'publicar-campo-contador--limite' : ''}`}>
                                                {contenido.length}/10 000
                                            </span>
                                        </p>
                                    )
                                }
                            </div>
                        )
                    }

                    {
                    }
                    {tiposActivos.enlace &&
                        (
                            <div className="publicar-campo publicar-campo--seccion">
                                <label className="publicar-campo-label publicar-campo-label--seccion" htmlFor="campo-enlace">
                                    <span className="publicar-seccion-indicador publicar-seccion-indicador--enlace">E</span>
                                    Enlace <span className="publicar-campo-requerido">*</span>
                                </label>

                                <input
                                    id="campo-enlace"
                                    type="url"
                                    className={`publicar-campo-input ${erroresCampo.enlace ? 'publicar-campo-input--error' : ''}`}
                                    value={enlace}
                                    onChange={e => { setEnlace(e.target.value); setErroresCampo(prev => ({...prev, enlace: undefined})) }}
                                    placeholder="https://ejemplo.com/articulo"
                                    disabled={enviando}
                                />

                                {erroresCampo.enlace &&
                                    (
                                        <p className="publicar-campo-error">{erroresCampo.enlace}</p>
                                    )
                                }
                            </div>
                        )
                    }
                    {
                    }

                    {tiposActivos.imagen &&
                        (
                            <div className="publicar-campo publicar-campo--seccion">
                                <label className="publicar-campo-label publicar-campo-label--seccion" htmlFor="campo-imagen">
                                    <span className="publicar-seccion-indicador publicar-seccion-indicador--imagen">I</span>
                                    Imagen <span className="publicar-campo-requerido">*</span>
                                </label>

                                <div className="publicar-imagen-tabs">
                                    {[{val: 'url', label: 'URL'}, {val: 'archivo', label: 'Subir archivo'}].map(op =>
                                        (
                                            <button
                                                key={op.val}
                                                type="button"
                                                className={`publicar-imagen-tab ${modoImagen === op.val ? 'publicar-imagen-tab--activo' : ''}`}
                                                onClick={() => { setModoImagen(op.val); setErroresCampo(prev => ({...prev, imagen: undefined})) }}
                                                disabled={enviando}
                                            >
                                                {op.label}
                                            </button>
                                        )
                                    )}
                                </div>

                                {modoImagen === 'url'
                                    ?
                                    (
                                        <input
                                            id="campo-imagen"
                                            type="url"
                                            className={`publicar-campo-input ${erroresCampo.imagen ? 'publicar-campo-input--error' : ''}`}
                                            value={urlImagen}
                                            onChange={e => { setUrlImagen(e.target.value); setErroresCampo(prev => ({...prev, imagen: undefined})) }}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            disabled={enviando}
                                        />
                                    )

                                    :
                                    (
                                        <div className="publicar-imagen-selector">
                                            <div
                                                className={`publicar-imagen-selector-area${previewArchivo ? ' publicar-imagen-selector-area--con-preview' : ''}`}
                                                onClick={() => !enviando && refImagenArchivo.current.click()}
                                            >
                                                {previewArchivo ?
                                                    (
                                                        <>
                                                            <img
                                                                src={previewArchivo}
                                                                alt="Vista previa"
                                                                className="publicar-imagen-selector-preview"
                                                            />
                                                            <div className="publicar-imagen-selector-overlay">
                                                                <img
                                                                    src="/imagenes/camara.png"
                                                                    alt=""
                                                                    className="publicar-imagen-selector-icono publicar-imagen-selector-icono--overlay"
                                                                />
                                                            </div>
                                                        </>
                                                    )

                                                    :
                                                    (
                                                        <img
                                                            src="/imagenes/camara.png"
                                                            alt="Seleccionar imagen"
                                                            className="publicar-imagen-selector-icono publicar-imagen-selector-icono--vacio"
                                                        />
                                                    )
                                                }

                                            </div>
                                            <p className="publicar-imagen-selector-texto">
                                                {previewArchivo ? 'Haz clic para cambiar la imagen' : 'Haz clic para seleccionar una imagen'}
                                            </p>
                                            <input
                                                ref={refImagenArchivo}
                                                id="campo-imagen-archivo"
                                                type="file"
                                                accept="image/*"
                                                style={{display: 'none'}}
                                                onChange={maneja_archivo_imagen}
                                                disabled={enviando}
                                            />
                                        </div>
                                    )
                                }

                                {erroresCampo.imagen &&
                                    <p className="publicar-campo-error">{erroresCampo.imagen}</p>
                                }

                                {modoImagen === 'url' && urlImagen && /^https?:\/\/.+/.test(urlImagen) &&
                                    (
                                        <div className="publicar-vista-previa-imagen">
                                            <img
                                                src={urlImagen}
                                                alt="Vista previa"
                                                className="publicar-imagen-preview"
                                                onError={e  => {e.target.style.display = 'none'}}
                                                onLoad={e   => {e.target.style.display = 'block'}}
                                            />
                                        </div>
                                    )
                                }

                                {modoImagen === 'archivo' && previewArchivo &&
                                    (
                                        <div className="publicar-vista-previa-imagen">
                                            <img
                                                src={previewArchivo}
                                                alt="Vista previa"
                                                className="publicar-imagen-preview publicar-imagen-preview--visible"
                                            />
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    {
                        //Etiqueta opcional
                    }
                    <div className="publicar-campo">
                        <label className="publicar-campo-label" htmlFor="campo-etiqueta">
                            Etiqueta <span className="publicar-campo-opcional">(opcional)</span>
                        </label>

                        <input
                            id="campo-etiqueta"
                            type="text"
                            className="publicar-campo-input"
                            value={etiqueta}
                            onChange={e => setEtiqueta(e.target.value)}
                            placeholder="ej. Pregunta, Noticia, Debate…"
                            maxLength={30}
                            disabled={enviando}
                        />

                        <p className="publicar-campo-ayuda">
                            Clasifica tu publicación para que sea más fácil de encontrar
                        </p>
                    </div>
                    {
                    }
                    {error &&
                        (
                            <div className="publicar-error-global">{error}</div>
                        )
                    }

                    {
                        //Botones de accion
                    }
                    <div className="publicar-pie">
                        <button
                            type="button"
                            className="publicar-btn-cancelar"
                            onClick={() => navigate(-1)}
                            disabled={enviando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn-primary publicar-btn-enviar"
                            disabled={!formulario_valido || enviando}
                        >
                            {enviando ? 'Publicando…' : 'Publicar'}
                        </button>
                    </div>
                </form>

                {
                    //Ayuda
                }
                <aside className="publicar-sidebar">
                    <div className="publicar-sidebar-tarjeta">
                        <div className="publicar-sidebar-cabecera">Tipos de contenido</div>
                        <ul className="publicar-sidebar-lista">
                            <li><strong>Texto</strong> — cuerpo redactado libremente</li>
                            <li><strong>Enlace</strong> — URL a un recurso externo</li>
                            <li><strong>Imagen</strong> — URL directa a un archivo de imagen</li>
                            <li>Puedes combinar los tres en una sola publicación</li>
                        </ul>
                    </div>

                    <div className="publicar-sidebar-tarjeta">
                        <div className="publicar-sidebar-cabecera">Consejos</div>
                        <ul className="publicar-sidebar-lista">
                            <li>Elige un título claro y descriptivo</li>
                            <li>Verifica que la comunidad sea la adecuada</li>
                            <li>Añade una etiqueta para facilitar la búsqueda</li>
                        </ul>
                    </div>

                    <div className="publicar-sidebar-tarjeta">
                        <div className="publicar-sidebar-cabecera">¿No encuentras tu comunidad?</div>
                        <p className="publicar-sidebar-texto">
                            Explora todas las comunidades disponibles o crea una nueva
                        </p>
                        <Link to="/comunidades" className="publicar-sidebar-enlace">
                            Ver comunidades
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    )
}