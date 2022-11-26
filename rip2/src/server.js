// import Connect from "./models/db_model.js";
const {Connect} = require ('./models/db_model.js');

const express = require("express");
const cors = require("cors");

const http = require("http");
const bodyParser = require("body-parser");

const server = express();
const port = 3070;

server.use(bodyParser.urlencoded({
    extended:true
}));

server.use(bodyParser.json());
server.use(express.json());
server.use(cors());

const app = http.Server(server);

const ampq = require('amqplib/callback_api');

async function addtoDB(msg){
    try{
        const jsonObj = JSON.parse(msg.content)
        await Connect.models.User.create({
            id: jsonObj.id,
            firstName: jsonObj.firstName,
            lastName: jsonObj.lastName
        })
    }catch (err) {
        console.log(`что то пошло совсем не так: ${err}`);
    }
}

ampq.connect('amqp://rabbitmq:5672', (err, connection)=> {
    if(err){
        throw err;
    }
    connection.createChannel((err, channel)=>{
        if(err){
            throw err;
        }

        let queueName = "CreatedUserInfo";

        channel.assertQueue(queueName, {
            durable: false
        });

        channel.consume(queueName, async (msg)=>{
            console.log(`Message received: ${msg.content}`)
            await addtoDB(msg)
            channel.ack(msg)
        })

    })
})

server.get('/init_db', (req,res)=>{
    Connect.sync().then();
    res.status(200);
});

server.get('/get_all_users', async (_,res)=>{
    try{
        res.status(200).json(
            await Connect.models.User.findAll()
        )
    }catch (err){
        res.status(500).json(err)
    }
})

server.get('/get_user_by_name', async (req, res)=>{
    try{
        res.status(200).json(
            await Connect.models.User.findAll({
                where: {
                    firstName: req.query.firstName
                }
            })
        )
    }catch (err){
        res.status(500).json(err)
    }
})


server.listen(port, ()=>{
    console.log(`Server listening on the port: ${port}`);
});