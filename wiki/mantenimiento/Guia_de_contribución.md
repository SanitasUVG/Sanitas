# Guía de Contribución

En este documento te explico cómo contribuir a Sanitas. Este repositorio es un
monorepo, lo que significa que hay varios proyectos conviviendo en un solo
repositorio. Las siguientes reglas son las generales para contribuir, por favor
revisa también las guías individuales de cada proyecto en su respectivo README.

Primero asegurate de haber clonado el repo por medio de [SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).
También puede clonarlo usando VSCode.

Luego instala [Nix](https://nixos.org/) y habilita [Nix flakes](https://nixos.wiki/wiki/Flakes).
Además te recomiendo [añadir a tu usuario como `trusted-user` dentro de tu `nix.conf`](https://nixos.org/manual/nix/stable/command-ref/conf-file.html?highlight=trusted-users#conf-trusted-users).
Esto mejorará tus tiempos de compilación del ambiente de desarrollo.

Una vez tengas todo esto instalado y configurado
puedes entrar al root de tu repositorio y correr:

```bash
nix develop --impure
```

Esto creará una shell de desarrollo con los lenguajes que vamos a programar
ya instalados y configurados.

Asegúrate de usar una terminal con la que hayas hecho `nix develop`
para hacer los commits. De esta forma los pre-commit hooks pueden correr.

## Iniciando PostgreSQL y otros servicios

Para iniciar el servicio de postgres te recomendamos utilizar el comando:

```bash
nix run .#restartServices
```

Este comando abrirá una ventana con todos los servicios de la aplicación
corriendo en segundo plano, en este caso te iniciará postgres con los
cambios más nuevos dentro de la carpeta de `database`, borrando todo lo que no
se haya ingresado al los archivos `*.sql` dentro de `database`.

El comando de `nix run .#restartServices` no hace falta correrlo dentro del
ambiente de desarrollo descrito anteriormente con `nix develop`. Sin embargo, si
ya se encuentra uno dentro de tal entorno se puede utilizar el comando:

```bash
devenv up
```

Esto levanta de la misma manera el servicio de postgres aunque no en limpio,
lo que permite mantener los datos previamente ingresados en la DB.
