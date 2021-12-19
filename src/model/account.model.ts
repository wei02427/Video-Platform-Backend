import Database from "../database/database";

export interface Account {
    ID?: number;
    name: string;
    email: string;
    password: string;
    salt:string;
}

declare module 'express-session' {
    interface SessionData {
      user: string;
    }
  }
  

export default class AccountModel {
    private static Accounts = (Database.getInstance())<Account>('Account');

    public static addAccount(account: Account) {
        this.Accounts.insert(account);
    }

    public static async getAccount(email: string) {
        return await this.Accounts.select('*').where('Email', '=', email);
    }
};