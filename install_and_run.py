"""
Скрипт для установки зависимостей и запуска приложения.
"""
import subprocess
import sys
import os

def install_package(package):
    """Устанавливает пакет через pip."""
    try:
        print(f"Установка {package}...")
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", package],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"✓ {package} установлен успешно")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Ошибка при установке {package}")
        print(f"  {e.stderr}")
        return False

def main():
    """Основная функция."""
    print("=" * 60)
    print("  Установка зависимостей и запуск калькулятора")
    print("=" * 60)
    print()
    
    # Список пакетов для установки
    packages = [
        "Flask>=3.0.0",
        "openpyxl>=3.1.0",
        "python-dotenv>=1.0.0"
    ]
    
    # Проверяем и устанавливаем пакеты
    print("Проверка зависимостей...")
    print("-" * 60)
    
    for package in packages:
        package_name = package.split("==")[0].lower()
        try:
            __import__(package_name.replace("-", "_"))
            print(f"✓ {package_name} уже установлен")
        except ImportError:
            if not install_package(package):
                print(f"\nНе удалось установить {package}")
                print("Попробуйте установить вручную:")
                print(f"  python -m pip install {package}")
                input("\nНажмите Enter для выхода...")
                return 1
    
    print()
    print("-" * 60)
    print("Все зависимости установлены!")
    print("-" * 60)
    print()
    print("Запуск приложения...")
    print("Приложение будет доступно по адресу: http://localhost:5000")
    print("Для остановки нажмите Ctrl+C")
    print("=" * 60)
    print()
    
    # Запускаем приложение
    try:
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n\nПриложение остановлено пользователем.")
        return 0
    except Exception as e:
        print(f"\n✗ Ошибка запуска приложения: {e}")
        import traceback
        traceback.print_exc()
        input("\nНажмите Enter для выхода...")
        return 1

if __name__ == '__main__':
    sys.exit(main())
