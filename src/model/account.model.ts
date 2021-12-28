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
    private  Accounts = (Database.getInstance())<Account>('Accounts');


    
    public  async addAccount(account: Account) {
        return await  this.Accounts.clone().insert(account);
    }

    public  async getAccount(email: string) {
        return await this.Accounts.clone().where('email', '=', email);
    }
};