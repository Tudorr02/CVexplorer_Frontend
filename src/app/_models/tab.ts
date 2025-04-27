
import { Params } from "@angular/router";

export interface Tab {
    label: string;
    route: string;
    queryParams?: Params
    icon: string;
    disabled?: boolean;
  }
  