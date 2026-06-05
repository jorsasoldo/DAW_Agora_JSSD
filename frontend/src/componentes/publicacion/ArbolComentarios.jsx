import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'

import {useAutentifica} from '../../contexto/ContextoUsuario.jsx'

import ComponenteVotos from './ComponenteVotos.jsx'

import {FormularioComentario} from '../../paginas/PaginaPublicacion.jsx'

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
    const dif_hr  = Math.floor(dif_min / 60)
    const dif_dia = Math.floor(dif_hr  / 24)

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

function NodoComentario({ comentario, mapa_hijos, publicacion_id, al_comentar, profundidad = 0 })
{
    const {usuario} = useAutentifica()
    const [respondiendo, setRespondiendo] = useState(false)
    const [colapsar, setColapsar] = useState(false)
    const [puntajeLocal, setPuntajeLocal] = useState(comentario.puntaje_votos ?? 0)
    const [nombreAutor, setNombreAutor] = useState(comentario.autor || '')
    const [respuestasLocales, setRespuestasLocales] = useState([])

    useEffect(() =>
    {
        if(!comentario.autor)
            return

        fetch(`/api/usuarios/${comentario.autor}`, {credentials: 'include'}).then(r => r.ok ? r.json() : null).then(datos => { if(datos?.nombre_usuario) setNombreAutor(datos.nombre_usuario) }).catch(() => {})}, [comentario.autor])

    function responde_nuevo(nuevo_comentario)
    {
        setRespuestasLocales(prev => [...prev, nuevo_comentario])
        setRespondiendo(false)

        if(al_comentar)
            al_comentar(nuevo_comentario)
    }

    //Limite visual de 6 por si acaso no se salga
    const indentacion = profundidad < 6

    const hijos_del_mapa = mapa_hijos[comentario.id] || []

    const todos_los_hijos = [...hijos_del_mapa, ...respuestasLocales.filter(r => !hijos_del_mapa.find(h => h.id === r.id))]

    return (
        <div className={`nodo-comentario ${profundidad > 0 ? 'nodo-comentario--anidado' : ''}`}>
            {
                //Hilo
            }
            {indentacion && profundidad > 0 &&
                (
                    <button
                        className="nodo-comentario-hilo"
                        onClick={() => setColapsar(!colapsar)}
                        aria-label={colapsar ? 'Expandir hilo' : 'Colapsar hilo'}
                        title={colapsar ? 'Expandir' : 'Colapsar'}
                    />
                )
            }

            <div className={`nodo-comentario-contenido ${colapsar ? 'nodo-comentario-contenido--colapsado' : ''}`}>
                {
                }
                <div className="nodo-comentario-cabecera">
                    <Link to={`/u/${nombreAutor}`} className="nodo-comentario-autor">u/{nombreAutor}</Link>
                    <span className="tarjeta-publicacion-separador">·</span>
                    <span className="tarjeta-publicacion-tiempo">{tiempo_relativo(comentario.creado_en)}</span>
                    {colapsar &&
                        (
                            <button className="nodo-comentario-btn-expandir" onClick={() => setColapsar(false)}>
                                Ver comentario
                            </button>
                        )
                    }
                </div>

                {!colapsar &&
                    (
                        <>
                            <div className="nodo-comentario-texto">
                                {comentario.contenido?.split('\n').map((linea, i) => linea.trim() ? <p key={i}>{linea}</p> : <br key={i} />)}
                            </div>

                            <div className="nodo-comentario-pie">
                                <ComponenteVotos
                                    objetivo_id={comentario.id}
                                    tipo_objetivo="comentario"
                                    puntaje_inicial={puntajeLocal}
                                    orientacion="horizontal"
                                    al_votar={setPuntajeLocal}
                                />
                                {usuario &&
                                    (
                                        <button
                                            className="nodo-comentario-btn-responder"
                                            onClick={() => setRespondiendo(!respondiendo)}
                                        >
                                            {respondiendo ? 'Cancelar' : 'Responder'}
                                        </button>
                                    )
                                }
                            </div>

                            {respondiendo && usuario &&
                                (
                                    <FormularioComentario
                                        publicacion_id={publicacion_id}
                                        padre_id={comentario.id}
                                        al_enviar={responde_nuevo}
                                        al_cancelar={() => setRespondiendo(false)}
                                        placeholder={`Respondiendo a u/${nombreAutor}...`}
                                    />
                                )
                            }

                            {
                                //hijos del arbol recursibvos
                            }

                            {todos_los_hijos.length > 0 &&
                                (
                                    <div className="nodo-comentario-hijos">
                                        {todos_los_hijos.map(hijo => (<NodoComentario key={hijo.id} comentario={hijo} mapa_hijos={mapa_hijos} publicacion_id={publicacion_id} al_comentar={al_comentar} profundidad={profundidad + 1}/>))}
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </div>
        </div>
    )
}

export default function ArbolComentarios({ comentarios, publicacion_id, al_comentar })
{
    const mapa_hijos = {}

    const raices = []

    comentarios.forEach(c => {mapa_hijos[c.id] = mapa_hijos[c.id] || []})

    comentarios.forEach(c =>
    {
        if(c.padre_id)
        {
            if(!mapa_hijos[c.padre_id])
                mapa_hijos[c.padre_id] = []

            mapa_hijos[c.padre_id].push(c)
        }

        else
        {
            raices.push(c)
        }
    })

    if(raices.length === 0)
        return null

    return (
                <div className="arbol-comentarios">
                    {raices.map(comentario => (<NodoComentario key={comentario.id} comentario={comentario} mapa_hijos={mapa_hijos} publicacion_id={publicacion_id} al_comentar={al_comentar} profundidad={0}/>))}
                </div>
            )
}