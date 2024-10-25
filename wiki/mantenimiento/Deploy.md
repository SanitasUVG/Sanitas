# Deploy

Bienvenido a la guía de deploy de Sanitas, asegúrate de tener instalado
[Nix](https://nixos.org/download/) y haber habilitado los
[Flakes](https://wiki.nixos.org/wiki/Flakes#Other_Distros,_without_Home-Manager).
Si eres la clase de persona que prefiere leer comandos de bash directamente
puedes simplemente ver la
[Github Action de Deploy](https://github.com/SanitasUVG/Sanitas/blob/develop/.github/workflows/deploy.yml)
en su lugar.

Una vez tengas Nix instalado y configurado por favor ejecuta:

```bash
nix develop --impure
```

Este comando te instalará todas las dependencias del proyecto. Todos los demás
pasos asumen que te encuentras dentro de la terminal que te crea Nix con el
comando anterior. El siguiente paso es configurar la base de datos.

## PostgreSQL

El primer paso para deployar Sanitas es tener la base de datos configurada y
abierta a conexiones. Por favor asegúrate de tenerla funcional y con su
`Connection URL` lista. Un ejemplo de una connection URL es la siguiente:

```text
postgresql://backend:backend@hostpc:6969/sanitas
```

El siguiente paso es configurar SAM.

## SAM (AWS Serverless Framework)

Para este proyecto se utilizó el framework de open source [SAM oficial de AWS](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html).
Por favor sigue los pasos de [la guía oficial de AWS](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html)
para configurar la cuenta. **Ten en cuenta que no necesitas**
instalar `sam-cli`, puesto que Nix lo instala por tí!

Dependiendo de cómo se configuren las credenciales puedes o no tener que
utilizar un IAM Role con una policy custom para subir el backend.
En el CI/CD solamente le dimos los permisos que necesita SAM para crear
los recursos dentro de la cuenta de AWS. La Policy que utilizamos es la
siguiente:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "iam:CreateInstanceProfile",
                "iam:RemoveRoleFromInstanceProfile",
                "iam:AddRoleToInstanceProfile",
                "iam:PassRole",
                "iam:CreateRole",
                "iam:TagRole",
                "iam:DeleteInstanceProfile",
                "iam:UpdateRole",
                "iam:UntagRole",
                "iam:GetRole",
                "iam:DeleteRole",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "iam:DeleteRolePolicy",
                "apigateway:*",
                "s3:*",
                "cloudformation:*",
                "lambda:*",
                "resource-groups:*",
                "applicationinsights:*",
                "cognito-idp:CreateUserPool",
                "cognito-idp:CreateUserPoolClient",
                "cognito-idp:CreateUserPoolDomain",
                "cognito-idp:DeleteUserPool",
                "cognito-idp:DeleteUserPoolClient",
                "cognito-idp:DeleteUserPoolDomain",
                "cognito-idp:UpdateUserPool",
                "cognito-idp:UpdateUserPoolClient",
                "cognito-idp:UpdateUserPoolDomain",
                "cognito-idp:SetUserPoolMfaConfig",
                "cognito-idp:*"
            ],
            "Effect": "Allow",
            "Resource": [
                "*"
            ]
        }
    ]
}
```

Una vez configuradas las credenciales, se necesita "compilar" el backend. Para
realizar este paso entra a la carpeta de `sanitas_backend` y ejecuta:

```bash
# Dentro de sanitas_backend
sam build --use-container
```

Una vez se haya compilado el backend, es momento de subirlo a tu cuenta!
Ejecuta el siguiente comando reemplazando la string por la URL del paso anterior:

```bash
# Dentro de sanitas_backend
sam deploy --parameter-overrides PostgresURL="URL DE CONEXION DE LA DB"
```

Una vez haya terminado el deploy del backend, se necesitan extraer 4 valores del
deploy para que funcione el backend. El primero es:

- **La URL del backend sin protección**: La puedes obtener del dashboard de AWS
  o puedes obtenerla usando el siguiente comando.

```bash
sam list stack-outputs --stack-name sanitas-backend --output json | jq .[1].OutputValue
```

- **La URL del backend con protección**: La puedes obtener del dashboard de AWS
  o puedes obtenerla usando el siguiente comando.

```bash
sam list stack-outputs --stack-name sanitas-backend --output json | jq .[0].OutputValue
```

- **El Cognito Pool ID**: La puedes obtener del dashboard de AWS
  o puedes obtenerla usando el siguiente comando.

<!-- markdownlint-disable MD013 -->

```bash
sam list resources --stack-name sanitas-backend --output json | jq '.[] | select(.LogicalResourceId == "CognitoUserPool") | .PhysicalResourceId'
```

<!-- markdownlint-enable MD013 -->

- **El Cognito Client ID**: La puedes obtener del dashboard de AWS
  o puedes obtenerla usando el siguiente comando.

<!-- markdownlint-disable MD013 -->

```bash
sam list resources --stack-name sanitas-backend --output json | jq '.[] | select(.LogicalResourceId == "CognitoUserPoolClient") | .PhysicalResourceId'
```

<!-- markdownlint-enable MD013 -->

El siguiente paso es deployear el frontend.

## Frontend

El fronend de sanitas es una SPA que usa Vite como su bundler. Simplemente
ejecuta el siguiente comando y sube la carpeta `dist` resultante a donde
publiques tu aplicación:

<!-- markdownlint-disable MD013 -->

```bash
yarn && BACKEND_URL="BACKEND URL" COGNITO_POOL_ID="COGNITO POOL ID" COGNITO_CLIENT_ID="COGNITO CLIENT ID" PROTECTED_URL="PROTECTED BACKEND URL" yarn build
```

<!-- markdownlint-enable MD013 -->

Si el hosting en donde se publicará la aplicación tiene un path extra en la URL
después del .com, reemplaza el `yarn build` de arriba por:

```bash
yarn build --base=/path/base/del/hosting
```
