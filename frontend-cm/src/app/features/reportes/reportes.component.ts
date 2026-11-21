import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReporteService } from '../../core/services/reporte.service';
import { Reporte } from '../../core/interfaces/reporte.interface';

type TipoReporte = 'diario' | 'semanal' | 'mensual';

interface SegmentoBarra {
  tipo: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

interface BarraReporte {
  etiqueta: string;
  titulo: string;
  cantidad: number;
  altura: number;
  segmentos: SegmentoBarra[];
}

interface DistribucionPaciente {
  tipo: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {

  private reporteService = inject(ReporteService);

  // INFORMACION DEL BACKEND
  reportes: Reporte[] = [];
  reportesFiltrados: Reporte[] = [];

  // FILTROS
  tipoReporte: TipoReporte = 'mensual';
  fechaSeleccionada = '2026-11-12';
  busqueda = '';

  // ESTADOS
  cargando = false;
  errorMensaje = '';

  // ESTADISTICAS
  totalAtenciones = 0;
  totalMedicos = 0;
  totalTiposPaciente = 0;

  // GRAFICOS
  barras: BarraReporte[] = [];
  distribucion: DistribucionPaciente[] = [];
  graficoCircular = '';

  // COLORES ESTABLES POR TIPO DE PACIENTE
  private readonly coloresPaciente: Record<string, string> = {
    DOCENTE: '#07577A',
    ESTUDIANTE: '#43A6CC',
    ADMINISTRATIVO: '#6478A8',
    EXTERNO: '#D59A58'
  };

  private readonly coloresAdicionales = [
    '#438D82', '#8B78B5', '#8C9CAB', '#B77E93'
  ];

  ngOnInit(): void {
    this.consultarReporte();
  }

  // ==========================================
  // SELECCIONAR TIPO DE REPORTE
  // ==========================================

  cambiarTipo(tipo: TipoReporte): void {
    if (this.cargando || this.tipoReporte === tipo) return;

    this.tipoReporte = tipo;
    this.busqueda = '';
    this.consultarReporte();
  }

  // ==========================================
  // CONSULTAR ORACLE A TRAVES DEL SERVICIO
  // ==========================================

  consultarReporte(): void {
    if (!this.fechaSeleccionada) {
      this.errorMensaje = 'Debe seleccionar una fecha.';
      return;
    }

    if (this.cargando) return;

    this.cargando = true;
    this.errorMensaje = '';
    this.reportes = [];
    this.reportesFiltrados = [];
    this.limpiarResumen();

    let consulta;

    switch (this.tipoReporte) {
      case 'diario':
        consulta = this.reporteService.getReporteDiario(this.fechaSeleccionada);
        break;

      case 'semanal':
        consulta = this.reporteService.getReporteSemanal(this.fechaSeleccionada);
        break;

      case 'mensual':
        consulta = this.reporteService.getReporteMensual(this.fechaSeleccionada);
        break;
    }

    consulta.subscribe({
      next: (data) => {
        this.reportes = data ?? [];
        this.filtrarReportes();
        this.calcularResumen();
        this.generarGraficoBarras();
        this.generarGraficoCircular();
        this.cargando = false;
      },

      error: (err) => {
        console.error('Error al consultar reportes:', err);

        this.errorMensaje =
          err.error?.mensaje ||
          err.error?.message ||
          'No se pudo obtener el reporte de atenciones.';

        this.cargando = false;
      }
    });
  }

  // ==========================================
  // BUSQUEDA: AFECTA SOLO LA TABLA
  // ==========================================

  filtrarReportes(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.reportesFiltrados = this.reportes.filter(r =>
      (r.medico ?? '').toLowerCase().includes(texto) ||
      (r.especialidad ?? '').toLowerCase().includes(texto) ||
      (r.tipoPaciente ?? '').toLowerCase().includes(texto)
    );
  }

  // ==========================================
  // TARJETAS: SIEMPRE SOBRE TODO EL PERIODO
  // ==========================================

  calcularResumen(): void {
    this.totalAtenciones = this.reportes.reduce(
      (total, r) => total + Number(r.cantAtenciones || 0),
      0
    );

    this.totalMedicos = new Set(
      this.reportes.map(r => r.medico).filter(Boolean)
    ).size;

    this.totalTiposPaciente = new Set(
      this.reportes.map(r => r.tipoPaciente).filter(Boolean)
    ).size;
  }

  // ==========================================
  // GRAFICO DE BARRAS APILADAS POR TIPO
  // DIARIO: CADA MEDICO
  // SEMANAL Y MENSUAL: DIAS CON ATENCIONES
  // ==========================================

  generarGraficoBarras(): void {
    const grupos = new Map<string, Map<string, number>>();

    for (const r of this.reportes) {
      const clave = this.tipoReporte === 'diario'
        ? (r.medico || '')
        : (r.fechaAtencion || r.fecha || '');

      if (!clave) continue;

      const tipo = String(
        r.tipoPaciente || 'NO REGISTRADO'
      ).toUpperCase();

      const cantidad = Number(r.cantAtenciones || 0);

      if (cantidad <= 0) continue;

      if (!grupos.has(clave)) {
        grupos.set(clave, new Map());
      }

      const tipos = grupos.get(clave)!;

      tipos.set(
        tipo,
        (tipos.get(tipo) || 0) + cantidad
      );
    }

    const claves = Array.from(grupos.keys()).sort((a, b) =>
      this.tipoReporte === 'diario'
        ? a.localeCompare(b, 'es')
        : a.localeCompare(b)
    );

    const maximo = Math.max(
      1,
      ...claves.map(clave =>
        Array.from(grupos.get(clave)!.values())
          .reduce((total, n) => total + n, 0)
      )
    );

    this.barras = claves.map(clave => {
      const tipos = grupos.get(clave)!;

      const cantidad = Array.from(tipos.values())
        .reduce((total, n) => total + n, 0);

      const segmentos: SegmentoBarra[] =
        Array.from(tipos.entries())
          .sort(([a], [b]) =>
            this.ordenTipo(a) - this.ordenTipo(b)
          )
          .map(([tipo, numero]) => ({
            tipo,
            cantidad: numero,
            porcentaje: cantidad > 0
              ? (numero / cantidad) * 100
              : 0,
            color: this.obtenerColorPaciente(tipo)
          }));

      let etiqueta: string;
      let titulo: string;

      if (this.tipoReporte === 'diario') {
        etiqueta = clave.split(' ').slice(0, 2).join(' ');
        titulo = clave;

      } else {
        const fecha = this.convertirFecha(clave);

        const dia = String(fecha.getDate()).padStart(2, '0');

        const mes = fecha.toLocaleDateString('es-PE', {
          month: 'short'
        });

        etiqueta = this.tipoReporte === 'semanal'
          ? `${fecha.toLocaleDateString('es-PE', {
              weekday: 'short'
            })} ${dia}`
          : `${dia} ${mes}`;

        titulo = this.formatearFecha(clave);
      }

      return {
        etiqueta,
        titulo,
        cantidad,
        altura: (cantidad / maximo) * 86,
        segmentos
      };
    });
  }

  // ==========================================
  // GRAFICO CIRCULAR POR TIPO DE PACIENTE
  // PORCENTAJES CALCULADOS SOBRE LOS TOTALES
  // ==========================================

  generarGraficoCircular(): void {
    const agrupados = new Map<string, number>();

    for (const r of this.reportes) {
      const tipo = String(
        r.tipoPaciente || 'NO REGISTRADO'
      ).toUpperCase();

      agrupados.set(
        tipo,
        (agrupados.get(tipo) || 0) +
          Number(r.cantAtenciones || 0)
      );
    }

    this.distribucion = Array.from(agrupados.entries())
      .sort(([a], [b]) =>
        this.ordenTipo(a) - this.ordenTipo(b)
      )
      .map(([tipo, cantidad]) => ({
        tipo,
        cantidad,
        porcentaje: this.totalAtenciones > 0
          ? (cantidad / this.totalAtenciones) * 100
          : 0,
        color: this.obtenerColorPaciente(tipo)
      }));

    if (this.totalAtenciones === 0) {
      this.graficoCircular = '';
      return;
    }

    let acumulado = 0;

    const segmentos = this.distribucion.map(item => {
      const inicio = (acumulado / this.totalAtenciones) * 100;

      acumulado += item.cantidad;

      const fin = (acumulado / this.totalAtenciones) * 100;

      return `${item.color} ${inicio}% ${fin}%`;
    });

    this.graficoCircular =
      `conic-gradient(${segmentos.join(', ')})`;
  }

  // ==========================================
  // COLORES IGUALES EN AMBOS GRAFICOS
  // ==========================================

  obtenerColorPaciente(tipo: string): string {
    const nombre = String(tipo || '')
      .trim()
      .toUpperCase();

    if (this.coloresPaciente[nombre]) {
      return this.coloresPaciente[nombre];
    }

    const otros = Array.from(
      new Set(
        this.reportes.map(r =>
          String(
            r.tipoPaciente || 'NO REGISTRADO'
          ).toUpperCase()
        )
      )
    )
      .filter(t => !this.coloresPaciente[t])
      .sort();

    const posicion = Math.max(
      0,
      otros.indexOf(nombre)
    );

    return this.coloresAdicionales[
      posicion % this.coloresAdicionales.length
    ];
  }

  obtenerClaseTipoPaciente(tipo: string): string {
    switch (String(tipo || '').toUpperCase()) {
      case 'DOCENTE':
        return 'tipo-docente';

      case 'ESTUDIANTE':
        return 'tipo-estudiante';

      default:
        return 'tipo-otro';
    }
  }

  limitarPorcentaje(valor: number): number {
    return Math.max(
      0,
      Math.min(100, Number(valor) || 0)
    );
  }

  private ordenTipo(tipo: string): number {
    const orden = [
      'DOCENTE',
      'ESTUDIANTE',
      'ADMINISTRATIVO',
      'EXTERNO'
    ];

    const indice = orden.indexOf(tipo);

    return indice === -1 ? orden.length : indice;
  }

  // ==========================================
  // PERIODO CONSULTADO
  // ==========================================

  obtenerPeriodo(): string {
    if (
      this.reportes.length > 0 &&
      this.reportes[0].periodo
    ) {
      return this.primeraMayuscula(
        this.reportes[0].periodo
      );
    }

    if (!this.fechaSeleccionada) {
      return 'Sin periodo seleccionado';
    }

    const fecha = this.convertirFecha(
      this.fechaSeleccionada
    );

    if (this.tipoReporte === 'diario') {
      return this.formatearFecha(
        this.fechaSeleccionada
      );
    }

    if (this.tipoReporte === 'mensual') {
      return this.primeraMayuscula(
        fecha.toLocaleDateString('es-PE', {
          month: 'long',
          year: 'numeric'
        })
      );
    }

    const diaSemana = (fecha.getDay() + 6) % 7;

    const lunes = new Date(fecha);
    lunes.setDate(
      fecha.getDate() - diaSemana
    );

    const sabado = new Date(lunes);
    sabado.setDate(
      lunes.getDate() + 5
    );

    return `Del ${this.formatearFecha(
      this.fechaISO(lunes)
    )} al ${this.formatearFecha(
      this.fechaISO(sabado)
    )}`;
  }

  obtenerTituloGrafico(): string {
    switch (this.tipoReporte) {
      case 'diario':
        return 'Atenciones por médico';

      case 'semanal':
        return 'Atenciones por día de la semana';

      case 'mensual':
        return 'Atenciones por día del mes';
    }
  }

  obtenerDescripcionGrafico(): string {
    return this.tipoReporte === 'diario'
      ? 'Médicos con atenciones, separados por tipo de paciente.'
      : 'Solo se muestran los días con atenciones, separados por tipo de paciente.';
  }

  // ==========================================
  // FECHAS SIN DESFASE HORARIO
  // ==========================================

  formatearFecha(valor?: string): string {
    if (!valor) return '-';

    const partes = valor.substring(0, 10).split('-');

    if (partes.length !== 3) {
      return valor;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  private convertirFecha(valor: string): Date {
    const [anio, mes, dia] = valor
      .substring(0, 10)
      .split('-')
      .map(Number);

    return new Date(anio, mes - 1, dia, 12);
  }

  private fechaISO(fecha: Date): string {
    const anio = fecha.getFullYear();

    const mes = String(
      fecha.getMonth() + 1
    ).padStart(2, '0');

    const dia = String(
      fecha.getDate()
    ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  private primeraMayuscula(texto: string): string {
    return texto
      ? texto.charAt(0).toLocaleUpperCase('es-PE') +
          texto.slice(1)
      : texto;
  }

  // ==========================================
  // LIMPIAR AL CAMBIAR DE PERIODO
  // ==========================================

  private limpiarResumen(): void {
    this.totalAtenciones = 0;
    this.totalMedicos = 0;
    this.totalTiposPaciente = 0;

    this.barras = [];
    this.distribucion = [];
    this.graficoCircular = '';
  }
}