import { Injectable } from '@angular/core';

export type ResponseOverrideCode = '400' | '401' | '403' | '404';

export interface StaticWebApp {
  routes: Array<{
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
  }>;

  navigationFallback: {
    rewrite: string;
    exclude: string[];
  };

  globalHeaders: { [header: string]: string };

  responseOverrides: {
    [key in ResponseOverrideCode]: {
      rewrite: string;
      statusCode?: number;
      redirect?: string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class RulesParserService {
  constructor() {}

  parse(config: string): StaticWebApp | null {
    try {
      const configObject = JSON.parse(config) as StaticWebApp;
      return configObject;
    } catch (error) {
      console.error(error);
    }
    return null;
  }
}
