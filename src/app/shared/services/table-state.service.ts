import { Injectable } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface TableBindingState {
  paginator?: MatPaginator;
  sort?: MatSort;
}

@Injectable({
  providedIn: 'root'
})
export class TableStateService {
  private readonly bindings = new WeakMap<MatTableDataSource<unknown>, TableBindingState>();

  bindPaginator<T>(dataSource: MatTableDataSource<T>, paginator?: MatPaginator): void {
    const state = this.ensureState(dataSource as MatTableDataSource<unknown>);
    state.paginator = paginator;
    dataSource.paginator = paginator ?? null;
  }

  bindSort<T>(dataSource: MatTableDataSource<T>, sort?: MatSort): void {
    const state = this.ensureState(dataSource as MatTableDataSource<unknown>);
    state.sort = sort;
    dataSource.sort = sort ?? null;
  }

  bindControls<T>(dataSource: MatTableDataSource<T>, paginator?: MatPaginator, sort?: MatSort): void {
    this.bindPaginator(dataSource, paginator);
    this.bindSort(dataSource, sort);
  }

  applyFilter<T>(dataSource: MatTableDataSource<T>, rawValue: string): void {
    dataSource.filter = rawValue.trim().toLowerCase();
    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  private ensureState(dataSource: MatTableDataSource<unknown>): TableBindingState {
    const existing = this.bindings.get(dataSource);
    if (existing) {
      return existing;
    }

    const created: TableBindingState = {};
    this.bindings.set(dataSource, created);
    return created;
  }
}
