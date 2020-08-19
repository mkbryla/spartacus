import { Pipe, PipeTransform } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import {
  I18nTestingModule,
  RoutingService,
  OrgUnitService,
  RoutesConfig,
  RoutingConfig,
  B2BUnit,
} from '@spartacus/core';

import { UnitDetailsComponent } from './unit-details.component';
import createSpy = jasmine.createSpy;
import { defaultStorefrontRoutesConfig } from 'projects/storefrontlib/src/cms-structure/routing/default-routing-config';
import { Table2Module } from '@spartacus/storefront';

const code = 'b1';

const mockOrgUnit: B2BUnit = {
  uid: code,
  name: 'orgUnit1',
};

@Pipe({
  name: 'cxUrl',
})
class MockUrlPipe implements PipeTransform {
  transform() {}
}

class MockOrgUnitService implements Partial<OrgUnitService> {
  load = createSpy('load');
  get = createSpy('get').and.returnValue(of(mockOrgUnit));
  update = createSpy('update');
}

class MockRoutingService {
  go = createSpy('go').and.stub();
}

const mockRoutesConfig: RoutesConfig = defaultStorefrontRoutesConfig;
class MockRoutingConfig {
  getRouteConfig(routeName: string) {
    return mockRoutesConfig[routeName];
  }
}

describe('UnitDetailsComponent', () => {
  let component: UnitDetailsComponent;
  let fixture: ComponentFixture<UnitDetailsComponent>;
  let orgUnitsService: OrgUnitService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, Table2Module, I18nTestingModule],
      declarations: [UnitDetailsComponent, MockUrlPipe],
      providers: [
        { provide: RoutingConfig, useClass: MockRoutingConfig },
        { provide: RoutingService, useClass: MockRoutingService },
        { provide: OrgUnitService, useClass: MockOrgUnitService },
      ],
    }).compileComponents();

    orgUnitsService = TestBed.inject(OrgUnitService);
    // routingService = TestBed.get(RoutingService as Type<RoutingService>);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('update', () => {
    it('should update orgUnit', () => {
      component.update({ active: false });
      expect(orgUnitsService.update).toHaveBeenCalledWith(code, {
        active: false,
      });

      component.update({ active: true });
      expect(orgUnitsService.update).toHaveBeenCalledWith(code, {
        active: true,
      });
    });
  });
});