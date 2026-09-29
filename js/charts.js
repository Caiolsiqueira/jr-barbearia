/**
 * J&R Barbearia - Gráficos Interativos de Desempenho
 * Suporta agrupamento por Dia, Semana, Mês e Ano com paleta de cores oficial.
 * Funciona nativamente com Chart.js ou renderização suave direta no Canvas.
 */
class JRChartManager {
  constructor() {
    this.currentChart = null;
    this.canvasId = 'adminPerformanceChart';
  }

  // Prepara os dados agrupados por período selecionado
  prepareData(appointments, groupBy = 'dia') {
    const valid = appointments.filter(a => a.status !== 'cancelado');
    const groups = {};

    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    valid.forEach(apt => {
      const [year, month, day] = apt.data.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      let key = '';

      if (groupBy === 'dia') {
        key = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
      } else if (groupBy === 'semana') {
        // Agrupa por número da semana do ano
        const firstDayOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `Sem ${weekNum}`;
      } else if (groupBy === 'mes') {
        key = `${monthsNames[month - 1]}/${String(year).slice(-2)}`;
      } else if (groupBy === 'ano') {
        key = `${year}`;
      }

      if (!groups[key]) {
        groups[key] = {
          count: 0,
          revenue: 0,
          cabelo: 0,
          barba: 0,
          cabelo_barba: 0
        };
      }

      groups[key].count += 1;
      groups[key].revenue += Number(apt.valor_cobrado || 0);
      if (apt.servico === 'cabelo') groups[key].cabelo += 1;
      else if (apt.servico === 'barba') groups[key].barba += 1;
      else if (apt.servico === 'cabelo_barba') groups[key].cabelo_barba += 1;
    });

    const labels = Object.keys(groups);
    // Se estiver vazio, exibe placeholder elegante
    if (labels.length === 0) {
      labels.push('Sem registros');
      groups['Sem registros'] = { count: 0, revenue: 0 };
    }

    const counts = labels.map(l => groups[l].count);
    const revenues = labels.map(l => groups[l].revenue);

    return { labels, counts, revenues };
  }

  renderChart(appointments, groupBy = 'dia', metric = 'cortes') {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { labels, counts, revenues } = this.prepareData(appointments, groupBy);
    const values = metric === 'faturamento' ? revenues : counts;
    const valueLabel = metric === 'faturamento' ? 'Faturamento (R$)' : 'Volume de Cortes';

    // Se Chart.js estiver disponível via CDN
    if (window.Chart) {
      if (this.currentChart) {
        this.currentChart.destroy();
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(168, 235, 18, 0.45)');
      gradient.addColorStop(1, 'rgba(168, 235, 18, 0.0)');

      this.currentChart = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: valueLabel,
            data: values,
            borderColor: '#A8EB12',
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#191d0e',
            pointBorderColor: '#A8EB12',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#eae5d8',
                font: { family: 'Inter', weight: '600' }
              }
            },
            tooltip: {
              backgroundColor: '#191d0e',
              titleColor: '#A8EB12',
              bodyColor: '#eae5d8',
              borderColor: '#008894',
              borderWidth: 1,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: (context) => {
                  return metric === 'faturamento' 
                    ? ` R$ ${Number(context.raw).toFixed(2).replace('.', ',')}`
                    : ` ${context.raw} atendimentos`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(234, 229, 216, 0.08)' },
              ticks: { color: '#eae5d8' }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(234, 229, 216, 0.08)' },
              ticks: {
                color: '#eae5d8',
                callback: (val) => metric === 'faturamento' ? `R$${val}` : val
              }
            }
          }
        }
      });
      return;
    }

    // Renderizador Nativo HTML5 Canvas (100% Offline e independente)
    this.renderFallbackCanvas(ctx, canvas, labels, values, valueLabel, metric);
  }

  renderFallbackCanvas(ctx, canvas, labels, values, title, metric) {
    const width = canvas.width = canvas.parentElement.clientWidth || 600;
    const height = canvas.height = 240;
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 30, right: 30, bottom: 40, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...values, 5);

    // Linhas de Grade e Eixo Y
    ctx.strokeStyle = 'rgba(234, 229, 216, 0.1)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#eae5d8';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      const val = Math.round(maxVal - (maxVal / gridLines) * i);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(metric === 'faturamento' ? `R$${val}` : val, padding.left - 8, y + 4);
    }

    if (labels.length === 0 || (labels.length === 1 && values[0] === 0)) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#008894';
      ctx.fillText('Nenhum dado encontrado para o período', width / 2, height / 2);
      return;
    }

    // Gráfico de Linha / Área com Gradiente Neon
    const stepX = chartW / Math.max(labels.length - 1, 1);
    const points = values.map((v, i) => {
      const x = padding.left + (labels.length === 1 ? chartW / 2 : i * stepX);
      const y = padding.top + chartH - (v / maxVal) * chartH;
      return { x, y, val: v, label: labels[i] };
    });

    // Área preenchida
    const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    grad.addColorStop(0, 'rgba(168, 235, 18, 0.4)');
    grad.addColorStop(1, 'rgba(168, 235, 18, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.lineTo(points[0].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Linha de contorno
    ctx.beginPath();
    ctx.strokeStyle = '#A8EB12';
    ctx.lineWidth = 3;
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Pontos e Rótulos do Eixo X
    ctx.textAlign = 'center';
    points.forEach((pt) => {
      // Ponto
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#191d0e';
      ctx.fill();
      ctx.strokeStyle = '#A8EB12';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Rótulo X
      ctx.fillStyle = '#eae5d8';
      ctx.fillText(pt.label, pt.x, height - 15);
    });
  }
}

window.JR_CHARTS = new JRChartManager();
