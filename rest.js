//напишем REST API основанную на работе с токенами. Подробнее - в index.js файле.

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors')

const user = {
  username: 'admin',
  password: 'admin',
};

const app = express();
app.use(bodyParser.json());
//обязательно ограничивать домены
app.use(cors({origin: ['*.domain.com']}));

//начинаем с авторизации
app.post('/auth', (req, res) => {
  const {username, password} = req.body;
  if (username === user.username && password === user.password) {
    //удалить из юзера password и другую опасную) информацию
    res.json({ token: jwt.sign(user, 'secret')})
  } else{
    res.json({message: 'Wrong credentials'});
  }
});

//пусть есть группа роутов, работающих с пользователями. Мы хотим чтобы этот запрос был доступен только после авторизации
function checkAuth(req, res, next) {
  //вытащим значение заголовка
  const auth = req.headers.authorization || '';
  //распарсим
  const [, token] = auth.split(' ');
  if (token) {
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        return res.json({ message : 'Wrong token' })
      }
      req.user = decoded;
      next();
    })
  } else {
    return res.json({ message: 'No token present' })
  }
}

app.use('/users', checkAuth);

app.get('/users', (req, res) => {
  res.json([
    {name: 'Vasya', age: 30},
    {name: 'Kolya', age: 40},
  ])
});

app.listen(8888);