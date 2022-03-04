import express, { ErrorRequestHandler, Request } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { AppRoute } from './app.routing';
import session from 'express-session';
import passport from 'passport';
import AccountService from './main/auth/account/account.service';
import AccountModel, { Account } from './model/account.model';
import https from 'https';
import * as fs from 'fs';
import _ from 'lodash';
import SocketBase from './base/socket.base';
import AccountSocket from './main/auth/account/account.socket';
// import sharedsession from "express-socket.io-session";
// import FileStore from 'session-file-store';
import { Socket } from 'socket.io';
export class App {

  private app = express();
  private route = new AppRoute();
  private accountService = new AccountService();
  private accountModel = new AccountModel();
  private server: https.Server;





  constructor() {
    this.setHelmet();
    this.setCors();
    this.server = https.createServer({
      key: fs.readFileSync('/usr/etc/letsencrypt/live/videoshareapi.hopto.org/privkey.pem'),
      cert: fs.readFileSync('/usr/etc/letsencrypt/live/videoshareapi.hopto.org/fullchain.pem'),
      ca: fs.readFileSync('/usr/etc/letsencrypt/live/videoshareapi.hopto.org/fullchain.pem'),
    }, this.app);

    this.setSession();
    this.setPassport();

    this.registerRoute();
    this.setSocket();
  }

  // ====================================================================
  // @Public Methods
  // ====================================================================

  public bootstrap(): void {

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
      "origin": ['https://video-platform-335208.uc.r.appspot.com'],
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "credentials": true,
      "optionsSuccessStatus": 204
    }));
  }

  public setException(handler: ErrorRequestHandler): void {
    this.app.use(handler);
  }

  private setSession(): void {

    const sessionMiddleware = session({
      secret: 'mySecret',
      name: 'user',
      saveUninitialized: false,
      resave: true,
      cookie: {
        path: '/',
        maxAge: 1000 * 60 * 60 * 60, // 設定 session 的有效時間，單位毫秒
        httpOnly: true,
        sameSite: 'none',
        secure: true
      }
    });

    const wrapper = (middleware: any) => (socket: Socket, next: any) => middleware(socket.request, {}, next);

    // 讓 socket 存取 session
    SocketBase.socketIo.use(wrapper(sessionMiddleware));

    this.app.use(sessionMiddleware);


  }

  private setSocket() {
    SocketBase.InitSocket(this.server);

    const accountSocket = new AccountSocket();

    SocketBase.RegisterSocketEvent(accountSocket.InitSocketEvent);
  }

  private setPassport() {


    passport.use(this.accountService.Strategy);

    // 驗證成功後將 user.id 存入 session 中
    passport.serializeUser<number>(function (user, done) {
      done(null, user.id);
    });

    //passport.deserializeUser() 會將 session 中的 user 資訊附加到 req.user 上 
    passport.deserializeUser<number>(async (userID, done) => {
      const user = await this.accountModel.getAccountByID(userID);
      done(null, user);
    });

    this.app.use(passport.initialize());
    this.app.use(passport.session());


  }
  private registerRoute(): void {

    //   this.app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }));
    this.app.use('/', (req: Request, res, next) => {
      console.log(req.user?.email, 'request user')
      next();
    })

    this.app.use('/', this.route.router);
  }



}