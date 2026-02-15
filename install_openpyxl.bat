@echo off
chcp 65001 >nul
echo Установка openpyxl...
echo.

python -m pip install "openpyxl>=3.1.0"

if %errorlevel% equ 0 (
    echo.
    echo [OK] openpyxl успешно установлен!
    echo.
    echo Теперь можно запустить приложение через БЫСТРЫЙ_ЗАПУСК.bat
) else (
    echo.
    echo [ОШИБКА] Не удалось установить openpyxl
    echo Попробуйте установить вручную:
    echo   python -m pip install openpyxl
)

echo.
pause
