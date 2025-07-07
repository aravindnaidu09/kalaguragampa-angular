import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'htmlDecode'
})
export class HtmlDecodePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    // Replace width="502" with width="0" and add class='w-100'
    textarea.value = textarea.value.replace(/width="502"/g, 'width="0" class="w-100"');
    return textarea.value.replace(/<br\s*\/?>/gi, '');
  }
}
