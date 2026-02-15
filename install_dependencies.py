"""
Скрипт для установки зависимостей проекта.
"""
import subprocess
import sys

def install_package(package):
    """Устанавливает пакет через pip."""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✓ Успешно установлен: {package}")
        return True
    except subprocess.CalledProcessError:
        print(f"✗ Ошибка при установке: {package}")
        return False

def main():
    """Основная функция установки зависимостей."""
    packages = [
        "Flask>=3.0.0",
        "openpyxl>=3.1.0",
        "python-dotenv>=1.0.0"
    ]
    
    print("Начинаю установку зависимостей...")
    print("-" * 50)
    
    success_count = 0
    for package in packages:
        if install_package(package):
            success_count += 1
    
    print("-" * 50)
    print(f"Установлено пакетов: {success_count}/{len(packages)}")
    
    if success_count == len(packages):
        print("\n✓ Все зависимости успешно установлены!")
        return 0
    else:
        print("\n✗ Некоторые зависимости не удалось установить.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
