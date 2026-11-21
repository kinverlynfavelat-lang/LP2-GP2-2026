import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CatalogCacheService } from './core/offline/catalog-cache.service';
import { SyncService } from './core/offline/sync.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private catalogCache = inject(CatalogCacheService);
  private authService = inject(AuthService);
  // Se inyecta para mantener activo el listener automático del evento 'online'
  private syncService = inject(SyncService);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.catalogCache.sincronizarCatalogos();
    }
  }
}