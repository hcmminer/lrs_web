import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    value = value?.toString();
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

}
