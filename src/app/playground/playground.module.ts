import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Route, RouterModule } from '@angular/router';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { DragDropDirective } from './drag-drop.directive';
import { HomeComponent } from './home/home.component';

const MAT_MODULES = [
  MatInputModule,
  MatSelectModule,
  MatSidenavModule,
  MatExpansionModule,
  MatListModule,
  MatSnackBarModule,
  MatIconModule,
  MatDividerModule,
];

export const routes: Route[] = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [HomeComponent, DragDropDirective],
  imports: [
    FormsModule,
    MonacoEditorModule,
    CommonModule,
    RouterModule.forChild(routes),
    ...MAT_MODULES,
  ],
})
export class PlaygroundModule {}
