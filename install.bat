@echo off
echo Установка зависимостей проекта...
echo.

python -m pip install "Flask>=3.0.0"
if %errorlevel% equ 0 (
    echo [OK] Flask установлен
) else (
    echo [ERROR] Ошибка установки Flask
)

python -m pip install "openpyxl>=3.1.0"
if %errorlevel% equ 0 (
    echo [OK] openpyxl установлен
) else (
    echo [ERROR] Ошибка установки openpyxl
)

python -m pip install "python-dotenv>=1.0.0"
if %errorlevel% equ 0 (
    echo [OK] python-dotenv установлен
) else (
    echo [ERROR] Ошибка установки python-dotenv
)

echo.
echo Установка завершена!
pause
