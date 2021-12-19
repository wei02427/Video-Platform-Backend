import { Router, Request, Response, NextFunction } from 'express';

import { ControllerBase } from "../../../base/controller.base";
import { ResponseObject } from "../../../common/response/response.object";
import AccountModel, { Account } from "../../../model/account.model";
import { HttpStatus } from "../../../types/response.type";
import AccountService from "./account.service";


export class AccountController extends ControllerBase {


    public async login(req: Request, res: Response, next: NextFunction) {


        const { email, password } = req.body;
        const name = await AccountService.login(email, password);

        req.session.user = name;

        return this.formatResponse('user', HttpStatus.OK);

    }

    public async register(req: Request, res: Response, next: NextFunction) {

        console.log('ssssssss')

        const { name, email, password } = req.body;
        await AccountService.register(email, password, password);

        req.session.user = name;

        return this.formatResponse('user', HttpStatus.CREATED);

    }

}