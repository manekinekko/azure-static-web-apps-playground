import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  swaConfigRules = '';
  swaConfigRulesResulsts = '';
  files: any = [];

  constructor() {}

  ngOnInit(): void {}

  onSwaConfigRulesChanged(value: string) {
    this.swaConfigRulesResulsts = value;
  }

  uploadFile(files: FileList) {
    const file = files?.item(0);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.swaConfigRules = e.target?.result;
        console.log({ e: this.swaConfigRules });
      };
      reader.readAsText(file);
    }
  }
  deleteAttachment(index: number) {
    this.files.splice(index, 1);
  }
}
