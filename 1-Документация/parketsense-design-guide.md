# ParketsensE Design Guide - Точни инструкции за Cursor

## 🎨 ЦВЕТОВА ПАЛИТРА

### Основни цветове
```css
/* Основни цветове за приложението */
--primary-dark: #2B2B2B;          /* Тъмносив за headers */
--primary-black: #1A1A1A;         /* Черен за текст и акценти */
--background-light: #F5F5F5;      /* Светлосив фон */
--white: #FFFFFF;                 /* Бял за форми и карти */
--success-green: #4CAF50;         /* Зелен за потвърждаващи бутони */
--accent-green: #81C784;          /* По-светъл зелен за hover ефекти */
--text-primary: #212121;          /* Основен текст */
--text-secondary: #757575;        /* Secondary текст */
--border-light: #E0E0E0;          /* Светли граници */
--shadow-light: rgba(0,0,0,0.1);  /* Леки сенки */
```

### Бутони - специфични цветове
```css
/* Зелен primary бутон */
--btn-success: #4CAF50;
--btn-success-hover: #45A049;
--btn-success-text: #FFFFFF;

/* Черен accent бутон */
--btn-black: #1A1A1A;
--btn-black-hover: #333333;
--btn-black-text: #FFFFFF;

/* Червен за предупреждения */
--btn-danger: #F44336;
--btn-danger-hover: #D32F2F;

/* Сив secondary бутон */
--btn-secondary: #9E9E9E;
--btn-secondary-hover: #757575;
```

## 🏗️ LAYOUT СТРУКТУРА

### Modal Dialog (Основен компонент)
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90vw;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  background: #2B2B2B;
  color: white;
  padding: 20px 30px;
  font-size: 18px;
  font-weight: 600;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}
```

## 📝 ФОРМИ И INPUT ЕЛЕМЕНТИ

### Text Inputs
```css
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #212121;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-input::placeholder {
  color: #BDBDBD;
}
```

### Dropdown/Select елементи
```css
.form-select {
  width: 100%;
  padding: 12px 16px;
  padding-right: 40px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23757575" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  appearance: none;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}
```

### Checkbox елементи
```css
.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  accent-color: #4CAF50;
}

