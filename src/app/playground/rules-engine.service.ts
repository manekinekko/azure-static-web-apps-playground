import { Injectable } from '@angular/core';
import {
  StaticWebApp,
  StaticWebAppNavigationFallback,
  StaticWebAppNavigationFallbackExclusion,
  StaticWebAppRouteMethod,
  StaticWebAppRouteRule,
} from './rules-parser.service';

@Injectable({
  providedIn: 'root',
})
export class RulesEngineService {
  constructor() {}

  reset(parsedConfig: StaticWebApp | undefined) {
    if (parsedConfig) {
      parsedConfig.routes?.forEach((route) => {
        route.$$match = undefined;
      });
      if (parsedConfig.navigationFallback) {
        parsedConfig.navigationFallback.$$exclude?.forEach((rule) => {
          rule.$$match = undefined;
        });
      }
    }
  }

  matchRoute(
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

  matchNavigationFallback(
    {
      route,
    }: {
      route: string;
    },
    rules: StaticWebAppNavigationFallback | undefined
  ): StaticWebAppNavigationFallbackExclusion | null {
    if (rules?.$$exclude) {
      for (let index = 0; index < rules.$$exclude.length!; index++) {
        const exclusion = rules.$$exclude[index];
        // convert experesion {png,jpg,gif} to a valid regex (png|jpg|gif)
        let exclusionExpression = exclusion.$$value;
        const filesExtensionMatch = exclusionExpression.match(/{.*}/);
        if (filesExtensionMatch) {
          const filesExtensionExpression = filesExtensionMatch[0];
          if (filesExtensionExpression) {
            // build a regex group (png|jpg|gif)
            const filesExtensionRegEx = filesExtensionExpression
              .replace(/\,/g, '|')
              .replace('{', '(')
              .replace('}', ')');
            exclusionExpression = exclusionExpression.replace(
              filesExtensionExpression,
              filesExtensionRegEx
            );
          }
        }

        // turn expression into a valid regex
        exclusionExpression = exclusionExpression
          .replace(/\//g, '\\/')
          .replace('*.', '.*')
          .replace('/*', '/.*');

        if (new RegExp(`${exclusionExpression}`).test(route)) {
          exclusion.$$match = true;
          return exclusion;
        }

        exclusion.$$match = false;
      }
    }

    return null;
  }
}
