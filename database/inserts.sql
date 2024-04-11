INSERT INTO usuario (username, password) VALUES ('admin', 'adminpass');
INSERT INTO usuario (username, password) VALUES ('doctor1', 'doc123');
INSERT INTO usuario (username, password) VALUES ('enfermero1', 'enf123');
INSERT INTO usuario (username, password) VALUES ('gestor', 'gestorpass');
INSERT INTO usuario (username, password) VALUES ('paciente1', 'pac123');

INSERT INTO sesion (token, username, created) VALUES ('token1234', 'admin', NOW());
INSERT INTO sesion (token, username, created) VALUES ('token2345', 'doctor1', NOW() - interval '1 day');
INSERT INTO sesion (token, username, created) VALUES ('token3456', 'enfermero1', NOW() - interval '2 days');
INSERT INTO sesion (token, username, created) VALUES ('token4567', 'gestor', NOW() - interval '3 days');
INSERT INTO sesion (token, username, created) VALUES ('token5678', 'paciente1', NOW() - interval '4 days');

INSERT INTO parentesco (nombre) VALUES ('Padre');
INSERT INTO parentesco (nombre) VALUES ('Madre');
INSERT INTO parentesco (nombre) VALUES ('Hermano/a');
INSERT INTO parentesco (nombre) VALUES ('Amigo/a');
INSERT INTO parentesco (nombre) VALUES ('Tío/a');


INSERT INTO contacto_emergencia (nombre, parentesco, telefono) VALUES ('Jose Perez', 1, '12345678');
INSERT INTO contacto_emergencia (nombre, parentesco, telefono) VALUES ('Maria Lopez', 2, '87654321');
INSERT INTO contacto_emergencia (nombre, parentesco, telefono) VALUES ('Carlos Jimenez', 3, '11223344');
INSERT INTO contacto_emergencia (nombre, parentesco, telefono) VALUES ('Ana Torres', 4, '44332211');
INSERT INTO contacto_emergencia (nombre, parentesco, telefono) VALUES ('Luisa Fernández', 5, '55667788');

INSERT INTO tipo_sangre (id_tipo_sangre, tipo_sangre) VALUES (1, 'A+');
INSERT INTO tipo_sangre (id_tipo_sangre, tipo_sangre) VALUES (2, 'O-');
INSERT INTO tipo_sangre (id_tipo_sangre, tipo_sangre) VALUES (3, 'B+');
INSERT INTO tipo_sangre (id_tipo_sangre, tipo_sangre) VALUES (4, 'AB+');
INSERT INTO tipo_sangre (id_tipo_sangre, tipo_sangre) VALUES (5, 'O+');

INSERT INTO paciente (carnet, es_estudiante, nombres, apellidos, sexo, correo, telefono, seguro, carrera_o_dept, fecha_nacimiento, tipo_sangre, direccion, nota_importante, contacto_emergencia_1, contacto_emergencia_2) VALUES ('1234567890', TRUE, 'Juan', 'Pérez', 'M', 'juan.perez@example.com', '12345678', 'Seguro1', 'Ingeniería', '1995-01-01', 1, 'Calle 123, Ciudad', 'Alergias: ninguna', 1, 2);
INSERT INTO paciente (carnet, es_estudiante, nombres, apellidos, sexo, correo, telefono, seguro, carrera_o_dept, fecha_nacimiento, tipo_sangre, direccion, nota_importante, contacto_emergencia_1, contacto_emergencia_2) VALUES ('2345678901', FALSE, 'María', 'Luna', 'F', 'maria.luna@example.com', '87654321', 'Seguro2', 'Administración', '1990-02-02', 2, 'Avenida 456, Ciudad', 'Alergias: penicilina', 3, 4);
INSERT INTO paciente (carnet, es_estudiante, nombres, apellidos, sexo, correo, telefono, seguro, carrera_o_dept, fecha_nacimiento, tipo_sangre, direccion, nota_importante, contacto_emergencia_1) VALUES ('3456789012', TRUE, 'Carlos', 'Sol', 'M', 'carlos.sol@example.com', '11223344', 'Seguro3', 'Medicina', '1993-03-03', 3, 'Boulevard 789, Ciudad', 'Ninguna nota importante', 5);
INSERT INTO paciente (carnet, es_estudiante, nombres, apellidos, sexo, correo, telefono, seguro, carrera_o_dept, fecha_nacimiento, tipo_sangre, direccion, nota_importante, contacto_emergencia_1) VALUES ('4567890123', FALSE, 'Ana', 'Estrella', 'F', 'ana.estrella@example.com', '44332211', 'Seguro4', 'Derecho', '1988-04-04', 4, 'Pasaje 012, Ciudad', 'Requiere asistencia especial', 1);
INSERT INTO paciente (carnet, es_estudiante, nombres, apellidos, sexo, correo, telefono, seguro, carrera_o_dept, fecha_nacimiento, tipo_sangre, direccion, contacto_emergencia_1) VALUES ('5678901234', TRUE, 'Pedro', 'Galaxia', 'M', 'pedro.galaxia@example.com', '55667788', 'Seguro5', 'Arquitectura', '1996-05-05', 5, 'Callejón 345, Ciudad', 2);

