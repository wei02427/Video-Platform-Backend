import _ from "lodash";
import Database from "../database/database";
import type { IncomingMessage } from 'http';
import type { SessionData } from 'express-session';
import type { Socket } from 'socket.io';
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
        user: string
    }
}

interface SessionIncomingMessage extends IncomingMessage {
    session: { passport: SessionData }
};

export interface SessionSocket extends Socket {
    request: SessionIncomingMessage
};

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
        subscribers.push(subscriber);

        const result = await this.Accounts.clone().update('subscribers', _.uniq(subscribers).join(',')).where('id', '=', id);

        return result;
    }

    public async removeSubscriberByID(subscriber: number, id: number) {

        const subscribers = await this.getSubscribesByID(id);
        _.pull(subscribers, subscriber);

        const result = await this.Accounts.clone().update('subscribers', subscribers.join(',')).where('id', '=', id);

        return result;
    }


    public async getSubscribesByID(id: number) {
        const result = await this.Accounts.clone().select('subscribers').where('id', '=', id);

        return _.map(_.split(result[0].subscribers, ','), _.toNumber);
    }

    public async checkIsSubscriber(uid: number, channelId: number) {
        const subscribers = await this.getSubscribesByID(channelId);
        return _.includes(subscribers, uid);
    }
};