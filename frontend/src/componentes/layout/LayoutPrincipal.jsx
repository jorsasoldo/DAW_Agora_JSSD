import BarraBusqueda from './BarraBusqueda.jsx'

export default function LayoutPrincipal({ children, sidebar = null })
{
    return (<><BarraBusqueda /><div className="layout-contenedor"><main className={`layout-main ${sidebar ? 'layout-main--con-sidebar' : 'layout-main--completo'}`}>{children}</main>{sidebar && (<aside className="layout-sidebar">{sidebar}</aside>)}</div></>)
}