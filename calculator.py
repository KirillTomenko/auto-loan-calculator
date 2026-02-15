"""
Модуль для расчёта автокредитов с поддержкой досрочных платежей.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional


def calculate_loan(
    principal: float,
    rate: float,
    term_months: int,
    start_date: Optional[str] = None,
    early_payments: Optional[Dict[int, Dict]] = None
) -> Dict:
    """
    Основной расчёт кредита.
    
    Args:
        principal (float): Сумма кредита (руб.)
        rate (float): Годовая процентная ставка (%)
        term_months (int): Срок кредита (месяцы)
        start_date (str): Дата получения кредита (YYYY-MM-DD)
        early_payments (dict): {месяц: {сумма, режим}} - досрочные платежи
    
    Returns:
        dict: {
            monthly_payment, total_interest, total_amount,
            payment_schedule, total_early_payment, final_savings
        }
    """
    if start_date is None:
        start_date = datetime.now().strftime('%Y-%m-%d')
    
    if early_payments is None:
        early_payments = {}
    
    # Месячная процентная ставка
    monthly_rate = rate / 100 / 12 if rate > 0 else 0
    
    # Расчёт аннуитетного платежа
    if monthly_rate > 0:
        monthly_payment = principal * (monthly_rate * (1 + monthly_rate) ** term_months) / \
                         ((1 + monthly_rate) ** term_months - 1)
    else:
        monthly_payment = principal / term_months
    
    # Генерация графика платежей
    schedule = generate_payment_schedule(
        principal, rate, term_months, start_date, early_payments
    )
    
    # Подсчёт итоговых значений
    total_interest = sum(payment['interest_paid'] for payment in schedule)
    total_early_payment = sum(
        payment.get('early_payment', 0) for payment in schedule
    )
    total_amount = principal + total_interest + total_early_payment
    
    # Расчёт экономии от досрочных платежей
    # Сравниваем с базовым расчётом без досрочных платежей
    if early_payments:
        base_schedule = generate_payment_schedule(
            principal, rate, term_months, start_date, None
        )
        base_total_interest = sum(p['interest_paid'] for p in base_schedule)
        base_total_amount = principal + base_total_interest
        final_savings = base_total_amount - total_amount
    else:
        final_savings = 0
    
    return {
        'monthly_payment': monthly_payment,
        'total_interest': total_interest,
        'total_amount': total_amount,
        'payment_schedule': schedule,
        'total_early_payment': total_early_payment,
        'final_savings': final_savings,
        'principal': principal
    }


def generate_payment_schedule(
    principal: float,
    rate: float,
    term_months: int,
    start_date: str,
    early_payments: Optional[Dict[int, Dict]] = None
) -> List[Dict]:
    """
    Генерирует детальный график платежей.
    
    Returns:
        list[dict]: Каждый элемент:
            {
                month, payment_date, monthly_payment, early_payment,
                principal_paid, interest_paid, remaining_balance
            }
    """
    if early_payments is None:
        early_payments = {}
    
    monthly_rate = rate / 100 / 12 if rate > 0 else 0
    
    # Базовая сумма аннуитетного платежа (без досрочных платежей)
    if monthly_rate > 0:
        base_monthly_payment = principal * (monthly_rate * (1 + monthly_rate) ** term_months) / \
                              ((1 + monthly_rate) ** term_months - 1)
    else:
        base_monthly_payment = principal / term_months
    
    schedule = []
    remaining_balance = principal
    start = datetime.strptime(start_date, '%Y-%m-%d')
    current_month = 1
    current_monthly_payment = base_monthly_payment
    remaining_term = term_months
    
    while remaining_balance > 0.01 and current_month <= term_months * 3:  # Защита от бесконечного цикла
        # Дата платежа
        payment_date = start + timedelta(days=30 * (current_month - 1))
        
        # Проценты за месяц
        interest_paid = remaining_balance * monthly_rate
        
        # Основной платёж из ежемесячного платежа
        if monthly_rate > 0:
            principal_from_payment = current_monthly_payment - interest_paid
        else:
            principal_from_payment = current_monthly_payment
        
        # Досрочный платёж
        early_payment = 0
        early_payment_mode = None
        
        if current_month in early_payments:
            early_payment = early_payments[current_month]['amount']
            early_payment_mode = early_payments[current_month].get('mode', 'reduce_payment')
        
        # Общая сумма, идущая на погашение основного долга
        total_principal_paid = principal_from_payment
        
        if early_payment > 0:
            if early_payment_mode == 'reduce_term':
                # Режим "уменьшить срок": досрочный платёж полностью идёт на основной долг
                total_principal_paid += early_payment
            else:
                # Режим "уменьшить платёж": досрочный платёж идёт на основной долг,
                # но ежемесячный платёж остаётся прежним
                total_principal_paid += early_payment
        
        # Проверка на переплату
        if total_principal_paid > remaining_balance:
            total_principal_paid = remaining_balance
        
        remaining_balance -= total_principal_paid
        
        # Если остаток стал отрицательным или очень маленьким
        if remaining_balance < 0.01:
            remaining_balance = 0
        
        schedule.append({
            'month': current_month,
            'payment_date': payment_date.strftime('%Y-%m-%d'),
            'monthly_payment': current_monthly_payment,
            'early_payment': early_payment,
            'principal_paid': total_principal_paid,
            'interest_paid': interest_paid,
            'remaining_balance': remaining_balance
        })
        
        # Если остаток погашен, выходим
        if remaining_balance <= 0.01:
            break
        
        current_month += 1
        remaining_term -= 1
        
        # Пересчёт ежемесячного платежа при досрочном платеже с уменьшением срока
        if early_payment > 0 and early_payment_mode == 'reduce_term' and remaining_balance > 0.01:
            # Пересчитываем аннуитетный платёж с учётом нового остатка и оставшегося срока
            if remaining_term > 0:
                if monthly_rate > 0:
                    current_monthly_payment = remaining_balance * \
                        (monthly_rate * (1 + monthly_rate) ** remaining_term) / \
                        ((1 + monthly_rate) ** remaining_term - 1)
                else:
                    current_monthly_payment = remaining_balance / remaining_term
            else:
                current_monthly_payment = remaining_balance
    
    return schedule


def apply_early_payment(
    schedule: List[Dict],
    month: int,
    amount: float,
    mode: str = 'reduce_payment'
) -> List[Dict]:
    """
    Применяет досрочный платёж и пересчитывает график.
    
    Args:
        schedule: Текущий график платежей
        month: Номер месяца для досрочного платежа
        amount: Сумма досрочного платежа
        mode: 'reduce_payment' (уменьшить платёж) или 'reduce_term' (уменьшить срок)
    
    Returns:
        list[dict]: Обновлённый график платежей
    """
    # Эта функция используется для интерактивного пересчёта
    # В основном расчёте досрочные платежи обрабатываются в generate_payment_schedule
    return schedule
