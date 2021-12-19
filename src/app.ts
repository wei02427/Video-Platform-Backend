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
      name:'user',
      saveUninitialized: false,
      resave: true
    }))

  }
  private registerRoute(): void {

    // this.app.get('/', (req : Request, res) => {
    //   console.log(req.session)
    //   console.log(req.sessionID) 
    // })

    this.app.use('/', this.route.router);
  }

}