# Base de Datos

La base de datos para Sanitas es una de tipo relacional programada en postgres,
el diagrama ER de esta es el siguiente:

```mermaid
---
title: Sanitas ER Diagram Updated
---
erDiagram
    PACIENTE {
        serial id
        varchar cui
        varchar correo
        boolean es_mujer
        varchar nombres
        varchar apellidos
        varchar nombre_contacto1
        varchar parentesco_contacto1
        varchar telefono_contacto1
        varchar nombre_contacto2
        varchar parentesco_contacto2
        varchar telefono_contacto2
        varchar tipo_sangre
        varchar direccion
        varchar id_seguro
        date    fecha_nacimiento
        varchar telefono
    }

    CONSULTA {
        serial      id
        integer     id_paciente
        timestamp   fecha
        varchar     motivo
        varchar     frecuencia_respiratoria
        double_precision temperatura
        double_precision     saturacion_oxigeno
        double_precision     glucometria
        double_precision     frecuencia_cardiaca
        integer presion_sistolica
        integer presion_diastolica
        varchar evaluador
    }

    DIAGNOSTICO {
        serial  id
        serial  id_consulta
        varchar nombre
        varchar tratamiento
    }

    MEDICAMENTO {
        serial      id
        varchar     nombre
        integer     cantidad
        serial      id_consulta
    }

    SEGURO {
        serial  id
        varchar nombre
        boolean estado_activo
    }

    ESTUDIANTE {
        varchar carnet
        varchar carrera
        varchar id_paciente
    }

    COLABORADOR {
        varchar codigo
        varchar area
        varchar id_paciente
    }

    ANTECEDENTES_FAMILIARES {
        boolean hipertension_arterial
        json hipertension_arterial_data
        boolean diabetes_mellitus
        json diabetes_mellitus_data
        boolean hipotiroidismo
        json hipotiroidismo_data
        boolean asma
        json asma_data
        boolean convulsiones
        json convulsiones_data
        boolean infarto_agudo_miocardio
        json infarto_agudo_miocardio_data
        boolean cancer
        json cancer_data
        boolean enfermedades_cardiacas
        json enfermedades_cardiacas_data
        boolean enfermedades_renales
        json enfermedades_renales_data
        boolean otros
        json otros_data
        integer id_paciente
    }

    ANTECEDENTES_PERSONALES {
        boolean hipertension_arterial
        json hipertension_arterial_data
        boolean diabetes_mellitus
        json diabetes_mellitus_data
        boolean hipotiroidismo
        json hipotiroidismo_data
        boolean asma
        json asma_data
        boolean convulsiones
        json convulsiones_data
        boolean infarto_agudo_miocardio
        json infarto_agudo_miocardio_data
        boolean cancer
        json cancer_data
        boolean enfermedades_cardiacas
        json enfermedades_cardiacas_data
        boolean enfermedades_renales
        json enfermedades_renales_data
        boolean otros
        json otros_data
        integer id_paciente
    }

    ANTECEDENTES_ALERGICOS {
        boolean medicamento
        json medicamento_data
        boolean comida
        json comida_data
        boolean polvo
        json polvo_data
        boolean polen
        json polen_data
        boolean cambio_de_clima
        json cambio_de_clima_data
        boolean animales
        json animales_data
        boolean otros
        json otros_data
        integer id_paciente

    }

    ANTECEDENTES_QUIRURGICOS {
        boolean antecedente_quirurgico
        json antecedente_quirurgico_data
        integer id_paciente

    }

    ANTECEDENTES_TRAUMATOLOGICOS {
        boolean antecedente_traumatologico
        json antecedente_traumatologico_data
        integer id_paciente

    }

    ANTECEDENTES_PSIQUIATRICOS {
        boolean depresion
        json depresion_data
        boolean ansiedad
        json ansiedad_data
        boolean toc
        json toc_data
        boolean tdah
        json tdah_data
        boolean bipolaridad
        json bipolaridad_data
        boolean otro
        json otro_data
        integer id_paciente

    }

    ANTECEDENTES_GINECOOBSTETRICOS {
        integer edad_primera_menstruacion
        boolean ciclos_regulares
        boolean menstruacion_dolorosa
        json menstruacion_dolorosa_data
        integer num_embarazos
        integer num_partos
        integer num_cesareas
        integer num_abortos
        boolean histerectomia
        json complicacion_histerectomia
        boolean cirujia
        json complicacion_cirujia
        boolean quistes_ovaricos
        json complicacion_quistes
        boolean reseccion_masas
        json complicacion_reseccion
        boolean miomatosis
        json complicacion_miomatosis
        boolean endometriosis
        json complicacion_endometriosis
        integer id_paciente
    }

    ANTECEDENTES_NO_PATOLOGICOS {
        varchar tipo_sangre
        boolean fuma
        json fuma_data
        boolean bebidas_alcoholicas
        json bebidas_alcoholicas_data
        boolean drogas
        json drogas
        integer id_paciente
    }

    USUARIO {
        varchar email
        varchar tipo
    }

    SESION {
        varchar     token
        timestamp   created
        varchar     email
    }

    BITACORA {
        timestamp fecha
        varchar usuario
        varchar accion
        varchar tabla
        varchar id
    }

    PACIENTE ||--|| SEGURO: ""
    PACIENTE ||--|{ CONSULTA: ""
    PACIENTE ||--|{ ESTUDIANTE: ""
    PACIENTE ||--|{ COLABORADOR: ""
    PACIENTE ||--|| ANTECEDENTES_FAMILIARES: ""
    PACIENTE ||--|| ANTECEDENTES_PERSONALES: ""
    PACIENTE ||--|| ANTECEDENTES_ALERGICOS: ""
    PACIENTE ||--|| ANTECEDENTES_QUIRURGICOS: ""
    PACIENTE ||--|| ANTECEDENTES_TRAUMATOLOGICOS: ""
    PACIENTE ||--|| ANTECEDENTES_PSIQUIATRICOS: ""
    PACIENTE ||--|| ANTECEDENTES_GINECOOBSTETRICOS: ""
    PACIENTE ||--|| ANTECEDENTES_NO_PATOLOGICOS: ""

    CONSULTA ||--|{ DIAGNOSTICO: ""
    CONSULTA ||--|{ MEDICAMENTO: ""

    USUARIO ||--o{ SESION: ""
    USUARIO ||--|{ CONSULTA: ""
```

