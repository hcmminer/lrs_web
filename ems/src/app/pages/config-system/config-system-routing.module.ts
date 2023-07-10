import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConfigSystemComponent } from "./config-system.component";
import { PriceRangeManagerComponent } from "./sub-menus/price-range-manager/price-range-manager.component";

const routes: Routes = [
  {
    path: "",
    // component: QuanLyDanhMucComponent,
    children: [
      { path: "options", component: ConfigSystemComponent },
      { path: "", redirectTo: "options", pathMatch: "full" },
      { path: "priceRange", component: PriceRangeManagerComponent },
      { path: "", redirectTo: "options", pathMatch: "full" },
      { path: "**", redirectTo: "error/404", pathMatch: "full" },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigSystemRoutingModule {}
