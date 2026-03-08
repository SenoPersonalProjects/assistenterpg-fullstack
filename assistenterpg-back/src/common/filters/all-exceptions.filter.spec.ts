import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AllExceptionsFilter } from './all-exceptions.filter';

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
    method: 'GET',
    url: '/personagens-base/meus',
    originalUrl: '/personagens-base/meus',
    header: jest.fn().mockImplementation((name: string) => {
      if (name.toLowerCase() === 'x-request-id') {
        return 'trace-error-flow';
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

describe('AllExceptionsFilter', () => {
  it('should normalize HttpException payload using default code map', () => {
    const filter = new AllExceptionsFilter();
    const request = createMockRequest();
    const response = createMockResponse();
    const host = createHost(request, response);

    const exception: HttpException = new UnauthorizedException(
      'Token invalido',
    );

    filter.catch(exception, host);

    expect(response.setHeader).toHaveBeenCalledWith(
      'x-request-id',
      'trace-error-flow',
    );
    expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);

    const body = getJsonBody(response);
    expect(body.traceId).toBe('trace-error-flow');
    expect(body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(body.code).toBe('UNAUTHORIZED');
    expect(body.error).toBe('Unauthorized');
    expect(body.message).toBe('Token invalido');
  });

  it('should return INTERNAL_ERROR for unknown exceptions', () => {
    const filter = new AllExceptionsFilter();
    const request = createMockRequest({
      method: 'POST',
      url: '/inventario/adicionar',
      originalUrl: '/inventario/adicionar',
    });
    const response = createMockResponse();
    const host = createHost(request, response);

    filter.catch(new Error('falha inesperada'), host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    const body = getJsonBody(response);
    expect(body.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(body.error).toBe('Internal Server Error');
    expect(body.message).toBe('Erro interno no servidor');
    expect(body.traceId).toBe('trace-error-flow');
  });
});
