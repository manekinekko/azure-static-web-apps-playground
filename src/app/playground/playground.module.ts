import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DragDropDirective } from './drag-drop.directive';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { FormsModule } from '@angular/forms';

const MAT_MODULES = [MatSidenavModule, MatExpansionModule, MatListModule,MatSnackBarModule, MatIconModule, MatDividerModule];

export const routes: Route[] = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [HomeComponent, DragDropDirective],
  imports: [FormsModule, MonacoEditorModule, CommonModule, RouterModule.forChild(routes), ...MAT_MODULES],
})
export class PlaygroundModule {}
