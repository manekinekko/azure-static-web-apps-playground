import { Injectable } from '@angular/core';

export type ResponseOverrideCode = '400' | '401' | '403' | '404';

export type StaticWebAppRouteRule = {
  $$match: boolean | undefined;
  $$id: number;
  route: string;
  rewrite?: string;
  redirect?: string;
  allowedRoles?: string[];
  headers: { [header: string]: string };
  statusCode: number;
  methods: Array<
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH'
  >;
}

export type StaticWebApp = {
  routes: StaticWebAppRouteRule[];

  navigationFallback: {
    rewrite: string;
    exclude: string[];
    $$match: boolean | undefined;
  };

  globalHeaders: { [header: string]: string };

  responseOverrides: {
    [key in ResponseOverrideCode]: {
      rewrite: string;
      statusCode?: number;
      redirect?: string;
    };
  };

  $$size: {
    globalHeaders: number;
    responseOverrides: number;
    routes: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class RulesParserService {
  constructor() {}

  parse(config: string): StaticWebApp | undefined {
    const parsedConfig = JSON.parse(config) as StaticWebApp;

    parsedConfig.routes.forEach((route, index: number) => (route.$$id = index));

    parsedConfig.$$size = {
      routes: parsedConfig.routes?.length,
      globalHeaders:
        parsedConfig.globalHeaders &&
        Object.keys(parsedConfig.globalHeaders).length,
      responseOverrides:
        parsedConfig.responseOverrides &&
        Object.keys(parsedConfig.responseOverrides).length,
    };

    return parsedConfig;
  }
}
