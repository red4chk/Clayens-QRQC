import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Qrqc,
  QrqcFilters,
  QrqcPatch,
  QrqcStats,
} from '../models/qrqc.model';

@Injectable({ providedIn: 'root' })
export class QrqcService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/qrqc';

  list(filters: QrqcFilters = {}): Observable<Qrqc[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params = params.set(key, value);
      }
    }
    return this.http.get<Qrqc[]>(this.base, { params });
  }

  stats(): Observable<QrqcStats> {
    return this.http.get<QrqcStats>(`${this.base}/stats`);
  }

  get(id: string): Observable<Qrqc> {
    return this.http.get<Qrqc>(`${this.base}/${id}`);
  }

  create(): Observable<Qrqc> {
    return this.http.post<Qrqc>(this.base, {});
  }

  update(id: string, patch: QrqcPatch): Observable<Qrqc> {
    return this.http.patch<Qrqc>(`${this.base}/${id}`, patch);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
