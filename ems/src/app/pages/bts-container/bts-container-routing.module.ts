import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BtsComponent } from "./sub-menus/bts/bts.component";

const routes: Routes = [
  {
    path: "",
    children: [
      { path: "list-bts", component: BtsComponent },
      { path: "", redirectTo: "list-bts", pathMatch: "full" },
      { path: "**", redirectTo: "error/404", pathMatch: "full" },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BtsContainerRoutingModule {}
