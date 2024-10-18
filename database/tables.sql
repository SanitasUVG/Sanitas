CREATE TABLE USUARIO (
    EMAIL VARCHAR(50) PRIMARY KEY NOT NULL,
    TIPO VARCHAR(20) NOT NULL
);

CREATE TABLE PACIENTE (
    ID SERIAL PRIMARY KEY,
    CUI VARCHAR(24) UNIQUE NOT NULL,
    CORREO VARCHAR(50),
    ES_MUJER BOOLEAN NOT NULL,
    NOMBRES VARCHAR(50) NOT NULL,
    APELLIDOS VARCHAR(50) NOT NULL,
    NOMBRE_CONTACTO1 VARCHAR(50),
    PARENTESCO_CONTACTO1 VARCHAR(24),
    TELEFONO_CONTACTO1 VARCHAR(20),
    NOMBRE_CONTACTO2 VARCHAR(50),
    PARENTESCO_CONTACTO2 VARCHAR(24),
    TELEFONO_CONTACTO2 VARCHAR(20),
    TIPO_SANGRE VARCHAR(3),
    DIRECCION VARCHAR(100),
    SEGURO VARCHAR(30),
    FECHA_NACIMIENTO DATE NOT NULL,
    TELEFONO VARCHAR(20)
);
CREATE UNIQUE INDEX PACIENTE_CUI_IDX ON PACIENTE (CUI);
COMMENT ON TABLE PACIENTE IS
'This table is used to save general information about a patient.';

CREATE TABLE CUENTA_PACIENTE (
    EMAIL VARCHAR(50) PRIMARY KEY,
    CUI_PACIENTE VARCHAR(24) NOT NULL UNIQUE REFERENCES PACIENTE (CUI)
);
COMMENT ON TABLE CUENTA_PACIENTE IS
'Used to save the relation between a cognito account and a patient';

CREATE TABLE DOCTOR (
    EMAIL VARCHAR(100) NOT NULL PRIMARY KEY
);
COMMENT ON TABLE DOCTOR IS
'Used for saving all user emails that have the role of a doctor.';


CREATE TABLE ESTUDIANTE (
    CARNET VARCHAR(20) PRIMARY KEY NOT NULL,
    CARRERA VARCHAR(50),
    ID_PACIENTE INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID)
);

CREATE TABLE COLABORADOR (
    CODIGO VARCHAR(20) PRIMARY KEY NOT NULL,
    AREA VARCHAR(50) NOT NULL,
    ID_PACIENTE INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID)
);

CREATE TABLE CONSULTA (
    ID SERIAL PRIMARY KEY NOT NULL,
    ID_PACIENTE INTEGER NOT NULL,
    FECHA TIMESTAMP NOT NULL,
    MOTIVO TEXT NOT NULL,
    DIAGNOSTICO TEXT NOT NULL,
    EXAMEN_FISICO TEXT NOT NULL,
    FRECUENCIA_RESPIRATORIA VARCHAR(10),
    TEMPERATURA DOUBLE PRECISION,
    SATURACION_OXIGENO DOUBLE PRECISION,
    GLUCOMETRIA DOUBLE PRECISION,
    FRECUENCIA_CARDIACA DOUBLE PRECISION,
    PRESION_SISTOLICA INTEGER,
    PRESION_DIASTOLICA INTEGER,
    EVALUADOR VARCHAR(50) NOT NULL,
    MEDICAMENTOS_DATA JSON,
    NOTAS TEXT,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID),
    FOREIGN KEY (EVALUADOR) REFERENCES USUARIO (EMAIL)
);

CREATE TABLE DIAGNOSTICO (
    ID SERIAL PRIMARY KEY NOT NULL,
    ID_CONSULTA INTEGER NOT NULL,
    NOMBRE VARCHAR(50) NOT NULL,
    TRATAMIENTO TEXT,
    FOREIGN KEY (ID_CONSULTA) REFERENCES CONSULTA (ID)
);

