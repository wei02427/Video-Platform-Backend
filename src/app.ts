import express, { ErrorRequestHandler, Request } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { AppRoute } from './app.routing';
import session from 'express-session';

export class App {

  private app = express();
  private route = new AppRoute();
  constructor() {
    this.setHelmet();
    this.setCors();
    this.setSession();
    this.registerRoute();
  }

  // ====================================================================
  // @Public Methods
  // ====================================================================

  public bootstrap(): void {
    this.app.listen(3000, () => console.log(`API Server is running at port ${3000}.`));
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
        maxAge: 1000 * 60 * 10, // 設定 session 的有效時間，單位毫秒
      }
    }))

  }
  private registerRoute(): void {

    this.app.use('/', (req: Request, res,next) => {
      console.log(req.sessionID)
      console.log(req.session.user)
      next();
    })

    this.app.use('/', this.route.router);
  }

}