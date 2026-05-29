import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

export default function Login()
{
    const [email, setEmail] = useState('')
    const [contrasena, setContrasena] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(e)
    {
        e.preventDefault()

        setError('')

        if(!email || !contrasena)
        {
            setError('Por favor completa todos los campos')
            return
        }

        try
        {
            const resp = await fetch('/api/auth/login', {method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, contrasena })})

            if(!resp.ok)
            {
                const dato = await resp.json()

                throw new Error(dato.error || 'Error al iniciar sesion')
            }

            const datos = await resp.json()

            sessionStorage.setItem('usuario_id', datos.id)
            sessionStorage.setItem('nombre_usuario', datos.nombreUsuario)

            navigate('/')

        }

        catch(e)
        {
            setError(e.message)
        }
    }

    return(
        <>
            <nav>
                <a className="nav-logo" href="#">
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
                    <p className="card-tagline">Bienvenido de vuelta</p>

                    {error && <div className="error-msg visible">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="email">Correo electrónico</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder=""
                                required
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="contrasena">Contraseña</label>
                            <input
                                type="password"
                                id="contrasena"
                                value={contrasena}
                                onChange={e => setContrasena(e.target.value)}
                                placeholder=""
                                required
                            />
                        </div>
                        <button className="btn-primary" type="submit">Iniciar sesión</button>
                    </form>

                    <p style={{textAlign:'center', marginTop:'20px'}}>
                        ¿No tienes cuenta? <a href="/registro">Regístrate</a>
                    </p>
                </div>
            </main>
        </>
    )
}