import {useState, useRef} from 'react'

import {useNavigate} from 'react-router-dom'

export default function PerfilSetup()
{
    const [biografia, setBiografia]  = useState('')
    const [visualizacion, setVisualizacion] = useState('/imagenes/no_foto.png')
    const [foto, setFoto] = useState(null)
    const [hover, setHover] = useState(false)
    const [error, setError] = useState('')
    const ref = useRef(null)
    const navigate= useNavigate()

    function previsualiza_foto(e)
    {
        const archivo = e.target.files[0]

        if(!archivo)
            return

        if(archivo.size > 5 * 1024 * 1024)
        {
            setError('La imagen no debe superar los 5 MB')
            e.target.value = ''

            return
        }

        setError('')

        const lector = new FileReader()

        lector.onload = ev =>
        {
            setVisualizacion(ev.target.result)
            setFoto(ev.target.result)
        }

        lector.readAsDataURL(archivo)
    }

    async function maneja_registro(e)
    {
        e.preventDefault()

        const omitir = e.nativeEvent.submitter?.name === 'omitir'
        const usuario_id = sessionStorage.getItem('reg_usuario_id')

        if(!usuario_id)
        {
            navigate('/registro')
            return
        }

        if(omitir)
        {
            sessionStorage.removeItem('reg_usuario_id')
            sessionStorage.removeItem('reg_nombre_usuario')

            navigate('/')

            return
        }

        const body = {biografia: biografia}

        if(foto)
            body.foto_perfil = foto

        try
        {
            const resp = await fetch(`/api/usuarios/${usuario_id}`, {method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body)})

            if(!resp.ok)
            {
                const dato = await resp.json()

                throw new Error(dato.error || 'Error al guardar el perfil')
            }

            sessionStorage.removeItem('reg_usuario_id')
            sessionStorage.removeItem('reg_nombre_usuario')

            navigate('/login')

        }

        catch(e)
        {
            setError(e.message)
        }
    }

    return (
        <>
            <nav>
                <a className="nav-logo" href="/login">
                    <img src="/imagenes/Agora_letra.png" alt="agora" className="nav-letra" />
                </a>
            </nav>
            <main>
                <div className="card card-perfil">
                    <div className="card-banner"></div>
                    <div className="card-logo-wrapper">
                        <img src="/imagenes/Agora_logo.png" alt="agora Logo" className="card-logo-float" />
                    </div>
                    <h1 className="card-brand">agora</h1>
                    <p className="card-tagline" style={{marginBottom:'25px'}}>Personaliza tu perfil</p>

                    {error && <div className="error-msg visible">{error}</div>}

                    <form onSubmit={maneja_registro}>
                        <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'20px', gap:'8px'}}>
                            <div
                                onClick={() => ref.current.click()}
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                                style={{position:'relative', width:'110px', height:'110px', cursor:'pointer'}}
                            >
                                <img
                                    src={visualizacion}
                                    alt="Vista previa"
                                    style={{width:'110px', height:'110px', borderRadius:'50%', objectFit:'cover', border:'3px solid #dde3f0'}}
                                />
                                {hover && (
                                    <div style={{position:'absolute', inset:0, borderRadius:'50%', background:'rgba(42,112,236,0.55)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        <img
                                            src="/imagenes/camara.png"
                                            alt="Cambiar foto"
                                            style={{width:'32px', height:'32px', objectFit:'contain', filter:'brightness(0) invert(1)'}}
                                        />
                                    </div>
                                )}
                            </div>
                            <p style={{fontSize:'10px', color:'#878a8c'}}>Haz clic en la imagen para cambiar tu foto de perfil</p>
                            <input
                                ref={ref}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                style={{display:'none'}}
                                onChange={previsualiza_foto}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="biografia">Biografía</label>
                            <textarea
                                id="biografia"
                                value={biografia}
                                onChange={e => setBiografia(e.target.value)}
                                placeholder="Cuéntanos un poco sobre ti"
                                maxLength={300}
                                style={{width:'100%', minHeight:'140px', boxSizing:'border-box'}}
                            />
                            <div className={`char-counter${biografia.length >= 280 ? ' over' : ''}`}>
                                {biografia.length} / 300
                            </div>
                        </div>

                        <button className="btn-primary" type="submit">Completar registro</button>

                        <p style={{textAlign:'center', marginTop:'16px'}}>
                            <button type="submit" name="omitir" value="true"
                                    style={{background:'none', border:'none', padding:0, color:'#2a70ec', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>
                                Omitir por ahora
                            </button>
                        </p>
                    </form>
                </div>
            </main>
        </>
    )
}