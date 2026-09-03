import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { adminAuthGuard } from './core/services/admin.guard';
import {
  ConsultationRequestListComponent
} from "src/app/demo/pages/consulting/consultation-request-list/consultation-request-list.component";
import {
  ConsultingOfferFormComponent
} from "src/app/demo/pages/consulting/consulting-offer-form/consulting-offer-form.component";
import {
  ConsultingOfferListComponent
} from "src/app/demo/pages/consulting/consulting-offer-list/consulting-offer-list.component";
import {
  ConsultationRequestDetailComponent
} from "src/app/demo/pages/consulting/consultation-request-detail/consultation-request-detail.component";
import {
  ConsultingOfferDetailComponent
} from "src/app/demo/pages/consulting/consulting-offer-detail/consulting-offer-detail.component";
import {CategoryDetailComponent} from "src/app/demo/pages/category/category-detail/category-detail.component";
import {CourseDetailComponent} from "src/app/demo/pages/formations/course-detail/course-detail.component";

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [adminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/dashboard/dashboard.component').then((c) => c.DashboardComponent)
      },
      {
        path: 'basic',
        loadChildren: () => import('./demo/ui-elements/ui-basic/ui-basic.module').then((m) => m.UiBasicModule)
      },
      {
        path: 'forms',
        loadComponent: () => import('./demo/pages/form-element/form-element').then((c) => c.FormElement)
      },
      {
        path: 'tables',
        loadComponent: () => import('./demo/pages/tables/tbl-bootstrap/tbl-bootstrap.component').then((c) => c.TblBootstrapComponent)
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./demo/pages/core-chart/apex-chart/apex-chart.component').then((c) => c.ApexChartComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/extra/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: 'formations',
        loadComponent: () => import('./demo/pages/formations/formations-list/formations-list.component').then((c) => c.FormationsListComponent)
      },
      {
        path: 'formations/new',
        loadComponent: () => import('./demo/pages/formations/formation-form/formation-form.component').then((c) => c.FormationFormComponent)
      },
      {
        path: 'formations/:id',
        loadComponent: () => import('./demo/pages/formations/formation-detail/formation-detail.component').then((c) => c.FormationDetailComponent)
      },
      {
        path: 'formations/:id/edit',
        loadComponent: () => import('./demo/pages/formations/formation-form/formation-form.component').then((c) => c.FormationFormComponent)
      },
      {
        path: 'formations/:id/courses',
        loadComponent: () => import('./demo/pages/formations/courses-list/courses-list.component').then((c) => c.CoursesListComponent)
      },
      {
        path: 'formations/:id/courses/new',
        loadComponent: () => import('./demo/pages/formations/course-form/course-form.component').then((c) => c.CourseFormComponent)
      },
      {
        path: 'formations/:id/courses/:courseId',
        component: CourseDetailComponent
      },
      {
        path: 'formations/:id/courses/:courseId/edit',
        loadComponent: () => import('./demo/pages/formations/course-form/course-form.component').then((c) => c.CourseFormComponent)
      },
      {
        path: 'consulting',
        children: [
          { path: '', component: ConsultingOfferListComponent },
          { path: 'new', component: ConsultingOfferFormComponent },
          { path: ':id/edit', component: ConsultingOfferFormComponent },
          { path: ':id', component: ConsultingOfferDetailComponent },
          {
            path: 'requests',
            children: [
              { path: '', component: ConsultationRequestListComponent },
              { path: ':id', component: ConsultationRequestDetailComponent }
            ]
          }
        ]
      },
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadComponent: () => import('./demo/pages/category/category-list/category-list.component')
              .then((c) => c.CategoryListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./demo/pages/category/category-form/category-form.component')
              .then((c) => c.CategoryFormComponent)
          },
          { path: ':id', component: CategoryDetailComponent },

          {
            path: ':id/edit',
            loadComponent: () => import('./demo/pages/category/category-form/category-form.component')
              .then((c) => c.CategoryFormComponent)
          }
        ]
      }
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-signin/auth-signin.component').then((c) => c.AuthSigninComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./demo/pages/authentication/auth-signup/auth-signup.component').then((c) => c.AuthSignupComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
