/**
 * Модуль для работы с диаграммами (Chart.js)
 */

let paymentChart = null;

/**
 * Создаёт или обновляет круговую диаграмму платежей
 * @param {Object} data - Данные для диаграммы
 * @param {number} data.principal - Основная сумма кредита
 * @param {number} data.totalInterest - Общая сумма процентов
 * @param {number} data.totalEarlyPayment - Общая сумма досрочных платежей
 */
function createPaymentChart(data) {
    const ctx = document.getElementById('paymentChart');
    
    if (!ctx) {
        return;
    }
    
    const { principal, totalInterest, totalEarlyPayment } = data;
    
    // Подготавливаем данные для диаграммы
    const labels = [];
    const values = [];
    const colors = [];
    
    if (principal > 0) {
        labels.push('Основной долг');
        values.push(principal);
        colors.push('#1E3A8A');
    }
    
    if (totalInterest > 0) {
        labels.push('Проценты');
        values.push(totalInterest);
        colors.push('#DC2626');
    }
    
    if (totalEarlyPayment > 0) {
        labels.push('Досрочные платежи');
        values.push(totalEarlyPayment);
        colors.push('#059669');
    }
    
    // Если нет данных, показываем пустую диаграмму
    if (values.length === 0) {
        if (paymentChart) {
            paymentChart.destroy();
            paymentChart = null;
        }
        return;
    }
    
    // Форматируем значения для отображения
    const total = values.reduce((sum, val) => sum + val, 0);
    const formattedLabels = labels.map((label, index) => {
        const value = values[index];
        const percent = ((value / total) * 100).toFixed(1);
        return `${label}: ${formatNumberDisplay(value)} (${percent}%)`;
    });
    
    // Уничтожаем предыдущую диаграмму, если она существует
    if (paymentChart) {
        paymentChart.destroy();
    }
    
    // Создаём новую диаграмму
    paymentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: formattedLabels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatNumberDisplay(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Очищает диаграмму
 */
function clearChart() {
    if (paymentChart) {
        paymentChart.destroy();
        paymentChart = null;
    }
}
