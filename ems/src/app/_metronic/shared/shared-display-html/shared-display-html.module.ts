import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SafeHtmlPipe} from '../../../pipes/safeHtml.pipe';
import {CoordinateDirective} from './coordinate.directives';



@NgModule({
  declarations: [SafeHtmlPipe, CoordinateDirective],
  exports: [SafeHtmlPipe, CoordinateDirective],
  imports: [
    CommonModule
  ]
})
export class SharedDisplayHtmlModule { }
