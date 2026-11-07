
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';

import { PacienteListComponent } from './features/pacientes/paciente-list/paciente-list.component';
import { PacienteFormComponent } from './features/pacientes/paciente-form/paciente-form.component';
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
import { PortalPaciente } from './features/portal-paciente/portal-paciente.component';
import { RecetaFormComponent } from './features/recetas/receta-form/receta-form.component';
import { RecetaListComponent } from './features/recetas/receta-list/receta-list.component';
import { DerivacionListComponent } from './features/derivaciones/derivacion-list/derivacion-list.component';
import { DerivacionFormComponent } from './features/derivaciones/derivacion-form/derivacion-form.component';
export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [

            {
                path: 'home',
                component: HomeComponent
            },

            {
                path: 'pacientes',
                component: PacienteListComponent
            },
            {
                path: 'pacientes/nuevo',
                component: PacienteFormComponent
            },
            {
                path: 'pacientes/editar/:id',
                component: PacienteFormComponent
            },

            {
                path: 'empleados',
                component: EmpleadoListComponent
            },
            {
                path: 'empleados/nuevo',
                component: EmpleadoFormComponent
            },
            {
                path: 'empleados/editar/:id',
                component: EmpleadoFormComponent
            },
            {
                path: 'medicos',
                component: MedicoListComponent
            },
            {
                path: 'medicos/nuevo',
                component: MedicoFormComponent
            },
            {
                path: 'medicos/editar/:id',
                component: MedicoFormComponent
            },
            {
                path: 'citas',
                component: CitaListComponent
            },
            {
                path: 'citas/nuevo',
                component: CitaFormComponent
            },
            {
                path: 'citas/editar/:id',
                component: CitaFormComponent
            },
            {
                path: 'horarios-medicos',
                component: HorarioMedicoListComponent
            },
            {
                path: 'horarios-medicos/nuevo',
                component: HorarioMedicoFormComponent
            },
            {
                path: 'horarios-medicos/editar/:id',
                component: HorarioMedicoFormComponent
            },
            {
                path: 'pagos',
                component: PagoListComponent
            },
            {
                path: 'pagos/registrar/:id',
                component: PagoFormComponent
            },
            {
                path: 'triaje',
                component: TriajeListComponent
            },
            {
                path: 'triaje/registrar/:id',
                component: TriajeFormComponent
            },
            {
                path: 'atencion',
                component: AtencionListComponent
            },
            {
                path: 'atencion/registrar/:id',
                component: AtencionFormComponent
            },
            {
                path: 'farmacia',
                component: FarmaciaListComponent
            },
            {
                path: 'farmacia/nuevo',
                component: FarmaciaFormComponent
            },
            {
                path: 'farmacia/editar/:id',
                component: FarmaciaFormComponent
            },
            {
                path: 'portal-paciente',
                component: PortalPaciente
            },
            {
                path: 'recetas',
                component: RecetaListComponent
            },
            {
                path: 'recetas/nuevo',
                component: RecetaFormComponent
            },
            {
                path: 'recetas/editar/:id',
                component: RecetaFormComponent
            },
            {
                path: 'derivaciones',
                component: DerivacionListComponent
            },
            {
                path: 'derivaciones/nuevo',
                component: DerivacionFormComponent
            },
            {
                path: 'derivaciones/editar/:id',
                component: DerivacionFormComponent
            },

            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            }

        ]
    },

    {
        path: '**',
        redirectTo: 'home'
    }
];
