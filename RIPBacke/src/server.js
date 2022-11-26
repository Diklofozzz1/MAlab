// import Connect from "./models/db_model.js";
const {Connect} = require ('./models/db_model.js');

const express = require("express");
const cors = require("cors");

const http = require("http");
const bodyParser = require("body-parser");

const server = express();
const port = 3080;

server.use(bodyParser.urlencoded({
    extended:true
}));

server.use(bodyParser.json());
server.use(express.json());
server.use(cors());

const app = http.Server(server);

server.get('/init_db', (req,res)=>{
    Connect.sync().then(res.status(200)); 
});

const ampq = require('amqplib/callback_api');

function ampqSender(jsonBody){
    ampq.connect('amqp://rabbitmq:5672', (err, connection)=> {
        if(err){
            throw err;
        }
        connection.createChannel((err, channel)=>{
            if(err){
                throw err;
            }
            let queueName = "CreatedUserInfo";
            let message = jsonBody;

            channel.assertQueue(queueName, {
                durable: false
            });

            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
            console.log(`Message sended. Context: ${message.toString()}`)
        })
    })
}

server.post('/create_user', async (req,res)=>{
    try{
        const user = await Connect.models.User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password
        })
        ampqSender(user)
        res.status(200).json(user)
    }catch (err){
        res.status(500).json(err)
    }
})

server.patch('/update_user_data/:id', async (req,res)=>{
    try{
        const data = await Connect.models.User.findOne({
            where: {
                id: req.params.id
            }
        })

        res.status(200).json(
            await data.update({
               ...data,
                ...req.body
            })
        )
    }catch (err){
        res.status(500).json(err)
    }
})

server.listen(port, ()=>{
    console.log(`Server listening on the port: ${port}`);
});