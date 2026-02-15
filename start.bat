@echo off
chcp 65001 >nul
echo ========================================
echo  Запуск кредитного калькулятора
echo ========================================
echo.

REM Проверяем наличие зависимостей
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ИНФО] Зависимости не найдены. Начинаю установку...
    echo.
    python -m pip install "Flask>=3.0.0"
    python -m pip install "openpyxl>=3.1.0"
    python -m pip install "python-dotenv>=1.0.0"
    echo.
    echo [ИНФО] Установка завершена!
    echo.
)

echo Запуск приложения...
echo Приложение будет доступно по адресу: http://localhost:5000
echo Для остановки нажмите Ctrl+C
echo ========================================
echo.

python app.py

if %errorlevel% neq 0 (
    echo.
    echo [ОШИБКА] Не удалось запустить приложение.
    echo.
    echo Возможные причины:
    echo 1. Python не установлен или не добавлен в PATH
    echo 2. Ошибка при установке зависимостей
    echo.
    echo Попробуйте запустить install.bat для установки зависимостей
    echo.
    pause
)
