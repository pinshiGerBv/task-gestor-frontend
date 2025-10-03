import { Routes } from '@angular/router';
import { TasksPageComponent } from './features/tasks/pages/tasks-page/tasks-page';

export const routes: Routes = [
  { path: 'tasks', component: TasksPageComponent },
  { path: '', pathMatch: 'full', redirectTo: 'tasks' }
];
