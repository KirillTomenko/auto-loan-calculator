/**
 * Модуль форматирования чисел с пробелами между разрядами
 */

/**
 * Форматирует число с пробелами между разрядами
 * @param {number|string} value - Число для форматирования
 * @returns {string} Отформатированная строка (например, "1 000 000")
 */
function formatNumberDisplay(value) {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return '—';
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/\s/g, '')) : value;
    
    if (isNaN(numValue)) {
        return '—';
    }
    
    // Округляем до 2 знаков после запятой
    const rounded = Math.round(numValue * 100) / 100;
    
    // Разделяем на целую и дробную части
    const parts = rounded.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    
    // Добавляем пробелы между разрядами в целой части
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    // Форматируем дробную часть (максимум 2 знака)
    const formattedDecimal = decimalPart.length > 0 ? ',' + decimalPart.padEnd(2, '0').substring(0, 2) : '';
    
    return formattedInteger + formattedDecimal + ' руб.';
}

/**
 * Форматирует число при вводе в поле ввода
 * @param {string} value - Введённое значение
 * @returns {string} Отформатированная строка
 */
function formatNumberInput(value) {
    // Убираем все нецифровые символы кроме точки и запятой
    let cleaned = value.replace(/[^\d.,]/g, '');
    
    // Заменяем запятую на точку
    cleaned = cleaned.replace(',', '.');
    
    // Убираем лишние точки
    const parts = cleaned.split('.');
    if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Разделяем на целую и дробную части
    const numParts = cleaned.split('.');
    const integerPart = numParts[0];
    const decimalPart = numParts[1] || '';
    
    // Форматируем целую часть с пробелами
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    // Возвращаем отформатированное значение
    if (decimalPart.length > 0) {
        return formattedInteger + '.' + decimalPart.substring(0, 2);
    }
    
    return formattedInteger;
}

/**
 * Убирает форматирование (пробелы) перед отправкой на сервер
 * @param {string} formattedValue - Отформатированное значение
 * @returns {number} Числовое значение
 */
function removeFormatting(formattedValue) {
    if (!formattedValue) return 0;
    
    // Убираем все пробелы и заменяем запятую на точку
    const cleaned = formattedValue.toString().replace(/\s/g, '').replace(',', '.');
    const numValue = parseFloat(cleaned);
    
    return isNaN(numValue) ? 0 : numValue;
}

/**
 * Инициализирует форматирование для всех числовых полей ввода
 */
function initNumberFormatting() {
    const numberInputs = document.querySelectorAll('#principal, #downPayment, #earlyAmount');
    
    numberInputs.forEach(input => {
        // Форматируем при вводе
        input.addEventListener('input', function(e) {
            const cursorPosition = this.selectionStart;
            const oldValue = this.value;
            const newValue = formatNumberInput(this.value);
            
            this.value = newValue;
            
            // Восстанавливаем позицию курсора
            const diff = newValue.length - oldValue.length;
            this.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
        });
        
        // Форматируем при потере фокуса
        input.addEventListener('blur', function() {
            const numValue = removeFormatting(this.value);
            if (numValue > 0) {
                this.value = formatNumberInput(numValue.toString());
            }
        });
    });
}

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNumberFormatting);
} else {
    initNumberFormatting();
}
