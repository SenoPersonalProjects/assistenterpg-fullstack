import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../exceptions/base.exception';
import { HttpExceptionFilter } from './http-exception.filter';

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
  setHeader: jest.Mock;
};

function getJsonBody(response: MockResponse): Record<string, unknown> {
  const calls = response.json.mock.calls as Array<[Record<string, unknown>]>;
  return calls[0][0];
}

function createMockResponse(): MockResponse {
  const response = {
    statusCode: 200,
    setHeader: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as MockResponse;

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
}

function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: 'POST',
    url: '/campanhas',
    originalUrl: '/campanhas?pagina=1',
    header: jest.fn().mockImplementation((name: string) => {
      if (name.toLowerCase() === 'x-request-id') {
        return 'trace-fixed-id';
      }
      return undefined;
    }),
    ...overrides,
  } as Request;
}

function createHost(request: Request, response: Response): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
  it('should return VALIDATION_ERROR with validation details for bad request arrays', () => {
    const filter = new HttpExceptionFilter();
    const request = createMockRequest();
    const response = createMockResponse();
    const host = createHost(request, response);

    const exception = new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['nome must be a string'],
      error: 'Bad Request',
    });

    filter.catch(exception, host);

    expect(response.setHeader).toHaveBeenCalledWith(
      'x-request-id',
      'trace-fixed-id',
    );
    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

    const body = getJsonBody(response);
    expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body.traceId).toBe('trace-fixed-id');
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.error).toBe('Bad Request');
    expect(body.message).toEqual(['nome must be a string']);
    expect(body.details).toEqual({
      validationErrors: ['nome must be a string'],
    });
    expect(body.path).toBe('/campanhas?pagina=1');
    expect(body.method).toBe('POST');
  });

  it('should keep domain code/details from BaseException', () => {
    const filter = new HttpExceptionFilter();
    const request = createMockRequest({
      method: 'PATCH',
      originalUrl: '/inventario/item/10',
      url: '/inventario/item/10',
    });
    const response = createMockResponse();
    const host = createHost(request, response);

    const exception = new BaseException(
      'Item nao encontrado',
      HttpStatus.NOT_FOUND,
      'ITEM_INVENTARIO_NOT_FOUND',
      { itemId: 10 },
      'itemId',
    );

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);

    const body = getJsonBody(response);
    expect(body.code).toBe('ITEM_INVENTARIO_NOT_FOUND');
    expect(body.error).toBe('Not Found');
    expect(body.message).toBe('Item nao encontrado');
    expect(body.details).toEqual({ itemId: 10 });
    expect(body.field).toBe('itemId');
  });
});
