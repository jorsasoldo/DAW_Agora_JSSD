<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>agora – Iniciar sesión</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>

<body>

<nav>
  <a class="nav-logo" href="#">
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

    <p class="card-tagline">Bienvenido de vuelta</p>

    <div class="error-msg" id="errorMsg">Usuario o contraseña incorrectos.</div>

    <form onsubmit="return validar(event)">

      <div class="field">
        <label for="email">Correo electrónico</label>
        <input type="email" id="email" name="email" autocomplete="username" placeholder="correo@ejemplo.com" required>
      </div>

      <div class="field">
        <label for="contrasena">Contraseña</label>
        <input type="password" id="contrasena" name="contrasena" autocomplete="current-password" placeholder="••••••••" required>
      </div>

      <button class="btn-primary" type="submit">Iniciar sesión</button>

    </form>

    <p class="subtitle" style="text-align:center; margin-top:20px;">¿No tienes cuenta? <a href="/registro">Regístrate</a></p>

  </div>
</main>

<script src="/js/app.js"></script>

</body>
</html>