import { Request, Response } from 'express';

export const handler = async (req: Request, res: Response) => {
  res.status(200).send('Hello, world!');
};
