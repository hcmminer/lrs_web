import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SafeHtmlPipe} from '../../../pipes/safeHtml.pipe';
import {CoordinateDirective} from './coordinate.directives';
import { StylePaginatorDirective } from './style-paginator.directive';




@NgModule({
  declarations: [SafeHtmlPipe, CoordinateDirective, StylePaginatorDirective],
  exports: [SafeHtmlPipe, CoordinateDirective, StylePaginatorDirective],
  imports: [
    CommonModule
  ]
})
export class SharedDisplayHtmlModule { }
