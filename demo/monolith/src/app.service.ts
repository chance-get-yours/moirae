import { Injectable } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";

@Injectable()
export class AppService {
  constructor(public readonly container: ModulesContainer) {}
  getHello(): string {
    return "Hello World!";
  }
}
