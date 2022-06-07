import { RegisterType } from "@moirae/core";

@RegisterType()
export class UniqueConstraintError extends Error {
  constructor(entityName: string, property: string) {
    super();
    this.message = `Duplicate value for ${entityName}.${property}`;
    this.name = this.constructor.name;
  }
}
