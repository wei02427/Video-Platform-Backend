import knex, { Knex } from 'knex';

export default class Database {
    private static instance: Knex;

    public static getInstance() {
        if (!this.instance)
            this.instance = knex({
                client: 'mysql',
                connection: {
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    database: process.env.DB_DATABASE,
                    password: process.env.DB_PASS
                }
            })
        return this.instance;
    }
}


