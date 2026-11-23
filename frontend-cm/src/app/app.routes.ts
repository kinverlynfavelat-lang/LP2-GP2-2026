
import { Routes } from '@angular/router';

import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth.guard';

import { PacienteListComponent } from './features/pacientes/paciente-list/paciente-list.component';
import { PacienteFormComponent } from './features/pacientes/paciente-form/paciente-form.component';
import { PacienteHistorialComponent } from './features/pacientes/paciente-historial/paciente-historial.component';

import { EmpleadoListComponent } from './features/empleados/empleado-list/empleado-list.component';
import { EmpleadoFormComponent } from './features/empleados/empleado-form/empleado-form.component';

import { MedicoListComponent } from './features/medicos/medico-list/medico-list.component';
import { MedicoFormComponent } from './features/medicos/medico-form/medico-form.component';

import { CitaListComponent } from './features/citas/cita-list/cita-list.component';
import { CitaFormComponent } from './features/citas/cita-form/cita-form.component';

import { HorarioMedicoFormComponent } from './features/horarios-medicos/horario-medico-form/horario-medico-form.component';
import { HorarioMedicoListComponent } from './features/horarios-medicos/horario-medico-list/horario-medico-list.component';

import { PagoListComponent } from './features/pagos/pago-list/pago-list.component';
import { PagoFormComponent } from './features/pagos/pago-form/pago-form.component';

import { TriajeListComponent } from './features/triaje/triaje-list/triaje-list.component';
import { TriajeFormComponent } from './features/triaje/triaje-form/triaje-form.component';

import { AtencionListComponent } from './features/atencion-medica/atencion-medica-list/atencion-medica-list.component';
import { AtencionFormComponent } from './features/atencion-medica/atencion-medica-form/atencion-medica-form.component';

import { FarmaciaFormComponent } from './features/farmacia/farmacia-form/farmacia-form.component';
import { FarmaciaListComponent } from './features/farmacia/farmacia-list/farmacia-list.component';
import { DetalleMedicamentoFormComponent } from './features/farmacia/detalle-medicamento-form/detalle-medicamento-form.component';

import { PortalPaciente } from './features/portal-paciente/portal-paciente.component';

import { RecetaFormComponent } from './features/recetas/receta-form/receta-form.component';
import { RecetaListComponent } from './features/recetas/receta-list/receta-list.component';

import { DerivacionListComponent } from './features/derivaciones/derivacion-list/derivacion-list.component';
import { DerivacionFormComponent } from './features/derivaciones/derivacion-form/derivacion-form.component';

import { BandejaSyncComponent } from './features/sincronizacion/bandeja-sync/bandeja-sync.component';

