import {NgModule} from '@angular/core';

import {TreeChecklistComponent} from './tree-checklist/tree-checklist.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {TreeRoutingModule} from './tree-routing.module';
import {MatTreeModule} from '@angular/material/tree';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        TreeChecklistComponent
    ],
    exports: [
        TreeChecklistComponent
    ],
    imports: [
        TreeRoutingModule,
        MatIconModule,
        MatCheckboxModule,
        MatTreeModule,
        TranslateModule
    ]
})
export class TreeModule {}
