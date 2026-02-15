# Инструкция по установке и запуску

## Требования

- Python 3.8 или выше
- pip (менеджер пакетов Python)

## Шаги установки

### 1. Установите зависимости

Откройте терминал в корневой директории проекта и выполните:

```bash
pip install -r requirements.txt
```

Это установит следующие пакеты:
- Flask 2.3.0
- openpyxl 3.10.0
- python-dotenv 0.21.0

### 2. Запустите приложение

Выполните команду:

```bash
python app.py
```

Или на некоторых системах:

```bash
python3 app.py
```

### 3. Откройте в браузере

После запуска вы увидите сообщение:
```
 * Running on http://127.0.0.1:5000
```

Откройте браузер и перейдите по адресу: **http://localhost:5000**

## Структура директорий

При первом запуске приложение автоматически создаст необходимые директории:
- `exports/` - для сохранения Excel файлов
- `static/css/` - CSS файлы
- `static/js/` - JavaScript файлы
- `templates/` - HTML шаблоны

## Решение проблем

### Порт 5000 занят

Если порт 5000 уже занят, измените порт в файле `app.py`:

```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Используйте другой порт
```

### Ошибки импорта

Убедитесь, что все зависимости установлены:

```bash
pip install --upgrade -r requirements.txt
```

### Проблемы с правами доступа

На Linux/Mac может потребоваться использовать `sudo`:

```bash
sudo pip install -r requirements.txt
```

Или лучше использовать виртуальное окружение:

```bash
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Использование виртуального окружения (рекомендуется)

### Windows:
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Linux/Mac:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
