import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DragDropDirective } from './drag-drop.directive';

export const routes: Route[] = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [HomeComponent, DragDropDirective],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class PlaygroundModule {}
