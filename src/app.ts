import express, { ErrorRequestHandler } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { AppRoute } from './app.routing';


export class App {

  private app = express();
  private route = new AppRoute();
  constructor() {
    this.setHelmet();
    this.setCors();
    this.registerRoute();
  }

  // ====================================================================
  // @Public Methods
  // ====================================================================

  public bootstrap(): void {
    this.app.listen(3000, () => console.log(`API Server is running at port ${ 3000 }.`));
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

  private registerRoute(): void {
    this.app.use('/', this.route.router);
  }

}