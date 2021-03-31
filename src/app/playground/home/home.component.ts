import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSelectChange } from '@angular/material/select';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RulesMatcherService } from '../rules-matcher.service';
import {
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

  testRoute = '';
  testMethod: StaticWebAppRouteMethod = 'GET';
  testRoles = ['anonymous', 'authenticated'];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('expansionPanelRouteRules')
  expansionPanelRouteRules: MatExpansionPanel;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;

  editorInstance: monaco.editor.IStandaloneCodeEditor;

  constructor(
    private readonly rules: RulesParserService,
    private readonly matcher: RulesMatcherService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const { fragment } = this.route.snapshot;
    if (fragment) {
      const [key, value] = fragment.split('=');
      if (key === 'c') {
        this.parseRules(window.atob(value));
      }
    }
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
      this.swaConfigRulesObject = this.rules.parse(this.swaConfigRules);
    } catch (error) {
      console.error(error);

      const [__, line]: [string, string] = error.message.match(/line ([0-9]*)/);
      const [_, column]: [string, string] = error.message.match(/(\-+)/);

      this.showMessage(
        `Cannot process configuration file. Possible error on line ${line}.`
      );
      this.drawer.open();
      setTimeout(() => this.showErrorInEditor(+line, column.length + 1), 1000);
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
    document.location.hash = `c=${window.btoa(fileContent)}`;
  }

  clearTestRoute() {
    this.matcher.reset(this.swaConfigRulesObject);
    this.testRoute = '';
  }

  onRouteInputChange(route: string) {
    this.matcher.reset(this.swaConfigRulesObject);
    if (route) {
      const matchedRule = this.matcher.matchRoutes(
        { route, method: this.testMethod, roles: this.testRoles },
        this.swaConfigRulesObject?.routes
      );
      if (matchedRule) {
        this.expansionPanelRouteRules.open();
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
      this.testRoles.push(value.trim());
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
