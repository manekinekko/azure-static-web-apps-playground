import { Injectable } from '@angular/core';
import {
  ResponseOverrideCode,
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

  applyRules(
    {
      route,
      method,
      roles,
    }: { route: string; method: StaticWebAppRouteMethod; roles: string[] },
    swaConfigRulesObject: StaticWebApp | undefined
  ) {
    let responseHeaders: { [key: string]: string } = {};
    let shouldExpansionPanelNavigationFallback = false;
    let shouldExpansionPanelRouteRules = false;

    // apply route rules
    const matchedRule = this.applyRouteRules(
      { route, method, roles },
      swaConfigRulesObject?.routes
    );
    if (matchedRule) {
      shouldExpansionPanelRouteRules = true;

      responseHeaders = {
        URL: route,
      };

      if (matchedRule.headers) {
        for (const header in matchedRule.headers) {
          if (matchedRule.headers.hasOwnProperty(header)) {
            responseHeaders[header] = matchedRule.headers[header];
          }
        }
      }
      if (matchedRule.redirect) {
        responseHeaders['Location'] = matchedRule.redirect;
      }
      if (matchedRule.rewrite) {
        responseHeaders['URL'] = matchedRule.rewrite;
      }
      responseHeaders['Status Code'] = `${matchedRule.statusCode || 200}`;
    }

    // apply navigation fallbacks (only if no route rule was applied)
    if (!matchedRule) {
      const matchedNavigationFallback = this.matchNavigationFallback(
        { route },
        swaConfigRulesObject?.navigationFallback
      );

      if (matchedNavigationFallback) {
        shouldExpansionPanelNavigationFallback = true;
      } else {
        responseHeaders['URL'] = swaConfigRulesObject?.navigationFallback
          .rewrite as string;
      }
    }

    // apply global headers
    if (swaConfigRulesObject?.globalHeaders) {
      for (const header in swaConfigRulesObject?.globalHeaders) {
        if (swaConfigRulesObject?.globalHeaders.hasOwnProperty(header)) {
          responseHeaders[header] = swaConfigRulesObject?.globalHeaders[header];
        }
      }
    }

    // apply response overrides
    if (swaConfigRulesObject?.responseOverrides) {
      const statusCode = responseHeaders['Status Code'] as ResponseOverrideCode;
      if (swaConfigRulesObject?.responseOverrides[statusCode]) {
        if (swaConfigRulesObject?.responseOverrides[statusCode].redirect) {
          responseHeaders['Location'] = swaConfigRulesObject?.responseOverrides[
            statusCode
          ].redirect as string;
        }
        if (swaConfigRulesObject?.responseOverrides[statusCode].rewrite) {
          responseHeaders['URL'] = swaConfigRulesObject?.responseOverrides[
            statusCode
          ].rewrite as string;
          responseHeaders['Status Code'] = `200`;
        }
      }
    }

    return {
      responseHeaders,
      shouldExpansionPanelNavigationFallback,
      shouldExpansionPanelRouteRules,
    };
  }

  applyRouteRules(
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

        const ruleRegEx = new RegExp(`^${this.globToRegExp(rule.route)}$`);
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
        let exclusionExpression = this.globToRegExp(exclusion.$$value);

        if (new RegExp(`${exclusionExpression}`).test(route)) {
          exclusion.$$match = true;
          return exclusion;
        }

        exclusion.$$match = false;
      }
    }

    return null;
  }

  private globToRegExp(glob: string) {
    const filesExtensionMatch = glob.match(/{.*}/);
    if (filesExtensionMatch) {
      const filesExtensionExpression = filesExtensionMatch[0];
      if (filesExtensionExpression) {
        // build a regex group (png|jpg|gif)
        const filesExtensionRegEx = filesExtensionExpression
          .replace(/\,/g, '|')
          .replace('{', '(')
          .replace('}', ')');
        glob = glob.replace(filesExtensionExpression, filesExtensionRegEx);
      }
    }

    // turn expression into a valid regex
    return glob.replace(/\//g, '\\/').replace('*.', '.*').replace('/*', '/.*');
  }
}
