import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { RulesParserService, StaticWebApp } from '../rules-parser.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  swaConfigRules = '';
  swaConfigRulesResulsts: StaticWebApp | null = null;

  editorOptions = { theme: 'vs-dark', language: 'json' };

  testRoute = '';

  constructor(
    private readonly rules: RulesParserService,
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
      this.swaConfigRulesResulsts = this.rules.parse(this.swaConfigRules);
    } catch (error) {
      this.showMessage(error.message);
    }
  }

  syncConfigContentWithUrlHash(fileContent: string) {
    document.location.hash = `c=${window.btoa(fileContent)}`;
  }
}
