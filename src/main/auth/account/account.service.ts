import AccountModel from "../../../model/account.model";
import crypto from 'crypto';
import { HttpStatus } from "../../../types/response.type";

export default class AccountService {
    public static async register(name: string, email: string, password: string) {

        const isExist = (await AccountModel.getAccount(email)).length;
        if (isExist) {
            const error = new Error('電子信箱已被使用');
            (error as any).status = HttpStatus.CONFLICT;
            throw error;
        }

        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString();

        console.log('gggggggg')
        AccountModel.addAccount({ name, email, password: hash, salt });


        return name;
    }


    public static async login(email: string, password: string) {

        const { password: hashPw, salt, name } = (await AccountModel.getAccount(email))[0];

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