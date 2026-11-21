import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '../services/translate.service';

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private ts = inject(TranslateService);

  transform(key: string): string {
    // Read lang signal so templates refresh when the language changes.
    this.ts.lang();
    return this.ts.t(key);
  }
}
