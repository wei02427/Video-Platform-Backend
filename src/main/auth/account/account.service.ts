import AccountModel, { Account } from "../../../model/account.model";
import crypto from 'crypto';
import { HttpStatus } from "../../../types/response.type";
import { Strategy, VerifyFunction } from "passport-local";
import passport from "passport";
import { NextFunction, Request, Response } from "express";
export default class AccountService {

    private accountModel = new AccountModel();

    public get Strategy() {
        return new Strategy(
            {
                // 改以名為 email 的欄位資訊作為帳號
                usernameField: 'email'
            },
            this.verifyUserFlow()
        );
    }

    private verifyPassword(user: Account, password: string) {
        const { password: hashPw, salt, name } = user;
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString();

        return hash === hashPw;
    }

    private verifyUserFlow(): VerifyFunction {
        return (email: string, password: string, done) => {
            this.accountModel.getAccountByEmail(email)
                .then(user => {

                    if (!user) {
                        return done(null, false, { message: 'Not found user.' });
                    }

                    if (!this.verifyPassword(user, password)) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }


                    return done(null, user);
                })
                .catch((err: Error) => done(err));
        }
    }


    public async register(name: string, email: string, password: string) {

        const isExist = (await this.accountModel.getAccountByEmail(email));
        console.log(isExist)

        if (isExist !== null) {
            const error = new Error('電子信箱已被使用');
            (error as any).status = HttpStatus.CONFLICT;
            throw error;
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString();

        this.accountModel.addAccount({ name, email, password: hash, salt });


        return name;
    }



    public async login(req: Request, res: Response, next: NextFunction) {



        return new Promise<Account>((resolve, reject) => {
            passport.authenticate('local', (err: Error, user: Account) => {
                if (err) {

                    return reject(err);
                }

                req.logIn(user, function (err) {
                    if (err) {

                        const error = new Error('Not found User');
                        (error as any).status = HttpStatus.NOT_FOUND;
                        throw error;
                    }
                });

                resolve(user);

            })(req, res, next);
        });


    }

    public async addSubscriber(subscriber: number, uid: number) {
        this.accountModel.addSubscriberByID(subscriber, uid);
    }

    public async removeSubscriber(subscriber: number, uid: number) {
        this.accountModel.removeSubscriberByID(subscriber, uid);
    }

}