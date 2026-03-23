import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

@Pipe({
  name: 'relativeTime',
  standalone: true
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '-';
    }
    const dt = typeof value === 'string' ? dayjs(value) : dayjs(value);
    if (!dt.isValid()) {
      return '-';
    }
    return dt.fromNow();
  }
}
