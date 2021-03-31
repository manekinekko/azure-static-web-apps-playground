import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSelectChange } from '@angular/material/select';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RulesEngineService } from '../rules-engine.service';
import {
  ResponseOverrideCode,
  RulesParserService,
  StaticWebApp,
  StaticWebAppRouteMethod,
} from '../rules-parser.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  swaConfigRules = '';
  swaConfigRulesObject: StaticWebApp | undefined = undefined;

  editorOptions = { theme: 'vs-dark', language: 'json' };

  testRoute = '/';
  testMethod: StaticWebAppRouteMethod = 'GET';
  testRoles = ['anonymous', 'authenticated'];
  requestHeaders: { [key: string]: string } = {};
  responseHeaders: { [key: string]: string } = {};
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('expansionPanelRouteRules')
  expansionPanelRouteRules: MatExpansionPanel;

  @ViewChild('expansionPanelNavigationFallback')
  expansionPanelNavigationFallback: MatExpansionPanel;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;

  editorInstance: monaco.editor.IStandaloneCodeEditor;

  constructor(
    private readonly rulesParser: RulesParserService,
    private readonly rulesEngine: RulesEngineService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const { fragment } = this.route.snapshot;
    if (fragment) {
      const [key, value] = fragment.split('/');
      if (key === 'c') {
        this.parseRules(window.atob(value));
      }
    }

    this.requestHeaders = {
      URL: this.testRoute,
      Method: `${this.testMethod}`,
      Cookie: `[${this.testRoles.join(', ')}]`,
    };
  }

  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editorInstance = editor;
  }

  onSwaConfigRulesChanged(value: string) {
    this.parseRules(value);
    this.syncConfigContentWithUrlHash(value);
  }

  showMessage(message: string) {
    this.snackBar.open(message, 'Got it', {
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      duration: 10000,
    });
  }
  hideMessage() {
    this.snackBar.dismiss();
  }

  processConfigFile(files: FileList) {
    const file = files?.item(0);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const fileContent = e.target?.result;
        this.syncConfigContentWithUrlHash(fileContent);

        this.parseRules(fileContent);
      };
      reader.readAsText(file);
    }
  }
  parseRules(content: string) {
    try {
      this.swaConfigRules = content;
      this.swaConfigRulesObject = this.rulesParser.parse(this.swaConfigRules);

      this.hideMessage();
    } catch (error) {
      console.error(error);

      const [__, line]: [string, string] = error.message.match(/line ([0-9]*)/);
      const [_, column]: [string, string] = error.message.match(/(\-+)/);
      this.showMessage(
        `Cannot process configuration file. Possible error on line ${line}.`
      );
      this.drawer.open();

      setTimeout(() => this.showErrorInEditor(+line, +column), 1000);
    }
  }

  showErrorInEditor(line: number, _column: number) {
    this.editorInstance.revealLineInCenter(+line);
    // const column = this.editorInstance.getModel()?.getLineFirstNonWhitespaceColumn(line);
    // console.log({column});

    // var decorations = this.editorInstance.deltaDecorations(
    //   [],
    //   [
    //     {
    //       range: new monaco.Range(line, 0, line, 0),
    //       options: {
    //         isWholeLine: true,
    //         className: 'myContentClass',
    //         glyphMarginClassName: 'myGlyphMarginClass',
    //         stickiness:
    //           monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    //       },
    //     },
    //   ]
    // );
    // const [_, position] = error.match(/at position (\d+)/);

    // const o = this.editorInstance.getModel()?.getPositionAt(line) as monaco.Position;
    // console.log({ o });

    // monaco.editor.setModelMarkers(this.editorInstance.getModel()!, 'owner', [
    //   {
    //     startLineNumber: o?.lineNumber,
    //     startColumn: column,
    //     endLineNumber: line,
    //     endColumn: column,
    //     message: 'Error',
    //     severity: monaco.MarkerSeverity.Error,
    //   },
    // ]);
  }

  syncConfigContentWithUrlHash(fileContent: string) {
    document.location.hash = `c/${window.btoa(fileContent)}`;
  }

  clearTestRoute() {
    this.rulesEngine.reset(this.swaConfigRulesObject);
    this.testRoute = '/';
  }

  onRouteInputChange(route: string) {
    this.rulesEngine.reset(this.swaConfigRulesObject);

    if (route) {
      this.requestHeaders = {
        URL: this.testRoute,
        Method: `${this.testMethod}`,
        Cookie: `[${this.testRoles.join(', ')}]`,
      };
      this.responseHeaders = {};

      // apply route rules
      const matchedRule = this.rulesEngine.matchRoute(
        { route, method: this.testMethod, roles: this.testRoles },
        this.swaConfigRulesObject?.routes
      );
      if (matchedRule) {
        this.expansionPanelRouteRules.open();

        this.responseHeaders = {
          URL: this.testRoute,
        };

        if (matchedRule.headers) {
          for (const header in matchedRule.headers) {
            if (matchedRule.headers.hasOwnProperty(header)) {
              this.responseHeaders[header] = matchedRule.headers[header];
            }
          }
        }
        if (matchedRule.redirect) {
          this.responseHeaders['Location'] = matchedRule.redirect;
        }
        if (matchedRule.rewrite) {
          this.responseHeaders['URL'] = matchedRule.rewrite;
        }
        this.responseHeaders['Status Code'] = `${
          matchedRule.statusCode || 200
        }`;
      }

      // apply navigation fallbacks
      const matchedNavigationFallback = this.rulesEngine.matchNavigationFallback(
        { route },
        this.swaConfigRulesObject?.navigationFallback
      );

      if (matchedNavigationFallback) {
        this.expansionPanelNavigationFallback.open();
      } else {
        this.responseHeaders['URL'] = this.swaConfigRulesObject
          ?.navigationFallback.rewrite as string;
      }

      // apply global headers
      if (this.swaConfigRulesObject?.globalHeaders) {
        for (const header in this.swaConfigRulesObject?.globalHeaders) {
          if (this.swaConfigRulesObject?.globalHeaders.hasOwnProperty(header)) {
            this.responseHeaders[
              header
            ] = this.swaConfigRulesObject?.globalHeaders[header];
          }
        }
      }

      // apply response overrides
      if (this.swaConfigRulesObject?.responseOverrides) {
        const statusCode = this.responseHeaders[
          'Status Code'
        ] as ResponseOverrideCode;
        if (this.swaConfigRulesObject?.responseOverrides[statusCode]) {
          if (
            this.swaConfigRulesObject?.responseOverrides[statusCode].redirect
          ) {
            this.responseHeaders['Location'] = this.swaConfigRulesObject
              ?.responseOverrides[statusCode].redirect as string;
          }
          if (
            this.swaConfigRulesObject?.responseOverrides[statusCode].rewrite
          ) {
            this.responseHeaders['URL'] = this.swaConfigRulesObject
              ?.responseOverrides[statusCode].rewrite as string;
            this.responseHeaders['Status Code'] = `200`;
          }
        }
      }
    }
  }

  onMethodInputChange(event: MatSelectChange) {
    this.testMethod = event.value;
    this.onRouteInputChange(this.testRoute);
  }

  addRole(event: MatChipInputEvent): void {
    const input = event.input;
    const value = (event.value || '').trim();
    if (value && !this.testRoles.includes(value)) {
      this.testRoles.push(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.onRouteInputChange(this.testRoute);
  }

  removeRole(role: string): void {
    const index = this.testRoles.indexOf(role);

    if (index >= 0) {
      this.testRoles.splice(index, 1);
    }

    this.onRouteInputChange(this.testRoute);
  }
}
