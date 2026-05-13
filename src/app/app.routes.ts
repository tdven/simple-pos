import { Routes } from '@angular/router';
import { PosComponent } from './components/pos/pos.component';
import { ProductManagerComponent } from './components/product-manager/product-manager.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomerManagerComponent } from './components/customer-manager/customer-manager.component';

export const routes: Routes = [
 { path: '', component: DashboardComponent },
 { path: 'pos', component: PosComponent },
  { path: 'products', component: ProductManagerComponent },
  { path: 'customers', component: CustomerManagerComponent },
  { path: '**', redirectTo: '' } // Redirigir cualquier error al POS
];