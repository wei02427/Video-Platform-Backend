import express, { ErrorRequestHandler, Request } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { AppRoute } from './app.routing';
import session from 'express-session';
import passport from 'passport';
import AccountService from './main/auth/account/account.service';
import AccountModel, { Account } from './model/account.model';
import http from 'http';

import _ from 'lodash';
import SocketBase from './base/socket.base';
import AccountSocket from './main/auth/account/account.socket';
export class App {

  private app = express();
  private route = new AppRoute();
  private accountService = new AccountService();
  private accountModel = new AccountModel();
  private server: http.Server;

  



  constructor() {
    this.setHelmet();
    this.setCors();
    this.server = http.createServer(this.app);

    this.setSession();
    this.setPassport();
    this.setSocket();
    this.registerRoute();


  }

  // ====================================================================
  // @Public Methods
  // ====================================================================

  public bootstrap(): void {
    // this.app.listen(3000, () => console.log(`API Server is running at port ${3000}.`));

    this.server.listen(3000, () => {
      console.log(`API Server is running at port ${3000}.`);
    })
  }

  // ====================================================================
  // @Private Methods
  // ====================================================================

  private setHelmet(): void {
    this.app.use(helmet());
  }

  private setCors(): void {
    this.app.use(cors({
      "origin": 'http://localhost:3001',
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "credentials": true,
      // "preflightContinue": false,
      "optionsSuccessStatus": 204
    }));
  }

  public setException(handler: ErrorRequestHandler): void {
    this.app.use(handler);
  }

  private setSession(): void {

    this.app.use(session({
      secret: 'mySecret',
      name: 'user',
      saveUninitialized: false,
      resave: true,
      cookie: {
        path: '/',
        maxAge: 1000 * 60 * 10, // 設定 session 的有效時間，單位毫秒
        httpOnly: true
      }
    }))

  }

  private setSocket() {
    SocketBase.InitSocket(this.server);

    const accountSocket= new AccountSocket();
    
    SocketBase.RegisterSocketEvent(accountSocket.InitSocketEvent);
  }

  private setPassport() {


    passport.use(this.accountService.Strategy);
    passport.serializeUser<number>(function (user, done) {
      done(null, user.id);
    });
    passport.deserializeUser<number>(async (userID, done) => {


      const user = await this.accountModel.getAccountByID(userID);

      done(null, user);
    });

    this.app.use(passport.initialize());
    this.app.use(passport.session());


  }
  private registerRoute(): void {


    this.app.use('/', (req: Request, res, next) => {
      console.log(req.user?.email, 'session user')
      next();
    })

    this.app.use('/', this.route.router);
  }



}