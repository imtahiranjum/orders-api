import { Body, Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async sendMessage(@Body() request: any) {
    await this.appService.sendMessage(request);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
