/* eslint-disable no-mixed-spaces-and-tabs */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import {  SortDirection } from 'src/app/directives/sort-table.directive';


interface State {
	page: number;
	pageSize: number;
	searchTerm: string;
	sortColumn: string;
	sortDirection: SortDirection;
}

function compare(v1: any, v2: any) {
	return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

@Injectable({ providedIn: 'root' })
export class FilterableTable {
	private _loading$ = new BehaviorSubject<boolean>(true);
	private _search$ = new Subject<void>();
	public _displayedResults$ = new BehaviorSubject<any[]>([]);
	private _total$ = new BehaviorSubject<number>(0);

	 public allValues: any[] = [];

	private _state: State = {
		page: 1,
		pageSize: 50,
		searchTerm: '',
		sortColumn: '',
		sortDirection: '',
	};


	constructor() {
		this._search$
			.pipe(
				tap(() => this._loading$.next(true)),
				debounceTime(200),
				switchMap(() => this._search()),
				delay(200),
				tap(() => this._loading$.next(false))
			)
			.subscribe((result) => {
				console.log("result", result)
				this._displayedResults$.next(result.countries);
				this._total$.next(result.total);
			});

		this._search$.next();
	}

	get displayedResults$() {
		return this._displayedResults$.asObservable();
	}
	get total$() {
		return this._total$.asObservable();
	}
	get loading$() {
		return this._loading$.asObservable();
	}
	get page() {
		return this._state.page;
	}
	get pageSize() {
		return this._state.pageSize;
	}
	get searchTerm() {
		return this._state.searchTerm;
	}

	set page(page: number) {
		this._set({ page });
	}
	set pageSize(pageSize: number) {
		this._set({ pageSize });
	}
	set searchTerm(searchTerm: string) {
		this._set({ searchTerm });
	}
	set sortColumn(sortColumn: string) {
		this._set({ sortColumn });
	}
	set sortDirection(sortDirection: SortDirection) {
		this._set({ sortDirection });
	}

	private _set(patch: Partial<State>) {
		Object.assign(this._state, patch);
		this._search$.next();
	}

	sort(apiResp: any[], column: string, direction: string): any[] {
		console.log(`sourting on column ${column}`);
		if (direction === '') {
			return apiResp;
		} else {
			return [...apiResp].sort((a: any, b: any) => {
				const res = compare(
					this.getProperty(a, column),
					this.getProperty(b, column)
				);
				return direction === 'asc' ? res : -res;
			});
		}
	}

	/**
	 * Ability to get nested properties, i.e. `name.common`
	 */
	getProperty(object: any, propertyName: string) {
		const parts = propertyName.split('.')
		const length = parts.length
		let i,
			property = object || this;

		for (i = 0; i < length; i++) {
			property = property[parts[i]];
		}

		return property;
	}

	matches(pedido: any, input: string): boolean {
		return (
			pedido?.clienteNombre.toLowerCase().includes(input.toLowerCase()) 
		);
	}

	private _search(): Observable<any> {
		const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

		// 1. sort
		let countries = this.sort(this.allValues, sortColumn, sortDirection);
		console.log(this.allValues, sortColumn, sortDirection)
		// 2. filter
		countries = countries.filter((country) => this.matches(country, searchTerm));
		

		const total = countries.length;

		// 3. paginate
		countries = countries.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

		console.log(countries,searchTerm)
		return of({ countries, total });
	}
	
}