CREATE TABLE MEDICAMENTO (
    ID SERIAL PRIMARY KEY NOT NULL,
    NOMBRE VARCHAR(50) NOT NULL,
    CANTIDAD INTEGER,
    ID_CONSULTA INTEGER NOT NULL,
    FOREIGN KEY (ID_CONSULTA) REFERENCES CONSULTA (ID)
);

CREATE TABLE ANTECEDENTES_FAMILIARES (
    ID_PACIENTE INTEGER PRIMARY KEY NOT NULL,
    HIPERTENSION_ARTERIAL BOOLEAN,
    HIPERTENSION_ARTERIAL_DATA JSON,
    DIABETES_MELLITUS BOOLEAN,
    DIABETES_MELLITUS_DATA JSON,
    HIPOTIROIDISMO BOOLEAN,
    HIPOTIROIDISMO_DATA JSON,
    ASMA BOOLEAN,
    ASMA_DATA JSON,
    CONVULSIONES BOOLEAN,
    CONVULSIONES_DATA JSON,
    INFARTO_AGUDO_MIOCARDIO BOOLEAN,
    INFARTO_AGUDO_MIOCARDIO_DATA JSON,
    CANCER BOOLEAN,
    CANCER_DATA JSON,
    ENFERMEDADES_CARDIACAS BOOLEAN,
    ENFERMEDADES_CARDIACAS_DATA JSON,
    ENFERMEDADES_RENALES BOOLEAN,
    ENFERMEDADES_RENALES_DATA JSON,
    OTROS BOOLEAN,
    OTROS_DATA JSON,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID)
);

CREATE TABLE ANTECEDENTES_PERSONALES (
    ID_PACIENTE INTEGER PRIMARY KEY NOT NULL,
    HIPERTENSION_ARTERIAL BOOLEAN,
    HIPERTENSION_ARTERIAL_DATA JSON,
    DIABETES_MELLITUS BOOLEAN,
    DIABETES_MELLITUS_DATA JSON,
    HIPOTIROIDISMO BOOLEAN,
    HIPOTIROIDISMO_DATA JSON,
    ASMA BOOLEAN,
    ASMA_DATA JSON,
    CONVULSIONES BOOLEAN,
    CONVULSIONES_DATA JSON,
    INFARTO_AGUDO_MIOCARDIO BOOLEAN,
    INFARTO_AGUDO_MIOCARDIO_DATA JSON,
    CANCER BOOLEAN,
    CANCER_DATA JSON,
    ENFERMEDADES_CARDIACAS BOOLEAN,
    ENFERMEDADES_CARDIACAS_DATA JSON,
    ENFERMEDADES_RENALES BOOLEAN,
    ENFERMEDADES_RENALES_DATA JSON,
    OTROS BOOLEAN,
    OTROS_DATA JSON,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID)
);

CREATE TABLE ANTECEDENTES_ALERGICOS (
    ID_PACIENTE INTEGER PRIMARY KEY NOT NULL,
    MEDICAMENTO BOOLEAN,
    MEDICAMENTO_DATA JSON,
    COMIDA BOOLEAN,
    COMIDA_DATA JSON,
    POLVO BOOLEAN,
    POLVO_DATA JSON,
    POLEN BOOLEAN,
    POLEN_DATA JSON,
    CAMBIO_DE_CLIMA BOOLEAN,
    CAMBIO_DE_CLIMA_DATA JSON,
    ANIMALES BOOLEAN,
    ANIMALES_DATA JSON,
    OTROS BOOLEAN,
    OTROS_DATA JSON,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID)
);

CREATE TABLE ANTECEDENTES_QUIRURGICOS (
    ID_PACIENTE INTEGER PRIMARY KEY NOT NULL,
    ANTECEDENTE_QUIRURGICO BOOLEAN,
    ANTECEDENTE_QUIRURGICO_DATA JSON,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID)
);

