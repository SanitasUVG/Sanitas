# Sanitas Frontend

El frontend de Sanitas está programado en React y utiliza Vite para compilar el
javascript a una SPA. Recuerda que aunque la documentación esté en español,
todo el desarrollo se llevó a cabo con nombres en inglés.

A continuación mostramos una guía de la estructura del proyecto.

## Estructua del Frontend

```text
sanitas_frontend/src/
├── App.css
├── App.jsx
├── assets
│   └── react.svg
├── components
│   └── Button
│       ├── Button.css
│       ├── Button.unit.test.jsx
│       ├── Button.ui.test.jsx
│       └── Button.jsx
├── views
│   └── LoginView
│       ├── LoginView.css
│       ├── LoginView.ui.test.jsx
│       └── index.jsx
├── dataLayer.js
├── settings.js
├── index.css
├── main.jsx
└── utils
    └── add.js
```

### assets/

Este directorio contendrá principalmente recursos estáticos que sean útiles
para el desarrollo de `views/` o `components/`. Como lo son archivos para
la tipografía del sitio, imágenes, videos, audios, etc.

### components/

Este directorio contendrá los componentes a ser utilizados en `views/`,
la estructura de las carpetas deberá ser la siguiente:

```text
components/
├── {NombreComponente} CamelCase
│   ├── {NombreComponente}.css
│   ├── {NombreComponente}.unit.test.jsx
│   ├── {NombreComponente}.ui.test.jsx
│   └── index.jsx
```

Para poder realizar pruebas de interfaz con nuestros componentes es importante
escribirlos de forma que todo su comportamiento dependa de los props que se
les pasen. Por ejemplo, si queremos tener un componente que haga fetch a
la API por medio de un `useEffect` estaríamos tentados a escribirlo de
la siguiente forma:

```javascript=
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

```javascript=
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

### views/

Este directorio contrendrá las vistas principales (páginas) del frontend. La
estructura de estas vistas es igual a la de los componentes, sin embargo para
diferenciarlas de éstos es obligatorio agregar `View` al final del nombre.
Ejemplo:`FormView`

```text
├── views
│   └── LoginView
│       ├── LoginView.css
│       ├── LoginView.ui.test.jsx
│       └── index.jsx
```

### dataLayer.js

Este módulo de javascript contiene todas las funciones que se encargan de
interactúar con la API. Si algo se en el ejemplo del `Button` en la parte
superior la función `fetchData()` provendría de este módulo.

### settings.js

Este módulo exporta constante de configuración que se utilizan en el resto de
aplicación, un ejemplo de dichas constantes sería la URL de la API. En
development esta URL muy probablemente sería algo parecido a `localhost:3000`
pero en producción puede ser cualquier otra cosa.

### utils/

Este directorio será específico para contener las funciones que pueden ser
reutilizables dentro del proyecto para poder ahorrar líneas de código.

Un ejemplo de una función que iría en utils sería:

```javascript=
/**
 * A useState react hook that uses internally localStorage to save its state.
 * @param {string} key - The key to save this object into
 * @param {T|undefined} defaultValue - The default value to save inside local storage.
 * @returns {[T, (newValue: T)=>void]} The custom react hook.
 */
export const useLocalStorage = (key, defaultValue = undefined) => {
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, JSON.stringify(defaultValue ?? null));
  }
  const [value, setValue] = useState(JSON.parse(localStorage.getItem(key)));

  return [
    value,
    (newValue) => {
      const newValueJson = JSON.stringify(newValue);
      localStorage.setItem(key, newValueJson);
      setValue(newValue);
    },
  ];
};
```

Esta función es un hook custom que utiliza el LocalStorage para
guardar u obtener datos.

______________________________________________________________________

## Extra guidelines

### JSDoc

Este proyecto no utiliza typescript para su manejo de tipos sino que
[JSDoc](https://jsdoc.app/). Es **requerido** que todos los componentes de la
aplicación tengan asociado unos comentarios de JSDoc que documenten el tipo de
sus props. Por ejemplo el componente botón que explicamos anteriormente
realmente debería de tener documentación de la siguiente forma como mínimo:

```javascript=
/**
 * @typedef {Object} ButtonProps
 * @property {string} text
 * @property {()=>void onClick
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

```javascript=
import { logError } from "../../utils/general";
```

En realidad este import debe utilizar el alias `src` para simplificar el import,
además de que permite mover el componente de lugar sin afectar sus imports:

```javascript=
import { logError } from "src/utils/general";
```
