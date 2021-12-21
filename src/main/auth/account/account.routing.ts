import express, { Request, Response, NextFunction } from "express";
import { RouteBase } from "../../../base/route.base";
import { HttpStatus } from "../../../types/response.type";
import { AccountController } from "./account.controller";


export class AccountRoute extends RouteBase {

  protected controller!: AccountController;

  protected initial(): void {
    this.controller = new AccountController();
    super.initial();
  }

  protected registerRoute(): void {
    
    this.router.post('/login',
      express.json(),
      this.responseHandler(this.controller.login)
    );

    this.router.post('/register',
      express.json(),
      this.responseHandler(this.controller.register)
    );



  
  }
}