INSERT INTO tipo_antecedente (nombre) VALUES ('Alergia');
INSERT INTO tipo_antecedente (nombre) VALUES ('Cirugía');
INSERT INTO tipo_antecedente (nombre) VALUES ('Fractura');
INSERT INTO tipo_antecedente (nombre) VALUES ('Enfermedad crónica');
INSERT INTO tipo_antecedente (nombre) VALUES ('Hospitalización');

INSERT INTO antecedente (tipo, descripcion) VALUES (1, 'Alergia a la penicilina');
INSERT INTO antecedente (tipo, descripcion) VALUES (2, 'Cirugía de apendicitis');
INSERT INTO antecedente (tipo, descripcion) VALUES (3, 'Fractura de brazo izquierdo');
INSERT INTO antecedente (tipo, descripcion) VALUES (4, 'Diabetes Tipo 2');
INSERT INTO antecedente (tipo, descripcion) VALUES (5, 'Hospitalización por neumonía');

INSERT INTO antecedente_paciente (paciente, antecedente, fecha_inicio) VALUES ('1234567890', 1, '2010-01-01');
INSERT INTO antecedente_paciente (paciente, antecedente, fecha_inicio) VALUES ('2345678901', 2, '2015-02-15');
INSERT INTO antecedente_paciente (paciente, antecedente, fecha_inicio) VALUES ('3456789012', 3, '2020-03-15');
INSERT INTO antecedente_paciente (paciente, antecedente, fecha_inicio) VALUES ('3456789012', 4, '2020-04-25');
INSERT INTO antecedente_paciente (paciente, antecedente, fecha_inicio) VALUES ('3456789012', 5, '2020-05-13');

INSERT INTO tratamiento (nombre) VALUES ('Analgésico');
INSERT INTO tratamiento (nombre) VALUES ('Antibiótico');
INSERT INTO tratamiento (nombre) VALUES ('Antihistamínico');
INSERT INTO tratamiento (nombre) VALUES ('Antiinflamatorio');
INSERT INTO tratamiento (nombre) VALUES ('Anticoagulante');



INSERT INTO detalle_farmacologia (dosis, unidad_dosis, frecuencia_dosis) VALUES (500, 'mg', 1);
INSERT INTO detalle_farmacologia (dosis, unidad_dosis, frecuencia_dosis) VALUES (250, 'mg', 2);
INSERT INTO detalle_farmacologia (dosis, unidad_dosis, frecuencia_dosis) VALUES (100, 'mg', 3);
INSERT INTO detalle_farmacologia (dosis, unidad_dosis, frecuencia_dosis) VALUES (50, 'mg', 4);
INSERT INTO detalle_farmacologia (dosis, unidad_dosis, frecuencia_dosis) VALUES (10, 'mg', 6);


INSERT INTO tratamiento_antecedente_paciente (antecedente_paciente, tratamiento, detalle_farmacologia) VALUES (1, 1, 1);
INSERT INTO tratamiento_antecedente_paciente (antecedente_paciente, tratamiento, detalle_farmacologia) VALUES (2, 2, 2);
INSERT INTO tratamiento_antecedente_paciente (antecedente_paciente, tratamiento, detalle_farmacologia) VALUES (3, 3, 3);
INSERT INTO tratamiento_antecedente_paciente (antecedente_paciente, tratamiento, detalle_farmacologia) VALUES (4, 4, 4);
INSERT INTO tratamiento_antecedente_paciente (antecedente_paciente, tratamiento, detalle_farmacologia) VALUES (5, 5, 5);



INSERT INTO examen_fisico (descripcion, frecuencia_respiratoria, temperatura, saturacion_oxigeno, glucometria, frecuencia_cardiaca, presion_arterial) VALUES ('Paciente presenta tos seca.', 20, 37.2, 98, 110, 75, 120);
INSERT INTO examen_fisico (descripcion, frecuencia_respiratoria, temperatura, saturacion_oxigeno, glucometria, frecuencia_cardiaca, presion_arterial) VALUES ('Paciente sin alteraciones.', 18, 36.5, 99, 90, 70, 110);
INSERT INTO examen_fisico (descripcion, frecuencia_respiratoria, temperatura, saturacion_oxigeno, glucometria, frecuencia_cardiaca, presion_arterial) VALUES ('Paciente con dolor en el pecho.', 22, 38.0, 97, 95, 80, 130);
INSERT INTO examen_fisico (descripcion, frecuencia_respiratoria, temperatura, saturacion_oxigeno, glucometria, frecuencia_cardiaca, presion_arterial) VALUES ('Paciente presenta dificultad para respirar.', 25, 37.8, 96, 120, 85, 140);
INSERT INTO examen_fisico (descripcion, frecuencia_respiratoria, temperatura, saturacion_oxigeno, glucometria, frecuencia_cardiaca, presion_arterial) VALUES ('Paciente con mareos y sudoración.', 20, 36.7, 98, 100, 75, 115);

