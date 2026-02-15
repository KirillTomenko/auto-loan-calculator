/**
 * Основной модуль калькулятора автокредита
 */

// Глобальные переменные
let earlyPaymentsData = {};
let currentSchedule = [];
let currentParameters = {};
let isInstallmentMode = false;
let termUnit = 'months'; // 'months' или 'years'

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Инициализация приложения
 */
function initializeApp() {
    // Устанавливаем текущую дату по умолчанию
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    
    // Обработчики событий
    setupEventListeners();
    
    // Инициализация форматирования чисел
    if (typeof initNumberFormatting === 'function') {
        initNumberFormatting();
    }
}

/**
 * Настройка обработчиков событий
 */
function setupEventListeners() {
    // Кнопка расчёта
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', handleCalculate);
    }
    
    // Переключатель рассрочки
    const installmentToggle = document.getElementById('installmentToggle');
    if (installmentToggle) {
        installmentToggle.addEventListener('click', toggleInstallment);
    }
    
    // Переключатель единиц срока (месяцы/годы)
    const termToggles = document.querySelectorAll('.term-toggle .toggle-btn');
    termToggles.forEach(btn => {
        btn.addEventListener('click', function() {
            termToggles.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            termUnit = this.dataset.unit;
            updateTermInput();
        });
    });
    
    // Кнопка добавления досрочного платежа
    const addEarlyPaymentBtn = document.getElementById('addEarlyPaymentBtn');
    if (addEarlyPaymentBtn) {
        addEarlyPaymentBtn.addEventListener('click', showEarlyPaymentModal);
    }
    
    // Модальное окно досрочных платежей
    const modal = document.getElementById('earlyPaymentModal');
    const modalClose = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelEarlyPaymentBtn');
    const saveBtn = document.getElementById('saveEarlyPaymentBtn');
    
    if (modalClose) {
        modalClose.addEventListener('click', hideEarlyPaymentModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideEarlyPaymentModal);
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', saveEarlyPayment);
    }
    
    // Переключатель режима досрочного платежа
    const modeToggles = document.querySelectorAll('.mode-toggle .toggle-btn');
    modeToggles.forEach(btn => {
        btn.addEventListener('click', function() {
            modeToggles.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Кнопка экспорта в Excel
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // Закрытие модального окна при клике вне его
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                hideEarlyPaymentModal();
            }
        });
    }
}

/**
 * Переключатель режима рассрочки
 */
function toggleInstallment() {
    const toggle = document.getElementById('installmentToggle');
    const rateGroup = document.getElementById('rateGroup');
    const rateInput = document.getElementById('rate');
    
    isInstallmentMode = !isInstallmentMode;
    
    if (isInstallmentMode) {
        toggle.classList.add('active');
        rateGroup.style.display = 'none';
        rateInput.value = '0';
    } else {
        toggle.classList.remove('active');
        rateGroup.style.display = 'block';
        if (rateInput.value === '0' || rateInput.value === '') {
            rateInput.value = '12';
        }
    }
}

/**
 * Обновление поля срока при переключении единиц
 */
function updateTermInput() {
    const termInput = document.getElementById('term');
    if (!termInput) return;
    
    let currentValue = parseInt(termInput.value) || 0;
    
    if (termUnit === 'years' && currentValue > 0) {
        // Конвертируем месяцы в годы
        termInput.value = Math.round(currentValue / 12);
    } else if (termUnit === 'months' && currentValue > 0) {
        // Конвертируем годы в месяцы
        termInput.value = currentValue * 12;
    }
}

/**
 * Основная функция расчёта кредита
 */
