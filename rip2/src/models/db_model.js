// import {Sequelize} from "sequelize";
// import {DataTypes} from "sequelize";

const {Sequelize, DataTypes} = require('sequelize');


const Connect = new Sequelize(
    'host',
    'host',
    'gqallxxx79311',
    {
        dialect: 'postgres',
        host: 'ripbacke_db_2',
        // host: '0.0.0.0',
        // port: 5000,
        port: 5432,
        logging: true
    }
);

const User = Connect.define(
    'User',
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        firstName:{
            type: DataTypes.STRING
        },
        lastName:{
            type: DataTypes.STRING
        },
    }
);


module.exports = {Connect}