CREATE TABLE ANTECEDENTES_TRAUMATOLOGICOS (
    ID_PACIENTE INTEGER PRIMARY KEY NOT NULL,
    ANTECEDENTE_TRAUMATOLOGICO BOOLEAN,
    ANTECEDENTE_TRAUMATOLOGICO_DATA JSON,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID)
);

CREATE TABLE ANTECEDENTES_PSIQUIATRICOS (
    ID_PACIENTE INTEGER PRIMARY KEY NOT NULL,
    DEPRESION BOOLEAN,
    DEPRESION_DATA JSON,
    ANSIEDAD BOOLEAN,
    ANSIEDAD_DATA JSON,
    TOC BOOLEAN,
    TOC_DATA JSON,
    TDAH BOOLEAN,
    TDAH_DATA JSON,
    BIPOLARIDAD BOOLEAN,
    BIPOLARIDAD_DATA JSON,
    OTRO BOOLEAN,
    OTRO_DATA JSON,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID)
);

CREATE TABLE ANTECEDENTES_GINECOOBSTETRICOS (
    ID_PACIENTE INTEGER PRIMARY KEY NOT NULL,
    EDAD_PRIMERA_MENSTRUACION BOOLEAN,
    EDAD_PRIMERA_MENSTRUACION_DATA JSON,
    CICLOS_REGULARES BOOLEAN,
    CICLOS_REGULARES_DATA JSON,
    MENSTRUACION_DOLOROSA BOOLEAN,
    MENSTRUACION_DOLOROSA_DATA JSON,
    NUM_EMBARAZOS INTEGER,
    NUM_PARTOS INTEGER,
    NUM_CESAREAS INTEGER,
    NUM_ABORTOS INTEGER,
    MEDICACION_QUISTES_OVARICOS BOOLEAN,
    MEDICACION_QUISTES_OVARICOS_DATA JSON,
    MEDICACION_MIOMATOSIS BOOLEAN,
    MEDICACION_MIOMATOSIS_DATA JSON,
    MEDICACION_ENDOMETRIOSIS BOOLEAN,
    MEDICACION_ENDOMETRIOSIS_DATA JSON,
    MEDICACION_OTRA_CONDICION BOOLEAN,
    MEDICACION_OTRA_CONDICION_DATA JSON,
    CIRUGIA_QUISTES_OVARICOS BOOLEAN,
    CIRUGIA_QUISTES_OVARICOS_DATA JSON,
    CIRUGIA_HISTERECTOMIA BOOLEAN,
    CIRUGIA_HISTERECTOMIA_DATA JSON,
    CIRUGIA_ESTERILIZACION BOOLEAN,
    CIRUGIA_ESTERILIZACION_DATA JSON,
    CIRUGIA_RESECCION_MASAS BOOLEAN,
    CIRUGIA_RESECCION_MASAS_DATA JSON,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID)
);

CREATE TABLE ANTECEDENTES_NO_PATOLOGICOS (
    ID_PACIENTE INTEGER PRIMARY KEY NOT NULL,
    TIPO_SANGRE VARCHAR(3) NOT NULL,
    FUMA BOOLEAN,
    FUMA_DATA JSON,
    BEBIDAS_ALCOHOLICAS BOOLEAN,
    BEBIDAS_ALCOHOLICAS_DATA JSON,
    DROGAS BOOLEAN,
    DROGAS_DATA JSON,
    FOREIGN KEY (ID_PACIENTE) REFERENCES PACIENTE (ID)
);

CREATE TABLE SESION (
    TOKEN VARCHAR(100) PRIMARY KEY NOT NULL,
    CREATED TIMESTAMP NOT NULL,
    EMAIL VARCHAR(50) NOT NULL,
    FOREIGN KEY (EMAIL) REFERENCES USUARIO (EMAIL)
);

CREATE TABLE BITACORA (
    FECHA TIMESTAMP NOT NULL,
    USUARIO VARCHAR(50) NOT NULL,
    ACCION VARCHAR(50) NOT NULL,
    TABLA VARCHAR(50) NOT NULL,
    ID_REGISTRO VARCHAR(50) NOT NULL
);
