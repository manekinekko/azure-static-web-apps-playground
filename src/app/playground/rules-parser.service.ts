import { Injectable } from '@angular/core';
import * as jsonlint from 'jsonlint-mod';

export type ResponseOverrideCode = '400' | '401' | '403' | '404';
export type StaticWebAppRouteMethod =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'PATCH';

export type StaticWebAppRouteRule = {
  $$match: boolean | undefined;
  $$id: number;
  route: string;
  rewrite?: string;
  redirect?: string;
  allowedRoles?: string[];
  headers: { [header: string]: string };
  statusCode: number;
  methods: StaticWebAppRouteMethod[];
};

export type StaticWebAppNavigationFallbackExclusion = {
  $$match: boolean | undefined;
  $$id: number;
  $$value: string;
};

export type StaticWebAppNavigationFallback = {
  rewrite: string;
  exclude?: string;
  $$exclude?: StaticWebAppNavigationFallbackExclusion[];
};

export type StaticWebApp = {
  routes: StaticWebAppRouteRule[];

  navigationFallback: StaticWebAppNavigationFallback;

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
};

@Injectable({
  providedIn: 'root',
})
export class RulesParserService {
  constructor() {}

  parse(config: string): StaticWebApp | undefined {
    // run a JSON lint before parsing
    try {
      jsonlint.parse(config);
    } catch (e) {
      throw e;
    }

    const parsedConfig = JSON.parse(config) as StaticWebApp;

    // routes
    parsedConfig?.routes?.forEach(
      (route, index: number) => (route.$$id = index)
    );

    // navigationFallback
    if (parsedConfig?.navigationFallback?.exclude) {
      parsedConfig.navigationFallback.$$exclude = [];
      for (
        let index = 0;
        index < parsedConfig.navigationFallback.exclude.length;
        index++
      ) {
        const excludeRule = parsedConfig.navigationFallback.exclude[index];
        parsedConfig.navigationFallback.$$exclude?.push({
          $$value: excludeRule,
          $$id: index,
          $$match: undefined,
        });
      }
    }

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
