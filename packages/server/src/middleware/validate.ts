import { Request, Response, NextFunction } from 'express';
import Validator from '@customTypes/Validator';
import { ValidationError } from 'yup';
import CustomValidationError from '@twtr/common/source/types/ValidationError';
import { errors, CustomError } from '@utilities/CustomError';

const validate = (
  validators: Validator[],
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    let isError = false;
    try {
      for await (const validator of validators) {
        const { schema, target } = validator;
        const validationTarget = req[target];
        await schema.validate(validationTarget, {
          abortEarly: false,
        });
      }
    } catch (err) {
      isError = true;
      const validationErrors = err.inner.map(
        (error: ValidationError): CustomValidationError => {
          const { path, message } = error;
          return { name: path, message };
        },
      );
      const { status, message } = errors.BadRequest;
      const error = new CustomError(status, message, validationErrors);
      next(error);
    } finally {
      if (!isError) next();
    }
  };
};
export default validate;
