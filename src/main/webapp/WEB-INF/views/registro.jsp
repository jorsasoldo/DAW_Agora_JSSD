<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>agora – Crear cuenta</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>

<body>

<nav>
  <a class="nav-logo" href="/login">
    <img src="/imagenes/Agora_letra.png" alt="agora" class="nav-letra">
  </a>
</nav>

<main>

  <div class="card">
    <div class="card-banner"></div>

    <div class="card-logo-wrapper">
      <img src="/imagenes/Agora_logo.png" alt="agora Logo" class="card-logo-float">
    </div>

    <h1 class="card-brand">agora</h1>

    <p class="card-tagline">Crea tu cuenta</p>

    <div class="error-msg" id="errorMsg"></div>

    <form onsubmit="return validarRegistro(event)">

      <div class="field">
        <label for="nombreUsuario">Nombre de usuario</label>
        <input type="text" id="nombreUsuario" name="nombreUsuario" autocomplete="username" placeholder="usuario123" required minlength="3" maxlength="30">
      </div>

      <div class="field">
        <label for="email">Correo electrónico</label>
        <input type="email" id="email" name="email" autocomplete="email" placeholder="correo@ejemplo.com" required>
      </div>

      <div class="field">
        <label for="contrasena">Contraseña</label>
        <input type="password" id="contrasena" name="contrasena" autocomplete="new-password" placeholder="••••••••" required minlength="6">
      </div>

      <div class="field">
        <label for="contrasena2">Confirmar contraseña</label>
        <input type="password" id="contrasena2" name="contrasena2" autocomplete="new-password" placeholder="••••••••" required minlength="6">
      </div>

      <button class="btn-primary" type="submit">Continuar →</button>

    </form>

    <p class="subtitle" style="text-align:center; margin-top:20px;">¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>

  </div>
</main>

<script src="/js/app.js"></script>

</body>
</html>