// http-exception.filter.spec.ts
import { GlobalExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

describe('GlobalExceptionFilter', () => {
  let exceptionFilter: GlobalExceptionFilter;

  beforeEach(() => {
    exceptionFilter = new GlobalExceptionFilter();
  });

  it('should handle HttpException and return proper response', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockRequest = {
      url: '/test-path',
    } as Request;

    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    exceptionFilter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      path: '/test-path',
      message: 'Test error',
    });
  });

  it('should handle unknown exception and return 500 response', () => {
    const exception = new Error('Unknown error');

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockRequest = {
      url: '/test-path',
    } as Request;

    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    exceptionFilter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      path: '/test-path',
      message: 'Internal server error',
    });
  });
});
