import { Router, Request, Response, NextFunction } from 'express';

import { ControllerBase } from "../../../base/controller.base";
import { ResponseObject } from "../../../common/response/response.object";
import AccountModel, { Account } from "../../../model/account.model";
import { HttpStatus } from "../../../types/response.type";
import AccountService from "./account.service";


export class AccountController extends ControllerBase {

    private accountService!: AccountService;

    protected init(): void {
        this.accountService = new AccountService();

    }
    public async login(req: Request, res: Response, next: NextFunction) {

        const { email, password } = req.body;

        const name = await this.accountService.login(email, password);

        req.session.user = name;

        return this.formatResponse({ name }, HttpStatus.OK);

    }

    public async register(req: Request, res: Response, next: NextFunction) {


        const { name, email, password } = req.body;
        await this.accountService.register(name, email, password);

        req.session.user = name;

        return this.formatResponse({ name }, HttpStatus.CREATED);

    }

}