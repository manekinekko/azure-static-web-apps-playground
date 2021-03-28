import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RulesParserService, StaticWebApp } from '../rules-parser.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  swaConfigRules = '';
  swaConfigRulesError = '';
  swaConfigRulesResulsts: StaticWebApp | null = null;

  editorOptions = { theme: 'vs-dark', language: 'json' };

  testRoute = '';

  constructor(
    private readonly rules: RulesParserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  onSwaConfigRulesChanged(value: string) {
    this.parseRules(value);
  }

  showMessage(message: string) {
    this.snackBar.open(message, 'Got it', {
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  uploadFile(files: FileList) {
    const file = files?.item(0);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.parseRules(e.target?.result);
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
}
