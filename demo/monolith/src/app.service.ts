import { Injectable } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }
}
