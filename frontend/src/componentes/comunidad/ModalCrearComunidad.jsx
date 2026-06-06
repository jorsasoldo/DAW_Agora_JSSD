import {useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'

export default function ModalCrearComunidad({alCerrar, alCrear})
{
    const navigate = useNavigate()
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [esPrivada, setEsPrivada] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState(null)
    const Ref = useRef(null)

    const [modoBanner, setModoBanner] = useState('url')
    const [urlBanner, setUrlBanner] = useState('')
    const [archivoBanner, setArchivoBanner] = useState(null)
    const [previewBanner, setPreviewBanner] = useState(null)
    const refBanner = useRef(null)

    const [modoIcono, setModoIcono] = useState('url')
    const [urlIcono, setUrlIcono] = useState('')
    const [archivoIcono, setArchivoIcono] = useState(null)
    const [previewIcono, setPreviewIcono] = useState(null)
    const refIcono = useRef(null)

    const [reglas, setReglas] = useState([])

    useEffect(() =>
    {
        Ref.current?.focus()
        document.body.style.overflow = 'hidden'

        return () => {document.body.style.overflow = ''}
    }, [])

    useEffect(() =>
    {
        function al_teclear(e)
        {
            if(e.key === 'Escape')
                alCerrar()
        }
        document.addEventListener('keydown', al_teclear)

        return () => document.removeEventListener('keydown', al_teclear)
    }, [alCerrar])

    const nombre_valido = nombre.trim().length >= 3 && nombre.trim().length <= 21 && /^[a-zA-Z0-9_]+$/.test(nombre.trim())

    function maneja_archivo(e, setArchivo, setPreview)
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
        setArchivo(archivo)

        const lector = new FileReader()
        lector.onload = ev => setPreview(ev.target.result)
        lector.readAsDataURL(archivo)
    }

    function agrega_regla()
    {
        setReglas(prev => [...prev, {titulo: '', descripcion: ''}])
    }

    function actualiza_regla(idc, campo, valor)
    {
        setReglas(prev => prev.map((r, i) => i === idc ? {...r, [campo]: valor} : r))
    }

    function elimina_regla(idc)
    {
        setReglas(prev => prev.filter((_, i) => i !== idc))
    }

    async function resuelve_imagen(modo, url, archivo)
    {
        if(modo === 'url' && url.trim())
            return url.trim()

        if(modo === 'archivo' && archivo)
            return await new Promise(res =>
            {
                const reader = new FileReader()
                reader.onload = e => res(e.target.result)
                reader.readAsDataURL(archivo)
            })

        return null
    }

    async function maneja_envio(e)
    {
        e.preventDefault()
        if(!nombre_valido) return

        setEnviando(true)
        setError(null)

        try
        {
            const banner_final = await resuelve_imagen(modoBanner, urlBanner, archivoBanner)
            const icono_final  = await resuelve_imagen(modoIcono,  urlIcono,  archivoIcono)

            const reglas_validas = reglas.filter(r => r.titulo.trim())

            const resp = await fetch('/api/comunidades', {method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({nombre: nombre.trim(), descripcion: descripcion.trim(), es_privada: esPrivada, banner: banner_final, icono: icono_final, reglas: reglas_validas.length > 0 ? reglas_validas : null,})})

            const datos = await resp.json()

            if(!resp.ok)
            {
                setError(datos.error || 'No se pudo crear la comunidad')
                return
            }

            if(datos.id)
            {
                alCrear?.()
                navigate(`/c/${datos.id}`)
            }

            else
            {
                alCrear?.()
            }
        }

        catch
        {
            setError('Error de conexión. Intenta de nuevo')
        }

        finally
        {
            setEnviando(false)
        }
    }

    function SelectorImagen({modo, setModo, urlVal, setUrl, preview, refArchivo, onArchivoChange, idPrefix, label})
    {
        return (
                    <div className="modal-campo">
                        <label className="modal-campo-label">{label}</label>
                        <div className="modal-imagen-tabs">
                            {[{val:'url', label:'URL'}, {val:'archivo', label:'Subir archivo'}].map(op =>
                                (
                                    <button
                                        key={op.val}
                                        type="button"
                                        className={`modal-imagen-tab${modo === op.val ? ' modal-imagen-tab--activo' : ''}`}
                                        onClick={() => setModo(op.val)}
                                        disabled={enviando}
                                    >
                                        {op.label}
                                    </button>
                                )
                            )}
                        </div>

                        {modo === 'url'
                            ?
                            (
                                <>
                                    <input
                                        type="url"
                                        className="modal-campo-input"
                                        value={urlVal}
                                        onChange={e => setUrl(e.target.value)}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        disabled={enviando}
                                    />
                                    {urlVal && /^https?:\/\/.+/.test(urlVal) && (
                                        <img
                                            src={urlVal}
                                            alt="Vista previa"
                                            className="modal-imagen-preview"
                                            onError={e => {e.target.style.display='none'}}
                                            onLoad={e  => {e.target.style.display='block'}}
                                        />
                                    )}
                                </>
                            )

                            :
                            (
                                <div className="modal-imagen-selector">
                                    <div
                                        className={`modal-imagen-selector-area${preview ? ' modal-imagen-selector-area--con-preview' : ''}`}
                                        onClick={() => !enviando && refArchivo.current.click()}
                                    >
                                        {preview
                                            ?
                                            (
                                                <>
                                                    <img src={preview} alt="Vista previa" className="modal-imagen-selector-preview" />
                                                    <div className="modal-imagen-selector-overlay">
                                                        <img src="/imagenes/camara.png" alt="" className="modal-imagen-selector-icono modal-imagen-selector-icono--overlay" />
                                                    </div>
                                                </>
                                            )

                                            :
                                            (
                                                <img src="/imagenes/camara.png" alt="Seleccionar imagen" className="modal-imagen-selector-icono modal-imagen-selector-icono--vacio" />
                                            )
                                        }

                                    </div>
                                    <p className="modal-campo-ayuda">
                                        {preview ? 'Haz clic para cambiar la imagen' : 'Haz clic para seleccionar una imagen'}
                                    </p>
                                    <input
                                        ref={refArchivo}
                                        id={`${idPrefix}-archivo`}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        style={{display:'none'}}
                                        onChange={onArchivoChange}
                                        disabled={enviando}
                                    />
                                </div>
                            )
                        }
                    </div>
                )
    }

    return (
                <div className="modal-overlay" onClick={e => {if(e.target === e.currentTarget) alCerrar()}}>
                    <div className="modal-contenedor" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">

                        <div className="modal-cabecera">
                            <h2 className="modal-titulo" id="modal-titulo">Crear comunidad</h2>
                            <button className="modal-btn-cerrar" onClick={alCerrar} aria-label="Cerrar">✕</button>
                        </div>

                        <form onSubmit={maneja_envio} className="modal-formulario">
                            {
                                //Nombre de comunidad
                            }
                            <div className="modal-campo">
                                <label className="modal-campo-label" htmlFor="nombre-comunidad">
                                    Nombre <span className="modal-campo-requerido">*</span>
                                </label>
                                <div className="modal-campo-prefijo-contenedor">
                                    <span className="modal-campo-prefijo">c/</span>
                                    <input
                                        id="nombre-comunidad"
                                        ref={Ref}
                                        type="text"
                                        className={`modal-campo-input modal-campo-input--con-prefijo ${nombre && !nombre_valido ? 'modal-campo-input--error' : ''}`}
                                        value={nombre}
                                        onChange={e => setNombre(e.target.value)}
                                        placeholder="nombre_comunidad"
                                        maxLength={21}
                                        disabled={enviando}
                                        required
                                    />
                                </div>
                                <p className="modal-campo-ayuda">
                                    Entre 3 y 21 caracteres. Solo letras, números y guiones bajos
                                    {nombre &&
                                        (
                                            <span className={`modal-campo-contador ${nombre.length > 18 ? 'modal-campo-contador--limite' : ''}`}>
                                                {' '}{nombre.length}/21
                                            </span>
                                        )
                                    }
                                </p>
                                {nombre && !nombre_valido &&
                                    (
                                        <p className="modal-campo-error">
                                            {nombre.trim().length < 3
                                                ? 'Mínimo 3 caracteres'
                                                : nombre.trim().length > 21
                                                    ? 'Máximo 21 caracteres'
                                                    : 'Solo se permiten letras, números y guiones bajos'
                                            }
                                        </p>
                                    )
                                }
                            </div>
                            {
                                //Descripcion
                            }
                            <div className="modal-campo">
                                <label className="modal-campo-label" htmlFor="descripcion-comunidad">
                                    Descripción
                                </label>
                                <textarea
                                    id="descripcion-comunidad"
                                    className="modal-campo-textarea"
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                    placeholder="¿De qué trata esta comunidad? (opcional)"
                                    maxLength={500}
                                    rows={3}
                                    disabled={enviando}
                                />
                                <p className="modal-campo-ayuda">
                                    {descripcion.length > 0 &&
                                        (
                                            <span className={`modal-campo-contador ${descripcion.length > 450 ? 'modal-campo-contador--limite' : ''}`}>
                                                {descripcion.length}/500
                                            </span>
                                        )
                                    }
                                </p>
                            </div>
                            {
                                //Banner
                            }
                            <SelectorImagen
                                label="Banner"
                                idPrefix="banner"
                                modo={modoBanner}
                                setModo={setModoBanner}
                                urlVal={urlBanner}
                                setUrl={setUrlBanner}
                                preview={previewBanner}
                                refArchivo={refBanner}
                                onArchivoChange={e => maneja_archivo(e, setArchivoBanner, setPreviewBanner)}
                            />
                            {
                                //Icono
                            }
                            <SelectorImagen
                                label="Icono"
                                idPrefix="icono"
                                modo={modoIcono}
                                setModo={setModoIcono}
                                urlVal={urlIcono}
                                setUrl={setUrlIcono}
                                preview={previewIcono}
                                refArchivo={refIcono}
                                onArchivoChange={e => maneja_archivo(e, setArchivoIcono, setPreviewIcono)}
                            />
                            {
                                //Privada
                            }
                            <div className="modal-campo">
                                <label className="modal-campo-toggle">
                                    <input
                                        type="checkbox"
                                        className="modal-campo-checkbox"
                                        checked={esPrivada}
                                        onChange={e => setEsPrivada(e.target.checked)}
                                        disabled={enviando}
                                    />
                                    <span className="modal-campo-toggle-texto">
                                        <strong>Comunidad privada</strong>
                                        <span className="modal-campo-ayuda">Solo los miembros aprobados pueden ver el contenido</span>
                                    </span>
                                </label>
                            </div>

                            {
                                //Reglas
                            }
                            <div className="modal-campo">
                                <div className="modal-reglas-cabecera">
                                    <label className="modal-campo-label">Reglas</label>
                                    <button
                                        type="button"
                                        className="modal-reglas-btn-agregar"
                                        onClick={agrega_regla}
                                        disabled={enviando || reglas.length >= 15}
                                    >
                                        + Agregar regla
                                    </button>
                                </div>

                                {reglas.length === 0 &&
                                    (
                                        <p className="modal-campo-ayuda">Sin reglas aún. Puedes agregarlas ahora o editarlas después</p>
                                    )
                                }

                                {reglas.map((regla, idc) =>
                                    (
                                        <div key={idc} className="modal-regla-item">
                                            <div className="modal-regla-numero">{idc + 1}</div>
                                            <div className="modal-regla-campos">
                                                <input
                                                    type="text"
                                                    className="modal-campo-input"
                                                    value={regla.titulo}
                                                    onChange={e => actualiza_regla(idc, 'titulo', e.target.value)}
                                                    placeholder="Título de la regla"
                                                    maxLength={100}
                                                    disabled={enviando}
                                                    required
                                                />
                                                <textarea
                                                    className="modal-campo-textarea modal-regla-descripcion"
                                                    value={regla.descripcion}
                                                    onChange={e => actualiza_regla(idc, 'descripcion', e.target.value)}
                                                    placeholder="Descripción (opcional)"
                                                    maxLength={500}
                                                    rows={2}
                                                    disabled={enviando}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="modal-regla-btn-eliminar"
                                                onClick={() => elimina_regla(idc)}
                                                disabled={enviando}
                                                aria-label="Eliminar regla"
                                            >
                                                X
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>

                            {error && <div className="modal-error">{error}</div>}

                            <div className="modal-pie">
                                <button
                                    type="button"
                                    className="modal-btn-cancelar"
                                    onClick={alCerrar}
                                    disabled={enviando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary modal-btn-enviar"
                                    disabled={!nombre_valido || enviando}
                                >
                                    {enviando ? 'Creando...' : 'Crear comunidad'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
}