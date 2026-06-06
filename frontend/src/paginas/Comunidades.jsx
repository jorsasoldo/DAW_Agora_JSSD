import {useState, useEffect, useCallback} from 'react'

import {Link} from 'react-router-dom'

import ModalCrearComunidad from '../componentes/comunidad/ModalCrearComunidad.jsx'

import {useAutentifica} from '../contexto/ContextoUsuario.jsx'

export default function Comunidades()
{
    const [comunidades, setComunidades] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [busqueda, setBusqueda] = useState('')
    const [modalAbierto, setModalAbierto] = useState(false)
    const {usuario} = useAutentifica()
    const [idsSuscritas, setIdsSuscritas] = useState([])
    const [visibles, setVisibles] = useState(5)
    const [comunidadesInvitadas, setComunidadesInvitadas] = useState([])

    const carga_comunidades = useCallback(async () =>
    {
        setCargando(true)

        setError(null)

        try
        {
            const resp = await fetch('/api/comunidades', {credentials: 'include'})

            if(!resp.ok)
                throw new Error(`Error ${resp.status} al cargar las comunidades`)

            const datos = await resp.json()

            setComunidades(datos)
        }

        catch(e)
        {
            setError(e.message)
        }

        finally
        {
            setCargando(false)
        }
    }, [])

    useEffect(() => {carga_comunidades()}, [carga_comunidades])

    useEffect(() =>
    {
        if(!usuario?.id)
        {
            setIdsSuscritas([])
            setComunidadesInvitadas([])
            return
        }

        async function carga_suscritas()
        {
            try
            {
                const resp = await fetch(`/api/usuarios/${usuario.id}`, {credentials: 'include'})

                if(resp.ok)
                {
                    const datos = await resp.json()
                    const ids = datos.comunidades_suscritas || []

                    setIdsSuscritas(ids)

                    //Carga las comunidades privadas suscritas que no llegan por el /api/comunidades
                    const ids_privadas_faltantes = ids.filter(id => !comunidades.some(c => c.id === id))

                    let privadas_validas = []

                    if(ids_privadas_faltantes.length > 0)
                    {
                        const resultados = await Promise.all(ids_privadas_faltantes.map(id => fetch(`/api/comunidades/${id}`, {credentials: 'include'}).then(r => r.ok ? r.json() : null).catch(() => null)))

                        privadas_validas = resultados.filter(Boolean)

                        if(privadas_validas.length > 0)
                            setComunidades(prev => [...prev, ...privadas_validas.filter(c => !prev.some(p => p.id === c.id))])
                    }

                    //Busca invitaciones pendientes
                    const todas = [...comunidades, ...privadas_validas]
                    const invitadas = todas.filter(c => c.es_privada && Array.isArray(c.invitados_pendientes) && c.invitados_pendientes.includes(usuario.id) && !ids.includes(c.id))

                    //Busca comunidades privadas donde el usuario tiene invitacion pendiente
                    //pero que no son publicas ni suscritas
                    const resp_inv = await fetch(`/api/comunidades/invitaciones-pendientes`, {credentials: 'include'})

                    if(resp_inv.ok)
                    {
                        const inv_datos = await resp_inv.json()
                        const ids_ya = invitadas.map(c => c.id)
                        const nuevas = inv_datos.filter(c => !ids_ya.includes(c.id))

                        setComunidadesInvitadas([...invitadas, ...nuevas])
                    }

                    else
                    {
                        setComunidadesInvitadas(invitadas)
                    }
                }
            }

            catch
            {
            }
        }

        carga_suscritas()
    }, [usuario, comunidades])

    const comunidades_suscritas = comunidades.filter(c => idsSuscritas.includes(c.id))
    const comunidades_para_explorar = comunidades.filter(c => !idsSuscritas.includes(c.id)).filter(c => c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())).sort((a, b) => (b.total_miembros || 0) - (a.total_miembros || 0))
    const comunidades_filtradas = comunidades_para_explorar.slice(0, visibles)
    const hay_mas = visibles < comunidades_para_explorar.length

    function al_crear_comunidad()
    {
        setModalAbierto(false)

        carga_comunidades()
    }

    async function aceptar_invitacion(id_comunidad)
    {
        try
        {
            const resp = await fetch(`/api/comunidades/${id_comunidad}/aceptar-invitacion`, {method: 'POST', credentials: 'include'})

            if(resp.ok)
            {
                setComunidadesInvitadas(prev => prev.filter(c => c.id !== id_comunidad))
                setIdsSuscritas(prev => [...prev, id_comunidad])

                carga_comunidades()
            }
        }

        catch
        {
        }
    }

    async function rechazar_invitacion(id_comunidad)
    {
        try
        {
            const resp = await fetch(`/api/comunidades/${id_comunidad}/rechazar-invitacion`, {method: 'POST', credentials: 'include'})

            if(resp.ok)
                setComunidadesInvitadas(prev => prev.filter(c => c.id !== id_comunidad))
        }

        catch
        {
        }
    }

    return (
                <div className="pagina-comunidades">

                    <div className="pagina-comunidades-encabezado">
                        <div className="pagina-comunidades-encabezado-texto">
                            <h1 className="pagina-comunidades-titulo">Explorar comunidades</h1>
                            <p className="pagina-comunidades-subtitulo">
                                Descubre comunidades sobre los temas que te interesan
                            </p>
                        </div>

                        <button
                            className="pagina-comunidades-btn-crear"
                            onClick={() => setModalAbierto(true)}
                        >
                            + Crear comunidad
                        </button>
                    </div>

                    <div className="pagina-comunidades-buscador-contenedor">
                        <input
                            type="text"
                            className="pagina-comunidades-buscador"
                            placeholder="Buscar una comunidad..."
                            value={busqueda}
                            onChange={e => {setBusqueda(e.target.value); setVisibles(5)}}
                        />
                    </div>

                    {cargando &&
                        (
                            <div className="pagina-comunidades-estado">
                                <div className="pagina-inicio-spinner" />
                                <p className="pagina-inicio-estado-texto">Cargando comunidades...</p>
                            </div>
                        )
                    }

                    {!cargando && error &&
                        (
                            <div className="pagina-comunidades-estado">
                                <p className="pagina-inicio-error">{error}</p>
                                <button className="btn-primary" onClick={carga_comunidades}>
                                    Reintentar
                                </button>
                            </div>
                        )
                    }

                    {
                        //Invitaciones pendientes
                    }
                    {usuario && !cargando && !error && comunidadesInvitadas.length > 0 &&
                        (
                            <>
                                <h2 className="pagina-comunidades-seccion-titulo">Invitaciones pendientes</h2>
                                <p className="pagina-comunidades-contador">
                                    Te han invitado a {comunidadesInvitadas.length} comunidad{comunidadesInvitadas.length !== 1 ? 'es' : ''} privada{comunidadesInvitadas.length !== 1 ? 's' : ''}
                                </p>
                                <div className="pagina-comunidades-cuadricula">
                                    {comunidadesInvitadas.map(comunidad =>
                                        (
                                            <TarjetaInvitacion
                                                key={comunidad.id}
                                                comunidad={comunidad}
                                                alAceptar={() => aceptar_invitacion(comunidad.id)}
                                                alRechazar={() => rechazar_invitacion(comunidad.id)}
                                            />
                                        )
                                    )}
                                </div>
                            </>
                        )
                    }

                    {!cargando && !error && comunidades_suscritas.length > 0 &&
                        (
                            <>
                                <h2 className="pagina-comunidades-seccion-titulo">Mis comunidades</h2>
                                <div className="pagina-comunidades-cuadricula">
                                    {comunidades_suscritas.map(comunidad =>
                                        (
                                            <TarjetaComunidad key={comunidad.id} comunidad={comunidad} />
                                        )
                                    )}
                                </div>
                            </>
                        )
                    }

                    {!cargando && !error &&
                        (
                            <>
                                <h2 className="pagina-comunidades-seccion-titulo">Explorar comunidades</h2>

                                {comunidades_filtradas.length === 0
                                    ?
                                    (
                                        <div className="pagina-comunidades-estado">
                                            <p className="pagina-inicio-estado-texto">
                                                {busqueda ? `No se encontraron comunidades con "${busqueda}"` : 'No hay más comunidades'}
                                            </p>
                                        </div>
                                    )
                                    :
                                    (
                                        <>
                                            <p className="pagina-comunidades-contador">
                                                {comunidades_para_explorar.length} comunidad{comunidades_para_explorar.length !== 1 ? 'es' : ''}
                                                {busqueda && ` para "${busqueda}"`}
                                            </p>
                                            <div className="pagina-comunidades-cuadricula">
                                                {comunidades_filtradas.map(comunidad =>
                                                    (
                                                        <TarjetaComunidad key={comunidad.id} comunidad={comunidad} />
                                                    )
                                                )}
                                            </div>
                                            {hay_mas &&
                                                (
                                                    <div className="pagina-comunidades-estado">
                                                        <button
                                                            className="btn-primary"
                                                            onClick={() => setVisibles(v => v + 5)}
                                                        >
                                                            Explorar más comunidades
                                                        </button>
                                                    </div>
                                                )
                                            }
                                        </>
                                    )
                                }
                            </>
                        )
                    }
                    {modalAbierto &&
                        (
                            <ModalCrearComunidad
                                alCerrar={() => setModalAbierto(false)}
                                alCrear={al_crear_comunidad}
                            />
                        )
                    }
                </div>
            )
}

