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
import io from 'socket.io';
import _ from 'lodash';

export class App {

  private app = express();
  private route = new AppRoute();
  private accountService = new AccountService();
  private accountModel = new AccountModel();
  private server: http.Server;
  private socketIo = new io.Server();
  private users: { uid: string, socketIds: string[] }[] = [];


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
    this.app.use(cors());
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
  private setSocket(): void {
    this.socketIo.listen(this.server);

    const self = this;
    this.socketIo.on('connection', function (socket) {


      socket.on('user_login', function (info) {

        const { uid, socketId } = info;
        self.addUserSocketId(uid, socketId);
        console.log(self.users);
      });


      socket.on('disconnect', function () {
        console.log('user disconnected   ', socket.id);
        self.deleteSocketId(socket.id);
        console.log(self.users);
      });
    });

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


  // utils

  private addUserSocketId(uid: string, socketId: string) {

    for (const user of this.users) {
      if (user.uid === uid) {
        if (!_.includes(user.socketIds, socketId))
          user.socketIds.push(socketId);
        return;
      }
    };

    this.users.push({ uid, socketIds: [socketId] });


  }

  private deleteSocketId(socketId: string) {

    _.forEach(this.users, user => {
      if (_.includes(user.socketIds, socketId)) {
        _.pull(user.socketIds, socketId);
        return;
      }
    });



  }
}