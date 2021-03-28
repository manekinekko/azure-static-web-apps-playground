import { Injectable } from '@angular/core';
import { StaticWebApp } from './rules-parser.service';

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

  matchRoutes(route: string, rules: any[] | undefined) {
    try {
      route = route.replace('*', '.*');
      const regex = new RegExp(`^${route}$`);
      for (let index = 0; index <= rules?.length!; index++) {
        const rule = rules?.[index];
        if (rule) {
          if (regex.test(rule.route)) {
            rule.$$match = true;
            return rule;
          } else {
            rule.$$match = false;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}
