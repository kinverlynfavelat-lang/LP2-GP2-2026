
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReporteService } from '../../core/services/reporte.service';
import { Reporte } from '../../core/interfaces/reporte.interface';

type TipoReporte = 'diario' | 'semanal' | 'mensual';

interface BarraReporte {
  etiqueta: string;
  titulo: string;
  cantidad: number;
  altura: number;
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

  reportes: Reporte[] = [];
  reportesFiltrados: Reporte[] = [];

  tipoReporte: TipoReporte = 'mensual';

  // Fecha inicial para probar los datos registrados en Oracle
  fechaSeleccionada: string = '2026-11-12';

  busqueda: string = '';

  cargando: boolean = false;
  errorMensaje: string = '';

  totalAtenciones: number = 0;
  totalMedicos: number = 0;
  totalTiposPaciente: number = 0;

  barras: BarraReporte[] = [];
  distribucion: DistribucionPaciente[] = [];

  graficoCircular: string = '';

  private colores: string[] = [
    '#075477',
    '#329BC2',
    '#70C3E2',
    '#56A69C',
    '#7C91C6',
    '#E6AD66'
  ];

  ngOnInit(): void {
    this.consultarReporte();
  }

  // ==========================================
  // RF-25: SELECCIONAR TIPO DE REPORTE
  // ==========================================

  cambiarTipo(tipo: TipoReporte): void {
    this.tipoReporte = tipo;
    this.busqueda = '';
    this.consultarReporte();
  }

  // ==========================================
  // RF-25: CONSULTAR REPORTES
  // ==========================================

