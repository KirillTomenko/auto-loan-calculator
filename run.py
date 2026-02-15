"""
Скрипт для проверки зависимостей и запуска приложения.
"""
import sys
import subprocess

def check_dependencies():
    """Проверяет наличие необходимых зависимостей."""
    required_modules = ['flask', 'openpyxl']
    missing = []
    
    for module in required_modules:
        try:
            __import__(module)
            print(f"✓ {module} установлен")
        except ImportError:
            print(f"✗ {module} НЕ установлен")
            missing.append(module)
    
    return len(missing) == 0

def install_dependencies():
    """Устанавливает недостающие зависимости."""
    print("\nПопытка установки зависимостей...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Зависимости установлены!")
        return True
    except Exception as e:
        print(f"✗ Ошибка установки: {e}")
        return False

def main():
    """Основная функция."""
    print("=" * 50)
    print("  Кредитный калькулятор для автомобиля")
    print("=" * 50)
    print()
    
    if not check_dependencies():
        print("\nНе все зависимости установлены.")
        response = input("Попытаться установить автоматически? (y/n): ")
        if response.lower() == 'y':
            if not install_dependencies():
                print("\nНе удалось установить зависимости автоматически.")
                print("Запустите install.bat или установите вручную:")
                print("  pip install Flask==2.3.0 openpyxl==3.10.0 python-dotenv==0.21.0")
                return 1
        else:
            print("\nУстановите зависимости вручную:")
            print("  pip install Flask==2.3.0 openpyxl==3.10.0 python-dotenv==0.21.0")
            return 1
    
    print("\n" + "=" * 50)
    print("  Запуск приложения...")
    print("=" * 50)
    print("\nПриложение будет доступно по адресу:")
    print("  http://localhost:5000")
    print("\nДля остановки нажмите Ctrl+C")
    print("=" * 50 + "\n")
    
    # Запускаем приложение
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"\n✗ Ошибка запуска: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