async function handleCalculate() {
    try {
        // Собираем данные из формы
        const principal = removeFormatting(document.getElementById('principal').value);
        const downPayment = removeFormatting(document.getElementById('downPayment').value) || 0;
        const termValue = parseInt(document.getElementById('term').value) || 0;
        const rate = parseFloat(document.getElementById('rate').value) || 0;
        const startDate = document.getElementById('startDate').value;
        
        // Валидация
        if (principal <= 0) {
            alert('Введите стоимость автомобиля');
            return;
        }
        
        if (termValue <= 0) {
            alert('Введите срок кредита');
            return;
        }
        
        // Конвертируем срок в месяцы
        let termMonths = termValue;
        if (termUnit === 'years') {
            termMonths = termValue * 12;
        }
        
        // Рассчитываем сумму кредита (стоимость - первоначальный взнос)
        const loanAmount = Math.max(0, principal - downPayment);
        
        if (loanAmount <= 0) {
            alert('Сумма кредита должна быть больше нуля');
            return;
        }
        
        // Подготавливаем данные для запроса
        const requestData = {
            principal: loanAmount,
            rate: isInstallmentMode ? 0 : rate,
            term_months: termMonths,
            start_date: startDate,
            early_payments: earlyPaymentsData
        };
        
        // Сохраняем параметры для экспорта
        currentParameters = {
            principal: principal,
            down_payment: downPayment,
            rate: isInstallmentMode ? 0 : rate,
            term_months: termMonths,
            start_date: startDate
        };
        
        // Отправляем запрос на сервер
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при расчёте кредита');
        }
        
        const result = await response.json();
        
        // Сохраняем расписание для экспорта
        currentSchedule = result.payment_schedule || [];
        
        // Отображаем результаты
        displayResults(result);
        
        // Обновляем диаграмму
        if (typeof createPaymentChart === 'function') {
            createPaymentChart({
                principal: result.principal,
                totalInterest: result.total_interest,
                totalEarlyPayment: result.total_early_payment
            });
        }
        
        // Обновляем таблицу
        updatePaymentTable(result.payment_schedule);
        
        // Активируем кнопку экспорта
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Ошибка расчёта:', error);
        alert('Произошла ошибка при расчёте кредита. Проверьте введённые данные.');
    }
}

/**
 * Отображение результатов расчёта
 */
function displayResults(result) {
    // Сумма кредита
    const resultPrincipal = document.getElementById('resultPrincipal');
    if (resultPrincipal) {
        resultPrincipal.textContent = formatNumberDisplay(result.principal);
    }
    
    // Ежемесячный платёж
    const resultMonthlyPayment = document.getElementById('resultMonthlyPayment');
    if (resultMonthlyPayment) {
        resultMonthlyPayment.textContent = formatNumberDisplay(result.monthly_payment);
    }
    
    // Общая переплата
    const resultTotalInterest = document.getElementById('resultTotalInterest');
    if (resultTotalInterest) {
        resultTotalInterest.textContent = formatNumberDisplay(result.total_interest);
    }
    
    // Необходимый доход (платёж × 2.5)
    const resultRequiredIncome = document.getElementById('resultRequiredIncome');
    if (resultRequiredIncome) {
        const requiredIncome = result.monthly_payment * 2.5;
        resultRequiredIncome.textContent = formatNumberDisplay(requiredIncome);
    }
    
    // Итого к выплате
    const resultTotalAmount = document.getElementById('resultTotalAmount');
    if (resultTotalAmount) {
        resultTotalAmount.textContent = formatNumberDisplay(result.total_amount);
    }
    
    // Экономия (если есть)
    const savingsItem = document.getElementById('savingsItem');
    const resultSavings = document.getElementById('resultSavings');
    if (resultSavings && result.final_savings > 0) {
        resultSavings.textContent = formatNumberDisplay(result.final_savings);
        if (savingsItem) {
            savingsItem.style.display = 'flex';
        }
    } else if (savingsItem) {
        savingsItem.style.display = 'none';
    }
}

/**
 * Обновление таблицы платежей
 */
function updatePaymentTable(schedule) {
    const tbody = document.getElementById('paymentTableBody');
    const tfoot = document.getElementById('paymentTableFoot');
    
    if (!tbody) return;
    
    // Очищаем таблицу
    tbody.innerHTML = '';
    
    if (!schedule || schedule.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-message">Нет данных для отображения</td></tr>';
        if (tfoot) tfoot.style.display = 'none';
        return;
    }
    
    // Подсчитываем итоги
    let totalMonthlyPayment = 0;
    let totalEarlyPayment = 0;
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    
    // Заполняем таблицу
    schedule.forEach(payment => {
        const row = document.createElement('tr');
        
        totalMonthlyPayment += payment.monthly_payment || 0;
        totalEarlyPayment += payment.early_payment || 0;
        totalPrincipalPaid += payment.principal_paid || 0;
        totalInterestPaid += payment.interest_paid || 0;
        
        // Форматируем дату
        const paymentDate = new Date(payment.payment_date);
        const formattedDate = paymentDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        row.innerHTML = `
            <td>${payment.month}</td>
            <td>${formattedDate}</td>
            <td>${formatNumberDisplay(payment.monthly_payment)}</td>
            <td>${formatNumberDisplay(payment.early_payment)}</td>
            <td>${formatNumberDisplay(payment.principal_paid)}</td>
            <td>${formatNumberDisplay(payment.interest_paid)}</td>
            <td>${formatNumberDisplay(payment.remaining_balance)}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Обновляем итоговую строку
    if (tfoot) {
        document.getElementById('totalMonthlyPayment').textContent = formatNumberDisplay(totalMonthlyPayment);
        document.getElementById('totalEarlyPayment').textContent = formatNumberDisplay(totalEarlyPayment);
        document.getElementById('totalPrincipalPaid').textContent = formatNumberDisplay(totalPrincipalPaid);
        document.getElementById('totalInterestPaid').textContent = formatNumberDisplay(totalInterestPaid);
        tfoot.style.display = 'table-footer-group';
    }
}

/**
 * Показать модальное окно для добавления досрочного платежа
 */
function showEarlyPaymentModal() {
    const modal = document.getElementById('earlyPaymentModal');
    const monthSelect = document.getElementById('earlyMonth');
    
    if (!modal || !monthSelect) return;
    
    // Заполняем выпадающий список месяцев
    monthSelect.innerHTML = '';
    const maxMonths = parseInt(document.getElementById('term').value) || 36;
    const actualMaxMonths = termUnit === 'years' ? maxMonths * 12 : maxMonths;
    
    for (let i = 1; i <= actualMaxMonths; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i} месяц${i === 1 ? '' : i < 5 ? 'а' : 'ев'}`;
        monthSelect.appendChild(option);
    }
    
    // Очищаем поля
    document.getElementById('earlyAmount').value = '';
    const modeToggles = document.querySelectorAll('.mode-toggle .toggle-btn');
    modeToggles.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === 'reduce_payment') {
            btn.classList.add('active');
        }
    });
    
    modal.style.display = 'block';
}

