import {createContext, useContext, useState, useEffect, useCallback} from 'react'

const ContextoUsuario = createContext(null)

//react solo permite camel case para componentes :(
export function VerificaAutenticacion({ children })
{
    //undefined = cargando
    //null = no autenticado
    //objeto = autenticado
    const [usuario, setUsuario] = useState(undefined)
    const [cargando, setCargando] = useState(true)

    const verifica_sesion = useCallback(async () =>
    {
        try
        {
            const resp = await fetch('/api/auth/yo', {credentials: 'include'})

            if (resp.ok)
            {
                const datos = await resp.json()
                setUsuario(datos)
            }

            else
            {
                setUsuario(null)
            }
        }
        catch
        {
            setUsuario(null)
        }

        finally
        {
            setCargando(false)
        }
    }, [])

    useEffect(() => {verifica_sesion()}, [verifica_sesion])

    const login = (datosUsuario) =>
    {
        setUsuario(datosUsuario)
    }

    const logout = async () =>
    {
        try
        {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        }

        catch
        {

        }

        finally
        {
            setUsuario(null)
        }
    }

    return (<ContextoUsuario.Provider value={{ usuario, cargando, login, logout, verifica_sesion: verifica_sesion}}>{children}</ContextoUsuario.Provider>)
}

export function useAutentifica()
{
    const contexto = useContext(ContextoUsuario)

    if(!contexto)
        throw new Error('useAutentifica debe usarse dentro de <VerificaAutenticacion>')

    return contexto
}