  consultarReporte(): void {

    if (!this.fechaSeleccionada) {
      this.errorMensaje = 'Debe seleccionar una fecha.';
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';
    this.reportes = [];
    this.reportesFiltrados = [];
    this.limpiarResumen();

    let consulta;

    switch (this.tipoReporte) {

      case 'diario':
        consulta = this.reporteService.getReporteDiario(
          this.fechaSeleccionada
        );
        break;

      case 'semanal':
        consulta = this.reporteService.getReporteSemanal(
          this.fechaSeleccionada
        );
        break;

      case 'mensual':
        consulta = this.reporteService.getReporteMensual(
          this.fechaSeleccionada
        );
        break;
    }

    consulta.subscribe({

      next: (data) => {

        this.reportes = data;

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
          'No se pudo obtener el reporte de atenciones.';

        this.cargando = false;
      }

    });
  }

  // ==========================================
  // BUSCAR EN LA TABLA
  // ==========================================

  filtrarReportes(): void {

    const texto = this.busqueda.trim().toLowerCase();

    this.reportesFiltrados = this.reportes.filter(r => {

      return (
        r.medico.toLowerCase().includes(texto) ||
        r.especialidad.toLowerCase().includes(texto) ||
        r.tipoPaciente.toLowerCase().includes(texto)
      );

    });
  }

  // ==========================================
  // TARJETAS DE RESUMEN
  // ==========================================

  calcularResumen(): void {

    this.totalAtenciones = this.reportes.reduce(
      (total, r) => total + Number(r.cantAtenciones),
      0
    );

    this.totalMedicos = new Set(
      this.reportes.map(r => r.medico)
    ).size;

    this.totalTiposPaciente = new Set(
      this.reportes.map(r => r.tipoPaciente)
    ).size;
  }

  // ==========================================
  // GRAFICO DE BARRAS
  // DIARIO: POR MEDICO
  // SEMANAL / MENSUAL: POR DIA
  // ==========================================

  generarGraficoBarras(): void {

    const cantidades = new Map<string, number>();

    for (const reporte of this.reportes) {

      const clave = this.tipoReporte === 'diario'
        ? reporte.medico
        : (reporte.fechaAtencion || '');

      if (!clave) {
        continue;
      }

      cantidades.set(
        clave,
        (cantidades.get(clave) || 0) +
        Number(reporte.cantAtenciones)
      );
    }

    this.barras = [];

    if (this.tipoReporte === 'diario') {

      cantidades.forEach((cantidad, medico) => {

        this.barras.push({
          etiqueta: medico.split(' ').slice(0, 2).join(' '),
          titulo: medico,
          cantidad: cantidad,
          altura: 0
        });

      });

    } else {

      const fecha = this.convertirFecha(this.fechaSeleccionada);

      if (this.tipoReporte === 'semanal') {

        // Semana ISO: lunes a domingo
        const diaSemana = (fecha.getDay() + 6) % 7;
        fecha.setDate(fecha.getDate() - diaSemana);

      } else {

        // Primer dia del mes
        fecha.setDate(1);
      }


      const cantidadDias = this.tipoReporte === 'semanal'
        ? 6
        : new Date(
          fecha.getFullYear(),
          fecha.getMonth() + 1,
          0
        ).getDate();


      for (let i = 0; i < cantidadDias; i++) {

        const dia = new Date(fecha);
        dia.setDate(fecha.getDate() + i);
        // No mostrar domingos porque la universidad no atiende
        if (dia.getDay() === 0) {
          continue;
        }

        const clave = this.fechaISO(dia);

        const etiqueta = this.tipoReporte === 'semanal'
          ? dia.toLocaleDateString('es-PE', {
            weekday: 'short',
            day: '2-digit'
          })
          : String(dia.getDate());

        this.barras.push({
          etiqueta: etiqueta,
          titulo: this.formatearFecha(clave),
          cantidad: cantidades.get(clave) || 0,
          altura: 0
        });

      }
    }

    const maximo = Math.max(
      1,
      ...this.barras.map(b => b.cantidad)
    );

    this.barras = this.barras.map(b => ({
      ...b,
      altura: b.cantidad === 0
        ? 0
        : Math.max(8, (b.cantidad / maximo) * 85)
    }));
  }

  // ==========================================
  // GRAFICO CIRCULAR POR TIPO DE PACIENTE
  // ==========================================

  generarGraficoCircular(): void {

    const agrupados = new Map<
      string,
      { cantidad: number; porcentaje: number }
    >();

    for (const reporte of this.reportes) {

      const tipo = reporte.tipoPaciente;

      const actual = agrupados.get(tipo) || {
        cantidad: 0,
        porcentaje: 0
      };

      agrupados.set(tipo, {
        cantidad: actual.cantidad + Number(reporte.cantAtenciones),
        porcentaje: actual.porcentaje + Number(reporte.porcentaje)
      });
    }

    this.distribucion = Array.from(agrupados.entries())
      .map(([tipo, datos], index) => ({
        tipo: tipo,
        cantidad: datos.cantidad,
        porcentaje: Number(datos.porcentaje.toFixed(2)),
        color: this.colores[index % this.colores.length]
      }));

    if (this.totalAtenciones === 0) {
      this.graficoCircular = '';
      return;
    }

    let acumulado = 0;

    const segmentos = this.distribucion.map(d => {

      const inicio = (acumulado / this.totalAtenciones) * 100;

      acumulado += d.cantidad;

      const fin = (acumulado / this.totalAtenciones) * 100;

      return `${d.color} ${inicio}% ${fin}%`;
    });

    this.graficoCircular =
      `conic-gradient(${segmentos.join(', ')})`;
  }

  // ==========================================
  // PERIODO DEL REPORTE
  // ==========================================


obtenerPeriodo(): string {

  if (this.reportes.length > 0 &&
      this.reportes[0].periodo) {
    return this.reportes[0].periodo;
  }

  if (!this.fechaSeleccionada) {
    return 'Sin periodo seleccionado';
  }

  const fecha = this.convertirFecha(this.fechaSeleccionada);

  if (this.tipoReporte === 'diario') {
    return this.formatearFecha(this.fechaSeleccionada);
  }

  if (this.tipoReporte === 'mensual') {
    return fecha.toLocaleDateString('es-PE', {
      month: 'long',
      year: 'numeric'
    });
  }

  // Semana de lunes a sabado
  const diaSemana = (fecha.getDay() + 6) % 7;

  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() - diaSemana);

  const sabado = new Date(lunes);
  sabado.setDate(lunes.getDate() + 5);

  return `Del ${this.formatearFecha(this.fechaISO(lunes))} al ` +
         this.formatearFecha(this.fechaISO(sabado));
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

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================

  formatearFecha(valor?: string): string {

    if (!valor) {
      return '-';
    }

    const partes = valor.split('-');

    if (partes.length !== 3) {
      return valor;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  private convertirFecha(valor: string): Date {

    const [anio, mes, dia] = valor.split('-').map(Number);

    return new Date(anio, mes - 1, dia, 12);
  }

  private fechaISO(fecha: Date): string {

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  private limpiarResumen(): void {

    this.totalAtenciones = 0;
    this.totalMedicos = 0;
    this.totalTiposPaciente = 0;

    this.barras = [];
    this.distribucion = [];
    this.graficoCircular = '';
  }

}
