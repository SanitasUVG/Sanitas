INSERT INTO USUARIO (EMAIL, TIPO) VALUES
('admin@example.com', 'Administrador'),
('doctor1@example.com', 'Doctor'),
('doctor2@example.com', 'Doctor');

INSERT INTO SESION (TOKEN, CREATED, EMAIL) VALUES
('token1234', NOW(), 'admin@example.com'),
('token2345', NOW(), 'doctor1@example.com');

INSERT INTO PACIENTE (
    CUI,
    CORREO,
    ES_MUJER,
    NOMBRES,
    APELLIDOS,
    NOMBRE_CONTACTO1,
    PARENTESCO_CONTACTO1,
    TELEFONO_CONTACTO1,
    NOMBRE_CONTACTO2,
    PARENTESCO_CONTACTO2,
    TELEFONO_CONTACTO2,
    TIPO_SANGRE,
    DIRECCION,
    SEGURO,
    FECHA_NACIMIENTO,
    TELEFONO
) VALUES
(
    '1234567890123',
    'juan.perez@example.com',
    FALSE,
    'Juan',
    'López Pérez',
    'Maria Pérez',
    'Madre',
    '987654321',
    'Jose Pérez',
    'Padre',
    '987650123',
    'O+',
    'Calle Falsa 123, Ciudad',
    'El Roble',
    '1990-01-01',
    '1234567890'
),
(
    '2345678901234',
    'maria.lopez@example.com',
    TRUE,
    'María',
    'López',
    'Ana López',
    'Hermana',
    '876543219',
    'Carlos López',
    'Hermano',
    '876540123',
    'A-',
    'Avenida Siempre Viva 456, Ciudad',
    'IGSS',
    '1992-02-02',
    '2345678901'
);

INSERT INTO CONSULTA (
    ID_PACIENTE,
    FECHA,
    MOTIVO,
    DIAGNOSTICO,
    EXAMEN_FISICO,
    FRECUENCIA_RESPIRATORIA,
    TEMPERATURA,
    SATURACION_OXIGENO,
    GLUCOMETRIA,
    FRECUENCIA_CARDIACA,
    PRESION_SISTOLICA,
    PRESION_DIASTOLICA,
    EVALUADOR,
    MEDICAMENTOS_DATA,
    NOTAS
) VALUES
(
    1,
    NOW(),
    'Chequeo anual',
    'Hipertensión leve',
    'Examen físico normal, con excepción de presión arterial elevada',
    16,
    36.5,
    98.5,
    5.6,
    70,
    120,
    80,
    'doctor1@example.com',
    '[
        {
            "diagnosis": "Hipertensión leve",
            "medication": "Lisinopril",
            "quantity": "30"
        }
    ]',
    'El paciente debe realizar un seguimiento en 3 meses.'
),
(
    2,
    NOW() - interval '2 days',
    'Consulta de seguimiento',
    'Diabetes tipo 2 controlada',
    'Paciente estable, sin signos de complicaciones',
    18,
    37.2,
    97.5,
    4.8,
    75,
    130,
    85,
    'doctor2@example.com',
    '[
        {
            "diagnosis": "Diabetes tipo 2 controlada",
            "medication": "Metformina",
            "quantity": "30"
        }
    ]',
    'Se ajustó la dosis de insulina y se recomienda seguir con el tratamiento
     actual.'
);


INSERT INTO ESTUDIANTE (CARNET, CARRERA, ID_PACIENTE) VALUES
('A01234567', 'Ingeniería en CC y TI', 1);

INSERT INTO COLABORADOR (CODIGO, AREA, ID_PACIENTE) VALUES
('C001', 'Administración', 2);

INSERT INTO DOCTOR (EMAIL) VALUES ('doctor@gmail.com');
