import {useState, useEffect, useCallback} from 'react'

import {Link} from 'react-router-dom'

import TarjetaPublicacion from '../componentes/publicacion/TarjetaPublicacion.jsx'

const opciones_orden = [{valor: 'nuevo', etiqueta: 'Nuevo'}, {valor: 'popular', etiqueta: 'Popular'},]

export default function Inicio()
{
    const [publicaciones, setPublicaciones] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [orden, setOrden] = useState('nuevo')
    const [nombresComunidades, setNombresComunidades] = useState({})
    const [nombresAutores, setNombresAutores] = useState({})

    //Carga el feed principal
    const carga_feed = useCallback(async () =>
    {
        setCargando(true)
        setError(null)

        try
        {
            const resp = await fetch('/api/publicaciones', {credentials: 'include'})

            if(!resp.ok)
                throw new Error(`Error ${resp.status} al cargar el feed`)

            let datos = await resp.json()

            //Ordena en segun la seleccion
            if(orden === 'popular')
                datos = [...datos].sort((a, b) => b.puntaje_votos - a.puntaje_votos)

            //Las publicaciones fijadas van siempre primero
            datos = [...datos.filter(p => p.fijada), ...datos.filter(p => !p.fijada)]

            setPublicaciones(datos)

            //Resuelve nombres de comunidades y autores
            await resuelve_metadatos(datos)
        }

        catch (e)
        {
            setError(e.message)
        }

        finally
        {
            setCargando(false)
        }
    }, [orden])

    //Obtiene el nombre del usuario e id de autor/comunidad
    async function resuelve_metadatos(lista)
    {
        const id_comunidad = [...new Set(lista.map(p => p.comunidad).filter(Boolean))]

        const id_autor = [...new Set(lista.map(p => p.autor).filter(Boolean))]

        //Comunidades
        const mapa_comunidades = {}

        await Promise.all
        (
            id_comunidad.map(async id =>
            {
                try
                {
                    const resp = await fetch(`/api/comunidades/${id}`, {credentials: 'include'})

                    if(resp.ok)
                    {
                        const comunidades = await resp.json()

                        mapa_comunidades[id] = comunidades.nombre || id
                    }
                }

                catch
                {

                }
            })
        )
        setNombresComunidades(mapa_comunidades)

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
                        const autores = await resp.json()

                        mapa_autores[id] = autores.nombre_usuario || id
                    }
                }

                catch
                {

                }
            })
        )
        setNombresAutores(mapa_autores)
    }

    useEffect(() => {carga_feed() }, [carga_feed])

    return (
        <div className="pagina-inicio">
            {}
            <div className="pagina-inicio-encabezado">
                <h1 className="pagina-inicio-titulo">Feed principal</h1>

                <div className="pagina-inicio-controles">
                    <span className="pagina-inicio-controles-label">Ordenar:</span>
                    {opciones_orden.map(op => (
                        <button
                            key={op.valor}
                            className={`pagina-inicio-btn-orden ${orden === op.valor ? 'pagina-inicio-btn-orden--activo' : ''}`}
                            onClick={() => setOrden(op.valor)}
                        >
                            {op.etiqueta}
                        </button>
                    ))}
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
            {cargando && (
                <div className="pagina-inicio-estado">
                    <div className="pagina-inicio-spinner" />
                    <p className="pagina-inicio-estado-texto">Cargando publicaciones</p>
                </div>
            )}

            {!cargando && error && (
                <div className="pagina-inicio-estado">
                    <p className="pagina-inicio-error">{error}</p>
                    <button className="btn-primary pagina-inicio-btn-reintentar" onClick={carga_feed}>
                        Reintentar
                    </button>
                </div>
            )}

            {!cargando && !error && publicaciones.length === 0 && (
                <div className="pagina-inicio-estado">
                    <p className="pagina-inicio-estado-texto">No hay publicaciones todavía.</p>
                    <Link to="/publicar" className="btn-primary pagina-inicio-btn-crear">
                        Crear la primera publicación
                    </Link>
                </div>
            )}

            {}
            {!cargando && !error && publicaciones.length > 0 && (
                <div className="pagina-inicio-lista">
                    {publicaciones.map(pub => (
                        <TarjetaPublicacion
                            key={pub.id}
                            publicacion={pub}
                            nombresComunidades={nombresComunidades}
                            nombresAutores={nombresAutores}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}