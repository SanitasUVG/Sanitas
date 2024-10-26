INSERT INTO md_san.paciente (
    cui,
    correo,
    es_mujer,
    nombres,
    apellidos,
    nombre_contacto1,
    parentesco_contacto1,
    telefono_contacto1,
    nombre_contacto2,
    parentesco_contacto2,
    telefono_contacto2,
    tipo_sangre,
    direccion,
    seguro,
    fecha_nacimiento,
    telefono
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

INSERT INTO md_san.consulta (
    id_paciente,
    fecha,
    motivo,
    diagnostico,
    examen_fisico,
    frecuencia_respiratoria,
    temperatura,
    saturacion_oxigeno,
    glucometria,
    frecuencia_cardiaca,
    presion_sistolica,
    presion_diastolica,
    evaluador,
    medicamentos_data,
    notas
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

INSERT INTO md_san.estudiante (carnet, carrera, id_paciente) VALUES
('A01234567', 'Ingeniería en CC y TI', 1);

INSERT INTO md_san.colaborador (codigo, area, id_paciente) VALUES
('C001', 'Administración', 2);

INSERT INTO md_san.doctor (email) VALUES ('doctor@gmail.com');
