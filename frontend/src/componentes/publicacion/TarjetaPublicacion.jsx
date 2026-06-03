import {useState} from 'react'

import {Link} from 'react-router-dom'

import ComponenteVotos from './ComponenteVotos.jsx'

//Formatea la fecha/hora de cada publicacion
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

//Etiquetas de cada tipo de publicacion
const etiquetas_tipo = {texto: 'Texto', enlace: 'Enlace', imagen: 'Imagen'}

export default function TarjetaPublicacion({ publicacion, nombresComunidades = {}, nombresAutores = {} })
{
    const {id, titulo = '', tipo = '', contenido = '', enlace = '', url_imagen = '', autor = '', comunidad = '', puntaje_votos = 0, total_comentarios = 0, etiqueta = '', fijada = false, creado_en,} = publicacion

    //Estado local del puntaje para que el componente de votos pueda actualizarlo
    const [puntaje_local, setPuntajeLocal] = useState(puntaje_votos)

    const nombre_comunidad = nombresComunidades[comunidad] || comunidad

    const nombre_autor = nombresAutores[autor] || autor

    return (
        <article className="tarjeta-publicacion">

            {
                //Columna de votos
            }
            <ComponenteVotos
                objetivo_id={id}
                tipo_objetivo="publicacion"
                puntaje_inicial={puntaje_local}
                orientacion="vertical"
                al_votar={setPuntajeLocal}
            />

            {
                //Miniatura de imagen
            }
            {tipo === 'imagen' && url_imagen &&
                (
                    <Link to={`/p/${id}`} className="tarjeta-publicacion-miniatura">
                        <img src={url_imagen} alt={titulo} className="tarjeta-publicacion-miniatura-img" />
                    </Link>
                )
            }

            {
                //Cuerpo principal
            }
            <div className="tarjeta-publicacion-cuerpo">

                {
                    //metadatos como la comunidad, autor y tiempo
                }
                <div className="tarjeta-publicacion-meta">
                    {nombre_comunidad &&
                        (
                            <>
                                <Link to={`/c/${comunidad}`} className="tarjeta-publicacion-comunidad">
                                    c/{nombre_comunidad}
                                </Link>
                                <span className="tarjeta-publicacion-separador">·</span>
                            </>
                        )
                    }
                    <span className="tarjeta-publicacion-autor">
                        u/{nombre_autor}
                    </span>
                    {creado_en &&
                        (
                            <>
                                <span className="tarjeta-publicacion-separador">·</span>
                                <span className="tarjeta-publicacion-tiempo">{tiempo_relativo(creado_en)}</span>
                            </>
                        )
                    }
                    {fijada &&
                        (
                            <span className="tarjeta-publicacion-fijada">Fijada</span>
                        )
                    }
                </div>

                {
                    //Titulo
                }
                <Link to={`/p/${id}`} className="tarjeta-publicacion-titulo">
                    {titulo}
                </Link>

                {
                    //Etiquetas
                }
                <div className="tarjeta-publicacion-etiquetas">
                    {tipo &&
                        (
                            <span className={`tarjeta-publicacion-etiqueta-tipo tarjeta-publicacion-etiqueta-tipo--${tipo}`}>
                                {etiquetas_tipo[tipo] || tipo}
                            </span>
                        )
                    }
                    {etiqueta &&
                        (
                            <span className="tarjeta-publicacion-etiqueta-custom">{etiqueta}</span>
                        )
                    }
                </div>

                {
                    //Vista previa del texto
                }
                {tipo === 'texto' && contenido &&
                    (
                        <p className="tarjeta-publicacion-preview">{contenido}</p>
                    )
                }

                {
                    //Enlace
                }
                {tipo === 'enlace' && enlace &&
                    (
                        <a
                            href={enlace}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tarjeta-publicacion-enlace"
                        >
                            {enlace}
                        </a>
                    )
                }

                {
                    //Boton de comentarios
                }
                <div className="tarjeta-publicacion-pie">
                    <Link to={`/p/${id}`} className="tarjeta-publicacion-btn-comentarios">
                        <img src="/imagenes/Comentario.png" alt="Comentarios" width="15" height="15" />
                        {total_comentarios} comentario{total_comentarios !== 1 ? 's' : ''}
                    </Link>

                    <Link to={`/p/${id}`} className="tarjeta-publicacion-btn-ver">
                        Ver publicación
                    </Link>
                </div>
            </div>
        </article>
    )
}