## Registro de Antecedentes

Como se puede ver en el diagrama de arriba los antecedentes tienen varios tipos,
cada tipo es una tabla y cada columna de la tabla representa una subsección que se
realiza en el formulario de ingreso, estas subsecciones se basan en las tablas
del [documento dado por las
doctoras](https://docs.google.com/document/d/1a8_8ttHOb4EbQKosgHKt-BNi6O9dTE_Z/edit?usp=sharing&ouid=101365484409367835585&rtpof=true&sd=true).

Debido a que la data de estas subsecciones puede variar grandemente con el
tiempo se decidió junto con los ingenieros César Vinicio y Marvin Raúl
guardarlos en formato JSON. Cada registro JSON tiene una propiedad JSON dentro
de sí que detalla qué versión de la estructura es, la documentación de cada
versión se encuentra a continuación.

### Antecedentes Familiares

Los antecedentes familiares se organizan por tipo de condición médica. Cada
condición se almacena en un objeto JSON que lista los familiares afectados,
permitiendo una rápida actualización y mantenimiento de los datos.

```json
{
  "medicalHistory": {
    "hypertension": {
      "version": 1,
      "data": ["Father", "Mother"]
    },
    "diabetesMellitus": {
      "version": 1,
      "data": ["Mother", "Brother"]
    },
    "hypothyroidism": {
      "version": 1,
      "data": ["Grandmother"]
    },
    "asthma": {
      "version": 1,
      "data": []
    },
    "convulsions": {
      "version": 1,
      "data": ["Uncle"]
    },
    "myocardialInfarction": {
      "version": 1,
      "data": []
    },
    "cancer": {
      "version": 1,
      "data": [
        {
          "who": "Mother",
          "typeOfCancer": "Breast"
        }
      ]
    },
    "cardiacDiseases": {
      "version": 1,
      "data": [
        {
          "who": "Father",
          "typeOfDisease": "Hypertrophy"
        }
      ]
    },
    "renalDiseases": {
      "version": 1,
      "data": [
        {
          "who": "Grandfather",
          "typeOfDisease": "Renal Failure"
        }
      ]
    },
    "others": {
      "version": 1,
      "data": [
        {
          "who": "Brother",
          "disease": "Psoriasis"
        }
      ]
    }
  }
}
```

#### Versiones

- Versión 1: La versión 1 contiene una propiedad `data` que son arrays de la
  forma:

  - hypertension, diabetesMellitus, hypothyroidism, asthma, convulsions,
    myocardialInfarction: Array\[String\], cada elemento es un familiar afectado.

  ```json
  ["String", "String"]
  ```

  - cancer, cardiacDiseases, renalDiseases, others: Array de objetos. Cada
    objeto puede contener:

    - who: String, especifica quién en la familia tiene la condición.
    - typeOfCancer, typeOfDisease, disease: String, especifica el tipo de
      cáncer, enfermedad cardíaca, enfermedad renal o cualquier otra condición.

    ```json
    [
      {
        "who": "String",
        "typeOfCancer": "String"
      }
    ]
    ```

### Antecedentes Personales

Los antecedentes personales se organizan por tipo de condición médica. Al igual
que los antecedentes familiares cada condición se almacena en un objeto JSON que
lista los datos requeridos según la condición.

```json
{
  "patientId": "1",
  "medicalHistory": {
    "hypertension": {
      "version": 1,
      "data": [
        {
          "medicine": "Medicina random 1",
          "dose": "5ml",
          "frequency": "3 veces al día"
        },
        {
          "medicine": "Medicina random 2",
          "dose": "10ml",
          "frequency": "Una vez al día"
        }
      ]
    },
    "diabetesMellitus": {
      "version": 1,
      "data": [
        {
          "medicine": "Medicina random 4",
          "dose": "2 pastillas",
          "frequency": "Cada 8 horas"
        }
      ]
    },
    "hypothyroidism": {
      "version": 1,
      "data": [
        {
          "medicine": "Medicina random 4",
          "dose": "2 pastillas",
          "frequency": "Cada 8 horas"
        }
      ]
    },
    "asthma": {
      "version": 1,
      "data": [
        {
          "medicine": "Medicina random 4",
          "dose": "2 pastillas",
          "frequency": "Cada 8 horas"
        }
      ]
    },
    "convulsions": {
      "version": 1,
      "data": [
        {
          "medicine": "Medicina random 4",
          "dose": "2 pastillas",
          "frequency": "Cada 8 horas"
        }
      ]
    },
    "myocardialInfarction": {
      "version": 1,
      "data": [
        2012,
        2016
      ]
    },
    "cancer": {
      "version": 1,
      "data": [
        {
          "typeOfCancer": "Breast",
          "treatment": "Operation"
        }
      ]
    },
    "cardiacDiseases": {
      "version": 1,
      "data": [
        {
          "typeOfDisease": "Hypertrophy",
          "medicine": "Medicina random 5",
          "dose": "5ml",
          "frequency": "1 vez al día"
        },
        {
          "typeOfDisease": "Hypertrophy 2",
          "medicine": "Medicina random 5",
          "dose": "5ml",
          "frequency": "1 vez al día"
        }
      ]
    },
    "renalDiseases": {
      "version": 1,
      "data": [
        {
          "typeOfDisease": "Hypertrophy 2",
          "medicine": "Medicina random 5",
          "dose": "5ml",
          "frequency": "1 vez al día"
        },
        {
          "typeOfDisease": "Hypertrophy 2",
          "medicine": "Medicina random 5",
          "dose": "5ml",
          "frequency": "1 vez al día"
        }
      ]
    },
    "others": {
      "version": 1,
      "data": [
        {
          "typeOfDisease": "Hypertrophy 2",
          "medicine": "Medicina random 5",
          "dose": "5ml",
          "frequency": "1 vez al día"
        }
      ]
    }
  }
}
```

<!-- markdownlint-disable MD024 -->

#### Versiones

<!-- markdownlint-enable MD024 -->

- Versión 1: La versión 1 contiene una propiedad `data` que es un array con
  elementos con forma dependiendo de la pregunta.

  - Las condiciones: Hipertensión arterial, Diabetes Mellitus,
    Hipotiroidismo, Asma y Convulsiones tienen la siguiente forma:

  ```json
  {
    "medicine": "String",
    "dose": "String",
    "frequency": "String"
  }
  ```

  - Mientras el cáncer tiene la forma:

  ```json
  {
    "typeOfCancer": "String",
    "treatment": "String"
  }
  ```

  - El infarto agudo de miocardio tiene la forma:

  ```json
  2012, 2016
  ```

  - Por último enfermedades cardíacas, enfermedades renales y otros tienen la
    forma:

  ```json
  {
    "typeOfDisease": "String",
    "medicine": "String",
    "dose": "String",
    "frequency": "String"
  }
  ```

### Antecedentes Traumatológicos

Los registros de antecedentes traumatológicos se almacenan en formato JSON.
Cada registro detalla el tipo de trauma, el año de ocurrencia y el
tratamiento administrado, lo que facilita la actualización y el mantenimiento
de los datos.

```json
{
  "medicalHistory": {
    "traumas": {
      "version": 1,
      "data": [
        {
          "whichBone": "Femur",
          "year": "2023",
          "treatment": "Surgery"
        }
      ]
    }
  }
}
```

<!-- markdownlint-disable MD024 -->

#### Versiones

<!-- markdownlint-enable MD024 -->

- Versión 1: La versión 1 contiene una propiedad `data` que es un array de
  objetos de la forma:

  - whichBone: String, indica qué hueso fue afectado.
  - year: String, año en que ocurrió el trauma.
  - treatment: String, tratamiento recibido.

  ```json
  [
    {
      "whichBone": "Femur",
      "year": "2023",
      "treatment": "Surgery"
    }
  ]
  ```

### Antecedentes Alérgicos

Los antecedentes alérgicos se organizan por tipo de alergia.
Cada tipo de alergia se almacena en un objeto JSON que lista
los datos requeridos según la alergia.

```json
{
  "medicalHistory": {
    "medication": {
      "version": 1,
      "data": [
        {
          "allergy": "Penicillin",
          "reaction": "Rash",
          "severity": "Mild"
        }
      ]
    },
    "food": {
      "version": 1,
      "data": [
        {
          "allergy": "Peanuts",
          "reaction": "Anaphylaxis",
          "severity": "Severe"
        }
      ]
    },
    "dust": {
      "version": 1,
      "data": [
        {
          "reaction": "Sneezing",
          "severity": "Mild"
        }
      ]
    },
    "pollen": {
      "version": 1,
      "data": [
        {
          "reaction": "Itchy eyes",
          "severity": "Moderate"
        }
      ]
    },
    "climateChange": {
      "version": 1,
      "data": [
        {
          "reaction": "Asthma attack",
          "severity": "Severe"
        }
      ]
    },
    "animals": {
      "version": 1,
      "data": [
        {
          "allergy": "Cat dander",
          "reaction": "Hives",
          "severity": "Moderate"
        }
      ]
    },
    "others": {
      "version": 1,
      "data": [
        {
          "allergy": "Latex",
          "reaction": "Contact dermatitis",
          "severity": "Mild"
        }
      ]
    }
  }
}
```

<!-- markdownlint-disable MD024 -->

#### Versiones

<!-- markdownlint-enable MD024 -->

- Versión 1: La versión 1 contiene una propiedad `data` que es
  un array de objetos con la siguiente forma:

  - medication, food, animals, dust, pollen, climateChange y others:

  ```json
  {
    "allergy": "String",
    "reaction": "String",
    "severity": "String"
  }
  ```

### Antecedentes Psiquiátricos

Los antecedentes psiquiátricos se organizan por tipo de condición psiquiátrica. Cada tipo de condición se almacena en un objeto JSON que lista los datos requeridos según la condición.

```json
{
  "medicalHistory": {
    "depression": {
      "version": 1,
      "data": [
        {
          "description": "Major depressive disorder",
          "treatment": "Cognitive behavioral therapy",
          "duration": "6 months"
        }
      ]
    },
    "anxiety": {
      "version": 1,
      "data": [
        {
          "description": "Generalized anxiety disorder",
          "treatment": "Medication and relaxation techniques",
          "duration": "Ongoing"
        }
      ]
    },
    "ocd": {
      "version": 1,
      "data": []
    },
    "adhd": {
      "version": 1,
      "data": []
    },
    "bipolar": {
      "version": 1,
      "data": [
        {
          "description": "Bipolar disorder type II",
          "medication": "Lithium",
          "frequency": "Daily"
        }
      ]
    },
    "other": {
      "version": 1,
      "data": []
    }
  }
}
```
<!-- markdownlint-disable MD024 -->

#### Versiones

<!-- markdownlint-enable MD024 -->

- Versión 1: La versión 1 contiene una propiedad `data` que es un array de objetos con la siguiente forma:

- depression, anxiety, bipolar, ocd, adhd y other:

```json
{
  "description": "String",
  "treatment": "String",
  "duration": "String"
}

### Antecedentes Ginecoobstetricos

### Antecedentes no Patológicos
