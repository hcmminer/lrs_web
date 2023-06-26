import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FunctionCategoryComponent} from './function-category.component';
import {EditFunctionCategoryModalComponent} from './components/edit-function-category-modal/edit-function-category-modal.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbDateParserFormatter, NgbDatepickerModule, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {InlineSVGModule} from 'ng-inline-svg';
import {CRUDTableModule} from '../../_metronic/shared/crud-table';
import {FunctionCategoriesService} from '../_services/function-categories.service';
import {DeleteFunctionCategoryModalComponent} from './components/delete-function-category-modal/delete-function-category-modal.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatIconModule} from '@angular/material/icon';
import {NgbDateCustomParserFormatter} from '../../_metronic/core/utils/ngb-date-custom-parser-formatter';

@NgModule({
  declarations: [
    FunctionCategoryComponent,
    EditFunctionCategoryModalComponent,
    DeleteFunctionCategoryModalComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: FunctionCategoryComponent,
      },
    ]),
    FormsModule,
    ReactiveFormsModule,
    InlineSVGModule,
    CRUDTableModule,
    NgbModalModule,
    NgbDatepickerModule,
    TranslateModule,
    MatIconModule,
  ],
  entryComponents: [
    EditFunctionCategoryModalComponent,
    DeleteFunctionCategoryModalComponent
  ],
  providers: [
    {provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter}
  ]
})

export class FunctionCategoryModule {
}
