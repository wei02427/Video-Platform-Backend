import { ErrorRequestHandler } from 'express';

export const DefaultException: ErrorRequestHandler = (err, req, res, next) => {
    console.log('err',err)
    return res.status(err.status).json(err);
}
