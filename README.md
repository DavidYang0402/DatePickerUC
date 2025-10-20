# 📅 UCDatePicker v6
**A modern, framework-independent date picker for enterprise systems**  
支援 **雙月獨立切換、年月選單、雙 Today 按鈕、RWD、自訂語系、min/max 限制**。  

---

## 🚀 功能特色

| 類別 | 功能 |
|------|------|
| 📆 **日期模式** | 支援 `single` 單日選取與 `range` 範圍選取 |
| 🧭 **雙月獨立切換** | 左右月曆可獨立切換月份（非連動） |
| 🎯 **雙 Today 按鈕** | 左右各自控制，回到對應那側的今天 |
| 📅 **年月選單** | 點年份 → 顯示年份選單 → 選取後顯示月份選單 → 回日期 |
| 🔒 **日期限制** | 支援 `min` / `max` 屬性限制可選範圍 |
| 🌐 **多語系** | 內建 `zh-TW`、`en`、`ja` |
| 📱 **RWD 響應式** | 桌面顯示雙月，手機自動變單月 |
| 💫 **動畫效果** | 切換年/月/日時有淡入淡出動畫 |
| ⚙️ **框架無依賴** | 原生 Web Component，可在 React / Blazor / ASP.NET / Vue / Angular / HTML 中使用 |

---

## 🧩 安裝與使用

### 1️⃣ 將元件引入頁面

```html
<script src="uc-datepicker.js"></script>
```

> 若使用模組化架構，可將 `uc-datepicker.js` 匯入專案目錄中再引用。

---

### 2️⃣ 在 HTML / Razor / Blazor / Vue 中直接使用

```html
<uc-datepicker 
  mode="range"
  lang="zh-TW"
  min="2025-10-01"
  max="2025-11-30">
</uc-datepicker>
```

---

## ⚙️ 屬性 (Attributes)

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `mode` | `single` / `range` | `single` | 選擇模式：單日期或日期範圍 |
| `lang` | `zh-TW` / `en` / `ja` | 自動偵測 | 語系設定 |
| `min` | `YYYY-MM-DD` | 無 | 最小可選日期 |
| `max` | `YYYY-MM-DD` | 無 | 最大可選日期 |

---

## 🧭 事件 (Events)

### `date-change`

當使用者選取日期後觸發。  

#### 單日模式：
```js
datepicker.addEventListener("date-change", e => {
  console.log("Selected date:", e.detail);
});
```

輸出：
```json
"2025-10-20"
```

#### 範圍模式：
```js
datepicker.addEventListener("date-change", e => {
  console.log("Range:", e.detail.start, "→", e.detail.end);
});
```

輸出：
```json
{ "start": "2025-10-05", "end": "2025-10-14" }
```

---

## 💡 使用範例

### 單日期選擇
```html
<uc-datepicker mode="single" lang="en"></uc-datepicker>
```

### 範圍選擇 (含日期限制)
```html
<uc-datepicker 
  mode="range"
  lang="zh-TW"
  min="2025-10-01"
  max="2025-11-30">
</uc-datepicker>
```

### 在 ASP.NET Razor 中
```razor
<div class="form-group">
  <label>日期範圍</label>
  <uc-datepicker id="datePicker" mode="range" min="2025-10-01" max="2025-11-30"></uc-datepicker>
</div>
```

---

## 🧱 RWD 行為

| 裝置 | 顯示樣式 |
|------|-----------|
| 桌面 | 雙月曆（左右分開顯示兩個月） |
| 手機 / 平板 (≤600px) | 單月曆（自動垂直排列） |

---

## 🕹️ 快速鍵 (v7 將加入)
| 鍵 | 功能 |
|----|------|
| ← / → | 翻月 |
| ↑ / ↓ | 翻年 |
| Esc | 關閉日曆 |
| Enter | 選取當前日期 |

---

## 🎨 樣式客製化

因為使用 **Shadow DOM**，若要自訂樣式，可使用 CSS Variables 或透過 `::part()` 暴露樣式 API（v7 計畫中）。  

目前可以透過修改 `uc-datepicker.js` 內部樣式區塊 (`template.innerHTML`) 來調整外觀。

---

## 🧠 設計理念

UCDatePicker 目標是提供：
- **企業系統穩定度**（支援報表、預算、請假等跨年度應用）
- **使用者體驗一致性**（多語系、雙月分離、today 快捷）
- **跨平台可移植性**（可直接用於 React / Blazor / ASP.NET）

> Unlike most “linked” date pickers, UCDatePicker allows **independent left/right navigation** for power users who need to compare or select wide date ranges.

---

## 📜 版本資訊

| 版本 | 更新內容 |
|------|-----------|
| v6 | 加入雙 Today 控制、年月選單、雙月獨立切換、RWD 響應式、自動高亮 |
| v5 | 加入 Today 按鈕與 min/max 限制 |
| v4 | 支援語系與範圍選擇 |
| v3 | 初始版本，支援單日選取 |
