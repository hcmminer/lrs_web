import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from '../../../pipes/safeHtml.pipe';
import { CoordinateDirective } from './coordinate.directives';
import { StylePaginatorDirective } from './style-paginator.directive';
import { NumbersOnlyDirective } from 'src/app/pages/directives/only-number.directive';
import { FormatNumberPipe } from '../../core/pipes/formatNumber.pipe';

@NgModule({
  declarations: [SafeHtmlPipe, CoordinateDirective, StylePaginatorDirective, NumbersOnlyDirective, FormatNumberPipe],
  exports: [SafeHtmlPipe, CoordinateDirective, StylePaginatorDirective, NumbersOnlyDirective, FormatNumberPipe],
  imports: [CommonModule],
})
export class SharedDisplayHtmlModule {}
