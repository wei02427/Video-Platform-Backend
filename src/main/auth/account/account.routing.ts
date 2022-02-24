import express from "express";
import { RouteBase } from "../../../base/route.base";
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


    this.router.get('/logout',
      this.controller.ensureAuthenticated,
      this.responseHandler(this.controller.logout)
    )

    this.router.post('/register',
      express.json(),
      this.responseHandler(this.controller.register)
    );

    this.router.get('/authenticated',
      this.controller.ensureAuthenticated,
      this.responseHandler(this.controller.authenticated)
    )




  }
}