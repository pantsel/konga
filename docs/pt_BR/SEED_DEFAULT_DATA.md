# Alterar os dados de seed do usuário padrão

Se você deseja propagar usuários na primeira execução, pode fornecer um arquivo com os dados do usuário.
Um arquivo de amostra pode ser semelhante a:

````
module.exports = [
        {
            "username": "meuadmin",
            "email": "meuadmin@exemplo.com",
            "firstName": "Pedro",
            "lastName": "Administrador",
            "node_id": "http://kong:8001",
            "admin": true,
            "active" : true,
            "password": "minhasenha"
        },
        {
            "username": "outrousuario",
            "email": "outrousuario@exemplo.com",
            "firstName": "João",
            "lastName": "da Silva",
            "node_id": "http://kong:8001",
            "admin": false,
            "active" : true,
            "password": "qualquersenha"
        }
    ]
````

Para fazer o Konga usar este arquivo, você deve definir a variável de ambiente KONGA_SEED_USER_DATA_SOURCE_FILE para apontar para o local dos arquivos:
````
export KONGA_SEED_USER_DATA_SOURCE_FILE=~/userdb.data 
````

Isso é especialmente útil ao executar o Konga em um contêiner como parte de um swam do Docker. O arquivo pode ser configurado como um segredo do Docker e fornecido ao contêiner. Isso pode ser feito com uma entrada em um arquivo de composição semelhante a:

````
version: "3.1"

secrets:
  konga_user_seed:
    external: true

services:
  konga:
    image: pantsel/konga
    secrets:
     - konga_user_seed
    environment:
      - KONGA_SEED_USER_DATA_SOURCE_FILE=/run/secrets/konga_user_seed
    deploy:
      restart_policy:
        condition: on-failure
    ports:
     - 1337:1337
````

(Isso funcionará se o swarm for configurado com o segredo konga_user_seed definido com seu valor como o conteúdo do arquivo de usuários)

# Adicionando um seed de instância do kong padrão

Se você deseja semear uma ou várias conexões kong na primeira execução, você também pode adicionar um arquivo de seed de instâncias kong, semelhante ao de usuários.

Por exemplo:

```
module.exports = [
    {
        "name": "Kong Test Seed",
        "type": "key_auth",
        "kong_admin_url": "http://kong:8001",
        "kong_api_key": "DonKeyKong",
        "health_checks": false,
    }
]
```

Para fazer o Konga usar este arquivo, você deve definir a variável de ambiente KONGA_SEED_KONG_NODE_DATA_SOURCE_FILE para apontar para a localização dos arquivos:
````
export KONGA_SEED_KONG_NODE_DATA_SOURCE_FILE=~/kong_node.data 
````
