DROP TABLE IF EXISTS md_san.paciente;
CREATE TABLE md_san.paciente (
    id SERIAL PRIMARY KEY, -- Identificador único del paciente
    cui VARCHAR(24) UNIQUE NOT NULL, -- Código único de identificación
    correo VARCHAR(50), -- Correo electrónico del paciente
    es_mujer BOOLEAN NOT NULL, -- Indica si el paciente es mujer
    nombres VARCHAR(50) NOT NULL, -- Nombres del paciente
    apellidos VARCHAR(50) NOT NULL, -- Apellidos del paciente
    nombre_contacto1 VARCHAR(50), -- Nombre del primer contacto
    parentesco_contacto1 VARCHAR(24), -- Parentesco del primer contacto
    telefono_contacto1 VARCHAR(20), -- Teléfono del primer contacto
    nombre_contacto2 VARCHAR(50), -- Nombre del segundo contacto
    parentesco_contacto2 VARCHAR(24), -- Parentesco del segundo contacto
    telefono_contacto2 VARCHAR(20), -- Teléfono del segundo contacto
    tipo_sangre VARCHAR(3), -- Tipo de sangre del paciente
    direccion VARCHAR(100), -- Dirección del paciente
    seguro VARCHAR(30), -- Información del seguro del paciente
    fecha_nacimiento DATE NOT NULL, -- Fecha de nacimiento del paciente
    telefono VARCHAR(20) -- Teléfono del paciente
);
DROP INDEX IF EXISTS paciente_cui_idx;
CREATE UNIQUE INDEX paciente_cui_idx ON md_san.paciente (cui);
COMMENT ON TABLE md_san.paciente IS
'Esta tabla se utiliza para guardar información general sobre un paciente.';

DROP TABLE IF EXISTS md_san.cuenta_paciente;
CREATE TABLE md_san.cuenta_paciente (
    email VARCHAR(50) PRIMARY KEY, -- Correo electrónico de la cuenta
    -- Código único del paciente
    cui_paciente VARCHAR(24) NOT NULL UNIQUE REFERENCES md_san.paciente (cui)
);
COMMENT ON TABLE md_san.cuenta_paciente IS
'Se utiliza para guardar la relación entre una cuenta cognito y un paciente.';

DROP TABLE IF EXISTS md_san.doctor;
CREATE TABLE md_san.doctor (
    email VARCHAR(100) NOT NULL PRIMARY KEY -- Correo electrónico del médico
);
COMMENT ON TABLE md_san.doctor IS
'Se utiliza para guardar todos los correos electrónicos de los usuarios
que tienen el rol de médico.';

