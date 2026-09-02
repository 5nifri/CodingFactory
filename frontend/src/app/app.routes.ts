import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './home/home/home';
import { ConsultingHome } from './consulting/consulting-home/consulting-home';
import { EFormationHome } from './e-formation/e-formation-home/e-formation-home';
import { FormationDetail } from './e-formation/formation-detail/formation-detail';
import {Login} from './auth/login/login';
import {Register} from './auth/register/register';
import { studentGuard } from './core/guards/role.guard';
import { MyEnrollments } from './e-formation/my-enrollments/my-enrollments'
import { CourseView } from './e-formation/course-view/course-view';
import { ConsultingOfferDetail } from './consulting/consulting-offer-detail/consulting-offer-detail';
import { authGuard } from './core/guards/auth.guard';
import { MyRequests } from './consulting/my-requests/my-requests';
import {EFormationCatalogue} from './e-formation/e-formation-catalogue/e-formation-catalogue';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'consulting', component: ConsultingHome },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'e-formation', component: EFormationHome },
      { path: 'e-formation/catalogue', component: EFormationCatalogue },
      { path: 'e-formation/:id', component: FormationDetail },
      { path: 'mes-formations', component: MyEnrollments, canActivate: [studentGuard] },
      { path: 'e-formation/:formationId/courses/:courseId', component: CourseView, canActivate: [studentGuard] },
      { path: 'consulting/:id', component: ConsultingOfferDetail },
      { path: 'mes-demandes', component: MyRequests, canActivate: [authGuard] },

    ]
  },
  { path: '**', redirectTo: '' }
];
