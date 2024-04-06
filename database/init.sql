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
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

-- SESION table
CREATE TABLE sesion (
    token VARCHAR(600) PRIMARY KEY,
    username VARCHAR(255) REFERENCES usuario (username),
    created TIMESTAMP NOT NULL
);

-- CONTACTO_EMERGENCIA table
CREATE TABLE contacto_emergencia (
    id_contacto SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    parentesco VARCHAR(255) NOT NULL,
    telefono VARCHAR(255) NOT NULL
);

-- PACIENTE table
CREATE TABLE paciente (
    carnet VARCHAR(255) PRIMARY KEY,
    es_estudiante BOOLEAN NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    sexo CHAR NOT NULL,
    correo VARCHAR(255) NOT NULL,
    telefono VARCHAR(255) NOT NULL,
    seguro VARCHAR(255) NOT NULL,
    carrera_o_dept VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    tipo_sangre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    nota_importante TEXT,
    contacto_emergencia_1 INT REFERENCES contacto_emergencia (id_contacto),
    contacto_emergencia_2 INT REFERENCES contacto_emergencia (id_contacto)
);

-- TIPO_ANTECEDENTE table
CREATE TABLE tipo_antecedente (
    id_tipo SERIAL PRIMARY KEY,
    descripcion VARCHAR(1000) NOT NULL
);

-- ANTECEDENTE table
CREATE TABLE antecedente (
    id_antecedente SERIAL PRIMARY KEY,
    tipo INT REFERENCES tipo_antecedente (id_tipo),
    descripcion VARCHAR(5000) NOT NULL
);

-- ANTECEDENTE_PACIENTE table
CREATE TABLE antecedente_paciente (
    id_antecedente_paciente SERIAL PRIMARY KEY,
    paciente VARCHAR(255) REFERENCES paciente (carnet),
    antecedente INT REFERENCES antecedente (id_antecedente),
    fecha_inicio DATE NOT NULL
);
-- TRATAMIENTO table
CREATE TABLE tratamiento (
    id_tratamiento SERIAL PRIMARY KEY,
    descripcion VARCHAR(5000) NOT NULL
);

-- DETALLE_FARMACOLOGIA table
CREATE TABLE detalle_farmacologia (
    id_detalle_farmacologia SERIAL PRIMARY KEY,
    dosis DOUBLE PRECISION NOT NULL,
    unidad_dosis VARCHAR(255) NOT NULL,
    frecuencia_dosis INTEGER NOT NULL
);

-- TRATAMIENTO_ANTECEDENTE table
CREATE TABLE tratamiento_antecedente (
    antecedente_paciente INT PRIMARY KEY REFERENCES antecedente_paciente (
        id_antecedente_paciente
    ),
    tratamiento INT REFERENCES tratamiento (id_tratamiento),
    detalle_farmacologia INT REFERENCES detalle_farmacologia (
        id_detalle_farmacologia
    )
);

-- EXAMEN_FISICO table
CREATE TABLE examen_fisico (
    id_examen_fisico SERIAL PRIMARY KEY,
    descripcion VARCHAR(6000) NOT NULL,
    frecuencia_respiratoria INTEGER NOT NULL,
    temperatura DOUBLE PRECISION NOT NULL,
    saturacion_oxigeno INTEGER NOT NULL,
    glucometria INTEGER NOT NULL,
    frecuencia_cardiaca INTEGER NOT NULL,
    presion_arterial INTEGER NOT NULL
);

-- VISITA table
CREATE TABLE visita (
    id_visita SERIAL PRIMARY KEY,
    paciente VARCHAR(255) REFERENCES paciente (carnet),
    motivo VARCHAR(5000) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    diagnostico TEXT,
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
    edicion VARCHAR(1000) NOT NULL,
    fecha TIMESTAMP NOT NULL
);

-- RESPUESTA_FORMULARIO table
CREATE TABLE respuesta_formulario (
    formulario INT REFERENCES formulario (id_formulario),
    paciente VARCHAR(255) REFERENCES paciente (carnet),
    fecha TIMESTAMP NOT NULL
);

-- PRIVILEGIO table
CREATE TABLE privilegio (
    id_privilegio SERIAL PRIMARY KEY,
    privilegio VARCHAR(255) NOT NULL
);

-- PRIVILEGIO_USUARIO table
CREATE TABLE privilegio_usuario (
    privilegio_usuario INT REFERENCES privilegio (id_privilegio),
    username VARCHAR(255) REFERENCES usuario (username)
);
