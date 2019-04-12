**Configurando e usando:**

------------------------------------------------------------

- Instale e execute o `CapptaGpPlus.exe` com os dados forneceidos pela equipe;

- Execute o CapptaGpPlus;
- Certifique-se que o GP esteja configurado para checkout-web

Na pasta do sample existe um arquivo com extenção .js chamado: sample-payments.js
O caminho é este: Cappta.Gp.API.JavaScript.Samples/sample-payments.js

Na variável abaixo:

var authenticationRequest = {
    authenticationKey: 'D0553CA155C343C592CA87D29E6D1EA',

};

é possivel acrescentar CNPJ e PDV caso deseje.

Coloque o projeto em um server (apache, IIS, Tomcat, etc) depois abra o localhost

