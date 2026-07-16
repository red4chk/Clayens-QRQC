import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, startWith, switchMap } from 'rxjs';

import { EQUIPES, PRESSES } from '../../core/data/reference-data';
import { Qrqc, QrqcStats } from '../../core/models/qrqc.model';
import { QrqcService } from '../../core/services/qrqc.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly qrqcService = inject(QrqcService);
  private readonly router = inject(Router);

  readonly presses = PRESSES;
  readonly equipes = EQUIPES;

  readonly search = new FormControl<string>('', { nonNullable: true });
  readonly presseFiltre = new FormControl<string>('', { nonNullable: true });
  readonly equipeFiltre = new FormControl<string>('', { nonNullable: true });
  readonly statutFiltre = new FormControl<string>('', { nonNullable: true });

  stats: QrqcStats | null = null;
  dossiers: Qrqc[] = [];
  chargement = true;
  creation = false;

  readonly columns = [
    'id',
    'dateCreation',
    'reference',
    'presse',
    'equipe',
    'etape',
    'statut',
    'actions',
  ];

  ngOnInit(): void {
    this.qrqcService.stats().subscribe((stats) => (this.stats = stats));

    this.search.valueChanges
      .pipe(debounceTime(250), startWith(''))
      .subscribe(() => this.refresh());

    this.presseFiltre.valueChanges.subscribe(() => this.refresh());
    this.equipeFiltre.valueChanges.subscribe(() => this.refresh());
    this.statutFiltre.valueChanges.subscribe(() => this.refresh());

    this.refresh();
  }

  refresh(): void {
    this.chargement = true;
    this.qrqcService
      .list({
        search: this.search.value,
        presse: this.presseFiltre.value,
        equipe: this.equipeFiltre.value,
        statut: this.statutFiltre.value,
      })
      .subscribe({
        next: (dossiers) => {
          this.dossiers = dossiers;
          this.chargement = false;
        },
        error: () => {
          this.chargement = false;
        },
      });
  }

  reinitialiserFiltres(): void {
    this.search.setValue('');
    this.presseFiltre.setValue('');
    this.equipeFiltre.setValue('');
    this.statutFiltre.setValue('');
  }

  creerNouveauQrqc(): void {
    this.creation = true;
    this.qrqcService
      .create()
      .pipe(switchMap((qrqc) => this.router.navigate(['/qrqc', qrqc.id])))
      .subscribe({
        next: () => (this.creation = false),
        error: () => (this.creation = false),
      });
  }

  ouvrir(dossier: Qrqc): void {
    this.router.navigate(['/qrqc', dossier.id]);
  }

  supprimer(event: Event, dossier: Qrqc): void {
    event.stopPropagation();
    event.preventDefault();
    if (!confirm(`Supprimer définitivement le dossier ${dossier.id} ?`)) {
      return;
    }
    this.qrqcService.delete(dossier.id).subscribe({
      next: () => {
        this.refresh();
        this.qrqcService.stats().subscribe((stats) => (this.stats = stats));
      },
      error: (err) => {
        console.error('Erreur suppression QRQC:', err);
      },
    });
  }
}
