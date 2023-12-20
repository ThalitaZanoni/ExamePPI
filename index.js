import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Obtendo o caminho do diretório atual
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecretkey',
  resave: true,
  saveUninitialized: true
}));

const usuariosCadastrados = [];
const mensagens = [];
let ultimoAcesso = null;

const verificarLogin = (req, res, next) => {
  if (!req.session.usuario) {
    return res.redirect('/');
  }
  next();
};

app.use((req, res, next) => {
  if (req.session.ultimoAcesso) {
    ultimoAcesso = req.session.ultimoAcesso;
  }
  next();
});

app.get('/', (req, res) => {
  res.render('menu.ejs', { ultimoAcesso });
});

app.get('/cadastroUsuario', (req, res) => {
  res.render('cadastroUsuario', { usuariosCadastrados });
});

app.post('/cadastrarUsuario', (req, res) => {
  const { nome, dataNascimento, apelido } = req.body;

  if (!nome || !dataNascimento || !apelido) {
    return res.render('cadastroUsuario', { usuariosCadastrados, erro: 'Preencha todos os campos.' });
  }

  const novoUsuario = { nome, dataNascimento, apelido };
  usuariosCadastrados.push(novoUsuario);

  req.session.ultimoAcesso = new Date().toLocaleString();

  res.render('cadastroUsuario', { usuariosCadastrados });
});

app.get('/batepapo', verificarLogin, (req, res) => {
  res.render('batepapo', { mensagens, usuarios: usuariosCadastrados });
});

app.post('/postarMensagem', verificarLogin, (req, res) => {
  const { usuario, mensagem } = req.body;

  if (!usuario || !mensagem) {
    return res.render('batepapo', { mensagens, usuarios: usuariosCadastrados, erro: 'Selecione um usuário e preencha a mensagem.' });
  }

  const dataHora = new Date().toLocaleString();
  mensagens.push({ usuario, mensagem, dataHora });

  res.render('batepapo', { mensagens, usuarios: usuariosCadastrados });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

