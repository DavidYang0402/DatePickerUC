class ULDatePicker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this._container = this.shadowRoot.querySelector(".container");
        this._calendar = this.shadowRoot.querySelector(".calendar");

        const today = new Date();
        this._today = today;
        this._currentLeft = new Date(today.getFullYear(), today.getMonth(), 1);
        this._currentRight = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        this._selectedStart = null;
        this._selectedEnd = null;

        this._viewModeLeft = "date";  // left: year/month/date
        this._viewModeRight = "date"; // right: year/month/date
        this._yearStartLeft = Math.floor(this._currentLeft.getFullYear() / 12) * 12;
        this._yearStartRight = Math.floor(this._currentRight.getFullYear() / 12) * 12;

        this._container.addEventListener("click", () => this._calendar.classList.toggle("open"));
        document.addEventListener("click", (e) => { if (!this.contains(e.target)) this._calendar.classList.remove("open"); });
        this._calendar.addEventListener("click", (e) => this._onClick(e));
    }

    connectedCallback() {
        this._mode = this.getAttribute("mode") || "single";
        this._lang = this.getAttribute("lang") || this._detectLang();
        this._min = this.getAttribute("min") ? new Date(this.getAttribute("min")) : null;
        this._max = this.getAttribute("max") ? new Date(this.getAttribute("max")) : null;

        this._renderCalendar();
    }

    _detectLang() {
        const lang = navigator.language.toLowerCase();
        if (lang.includes("ja")) return "ja";
        if (lang.includes("en")) return "en";
        return "zh-TW";
    }

    _i18n = {
        "zh-TW":
        {
            yearSuffix: "年",
            months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            weekdays: ["日", "一", "二", "三", "四", "五", "六"],
            today: "今天"
        },
        "en": {
            yearSuffix: "",
            months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            today: "Today"
        },
        "ja": {
            yearSuffix: "年",
            months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            weekdays: ["日", "月", "火", "水", "木", "金", "土"],
            today: "今日"
        }
    };

    _formatDate(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

    _onClick(e) {
        const t = e.target;
        const type = t.dataset.type;
        const side = t.dataset.side;

        // 切換月曆上下層
        if (t.classList.contains("year-label")) { this[`_viewMode${this._uc(side)}`] = "year"; this._animateRender(); return; }
        if (t.classList.contains("month-label")) { this[`_viewMode${this._uc(side)}`] = "month"; this._animateRender(); return; }

        // 年份選擇
        if (type === "year") {
            const year = parseInt(t.dataset.value);
            if (side === "left") this._currentLeft.setFullYear(year);
            else this._currentRight.setFullYear(year);
            this[`_viewMode${this._uc(side)}`] = "month";
            this._animateRender();
            return;
        }

        // 月份選擇
        if (type === "month") {
            const month = parseInt(t.dataset.value);
            if (side === "left") this._currentLeft.setMonth(month);
            else this._currentRight.setMonth(month);
            this[`_viewMode${this._uc(side)}`] = "date";
            this._animateRender();
            return;
        }

        // 年份切換
        if (t.classList.contains("prev-left") && this._viewModeLeft === "year") {
            this._yearStartLeft -= 12;
            this._animateRender();
            return;
        }
        if (t.classList.contains("next-left") && this._viewModeLeft === "year") {
            this._yearStartLeft += 12;
            this._animateRender();
            return;
        }
        if (t.classList.contains("prev-right") && this._viewModeRight === "year") {
            this._yearStartRight -= 12;
            this._animateRender();
            return;
        }
        if (t.classList.contains("next-right") && this._viewModeRight === "year") {
            this._yearStartRight += 12;
            this._animateRender();
            return;
        }

        // 月份切換
        if (t.classList.contains("prev-left")) { this._shiftMonth("left", -1); return; }
        if (t.classList.contains("next-left")) { this._shiftMonth("left", 1); return; }
        if (t.classList.contains("prev-right")) { this._shiftMonth("right", -1); return; }
        if (t.classList.contains("next-right")) { this._shiftMonth("right", 1); return; }

        // Today 按鈕（左右獨立）
        if (t.classList.contains("today-btn")) {
            const side = t.dataset.side;
            const todayStr = this._formatDate(this._today);
            if (side === "left") this._currentLeft = new Date(this._today.getFullYear(), this._today.getMonth(), 1);
            else this._currentRight = new Date(this._today.getFullYear(), this._today.getMonth(), 1);

            // 選取邏輯同前
            if (this._mode === "single") {
                this._selectedStart = todayStr;
                this._container.textContent = todayStr;
                this._calendar.classList.remove("open");
                this.dispatchEvent(new CustomEvent("date-change", { detail: todayStr }));
            } else {
                if (!this._selectedStart || (this._selectedStart && this._selectedEnd)) {
                    this._selectedStart = todayStr;
                    this._selectedEnd = null;
                } else {
                    if (new Date(todayStr) < new Date(this._selectedStart)) {
                        this._selectedEnd = this._selectedStart;
                        this._selectedStart = todayStr;
                    } else this._selectedEnd = todayStr;
                }
                this._container.querySelector(".label").textContent =
                    this._selectedStart + (this._selectedEnd ? " ~ " + this._selectedEnd : "");
                this.dispatchEvent(new CustomEvent("date-change", {
                    detail: {
                        start: this._selectedStart,
                        end: this._selectedEnd
                    }
                }));
            }
            this._animateRender();
            return;
        }

        // 日期點擊
        if (type === "date") {
            const dateStr = t.dataset.date;
            const dateObj = new Date(dateStr);
            if (!dateStr || (this._min && dateObj < this._min) || (this._max && dateObj > this._max)) return;
            if (this._mode === "single") {
                this._selectedStart = dateStr;
                this._container.querySelector(".label").textContent = dateStr;
                this._calendar.classList.remove("open");
            } else {
                if (!this._selectedStart || (this._selectedStart && this._selectedEnd)) {
                    this._selectedStart = dateStr;
                    this._selectedEnd = null;
                } else {
                    if (new Date(dateStr) < new Date(this._selectedStart)) {
                        this._selectedEnd = this._selectedStart;
                        this._selectedStart = dateStr;
                    } else this._selectedEnd = dateStr;
                }
                this._container.querySelector(".label").textContent =
                    this._selectedStart + (this._selectedEnd ? " ~ " + this._selectedEnd : "");
            }
            this.dispatchEvent(new CustomEvent("date-change", {
                detail: this._mode === "single" ? this._selectedStart : { start: this._selectedStart, end: this._selectedEnd }
            }));
            if (this._mode === "single") this._calendar.classList.remove("open");
            this._animateRender();
        }
    }

    _uc(side) { return side === "left" ? "Left" : "Right"; }

    _shiftMonth(side, step) {
        const target = side === "left" ? this._currentLeft : this._currentRight;
        target.setMonth(target.getMonth() + step);
        this._animateRender();
    }

    _renderCalendar() {
        if (this._mode === "range") this._renderDualMonth();
        else this._renderSingleMonth();
    }

    _renderSingleMonth() {
        const html = this._renderMonthView(this._currentLeft, "left");
        this._calendar.innerHTML = html + this._renderTodayButton();
    }

    _renderDualMonth() {
        const left = this._renderMonthView(this._currentLeft, "left");
        const right = this._renderMonthView(this._currentRight, "right");
        this._calendar.innerHTML = `<div class="dual"><div class="panel">${left}</div><div class="panel">${right}</div></div>${this._renderTodayButton()}`;
    }

    _renderTodayButton() {
        const label = this._i18n[this._lang].today;
        return `<div class="footer"><button class="today-btn" data-side="left">${label} ←</button><button class="today-btn" data-side="right">→ ${label}</button></div>`;
    }

    _renderMonthView(current, side) {
        const lang = this._i18n[this._lang];
        const year = current.getFullYear(), month = current.getMonth();
        const yearStr = this._i18n[this.year];
        const viewMode = this[`_viewMode${this._uc(side)}`];
        if (viewMode === "year") return this._renderYearView(year, side);
        if (viewMode === "month") return this._renderMonthSelector(year, month, side);

        // 日期層
        const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
        const startWeekday = firstDay.getDay(), daysInMonth = lastDay.getDate(), todayStr = this._formatDate(this._today);
        let html = `
            <div class="header">
                <button class="prev-${side}">&laquo;</button>
                <span class="year-label" data-side="${side}">${year}${lang.yearSuffix}</span>
                <span class="month-label" data-side="${side}">${lang.months[month]}</span>
                <button class="next-${side}">&raquo;</button>
            </div>
            <div class="weekdays">${lang.weekdays.map(w => `<div>${w}</div>`).join("")}</div>
            <div class="days">`;
        for (let i = 0; i < startWeekday; i++) html += `<div class="empty"></div>`;
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const dateObj = new Date(dateStr);
            let cls = "day";
            if (dateStr === todayStr) cls += " today";
            if ((this._min && dateObj < this._min) || (this._max && dateObj > this._max)) cls += " disabled";
            if (this._mode === "range" && this._selectedStart && this._selectedEnd) {
                if (dateStr === this._selectedStart || dateStr === this._selectedEnd) cls += " selected";
                else if (dateObj > new Date(this._selectedStart) && dateObj < new Date(this._selectedEnd)) cls += " in-range";
            } else if (dateStr === this._selectedStart) cls += " selected";
            html += `<div class="${cls}" data-type="date" data-date="${dateStr}">${d}</div>`;
        }
        return html + "</div>";
    }

    _renderYearView(currentYear, side) {
        let html = `<div class="header"><button class="prev-${side}">&laquo;</button><span>${this[`_yearStart${this._uc(side)}`]} - ${this[`_yearStart${this._uc(side)}`] + 11}</span><button class="next-${side}">&raquo;</button></div><div class="grid year-grid">`;
        for (let i = 0; i < 12; i++) {
            const y = this[`_yearStart${this._uc(side)}`] + i;
            html += `<div class="cell ${y === currentYear ? "selected" : ""}" data-type="year" data-side="${side}" data-value="${y}">${y}</div>`;
        }
        return html + "</div>";
    }

    _renderMonthSelector(year, currentMonth, side) {
        const lang = this._i18n[this._lang];
        let html = `<div class="header"><button class="prev-${side}">&laquo;</button><span class="year-label" data-side="${side}">${year}</span><button class="next-${side}">&raquo;</button></div><div class="grid month-grid">`;
        lang.months.forEach((m, i) => { html += `<div class="cell ${i === currentMonth ? "selected" : ""}" data-type="month" data-side="${side}" data-value="${i}">${m}</div>`; });
        return html + "</div>";
    }

    _animateRender() {
        this._calendar.classList.add("fade-out");
        setTimeout(() => { this._renderCalendar(); this._calendar.classList.remove("fade-out"); this._calendar.classList.add("fade-in"); setTimeout(() => this._calendar.classList.remove("fade-in"), 150); }, 150);
    }
}

