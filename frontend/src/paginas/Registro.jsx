import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

export default function Registro()
{
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [cont, setCont] = useState('')
    const [cont2, setCont2] = useState('')
    const [error, setError] = useState('')
    const navigate  = useNavigate()

    async function handleSubmit(e)
    {
        e.preventDefault()

        setError('')

        if(!nombre || !email || !cont || !cont2)
        {
            setError('Por favor completa todos los campos')
            return
        }

        if(cont.length < 6)
        {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        if(cont !== cont2)
        {
            setError('Las contraseñas no coinciden')
            return
        }

        try
        {
            const res = await fetch('/api/auth/registro', {method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ nombreUsuario: nombre, email, contrasena: cont })})

            if(!res.ok)
            {
                const texto = await res.text()
                console.error('Error del servidor:', texto)

                throw new Error('Error en el servidor revisa la consola del navegador')
            }

            const data = await res.json()
            sessionStorage.setItem('reg_usuario_id', data.id)
            sessionStorage.setItem('reg_nombre_usuario', data.nombreUsuario)

            navigate('/perfil-setup')

        }

        catch (e)
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
                <div className="card">
                    <div className="card-banner"></div>
                    <div className="card-logo-wrapper">
                        <img src="/imagenes/Agora_logo.png" alt="agora Logo" className="card-logo-float" />
                    </div>
                    <h1 className="card-brand">agora</h1>
                    <p className="card-tagline">Crea tu cuenta</p>

                    {error && <div className="error-msg visible">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="nombreUsuario">Nombre de usuario</label>
                            <input type="text" id="nombreUsuario" value={nombre}
                                   onChange={e => setNombre(e.target.value)}
                                   placeholder="usuario123" required minLength={3} maxLength={30} />
                        </div>
                        <div className="field">
                            <label htmlFor="email">Correo electrónico</label>
                            <input type="email" id="email" value={email}
                                   onChange={e => setEmail(e.target.value)}
                                   placeholder="correo@ejemplo.com" required />
                        </div>
                        <div className="field">
                            <label htmlFor="cont">Contraseña</label>
                            <input type="password" id="cont" value={cont}
                                   onChange={e => setCont(e.target.value)}
                                   placeholder="••••••••" required minLength={6} />
                        </div>
                        <div className="field">
                            <label htmlFor="cont2">Confirmar contraseña</label>
                            <input type="password" id="cont2" value={cont2}
                                   onChange={e => setCont2(e.target.value)}
                                   placeholder="••••••••" required minLength={6} />
                        </div>
                        <button className="btn-primary" type="submit">Continuar →</button>
                    </form>

                    <p style={{textAlign:'center', marginTop:'20px'}}>
                        ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
                    </p>
                </div>
            </main>
        </>
    )
}