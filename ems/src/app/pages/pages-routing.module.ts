import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';
import {AuthGuard} from '../modules/auth/_services/auth.guard';
import {CONFIG} from '../utils/constants';
import {ProvVicePresidentGuard} from '../modules/auth/_services/prov-vice-president.guard';
import {TechStaffGuard} from '../modules/auth/_services/tech-staff.guard';
import {InfraStaffGuard} from '../modules/auth/_services/infra-staff.guard';
import { CorpStaffGuard } from '../modules/auth/_services/corp-staff.guard';
import { PnoStaffGuard } from '../modules/auth/_services/pno_staff.guard';
import { CndStaffGuard } from '../modules/auth/_services/cnd_staff.guard';
import { CnStaffGuard } from '../modules/auth/_services/cn_staff.guard';
import { TccnStaffGuard } from '../modules/auth/_services/tccn_staff.guard';
import { GrandTcStaffGuard } from '../modules/auth/_services/grand_tc_staff.guard';
import { NocStaffGuard } from '../modules/auth/_services/noc_staff.guard';

const routes: Routes = [
  {
    component: LayoutComponent,
    canActivate: [CorpStaffGuard],
    matcher: (url) => {
      const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
      if (userPermission === CONFIG.USER_ROLE.CMS_CORP_STAFF) {
        return url.length ? {consumed: []} : {consumed: url};
      }
      return null;
    },
    children: [
      {
        path: 'station-management',
        loadChildren: () =>
            import('./station-management/station-management.module').then((m) => m.StationManagementModule),
      },
      // {
      //   path: 'bts-management',
      //   loadChildren: () =>
      //     import('./bts-management/bts-management.module').then((m) => m.BtsManagementModule),
      // },
      // Giám sát công trình
      {
        path: 'project-supervision',
        loadChildren: () =>
            import('./corp_infastructure_staff/project-supervision/project-supervision.module').then((m) => m.ProjectSupervisionModule),
      },
      {
        path: 'station-progress-report',
        loadChildren: () =>
          import('./corp_infastructure_staff/export-reports/export-reports.module').then((m) => m.ExportReportsModule)
      },
      {
        path: '',
        redirectTo: 'station-management',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'station-management',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/error-3',
      },
    ],
  },
  {
    component: LayoutComponent,
    canActivate: [ProvVicePresidentGuard],
    matcher: (url) => {
      const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
      if (userPermission === CONFIG.USER_ROLE.CMS_PROV_VICE_PRESIDENT) {
        return url.length ? {consumed: []} : {consumed: url};
      }
      return null;
    },
    children: [
      // Giám sát công trình
      {
        path: 'project-supervision',
        loadChildren: () =>
          import('./prov_vice_president/project-supervision/project-supervision.module').then((m) => m.ProjectSupervisionModule),
      },
      {
        path: '',
        redirectTo: 'project-supervision',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'project-supervision',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
      // {
      //   path: 'bts-management',
      //   loadChildren: () =>
      //     import('./bts-management/bts-management.module').then((m) => m.BtsManagementModule),
      // },
    ],
  },
  {
    component: LayoutComponent,
    canActivate: [TechStaffGuard],
    matcher: (url) => {
      const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
      if (userPermission === CONFIG.USER_ROLE.CMS_PROV_TECH_STAFF) {
        return url.length ? {consumed: []} : {consumed: url};
      }
      return null;
    },
    children: [
      // {
      //   path: 'project-supervision',
      //   loadChildren: () =>
      //     import('./project-supervision/project-supervision.module').then((m) => m.ProjectSupervisionModule),
      // },
      {
        path: '',
        redirectTo: 'project-supervision',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'project-supervision',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
  {
    component: LayoutComponent,
    canActivate: [InfraStaffGuard],
    matcher: (url) => {
      const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
      if (userPermission === CONFIG.USER_ROLE.CMS_PROV_INFA_STAFF) {
        return url.length ? {consumed: []} : {consumed: url};
      }
      return null;
    },
    children: [
      {
        path: 'project-supervision',
        loadChildren: () =>
          import('./prov_infastructure_staff/project-supervision/project-supervision.module').then((m) => m.ProjectSupervisionModule),
      },
      {
        path: '',
        redirectTo: 'project-supervision',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'project-supervision',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },

// USER PHÒNG PNO

  {
    component: LayoutComponent,
    canActivate: [PnoStaffGuard],
    matcher: (url) => {
      const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
      if (userPermission === CONFIG.USER_ROLE.CMS_BTS_PNO_STAFF) {
        return url.length ? {consumed: []} : {consumed: url};
      }
      return null;
    },
    children: [
      {
        path: 'bts-management',
        loadChildren: () =>
          import('./pno_staff/bts-management/bts-management.module').then((m) => m.BtsManagementModule),
      },
      {
        path: 'export-reports',
        loadChildren: () =>
          import('./export-reports/export-reports.module').then((m) => m.ExportReportsModule),
      },
      // {
      //   path: 'report',
      //   loadChildren: () =>
      //     import('./reports/reports.module').then((m) => m.ReportsModule),
      // },
      {
        path: '',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },

// USER PHÒNG CND
  {
    component: LayoutComponent,
    canActivate: [CndStaffGuard],
    matcher: (url) => {
      const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
      if (userPermission === CONFIG.USER_ROLE.CMS_BTS_CND_STAFF) {
        return url.length ? {consumed: []} : {consumed: url};
      }
      return null;
    },
    children: [
      {
        path: 'bts-management',
        loadChildren: () =>
          import('./cnd_staff/bts-management/bts-management.module').then((m) => m.BtsManagementModule),
      },
      {
        path: '',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
// USER CHI NHÁNH
  {
    component: LayoutComponent,
    canActivate: [CnStaffGuard],
    matcher: (url) => {
      const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
      if (userPermission === CONFIG.USER_ROLE.CMS_BTS_CN_STAFF) {
        return url.length ? {consumed: []} : {consumed: url};
      }
      return null;
    },
    children: [
      {
        path: 'bts-management',
        loadChildren: () =>
          import('./cn_staff/bts-management/bts-management.module').then((m) => m.BtsManagementModule),
      },
      {
        path: '',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
// USER TÀI CHÍNH CHI NHÁNH
  {
    component: LayoutComponent,
    canActivate: [TccnStaffGuard],
    matcher: (url) => {
      const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
      if (userPermission === CONFIG.USER_ROLE.CMS_BTS_TCCN_STAFF) {
        return url.length ? {consumed: []} : {consumed: url};
      }
      return null;
    },
    children: [
      {
        path: 'bts-management',
        loadChildren: () =>
          import('./tccn_staff/bts-management/bts-management.module').then((m) => m.BtsManagementModule),
      },
      {
        path: '',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
// USER CẤP CAO NHẤT PHÒNG TÀI CHÍNH
  {
    component: LayoutComponent,
    canActivate: [GrandTcStaffGuard],
    matcher: (url) => {
      const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
      if (userPermission === CONFIG.USER_ROLE.CMS_BTS_GRAND_TC_STAFF) {
        return url.length ? {consumed: []} : {consumed: url};
      }
      return null;
    },
    children: [
      {
        path: 'bts-management',
        loadChildren: () =>
          import('./grand_tc_staff/bts-management/bts-management.module').then((m) => m.BtsManagementModule),
      },
      {
        path: '',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
// USER NOC
  {
    component: LayoutComponent,
    canActivate: [NocStaffGuard],
    matcher: (url) => {
      const userPermission = localStorage.getItem(CONFIG.KEY.USER_PERMISSION);
      if (userPermission === CONFIG.USER_ROLE.CMS_BTS_NOC_STAFF) {
        return url.length ? {consumed: []} : {consumed: url};
      }
      return null;
    },
    children: [
      {
        path: 'bts-management',
        loadChildren: () =>
          import('./noc_staff/bts-management/bts-management.module').then((m) => m.BtsManagementModule),
      },
      {
        path: '',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: 'home',
        redirectTo: 'bts-management',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
