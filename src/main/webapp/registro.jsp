<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agora – Crear cuenta</title>
  <link rel="stylesheet" href="css/styles.css">
</head>

<body>

<nav>
  <a class="nav-logo" href="login.jsp">
    <img src="imagenes/Agora_letra.png" alt="Agora" class="nav-letra">
  </a>
</nav>

<main>

  <div class="card">
    <div class="card-banner"></div>

    <div class="card-logo-wrapper">
      <img src="imagenes/Agora_logo.png" alt="Agora Logo" class="card-logo-float">
    </div>

    <h1 class="card-brand">Agora</h1>

    <p class="card-tagline">Crea tu cuenta</p>

    <%
      String error = (String) request.getAttribute("errorRegistro");

      if(error != null && !error.isEmpty())
      {
    %>
    <div class="error-msg visible" id="errorMsg"><%= error %></div>
    <%
    }

    else
    {
    %>
    <div class="error-msg" id="errorMsg"></div>
    <%
      }

    %>

    <form method="post" action="registro" onsubmit="return validarRegistro(event)">

      <div class="field">
        <label for="nombre_usuario">Nombre de usuario</label>
        <input type="text" id="nombre_usuario" name="nombre_usuario" autocomplete="username" placeholder="usuario123" required minlength="3" maxlength="30">
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

    <p class="subtitle" style="text-align:center; margin-top:20px;">¿Ya tienes cuenta? <a href="login.jsp">Inicia sesión</a></p>

  </div>
</main>

<script src="js/app.js"></script>

</body>
</html>
