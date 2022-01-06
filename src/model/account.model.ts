import _ from "lodash";
import Database from "../database/database";

export interface Account {
    id?: number;
    name: string;
    email: string;
    password: string;
    salt: string;
    subscribers?: string
}

declare module 'express-session' {
    interface SessionData {
        user: string;
    }
}

declare global {
    namespace Express {
        interface User extends Account {

        }
    }
}
export default class AccountModel {
    private Accounts = (Database.getInstance())<Account>('Accounts');



    public async addAccount(account: Account) {
        return await this.Accounts.clone().insert(account);
    }

    public async getAccountByEmail(email: string) {
        const result = await this.Accounts.clone().where('email', '=', email);
        return result.length ? result[0] : null;
    }

    public async getAccountByID(id: number) {
        const result = await this.Accounts.clone().where('id', '=', id);
        return result.length ? result[0] : null;
    }

    public async addSubscriberByID(subscriber: number, id: number) {

        const subscribers = await this.getSubscribesByID(id);
        subscribers.push(subscriber.toString());

        const result = await this.Accounts.clone().update('subscribers', subscribers.join(',')).where('id', '=', id);

        return result;
    }

    public async removeSubscriberByID(subscriber: number, id: number) {

        const subscribers = await this.getSubscribesByID(id);
        _.pull(subscribers,subscriber.toString());

        const result = await this.Accounts.clone().update('subscribers', subscribers.join(',')).where('id', '=', id);

        return result;
    }


    public async getSubscribesByID(id: number) {
        const result = await this.Accounts.clone().select('subscribers').where('id', '=', id);

        return _.split(result[0].subscribers, ',');
    }
};