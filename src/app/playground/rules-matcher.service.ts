import { Injectable } from '@angular/core';
import {
  StaticWebApp,
  StaticWebAppRouteMethod,
  StaticWebAppRouteRule
} from './rules-parser.service';

@Injectable({
  providedIn: 'root',
})
export class RulesMatcherService {
  constructor() {}

  reset(parsedConfig: StaticWebApp | undefined) {
    if (parsedConfig) {
      parsedConfig.routes.forEach((route) => {
        route.$$match = undefined;
      });
      parsedConfig.navigationFallback.$$match = undefined;
    }
  }

  matchRoutes(
    {
      route,
      method,
      roles,
    }: {
      route: string;
      method: StaticWebAppRouteMethod;
      roles: string[];
    },
    rules: StaticWebAppRouteRule[] | undefined
  ) {
    if (!rules || !route) return null;

    try {
      for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];

        const ruleRegEx = new RegExp(`^${rule.route.replace('*', '.*')}$`);
        const testRoute = ruleRegEx.test(route);

        if (testRoute) {
          rule.$$match = true;

          if (rule.methods?.length) {
            rule.$$match &&= !!method && rule.methods?.includes(method);
          }

          if (rule.allowedRoles) {
            rule.$$match &&=
              !!roles.length &&
              rule.allowedRoles?.some((role) => ~roles.indexOf(role));
          }
          if (rule.$$match) {
            return rule;
          }
        } else {
          rule.$$match = false;
        }
      }
      return null;
    } catch (e) {
      console.error(e);

      return null;
    }
  }
}
