CREATE ROLE postgres WITH LOGIN SUPERUSER;

CREATE DATABASE sanitas;
\c sanitas postgres;

CREATE USER root WITH PASSWORD 'root';
GRANT ALL PRIVILEGES ON DATABASE sanitas TO root;

CREATE USER backend WITH PASSWORD 'backend';
REVOKE ALL ON DATABASE sanitas FROM backend;
GRANT CONNECT ON DATABASE sanitas TO backend;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO backend;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO backend;


-- USUARIO table
CREATE TABLE usuario (
    username VARCHAR(16) PRIMARY KEY,
    password VARCHAR(64) NOT NULL
);

-- SESION table
CREATE TABLE sesion (
    token VARCHAR(128) PRIMARY KEY,
    username VARCHAR(16) REFERENCES usuario (username) NOT NULL,
    created TIMESTAMP NOT NULL
);

-- PARENTESCO table
CREATE TABLE parentesco (
    id_parentesco SERIAL PRIMARY KEY,
    nombre VARCHAR(16) NOT NULL
);

-- CONTACTO_EMERGENCIA table
CREATE TABLE contacto_emergencia (
    id_contacto SERIAL PRIMARY KEY,
    nombre VARCHAR(64) NOT NULL,
    parentesco INT REFERENCES parentesco (id_parentesco) NOT NULL,
    telefono VARCHAR(16) NOT NULL
);

-- PACIENTE table 
CREATE TABLE paciente (
    carnet VARCHAR(10) PRIMARY KEY,
    es_estudiante BOOLEAN NOT NULL,
    nombres VARCHAR(64) NOT NULL,
    apellidos VARCHAR(64) NOT NULL,
    sexo CHAR NOT NULL,
    correo VARCHAR(255) NOT NULL,
    telefono VARCHAR(16) NOT NULL,
    seguro VARCHAR(32) NOT NULL,
    carrera_o_dept VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    tipo_sangre INT REFERENCES tipo_sangre (
        id_tipo_sangre
    ) NOT NULL,
    direccion TEXT NOT NULL,
    nota_importante TEXT,
    contacto_emergencia_1 INT REFERENCES contacto_emergencia (
        id_contacto
    ) NOT NULL,
    contacto_emergencia_2 INT REFERENCES contacto_emergencia (id_contacto)
);
-- TIPO_SANGRE table
CREATE TABLE tipo_sangre (
    id_tipo_sangre INT PRIMARY KEY,
    tipo_sangre VARCHAR(3)
);

-- TIPO_ANTECEDENTE table
CREATE TABLE tipo_antecedente (
    id_tipo SERIAL PRIMARY KEY,
    nombre VARCHAR(64) NOT NULL
);

-- ANTECEDENTE table
CREATE TABLE antecedente (
    id_antecedente SERIAL PRIMARY KEY,
    tipo INT REFERENCES tipo_antecedente (id_tipo) NOT NULL,
    descripcion VARCHAR(128) NOT NULL
);

-- ANTECEDENTE_PACIENTE table
CREATE TABLE antecedente_paciente (
    id_antecedente_paciente SERIAL PRIMARY KEY,
    paciente VARCHAR(10) REFERENCES paciente (carnet) NOT NULL,
    antecedente INT REFERENCES antecedente (id_antecedente) NOT NULL,
    fecha_inicio DATE NOT NULL
);

-- TRATAMIENTO table
CREATE TABLE tratamiento (
    id_tratamiento SERIAL PRIMARY KEY,
    nombre VARCHAR(64) NOT NULL
);

-- DETALLE_FARMACOLOGIA table
CREATE TABLE detalle_farmacologia (
    id_detalle_farmacologia SERIAL PRIMARY KEY,
    dosis DOUBLE PRECISION NOT NULL,
    unidad_dosis VARCHAR(32) NOT NULL,
    frecuencia_dosis INTEGER NOT NULL
);

-- TRATAMIENTO_ANTECEDENTE table
CREATE TABLE tratamiento_antecedente_paciente (
    antecedente_paciente INT REFERENCES antecedente_paciente (
        id_antecedente_paciente
    ) NOT NULL,
    tratamiento INT REFERENCES tratamiento (id_tratamiento) NOT NULL,
    detalle_farmacologia INT REFERENCES detalle_farmacologia (
        id_detalle_farmacologia
    )
);

-- EXAMEN_FISICO table
CREATE TABLE examen_fisico (
    id_examen_fisico SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    frecuencia_respiratoria INTEGER,
    temperatura DOUBLE PRECISION,
    saturacion_oxigeno INTEGER,
    glucometria INTEGER,
    frecuencia_cardiaca INTEGER,
    presion_arterial INTEGER
);

-- VISITA table
CREATE TABLE visita (
    id_visita SERIAL PRIMARY KEY,
    paciente VARCHAR(10) REFERENCES paciente (carnet),
    motivo TEXT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    diagnostico TEXT NOT NULL,
    referencia TEXT,
    examen_fisico INT REFERENCES examen_fisico (id_examen_fisico)
);

-- TRATAMIENTO_VISITA table
CREATE TABLE tratamiento_visita (
    visita INT REFERENCES visita (id_visita),
    tratamiento INT REFERENCES tratamiento (id_tratamiento),
    detalle_farmacologia INT REFERENCES detalle_farmacologia (
        id_detalle_farmacologia
    )
);

-- FORMULARIO table
CREATE TABLE formulario (
    id_formulario SERIAL PRIMARY KEY,
    edicion VARCHAR(16) NOT NULL,
    fecha TIMESTAMP NOT NULL
);

-- RESPUESTA_FORMULARIO table
CREATE TABLE respuesta_formulario (
    formulario INT REFERENCES formulario (id_formulario) NOT NULL,
    paciente VARCHAR(10) REFERENCES paciente (carnet) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PRIVILEGIO table
CREATE TABLE privilegio (
    id_privilegio SERIAL PRIMARY KEY,
    privilegio VARCHAR(255) NOT NULL
);

-- PRIVILEGIO_USUARIO table
CREATE TABLE privilegio_usuario (
    privilegio INT REFERENCES privilegio (id_privilegio) NOT NULL,
    username VARCHAR(16) REFERENCES usuario (username) NOT NULL
);
