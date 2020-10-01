# LDAP

Com a integração LDAP, você pode autenticar por meio do seu servidor LDAP. Atualmente a aplicação precisa que o usuário exista no banco de dados de usuários do konga para que a página de perfil do usuário seja exibida corretamente, portanto, no momento, sincronizaremos qualquer usuário autenticado por LDAP com o banco de dados de usuário do konga a cada login. No futuro, talvez a página de perfil do usuário seja "somente-leitura" por autenticação LDAP? Ou talvez ela possa sincronizar os dados de volta com o servidor LDAP?

## Configuração

| Variáveis de ambiente | Padrão | Descrição |
| --- | --- | --- |
| `KONGA_AUTH_PROVIDER` | `local` | **Define como `ldap` para mudar o provedor de autenticação para LDAP** |
| `KONGA_LDAP_HOST` | `ldap://localhost:389` | A localização do servidor LDAP |
| `KONGA_LDAP_BIND_DN` | *nenhum padrão* | O DN que o konga deve usar para fazer login no LDAP para pesquisar usuários |
| `KONGA_LDAP_BIND_PASSWORD` | *nenhum padrão* | A senha do usuário que o konga usará para pesquisar usuários |
| `KONGA_LDAP_USER_SEARCH_BASE` | `ou=users,dc=com` | O DN base usado para pesquisar usuários |
| `KONGA_LDAP_USER_SEARCH_FILTER` | `(\|(uid={{username}})(sAMAccountName={{username}}))` | A expressão de filtro usada para pesquisar usuários. Use `{{username}}` onde você espera que o nome de usuário esteja |
| `KONGA_LDAP_USER_ATTRS` | `uid,uidNumber,givenName,sn,mail` | Lista separada por vírgulas de atributos para receber do servidor LDAP para os usuários |
| `KONGA_LDAP_GROUP_SEARCH_BASE` | `ou=groups,dc=com` | O DN de base usado para pesquisar grupos |
| `KONGA_LDAP_GROUP_SEARCH_FILTER` | `(\|(memberUid={{uid}})(memberUid={{uidNumber}})(sAMAccountName={{uid}}))` | A expressão de filtro usada para pesquisar grupos. Use `{{some-attr}}` onde você espera que um atributo de usuário esteja ou `{{dn}}` para o usuário `dn`. |
| `KONGA_LDAP_GROUP_ATTRS` | `cn` | Lista separada por vírgulas de atributos para receber do servidor LDAP para grupos |
| `KONGA_ADMIN_GROUP_REG` | `^(admin\|konga)$` | Expressão regular usada para determinar se um grupo deve ser considerado um usuário administrador |
| `KONGA_LDAP_ATTR_USERNAME` | `uid` | Nome do atributo LDAP que deve ser usado como nome de usuário konga |
| `KONGA_LDAP_ATTR_FIRSTNAME` | `givenName` | Nome do atributo LDAP que deve ser usado como o primeiro nome do usuário konga |
| `KONGA_LDAP_ATTR_LASTNAME` | `sn` | Nome do atributo LDAP que deve ser usado como o sobrenome do usuário konga |
| `KONGA_LDAP_ATTR_EMAIL` | `mail` | Nome do atributo LDAP que deve ser usado como endereço de e-mail do usuário konga |