const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host{position:relative;display:inline-block;font-family:sans-serif;}
        .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 6px 10px;
          background: #fff;
          cursor: pointer;
          user-select: none;
          min-width: 160px;
        }
        .icon {
          font-size: 16px;
          color: #007bff;
          pointer-events: none;
        }
        .calendar{display:none;position:absolute;top:110%;left:0;background:white;border:1px solid #ccc;border-radius:8px;padding:10px;z-index:100;box-shadow:0 4px 10px rgba(0,0,0,0.1);transition:opacity 0.15s ease-in-out;min-width:240px;}
        .calendar.open{display:block;}
        .dual{display:flex;gap:10px;min-width:480px;}
        @media(max-width:600px){
            .dual{
              flex-direction:column;
              min-width:auto;
            }
            .panel{min-width:100%;}
        }
        .panel{flex:1;min-width:220px;}
        .dual .panel:first-child {
            border-right: 1px solid #ddd;
            padding-right: 10px;
            margin-right: 10px;
        }
        .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
        .year-label,.month-label{cursor:pointer;font-weight:bold;}
        .header button{background:none;border:none;cursor:pointer;font-size:16px;padding:4px 8px;}
        .weekdays,.days,.grid{display:grid;grid-template-columns:repeat(7,32px);justify-content:center;text-align:center;gap:2px;}
        .grid.year-grid,.grid.month-grid{grid-template-columns:repeat(4,1fr);}
        .cell,.day{padding:6px 0;border-radius:4px;cursor:pointer;transition:background 0.2s;}
        .cell:hover,.day:hover{background:#f0f0f0;}
        .cell.selected,.day.selected{background-color:#007bff!important;color:white!important;}
        .day.in-range{background-color:#cce5ff;}
        .day.today{border:1px solid #007bff;font-weight:bold;}
        .day.disabled{color:#ccc;pointer-events:none;}
        .footer{text-align:right;margin-top:6px;display:flex;justify-content:space-between;}
        .today-btn{background:#007bff;color:white;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px;}
        .today-btn:hover{background:#0056b3;}
        .empty{visibility:hidden;}
        .fade-in{animation:fadeIn 0.15s ease-in;}
        .fade-out{animation:fadeOut 0.15s ease-out;}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes fadeOut{from{opacity:1;}to{opacity:0;}}
    </style>
    <div class="container">
      <span class="label">選取日期</span>
      <span class="icon">📅</span>
    </div>
    <div class="calendar"></div>
`;

customElements.define("uc-datepicker", ULDatePicker);
