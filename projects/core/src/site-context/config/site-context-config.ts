import { Injectable } from '@angular/core';
import { Config } from '../../config/config-tokens';

@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class SiteContextConfig {
  context?: {
    urlParameters?: string[];
    [contextName: string]: string[];
  };
}