INSERT INTO visita (paciente, motivo, fecha, diagnostico, referencia, examen_fisico) VALUES ('1234567890', 'Consulta por dolor abdominal.', '2024-04-09 10:00:00', 'Gastritis aguda', NULL, 1);
INSERT INTO visita (paciente, motivo, fecha, diagnostico, referencia, examen_fisico) VALUES ('2345678901', 'Seguimiento por diabetes tipo 2.', '2024-04-09 11:15:00', 'Control de glucosa en sangre', NULL, 2);
INSERT INTO visita (paciente, motivo, fecha, diagnostico, referencia, examen_fisico) VALUES ('3456789012', 'Dolor en el pecho intenso.', '2024-04-10 09:30:00', 'Infarto de miocardio', 'Referido a servicio de cardiología.', 3);
INSERT INTO visita (paciente, motivo, fecha, diagnostico, referencia, examen_fisico) VALUES ('4567890123', 'Dificultad respiratoria.', '2024-04-11 14:45:00', 'Neumonía', NULL, 4);
INSERT INTO visita (paciente, motivo, fecha, diagnostico, referencia, examen_fisico) VALUES ('5678901234', 'Mareos y sudoración.', '2024-04-12 08:00:00', 'Crisis hipertensiva', 'Referido a urgencias.', 5);

INSERT INTO tratamiento_visita (visita, tratamiento, detalle_farmacologia) VALUES (1, 3, 1);
INSERT INTO tratamiento_visita (visita, tratamiento, detalle_farmacologia) VALUES (2, 2, 2);
INSERT INTO tratamiento_visita (visita, tratamiento, detalle_farmacologia) VALUES (3, 5, 3);
INSERT INTO tratamiento_visita (visita, tratamiento, detalle_farmacologia) VALUES (4, 4, 4);
INSERT INTO tratamiento_visita (visita, tratamiento, detalle_farmacologia) VALUES (5, 1, 5);

INSERT INTO formulario (edicion, fecha) VALUES ('Primera', '2024-04-09 10:00:00');
INSERT INTO formulario (edicion, fecha) VALUES ('Segunda', '2024-04-09 11:15:00');
INSERT INTO formulario (edicion, fecha) VALUES ('Tercera', '2024-04-10 09:30:00');
INSERT INTO formulario (edicion, fecha) VALUES ('Cuarta', '2024-04-11 14:45:00');
INSERT INTO formulario (edicion, fecha) VALUES ('Quinta', '2024-04-12 08:00:00');

INSERT INTO respuesta_formulario (formulario, paciente, fecha) VALUES (1, '1234567890', '2024-04-09 10:00:00');
INSERT INTO respuesta_formulario (formulario, paciente, fecha) VALUES (2, '2345678901', '2024-04-09 11:15:00');
INSERT INTO respuesta_formulario (formulario, paciente, fecha) VALUES (3, '3456789012', '2024-04-10 09:30:00');
INSERT INTO respuesta_formulario (formulario, paciente, fecha) VALUES (4, '4567890123', '2024-04-11 14:45:00');
INSERT INTO respuesta_formulario (formulario, paciente, fecha) VALUES (5, '5678901234', '2024-04-12 08:00:00');

INSERT INTO privilegio (privilegio) VALUES ('Administrador');
INSERT INTO privilegio (privilegio) VALUES ('Supervisor');
INSERT INTO privilegio (privilegio) VALUES ('Médico');
INSERT INTO privilegio (privilegio) VALUES ('Enfermero');
INSERT INTO privilegio (privilegio) VALUES ('Recepcionista');

INSERT INTO privilegio_usuario (privilegio, username) VALUES (1, 'admin');
INSERT INTO privilegio_usuario (privilegio, username) VALUES (2, 'doctor1');
INSERT INTO privilegio_usuario (privilegio, username) VALUES (3, 'enfermero1');
INSERT INTO privilegio_usuario (privilegio, username) VALUES (4, 'gestor');
INSERT INTO privilegio_usuario (privilegio, username) VALUES (5, 'paciente1');

