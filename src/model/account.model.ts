import Database from "../database/database";

export interface Account {
    id?: number;
    name: string;
    email: string;
    password: string;
    salt: string;
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
};