.checkbox-label {
  font-size: 14px;
  color: #212121;
  cursor: pointer;
}
```

## 🔘 БУТОНИ - ТОЧНИ СТИЛОВЕ

### Primary зелен бутон (ЗАПАЗИ)
```css
.btn-primary {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-primary:hover {
  background: #45A049;
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}
```

### Черни accent бутони (с плюс)
```css
.btn-add {
  background: #1A1A1A;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 18px;
  font-weight: bold;
}

.btn-add:hover {
  background: #333333;
  transform: scale(1.1);
}

.btn-add::before {
  content: '+';
}
```

### Secondary бутон (Отказ)
```css
.btn-secondary {
  background: transparent;
  color: #757575;
  border: 1px solid #E0E0E0;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.btn-secondary:hover {
  background: #F5F5F5;
  border-color: #BDBDBD;
}
```

## 📱 RESPONSIVE GRID LAYOUT

### Двуколонна форма
```css
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

/* За полета с бутони за добавяне */
.form-row-with-add {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 15px;
  align-items: end;
}
```

## 🎯 СПЕЦИФИЧНИ КОМПОНЕНТИ

### Modal Header с X бутон
```css
.modal-header {
  background: #2B2B2B;
  color: white;
  padding: 20px 30px;
  font-size: 18px;
  font-weight: 600;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

### Form Container
```css
.modal-body {
  padding: 30px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

.form-container {
  display: grid;
  gap: 20px;
}
```

### Action Buttons Container
```css
.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #E0E0E0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  background: #FAFAFA;
}
```

## ⚡ ИНТЕРАКТИВНИ ЕФЕКТИ

### Hover ефекти
```css
/* Hover за inputs */
.form-input:hover {
  border-color: #BDBDBD;
}

/* Hover за dropdowns */
.form-select:hover {
  border-color: #BDBDBD;
}

/* Focus states */
.form-input:focus,
.form-select:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}
```

### Анимации
```css
.modal-container {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

## 🔤 ТИПОГРАФИКА

### Font настройки
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #212121;
}

/* Headers */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  color: #1A1A1A;
}

/* Form labels */
.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #212121;
}

/* Small text */
.text-small {
  font-size: 12px;
  color: #757575;
}
```

## 🎛️ ИНСТРУКЦИИ ЗА CURSOR

### ⚡ ВАЖНО: Паралелна работа в множество прозорци
Този документ е създаден за работа с Cursor в паралелни прозорци за различни задачи. Всеки prompt трябва да бъде **самостоятелен** и да не разчита на предишна история на разговора.

### 📢 TEMPLATE ЗА PROMPT В CURSOR:
```
Работя по ParketsensE ERP система. Прикачам DESIGN-GUIDE.md който съдържа точните дизайн изисквания.

ЗАДАЧА: [опишете конкретната задача]

ИЗИСКВАНИЯ:
- Следвай ТОЧНО цветовата палитра от DESIGN-GUIDE.md
- Използвай modal структурата както е описана
- Спазвай всички CSS стандарти от гайда
- НЕ използвай Bootstrap или други UI библиотеки

КОНТЕКСТ: Работя в паралелни Cursor прозорци, така че този prompt е самостоятелен.
```

### 1. Използвай точно тези CSS променливи в началото на всеки стил файл:
```css
:root {
  --primary-dark: #2B2B2B;
  --primary-black: #1A1A1A;
  --background-light: #F5F5F5;
  --white: #FFFFFF;
  --success-green: #4CAF50;
  --text-primary: #212121;
  --text-secondary: #757575;
  --border-light: #E0E0E0;
}
```

### 2. Всички модални диалози трябва да следват тази структура:
```html
<div class="modal-overlay">
  <div class="modal-container">
    <div class="modal-header">
      <h2 class="modal-title">Заглавие</h2>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      <!-- Форма съдържание -->
    </div>
    <div class="modal-footer">
      <button class="btn-secondary">Отказ</button>
      <button class="btn-primary">ЗАПАЗИ</button>
    </div>
  </div>
</div>
```

### 3. Задължителни изисквания:
- ✅ Винаги използвай тъмносив (#2B2B2B) за modal headers
- ✅ Зелен (#4CAF50) само за primary действия (ЗАПАЗИ, ПОТВЪРДИ)
- ✅ Черни кръгли бутони с плюс за добавяне на опции
- ✅ Всички inputs с padding: 12px 16px
- ✅ Border radius: 4px за форми, 8px за модали
- ✅ Hover ефекти със subtle transforms
- ✅ Grid layout за responsive формуляри

### 4. НЕ ИЗПОЛЗВАЙ:
- ❌ Bootstrap classes
- ❌ Material-UI components
- ❌ Други готови UI библиотеки
- ❌ Силни сенки или gradients
- ❌ Ярки цветове освен зеления accent

### 5. Приоритет на styling:
1. Custom CSS с точните променливи
2. CSS Grid за layout
3. Flexbox за компоненти
4. CSS переходи за интерактивност

### 🔄 ПАРАЛЕЛНА РАБОТА - BEST PRACTICES:

#### За всеки нов Cursor прозорец използвай:
```
CONTEXT: ParketsensE ERP - [МОДУЛ/КОМПОНЕНТ]
DESIGN: Следвам DESIGN-GUIDE.md (прикачен)
TASK: [конкретна задача]
TECH STACK: React/Vue/HTML+CSS (според проекта)
```

#### Стандартни примери за промпт:
```
МОДАЛ ФОРМА:
"Създай модал форма за [цел] следвайки точно modal структурата от DESIGN-GUIDE.md. Използвай тъмносив header, зелен ЗАПАЗИ бутон, grid layout за полетата."

ТАБЛИЦА/СПИСЪК:
"Създай таблица/списък следвайки цветовата палитра от DESIGN-GUIDE.md. Header фон #2B2B2B, hover ефекти, зелени action бутони."

FORM КОМПОНЕНТИ:
"Създай form компоненти (input, select, checkbox) със стиловете от DESIGN-GUIDE.md. Padding 12px 16px, border #E0E0E0, focus зелен."
```

#### Консистентност между прозорците:
- Винаги прикачвай DESIGN-GUIDE.md
- Споменавай "ParketsensE ERP система"
- Използвай същите CSS променливи
- Референцирай конкретни секции от гайда

## 📋 CHECKLIST ЗА ВСЕКИ КОМПОНЕНТ:

- [ ] Използва точните цветове от палитрата
- [ ] Modal headers са тъмносиви (#2B2B2B)
- [ ] Зелени бутони (#4CAF50) само за primary действия
- [ ] Черни accent бутони за добавяне
- [ ] Правилни padding/margin стойности
- [ ] Responsive grid layout
- [ ] Hover и focus states
- [ ] Accessible form labels
- [ ] Консистентна типографика

## 🔥 БЪРЗ PROMPT TEMPLATE ЗА CURSOR:
```
ParketsensE ERP | DESIGN-GUIDE.md прикачен

ЗАДАЧА: [опиши какво искаш]

СТИЛ: Точно по DESIGN-GUIDE.md
- Modal header: #2B2B2B
- Primary бутон: #4CAF50 зелен
- Input padding: 12px 16px
- Grid layout за форми

TECH: [React/Vue/HTML] + CSS

Паралелна работа - този prompt е самостоятелен.
```

---

**ВАЖНО ЗА ПАРАЛЕЛНА РАБОТА:** 
- 🔄 Всеки Cursor прозорец е независим
- 📎 Винаги прикачвай този файл  
- 🎯 Използвай template промптовете за консистентност
- ✅ Проверявай checklist за всеки компонент

**КРАЙ НА DESIGN GUIDE** - Този design guide е базиран на конкретния дизайн от файла 2.png и трябва да се спазва точно за да се постигне визуална консистентност в цялото приложение.