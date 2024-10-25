DROP TABLE IF EXISTS md_san.paciente;
CREATE TABLE md_san.paciente (
    id SERIAL PRIMARY KEY,
    cui VARCHAR(24) UNIQUE NOT NULL,
    correo VARCHAR(50),
    es_mujer BOOLEAN NOT NULL,
    nombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    nombre_contacto1 VARCHAR(50),
    parentesco_contacto1 VARCHAR(24),
    telefono_contacto1 VARCHAR(20),
    nombre_contacto2 VARCHAR(50),
    parentesco_contacto2 VARCHAR(24),
    telefono_contacto2 VARCHAR(20),
    tipo_sangre VARCHAR(3),
    direccion VARCHAR(100),
    seguro VARCHAR(30),
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20)
);
DROP INDEX IF EXISTS paciente_cui_idx;
CREATE UNIQUE INDEX paciente_cui_idx ON md_san.paciente (cui);
COMMENT ON TABLE md_san.paciente IS
'This table is used to save general information about a patient.';

DROP TABLE IF EXISTS md_san.cuenta_paciente;
CREATE TABLE md_san.cuenta_paciente (
    email VARCHAR(50) PRIMARY KEY,
    cui_paciente VARCHAR(24) NOT NULL UNIQUE REFERENCES md_san.paciente (cui)
);
COMMENT ON TABLE md_san.cuenta_paciente IS
'Used to save the relation between a cognito account and a patient';

DROP TABLE IF EXISTS md_san.doctor;
CREATE TABLE md_san.doctor (
    email VARCHAR(100) NOT NULL PRIMARY KEY
);
COMMENT ON TABLE md_san.doctor IS
'Used for saving all user emails that have the role of a doctor.';

