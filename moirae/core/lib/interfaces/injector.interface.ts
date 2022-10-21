import { InjectionToken, Provider } from "@nestjs/common";
import { PublisherToken } from "../moirae.constants";

export interface IInjectorReturn {
    exports: InjectionToken[];
    providers: Provider<any>[];
}

export type InjectorFunction = (token?: PublisherToken) => IInjectorReturn;