function TarjetaComunidad({comunidad})
{
    const {id, nombre, descripcion, total_miembros, icono, es_privada} = comunidad

    const iniciales = nombre ? nombre.slice(0, 2).toUpperCase() : 'C'

    return (
                <Link to={`/c/${id}`} className="tarjeta-comunidad">
                    <div className="tarjeta-comunidad-cabecera">
                        {icono
                            ? <img src={icono} alt={nombre} className="tarjeta-comunidad-icono" />
                            :
                            (
                                <div className="tarjeta-comunidad-icono-placeholder">
                                    {iniciales}
                                </div>
                            )
                        }

                        {es_privada &&
                            (
                                <span className="tarjeta-comunidad-privada">Privada</span>
                            )
                        }
                    </div>

                    <div className="tarjeta-comunidad-cuerpo">
                        <h3 className="tarjeta-comunidad-nombre">c/{nombre}</h3>

                        {descripcion &&
                            (
                                <p className="tarjeta-comunidad-descripcion">{descripcion}</p>
                            )
                        }

                        <p className="tarjeta-comunidad-miembros">
                            {total_miembros?.toLocaleString('es-MX') || 0} miembro{total_miembros !== 1 ? 's' : ''}
                        </p>
                    </div>
                </Link>
          )
}

function TarjetaInvitacion({comunidad, alAceptar, alRechazar})
{
    const {nombre, descripcion, total_miembros, icono} = comunidad

    const iniciales = nombre ? nombre.slice(0, 2).toUpperCase() : 'C'

    return (
                <div className="tarjeta-comunidad tarjeta-invitacion">
                    <div className="tarjeta-comunidad-cabecera">
                        {icono
                            ? <img src={icono} alt={nombre} className="tarjeta-comunidad-icono" />
                            :
                            (
                                <div className="tarjeta-comunidad-icono-placeholder">
                                    {iniciales}
                                </div>
                            )
                        }
                        <span className="tarjeta-comunidad-privada">Privada</span>
                    </div>

                    <div className="tarjeta-comunidad-cuerpo">
                        <h3 className="tarjeta-comunidad-nombre">c/{nombre}</h3>

                        {descripcion &&
                            (
                                <p className="tarjeta-comunidad-descripcion">{descripcion}</p>
                            )
                        }

                        <p className="tarjeta-comunidad-miembros">
                            {total_miembros?.toLocaleString('es-MX') || 0} miembro{total_miembros !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="tarjeta-invitacion-acciones">
                        <button
                            className="tarjeta-invitacion-btn-aceptar"
                            onClick={alAceptar}
                        >
                            Aceptar
                        </button>
                        <button
                            className="tarjeta-invitacion-btn-rechazar"
                            onClick={alRechazar}
                        >
                            Rechazar
                        </button>
                    </div>
                </div>
          )
}