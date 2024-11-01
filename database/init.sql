CREATE ROLE postgres WITH LOGIN SUPERUSER;

CREATE DATABASE sanitas;
\c sanitas postgres;

CREATE USER root WITH PASSWORD 'root';
GRANT ALL PRIVILEGES ON DATABASE sanitas TO root;

-- Creating main user the API is going to connect to...
CREATE USER backend WITH PASSWORD 'backend';
REVOKE ALL ON DATABASE sanitas FROM backend;
GRANT CONNECT ON DATABASE sanitas TO backend;

-- Creating the SCHEMA to use for all Tables...
CREATE SCHEMA md_san AUTHORIZATION backend;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA md_san TO backend;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA md_san TO backend;

-- Otorgar permisos de modificación a la tabla para el usuario backend
GRANT UPDATE, DELETE ON ALL TABLES IN SCHEMA md_san TO backend;

ALTER DEFAULT PRIVILEGES IN SCHEMA md_san GRANT SELECT,
UPDATE ON SEQUENCES TO backend;
ALTER DEFAULT PRIVILEGES IN SCHEMA md_san GRANT SELECT,
UPDATE,
INSERT,
DELETE ON TABLES TO backend;
