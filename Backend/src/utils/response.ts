import { Either } from '@shared/either';
import { handleErrorLog, IError } from '@shared/error';
import { HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { gzipSync } from 'zlib';

function compress(
  req: Request,
  res: Response,
  data: any,
  onError: (error: Error) => void,
): any | Buffer {
  try {
    if (typeof data === 'undefined' || data === null) {
      return data;
    }
    if (!req.headers?.['accept-encoding']?.includes?.('gzip')) {
      return data;
    }
    const toCompress = typeof data === 'object' ? JSON.stringify(data) : data;
    const buffer = Buffer.from(toCompress, 'utf8');
    const compressed = gzipSync(buffer, {
      level: 9,
      memLevel: 9,
    });
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Length', compressed.length.toString());
    return compressed;
  } catch (error) {
    onError(error);
    return data;
  }
}

export const sendUseCaseHttpResponse = <
  T extends Either<IError, any>,
>(options: {
  resource: T;
  req: Request;
  res: Response;
  loggerInstance?: Logger;
  statusCode?: HttpStatus;
  contentType?: 'json' | 'html';
}): T['value'] => {
  const {
    resource,
    req,
    res,
    loggerInstance,
    statusCode = 200,
    contentType = 'json',
  } = options;
  if (resource.isLeft()) {
    handleErrorLog(resource.value, loggerInstance);
    return res
      .status(resource.value.httpCode)
      .type(contentType)
      .send(resource.value);
  }
  return res
    .status(statusCode)
    .type(contentType)
    .send(
      compress(req, res, resource.value, (error) => {
        handleErrorLog(error, loggerInstance);
      }),
    );
};

export const mockExpressResponseObject: () => Partial<Response> = () => ({
  status: jest.fn().mockReturnThis(),
  type: jest.fn().mockReturnThis(),
  send: (value: any): any => jest.fn().mockReturnValue(value)(),
  json: (value: any): any => jest.fn().mockReturnValue(value)(),
});

export const mockExpressRequestObject: () => Request = () => ({}) as any;
