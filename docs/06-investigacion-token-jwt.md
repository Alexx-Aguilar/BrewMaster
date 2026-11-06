# Investigación: aplicación del token JWT en BrewMaster

**Estudiante:** Alex Aguilar López  
**Curso:** Desarrollo Web Full Stack  
**Docente:** Barry  
**Proyecto:** BrewMaster · Gestión de lotes y maduración  
**Fecha:** 06/11/2026

## 1. ¿Qué es un JWT?

JSON Web Token (JWT) es un formato compacto para transportar afirmaciones entre un cliente y una API. El token está formado por tres partes separadas por puntos:

1. **Header:** indica el tipo de token y el algoritmo de firma, por ejemplo `HS256`.
2. **Payload:** contiene datos mínimos, como el identificador del usuario (`sub`) y el correo. No se deben colocar contraseñas ni información sensible.
3. **Firma:** permite comprobar que el token fue creado por el servidor y que no fue alterado.

En BrewMaster el servidor firma el token con `JWT_SECRET` y lo configura para expirar en ocho horas.

## 2. Generación y verificación en Express

El back end usa `jsonwebtoken`. Después de comparar la contraseña recibida con el hash guardado mediante `bcryptjs`, `/api/auth/login` genera un token con `jwt.sign()`. El middleware lee `Authorization: Bearer <token>` y utiliza `jwt.verify()` para validar firma y expiración.

Las rutas `/api/insumos`, `/api/lotes`, `/api/barriles`, `/api/dashboard` y `/api/auth/me` pasan por ese middleware. Si no hay token, es inválido o está vencido, la API responde `401`.

## 3. Expiración y renovación

Un access token corto limita el impacto si se filtra. Para este proyecto se eligió una duración de ocho horas, configurable con `JWT_EXPIRES_IN`. Cuando vence, React elimina el token y devuelve al usuario al login. En una aplicación empresarial más grande se podría agregar un refresh token almacenado en cookie `httpOnly`, con rotación y revocación.

## 4. Decisión de almacenamiento en React

BrewMaster guarda el access token en `localStorage` para que la sesión sobreviva al cierre de la pestaña y para mantener la implementación clara para el alcance académico. La función común `api()` lo agrega automáticamente en cada petición.

Comparación:

| Opción | Ventaja | Riesgo o consideración |
|---|---|---|
| `localStorage` | Fácil de usar y persistente | Un XSS podría leer el token |
| `sessionStorage` | Se elimina al cerrar la pestaña | También es accesible desde JavaScript |
| Cookie `httpOnly` | JavaScript no puede leerla | Requiere protección CSRF y configuración de cookies |

En producción se recomienda HTTPS, una cookie `httpOnly` segura, protección CSRF, CSP y una política de expiración estricta.

## 5. Flujo aplicado

1. El usuario se registra en `POST /api/auth/register`; la contraseña se cifra con bcrypt y nunca se responde.
2. El usuario inicia sesión en `POST /api/auth/login`.
3. La API responde con `{ token, usuario }`.
4. React guarda el token y protege el panel.
5. Cada petición agrega `Authorization: Bearer <token>`.
6. Un `401` limpia la sesión y redirige al login.

## 6. Buenas prácticas aplicadas

- La clave secreta está en `backend/.env`, excluida por `.gitignore`; se entrega únicamente `backend/.env.example`.
- El payload contiene solo `sub`, `correo` y `nombre`.
- Las contraseñas se almacenan con hash bcrypt de 12 rondas.
- El endpoint de usuario nunca devuelve el campo `password`.
- Se validan correo, longitud mínima de contraseña, duplicados y autorización.
- En despliegue se debe usar HTTPS y una clave aleatoria que no se comparta.

## Fuentes consultadas

- [RFC 7519 · JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519)
- [jwt.io · Introduction to JSON Web Tokens](https://jwt.io/introduction)
- [jsonwebtoken · npm](https://www.npmjs.com/package/jsonwebtoken)
- [bcryptjs · npm](https://www.npmjs.com/package/bcryptjs)
- [OWASP · JSON Web Token for Java Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
