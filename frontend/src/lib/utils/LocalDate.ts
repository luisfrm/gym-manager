export class LocalDate {
  private date: Date;

  constructor(date?: Date | string | number) {
    if (date instanceof Date) {
      this.date = new Date(date);
    } else if (typeof date === 'string') {
      // Handle ISO date strings (YYYY-MM-DD) to avoid timezone issues
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-').map(Number);
        this.date = new Date(year, month - 1, day);
      } else {
        this.date = new Date(date);
      }
    } else if (typeof date === 'number') {
      this.date = new Date(date);
    } else {
      this.date = new Date();
    }
  }

  // Get the original Date object
  getValue(): Date {
    return new Date(this.date);
  }

  // Format date with custom format
  getFullDate(format: string = "DD/MM/YYYY"): string {
    const day = String(this.date.getDate()).padStart(2, '0');
    const month = String(this.date.getMonth() + 1).padStart(2, '0');
    const monthName = this.getMonthName();
    const year = this.date.getFullYear();

    return format
      .replace(/DD/g, day)
      .replace(/MMMM/g, monthName)
      .replace(/MM/g, month)
      .replace(/YYYY/g, String(year))
      .replace(/YY/g, String(year).slice(-2));
  }

  // Get month (1-12)
  getMonth(): number {
    return this.date.getMonth() + 1;
  }

  // Get day of month (1-31)
  getDay(): number {
    return this.date.getDate();
  }

  // Get year
  getYear(): number {
    return this.date.getFullYear();
  }

  // Get day of week (0-6, Sunday is 0)
  getDayOfWeek(): number {
    return this.date.getDay();
  }

  // Get day name in Spanish
  getDayName(): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[this.date.getDay()];
  }

  // Get month name in Spanish
  getMonthName(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[this.date.getMonth()];
  }

  // Format as ISO date string (YYYY-MM-DD) without timezone conversion
  toISODateString(): string {
    const year = this.date.getFullYear();
    const month = String(this.date.getMonth() + 1).padStart(2, '0');
    const day = String(this.date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Add days
  addDays(days: number): LocalDate {
    const newDate = new Date(this.date);
    newDate.setDate(newDate.getDate() + days);
    return new LocalDate(newDate);
  }

  // Subtract days
  subtractDays(days: number): LocalDate {
    return this.addDays(-days);
  }

  // Add months
  addMonths(months: number): LocalDate {
    const newDate = new Date(this.date);
    newDate.setMonth(newDate.getMonth() + months);
    return new LocalDate(newDate);
  }

  // Get start of month
  startOfMonth(): LocalDate {
    return new LocalDate(new Date(this.date.getFullYear(), this.date.getMonth(), 1));
  }

  // Get end of month
  endOfMonth(): LocalDate {
    return new LocalDate(new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0));
  }

  // Check if date is before another date
  isBefore(other: LocalDate): boolean {
    return this.date < other.date;
  }

  // Check if date is after another date
  isAfter(other: LocalDate): boolean {
    return this.date > other.date;
  }

  // Check if date is same as another date
  isSame(other: LocalDate): boolean {
    return this.toISODateString() === other.toISODateString();
  }

  // Static methods for common operations
  static today(): LocalDate {
    return new LocalDate();
  }

  static fromYearMonth(year: number, month: number): LocalDate {
    return new LocalDate(new Date(year, month - 1, 1));
  }

  static fromDateString(dateString: string): LocalDate {
    return new LocalDate(dateString);
  }
} 