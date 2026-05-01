import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

type PrismaKnownError = Prisma.PrismaClientKnownRequestError;

function normalizeTarget(target: unknown): string[] {
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === 'string') return [target];
  return [];
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaKnownError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const target = normalizeTarget(
      (exception.meta as { target?: unknown } | undefined)?.target,
    );

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Erro de persistência de dados.';

    switch (exception.code) {
      case 'P2000':
        status = HttpStatus.BAD_REQUEST;
        message = 'Um ou mais campos excedem o tamanho permitido.';
        break;
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = target.some((item) => item.toLowerCase().includes('email'))
          ? 'Email já cadastrado.'
          : 'Já existe um registro com os dados informados.';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Não foi possível concluir a ação por referência inválida.';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado.';
        break;
      default:
        status = HttpStatus.BAD_REQUEST;
        message = 'Não foi possível concluir a ação.';
        break;
    }

    this.logger.error(
      `Prisma error ${exception.code} on ${request.method} ${request.url}`,
      exception.stack,
    );
    this.logger.error(
      `Prisma details: ${JSON.stringify({
        message: exception.message,
        meta: exception.meta,
      })}`,
    );

    response.status(status).json({
      statusCode: status,
      message,
      code: exception.code,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

