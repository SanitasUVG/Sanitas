# Backend Sanitas

Para más información sobre la estructura del backend y cómo está desarrollado
puedes ver la [wiki](../wiki/mantenimiento/backend/README.md).

## Dependencias

Siempre recomendamos utilizar Nix para instalar y configurar las dependencias,
pero en caso no se desee utilizarlo:

- [nodejs v20.16.0](https://nodejs.org/en)
- [aws-cli v2.17.42](https://aws.amazon.com/cli/)
- [sam-cli v1.120.0](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- [docker 26.0.0](https://www.docker.com/) (SAM lo utiliza para desarrollo local)

## Desarrollo

Para correr el backend de forma local recuerda ingresar a nix usando
`nix develop --impure` dentro de la carpeta root del repositorio y después has
`cd sanitas_backend`. Para correr el backend de forma local utiliza:

```bash
sam build && sam local start-api --add-host=hostpc:{tu ip aquí}
```

El comando `sam build` compila todo el proyecto y la imagen de docker mientras
el comand `sam local start-api` inicia el API en localhost:3000. Para cambiar la
URL de conexión a la DB puedes usar parámetros:

```bash
sam local start-api --parameter-override {nombre parametro}={valor parametro}
```

Por comodidad se automatizó el incio del backend con el comando de services de
nix por lo que el siguiente comando también corre el backend!

```bash
nix run .#restartServices
```

Si obtienes algún error de conexión parecido a:

```text
FATAL: no pg_hba.conf entry for host "10.100.1.70", user "backend", database
"sanitas", no encryption
```

Por favor reinicia el servicio de la base de datos dentro del process-compose,
para reiniciarlo normalmente basta con ubicarse en la ventana del servicio y
presionar `CTRL+R`.

Se recomienda seguir estos pasos para desarrollar un endpoint dentro del backend
de sanitas. En el ejemplo estaremos desarrollando un endpoint de una API
ficticia para obtener todos los jamones de la tienda.

1. Define los inputs de tu endpoint. En el caso del endpoint de jamones talvez
   la interfaz nos deja filtrar por tipo de jamón u ordenar por precio así que
   estos sería inputs de nuestra API.

1. Agrega la lambda al template.yml. Una lambda ya creada se puede ver en el
   [`template.yml`](template.yaml).

1. Agrega el endpoint de la API Gateway dentro de la lambda en el
   [`template.yml`](template.yaml).

1. Crea una carpeta con el nombre de tu lambda dentro de src/handlers.

1. La estructura base de una lambda es la siguiente (si algún archivo no es
   necesario porque la lambda no utiliza ese tipo de estructuras no es necesario
   crearlo, los que aparecen en negrita son obligatorios):

   - **{nombre}.mjs**: Contiene el código que implementa el handler que utiliza
     la lambda.
   - {nombre}.queries.mjs: Contiene todos los queries que se utilizan en la
     lambda.
   - {nombre}.unit.test.mjs: Contiene todas las unit test para esta lambda.
   - **{nombre}.integration.test.mjs**: Contiene todas las integration tests de
     la lambda.
   - {nombre}.export.test.mjs: Contiene todas las funciones de utilidad que
     puede que se utilicen al momento de crear más tests. Deben ir en un archivo
     por separado pues sino utilizarían las tests se correrían de más.

1. Implementa primero las integration tests y asegurate de que a correr el
   backend de forma local. Estas integration tests tienen como objetivo probar que
   tu backend realmente haga lo que debería de hacer con los inputs que definiste
   en el paso 1, por ejemplo si hay 3 jamones en la tienda el endpoint debería de
   listar los 3 jamones. Crea tantos casos como creas necesarios, por ejemplo
   para el endpoint de la API de jamones es muy probable que se necesita de
   pruebas para los distintos filtros además de una sin filtros para comprobar
   que sí funciona si nada.

1. Implementa tu endpoint hasta que pase todas las integration tests. Asegúrate
   de utilizar logging extenso y de usar también JSDoc donde se necesite.

1. Añade los exports que creas necesarios para las integration tests.

1. Haz la PR.

## Conventions

El lenguaje del código es en inglés, por lo que todos los nombres deben ir en inglés.

Recuerda formatear tu código y darle lint con los comandos:

```bash
npm run lint
```

```bash
npm run format
```

### Endpoints

Para los endpoints de la API del backend la convención es:

- Usar el método [HTTP adecuado](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods).
- Todos los `body` en las cualquier tipo de request siguen el formato [camelCase](https://es.wikipedia.org/wiki/Camel_case)
- Las responses de los endpoints siguen el formato [camelCase](https://es.wikipedia.org/wiki/Camel_case)
  para sus propiedades. Recuerda simplificar lo más que se pueda la response.

```bash
# Incorrecto
{
   esValido: true
}
```

```bash
# Correcto
true
```

- Las responses de los endpoints deben ser consistentes en caso de ser exitosa.
  Es decir, si retorna un estatus de éxito (200-299), siempre debe tener la misma
  estructura.

```bash
# Incorrecto

# El endpoint puede responder con cualquiera de estas dos estructuras
# Para el mismo status.
# En su lugar debería de responder siempre con la misma para el rango de estatus.
Status: 200
{
   items: []
}
Status: 200
{
   objects: []
}
```

- Todos los endpoints tiene un recurso asociado, entonces:

Por ejemplo si se diseña un endpoint para añadir un paciente:

```bash
# Incorrecto
POST
/add-paciente
{
   CUI: "3333333333333",
   Nombres: "Flavio Galán",
   es_mujer: true
}
```

```bash
# Correcto
POST
/patient
{
   cui: "3333333333333",
   nombres: "Flavio Galán",
   esMujer: false
}
```

O si se diseña un endpoint para obtener información específica de algún paciente
en específico:

```bash
# Incorrecto
GET
/get-paciente-data?ID=3
```

```bash
# Correcto
GET
/patient/{id}/details
```

```bash
# Correct UPDATE request
UPDATE
/patient/{id}
{
   cui: "3333333333333",
   nombres: "Flavio Galán",
   esMujer: false
}
```

```bash
# Correct
GET
/check-cui
```

```bash
# Correct
GET
/patient/cui/check
```
