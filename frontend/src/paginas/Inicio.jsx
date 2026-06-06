import {useState, useEffect, useCallback, useRef} from 'react'

import {Link} from 'react-router-dom'

import TarjetaPublicacion from '../componentes/publicacion/TarjetaPublicacion.jsx'

const opciones_orden = [{valor: 'nuevo', etiqueta: 'Nuevo'}, {valor: 'popular', etiqueta: 'Popular'}]

const limite = 20

export default function Inicio()
{
    const [publicaciones, setPublicaciones] = useState([])
    const [cargando, setCargando] = useState(true)
    const [cargandoMas, setCargandoMas] = useState(false)
    const [error, setError] = useState(null)
    const [orden, setOrden] = useState('nuevo')
    const [pagina, setPagina] = useState(0)
    const [hayMas, setHayMas] = useState(false)
    const [nombresComunidades, setNombresComunidades] = useState({})
    const [nombresAutores, setNombresAutores] = useState({})

    //Carga el feed principal
    const carga_pagina = useCallback(async (num_pagina, orden_actual, acumular) =>
    {
        if (num_pagina === 0)
            setCargando(true)
        else
            setCargandoMas(true)

        setError(null)

        try
        {
            const resp = await fetch(`/api/publicaciones?pagina=${num_pagina}&limite=${limite}&orden=${orden_actual}`, {credentials: 'include'})

            if (!resp.ok)
                throw new Error(`Error ${resp.status} al cargar el feed`)

            const datos = await resp.json()

            const lista = Array.isArray(datos) ? datos : (datos.publicaciones || [])
            const mas = Array.isArray(datos) ? false : (datos.hay_mas ?? false)

            setPublicaciones(prev => acumular ? [...prev, ...lista] : lista)
            setHayMas(mas)

            //Resuelve nombres de comunidades y autores
            await resuelve_metadatos(lista)
        }

        catch(e)
        {
            setError(e.message)
        }

        finally
        {
            setCargando(false)
            setCargandoMas(false)
        }
    }, [])

    useEffect(() =>
    {
        setPagina(0)
        setPublicaciones([])
        carga_pagina(0, orden, false)
    }, [orden, carga_pagina])

    function cargar_mas()
    {
        const siguiente = pagina + 1
        setPagina(siguiente)
        carga_pagina(siguiente, orden, true)
    }

    //Obtiene el nombre del usuario e id de autor/comunidad
    async function resuelve_metadatos(lista)
    {
        const id_comunidad= [...new Set(lista.map(p => p.comunidad).filter(Boolean))]
        const id_autor = [...new Set(lista.map(p => p.autor).filter(Boolean))]

        //Comunidades
        const mapa_comunidades = {}

        await Promise.all(
            id_comunidad.map(async id =>
            {
                try
                {
                    const resp = await fetch(`/api/comunidades/${id}`, {credentials: 'include'})

                    if (resp.ok)
                    {
                        const c = await resp.json()

                        mapa_comunidades[id] = c.nombre || id
                    }
                }
                catch
                {
                }
            })
        )
        setNombresComunidades(prev => ({...prev, ...mapa_comunidades}))

        //Autores
        const mapa_autores = {}

        await Promise.all(
            id_autor.map(async id =>
            {
                try
                {
                    const resp = await fetch(`/api/usuarios/${id}`, {credentials: 'include'})

                    if (resp.ok)
                    {
                        const u = await resp.json()

                        mapa_autores[id] = u.nombre_usuario || id
                    }
                }
                catch
                {
                }
            })
        )
        setNombresAutores(prev => ({...prev, ...mapa_autores}))
    }

    return (
                <div className="pagina-inicio">
                    <div className="pagina-inicio-encabezado">
                        <h1 className="pagina-inicio-titulo">Feed principal</h1>

                        <div className="pagina-inicio-controles">
                            <span className="pagina-inicio-controles-label">Ordenar:</span>
                            {opciones_orden.map(op =>
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
                            {
                                //Boton crear publiacion
                            }
                            <Link to="/publicar" className="pagina-inicio-btn-nueva-publicacion">
                                Crear publicación
                            </Link>
                        </div>
                    </div>
                    {
                        //Estados de carga, error o vacio
                    }
                    {cargando &&
                        (
                            <div className="pagina-inicio-estado">
                                <div className="pagina-inicio-spinner" />
                                <p className="pagina-inicio-estado-texto">Cargando publicaciones</p>
                            </div>
                        )
                    }

                    {!cargando && error &&
                        (
                            <div className="pagina-inicio-estado">
                                <p className="pagina-inicio-error">{error}</p>
                                <button className="btn-primary pagina-inicio-btn-reintentar" onClick={() => carga_pagina(0, orden, false)}>
                                    Reintentar
                                </button>
                            </div>
                        )
                    }

                    {!cargando && !error && publicaciones.length === 0 &&
                        (
                            <div className="pagina-inicio-estado">
                                <p className="pagina-inicio-estado-texto">No hay publicaciones todavía</p>
                                <Link to="/publicar" className="btn-primary pagina-inicio-btn-crear">
                                    Crear la primera publicación
                                </Link>
                            </div>
                        )
                    }

                    {!cargando && !error && publicaciones.length > 0 &&
                        (
                        <>
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

                            {hayMas &&
                                (
                                    <div className="pagina-inicio-estado">
                                        <button
                                            className="btn-primary"
                                            onClick={cargar_mas}
                                            disabled={cargandoMas}
                                        >
                                            {cargandoMas
                                                ? <><span className="pagina-inicio-spinner pagina-inicio-spinner--pequeno" /> Cargando...</>
                                                : 'Cargar más publicaciones'
                                            }
                                        </button>
                                    </div>
                                )
                            }

                            {!hayMas && publicaciones.length >= limite &&
                                (
                                    <div className="pagina-inicio-estado">
                                        <p className="pagina-inicio-estado-texto pagina-inicio-estado-texto--fin">
                                            Has visto todas las publicaciones
                                        </p>
                                    </div>
                                )
                            }
                        </>
                    )}
                </div>
            )
}