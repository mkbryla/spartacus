import { Injectable } from '@angular/core';
import { B2BUnit, B2BUnitNode, EntitiesModel } from '@spartacus/core';
import { OrgUnitService } from '@spartacus/my-account/organization/core';
import { TableService } from '@spartacus/storefront';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationListService } from '../../shared/organization-list/organization-list.service';
import { OrganizationTableType } from '../../shared/organization.model';

interface TreeAction {
  prepareUnit(child, depthLevel): any;
  next(array: B2BUnitNode[], child, depthLevel, pagination): void;
}

class ToggleAction implements TreeAction {
  constructor(private id: string, private unitListService: UnitListService) {}

  prepareUnit(child, depthLevel) {
    return this.unitListService.prepareUnit(child, {
      depthLevel,
      expanded:
        child.id === this.id
          ? !this.unitListService.isExpandedNodeMap[child.id]
          : this.unitListService.isExpandedNodeMap[child.id] ?? true,
      visible: this.unitListService.isExpandedNodeMap[child.parent] ?? true,
    });
  }

  next(array: B2BUnitNode[], child, depthLevel, pagination) {
    this.unitListService.flatten(
      array,
      child.children,
      depthLevel + 1,
      pagination,
      child.id === this.id && !this.unitListService.isExpandedNodeMap[child.id]
        ? new CollapseFromLevelAction(depthLevel, this.unitListService)
        : this
    );
  }
}

class CollapseFromLevelAction implements TreeAction {
  constructor(
    private depthLevel: number,
    private unitListService: UnitListService
  ) {}

  prepareUnit(child, depthLevel) {
    return this.unitListService.prepareUnit(child, {
      depthLevel,
      expanded:
        this.depthLevel > depthLevel
          ? this.unitListService.isExpandedNodeMap[child.id] ?? true
          : false,
      visible: this.depthLevel >= depthLevel,
    });
  }

  next(array: B2BUnitNode[], child, depthLevel, pagination) {
    this.unitListService.flatten(
      array,
      child.children,
      depthLevel + 1,
      pagination,
      this
    );
  }
}

class ExpandAllAction implements TreeAction {
  constructor(private unitListService: UnitListService) {}

  prepareUnit(child, depthLevel) {
    return this.unitListService.prepareUnit(child, {
      depthLevel,
      expanded: true,
      visible: true,
    });
  }

  next(array: B2BUnitNode[], child, depthLevel, pagination) {
    this.unitListService.flatten(
      array,
      child.children,
      depthLevel + 1,
      pagination,
      this
    );
  }
}
/**
 * Service to populate Budget data to `Table` data. Budget
 * data is driven by the table configuration, using the `OrganizationTables.BUDGET`.
 */
@Injectable({
  providedIn: 'root',
})
export class UnitListService extends OrganizationListService<B2BUnit> {
  protected tableType = OrganizationTableType.UNIT;
  protected treeAction$ = new BehaviorSubject<TreeAction>(
    new CollapseFromLevelAction(1, this)
  );
  constructor(
    protected tableService: TableService,
    protected unitService: OrgUnitService
  ) {
    super(tableService);
  }

  isExpandedNodeMap = {};

  protected load(): Observable<EntitiesModel<B2BUnit>> {
    return combineLatest([this.unitService.getTree(), this.treeAction$]).pipe(
      map(([raw, action]) => this.convertUnits(raw, action))
    );
  }

  key(): string {
    return 'uid';
  }

  public flatten(
    array: B2BUnitNode[],
    children: B2BUnitNode[],
    depthLevel,
    pagination,
    action: TreeAction
  ) {
    children.forEach((child) => {
      array.push(action.prepareUnit(child, depthLevel));
      pagination.totalResults++;
      action.next(array, child, depthLevel, pagination);
    });
  }

  public prepareUnit(unit: B2BUnitNode, { depthLevel, expanded, visible }) {
    this.isExpandedNodeMap[unit.id] = expanded;
    return {
      uid: unit.id,
      name: unit.name,
      active: unit.active,
      count: unit.children?.length ?? 0,
      depthLevel,
      expanded,
      visible,
    };
  }

  protected convertUnits(
    root: B2BUnitNode,
    action: TreeAction
  ): EntitiesModel<B2BUnit> {
    const depthLevel = 0,
      pagination = { totalResults: 0 },
      units = [];

    this.flatten(units, [root], depthLevel, pagination, action);
    return {
      values: units.filter((unit) => unit.visible),
      pagination,
    };
  }

  toggle(_event: string) {
    this.treeAction$.next(new ToggleAction(_event, this));
  }

  collapseAll() {
    this.treeAction$.next(new CollapseFromLevelAction(1, this));
  }

  expandAll() {
    this.treeAction$.next(new ExpandAllAction(this));
  }
}