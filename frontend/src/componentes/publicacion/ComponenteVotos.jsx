import {useState, useEffect, useCallback} from 'react'

import {useAutentifica} from '../../contexto/ContextoUsuario.jsx'

//Formatea el puntaje de votos por ejemplo comvirtiendo 1334 a 1.3k
function formatea_puntaje(n)
{
    if (n >= 1000)
        return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'

    if (n <= -1000)
        return '-' + (Math.abs(n) / 1000).toFixed(1).replace(/\.0$/, '') + 'k'

    return String(n)
}

export default function ComponenteVotos({objetivo_id, tipo_objetivo = 'publicacion', puntaje_inicial = 0, orientacion = 'vertical', al_votar})
{
    const {usuario} = useAutentifica()

    const [puntaje, setPuntaje] = useState(puntaje_inicial)
    const [voto_actual, setVotoActual] = useState(0)
    const [cargando, setCargando] = useState(false)
    const [cargando_inicial, setCargandoInicial] = useState(true)

    //Sincroniza puntaje si el padre lo actualiza
    useEffect(() =>
    {
        setPuntaje(puntaje_inicial)
    }, [puntaje_inicial])

    //Carga el voto existente del usuario
    const carga_voto_actual = useCallback(async () =>
    {
        if(!usuario || !objetivo_id)
        {
            setCargandoInicial(false)
            return
        }

        try
        {
            const resp = await fetch(`/api/votos?objetivo=${objetivo_id}`, {credentials: 'include'})

            if(resp.ok)
            {
                const datos = await resp.json()

                setVotoActual(datos.valor ?? 0)
            }
        }

        catch
        {
        }

        finally
        {
            setCargandoInicial(false)
        }
    }, [usuario, objetivo_id])

    useEffect(() =>
    {
        carga_voto_actual()

    }, [carga_voto_actual])

    //Si se envia el mismo valor que tenia se retira el voto
    async function maneja_voto(valor_nuevo)
    {
        if(!usuario || cargando || cargando_inicial)
            return;

        const valor_a_enviar = (voto_actual === valor_nuevo) ? 0 : valor_nuevo

        const delta = valor_a_enviar - voto_actual
        const nuevo_puntaje = puntaje + delta

        const voto_previo = voto_actual
        const puntaje_previo = puntaje

        setVotoActual(valor_a_enviar)

        setPuntaje(nuevo_puntaje)

        if(al_votar)
            al_votar(nuevo_puntaje)

        setCargando(true)

        try
        {
            const resp = await fetch('/api/votos', {method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({objetivo_id, tipo_objetivo, valor: valor_a_enviar})})

            if(!resp.ok)
            {
                //Se revieerte si el servidor lo rechaza
                setVotoActual(voto_previo)
                setPuntaje(puntaje_previo)

                if(al_votar)
                    al_votar(puntaje_previo)
            }
        }

        catch
        {
            setVotoActual(voto_previo)

            setPuntaje(puntaje_previo)

            if(al_votar)
                al_votar(puntaje_previo)
        }

        finally
        {
            setCargando(false)
        }
    }

    const clase_contenedor = orientacion === 'horizontal' ? 'sistema-votos sistema-votos--horizontal' : 'sistema-votos sistema-votos--vertical'

    const deshabilitado = cargando || cargando_inicial || !usuario

    return (
        <div className={clase_contenedor}>
            {
                //Boton del voto positivo
            }
            <button
                className={`sistema-votos-btn sistema-votos-btn--arriba ${voto_actual === 1 ? 'sistema-votos-btn--activo-arriba' : ''}`}
                onClick={() => maneja_voto(1)}
                disabled={deshabilitado}
                aria-label="Voto positivo"
                title={!usuario ? 'Inicia sesión para votar' : 'Votar a favor'}
            >
                <img
                    src={voto_actual === 1 ? '/imagenes/voto_positivo_lleno.png' : '/imagenes/voto_positivo_vacio.png'}
                    alt="Voto positivo"
                    width="16"
                    height="16"
                    style={{display: 'block'}}
                />
            </button>

            {
                //Muestra el puntaje
            }
            <span
                className={
                    `sistema-votos-puntaje ` +
                    (puntaje > 0 ? 'sistema-votos-puntaje--positivo' : '') +
                    (puntaje < 0 ? 'sistema-votos-puntaje--negativo' : '')
                }
            >
                {formatea_puntaje(puntaje)}
            </span>

            {
                //Boton de voto negativo
            }
            <button
                className={`sistema-votos-btn sistema-votos-btn--abajo ${voto_actual === -1 ? 'sistema-votos-btn--activo-abajo' : ''}`}
                onClick={() => maneja_voto(-1)}
                disabled={deshabilitado}
                aria-label="Voto negativo"
                title={!usuario ? 'Inicia sesión para votar' : 'Votar en contra'}
            >
                <img
                    src={voto_actual === -1 ? '/imagenes/voto_negativo_lleno.png' : '/imagenes/voto_negativo_vacio.png'}
                    alt="Voto negativo"
                    width="16"
                    height="16"
                    style={{display: 'block'}}
                />
            </button>
        </div>
    )
}