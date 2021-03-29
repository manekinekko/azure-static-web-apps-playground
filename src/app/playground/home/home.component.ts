import { Component, OnInit, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RulesMatcherService } from '../rules-matcher.service';
import { RulesParserService, StaticWebApp } from '../rules-parser.service';

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
    const [key, value] = fragment.split('=');
    if (key === 'c') {
      this.parseRules(window.atob(value));
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
      duration: 5000,
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
      this.showMessage(error.message);
    }
  }

  syncConfigContentWithUrlHash(fileContent: string) {
    document.location.hash = `c=${window.btoa(fileContent)}`;
  }

  clearTestRoute() {
    this.matcher.reset(this.swaConfigRulesObject);
    this.testRoute = '';
  }

  onRouteInput(route: string) {
    this.matcher.reset(this.swaConfigRulesObject);
    if (route) {
      const matchedRule = this.matcher.matchRoutes(
        route,
        this.swaConfigRulesObject?.routes
      );
      if (matchedRule) {
        this.expansionPanelRouteRules.open();
      }
    }
  }
}