/**
 * Скрыть модальное окно
 */
function hideEarlyPaymentModal() {
    const modal = document.getElementById('earlyPaymentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Сохранить досрочный платёж
 */
function saveEarlyPayment() {
    const month = parseInt(document.getElementById('earlyMonth').value);
    const amount = removeFormatting(document.getElementById('earlyAmount').value);
    const activeModeBtn = document.querySelector('.mode-toggle .toggle-btn.active');
    const mode = activeModeBtn ? activeModeBtn.dataset.mode : 'reduce_payment';
    
    if (!month || month <= 0) {
        alert('Выберите месяц');
        return;
    }
    
    if (!amount || amount <= 0) {
        alert('Введите сумму досрочного платежа');
        return;
    }
    
    // Сохраняем досрочный платёж
    earlyPaymentsData[month] = {
        amount: amount,
        mode: mode
    };
    
    // Обновляем список досрочных платежей
    updateEarlyPaymentsList();
    
    // Закрываем модальное окно
    hideEarlyPaymentModal();
    
    // Автоматически пересчитываем, если уже был выполнен расчёт
    if (currentSchedule.length > 0) {
        handleCalculate();
    }
}

/**
 * Обновление списка досрочных платежей
 */
function updateEarlyPaymentsList() {
    const list = document.getElementById('earlyPaymentsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    const months = Object.keys(earlyPaymentsData).sort((a, b) => parseInt(a) - parseInt(b));
    
    if (months.length === 0) {
        list.innerHTML = '<p style="color: var(--color-text-secondary); font-style: italic;">Досрочные платежи не добавлены</p>';
        return;
    }
    
    months.forEach(month => {
        const payment = earlyPaymentsData[month];
        const item = document.createElement('div');
        item.className = 'early-payment-item';
        
        const modeText = payment.mode === 'reduce_payment' ? 'Уменьшить платёж' : 'Уменьшить срок';
        
        item.innerHTML = `
            <div class="early-payment-info">
                <strong>Месяц ${month}: ${formatNumberDisplay(payment.amount)}</strong>
                <span>Режим: ${modeText}</span>
            </div>
            <button type="button" class="btn-remove" data-month="${month}">Удалить</button>
        `;
        
        // Обработчик удаления
        const removeBtn = item.querySelector('.btn-remove');
        removeBtn.addEventListener('click', function() {
            delete earlyPaymentsData[month];
            updateEarlyPaymentsList();
            
            // Автоматически пересчитываем, если уже был выполнен расчёт
            if (currentSchedule.length > 0) {
                handleCalculate();
            }
        });
        
        list.appendChild(item);
    });
}

/**
 * Экспорт в Excel
 */
async function handleExport() {
    try {
        if (!currentSchedule || currentSchedule.length === 0) {
            alert('Сначала выполните расчёт кредита');
            return;
        }
        
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.disabled = true;
            exportBtn.textContent = 'Экспорт...';
        }
        
        const requestData = {
            parameters: currentParameters,
            schedule: currentSchedule
        };
        
        const response = await fetch('/api/export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при экспорте');
        }
        
        const result = await response.json();
        
        // Скачиваем файл
        window.location.href = result.url;
        
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.textContent = '⬇ Скачать таблицу в Excel';
        }
        
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        alert('Произошла ошибка при экспорте в Excel');
        
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.textContent = '⬇ Скачать таблицу в Excel';
        }
    }
}
