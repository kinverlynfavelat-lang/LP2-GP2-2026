
import { Component, inject } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

  auth = inject(AuthService);

  menuColapsado = false;
  menuMovilAbierto = false;

  alternarMenu(): void {
    this.menuColapsado = !this.menuColapsado;
  }

  abrirMenuMovil(): void {
    this.menuMovilAbierto = true;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

}
