- Instale e execute o CapptaGpPlus.exe com os dados forneceidos pela equipe;
- Execute o CapptaGpPlus;
- Abra o arquivo sample.js (Sample.CapptaAPIDesktop.JavaScript\sample-application\app\js)em um editor de texto e configure os parametros "merchantCnpj" e "checkoutNumber" com os dados fornedidos para instalação do CapptaGpPlus (não alterar a Chave de Autenticação);
Ex.:authenticationKey: '795180024C04479982560F61B3C2C06E',
    merchantCnpj: '00000000000000',
    checkoutNumber: 14
- Instale o NodeJs na sua máquina
- Via prompt de comando, acesse o diretorio "sample-application".
	- Execute o comando "npm install"
	- Execute o comando "npm run gulp"
- O sample irá rodar automaticamente no endereço http://localhost:8000/
