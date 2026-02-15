@echo off
chcp 65001 >nul
title Кредитный калькулятор
color 0A

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║   КРЕДИТНЫЙ КАЛЬКУЛЯТОР ДЛЯ АВТОМОБИЛЯ             ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Переходим в директорию скрипта
cd /d "%~dp0"

REM Проверяем наличие Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Python не найден!
    echo Установите Python с https://www.python.org/
    echo.
    pause
    exit /b 1
)

REM Проверяем и устанавливаем зависимости
echo [ШАГ 1/2] Проверка зависимостей...
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ИНФО] Установка зависимостей...
    echo.
    python -m pip install --quiet "Flask>=3.0.0"
    python -m pip install --quiet "openpyxl>=3.1.0"
    python -m pip install --quiet "python-dotenv>=1.0.0"
    echo [OK] Зависимости установлены
    echo.
) else (
    echo [OK] Все зависимости установлены
    echo.
)

REM Запускаем приложение
echo [ШАГ 2/2] Запуск приложения...
echo.
echo ═══════════════════════════════════════════════════════
echo   Приложение будет доступно по адресу:
echo   http://localhost:5000
echo.
echo   Для остановки нажмите Ctrl+C
echo ═══════════════════════════════════════════════════════
echo.

python app.py

if %errorlevel% neq 0 (
    echo.
    echo [ОШИБКА] Приложение завершилось с ошибкой
    pause
)
