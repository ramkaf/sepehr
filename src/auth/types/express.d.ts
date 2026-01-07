import { IPayload } from 'libs/interfaces';

declare global {
  namespace Express {
    interface Request {
      user?: IPayload;
    }
  }
}
