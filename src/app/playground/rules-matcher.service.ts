import { Injectable } from '@angular/core';
import { StaticWebApp, StaticWebAppRouteRule } from './rules-parser.service';

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

  matchRoutes(route: string, rules: StaticWebAppRouteRule[] | undefined) {
    if (!rules) return null;

    try {
      for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];
        const ruleRegEx = new RegExp(`^${rule.route.replace('*', '.*')}$`);
        if (ruleRegEx.test(route)) {
          rule.$$match = true;
          return rule;
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