DROP TABLE IF EXISTS md_san.estudiante;
CREATE TABLE md_san.estudiante (
    carnet VARCHAR(20) PRIMARY KEY NOT NULL,
    carrera VARCHAR(50),
    id_paciente INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

DROP TABLE IF EXISTS md_san.colaborador;
CREATE TABLE md_san.colaborador (
    codigo VARCHAR(20) PRIMARY KEY NOT NULL,
    area VARCHAR(50) NOT NULL,
    id_paciente INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

DROP TABLE IF EXISTS md_san.consulta;
CREATE TABLE md_san.consulta (
    id SERIAL PRIMARY KEY NOT NULL,
    id_paciente INTEGER NOT NULL,
    fecha TIMESTAMP NOT NULL,
    motivo TEXT NOT NULL,
    diagnostico TEXT NOT NULL,
    examen_fisico TEXT NOT NULL,
    frecuencia_respiratoria DOUBLE PRECISION,
    temperatura DOUBLE PRECISION,
    saturacion_oxigeno DOUBLE PRECISION,
    glucometria DOUBLE PRECISION,
    frecuencia_cardiaca DOUBLE PRECISION,
    presion_sistolica INTEGER,
    presion_diastolica INTEGER,
    evaluador VARCHAR(50) NOT NULL,
    medicamentos_data JSON,
    notas TEXT,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

DROP TABLE IF EXISTS md_san.diagnostico;
CREATE TABLE md_san.diagnostico (
    id SERIAL PRIMARY KEY NOT NULL,
    id_consulta INTEGER NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    tratamiento TEXT,
    FOREIGN KEY (id_consulta) REFERENCES md_san.consulta (id)
);

DROP TABLE IF EXISTS md_san.medicamento;
CREATE TABLE md_san.medicamento (
    id SERIAL PRIMARY KEY NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    cantidad INTEGER,
    id_consulta INTEGER NOT NULL,
    FOREIGN KEY (id_consulta) REFERENCES md_san.consulta (id)
);

DROP TABLE IF EXISTS md_san.antecedentes_familiares;
CREATE TABLE md_san.antecedentes_familiares (
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    hipertension_arterial BOOLEAN,
    hipertension_arterial_data JSON,
    diabetes_mellitus BOOLEAN,
    diabetes_mellitus_data JSON,
    hipotiroidismo BOOLEAN,
    hipotiroidismo_data JSON,
    asma BOOLEAN,
    asma_data JSON,
    convulsiones BOOLEAN,
    convulsiones_data JSON,
    infarto_agudo_miocardio BOOLEAN,
    infarto_agudo_miocardio_data JSON,
    cancer BOOLEAN,
    cancer_data JSON,
    enfermedades_cardiacas BOOLEAN,
    enfermedades_cardiacas_data JSON,
    enfermedades_renales BOOLEAN,
    enfermedades_renales_data JSON,
    otros BOOLEAN,
    otros_data JSON,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

DROP TABLE IF EXISTS md_san.antecedentes_personales;
CREATE TABLE md_san.antecedentes_personales (
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    hipertension_arterial BOOLEAN,
    hipertension_arterial_data JSON,
    diabetes_mellitus BOOLEAN,
    diabetes_mellitus_data JSON,
    hipotiroidismo BOOLEAN,
    hipotiroidismo_data JSON,
    asma BOOLEAN,
    asma_data JSON,
    convulsiones BOOLEAN,
    convulsiones_data JSON,
    infarto_agudo_miocardio BOOLEAN,
    infarto_agudo_miocardio_data JSON,
    cancer BOOLEAN,
    cancer_data JSON,
    enfermedades_cardiacas BOOLEAN,
    enfermedades_cardiacas_data JSON,
    enfermedades_renales BOOLEAN,
    enfermedades_renales_data JSON,
    otros BOOLEAN,
    otros_data JSON,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

DROP TABLE IF EXISTS md_san.antecedentes_alergicos;
CREATE TABLE md_san.antecedentes_alergicos (
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    medicamento BOOLEAN,
    medicamento_data JSON,
    comida BOOLEAN,
    comida_data JSON,
    polvo BOOLEAN,
    polvo_data JSON,
    polen BOOLEAN,
    polen_data JSON,
    cambio_de_clima BOOLEAN,
    cambio_de_clima_data JSON,
    animales BOOLEAN,
    animales_data JSON,
    otros BOOLEAN,
    otros_data JSON,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

DROP TABLE IF EXISTS md_san.antecedentes_quirurgicos;
CREATE TABLE md_san.antecedentes_quirurgicos (
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    antecedente_quirurgico BOOLEAN,
    antecedente_quirurgico_data JSON,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

DROP TABLE IF EXISTS md_san.antecedentes_traumatologicos;
CREATE TABLE md_san.antecedentes_traumatologicos (
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    antecedente_traumatologico BOOLEAN,
    antecedente_traumatologico_data JSON,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

DROP TABLE IF EXISTS md_san.antecedentes_psiquiatricos;
CREATE TABLE md_san.antecedentes_psiquiatricos (
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    depresion BOOLEAN,
    depresion_data JSON,
    ansiedad BOOLEAN,
    ansiedad_data JSON,
    toc BOOLEAN,
    toc_data JSON,
    tdah BOOLEAN,
    tdah_data JSON,
    bipolaridad BOOLEAN,
    bipolaridad_data JSON,
    otro BOOLEAN,
    otro_data JSON,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

DROP TABLE IF EXISTS md_san.antecedentes_ginecoobstetricos;
CREATE TABLE md_san.antecedentes_ginecoobstetricos (
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    edad_primera_menstruacion BOOLEAN,
    edad_primera_menstruacion_data JSON,
    ciclos_regulares BOOLEAN,
    ciclos_regulares_data JSON,
    menstruacion_dolorosa BOOLEAN,
    menstruacion_dolorosa_data JSON,
    num_embarazos INTEGER,
    num_partos INTEGER,
    num_cesareas INTEGER,
    num_abortos INTEGER,
    medicacion_quistes_ovaricos BOOLEAN,
    medicacion_quistes_ovaricos_data JSON,
    medicacion_miomatosis BOOLEAN,
    medicacion_miomatosis_data JSON,
    medicacion_endometriosis BOOLEAN,
    medicacion_endometriosis_data JSON,
    medicacion_otra_condicion BOOLEAN,
    medicacion_otra_condicion_data JSON,
    cirugia_quistes_ovaricos BOOLEAN,
    cirugia_quistes_ovaricos_data JSON,
    cirugia_histerectomia BOOLEAN,
    cirugia_histerectomia_data JSON,
    cirugia_esterilizacion BOOLEAN,
    cirugia_esterilizacion_data JSON,
    cirugia_reseccion_masas BOOLEAN,
    cirugia_reseccion_masas_data JSON,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

DROP TABLE IF EXISTS md_san.antecedentes_no_patologicos;
CREATE TABLE md_san.antecedentes_no_patologicos (
    id_paciente INTEGER PRIMARY KEY NOT NULL,
    tipo_sangre VARCHAR(3) NOT NULL,
    fuma BOOLEAN,
    fuma_data JSON,
    bebidas_alcoholicas BOOLEAN,
    bebidas_alcoholicas_data JSON,
    drogas BOOLEAN,
    drogas_data JSON,
    FOREIGN KEY (id_paciente) REFERENCES md_san.paciente (id)
);

CREATE MATERIALIZED VIEW md_san.stats
AS
SELECT
    p.id,
    p.fecha_nacimiento,
    c.fecha AS fecha_visita,
    c.diagnostico,
    es.carrera,
    CASE
        WHEN p.es_mujer = true THEN 'F'
        ELSE 'M'
    END AS sexo,
    COALESCE(es.id_paciente, 0) AS es_estudiante,
    COALESCE(co.id_paciente, 0) AS es_colaborador,
    COALESCE(
        es.id_paciente IS null AND co.id_paciente IS null, false
    ) AS es_visita
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
