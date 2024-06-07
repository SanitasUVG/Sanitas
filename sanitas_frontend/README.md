# Frontend

Para más información respecto al frontend y cómo está desarrollado puedes ver la
[wiki](../wiki/mantenimiento/frontend/README.md).

## Developing

Recuerda que para desarrollar debes primero haber entrado al entorno de desarrollo
, para esto usa:

```bash
# /Sanitas - La carpeta root del repositorio
nix develop --impure
```

Para correr el frontend de forma local puedes ejecutar el siguiente comando:

```bash
yarn dev
```

Para correr el storybook de forma local puedes ejecutar el siguiente comando:

```bash
yarn run storybook
```

Para probar las distintas funcionalidades del proyecto, que son:

- Backend
- frontend
- postgres

Revisar siempre cada una de las tabs, en especial las de backend y frontend
para poder ver los logs de los distintos servicios.

Para levantar estos servicios se utiliza en primera instancia
(no es 100% requerido):

```bash
nix develop --impure
```

Una vez dentro del `devenv` ahora utiliza el comando:

```bash
nix run .#restarServices
```

Una vez dentro de la consola de servicios recuerda siempre reiniciar el
servicio de `postgres` con `CTRL + R`.

Luego puedes abrir otra instancia de tu consola para trabajar en el `devenv`.

// TODO: Explicar cómo añadir compomentes/vistas

### Testeo de componentes

Para poder realizar pruebas de interfaz con nuestros componentes es importante
escribirlos de forma que todo su comportamiento dependa de los props que se
les pasen. Por ejemplo, si queremos tener un componente que haga fetch a
la API por medio de un `useEffect` estaríamos tentados a escribirlo de
la siguiente forma:

```javascript
export default function Button({ text, onClick }) => {
  const [data, setData] = useState()
  useEffect(() => {
    (async () => {
      const a = await fetchData()
        setData(a)
    })()
  }, [])

  return (
    <button onClick={onClick}>
      {text}
    </button>
  );
}`
```

El componente botón de arriba es muy difícil de testear, principalmente debido
a que la función `fetchData()` no se encuentra como una dependencia del
componente en sus props, por lo que al momento de simular el componente en un
ambiente de testing, no puedo simplemente reemplazarla por algo más que no
llame a la API para traer la data. Para arreglar esto podemos reescribir el
componente de la siguiente manera:

```javascript
export default function Button({ text, onClick, fetchData }) => {
  const [data, setData] = useState()
  useEffect(() => {
    (async () => {
      const a = await fetchData()
      setData(a)
    })()
  }, [])

  return (
    <button onClick={onClick}>
      {text}
    </button>
  );
};
```

Este componente tiene su lógica de obtener data de la API extraída en una
función que podemos hacerle mock cuando estemos realizando las pruebas de
interfaz sobre él. Esto lo hace mucho más fácil de testear.

## Conventions

El lenguaje del código es en inglés, por lo que todos los nombres deben ir en inglés.

Recuerda formatear tu código y darle lint con los comandos:

```bash
yarn run lint
```

```bash
yarn run format
```

- Los nombres de los componentes deben ir en [PascalCase](https://www.theserverside.com/definition/Pascal-case).
- Todos los componentes que lleven props deben tener un JSDoc asociado que
  identifique sus props.
- Recuerda utilizar los colores y tipografías definidas en `theme.mjs`.
- Para las animaciones y hovers que se definiran en un archivo CSS aparte
  utilizar siempre el siguiente formato para nombrar las id's o nombres de las
  animaciones:

```text
{NombreComponente}_{NombreAnimacion}
{NombreComponente}_{NombreElemento}
```

Ejemplos:

```text
SearchPatientView_AddTablesAnimation
#PrimaryButton_container
```

### Styles

Los estilos dentro del proyecto se manejarán de forma inline, con la excepción
de las animaciones y estilos en hover.

```javascript
export default function ExampleComponent({ text, onClick, fetchData }) => {
  return <div style={{backgroundColor: "red"}}></div>
}

export default function ExampleComponent({ text, onClick, fetchData }) => {
  /** @type CSSStyleDeclaration */
  const styles = {
    backgroundColor: "red" 
  }
  return <div style={styles}></div>
}
```

### JSDoc

Este proyecto no utiliza typescript para su manejo de tipos sino que
[JSDoc](https://jsdoc.app/). Es **requerido** que todos los componentes de la
aplicación tengan asociado unos comentarios de JSDoc que documenten el tipo de
sus props. Por ejemplo el componente botón que explicamos anteriormente
realmente debería de tener documentación de la siguiente forma como mínimo:

```javascript
/**
 * @typedef {Object} ButtonProps
 * @property {string} text
 * @property {()=>void} onClick
 * @property {()=>void} fetchData
 */

/**
 * @param {ButtonProps} props
 */
export default function Button({ text, onClick, fetchData }) => {
  const [data, setData] = useState()
  useEffect(() => {
    (async () => {
      const a = await fetchData()
      setData(a)
    })()
  }, [])

  return (
    <button onClick={onClick}>
      {text}
    </button>
  );
};
```

### Preferir alias src

Además se configuró un alias para la importación de componentes, preferir usar
el alias `src` antes de la ruta relativa para todos los imports que no sean estilos.

Una violación a esta guideline se miraría de la siguiente forma:

```javascript
import { logError } from "../../utils/general";
```

En realidad este import debe utilizar el alias `src` para simplificar el import,
además de que permite mover el componente de lugar sin afectar sus imports:

```javascript
import { logError } from "src/utils/general";
```
