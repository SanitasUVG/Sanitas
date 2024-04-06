# Base de Datos

La base de datos para Sanitas es una de tipo relacional programada en postgres,
el diagrama ER de esta es el siguiente:

```mermaid
---
title: Sanitas ER Diagram
---
erDiagram
    USUARIO {
        varchar username
        varchar password
    }
    SESION {
        varchar     token
        varchar     username
        timestamp   created
    }
    CONTACTO_EMERGENCIA {
        serial  id_contacto
        varchar nombre
        varchar parentesco
        varchar telefono
    }
    PACIENTE {
        varchar carnet
        boolean es_estudiante
        varchar nombres
        varchar apellidos
        char    sexo
        varchar correo
        varchar telefono
        varchar seguro
        varchar carrera_o_dept
        date    fecha_nacimiento
        varchar tipo_sangre
        varchar direccion
        text    nota_importante
        serial  contacto_emergencia_1
        serial  contacto_emergencia_2
    }
    ANTECEDENTE_PACIENTE {
        serial  id_antecedente_paciente
        serial  paciente
        serial  antecedente
        date    fecha_inicio
    }
    ANTECEDENTE {
        serial  id_antecedente
        serial  tipo
        varchar descripcion
    }
    TIPO_ANTECEDENTE {
        serial  id_tipo
        varchar descripcion
    }
    TRATAMIENTO {
        serial  id_tratamiento
        varchar descripcion
    }
    TRATAMIENTO_ANTECEDENTE {
        serial antecedente_paciente
        serial tratamiento
        serial detalle_farmacologia
    }
    DETALLE_FARMACOLOGIA {
        serial  id_detalle_farmacologia
        double_precision dosis
        varchar unidad_dosis
        integer frecuencia_dosis
    }
    TRATAMIENTO_VISITA {
        serial visita
        serial tratamiento
        serial detalle_farmacologia
    }
    VISITA {
        serial      id_visita
        serial      paciente
        varchar     motivo
        timestamp   fecha
        text        diagnostico
        text        referencia
        serial      examen_fisico
    }
    EXAMEN_FISICO {
        serial              id_examen_fisico
        varchar             descripcion
        integer             frecuencia_respiratoria
        double_precision    temperatura
        integer             saturacion_oxigeno
        integer             glucometria
        integer             frecuencia_cardiaca
        integer             presion_arterial
    }
    FORMULARIO {
        serial      id_formulario
        varchar     edicion
        timestamp   fecha
    }
    RESPUESTA_FORMULARIO {
        serial      formulario
        serial      paciente
        timestamp   fecha
    }
    PRIVILEGIO_USUARIO {
        varchar     privilegio_usuario
        varchar     username
    }
    PRIVILEGIO {
        serial      id_privilegio
        varchar     privilegio
    }

    USUARIO ||--o{ SESION: ""
    USUARIO ||--|{ PRIVILEGIO_USUARIO: ""

    PRIVILEGIO ||--|{ PRIVILEGIO_USUARIO: ""

    USUARIO ||--o{ SESION: ""

    PACIENTE ||--o{ ANTECEDENTE_PACIENTE: ""
    PACIENTE ||--|| CONTACTO_EMERGENCIA: ""
    PACIENTE ||--o| CONTACTO_EMERGENCIA: ""

    PACIENTE ||--o{ VISITA: ""
    VISITA ||--o| EXAMEN_FISICO: ""

    PACIENTE ||--|{ RESPUESTA_FORMULARIO: ""
    FORMULARIO ||--|{ RESPUESTA_FORMULARIO: ""

    ANTECEDENTE_PACIENTE }|--|| ANTECEDENTE: ""

    VISITA ||--o{ TRATAMIENTO_VISITA: ""
    TRATAMIENTO ||--o{ TRATAMIENTO_VISITA: ""

    TRATAMIENTO ||--o{ TRATAMIENTO_ANTECEDENTE: ""
    TRATAMIENTO_ANTECEDENTE }o--|| ANTECEDENTE_PACIENTE: ""

    DETALLE_FARMACOLOGIA |o--|| TRATAMIENTO_VISITA: ""
    DETALLE_FARMACOLOGIA |o--|| TRATAMIENTO_ANTECEDENTE: ""

    ANTECEDENTE }o--||  TIPO_ANTECEDENTE: ""
```
