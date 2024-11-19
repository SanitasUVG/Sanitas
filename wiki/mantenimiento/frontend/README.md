# Sanitas Frontend

El frontend de Sanitas está programado en React y utiliza Vite para compilar el
javascript a una SPA. Recuerda que aunque la documentación esté en español,
todo el desarrollo se llevó a cabo con nombres en inglés.

A continuación mostramos una guía de la estructura del proyecto.

## ¿Cómo funciona el Login?

Todos los componentes dispuestos dentro de `views/` reciben por medio de props
todas las funciones que necesitan para llevar a cabo su lógica de negocio. En
este caso existe un componente llamado `LoginView` el cual recibe como props la
función de cognito encargada de llevar a cabo el inicio de sesión.

El proyecto tiene dos archivos de javascript grandes que se encargan de definir
todas las funciones que interactúan con la API o con Cognito utilizando el SDK.
Estos módulos son `datalayer.mjs` (para la API) y `cognito.mjs` (para CognitoSDK)
respectivamente.

Los componentes dentro de `views/` nunca importan estas funciones directamente,
en su lugar son pasadas como props, lo que facilita testear y simular estas
vistas. El lugar en donde se realiza este llenado de los props es en el archivo
`router.jsx`.

### Cognito de forma Local

AWS SAM no permite simular cognito de forma local, por lo tanto el archivo de
`cognito.mjs` tiene varios mocks que simulan ser la versión real de cognito y
tienen varios parámetros para fingir que el usuario es doctor o paciente. En el
ambiente de desarrollo son estas funciones las que se utilizan en lugar de las
reales definidas en el mismo archivo. Por ejemplo el siguiente componente de
forma local utilizará el mock pero en producción usará la versión real:

```javascript
const updateInfoView = (
    <RequireAuth
        getSession={IS_PRODUCTION ? getSession : mockGetSession}
        path={NAV_PATHS.LOGIN_USER}
        useStore={useStore}
    >
        <UpdateInfoView
            getGeneralPatientInformation={getGeneralPatientInformation}
            updateGeneralPatientInformation={updateGeneralPatientInformation}
            getStudentPatientInformation={getStudentPatientInformation}
            updateStudentPatientInformation={updateStudentPatientInformation}
            getCollaboratorInformation={getCollaboratorInformation}
            updateCollaboratorInformation={updateCollaboratorInformation}
            sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
            useStore={useStore}
        />
    </RequireAuth>
);
```

## Testing

Hay dos tipos de pruebas en el frontend. Para correr ambas debes estar en el
ambiente generado por `nix develop --impure`.

- Unitarias: Se corren con `yarn test`.
- E2E: Se corren con `yarn e2e`. (Corren con el ambiente de staging en mente,
  así que asgúrate de actualizar la URL acorde a donde se haga deploy)

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

```javascript
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
