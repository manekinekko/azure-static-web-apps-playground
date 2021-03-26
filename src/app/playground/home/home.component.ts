import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  swaConfigRules = 'test';
  swaConfigRulesResulsts = 'test';

  constructor() {}

  ngOnInit(): void {}

  onSwaConfigRulesChanged(value: string) {
    this.swaConfigRulesResulsts = value;
  }
}
