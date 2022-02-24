import {  Request, Response, NextFunction } from 'express';
import _ from 'lodash';

import { ControllerBase } from "../../../base/controller.base";

import { HttpStatus } from "../../../types/response.type";
import AccountService from "./account.service";


export class AccountController extends ControllerBase {

    private accountService!: AccountService;

    protected init(): void {
        this.accountService = new AccountService();
    }


    public async login(req: Request, res: Response, next: NextFunction) {



        const user = await this.accountService.login(req, res, next);

        return this.formatResponse({ name: user.name, id: user.id }, HttpStatus.OK);

    }

    public async logout(req: Request, res: Response, next: NextFunction) {

        req.session.destroy(() => { });

        return this.formatResponse('ok', HttpStatus.OK);

    }

    public async authenticated(req: Request, res: Response, next: NextFunction) {

        return this.formatResponse('ok', HttpStatus.OK);
    }


    public async register(req: Request, res: Response, next: NextFunction) {


        const { name, email, password } = req.body;
        await this.accountService.register(name, email, password);

        req.session.user = name;

        return this.formatResponse({ name }, HttpStatus.CREATED);

    }


}