import {useState, useEffect, useRef} from 'react'

export default function PanelModeracion({comunidad_id, es_moderador, es_admin_comunidad, es_privada, publicacion, al_actualizar, al_agregar_moderador, comunidad, al_actualizar_comunidad, al_eliminar_comunidad})
{
    const [fijada, setFijada] = useState(publicacion?.fijada ?? false)
    const [bloqueada, setBloqueada] = useState(publicacion?.bloqueada ?? false)
    const [cargandoFijar, setCargandoFijar] = useState(false)
    const [cargandoBloquear, setCargandoBloquear] = useState(false)

    const [mostrarModalMod, setMostrarModalMod] = useState(false)
    const [idNuevoMod, setIdNuevoMod] = useState('')
    const [enviando_mod, setEnviandoMod] = useState(false)
    const [errorMod, setErrorMod] = useState(null)
    const [exitoMod, setExitoMod] = useState(false)

    const [busquedaMod, setBusquedaMod] = useState('')
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
    const [miembrosComunidad, setMiembrosComunidad] = useState([])
    const [cargandoMiembros, setCargandoMiembros] = useState(false)
    const [mostrarDropdown, setMostrarDropdown] = useState(false)
    const refBuscadorMod = useRef(null)

    const [mostrarModalInvitar, setMostrarModalInvitar] = useState(false)
    const [busquedaInvitar, setBusquedaInvitar] = useState('')
    const [usuarioInvitar, setUsuarioInvitar] = useState(null)
    const [usuariosCargados, setUsuariosCargados] = useState([])
    const [cargandoInvitar, setCargandoInvitar] = useState(false)
    const [errorInvitar, setErrorInvitar] = useState(null)
    const [exitoInvitar, setExitoInvitar] = useState(false)
    const [mostrarDropdownInvitar, setMostrarDropdownInvitar] = useState(false)
    const refBuscadorInvitar = useRef(null)
    const debounceInvitar = useRef(null)

    const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
    const [editNombre, setEditNombre] = useState('')
    const [editDescripcion, setEditDescripcion] = useState('')
    const [editModoBanner, setEditModoBanner] = useState('url')
    const [editUrlBanner, setEditUrlBanner] = useState('')
    const [editArchivoBanner, setEditArchivoBanner] = useState(null)
    const [editPreviewBanner, setEditPreviewBanner] = useState(null)
    const [editModoIcono, setEditModoIcono] = useState('url')
    const [editUrlIcono, setEditUrlIcono] = useState('')
    const [editArchivoIcono, setEditArchivoIcono] = useState(null)
    const [editPreviewIcono, setEditPreviewIcono] = useState(null)
    const [editReglas, setEditReglas] = useState([])
    const [enviandoEditar, setEnviandoEditar] = useState(false)
    const [errorEditar, setErrorEditar] = useState(null)
    const [exitoEditar, setExitoEditar] = useState(false)
    const refBannerArchivo = useRef(null)
    const refIconoArchivo = useRef(null)

    const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] = useState(false)
    const [eliminandoComunidad, setEliminandoComunidad] = useState(false)
    const [errorEliminar, setErrorEliminar] = useState(null)

    const [mostrarModalEliminarMod, setMostrarModalEliminarMod] = useState(false)
    const [moderadoresCargados, setModeradoresCargados] = useState([])
    const [cargandoModeradoresList, setCargandoModeradoresList] = useState(false)
    const [eliminandoMod, setEliminandoMod] = useState(null)
    const [errorEliminarMod, setErrorEliminarMod] = useState(null)
    const [exitoEliminarMod, setExitoEliminarMod] = useState(false)

    const [mostrarModalExpulsar, setMostrarModalExpulsar] = useState(false)
    const [miembrosParaExpulsar, setMiembrosParaExpulsar] = useState([])
    const [cargandoMiembrosExpulsar, setCargandoMiembrosExpulsar] = useState(false)
    const [expulsando, setExpulsando] = useState(null)
    const [errorExpulsar, setErrorExpulsar] = useState(null)
    const [busquedaExpulsar, setBusquedaExpulsar] = useState('')

    const en_publicacion = publicacion != null

    if(!es_moderador)
        return null

    function abre_modal_editar()
    {
        setEditNombre(comunidad?.nombre || '')
        setEditDescripcion(comunidad?.descripcion || '')
        setEditModoBanner('url')
        setEditUrlBanner(comunidad?.banner || '')
        setEditArchivoBanner(null)
        setEditPreviewBanner(comunidad?.banner || null)
        setEditModoIcono('url')
        setEditUrlIcono(comunidad?.icono || '')
        setEditArchivoIcono(null)
        setEditPreviewIcono(comunidad?.icono || null)
        setEditReglas(comunidad?.reglas ? comunidad.reglas.map(r => ({...r})) : [])
        setErrorEditar(null)
        setExitoEditar(false)
        setMostrarModalEditar(true)
    }

    function maneja_archivo_editar(e, setArchivo, setPreview)
    {
        const archivo = e.target.files[0]

        if(!archivo)
            return

        if(archivo.size > 5 * 1024 * 1024)
        {
            setErrorEditar('La imagen no debe superar los 5 MB')
            e.target.value = ''
            return
        }

        setErrorEditar(null)
        setArchivo(archivo)

        const lector = new FileReader()
        lector.onload = ev => setPreview(ev.target.result)
        lector.readAsDataURL(archivo)
    }

    async function resuelve_imagen(modo, url, archivo, original)
    {
        if(modo === 'url')
            return url.trim() || null

        if(modo === 'archivo' && archivo)
            return await new Promise(res =>
            {
                const reader = new FileReader()
                reader.onload = e => res(e.target.result)
                reader.readAsDataURL(archivo)
            })

        return original || null
    }

    function agrega_regla_editar()
    {
        setEditReglas(prev => [...prev, {titulo: '', descripcion: ''}])
    }

    function actualiza_regla_editar(idc, campo, valor)
    {
        setEditReglas(prev => prev.map((r, i) => i === idc ? {...r, [campo]: valor} : r))
    }

    function elimina_regla_editar(idc)
    {
        setEditReglas(prev => prev.filter((_, i) => i !== idc))
    }

    async function maneja_guardar_comunidad()
    {
        if(!editNombre.trim() || editNombre.trim().length < 3)
        {
            setErrorEditar('El nombre debe tener al menos 3 caracteres')
            return
        }

        setEnviandoEditar(true)
        setErrorEditar(null)
        setExitoEditar(false)

        try
        {
            const banner_final = await resuelve_imagen(editModoBanner, editUrlBanner, editArchivoBanner, comunidad?.banner)
            const icono_final  = await resuelve_imagen(editModoIcono,  editUrlIcono,  editArchivoIcono,  comunidad?.icono)
            const reglas_validas = editReglas.filter(r => r.titulo.trim()).map(r => ({titulo: r.titulo.trim(), ...(r.descripcion?.trim() ? {descripcion: r.descripcion.trim()} : {})}))

            const resp = await fetch(`/api/comunidades/${comunidad_id}`, {method: 'PUT', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({nombre: editNombre.trim(), descripcion: editDescripcion.trim(), banner: banner_final, icono: icono_final, reglas: reglas_validas.length > 0 ? reglas_validas : null})})

            if(!resp.ok)
            {
                const datos = await resp.json().catch(() => ({}))

                throw new Error(datos.error || `Error ${resp.status}`)
            }

            setExitoEditar(true)

            setTimeout(() =>
            {
                setMostrarModalEditar(false)
                setExitoEditar(false)

                if(al_actualizar_comunidad)
                    al_actualizar_comunidad()
            }, 1200)
        }

        catch(e)
        {
            setErrorEditar(e.message)
        }

        finally
        {
            setEnviandoEditar(false)
        }
    }

    async function maneja_fijar()
    {
        setCargandoFijar(true)

        try
        {
            const resp = await fetch(`/api/publicaciones/${publicacion.id}/fijar`, {method: 'POST', credentials: 'include'})

            if(!resp.ok)
                throw new Error(`Error ${resp.status}`)

            const datos = await resp.json()
            const nuevo = datos.fijada

            setFijada(nuevo)

            if(al_actualizar)
                al_actualizar({ fijada: nuevo })
        }

        catch(e)
        {
            console.error('Error al fijar/desfijar:', e)
        }

        finally
        {
            setCargandoFijar(false)
        }
    }

    async function maneja_bloquear()
    {
        setCargandoBloquear(true)

        try
        {
            const resp = await fetch(`/api/publicaciones/${publicacion.id}/bloquear`, {method: 'POST', credentials: 'include'})

            if(!resp.ok)
                throw new Error(`Error ${resp.status}`)

            const datos = await resp.json()
            const nuevo = datos.bloqueada

            setBloqueada(nuevo)

            if(al_actualizar)
                al_actualizar({ bloqueada: nuevo })
        }

        catch(e)
        {
            console.error('Error al bloquear comentarios:', e)
        }

        finally
        {
            setCargandoBloquear(false)
        }
    }

    async function carga_miembros_comunidad()
    {
        setCargandoMiembros(true)

        try
        {
            const resp = await fetch(`/api/comunidades/${comunidad_id}/miembros`, {credentials: 'include'})

            if(resp.ok)
            {
                const datos = await resp.json()

                setMiembrosComunidad(datos)
            }
        }

        catch
        {
        }

        finally
        {
            setCargandoMiembros(false)
        }
    }

    async function carga_usuarios_para_invitar()
    {
        setCargandoInvitar(true)

        try
        {
            const resp = await fetch('/api/usuarios', {credentials: 'include'})

            if(resp.ok)
            {
                const datos = await resp.json()

                setUsuariosCargados(datos)
            }
        }

        catch
        {
        }

        finally
        {
            setCargandoInvitar(false)
        }
    }

    async function busca_usuarios_para_invitar(q)
    {
        if(!q || q.trim().length < 2)
        {
            setUsuariosCargados([])
            return
        }

        setCargandoInvitar(true)

        try
        {
            const resp = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`, {credentials: 'include'})

            if(resp.ok)
            {
                const datos = await resp.json()

                setUsuariosCargados(datos.usuarios || datos || [])
            }
        }

        catch
        {
        }

        finally
        {
            setCargandoInvitar(false)
        }
    }

    async function maneja_invitar()
    {
        if(!usuarioInvitar)
            return

        try
        {
            const resp = await fetch(`/api/comunidades/${comunidad_id}/invitar`, {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({usuario_id: usuarioInvitar.id})})

            if(!resp.ok)
            {
                const datos = await resp.json().catch(() => ({}))

                throw new Error(datos.error || `Error ${resp.status}`)
            }

            setExitoInvitar(true)

            setTimeout(() =>
            {
                setMostrarModalInvitar(false)
                setExitoInvitar(false)
            }, 1500)
        }

        catch(e)
        {
            setErrorInvitar(e.message)
        }
    }

    async function maneja_agregar_moderador()
    {
        if(!usuarioSeleccionado)
            return

        setEnviandoMod(true)
        setErrorMod(null)
        setExitoMod(false)

        try
        {
            const resp = await fetch(`/api/comunidades/${comunidad_id}/moderadores`, {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({usuario_id: usuarioSeleccionado.id})})

            if(!resp.ok)
            {
                const datos = await resp.json().catch(() => ({}))

                throw new Error(datos.error || `Error ${resp.status}`)
            }

            setExitoMod(true)
            setIdNuevoMod('')
            setBusquedaMod('')
            setUsuarioSeleccionado(null)

            setTimeout(() =>
            {
                setMostrarModalMod(false)
                setExitoMod(false)

                if(al_agregar_moderador)
                    al_agregar_moderador()
            }, 1500)
        }

        catch(e)
        {
            setErrorMod(e.message)
        }

        finally
        {
            setEnviandoMod(false)
        }
    }

    async function maneja_eliminar_comunidad()
    {
        setEliminandoComunidad(true)
        setErrorEliminar(null)

        try
        {
            const resp = await fetch(`/api/comunidades/${comunidad_id}`, {method: 'DELETE', credentials: 'include'})

            if(!resp.ok)
            {
                const datos = await resp.json().catch(() => ({}))

                throw new Error(datos.error || `Error ${resp.status}`)
            }

            setMostrarConfirmarEliminar(false)

            if(al_eliminar_comunidad)

                al_eliminar_comunidad()
        }

        catch(e)
        {
            setErrorEliminar(e.message)
        }

        finally
        {
            setEliminandoComunidad(false)
        }
    }

    async function abre_modal_eliminar_mod()
    {
        setMostrarModalEliminarMod(true)
        setErrorEliminarMod(null)
        setExitoEliminarMod(false)
        setEliminandoMod(null)
        setCargandoModeradoresList(true)

        try
        {
            //Obtiene nomnres de los mods actuales
            const mods = (comunidad?.moderadores || []).filter(mid => mid !== comunidad?.creado_por)

            const resultados = await Promise.all(
                mods.map(async mid =>
                {
                    try
                    {
                        const resp = await fetch(`/api/usuarios/${mid}`, {credentials: 'include'})

                        if(resp.ok)
                        {
                            const datos = await resp.json()

                            return {id: mid, nombre_usuario: datos.nombre_usuario || mid}
                        }
                    }

                    catch {}

                    return {id: mid, nombre_usuario: mid}
                })
            )

            setModeradoresCargados(resultados)
        }

        catch
        {
        }

        finally
        {
            setCargandoModeradoresList(false)
        }
    }

    async function maneja_eliminar_mod(mod_id)
    {
        setEliminandoMod(mod_id)
        setErrorEliminarMod(null)

        try
        {
            const resp = await fetch(`/api/comunidades/${comunidad_id}/moderadores/${mod_id}`, {method: 'DELETE', credentials: 'include'})

            if(!resp.ok)
            {
                const datos = await resp.json().catch(() => ({}))

                throw new Error(datos.error || `Error ${resp.status}`)
            }

            setModeradoresCargados(prev => prev.filter(m => m.id !== mod_id))

            setExitoEliminarMod(true)

            setTimeout(() => setExitoEliminarMod(false), 2000)

            if(al_agregar_moderador)
                al_agregar_moderador()
        }

        catch(e)
        {
            setErrorEliminarMod(e.message)
        }

        finally
        {
            setEliminandoMod(null)
        }
    }

    async function abre_modal_expulsar()
    {
        setMostrarModalExpulsar(true)
        setErrorExpulsar(null)
        setExpulsando(null)
        setBusquedaExpulsar('')
        setCargandoMiembrosExpulsar(true)

        try
        {
            const resp = await fetch(`/api/comunidades/${comunidad_id}/miembros`, {credentials: 'include'})

            if(resp.ok)
            {
                const datos = await resp.json()

                //Excluye al creador de la lista de expulsables
                setMiembrosParaExpulsar(datos.filter(m => m.id !== comunidad?.creado_por))
            }
        }

        catch {}

        finally
        {
            setCargandoMiembrosExpulsar(false)
        }
    }

    async function maneja_expulsar(miembro_id)
    {
        setExpulsando(miembro_id)
        setErrorExpulsar(null)

        try
        {
            const resp = await fetch(`/api/comunidades/${comunidad_id}/miembros/${miembro_id}`, {method: 'DELETE', credentials: 'include'})

            if(!resp.ok)
            {
                const datos = await resp.json().catch(() => ({}))

                throw new Error(datos.error || `Error ${resp.status}`)
            }

            setMiembrosParaExpulsar(prev => prev.filter(m => m.id !== miembro_id))

            if(al_actualizar_comunidad)
                al_actualizar_comunidad()
        }

        catch(e)
        {
            setErrorExpulsar(e.message)
        }

        finally
        {
            setExpulsando(null)
        }
    }

    function SelectorImagenEditar({modo, setModo, urlVal, setUrl, preview, refArchivo, onArchivoChange, idPrefix, label})
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
                                        disabled={enviandoEditar}
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
                                        disabled={enviandoEditar}
                                    />
                                    {urlVal && /^https?:\/\/.+/.test(urlVal) &&
                                        (
                                            <img
                                                src={urlVal}
                                                alt="Vista previa"
                                                className="modal-imagen-preview"
                                                onError={e => {e.target.style.display='none'}}
                                                onLoad={e  => {e.target.style.display='block'}}
                                            />
                                        )
                                    }
                                </>
                            )
                            :
                            (
                                <div className="modal-imagen-selector">
                                    <div
                                        className={`modal-imagen-selector-area${preview ? ' modal-imagen-selector-area--con-preview' : ''}`}
                                        onClick={() => !enviandoEditar && refArchivo.current.click()}
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
                                        id={`editar-${idPrefix}-archivo`}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        className="panel-mod-input-archivo-oculto"
                                        onChange={onArchivoChange}
                                        disabled={enviandoEditar}
                                    />
                                </div>
                            )
                        }
                    </div>
                )
    }

    return (
                <>
                    <div className="panel-moderacion">
                        <div className="panel-moderacion-cabecera">
                            <span className="panel-moderacion-icono">{es_admin_comunidad ? 'A' : 'M'}</span>
                            {es_admin_comunidad ? 'Herramientas de administración' : 'Herramientas de moderación'}
                        </div>

                        <div className="panel-moderacion-cuerpo">
                            <p className="panel-moderacion-aviso">
                                {es_admin_comunidad ? 'Eres el administrador de esta comunidad' : 'Eres moderador de esta comunidad'}
                            </p>

                            {!en_publicacion &&
                                (
                                    <div className="panel-moderacion-grupo">
                                        <p className="panel-moderacion-grupo-titulo">Comunidad</p>

                                        <button
                                            className="panel-moderacion-btn"
                                            onClick={abre_modal_editar}
                                        >
                                            Editar comunidad
                                        </button>

                                        {es_admin_comunidad &&
                                            (
                                                <button
                                                    className="panel-moderacion-btn panel-moderacion-btn--peligro"
                                                    onClick={() => {setMostrarConfirmarEliminar(true); setErrorEliminar(null)}}
                                                >
                                                    Eliminar comunidad
                                                </button>
                                            )
                                        }
                                    </div>
                                )
                            }

                            {en_publicacion &&
                                (
                                    <div className="panel-moderacion-grupo">
                                        <p className="panel-moderacion-grupo-titulo">Publicación</p>

                                        <button
                                            className="panel-moderacion-btn"
                                            onClick={maneja_fijar}
                                            disabled={cargandoFijar}
                                        >
                                            {cargandoFijar ? '...' : fijada ? 'Desfijar' : 'Fijar publicación'}
                                        </button>

                                        <button
                                            className="panel-moderacion-btn"
                                            onClick={maneja_bloquear}
                                            disabled={cargandoBloquear}
                                        >
                                            {cargandoBloquear ? '...' : bloqueada ? 'Habilitar comentarios' : 'Bloquear comentarios'}
                                        </button>
                                    </div>
                                )
                            }

                            <div className="panel-moderacion-grupo">
                                <p className="panel-moderacion-grupo-titulo">Moderadores</p>

                                <button
                                    className="panel-moderacion-btn"
                                    onClick={() =>
                                    {
                                        setMostrarModalMod(true)
                                        setErrorMod(null)
                                        setExitoMod(false)
                                        setIdNuevoMod('')
                                        setBusquedaMod('')
                                        setMiembrosComunidad([])
                                        setUsuarioSeleccionado(null)
                                        setMostrarDropdown(false)
                                        carga_miembros_comunidad()
                                    }}
                                >
                                    + Agregar moderador
                                </button>

                                {es_admin_comunidad &&
                                    (
                                        <button
                                            className="panel-moderacion-btn panel-moderacion-btn--peligro"
                                            onClick={abre_modal_eliminar_mod}
                                        >
                                            − Eliminar moderador
                                        </button>
                                    )
                                }

                                {es_privada &&
                                    (
                                        <button
                                            className="panel-moderacion-btn"
                                            onClick={() =>
                                            {
                                                setMostrarModalInvitar(true)
                                                setErrorInvitar(null)
                                                setExitoInvitar(false)
                                                setBusquedaInvitar('')
                                                setUsuarioInvitar(null)
                                                setUsuariosCargados([])
                                                setMostrarDropdownInvitar(false)
                                                carga_usuarios_para_invitar()
                                            }}
                                        >
                                            + Invitar usuario
                                        </button>
                                    )
                                }
                            </div>

                            <div className="panel-moderacion-grupo">
                                <p className="panel-moderacion-grupo-titulo">Miembros</p>

                                <button
                                    className="panel-moderacion-btn panel-moderacion-btn--peligro"
                                    onClick={abre_modal_expulsar}
                                >
                                    Expulsar miembro
                                </button>
                            </div>
                        </div>
                    </div>
                    {
                        //Modal de edicion de comunidad
                    }
                    {mostrarModalEditar &&
                        (
                            <div
                                className="modal-overlay"
                                onClick={e => {if(e.target === e.currentTarget) setMostrarModalEditar(false)}}
                            >
                                <div className="modal-contenedor">
                                    <div className="modal-cabecera">
                                        <h2 className="modal-titulo">Editar comunidad</h2>
                                        <button className="modal-btn-cerrar" onClick={() => setMostrarModalEditar(false)} aria-label="Cerrar">X</button>
                                    </div>

                                    <div className="modal-formulario">
                                        <div className="modal-campo">
                                            <label className="modal-campo-label" htmlFor="editar-nombre">
                                                Nombre <span className="modal-campo-requerido">*</span>
                                            </label>
                                            <div className="modal-campo-prefijo-contenedor">
                                                <span className="modal-campo-prefijo">c/</span>
                                                <input
                                                    id="editar-nombre"
                                                    type="text"
                                                    className="modal-campo-input modal-campo-input--con-prefijo"
                                                    value={editNombre}
                                                    onChange={e => setEditNombre(e.target.value)}
                                                    maxLength={21}
                                                    disabled={enviandoEditar}
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-campo">
                                            <label className="modal-campo-label" htmlFor="editar-descripcion">Descripción</label>
                                            <textarea
                                                id="editar-descripcion"
                                                className="modal-campo-textarea"
                                                value={editDescripcion}
                                                onChange={e => setEditDescripcion(e.target.value)}
                                                placeholder="Descripción de la comunidad"
                                                maxLength={500}
                                                rows={3}
                                                disabled={enviandoEditar}
                                            />
                                            <p className="modal-campo-ayuda">
                                                {editDescripcion.length > 0 &&
                                                    (
                                                        <span className={`modal-campo-contador ${editDescripcion.length > 450 ? 'modal-campo-contador--limite' : ''}`}>
                                                            {editDescripcion.length}/500
                                                        </span>
                                                    )
                                                }
                                            </p>
                                        </div>

                                        <SelectorImagenEditar
                                            label="Banner"
                                            idPrefix="banner"
                                            modo={editModoBanner}
                                            setModo={setEditModoBanner}
                                            urlVal={editUrlBanner}
                                            setUrl={setEditUrlBanner}
                                            preview={editPreviewBanner}
                                            refArchivo={refBannerArchivo}
                                            onArchivoChange={e => maneja_archivo_editar(e, setEditArchivoBanner, setEditPreviewBanner)}
                                        />

                                        <SelectorImagenEditar
                                            label="Icono"
                                            idPrefix="icono"
                                            modo={editModoIcono}
                                            setModo={setEditModoIcono}
                                            urlVal={editUrlIcono}
                                            setUrl={setEditUrlIcono}
                                            preview={editPreviewIcono}
                                            refArchivo={refIconoArchivo}
                                            onArchivoChange={e => maneja_archivo_editar(e, setEditArchivoIcono, setEditPreviewIcono)}
                                        />

                                        <div className="modal-campo">
                                            <div className="modal-reglas-cabecera">
                                                <label className="modal-campo-label">Reglas</label>
                                                <button
                                                    type="button"
                                                    className="modal-reglas-btn-agregar"
                                                    onClick={agrega_regla_editar}
                                                    disabled={enviandoEditar || editReglas.length >= 15}
                                                >
                                                    + Agregar regla
                                                </button>
                                            </div>

                                            {editReglas.length === 0 &&
                                                (
                                                    <p className="modal-campo-ayuda">Sin reglas. Agrega las reglas de tu comunidad</p>
                                                )
                                            }

                                            {editReglas.map((regla, idc) =>
                                                (
                                                    <div key={idc} className="modal-regla-item">
                                                        <div className="modal-regla-numero">{idc + 1}</div>
                                                        <div className="modal-regla-campos">
                                                            <input
                                                                type="text"
                                                                className="modal-campo-input"
                                                                value={regla.titulo}
                                                                onChange={e => actualiza_regla_editar(idc, 'titulo', e.target.value)}
                                                                placeholder="Título de la regla"
                                                                maxLength={100}
                                                                disabled={enviandoEditar}
                                                            />
                                                            <textarea
                                                                className="modal-campo-textarea modal-regla-descripcion"
                                                                value={regla.descripcion || ''}
                                                                onChange={e => actualiza_regla_editar(idc, 'descripcion', e.target.value)}
                                                                placeholder="Descripción (opcional)"
                                                                maxLength={500}
                                                                rows={2}
                                                                disabled={enviandoEditar}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="modal-regla-btn-eliminar"
                                                            onClick={() => elimina_regla_editar(idc)}
                                                            disabled={enviandoEditar}
                                                            aria-label="Eliminar regla"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {errorEditar && <p className="modal-error">{errorEditar}</p>}
                                        {exitoEditar && <p className="panel-moderacion-exito">¡Comunidad actualizada!</p>}
                                    </div>

                                    <div className="modal-pie">
                                        <button
                                            className="modal-btn-cancelar"
                                            onClick={() => setMostrarModalEditar(false)}
                                            disabled={enviandoEditar}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="btn-primary modal-btn-enviar"
                                            onClick={maneja_guardar_comunidad}
                                            disabled={enviandoEditar || !editNombre.trim() || exitoEditar}
                                        >
                                            {enviandoEditar ? 'Guardando...' : 'Guardar cambios'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        //Modal agregar mod
                    }
                    {mostrarModalMod &&
                        (
                            <div
                                className="modal-overlay"
                                onClick={e => {if(e.target === e.currentTarget) setMostrarModalMod(false)}}
                            >
                                <div className="modal-contenedor">
                                    <div className="modal-cabecera">
                                        <h2 className="modal-titulo">Agregar moderador</h2>
                                        <button className="modal-btn-cerrar" onClick={() => setMostrarModalMod(false)} aria-label="Cerrar">X</button>
                                    </div>

                                    <div className="modal-formulario">
                                        <div className="modal-campo">
                                            <label className="modal-campo-label">
                                                Buscar usuario <span className="modal-campo-requerido">*</span>
                                            </label>

                                            {usuarioSeleccionado
                                                ?
                                                (
                                                    <div className="modal-usuario-seleccionado">
                                                        <span className="modal-usuario-seleccionado-nombre">u/{usuarioSeleccionado.nombre_usuario}</span>
                                                        <button
                                                            className="modal-usuario-seleccionado-quitar"
                                                            onClick={() => {setUsuarioSeleccionado(null); setBusquedaMod('')}}
                                                            disabled={enviando_mod || exitoMod}
                                                            type="button"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                )
                                                :
                                                (
                                                    <div className="publicar-comunidad-wrapper" ref={refBuscadorMod}>
                                                        <input
                                                            type="text"
                                                            className="modal-campo-input"
                                                            placeholder={cargandoMiembros ? 'Cargando usuarios…' : 'Buscar usuario para invitar…'}
                                                            value={busquedaMod}
                                                            onChange={e => { setBusquedaMod(e.target.value); setMostrarDropdown(true)}}
                                                            onFocus={() => setMostrarDropdown(true)}
                                                            disabled={enviando_mod || exitoMod || cargandoMiembros}
                                                            autoComplete="off"
                                                        />

                                                        {mostrarDropdown &&
                                                            (
                                                                <div className="publicar-comunidad-dropdown">
                                                                    {miembrosComunidad
                                                                        .filter(u => u.nombre_usuario?.toLowerCase().includes(busquedaMod.toLowerCase()))
                                                                        .map(u =>
                                                                            (
                                                                                <div
                                                                                    key={u.id}
                                                                                    className="publicar-comunidad-opcion"
                                                                                    onMouseDown={() => {setUsuarioSeleccionado(u); setBusquedaMod(''); setMostrarDropdown(false)}}
                                                                                >
                                                                                    <span className="publicar-comunidad-opcion-prefijo">u/</span>{u.nombre_usuario}
                                                                                </div>
                                                                            )
                                                                        )
                                                                    }

                                                                    {miembrosComunidad.filter(u => u.nombre_usuario?.toLowerCase().includes(busquedaMod.toLowerCase())).length === 0 &&
                                                                        <div className="publicar-comunidad-vacio">
                                                                            {cargandoMiembros ? 'Cargando...' : 'Sin resultados'}
                                                                        </div>
                                                                    }
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>

                                        {errorMod && <p className="modal-error">{errorMod}</p>}
                                        {exitoMod && <p className="panel-moderacion-exito">Moderador agregado correctamente</p>}
                                    </div>

                                    <div className="modal-pie">
                                        <button className="modal-btn-cancelar" onClick={() => setMostrarModalMod(false)} disabled={enviando_mod}>
                                            Cancelar
                                        </button>
                                        <button
                                            className="modal-btn-enviar"
                                            onClick={maneja_agregar_moderador}
                                            disabled={enviando_mod || !usuarioSeleccionado || exitoMod}
                                        >
                                            {enviando_mod ? 'Agregando...' : 'Agregar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        //Modal invitar miembros
                    }
                    {mostrarModalInvitar &&
                        (
                            <div
                                className="modal-overlay"
                                onClick={e => {if(e.target === e.currentTarget) setMostrarModalInvitar(false)}}
                            >
                                <div className="modal-contenedor">
                                    <div className="modal-cabecera">
                                        <h2 className="modal-titulo">Invitar miembro</h2>
                                        <button className="modal-btn-cerrar" onClick={() => setMostrarModalInvitar(false)} aria-label="Cerrar">X</button>
                                    </div>

                                    <div className="modal-formulario">
                                        <div className="modal-campo">
                                            <label className="modal-campo-label">
                                                Buscar usuario <span className="modal-campo-requerido">*</span>
                                            </label>

                                            {usuarioInvitar
                                                ?
                                                (
                                                    <div className="modal-usuario-seleccionado">
                                                        <span className="modal-usuario-seleccionado-nombre">u/{usuarioInvitar.nombre_usuario}</span>
                                                        <button
                                                            className="modal-usuario-seleccionado-quitar"
                                                            onClick={() => {setUsuarioInvitar(null); setBusquedaInvitar('')}}
                                                            disabled={exitoInvitar}
                                                            type="button"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                )
                                                :
                                                (
                                                    <div className="publicar-comunidad-wrapper" ref={refBuscadorInvitar}>
                                                        <input
                                                            type="text"
                                                            className="modal-campo-input"
                                                            placeholder={cargandoInvitar ? 'Cargando usuarios…' : 'Buscar por nombre de usuario'}
                                                            value={busquedaInvitar}
                                                            onChange={e =>
                                                            {
                                                                const val = e.target.value
                                                                setBusquedaInvitar(val)
                                                                setMostrarDropdownInvitar(true)

                                                                clearTimeout(debounceInvitar.current)
                                                                debounceInvitar.current = setTimeout(() =>
                                                                {
                                                                    busca_usuarios_para_invitar(val)
                                                                }, 300)
                                                            }}
                                                            onFocus={() => setMostrarDropdownInvitar(true)}
                                                            disabled={exitoInvitar}
                                                            autoComplete="off"
                                                        />

                                                        {mostrarDropdownInvitar &&
                                                            (
                                                                <div className="publicar-comunidad-dropdown">
                                                                    {usuariosCargados
                                                                        .filter(u => u.nombre_usuario?.toLowerCase().includes(busquedaInvitar.toLowerCase()))
                                                                        .map(u =>
                                                                            (
                                                                                <div
                                                                                    key={u.id}
                                                                                    className="publicar-comunidad-opcion"
                                                                                    onMouseDown={() => {setUsuarioInvitar(u); setBusquedaInvitar(''); setMostrarDropdownInvitar(false)}}
                                                                                >
                                                                                    <span className="publicar-comunidad-opcion-prefijo">u/</span>{u.nombre_usuario}
                                                                                </div>
                                                                            )
                                                                        )
                                                                    }

                                                                    {usuariosCargados.filter(u => u.nombre_usuario?.toLowerCase().includes(busquedaInvitar.toLowerCase())).length === 0 &&
                                                                        <div className="publicar-comunidad-vacio">
                                                                            {cargandoInvitar ? 'Cargando...' : 'Sin resultados'}
                                                                        </div>
                                                                    }
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>

                                        {errorInvitar && <p className="modal-error">{errorInvitar}</p>}
                                        {exitoInvitar && <p className="panel-moderacion-exito">Invitación enviada correctamente</p>}
                                    </div>

                                    <div className="modal-pie">
                                        <button className="modal-btn-cancelar" onClick={() => setMostrarModalInvitar(false)} disabled={exitoInvitar}>
                                            Cancelar
                                        </button>
                                        <button className="modal-btn-enviar" onClick={maneja_invitar} disabled={!usuarioInvitar || exitoInvitar}>
                                            Invitar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        //Modal eliminar comunidad
                    }
                    {mostrarConfirmarEliminar &&
                        (
                            <div
                                className="modal-overlay"
                                onClick={e => {if(e.target === e.currentTarget && !eliminandoComunidad) setMostrarConfirmarEliminar(false)}}
                            >
                                <div className="modal-contenedor">
                                    <div className="modal-cabecera">
                                        <h2 className="modal-titulo">Eliminar comunidad</h2>
                                        <button className="modal-btn-cerrar" onClick={() => setMostrarConfirmarEliminar(false)} disabled={eliminandoComunidad} aria-label="Cerrar">X</button>
                                    </div>

                                    <div className="modal-formulario">
                                        <p className="panel-mod-confirmar-texto">
                                            ¿Estás seguro de que deseas eliminar <strong>c/{comunidad?.nombre}</strong>? Esta acción no se puede deshacer
                                        </p>

                                        {errorEliminar && <p className="modal-error">{errorEliminar}</p>}
                                    </div>

                                    <div className="modal-pie">
                                        <button className="modal-btn-cancelar" onClick={() => setMostrarConfirmarEliminar(false)} disabled={eliminandoComunidad}>
                                            Cancelar
                                        </button>
                                        <button
                                            className="panel-moderacion-btn panel-moderacion-btn--peligro panel-mod-btn-confirmar-eliminar"
                                            onClick={maneja_eliminar_comunidad}
                                            disabled={eliminandoComunidad}
                                        >
                                            {eliminandoComunidad ? 'Eliminando...' : 'Sí, eliminar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        //Modal elimina mods
                    }
                    {mostrarModalEliminarMod &&
                        (
                            <div
                                className="modal-overlay"
                                onClick={e => {if(e.target === e.currentTarget) setMostrarModalEliminarMod(false)}}
                            >
                                <div className="modal-contenedor">
                                    <div className="modal-cabecera">
                                        <h2 className="modal-titulo">Eliminar moderador</h2>
                                        <button className="modal-btn-cerrar" onClick={() => setMostrarModalEliminarMod(false)} aria-label="Cerrar">X</button>
                                    </div>

                                    <div className="modal-formulario">
                                        {cargandoModeradoresList &&
                                            <p className="modal-campo-ayuda">Cargando moderadores...</p>
                                        }

                                        {!cargandoModeradoresList && moderadoresCargados.length === 0 &&
                                            <p className="modal-campo-ayuda">No hay moderadores que eliminar</p>
                                        }

                                        {!cargandoModeradoresList && moderadoresCargados.length > 0 &&
                                            (
                                                <ul className="panel-mod-lista">
                                                    {moderadoresCargados.map(mod =>
                                                        (
                                                            <li key={mod.id} className="panel-mod-lista-item">
                                                                <span>u/{mod.nombre_usuario}</span>
                                                                <button
                                                                    className="panel-moderacion-btn panel-moderacion-btn--peligro panel-mod-btn-lista"
                                                                    onClick={() => maneja_eliminar_mod(mod.id)}
                                                                    disabled={eliminandoMod === mod.id}
                                                                >
                                                                    {eliminandoMod === mod.id ? '...' : 'Eliminar'}
                                                                </button>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )
                                        }

                                        {errorEliminarMod && <p className="modal-error panel-mod-mensaje-margen">{errorEliminarMod}</p>}
                                        {exitoEliminarMod && <p className="panel-moderacion-exito panel-mod-mensaje-margen">Moderador eliminado correctamente</p>}
                                    </div>

                                    <div className="modal-pie">
                                        <button className="modal-btn-cancelar" onClick={() => setMostrarModalEliminarMod(false)}>
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        //Modal expulsa miembro
                    }
                    {mostrarModalExpulsar &&
                        (
                            <div
                                className="modal-overlay"
                                onClick={e => {if(e.target === e.currentTarget) setMostrarModalExpulsar(false)}}
                            >
                                <div className="modal-contenedor">
                                    <div className="modal-cabecera">
                                        <h2 className="modal-titulo">Expulsar miembro</h2>
                                        <button className="modal-btn-cerrar" onClick={() => setMostrarModalExpulsar(false)} aria-label="Cerrar">X</button>
                                    </div>

                                    <div className="modal-formulario">
                                        <div className="modal-campo">
                                            <input
                                                type="text"
                                                className="modal-campo-input"
                                                placeholder="Buscar miembro..."
                                                value={busquedaExpulsar}
                                                onChange={e => setBusquedaExpulsar(e.target.value)}
                                                disabled={cargandoMiembrosExpulsar}
                                            />
                                        </div>

                                        {cargandoMiembrosExpulsar &&
                                            <p className="modal-campo-ayuda">Cargando miembros...</p>
                                        }

                                        {!cargandoMiembrosExpulsar && miembrosParaExpulsar.length === 0 &&
                                            <p className="modal-campo-ayuda">No hay miembros que expulsar.</p>
                                        }

                                        {!cargandoMiembrosExpulsar && miembrosParaExpulsar.length > 0 &&
                                            (
                                                <ul className="panel-mod-lista panel-mod-lista--expulsar">
                                                    {miembrosParaExpulsar
                                                        .filter(m => m.nombre_usuario?.toLowerCase().includes(busquedaExpulsar.toLowerCase()))
                                                        .map(miembro =>
                                                            (
                                                                <li key={miembro.id} className="panel-mod-lista-item">
                                                                    <span>u/{miembro.nombre_usuario}</span>
                                                                    <button
                                                                        className="panel-moderacion-btn panel-moderacion-btn--peligro panel-mod-btn-lista"
                                                                        onClick={() => maneja_expulsar(miembro.id)}
                                                                        disabled={expulsando === miembro.id}
                                                                    >
                                                                        {expulsando === miembro.id ? '...' : 'Expulsar'}
                                                                    </button>
                                                                </li>
                                                            )
                                                        )
                                                    }
                                                </ul>
                                            )
                                        }

                                        {errorExpulsar && <p className="modal-error panel-mod-mensaje-margen">{errorExpulsar}</p>}
                                    </div>

                                    <div className="modal-pie">
                                        <button className="modal-btn-cancelar" onClick={() => setMostrarModalExpulsar(false)}>
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </>
            )
}