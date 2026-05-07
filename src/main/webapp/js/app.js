//login
function validar(v)
{
    var email = document.getElementById('email').value.trim();

    var cont = document.getElementById('contrasena').value.trim();

    var err = document.getElementById('errorMsg');

    if(!email || !cont)
    {
        v.preventDefault();
        err.classList.add('visible');
        return false;
    }

    err.classList.remove('visible');

    return true;
}

//registro pagina 1
function validarRegistro(v)
{
    var nombre = document.getElementById('nombre_usuario').value.trim();
    var email = document.getElementById('email').value.trim();
    var cont = document.getElementById('contrasena').value;
    var cont2 = document.getElementById('contrasena2').value;
    var err = document.getElementById('errorMsg');

    if(!nombre || !email || !cont || !cont2)
    {
        v.preventDefault();
        err.textContent = 'Por favor completa todos los campos.';
        err.classList.add('visible');
        return false;
    }

    if(cont.length < 6)
    {
        v.preventDefault();
        err.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        err.classList.add('visible');
        return false;
    }

    if(cont !== cont2)
    {
        v.preventDefault();
        err.textContent = 'Las contraseñas no coinciden.';
        err.classList.add('visible');
        return false;
    }

    err.classList.remove('visible');

    return true;
}

//registro pagina 2
function previsualizarFoto(foto)
{
    var archivo = foto.target.files[0];

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

    //convierte los bytes del archivo en una cadena Base64 con el formato y se asigna directamente el src
    //para su renderizado para que sea instantaneo
    var lector = new FileReader();

    lector.onload = function(e)
    {
        var previsualizacion = document.getElementById('avatarPreview');
        previsualizacion.src = '';
        previsualizacion.src = e.target.result; //asigna base64
    };

    lector.readAsDataURL(archivo);
}

function actualizarContador()
{
    var bio = document.getElementById('biografia').value;
    var contador = document.getElementById('charCounter');

    contador.textContent = bio.length + ' / 300';

    if(bio.length >= 280)
        contador.classList.add('over');

    else
        contador.classList.remove('over');
}

function validarPerfil(v)
{
    return true;
}