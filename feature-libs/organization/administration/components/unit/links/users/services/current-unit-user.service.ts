import { Injectable } from '@angular/core';
import { B2BUser, RoutingService } from '@spartacus/core';
import { B2BUserService } from '@spartacus/organization/administration/core';
import { Observable, of } from 'rxjs';
import { ROUTE_PARAMS } from '../../../../constants';
import { CurrentItemService } from '../../../../shared/current-item.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentUnitUserService extends CurrentItemService<B2BUser> {
  constructor(
    protected routingService: RoutingService,
    protected b2bUserService: B2BUserService
  ) {
    super(routingService);
  }

  getDetailsRoute(): string {
    return 'orgUnitUserList';
  }

  protected getParamKey() {
    return ROUTE_PARAMS.userCode;
  }

  protected getItem(customerId: string): Observable<B2BUser> {
    return customerId ? this.b2bUserService.get(customerId) : of({});
  }

  getError(code: string): Observable<boolean> {
    return this.b2bUserService.getErrorState(code);
  }
}
