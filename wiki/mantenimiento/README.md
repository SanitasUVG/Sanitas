# Mantenimiento de Sanitas

Bienvenido a la wiki para darle mantenimiento a Sanitas!
Puedes ver un ejemplo de una request de login en el siguiente diagrama de secuencia:

```mermaid
sequenceDiagram
    participant Client
    participant Backend
    participant Database

    Client ->> Backend: /login: username, password
    Backend ->> Database: Query username

    Database -->> Backend: Hashed password
    Backend ->> Database: Session token

    Database -->> Backend: Date of generation
    Backend -->> Client: session token
```

Si quieres consulta nuestra [Metodología de Desarrollo](./Metodologia_de_desarrollo.md)

## Nix

Este proyecto utiliza [Nix](https://nixos.org/) para sus ambientes de desarrollo,
puedes consultar la [Guía de contribución](./Guia_de_contribuci%C3%B3n.md)
para aprender más al respecto

## Base de datos

Para la base de datos se decidió utilizar [PostgreSQL](https://www.postgresql.org/).
Para más información consulta [nuestra guía a los datos](./db/README.md)
