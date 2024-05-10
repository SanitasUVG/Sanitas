# Reunión 7 de mayo

## Doctoras

- Brindar una lista con todos los seguros que le interesan que aparezcan en el formulario.
- Definir el esquema de la bitácora de cambios.
- No forma parte del alcance que el sistema lance notificaciones a los estudian
  tes que no hayan llenado el formulario.
- Las visitas van ordenadas de la más reciente a la menos reciente.

## Ingreso fichas médicas

- Añadir soporte para visitantes, personas que no son colaboradoras ni
  estudiantes ni colaboradores de restaurantes.
- La carrera y departamento al que pertenece el paciente debe ser escritura
  libre para no integrarse con el departamento académico/administrativo.
- Revisar si el número de teléfono ingresado para los contactos de emergencia
  es en realidad un número de teléfono con RegExp.
- Si es colaborador agregar el nombre, correo y extensión del jefe inmediato.

## Actualización fichas médicas

- Los contactos de emergencia sí los puede modificar en todo sentido mientras
  siempre tenga 1 como mínimo.
- Con respecto a los antecedentes, solamente puede agregar antecedentes, los
  que ya ingresó anteriormente no los podrá modificar. Los antecedentes ya
  registrados solo los puede modificar las doctoras.

## Visitas

- Una visita puede tener varios diagnósticos y estos diagnósticos tienen un
  tratamiento asociado, es decir:
  - ¿Qué se le recetó?
  - ¿Cuánto?
- Se tienen dos “tratamientos” para un diagnóstico, lo que se le daría
  idealmente al paciente y lo que realmente se le dió.

## Análisis de Datos

- ¿Cuáles son los diagnósticos más frecuentes?

## ESCENARIO

- Llega un colaborador con dolor de estómago (motivo de consulta).
- La doctora pregunta cómo se llama y le hace preguntas para intentar obtener
  antecedentes de él y se le realiza un exámen físico.
- La doctora le deja algunos medicamentos y un plan de educación.
