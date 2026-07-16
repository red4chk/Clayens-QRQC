import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    title: 'QRQC Clayens — Tableau de bord',
  },
  {
    path: 'qrqc/:id',
    loadComponent: () =>
      import('./pages/wizard/wizard.component').then((m) => m.WizardComponent),
    title: 'QRQC Clayens — Dossier',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
