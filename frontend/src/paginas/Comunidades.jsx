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
                    setIdsSuscritas(datos.comunidades_suscritas || [])
                }
            }

            catch
            {
            }
        }

        carga_suscritas()
    }, [usuario])

    const comunidades_suscritas = comunidades.filter(c => idsSuscritas.includes(c.id))
    const comunidades_para_explorar = comunidades.filter(c => !idsSuscritas.includes(c.id)).filter(c => c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())).sort((a, b) => (b.total_miembros || 0) - (a.total_miembros || 0))
    const comunidades_filtradas = comunidades_para_explorar.slice(0, visibles)
    const hay_mas = visibles < comunidades_para_explorar.length

    function al_crear_comunidad()
    {
        setModalAbierto(false)

        carga_comunidades()
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

            {}
            <div className="pagina-comunidades-buscador-contenedor">
                <input
                    type="text"
                    className="pagina-comunidades-buscador"
                    placeholder="Buscar una comunidad..."
                    value={busqueda}
                    onChange={e => {setBusqueda(e.target.value); setVisibles(5)}}
                />
            </div>

            {}
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
            {
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