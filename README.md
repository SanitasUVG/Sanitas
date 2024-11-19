# Sanitas

[![Deploy Sanitas](https://github.com/SanitasUVG/Sanitas/actions/workflows/deploy.yml/badge.svg)](https://github.com/SanitasUVG/Sanitas/actions/workflows/deploy.yml)
[![Backend Linting and Tests](https://github.com/SanitasUVG/Sanitas/actions/workflows/backend.yml/badge.svg)](https://github.com/SanitasUVG/Sanitas/actions/workflows/backend.yml)
[![Frontend Lint and Tests](https://github.com/SanitasUVG/Sanitas/actions/workflows/frontend.yml/badge.svg)](https://github.com/SanitasUVG/Sanitas/actions/workflows/frontend.yml)

Sistema de registro de fichas médicas para la comunidad UVG

Si tienes duda de algo recuerda que puedes buscar en la [wiki](wiki/README.md).

## Cómo desarrollar en el proyecto

- [Link al repo](https://github.com/SanitasUVG/Sanitas)

El documento en "wiki/mantenimiento/Guía_de_contribución.md". Pero en resumen:

1. Instala [Nix](https://nixos.org/download/).
1. Habilita [Flakes](https://wiki.nixos.org/wiki/Flakes).
1. Hay tres comandos importantes de Nix que puedes usar para desarrollar en Sanitas,
   todos se corren dentro de la carpeta root del proyecto:
   a. Corre `nix develop --impure`. Estando dentro de la carpeta root del repositorio.
   Este comando te entrará a una terminal con todas las dependencias para que puedas
   correr y levantar el proyecto. Por favor utiliza esta shell para hacer
   commits y demás acciones dentro del proyecto.
   b. Corre `nix run .#restartServices`. No hace falta que se corra dentro de la
   shell de `nix develop --impure`. Te levanta todos los servicios para
   ejecutar/desarrollar Sanitas localmente.
   c. Corre `nix run .#integrationTests`. No hace falta que se corra dentro de la
   shell de `nix develop --impure`. Te levanta todos los servicios para
   ejecutar/desarrollar Sanitas y además te corre las tests de integración.
