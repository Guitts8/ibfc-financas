# IBFC Finanças 📲

Aplicativo de **finanças pessoais** para os membros da **Igreja Batista Filadélfia Canoas (IBFC)**.
Projeto filantrópico, sem fins lucrativos: ajuda cada irmão a controlar e guardar o próprio dinheiro.

- **Tecnologia:** Expo (React Native) + TypeScript + Firebase (Auth + Firestore)
- **Plataformas:** Android e iOS (mesma base de código)
- **Privacidade:** cada usuário só acessa os próprios dados (ver `firestore.rules`)

---

## ⚠️ Importante neste ambiente (Windows)

Esta máquina **não tem permissão de escrita na pasta home do usuário** (`C:\Users\...`),
onde o Expo normalmente cria a pasta `~/.expo`. Para contornar, os scripts do
`package.json` definem a variável `__UNSAFE_EXPO_HOME_DIRECTORY=.expo-home`, que
redireciona esse diretório para dentro do projeto (pasta ignorada pelo git).

➡️ **Sempre rode o app pelos scripts npm** (`npm start`, `npm run android`, etc.),
nunca `npx expo start` direto, ou o Expo falhará com `EPERM ... mkdir '...\.expo'`.

---

## Configuração inicial (uma vez)

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o projeto no Firebase

1. Acesse <https://console.firebase.google.com> e crie um projeto (ex.: `ibfc-financas`).
2. No projeto, clique no ícone **Web** (`</>`) e registre um app web.
3. O console mostrará um objeto `firebaseConfig`. Guarde esses valores.
4. Em **Authentication > Sign-in method**, ative **E-mail/senha**.
5. Em **Firestore Database**, crie o banco (modo de produção).
6. Em **Firestore Database > Regras**, cole o conteúdo de [`firestore.rules`](./firestore.rules) e publique.

### 3. Preencher as credenciais

```bash
cp .env.example .env
```

Abra o `.env` e preencha os valores do `firebaseConfig` (todas as variáveis `EXPO_PUBLIC_FIREBASE_*`).
O arquivo `.env` é ignorado pelo git e **não** deve ser commitado.

---

## Rodar o app

```bash
npm start          # abre o Metro; leia o QR code com o app Expo Go
npm run android    # abre direto no emulador/dispositivo Android
npm run ios        # abre no simulador iOS (requer macOS)
npm run web        # abre no navegador
```

Para testar no celular físico sem build nativo, instale o **Expo Go**
(Play Store / App Store) e leia o QR code exibido pelo `npm start`.

---

## Estrutura do projeto

```
src/
  app/                 # telas (Expo Router — roteamento por arquivos)
  components/          # componentes reutilizáveis
  constants/theme.ts   # cores da marca IBFC + tema claro/escuro
  contexts/            # AuthContext (estado de login)
  firebase/config.ts   # inicialização do Firebase (Auth + Firestore)
  types/finance.ts     # modelos de dados (transações, metas, categorias)
firestore.rules        # regras de segurança (cada membro só vê o que é seu)
```

## Status

- [x] Fundação: projeto, tema, Firebase, modelos de dados, regras de segurança
- [ ] Telas de login e cadastro
- [ ] Dashboard (saldo do mês, entradas vs. saídas)
- [ ] Lançar e listar transações
- [ ] Metas de economia
- [ ] Orçamento mensal por categoria
