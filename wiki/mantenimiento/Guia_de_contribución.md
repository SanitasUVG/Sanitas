# Guía de Contribución

En este documento te explico cómo contribuir a Sanitas.

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
para hacer los commits. De esta forma los pre-commit hooks pueden correr