export const routes: Routes = [

  // ==========================================
  // LOGIN DE TRABAJADORES
  // ==========================================

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: '',
    component: MainLayoutComponent,

    children: [

      // ==========================================
      // PORTAL PUBLICO DEL PACIENTE
      // SIN LOGIN
      // ==========================================

      {
        path: 'portal-paciente',
        component: PortalPaciente
      },

      // ==========================================
      // INICIO DE TRABAJADORES
      // TODOS LOS ROLES
      // ==========================================

      {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN', 'MEDICO', 'TRIAJE', 'FARMACIA']
        }
      },

      // ==========================================
      // PACIENTES
      // ==========================================

      // LISTA DE PACIENTES
      // ADMIN / MEDICO / TRIAJE

      {
        path: 'pacientes',
        component: PacienteListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // HISTORIAL CLINICO
      // SOLO MEDICO

      {
        path: 'historial-pacientes',
        component: PacienteHistorialComponent,
        canActivate: [authGuard],
        data: {
          roles: ['MEDICO']
        }
      },

      // REGISTRAR PACIENTE
      // SOLO ADMIN

      {
        path: 'pacientes/nuevo',
        component: PacienteFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // EDITAR PACIENTE
      // SOLO ADMIN

      {
        path: 'pacientes/editar/:id',
        component: PacienteFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // ==========================================
      // EMPLEADOS
      // SOLO ADMIN
      // ==========================================

      {
        path: 'empleados',
        component: EmpleadoListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'empleados/nuevo',
        component: EmpleadoFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'empleados/editar/:id',
        component: EmpleadoFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // ==========================================
      // MEDICOS
      // SOLO ADMIN
      // ==========================================

      {
        path: 'medicos',
        component: MedicoListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'medicos/nuevo',
        component: MedicoFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'medicos/editar/:id',
        component: MedicoFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // ==========================================
      // HORARIOS MEDICOS
      // SOLO ADMIN
      // ==========================================

      {
        path: 'horarios-medicos',
        component: HorarioMedicoListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'horarios-medicos/nuevo',
        component: HorarioMedicoFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'horarios-medicos/editar/:id',
        component: HorarioMedicoFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // ==========================================
      // CITAS MEDICAS
      // ==========================================

      // CONSULTAR CITAS
      // ADMIN / MEDICO / TRIAJE

      {
        path: 'citas',
        component: CitaListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // REGISTRAR CITAS
      // SOLO ADMIN

      {
        path: 'citas/nuevo',
        component: CitaFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // EDITAR CITAS
      // SOLO ADMIN

      {
        path: 'citas/editar/:id',
        component: CitaFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // ==========================================
      // PAGOS
      // SOLO ADMIN
      // ==========================================

      {
        path: 'pagos',
        component: PagoListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      {
        path: 'pagos/registrar/:id',
        component: PagoFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // ==========================================
      // TRIAJE
      // SOLO PERSONAL DE TRIAJE
      // ==========================================

      {
        path: 'triaje',
        component: TriajeListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['TRIAJE']
        }
      },

      {
        path: 'triaje/registrar/:id',
        component: TriajeFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['TRIAJE']
        }
      },

      // ==========================================
      // ATENCION MEDICA
      // SOLO MEDICO
      // ==========================================

      {
        path: 'atencion',
        component: AtencionListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['MEDICO']
        }
      },

      {
        path: 'atencion/registrar/:id',
        component: AtencionFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['MEDICO']
        }
      },

      // ==========================================
      // RECETAS MEDICAS
      // ==========================================

      // CONSULTAR RECETAS
      // MEDICO / FARMACIA

      {
        path: 'recetas',
        component: RecetaListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['MEDICO', 'FARMACIA']
        }
      },

      // CREAR RECETAS
      // SOLO MEDICO

      {
        path: 'recetas/nuevo',
        component: RecetaFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['MEDICO']
        }
      },

      // EDITAR RECETAS
      // SOLO MEDICO

      {
        path: 'recetas/editar/:id',
        component: RecetaFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['MEDICO']
        }
      },

      // ==========================================
      // DERIVACIONES MEDICAS
      // SOLO MEDICO
      // ==========================================

      {
        path: 'derivaciones',
        component: DerivacionListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['MEDICO']
        }
      },

      {
        path: 'derivaciones/nuevo',
        component: DerivacionFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['MEDICO']
        }
      },

      {
        path: 'derivaciones/editar/:id',
        component: DerivacionFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['MEDICO']
        }
      },

      // ==========================================
      // FARMACIA
      // SOLO FARMACIA
      // ==========================================

      {
        path: 'farmacia',
        component: FarmaciaListComponent,
        canActivate: [authGuard],
        data: {
          roles: ['FARMACIA']
        }
      },

      {
        path: 'farmacia/nuevo',
        component: FarmaciaFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['FARMACIA']
        }
      },

      {
        path: 'farmacia/editar/:id',
        component: FarmaciaFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['FARMACIA']
        }
      },

      {
        path: 'farmacia/entregas/nuevo',
        component: DetalleMedicamentoFormComponent,
        canActivate: [authGuard],
        data: {
          roles: ['FARMACIA']
        }
      },

      // ==========================================
      // SINCRONIZACION OFFLINE
      // PLAN DE EMERGENCIA
      // SOLO ADMIN
      // ==========================================

      {
        path: 'sincronizacion',
        component: BandejaSyncComponent,
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        }
      },

      // ==========================================
      // REPORTES
      // SOLO ADMIN
      // ==========================================

      {
        path: 'reportes',
        canActivate: [authGuard],
        data: {
          roles: ['ADMIN']
        },
        loadComponent: () =>
          import('./features/reportes/reportes.component')
            .then(m => m.ReportesComponent)
      },

      // ==========================================
      // RUTA INICIAL
      // ==========================================

      {
        path: '',
        redirectTo: 'portal-paciente',
        pathMatch: 'full'
      }

    ]
  },

  // ==========================================
  // RUTA NO ENCONTRADA
  // ==========================================

  {
    path: '**',
    redirectTo: 'portal-paciente'
  }

];
