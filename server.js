const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const postgres= knex({
    client: 'pg',
    version: '7.2',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '0106',
      database : 'quiz'
    }
  });

// const database ={ 
//     users:[
//     {
//         id:'1',
//         name:'john',
//         email:'john@gmail.com',
//         password:'john',
//         joined: new Date(),
//         score:{}
//     },
//     {   
//         id:'2',
//         name:'sally',
//         email:'sally@gmail.com',
//         password:'sally',
//         joined: new Date(),
//         score:{}
//     },
// ]
// };
// console.log(postgres.select('*').from('users'));

app.get('/', (req, res) => {
    res.json(database.users);
});

app.post('/signin', (req,res) => {
    postgres.select('email','hash').from('login')
    .where('email','=',req.body.email)
    .then(data =>{
        const isValid= bcrypt.compareSync(req.body.password,data[0].hash);

        if(isValid){
            return postgres.select('*').from('users')
            .where('email','=',req.body.email)
            .then(user=> {res.json(user[0])})
            .catch(err=> res.json('unable to get user'))
        }
        else{
            res.status(400).json('wrong credentials');
        }
    }) 
    .catch(err=> res.status(400).json('wrong credential'));



    // if((req.body.email === database.users[0].email) && (req.body.password === database.users[0].password)){
    //     res.json('u r our member');
    // }
    // else{
    //     res.status(404).json('u need to register');
    // }
});

app.post('/register', (req,res) => {

    const bhash = bcrypt.hashSync(req.body.password);

    postgres.transaction(trx=>{
        trx.insert({
            email: req.body.email,
            hash:bhash
        }).into('login').returning('email')
        .then(retemail =>{
            return trx('users').returning('*').insert({
                email : retemail[0],
                name : req.body.name,
                joined : new Date()
            })
            .then(user=>{
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err=> res.status(400).json(err));


    // postgres('users')
    // .returning('*')
    // .insert({
    //     name : req.body.name,
    //     email : req.body.email,
    //     joined : new Date()
    // })
    // .then(user=>{
    //     res.json(user[0]);
    // })
    // .catch(err=>{
    //     res.status(404).json(err);
    // });


    // const obj = {
    // id :'3',
    // name : req.body.name,
    // email : req.body.email,
    // password : req.body.password,
    // joined : new Date()
    // };
    // database.users.push(obj);    
    // res.json(database.users[database.users.length-1]);
});

// 0 science 1 maths 2 sports 3 history 4 computer 5 animal 6 film 7 general 8 geography

app.post('/score', (req,res) => { 

    const scoreArray = ['Science & Nature','Science: Mathematics','Sports','History','Science: Computers','Animals','Entertainment: Film','General Knowledge','Geography'];

    const dbArray = ['science','mathematics','sports','history','computer','animals','film','general','geography'];

    const category=[];

    for(var i=0;i<scoreArray.length;i++){
        if(scoreArray[i] === req.body.category){
            category[0]=dbArray[i];
        }
    }

    postgres('users').where('email','=',req.body.email)
    // .update(cate,change())
    .returning('*')
    .increment(category[0],req.body.score)
    .then(data =>{
        if(data[0].id){
        console.log(data);
        var userData = Object.assign({},data[0]);
        console.log(userData);
        let {id,email,joined,...rest} = userData;
        var scoreInfo=rest;
        console.log(scoreInfo);
        res.json(scoreInfo);
        }
    })
    .catch(err => {res.status(404).json(err)});

 
    // database.users.forEach(user => {
    //     if(user.id === req.body.id){
    //         if(user.score[req.body.category] === undefined){
    //             user.score[req.body.category]=0;
    //         }
    //         user.score[req.body.category]+=req.body.score;
    //         res.json(user.score);
    //     }        
    // });

});

app.listen(3001);