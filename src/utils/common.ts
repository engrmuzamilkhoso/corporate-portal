export class CommonUtil {

  static formatDate(date: Date | string | null, format: string): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);

    // Convert string to Date if necessary
    if (typeof date === 'string') {
      date = new Date(date);
    }

    // Check for valid Date object
    if (date === null || !(date instanceof Date) || isNaN(date.getTime())) {
      return '-'; // Message for invalid or null date
    }

    // Define format options
    const formats: Record<string, string> = {
      'MM/DD/YYYY': `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`,
      'DD/MM/YYYY': `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
      'YYYY-MM-DD': date.toISOString().split('T')[0],
      'DD-MM-YY': `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear().toString().slice(-2)}`,
      'full': new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date),
      'short': new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date),
      'time': new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date),
      // Add other formats as needed
    };

    if (formats[format]) {
      return formats[format];
    } else {
      return 'incorrect date format'; // Message for unsupported format
    }
  }

}
