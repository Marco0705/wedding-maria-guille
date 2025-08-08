import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { HowToArriveComponent } from './pages/how-to-arrive/how-to-arrive.component';
import { ConfirmationComponent } from './pages/confirmation/confirmation.component';
import { WeddingListComponent } from './pages/wedding-list/wedding-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'como-llegar', component: HowToArriveComponent },
  { path: 'confirmacion', component: ConfirmationComponent },
  { path: 'lista-bodas', component: WeddingListComponent },

  { path: '**', redirectTo: '' },
];
