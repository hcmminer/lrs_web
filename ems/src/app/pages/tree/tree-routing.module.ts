import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TreeChecklistComponent} from './tree-checklist/tree-checklist.component';

const routes: Routes = [
    {
        path: '',
        component: TreeChecklistComponent,
        children: [
            { path: 'tree-checklist', component: TreeChecklistComponent},
        ],
    },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TreeRoutingModule {}
