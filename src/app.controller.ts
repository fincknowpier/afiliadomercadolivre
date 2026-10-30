import { Controller, Get, Header } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Controller()
export class AppController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  admin() {
    return readFileSync(join(process.cwd(), 'public', 'index.html'), 'utf8');
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'radar-de-ofertas' };
  }
}
