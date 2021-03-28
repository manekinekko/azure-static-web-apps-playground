import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'p',
    pathMatch: 'full',
  },
  {
    path: 'p',
    loadChildren: () =>
      import('./playground/playground.module').then((m) => m.PlaygroundModule),
  },
  {
    path: '**',
    redirectTo: '/p',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
