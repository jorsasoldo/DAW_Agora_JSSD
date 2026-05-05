function validar(v)
{
    var email = document.getElementById('email').value.trim();

    var cont = document.getElementById('contrasena').value.trim();

    var err= document.getElementById('errorMsg');

    if(!email || !cont)
    {
        v.preventDefault();
        err.classList.add('visible');
        return false;
    }

    err.classList.remove('visible');

    return true;
}

function validarRegistro(v)
{
    var nombre = document.getElementById('nombre_usuario').value.trim();
    var email = document.getElementById('email').value.trim();
    var cont = document.getElementById('contrasena').value;
    var cont2 = document.getElementById('contrasena2').value;
    var err= document.getElementById('errorMsg');

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