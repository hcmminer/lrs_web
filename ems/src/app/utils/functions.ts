import {NgbDate} from '@ng-bootstrap/ng-bootstrap';
import {formatDate} from '@angular/common';
import { isBuffer } from 'util';

export const convertStringToNGDate = (strDate: string) => {
  let date = new Date(strDate);

  if (!date) {
    date = new Date();
  }

  return new NgbDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

export const join = (t, a, s) =>  {
  return a.map((m) => {
    const formatDt = new Intl.DateTimeFormat('en', m);
    return formatDt.format(t);
  }).join(s);
};

export const getDateInput = (date: {}) => {
  try {
      return new Date(date['year'], date['month'] - 1, date['day']+1).toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

export const getDateInputWithFormat = (date, format: string = 'dd/MM/yyy') => {
  if (!date || date === '') {
    return '';
  }

  let result;

  try {
    result =  new Date(date['year'], date['month'] - 1, date['day']);
  } catch (e) {
    return '';
  }

  return formatDate(result, format, 'en-US');
};

export function debounce(delay: number = 500): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const timeoutKey = Symbol();

    const original = descriptor.value;

    descriptor.value = function (...args) {
      clearTimeout(this[timeoutKey]);
      this[timeoutKey] = setTimeout(() => original.apply(this, args), delay);
    };

    return descriptor;
  };
}
