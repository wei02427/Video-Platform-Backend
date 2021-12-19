import mysql from 'mysql';


// Database Connection for Production

// let config = {
//     user: process.env.SQL_USER,
//     database: process.env.SQL_DATABASE,
//     password: process.env.SQL_PASSWORD,
// }

// if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
//   config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
// }

// let connection = mysql.createConnection(config);

// Database Connection for Development


import knex, { Knex } from 'knex';

export default class Database {
    private static instance: Knex;

    public static getInstance() {
        if (!this.instance)
            this.instance = knex({
                client: 'mysql',
                connection: {
                    host: '34.67.92.218',
                    user: 'root',
                    database: 'Platform',
                    password: 'rveyE8e4Ajnu4c6h'
                }
            })
        return this.instance;
    }
}
// let connection = mysql.createConnection({
//     host: '34.67.92.218',
//     user: 'root',
//     database: 'Platform',
//     password: 'rveyE8e4Ajnu4c6h'
// });

// connection.connect(function (err) {
//     if (err) {
//         console.error('Error connecting: ' + err.stack);
//         return;
//     }
//     console.log('Connected as thread id: ' + connection.threadId);
// });


