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

    //Hace un focus al abrir y bloqueo del scroll
    useEffect(() =>
    {
        Ref.current?.focus()

        document.body.style.overflow = 'hidden'

        return () => {document.body.style.overflow = ''}
    }, [])

    //Cierre con escape
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

    async function maneja_envio(e)
    {
        e.preventDefault()

        if(!nombre_valido)
            return

        setEnviando(true)

        setError(null)

        try
        {
            const resp = await fetch('/api/comunidades', {method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({nombre: nombre.trim(), descripcion: descripcion.trim(), es_privada: esPrivada})})

            const datos = await resp.json()

            if(!resp.ok)
            {
                setError(datos.error || 'No se pudo crear la comunidad')
                return
            }

            //Si la api devuelve el id se navega directo a la comunidad
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

    return (
        <div className="modal-overlay" onClick={e => {if (e.target === e.currentTarget) alCerrar()}}>
            <div className="modal-contenedor" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">

                <div className="modal-cabecera">
                    <h2 className="modal-titulo" id="modal-titulo">Crear comunidad</h2>
                    <button className="modal-btn-cerrar" onClick={alCerrar} aria-label="Cerrar">✕</button>
                </div>

                <form onSubmit={maneja_envio} className="modal-formulario">
                    {
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
                    }
                    {error &&
                        (
                            <div className="modal-error">
                                {error}
                            </div>
                        )
                    }
                    {
                    }
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