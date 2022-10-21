import { applyDecorators } from "@nestjs/common";
import { Expose } from "class-transformer";
import { PROJECTION_METADATA } from "../moirae.constants";

/**
 * Decorator applied to properties that overlap with the projection
 * of an aggregate, including getters.
 */
export const Projection = (): PropertyDecorator =>
  applyDecorators(Expose({ groups: [PROJECTION_METADATA] }));
