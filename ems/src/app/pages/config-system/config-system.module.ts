import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ConfigSystemRoutingModule } from "./config-system-routing.module";
import {
  NgbActiveModal,
  NgbDatepickerModule,
  NgbModalModule,
} from "@ng-bootstrap/ng-bootstrap";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { ConfigSystemComponent } from "./config-system.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatRadioModule } from "@angular/material/radio";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { TranslateModule } from "@ngx-translate/core";
import { InlineSVGModule } from "ng-inline-svg";
import { NgxDropzoneModule } from "ngx-dropzone";
import { NgxSpinnerModule } from "ngx-spinner";
import { CRUDTableModule } from "src/app/_metronic/shared/crud-table";
import { ProvincialManagementComponent } from "./all-tab/provincial-management/provincial-management.component";
import { SharedDisplayHtmlModule } from "src/app/_metronic/shared/shared-display-html/shared-display-html.module";
import { FormAddEditProvinceComponent } from "./all-tab/provincial-management/form-add-edit-province/form-add-edit-province.component";
import { CommonAlertDialogComponent } from "../common/common-alert-dialog/common-alert-dialog.component";
import { CommuneManagementComponent } from "./all-tab/commune-management/commune-management.component";
import { FormAddEditCommuneComponent } from "./all-tab/commune-management/form-add-edit-commune/form-add-edit-commune.component";
import { VillageManagementComponent } from "./all-tab/village-management/village-management.component";
import { FormAddEditVillageComponent } from "./all-tab/village-management/form-add-edit-village/form-add-edit-village.component";
// bandv..
import { TabOptionSetComponent } from "./all-tab/tab-option-set/tab-option-set.component";
import { TabOptionSetValueComponent } from "./all-tab/tab-option-set-value/tab-option-set-value.component";
import { AddEditDataComponent } from "./all-tab/tab-option-set/childs/add-edit-data/add-edit-data.component";
import { AddEditDataComponent as AddEditDataComponent_1 } from "./all-tab/tab-option-set-value/childs/add-edit-data/add-edit-data.component";
// ..bandv

@NgModule({
  declarations: [
    // bandv..
    ConfigSystemComponent,
    TabOptionSetComponent,
    TabOptionSetValueComponent,
    AddEditDataComponent,
    AddEditDataComponent_1,
    // ..bandv

    CommonAlertDialogComponent,
    ProvincialManagementComponent,
    FormAddEditProvinceComponent,
    CommuneManagementComponent,
    FormAddEditCommuneComponent,
    VillageManagementComponent,
    FormAddEditVillageComponent,
  ],
  providers: [NgbActiveModal, { provide: MAT_DATE_LOCALE, useValue: "en-GB" }],
  imports: [
    CommonModule,
    ConfigSystemRoutingModule,
    FormsModule,
    InlineSVGModule,
    TranslateModule,
    ReactiveFormsModule,
    InlineSVGModule,
    NgbModalModule,
    MatIconModule,
    NgbDatepickerModule,
    MatNativeDateModule,
    MatDatepickerModule,
    CRUDTableModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    NgxDropzoneModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatRadioModule,
    // SharedDisplayHtmlModule,
  ],
})
export class ConfigSystemModule {}
