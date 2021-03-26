import { Component, OnInit } from '@angular/core';
import { RulesParserService, StaticWebApp } from '../rules-parser.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  swaConfigRules = '';
  swaConfigRulesResulsts: StaticWebApp | null = null;
  files: any = [];

  constructor(private readonly rules: RulesParserService) {}

  ngOnInit(): void {}

  onSwaConfigRulesChanged(value: string) {
    this.parseRules(value);
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
    this.swaConfigRules = content;
    this.swaConfigRulesResulsts = this.rules.parse(this.swaConfigRules);
  }
}