DROP TABLE IF EXISTS md_san.estudiante;
CREATE TABLE md_san.estudiante (
    -- Identificador único del estudiante
    carnet VARCHAR(20) PRIMARY KEY NOT NULL,
    carrera VARCHAR(100), -- Carrera del estudiante
    id_paciente INTEGER NOT NULL UNIQUE, -- Identificador único del paciente
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.estudiante IS
'Esta tabla almacena información sobre los estudiantes y su relación
con los pacientes.';

DROP TABLE IF EXISTS md_san.colaborador;
CREATE TABLE md_san.colaborador (
    codigo VARCHAR(20) PRIMARY KEY NOT NULL, -- Código único del colaborador
    area VARCHAR(100) NOT NULL, -- Área de trabajo del colaborador
    id_paciente INTEGER NOT NULL UNIQUE, -- Identificador único del paciente
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.colaborador IS
'Esta tabla almacena información sobre los colaboradores y su relación
con los pacientes.';

DROP TABLE IF EXISTS md_san.consulta;
CREATE TABLE md_san.consulta (
    id SERIAL PRIMARY KEY NOT NULL, -- Identificador único de la consulta
    id_paciente INTEGER NOT NULL, -- Identificador único del paciente
    fecha TIMESTAMP NOT NULL, -- Fecha y hora de la consulta
    motivo TEXT NOT NULL, -- Motivo de la consulta
    diagnostico TEXT NOT NULL, -- Diagnóstico realizado
    examen_fisico TEXT NOT NULL, -- Resultados del examen físico
    -- Frecuencia respiratoria del paciente
    frecuencia_respiratoria DOUBLE PRECISION,
    temperatura DOUBLE PRECISION, -- Temperatura del paciente
    saturacion_oxigeno DOUBLE PRECISION, -- Saturación de oxígeno
    glucometria DOUBLE PRECISION, -- Niveles de glucosa
    frecuencia_cardiaca DOUBLE PRECISION, -- Frecuencia cardíaca
    presion_sistolica INTEGER, -- Presión sistólica
    presion_diastolica INTEGER, -- Presión diastólica
    evaluador VARCHAR(50) NOT NULL, -- Nombre del evaluador
    medicamentos_data JSON, -- Datos sobre medicamentos prescritos
    notas TEXT, -- Notas adicionales
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.consulta IS
'Esta tabla guarda información sobre las consultas realizadas
a los pacientes.';

DROP TABLE IF EXISTS md_san.diagnostico;
CREATE TABLE md_san.diagnostico (
    id SERIAL PRIMARY KEY NOT NULL, -- Identificador único del diagnóstico
    id_consulta INTEGER NOT NULL, -- Identificador único de la consulta
    nombre VARCHAR(50) NOT NULL, -- Nombre del diagnóstico
    tratamiento TEXT, -- Tratamiento recomendado
    FOREIGN KEY (id_consulta)
    REFERENCES md_san.consulta (id)
);
COMMENT ON TABLE md_san.diagnostico IS
'Esta tabla almacena los diagnósticos realizados durante las consultas.';

DROP TABLE IF EXISTS md_san.medicamento;
CREATE TABLE md_san.medicamento (
    id SERIAL PRIMARY KEY NOT NULL, -- Identificador único del medicamento
    nombre VARCHAR(50) NOT NULL, -- Nombre del medicamento
    cantidad INTEGER, -- Cantidad prescrita
    id_consulta INTEGER NOT NULL, -- Identificador único de la consulta
    FOREIGN KEY (id_consulta)
    REFERENCES md_san.consulta (id)
);
COMMENT ON TABLE md_san.medicamento IS
'Esta tabla guarda información sobre los medicamentos prescritos
durante las consultas.';

DROP TABLE IF EXISTS md_san.antecedentes_familiares;
CREATE TABLE md_san.antecedentes_familiares (
    -- Identificador único del paciente
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    hipertension_arterial BOOLEAN, -- Indica si hay hipertensión arterial
    hipertension_arterial_data JSON, -- Datos sobre hipertensión arterial
    diabetes_mellitus BOOLEAN, -- Indica si hay diabetes mellitus
    diabetes_mellitus_data JSON, -- Datos sobre diabetes mellitus
    hipotiroidismo BOOLEAN, -- Indica si hay hipotiroidismo
    hipotiroidismo_data JSON, -- Datos sobre hipotiroidismo
    asma BOOLEAN, -- Indica si hay asma
    asma_data JSON, -- Datos sobre asma
    convulsiones BOOLEAN, -- Indica si hay convulsiones
    convulsiones_data JSON, -- Datos sobre convulsiones
    infarto_agudo_miocardio BOOLEAN, -- Indica si hay infarto agudo de miocardio
    infarto_agudo_miocardio_data JSON, -- Datos sobre infarto agudo de miocardio
    cancer BOOLEAN, -- Indica si hay cáncer
    cancer_data JSON, -- Datos sobre cáncer
    enfermedades_cardiacas BOOLEAN, -- Indica si hay enfermedades cardíacas
    enfermedades_cardiacas_data JSON, -- Datos sobre enfermedades cardíacas
    enfermedades_renales BOOLEAN, -- Indica si hay enfermedades renales
    enfermedades_renales_data JSON, -- Datos sobre enfermedades renales
    otros BOOLEAN, -- Indica si hay otros antecedentes
    otros_data JSON, -- Datos sobre otros antecedentes
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.antecedentes_familiares IS
'Esta tabla almacena antecedentes familiares de los pacientes.';

DROP TABLE IF EXISTS md_san.antecedentes_personales;
CREATE TABLE md_san.antecedentes_personales (
    -- Identificador único del paciente
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    hipertension_arterial BOOLEAN, -- Indica si hay hipertensión arterial
    hipertension_arterial_data JSON, -- Datos sobre hipertensión arterial
    diabetes_mellitus BOOLEAN, -- Indica si hay diabetes mellitus
    diabetes_mellitus_data JSON, -- Datos sobre diabetes mellitus
    hipotiroidismo BOOLEAN, -- Indica si hay hipotiroidismo
    hipotiroidismo_data JSON, -- Datos sobre hipotiroidismo
    asma BOOLEAN, -- Indica si hay asma
    asma_data JSON, -- Datos sobre asma
    convulsiones BOOLEAN, -- Indica si hay convulsiones
    convulsiones_data JSON, -- Datos sobre convulsiones
    infarto_agudo_miocardio BOOLEAN, -- Indica si hay infarto agudo de miocardio
    infarto_agudo_miocardio_data JSON, -- Datos sobre infarto agudo de miocardio
    cancer BOOLEAN, -- Indica si hay cáncer
    cancer_data JSON, -- Datos sobre cáncer
    enfermedades_cardiacas BOOLEAN, -- Indica si hay enfermedades cardíacas
    enfermedades_cardiacas_data JSON, -- Datos sobre enfermedades cardíacas
    enfermedades_renales BOOLEAN, -- Indica si hay enfermedades renales
    enfermedades_renales_data JSON, -- Datos sobre enfermedades renales
    otros BOOLEAN, -- Indica si hay otros antecedentes
    otros_data JSON, -- Datos sobre otros antecedentes
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.antecedentes_personales IS
'Esta tabla guarda antecedentes personales de los pacientes.';

DROP TABLE IF EXISTS md_san.antecedentes_alergicos;
CREATE TABLE md_san.antecedentes_alergicos (
    -- Identificador único del paciente
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    medicamento BOOLEAN, -- Indica si hay alergia a medicamentos
    medicamento_data JSON, -- Datos sobre alergia a medicamentos
    comida BOOLEAN, -- Indica si hay alergia a comida
    comida_data JSON, -- Datos sobre alergia a comida
    polvo BOOLEAN, -- Indica si hay alergia al polvo
    polvo_data JSON, -- Datos sobre alergia al polvo
    polen BOOLEAN, -- Indica si hay alergia al polen
    polen_data JSON, -- Datos sobre alergia al polen
    cambio_de_clima BOOLEAN, -- Indica si hay alergia al cambio de clima
    cambio_de_clima_data JSON, -- Datos sobre alergia al cambio de clima
    animales BOOLEAN, -- Indica si hay alergia a animales
    animales_data JSON, -- Datos sobre alergia a animales
    otros BOOLEAN, -- Indica si hay otras alergias
    otros_data JSON, -- Datos sobre otras alergias
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.antecedentes_alergicos IS
'Esta tabla almacena información sobre alergias de los pacientes.';

DROP TABLE IF EXISTS md_san.antecedentes_quirurgicos;
CREATE TABLE md_san.antecedentes_quirurgicos (
    -- Identificador único del paciente
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    antecedente_quirurgico BOOLEAN, -- Indica si hay antecedentes quirúrgicos
    antecedente_quirurgico_data JSON, -- Datos sobre antecedentes quirúrgicos
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.antecedentes_quirurgicos IS
'Esta tabla guarda información sobre antecedentes quirúrgicos
de los pacientes.';

DROP TABLE IF EXISTS md_san.antecedentes_traumatologicos;
CREATE TABLE md_san.antecedentes_traumatologicos (
    -- Identificador único del paciente
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    -- Indica si hay antecedentes traumatológicos
    antecedente_traumatologico BOOLEAN,
    -- Datos sobre antecedentes traumatológicos
    antecedente_traumatologico_data JSON,
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.antecedentes_traumatologicos IS
'Esta tabla almacena antecedentes traumatológicos de los pacientes.';

DROP TABLE IF EXISTS md_san.antecedentes_psiquiatricos;
CREATE TABLE md_san.antecedentes_psiquiatricos (
    -- Identificador único del paciente
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    depresion BOOLEAN, -- Indica si hay depresión
    depresion_data JSON, -- Datos sobre depresión
    ansiedad BOOLEAN, -- Indica si hay ansiedad
    ansiedad_data JSON, -- Datos sobre ansiedad
    toc BOOLEAN, -- Indica si hay trastorno obsesivo-compulsivo
    toc_data JSON, -- Datos sobre trastorno obsesivo-compulsivo
    tdah BOOLEAN, -- Indica si hay TDAH
    tdah_data JSON, -- Datos sobre TDAH
    bipolaridad BOOLEAN, -- Indica si hay bipolaridad
    bipolaridad_data JSON, -- Datos sobre bipolaridad
    otro BOOLEAN, -- Indica si hay otros antecedentes psiquiátricos
    otro_data JSON, -- Datos sobre otros antecedentes psiquiátricos
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.antecedentes_psiquiatricos IS
'Esta tabla guarda información sobre antecedentes psiquiátricos
de los pacientes.';

DROP TABLE IF EXISTS md_san.antecedentes_ginecoobstetricos;
CREATE TABLE md_san.antecedentes_ginecoobstetricos (
    -- Identificador único del paciente
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    -- Indica si hay información sobre la edad de la primera menstruación
    edad_primera_menstruacion BOOLEAN,
    -- Datos sobre la edad de la primera menstruación
    edad_primera_menstruacion_data JSON,
    ciclos_regulares BOOLEAN, -- Indica si los ciclos son regulares
    ciclos_regulares_data JSON, -- Datos sobre ciclos regulares
    menstruacion_dolorosa BOOLEAN, -- Indica si hay menstruación dolorosa
    menstruacion_dolorosa_data JSON, -- Datos sobre menstruación dolorosa
    num_embarazos INTEGER, -- Número de embarazos
    num_partos INTEGER, -- Número de partos
    num_cesareas INTEGER, -- Número de cesáreas
    num_abortos INTEGER, -- Número de abortos
    -- Indica si hay medicación para quistes ováricos
    medicacion_quistes_ovaricos BOOLEAN,
    -- Datos sobre medicación para quistes ováricos
    medicacion_quistes_ovaricos_data JSON,
    medicacion_miomatosis BOOLEAN, -- Indica si hay medicación para miomatosis
    medicacion_miomatosis_data JSON, -- Datos sobre medicación para miomatosis
    -- Indica si hay medicación para endometriosis
    medicacion_endometriosis BOOLEAN,
    -- Datos sobre medicación para endometriosis
    medicacion_endometriosis_data JSON,
    -- Indica si hay medicación para otra condición
    medicacion_otra_condicion BOOLEAN,
    -- Datos sobre medicación para otra condición
    medicacion_otra_condicion_data JSON,
    -- Indica si hay cirugía para quistes ováricos
    cirugia_quistes_ovaricos BOOLEAN,
    -- Datos sobre cirugía para quistes ováricos
    cirugia_quistes_ovaricos_data JSON,
    cirugia_histerectomia BOOLEAN, -- Indica si hay cirugía de histerectomía
    cirugia_histerectomia_data JSON, -- Datos sobre cirugía de histerectomía
    cirugia_esterilizacion BOOLEAN, -- Indica si hay cirugía de esterilización
    cirugia_esterilizacion_data JSON, -- Datos sobre cirugía de esterilización
    -- Indica si hay cirugía de resección de masas
    cirugia_reseccion_masas BOOLEAN,
    -- Datos sobre cirugía de resección de masas
    cirugia_reseccion_masas_data JSON,
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.antecedentes_ginecoobstetricos IS
'Esta tabla almacena antecedentes ginecoobstétricos de las pacientes.';

DROP TABLE IF EXISTS md_san.antecedentes_no_patologicos;
CREATE TABLE md_san.antecedentes_no_patologicos (
    -- Identificador único del paciente
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    tipo_sangre VARCHAR(3) NOT NULL, -- Tipo de sangre del paciente
    fuma BOOLEAN, -- Indica si fuma
    fuma_data JSON, -- Datos sobre el hábito de fumar
    bebidas_alcoholicas BOOLEAN, -- Indica si consume bebidas alcohólicas
    -- Datos sobre el consumo de bebidas alcohólicas
    bebidas_alcoholicas_data JSON,
    drogas BOOLEAN, -- Indica si consume drogas
    drogas_data JSON, -- Datos sobre el consumo de drogas
    FOREIGN KEY (id_paciente)
    REFERENCES md_san.paciente (id)
);
COMMENT ON TABLE md_san.antecedentes_no_patologicos IS
'Esta tabla guarda información sobre antecedentes no patológicos
de los pacientes.';

CREATE MATERIALIZED VIEW md_san.stats
AS
SELECT
    p.id,
    c.evaluador,
    p.fecha_nacimiento,
    c.fecha AS fecha_visita,
    c.diagnostico,
    es.carrera,
    CASE
        WHEN p.es_mujer = true THEN 'F'
        ELSE 'M'
    END AS sexo,
    es.id_paciente IS NOT null AS es_estudiante,
    co.id_paciente IS NOT null AS es_colaborador,
    es.id_paciente IS null AND co.id_paciente IS null AS es_visita
FROM
    md_san.consulta AS c
INNER JOIN md_san.paciente AS p
    ON
        c.id_paciente = p.id
LEFT JOIN md_san.estudiante AS es
    ON
        c.id_paciente = es.id_paciente
LEFT JOIN md_san.colaborador AS co ON
    c.id_paciente = co.id_paciente;

INSERT INTO md_san.doctor (email) VALUES
('mlgalvan@uvg.edu.gt'),
('jmbustamante@uvg.edu.gt');
