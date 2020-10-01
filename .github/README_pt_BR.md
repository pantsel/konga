## Mais do que apenas outra GUI para [KONG Admin API](http://getkong.org)    [![Build Status](https://travis-ci.org/pantsel/konga.svg?branch=master)](https://travis-ci.org/pantsel/konga)    [![Gitter chat](https://badges.gitter.im/pantsel-konga/Lobby.png)](https://gitter.im/pantsel-konga/Lobby)


[![Dashboard](../screenshots/bc3.png)](https://raw.githubusercontent.com/pantsel/konga/master/screenshots/bc3.png)

_Konga não é um aplicativo oficial. Sem afiliação com [Kong](https://www.konghq.com/)._

<div align="center">
<span>README em outras línguas</span>
<p>
<a href="../README.md">Inglês (en)</a>
</p>
</div>

### Apoie o projeto
Se você acha que o Konga é útil, você pode mostrar o seu apoio e me ajudar a continuar mantendo o projeto [me comprando um café](buymeacoff.ee/F1aRIj8CG)
ou se tornando um [Patrão](https://www.patreon.com/kongaui). Saudações!

<a href="https://www.buymeacoffee.com/F1aRIj8CG" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Compre-me um café" style="height: auto !important;width: auto !important;" ></a>


## Apoiado por

Agradecimentos especiais aos nossos apoiadores que nos ajudam a manter o projeto em andamento e a motivação viva.

<a href="https://www.greenbird.com" target="_blank"><img src="../screenshots/greenbird.png" width="250"></a>

## Resumo

- [**Discussões e suporte**](#discussions--support)
- [**Recursos**](#features)
- [**Compatibilidade**](#compatibility)
- [**Pré-requisitos**](#prerequisites)
- [**Bibliotecas utilizadas**](#used-libraries)
- [**Instalação**](#installation)
- [**Configuração**](#configuration)
- [**Variáveis de ambiente**](#environment-variables)
- [**Executando o Konga**](#running-konga)
- [**Atualizando**](#upgrading)
- [**Perguntas e Respostas**](#faq)
- [**Mais coisas relacionadas ao Kong**](#more-kong-related-stuff)
- [**Licença**](#license)

## Discussões e suporte
Se você precisar discutir qualquer coisa relacionada ao Konga, temos uma sala de bate-papo no Gitter:

[![Gitter chat](https://badges.gitter.im/pantsel-konga/Lobby.png)](https://gitter.im/pantsel-konga/Lobby)

## Recursos
* Gerenciar todos os objetos Kong Admin API.
* Importar consumidores de fontes remotas (bancos de dados, arquivos, APIs, etc.).
* Gerenciar várias instâncias Kong.
* Faça backup, restaure e migre instâncias Kong usando Snapshots.
* Monitore os estados da instância e da API usando verificações de saúde.
* Notificações por email e Slack.
* Vários usuários.
* Fácil integração de banco de dados (MySQL, PostgreSQL, MongoDB).

## Compatibilidade
**De 0.14.0 em diante, Konga SOMENTE é compatível com Kong 1.x**

Se você estiver em uma versão mais antiga do Kong, use [essa](https://github.com/pantsel/konga/tree/legacy) branch ou `konga:legacy` do docker hub.

## Pré-requisitos
- Uma [instalação do Kong](https://getkong.org/) em execução
- Nodejs >= 8, <= 12.x (12.16 LTS é o recomendado)
- Npm

## Bibliotecas utilizadas
* [Sails.js, http://sailsjs.org/](http://sailsjs.org/)
* [AngularJS, https://angularjs.org](https://angularjs.org/)

## Instalação

Instale o `npm` e o `node.js`. Instruções podem ser encontradas [aqui](http://sailsjs.org/#/getStarted?q=what-os-do-i-need).

Instale os pacotes `bower`, e o `gulp`.
```
$ git clone https://github.com/pantsel/konga.git
$ cd konga
$ npm i
```

## Configuração
Você pode configurar seu aplicativo para usar as configurações específicas do ambiente.

Existe um arquivo de configuração de exemplo na pasta raiz.

```
.env_example
```

Basta copiar para `.env` e fazer as alterações necessárias. Observe que este arquivo `.env` está em .gitignore, portanto, não irá para o VCS em nenhum momento.

## Variáveis de Ambiente
Estas são as variáveis de ambiente gerais que Konga usa.

| VARIÁVEL                | DESCRIÇÃO                                                                                                                | VALORES                                 | PADRÃO                                      |
|--------------------|----------------------------------------------------------------------------------------------------------------------------|----------------------------------------|----------------------------------------------|
| HOST               | O endereço IP que será vinculado ao servidor do Konga                                                                               | -                                      | '0.0.0.0'                                         |
| PORT               | A porta que será usada pelo servidor do Konga                                                                               | -                                      | 1337                                         |
| NODE_ENV           | O Ambiente                                                                                                            | `production`,`development`             | `development`                                |
| SSL_KEY_PATH       | Se você quiser usar SSL, este será o caminho absoluto para o arquivo .key. Ambos `SSL_KEY_PATH` e` SSL_CRT_PATH` devem ser configurados. | -                                      | null                                         |
| SSL_CRT_PATH       | Se você quiser usar SSL, este será o caminho absoluto para o arquivo .crt. Ambos `SSL_KEY_PATH` e` SSL_CRT_PATH` devem ser configurados. | -                                      | null                                         |
| KONGA_HOOK_TIMEOUT | O tempo em ms que Konga aguardará pela conclusão das tarefas de inicialização antes de sair do processo.                                | -                                      | 60000                                        |
| DB_ADAPTER         | O banco de dados que Konga usará. Se não for definido, o db localDisk será usado.              | `mongo`,`mysql`,`postgres`     | -                                            |
| DB_URI             | A string de conexão db completa. Depende de `DB_ADAPTER`. Se for definido, nenhuma outra var relacionada ao banco de dados será necessária.                 | -                                      | -                                            |
| DB_HOST            | Se `DB_URI` não for especificado, este é o host do banco de dados. Depende de `DB_ADAPTER`.                                          | -                                      | localhost                                    |
| DB_PORT            | Se `DB_URI` não for especificado, esta é a porta do banco de dados. Depende de `DB_ADAPTER`.                                         | -                                      | DB default.                                  |
| DB_USER            | Se `DB_URI` não for especificado, este é o usuário do banco de dados. Depende de `DB_ADAPTER`.                                          | -                                      | -                                            |
| DB_PASSWORD        | Se `DB_URI` não for especificado, esta é a senha do usuário do banco de dados. Depende de `DB_ADAPTER`.                               | -                                      | -                                            |
| DB_DATABASE        | Se `DB_URI` não for especificado, este é o nome do banco de dados do Konga. Depende de `DB_ADAPTER`.                                    | -                                      | `konga_database`                             |
| DB_PG_SCHEMA       | Se estiver usando o postgres como banco de dados, este é o esquema que será usado.                                                     | -                                      | `public`                                     |
| KONGA_LOG_LEVEL    | O nível de registro                                                                                                          | `silly`,`debug`,`info`,`warn`,`error`  | `debug` no ambiente dev & `warn` no prod. |
| TOKEN_SECRET       | O segredo que será usado para assinar tokens JWT emitidos pelo Konga | - | - |
| NO_AUTH            | Execute o Konga sem autenticação                                                                                           | true/false                             | -                                         |
| BASE_URL           | Defina uma URL base ou caminho relativo de onde o Konga será carregado. Ex: www.exemplo.com/konga                               | <string>                                     | -                                         |
| KONGA_SEED_USER_DATA_SOURCE_FILE           | Semeie usuários padrão na primeira execução. [Docs](./docs/pt_BR/SEED_DEFAULT_DATA.md).                               | <string>                                     | -                                         |
| KONGA_SEED_KONG_NODE_DATA_SOURCE_FILE      | Semear instâncias padrão da API Kong Admin na primeira execução [Docs](./docs/pt_BR/SEED_DEFAULT_DATA.md)                               | <string>                                     | -                                         |


### Integração de bancos de dados

Konga vem com seu próprio mecanismo de persistência para armazenar usuários e configurações.

A persistência local do objeto de armazenamento é usado por padrão, que funciona muito bem como um banco de dados inicial ( com estrita ressalva de que é apenas para uso fora da produção).

O aplicativo também oferece suporte a alguns dos bancos de dados mais populares prontos para uso:

1. MySQL
2. MongoDB
3. PostgreSQL

Para usá-los, defina as variáveis de ambiente apropriadas em seu arquivo `.env`.
 

## Executando o Konga

### Desenvolvimento
```
$ npm start
```
Konga GUI estará disponível em `http://localhost:1337`

### Produção

***************************************************************************************** 
No caso de adaptadores `MySQL` ou` PostgreSQL`, Konga não realizará migrações de banco de dados quando executado em modo de produção.

Você pode realizar manualmente as migrações chamando ```node ./bin/konga.js prepare```, passando os argumentos necessários para a conectividade do banco de dados.

Por exemplo: 

```bash
node ./bin/konga.js  prepare --adapter postgres --uri postgresql://localhost:5432/konga
```
O processo será encerrado após a conclusão de todas as migrações.

*****************************************************************************************

Finalmente:
```
$ npm run production
```
Konga GUI estará disponível em `http://localhost:1337`


### Imagem Docker de produção

As instruções a seguir pressupõem que você tenha uma instância do Kong em execução seguindo as instruções do [docker hub do Kong](https://hub.docker.com/_/kong/)
```
$ docker pull pantsel/konga
$ docker run -p 1337:1337 \
             --network {{kong-network}} \ // opcional
             --name konga \
             -e "NODE_ENV=production" \ // ou "development" | o padrão é 'development'
             -e "TOKEN_SECRET={{somerandomstring}}" \
             pantsel/konga
```

#### Para usar um dos bancos de dados suportados

1. ##### Prepare o banco de dados
> **Atenção**: Você pode pular esta etapa se estiver usando o adaptador `mongo`.

Você pode preparar o banco de dados usando um contêiner efêmero que executa o comando prepare.

**Argumentos**

argumento  | descrição | padrão
----------|-------------|--------
-c      | comando | -
-a      | adaptador (pode ser `postgres` ou `mysql`) | -
-u     | url de conexão com o banco de dados completa | -

```
$ docker run --rm pantsel/konga:latest -c prepare -a {{adaptador}} -u {{url-de-conexão-com-o-bd}}
```


2. ##### Iniciando o Konga
```
$ docker run -p 1337:1337 
             --network {{kong-network}} \ // opcional
             -e "TOKEN_SECRET={{uma_string_qualquer}}" \
             -e "DB_ADAPTER=o-nome-do-adaptador" \ // 'mongo','postgres','sqlserver'  ou 'mysql'
             -e "DB_HOST=host-do-seu-db" \
             -e "DB_PORT=porta-do-seu-db" \ // O padrão é a porta padrão do DB
             -e "DB_USER=usuário-do-seu-db" \ // Omita se não for relevante
             -e "DB_PASSWORD=senha-do-seu-db" \ // Omita se não for relevante
             -e "DB_DATABASE=nome-do-seu-db" \ // o padrão é 'konga_database'
             -e "DB_PG_SCHEMA=seu-schema"\ // Opcionalmente, defina um esquema ao integrar com postgres
             -e "NODE_ENV=production" \ // ou 'development' | o padrão é 'development'
             --name konga \
             pantsel/konga
             
             
// Alternativamente, você pode usar a string de conexão completa para se conectar a um banco de dados
 $ docker run -p 1337:1337 
              --network {{kong-network}} \ // opcional
              -e "TOKEN_SECRET={{uma-string-qualquer}}" \
              -e "DB_ADAPTER=nome-do-adaptador" \ // 'mongo','postgres','sqlserver'  ou 'mysql'
              -e "DB_URI=string-de-conexao-com-o-bd-completa" \
              -e "NODE_ENV=production" \ // ou 'development' | o padrão é 'development'
              --name konga \
              pantsel/konga
```


A GUI estará disponível em `http://{seu ip público}:1337`


[É possível semear usuários padrão na primeira instalação.](./docs/pt_BR/SEED_DEFAULT_DATA.md)

Você também pode configurar o Konga para autenticar via [LDAP](./docs/pt_BR/LDAP.md).


## Atualizando
Em alguns casos, uma versão mais recente do Konga pode introduzir mudanças nos esquemas do banco de dados.
A única coisa que você precisa fazer é iniciar o Konga no modo dev uma vez para que as migrações sejam aplicadas.
Em seguida, pare o aplicativo e execute-o novamente no modo de produção.

se estiver usando o docker, você pode levantar um contêiner efêmero, conforme declarado antes:
```
$ docker run --rm pantsel/konga:latest -c prepare -a {{adaptador}} -u {{url-de-conexão-com-o-bd}}
```

## Perguntas e Respostas

##### 1. Obtendo uma página em branco com `Uncaught ReferenceError: angular is not defined`

Em alguns casos, ao rodar `npm install`, as dependências do bower não são instaladas corretamente.
Você precisará fazer o cd no diretório raiz do seu projeto e instalá-los manualmente digitando
```
$ npm run bower-deps
```

##### 2. Não é possível adicionar/editar algumas propriedades do plugin.
Quando uma propriedade de plugin é uma matriz, a entrada é tratada por um componente de chip.
Você precisará pressionar `enter` após cada valor que digitar
para que o componente o atribua a um índice do array.
Veja o problema [#48](https://github.com/pantsel/konga/issues/48) para referência.

##### 3. Permissão EACCES negada, mkdir '/kongadata/'.
Se você vir este erro ao tentar executar o Konga, significa que o konga não tem permissão de gravação para o diretório de dados padrão `/kongadata`. Você só terá que definir o caminho de armazenamento para um diretório em que o Konga terá permissões de acesso via variável de ambiente `STORAGE_PATH`.

##### 4. O gancho `grunt` está demorando muito para carregar
O tempo limite padrão para que os ganchos carreguem é 60000. Em alguns casos, dependendo da memória que a máquina host tem disponível, tarefas de inicialização como minificação e uglicificação de código podem demorar mais para ser concluídas. Você pode corrigir isso definindo então a variável de ambiente `KONGA_HOOK_TIMEOUT` para algo maior que 60000 como 120000.


## Mais coisas relacionadas ao Kong
- [**Kong Admin proxy**](https://github.com/pantsel/kong-admin-proxy)
- [**Kong Middleman plugin**](https://github.com/pantsel/kong-middleman-plugin)

## Autor

Panagis Tselentis

## Licença
```
The MIT License (MIT)
=====================

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
