# Páginas de error personalizadas para Cloudflare

Páginas de error en español para los tipos que Cloudflare permite personalizar. Se publican con Cloudflare Pages y después se asignan desde el panel de Cloudflare.

## Estructura

```
src/template.html   Plantilla común: estilos, diagrama y pie (los colores se cambian en :root)
src/pages.mjs       Textos, estado del diagrama y token obligatorio de cada página
build.mjs           Genera dist/ y valida los requisitos de Cloudflare
.github/workflows/  Despliegue automático a Cloudflare Pages
```

| Página               | Tipo en Cloudflare                          | Ruta                  | Token obligatorio                |
| -------------------- | ------------------------------------------- | --------------------- | -------------------------------- |
| Errores clase 1000   | 1000 class errors (`1000_errors`)           | `/1000`               | `::CLOUDFLARE_ERROR_1000S_BOX::` |
| Errores clase 500    | 500 class errors (`500_errors`)             | `/500`                | `::CLOUDFLARE_ERROR_500S_BOX::`  |
| Bloqueo del WAF      | WAF block (`waf_block`)                     | `/waf-block`          | `::CLOUDFLARE_ERROR_1000S_BOX::` |
| Bloqueo por IP/país  | IP/Country block (`ip_block`)               | `/ip-block`           | `::CLOUDFLARE_ERROR_1000S_BOX::` |
| Límite de solicitudes| Rate limiting block (`ratelimit_block`)     | `/rate-limit`         | `::CLOUDFLARE_ERROR_1000S_BOX::` |
| Desafío gestionado   | Managed challenge / I'm Under Attack (`managed_challenge`) | `/managed-challenge` | `::CAPTCHA_BOX::` |
| Desafío por IP/país  | IP/Country challenge (`country_challenge`)  | `/country-challenge`  | `::CAPTCHA_BOX::`                |

Todas las páginas muestran además `::RAY_ID::`, `::CLIENT_IP::` y `::GEO::`.

## Uso local

```sh
npm run build     # genera dist/
npm run preview   # genera y sirve dist/ con wrangler en http://localhost:8788
```

Para editar textos, modifica `src/pages.mjs`. Para cambiar colores o tipografía, modifica `src/template.html`. `build.mjs` falla si una página no incluye su token obligatorio, si no tiene `<head>`, si incluye `<meta name="referrer">` o si supera 1,5 MB.

## Despliegue

El workflow `.github/workflows/deploy.yml` genera las páginas y las publica en Cloudflare Pages en cada push a `main` (producción). Los pull requests generan una vista previa.

Configuración en GitHub (Settings → Secrets and variables → Actions):

- Secreto `CLOUDFLARE_API_TOKEN`: token de API con permiso **Account → Cloudflare Pages → Edit**.
- Secreto `CLOUDFLARE_ACCOUNT_ID`: ID de tu cuenta de Cloudflare.
- Variable opcional `CLOUDFLARE_PAGES_PROJECT`: nombre del proyecto de Pages (por defecto `errorpages`). Si no existe, el workflow lo crea.

## Asignar las páginas en Cloudflare

1. Despliega y abre `https://<proyecto>.pages.dev/` para ver la tabla con todas las rutas.
2. En el panel de Cloudflare, entra a tu dominio → **Rules → Custom Error Pages** (Páginas personalizadas).
3. Para cada tipo, elige **Custom page** y pega la URL **sin `.html`**, por ejemplo `https://<proyecto>.pages.dev/waf-block`. Cloudflare Pages redirige las rutas con `.html` y Cloudflare solo acepta respuestas `200 OK`.
4. Cloudflare descarga y guarda una copia de la página al publicarla. Si cambias el diseño, vuelve a desplegar y pulsa **Publish** de nuevo en cada tipo para que tome la versión nueva.
