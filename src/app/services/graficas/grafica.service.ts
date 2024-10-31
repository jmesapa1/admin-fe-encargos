import { Injectable } from '@angular/core';
import { ChartOptions } from 'src/app/demo/dashboard/dash-analytics.component';

@Injectable({
  providedIn: 'root'
})
export class GraficaService {

  constructor() { }

  crearGraficaSemanaASemana(ordenesCompras: any[], abonos: any[]) {
    console.log(ordenesCompras, abonos)
    const hoy = new Date()
    const ordenesCompraMes = [0, 0, 0, 0]
    const abonosMes = [0, 0, 0, 0]

    ordenesCompras.forEach(compra => {
      const fechaCompra = new Date(compra.compra.date)
      if (fechaCompra.getMonth() === hoy.getMonth()) {
        if (fechaCompra.getDate() < 8) {
          ordenesCompraMes[0] = compra.compra.total + ordenesCompraMes[0]
        } else if (fechaCompra.getDate() >= 8 && fechaCompra.getDate() <= 16) {
          ordenesCompraMes[1] = compra.compra.total + ordenesCompraMes[1]
        } else if (fechaCompra.getDate() >= 17 && fechaCompra.getDate() <= 24) {
          ordenesCompraMes[2] = compra.compra.total + ordenesCompraMes[2]
        } else {
          ordenesCompraMes[3] = compra.compra.total + ordenesCompraMes[3]
        }
      }
    })
    abonos.forEach(pago => {
      const fechaCompra = new Date(pago.pago.date)
      if (fechaCompra.getMonth() === hoy.getMonth()) {
        if (pago.tipo === "in" && !pago.anotation) {
          if (fechaCompra.getDate() < 8) {
            abonosMes[0] = pago.pago.amount + abonosMes[0]
          } else if (fechaCompra.getDate() >= 8 && fechaCompra.getDate() <= 16) {
            abonosMes[1] = pago.pago.amount + abonosMes[1]
          } else if (fechaCompra.getDate() >= 17 && fechaCompra.getDate() <= 24) {
            abonosMes[2] = pago.pago.amount + abonosMes[2]
          } else {
            abonosMes[3] = pago.pago.amount + abonosMes[3]
          }
        }
      }
    })

    return this.crearGraficaSemanaPorSemana({ ordenesCompraMes, abonosMes })

  }



  crearGraficaSemanaPorSemana(data: { ordenesCompraMes: any; abonosMes: any; }) {
    const chart: Partial<ChartOptions> = {
      chart: {
        type: 'area',
        height: 250,
        sparkline: {
          enabled: true
        }
      },
      dataLabels: {
        enabled: true
      },
      colors: ['#4680ff', '#f25d35'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: [],
          shadeIntensity: 1,
          type: 'horizontal',
          opacityFrom: 1,
          opacityTo: 0.2,
          stops: [0, 1000000, 1000000, 1000000]
        }
      },
      stroke: {
        curve: 'smooth',
        width: 5
      },
      series: [
        {
          name: "Abonos",
          data: data.abonosMes
        },
        {
          name: "Compras",
          data: data.ordenesCompraMes
        },
      ],
      yaxis: {
        min: 0,
        max: 10000000
      },
      xaxis: {
        type: "category",
        categories: [
          "1era semana",
          "2da semana",
          "3era semana",
          "4ta semana"
        ]
      },
      tooltip: {
        x: {
          show: true
        }
      }
    };
    return chart
  }
  crearGraficaBarrasComprasAbonos(pagos: any[]) {
    const dataIngreso: any[] = []
    const dataEgreso: any[] = []
    const fechasArray: any[] = []
    pagos.map((x: { date: any; }) => x.date).forEach((fecha: any) => {
      if (!fechasArray.find(elemnt => elemnt === fecha)) {
        const array = pagos.filter((pago: { date: any; }) => pago.date === fecha)
        const sumaFechaIngreso = array.filter((x: { tipo: string; }) => x.tipo === "in").reduce((a: any, b: { pago: { amount: any; }; tipo: string; }) => {
          if (b.pago && b.tipo === "in") { return a + b.pago.amount }
        }, 0)
        const sumaFechaEgreso = array.filter((x: { tipo: string; }) => x.tipo === "out").reduce((a: any, b: { pago: { amount: any; }; tipo: string; }) => {
          if (b.pago && b.tipo === "out") { return a + b.pago.amount }
        }, 0)

        if (fecha) fechasArray.push(fecha)
        dataIngreso.push(sumaFechaIngreso ? sumaFechaIngreso : 0)
        dataEgreso.push(sumaFechaEgreso ? sumaFechaEgreso : 0)
      }
    })
    for (let i = 0; i < pagos.length; i++) {
      if (i === 0) {
        pagos[i].acumulado = pagos[i].pago.amount
      } else {
        if (!pagos[i].pago.anotation) {
          if (pagos[i].tipo === 'in') {
            pagos[i].acumulado = pagos[i - 1].acumulado + pagos[i].pago.amount
          } else {
            pagos[i].acumulado = pagos[i - 1].acumulado - pagos[i].pago.amount
          }
        } else {
          pagos[i].acumulado = pagos[i - 1].acumulado
        }

      }

    }

    const chartOptions: Partial<ChartOptions> = {
      chart: {
        type: "bar",
        height: 450
      },

      series: [

        {
          name: 'Compras - Gastos',
          data: dataEgreso
        },
        {
          name: 'Abonos',
          data: dataIngreso
        },
      ],
      legend: {
        position: 'top'
      },

      yaxis: {
        show: true,
        min: 100000,
        max: 1000000,
        labels: {
          formatter: function (value: { toLocaleString: () => string; }) {
            return "$" + value.toLocaleString();
          }
        },
      },
      colors: ['#ff5370', '#17ead9'],
      stroke: {
        width: 1
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        borderColor: "#40475D",
      },
      xaxis: {
        axisTicks: {
          color: '#333'
        },
        axisBorder: {
          color: "#333"
        },
        categories: fechasArray,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#ff869a'],
          shadeIntensity: 1,
          type: 'horizontal',
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100, 100, 100]
        }
      },
    };
    return chartOptions
  }

  crearGraficasDona(totalCartera: number, totalVentas: number) {

    const chartOptions_1: Partial<ChartOptions> = {
      chart: {
        height: 150,
        type: 'donut'
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '75%'
          }
        }
      },
      labels: ['Cartera', 'Abonos'],
      series: [totalCartera, totalVentas - totalCartera],
      legend: {
        show: false
      },
      tooltip: {
        theme: 'dark'
      },
      grid: {
        padding: {
          top: 20,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      colors: ['#4680ff', '#2ed8b6'],
      fill: {
        opacity: [1, 1]
      },
      stroke: {
        width: 0
      }
    };
    return chartOptions_1
  }
}
