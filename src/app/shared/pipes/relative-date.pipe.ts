import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeDate', standalone: true, pure: false })
export class RelativeDatePipe implements PipeTransform {
  transform(dateString: string, lang = 'pt-BR'): string {
    const diff = Date.now() - new Date(dateString).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (lang === 'en') {
      if (seconds < 60) return 'just now';
      if (minutes < 60) return `${minutes} min ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    if (seconds < 60) return 'agora mesmo';
    if (minutes < 60) return `há ${minutes} min`;
    if (hours < 24) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  }
}
