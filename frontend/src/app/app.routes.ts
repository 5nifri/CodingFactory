import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { FormationList } from './formation/formation-list/formation-list';
import { FormationDetail } from './formation/formation-detail/formation-detail';
import { Dashboard } from './dashboard/dashboard';
import { studentGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'formations', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'formations', component: FormationList },
  { path: 'formations/:id', component: FormationDetail },
  { path: 'dashboard', component: Dashboard, canActivate: [studentGuard] },
  { path: '**', redirectTo: 'formations' }
];
