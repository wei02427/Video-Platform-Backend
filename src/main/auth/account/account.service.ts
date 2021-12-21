import AccountModel from "../../../model/account.model";
import crypto from 'crypto';
import { HttpStatus } from "../../../types/response.type";

export default class AccountService {

    private accountModel = new AccountModel();

    public async register(name: string, email: string, password: string) {

        const isExist = (await this.accountModel.getAccount(email));

        if (isExist.length > 0) {
            const error = new Error('電子信箱已被使用');
            (error as any).status = HttpStatus.CONFLICT;
            throw error;
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString();

        this.accountModel.addAccount({ name, email, password: hash, salt });


        return name;
    }


    public async login(email: string, password: string) {

        const { password: hashPw, salt, name } = (await this.accountModel.getAccount(email))[0];

        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString();

        if (hash === hashPw) {
            return name;
        } else {
            const error = new Error('帳號密碼錯誤');
            (error as any).status = HttpStatus.UNAUTHORIZED;
            throw error;
        }



    }


}