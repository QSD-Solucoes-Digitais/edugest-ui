import { Routes } from '@angular/router';
import { ConsultarResponsavel } from './component/responsavel/consultar-responsavel/consultar-responsavel';

export const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  //{path: 'dashboard', component: DashboardComponent},
  {path: 'responsavel/consultar-responsavel', component: ConsultarResponsavel}
];
