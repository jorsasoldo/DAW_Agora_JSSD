<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>agora – Configura tu perfil</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>

<body>

<nav>
    <a class="nav-logo" href="/login">
        <img src="/imagenes/Agora_letra.png" alt="agora" class="nav-letra">
    </a>
</nav>

<main>

    <div class="card card-perfil">
        <div class="card-banner"></div>

        <div class="card-logo-wrapper">
            <img src="/imagenes/Agora_logo.png" alt="agora Logo" class="card-logo-float">
        </div>

        <h1 class="card-brand">agora</h1>
        <p class="card-tagline" style="margin-bottom:24px;">Personaliza tu perfil</p>

        <div class="error-msg" id="errorMsg"></div>

        <form onsubmit="return validarPerfil(event)" enctype="multipart/form-data">

            <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:20px; gap:8px;">

                <div onclick="document.getElementById('fotoPerfil').click()" title="Haz clic para cambiar tu foto"
                     style="position:relative; width:110px; height:110px; cursor:pointer; flex-shrink:0;">

                    <img id="avatarPreview" src="/imagenes/no_foto.png" alt="Vista previa"
                         style="width:110px; height:110px; min-width:110px; max-width:110px; border-radius:50%; object-fit:cover; display:block; border:3px solid #dde3f0; background:#f5f7fc;">

                    <div style="position:absolute; inset:0; border-radius:50%; background:rgba(42,112,236,0.55); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s;"
                         onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0'">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                             stroke-width="2" stroke="white" style="width:30px; height:30px;">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"/>
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"/>
                        </svg>
                    </div>
                </div>

                <p style="font-size:11px; color:#878a8c; text-align:center;">Haz clic en la imagen para cambiar tu foto</p>

                <input type="file" id="fotoPerfil" name="fotoPerfil" accept="image/jpeg,image/png,image/gif,image/webp"
                       style="display:none;" onchange="previsualizarFoto(event)">
            </div>

            <div class="field">
                <label for="biografia">Biografía</label>
                <textarea id="biografia" name="biografia" placeholder="Cuéntanos un poco sobre ti…"
                          maxlength="300" oninput="actualizarContador()"
                          style="width:100%; min-height:140px; box-sizing:border-box;"></textarea>
                <div class="char-counter" id="charCounter">0 / 300</div>
            </div>

            <button class="btn-primary" type="submit">Completar registro</button>

            <p style="text-align:center; margin-top:16px;">
                <button type="submit" name="omitir" value="true"
                        style="background:none; border:none; padding:0; margin:0; color:#2a70ec; font-size:13px; font-weight:600; cursor:pointer; text-decoration:none; font-family:inherit;"
                        onmouseover="this.style.textDecoration='underline'"
                        onmouseout="this.style.textDecoration='none'">
                    Omitir por ahora
                </button>
            </p>

        </form>

    </div>
</main>

<script src="/js/app.js"></script>

</body>
</html>