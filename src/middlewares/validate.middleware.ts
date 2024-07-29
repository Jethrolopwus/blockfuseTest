/* eslint-disable prettier/prettier */
import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { HttpException } from '@/exceptions/HttpException';

function validationMiddleware(type: any, value: string, skipMissingProperties = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(type, req[value]);
    validate(dtoInstance, { skipMissingProperties }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map((error: ValidationError) => Object.values(error.constraints).join(', ')).join('; ');
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
}

export default validationMiddleware;
