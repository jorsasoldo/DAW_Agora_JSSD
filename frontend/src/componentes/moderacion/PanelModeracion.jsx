import {useState, useEffect, useRef} from 'react'

export default function PanelModeracion({comunidad_id, es_moderador, publicacion, al_actualizar, al_agregar_moderador})
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

    const en_publicacion = publicacion != null

    if(!es_moderador)
        return null

    async function maneja_fijar()
    {
        setCargandoFijar(true)

        try
        {
            const resp = await fetch(`/api/publicaciones/${publicacion.id}/fijar`, {method: 'POST', credentials: 'include',})

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
            const resp = await fetch(`/api/publicaciones/${publicacion.id}/bloquear`, {method: 'POST', credentials: 'include',})

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

    //Cierra el dropdown al hacer click fuera
    useEffect(() =>
    {
        function cierra_dropdown(e)
        {
            if(refBuscadorMod.current && !refBuscadorMod.current.contains(e.target))
                setMostrarDropdown(false)
        }

        document.addEventListener('mousedown', cierra_dropdown)

        return () => document.removeEventListener('mousedown', cierra_dropdown)
    }, [])

    //Carga los miembros suscritos a la comunidad cuando se abre el modal
    async function carga_miembros_comunidad()
    {
        if(!comunidad_id)
            return

        setCargandoMiembros(true)

        try
        {
            const resp = await fetch(`/api/comunidades/${comunidad_id}/miembros`, {credentials: 'include'})

            if(resp.ok)
            {
                const datos = await resp.json()
                setMiembrosComunidad(Array.isArray(datos) ? datos : [])
            }
        }

        catch(e)
        {
            console.error('Error al cargar miembros:', e)
        }

        finally
        {
            setCargandoMiembros(false)
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
            const resp = await fetch(`/api/comunidades/${comunidad_id}/moderadores`, {method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include', body: JSON.stringify({usuario_id: usuarioSeleccionado.id}),})

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

    return (
                <>
                    {
                        //Panel lateral de moderacion
                    }
                    <div className="panel-moderacion">
                        <div className="panel-moderacion-cabecera">
                            <span className="panel-moderacion-icono">M</span>
                            Herramientas de moderación
                        </div>

                        <div className="panel-moderacion-cuerpo">
                            <p className="panel-moderacion-aviso">
                                Eres moderador de esta comunidad
                            </p>
                            {
                                //Acciones en la publicacion
                            }
                            {en_publicacion &&
                                (
                                    <div className="panel-moderacion-grupo">
                                        <p className="panel-moderacion-grupo-titulo">Publicación</p>

                                        <button
                                            className={`panel-moderacion-btn ${fijada ? 'panel-moderacion-btn--activo' : ''}`}
                                            onClick={maneja_fijar}
                                            disabled={cargandoFijar}
                                        >
                                            {cargandoFijar ? '...' : fijada ? 'Desfijar publicación' : 'Fijar publicación'}
                                        </button>

                                        <button
                                            className={`panel-moderacion-btn ${bloqueada ? 'panel-moderacion-btn--peligro-activo' : 'panel-moderacion-btn--peligro'}`}
                                            onClick={maneja_bloquear}
                                            disabled={cargandoBloquear}
                                        >
                                            {cargandoBloquear ? '...' : bloqueada ? 'Reabrir comentarios' : 'Bloquear comentarios'}
                                        </button>
                                    </div>
                                )
                            }
                            {
                                //Seccion de moderadores
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
                            </div>
                        </div>
                    </div>

                    {
                        //Modal de agregar mods
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

                                        <button
                                            className="modal-btn-cerrar"
                                            onClick={() => setMostrarModalMod(false)}
                                            aria-label="Cerrar"
                                        >
                                            X
                                        </button>
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
                                                            placeholder={cargandoMiembros ? 'Cargando miembros…' : 'Buscar entre suscriptores…'}
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

                                        {errorMod &&
                                            <p className="modal-error">{errorMod}</p>
                                        }

                                        {exitoMod &&
                                            <p className="panel-moderacion-exito">Moderador agregado correctamente</p>
                                        }
                                    </div>

                                    <div className="modal-pie">
                                        <button
                                            className="modal-btn-cancelar"
                                            onClick={() => setMostrarModalMod(false)}
                                            disabled={enviando_mod}
                                        >
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
                </>
            )
}