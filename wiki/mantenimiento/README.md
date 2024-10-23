# Mantenimiento de Sanitas

Bienvenido a la wiki para darle mantenimiento a Sanitas!

Si te gustaría conocer un overview de cómo se encuentra estructurado el proyecto
en general y cómo el Login, por favor revisa las secciones del [Frontend de Sanitas](./frontend/README.md)
así como la del [Backend de Sanitas](./backend/README.md)

Si quieres saber cómo desarrollar en Sanitas consulta nuestra [Guía de
Contribución](./Guia_de_contribuci%C3%B3n.md).

Si quieres saber cómo trabajamos consulta nuestra [Metodología de Desarrollo](./Metodologia_de_desarrollo.md).

## Nix

Este proyecto utiliza [Nix](https://nixos.org/) para sus ambientes de desarrollo,
Si nunca has utilizado Nix, es una herramienta para compilar software de forma
reproducible, en este proyecto se utiliza mayormente para crear ambientes de
desarrollo y scripts reproducibles en Linux, MacOS y WSL.

Nix simplifica el manejo de dependencias entre computadoras y personas, resuelve
el mítico problema de computación de "sirve en mi computadora".

## Base de datos

Para la base de datos se decidió utilizar [PostgreSQL](https://www.postgresql.org/).
Para más información consulta [nuestra guía a los datos](./db/README.md)
