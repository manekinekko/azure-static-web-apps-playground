import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSelectChange } from '@angular/material/select';
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

      if (error.message.includes('Unexpected token')) {
        this.showMessage(`Invalid JSON: ${error.message}`);
      } else {
        this.showMessage(error.message);
      }
    }
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
