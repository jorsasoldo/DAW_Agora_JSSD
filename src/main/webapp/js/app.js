//login
function validar(event)
{
    event.preventDefault();

    let email = document.getElementById('email').value.trim();
    let cont = document.getElementById('contrasena').value.trim();
    let err = document.getElementById('errorMsg');

    if(!email || !cont)
    {
        err.textContent = 'Por favor completa todos los campos.';
        err.classList.add('visible');
        return false;
    }

    err.classList.remove('visible');

    fetch('/api/auth/login', {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, contrasena: cont })}).then(function(res)
        {
            if(!res.ok)
                return res.json().then(function(d){throw new Error(d.error || 'Error al iniciar sesión');});

            return res.json();
        })
        .then(function(data)
        {
            //Guarda datos basicos para perfil-setup
            sessionStorage.setItem('usuario_id', data.id);
            sessionStorage.setItem('nombre_usuario', data.nombreUsuario);
            window.location.href = '/';
        })
        .catch(function(e)
        {
            err.textContent = e.message;
            err.classList.add('visible');
        });

    return false;
}


//registro pagina 1
function validarRegistro(event)
{
    event.preventDefault();

    let nombre = document.getElementById('nombreUsuario').value.trim();
    let email = document.getElementById('email').value.trim();
    let cont = document.getElementById('contrasena').value;
    let cont2 = document.getElementById('contrasena2').value;
    let err = document.getElementById('errorMsg');

    if(!nombre || !email || !cont || !cont2)
    {
        err.textContent = 'Por favor completa todos los campos';
        err.classList.add('visible');
        return false;
    }

    if(cont.length < 6)
    {
        err.textContent = 'La contraseña debe tener al menos 6 caracteres';
        err.classList.add('visible');
        return false;
    }

    if(cont !== cont2)
    {
        err.textContent = 'Las contraseñas no coinciden';
        err.classList.add('visible');
        return false;
    }

    err.classList.remove('visible');

    fetch('/api/auth/registro', {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombreUsuario: nombre, email: email, contrasena: cont })})
        .then(function(res)
        {
            if(!res.ok)
            {
                return res.text().then(function(textoError)
                {
                    console.error("Error del servidor:", textoError);
                    throw new Error('Error en el servidor, revisa la consola del navegador');
                });
            }

            return res.json();
        })
        .then(function(data)
        {
            sessionStorage.setItem('reg_usuario_id', data.id);
            sessionStorage.setItem('reg_nombre_usuario', data.nombreUsuario);
            window.location.href = '/perfil-setup';
        })
        .catch(function(e)
        {
            err.textContent = e.message;
            err.classList.add('visible');
        });

    return false;
}

//registro pagina 2
function previsualizarFoto(foto)
{
    let archivo = foto.target.files[0];

    if(!archivo)
        return;

    if(archivo.size > 5 * 1024 * 1024)
    {
        document.getElementById('errorMsg').textContent = 'La imagen no debe superar los 5 MB.';
        document.getElementById('errorMsg').classList.add('visible');

        foto.target.value = '';

        return;
    }

    document.getElementById('errorMsg').classList.remove('visible');

    let lector = new FileReader();

    lector.onload = function(e)
    {
        let previsualizacion = document.getElementById('avatarPreview');
        previsualizacion.src = '';
        previsualizacion.src = e.target.result;
    };

    lector.readAsDataURL(archivo);
}

function actualizarContador()
{
    let bio = document.getElementById('biografia').value;
    let contador = document.getElementById('charCounter');

    contador.textContent = bio.length + ' / 300';

    if(bio.length >= 280)
        contador.classList.add('over');

    else
        contador.classList.remove('over');
}

function validarPerfil(event)
{
    event.preventDefault();

    let omitir = event.submitter && event.submitter.name === 'omitir';
    let err = document.getElementById('errorMsg');
    let usuarioId = sessionStorage.getItem('reg_usuario_id');

    if(!usuarioId)
    {
        window.location.href = '/registro';

        return false;
    }

    if(omitir)
    {
        sessionStorage.removeItem('reg_usuario_id');
        sessionStorage.removeItem('reg_nombre_usuario');
        window.location.href = '/';

        return false;
    }

    let bio = document.getElementById('biografia').value;
    let archivoInput = document.getElementById('fotoPerfil');
    let archivo = archivoInput.files[0];

    //Si hay foto se convierte a base64 y se envia junto con la biografia
    if(archivo)
    {
        let lector = new FileReader();

        lector.onload = function(e)
        {
            enviarPerfil(usuarioId, bio, e.target.result, err);
        };

        lector.readAsDataURL(archivo);
    }

    else
    {
        enviarPerfil(usuarioId, bio, null, err);
    }

    return false;
}

function enviarPerfil(usuarioId, bio, fotoBase64, err)
{
    let body = {biografia: bio};

    if(fotoBase64)
        body.foto_perfil = fotoBase64;

    fetch('/api/usuarios/' + usuarioId, {method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)}).then(function(res)
        {
            if(!res.ok)
                return res.json().then(function(d){ throw new Error(d.error || 'Error al guardar el perfil');});

            return res.json();
        })

        .then(function()
        {
            sessionStorage.removeItem('reg_usuario_id');
            sessionStorage.removeItem('reg_nombre_usuario');
            window.location.href = '/login';
        })

        .catch(function(e)
        {
            err.textContent = e.message;
            err.classList.add('visible');
        });
}