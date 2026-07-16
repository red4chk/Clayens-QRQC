import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

import {
  EQUIPES,
  ISHIKAWA_CATEGORIES,
  METHODES_DETECTION,
  PRESSES,
} from '../../core/data/reference-data';
import {
  IshikawaCategorie,
  OuiNon,
  Qrqc,
} from '../../core/models/qrqc.model';
import { QrqcService } from '../../core/services/qrqc.service';

let uidCounter = 0;
function uid(): string {
  uidCounter += 1;
  return `${Date.now()}-${uidCounter}`;
}

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatStepperModule,
    FormsModule,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.scss',
})
export class WizardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly qrqcService = inject(QrqcService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild('stepper') stepper?: MatStepper;

  readonly presses = PRESSES;
  readonly equipes = EQUIPES;
  readonly methodesDetection = METHODES_DETECTION;
  readonly ishikawaCategories = ISHIKAWA_CATEGORIES;

  qrqc: Qrqc | null = null;
  chargement = true;
  enregistrement = false;
  selectedIndex = 0;

  readonly step1Form = this.fb.nonNullable.group({
    referenceProduit: ['', Validators.required],
    descriptionDefaut: ['', Validators.required],
    pourquoiProbleme: ['', Validators.required],
    presse: ['', Validators.required],
    equipe: ['', Validators.required],
    detectePar: ['', Validators.required],
    methodeDetection: ['', Validators.required],
    quantiteConcernee: ['', Validators.required],
    dateDetection: ['', Validators.required],
  });

  readonly step2Form = this.fb.nonNullable.group({
    texte: ['', Validators.required],
  });

  readonly ishikawaForms: Record<IshikawaCategorie, FormArray> = {
    mainDoeuvre: this.fb.array([]),
    machine: this.fb.array([]),
    matiere: this.fb.array([]),
    methode: this.fb.array([]),
    milieu: this.fb.array([]),
    mesure: this.fb.array([]),
  };
  readonly nouvelleCause: Record<IshikawaCategorie, string> = {
    mainDoeuvre: '',
    machine: '',
    matiere: '',
    methode: '',
    milieu: '',
    mesure: '',
  };

  readonly step4Actions = this.fb.array<FormGroup>([]);

  readonly step5Pourquoi = this.fb.array<FormGroup>([]);

  readonly step6Plan = this.fb.array<FormGroup>([]);

  readonly step7Form = this.fb.group({
    metrique: ['', Validators.required],
    objectif: ['', Validators.required],
  });
  readonly step7Controles = this.fb.array<FormGroup>([]);

  readonly step8Form = this.fb.group({
    commentairesFinaux: ['', Validators.required],
    indicateursCommePrevu: [null as OuiNon | null, Validators.required],
    actionsSensAttendu: [null as OuiNon | null, Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }
    this.qrqcService.get(id).subscribe({
      next: (qrqc) => {
        this.qrqc = qrqc;
        this.chargement = false;
        this.hydrateForms(qrqc);
        this.selectedIndex = Math.min(qrqc.etapeCourante - 1, 7);
      },
      error: () => {
        this.chargement = false;
        this.snackBar.open('Dossier QRQC introuvable.', 'Fermer', {
          duration: 4000,
        });
        this.router.navigate(['/']);
      },
    });
  }

  // ---------------------------------------------------------------------
  // Hydration
  // ---------------------------------------------------------------------
  private hydrateForms(qrqc: Qrqc): void {
    if (qrqc.identification) {
      this.step1Form.patchValue(qrqc.identification);
    }
    this.step2Form.patchValue(qrqc.commentaires);

    for (const cat of this.ishikawaCategories) {
      const arr = this.ishikawaForms[cat.key];
      arr.clear();
      for (const item of qrqc.ishikawa[cat.key]) {
        arr.push(
          this.fb.group({
            id: [item.id],
            texte: [item.texte, Validators.required],
          }),
        );
      }
    }

    this.step4Actions.clear();
    for (const a of qrqc.actionsVerification) {
      this.step4Actions.push(
        this.fb.group({
          id: [a.id],
          action: [a.action, Validators.required],
          date: [a.date, Validators.required],
          resultat: [a.resultat, Validators.required],
        }),
      );
    }

    this.step5Pourquoi.clear();
    for (const p of qrqc.cinqPourquoi) {
      this.step5Pourquoi.push(
        this.fb.group({
          id: [p.id],
          causeInitiale: [p.causeInitiale, Validators.required],
          pourquoi1: [p.pourquoi1],
          pourquoi2: [p.pourquoi2],
          pourquoi3: [p.pourquoi3],
          pourquoi4: [p.pourquoi4],
          pourquoi5: [p.pourquoi5],
          causeRacine: [p.causeRacine],
        }),
      );
    }

    this.step6Plan.clear();
    for (const a of qrqc.planAction) {
      this.step6Plan.push(
        this.fb.group({
          id: [a.id],
          action: [a.action, Validators.required],
          beneficeAttendu: [a.beneficeAttendu, Validators.required],
          responsable: [a.responsable, Validators.required],
          dateLimite: [a.dateLimite, Validators.required],
          realisee: [a.realisee],
        }),
      );
    }

    this.step7Form.patchValue({
      metrique: qrqc.mesureEfficacite.metrique,
      objectif: qrqc.mesureEfficacite.objectif,
    });
    this.step7Controles.clear();
    for (const c of qrqc.mesureEfficacite.controles) {
      this.step7Controles.push(
        this.fb.group({
          id: [c.id],
          equipe: [c.equipe, Validators.required],
          conforme: [c.conforme, Validators.required],
          nom: [c.nom, Validators.required],
          date: [c.date, Validators.required],
          heure: [c.heure, Validators.required],
        }),
      );
    }

    this.step8Form.patchValue({
      commentairesFinaux: qrqc.cloture.commentairesFinaux,
      indicateursCommePrevu: qrqc.cloture.indicateursCommePrevu,
      actionsSensAttendu: qrqc.cloture.actionsSensAttendu,
    });
  }

  // ---------------------------------------------------------------------
  // Ishikawa helpers
  // ---------------------------------------------------------------------
  ajouterCause(cat: IshikawaCategorie): void {
    const texte = this.nouvelleCause[cat].trim();
    if (!texte) {
      return;
    }
    this.ishikawaForms[cat].push(
      this.fb.group({ id: [uid()], texte: [texte, Validators.required] }),
    );
    this.nouvelleCause[cat] = '';
  }

  retirerCause(cat: IshikawaCategorie, index: number): void {
    this.ishikawaForms[cat].removeAt(index);
  }

  // ---------------------------------------------------------------------
  // Step 4 — actions de vérification
  // ---------------------------------------------------------------------
  ajouterActionVerification(): void {
    this.step4Actions.push(
      this.fb.group({
        id: [uid()],
        action: ['', Validators.required],
        date: ['', Validators.required],
        resultat: ['', Validators.required],
      }),
    );
  }

  retirerActionVerification(index: number): void {
    this.step4Actions.removeAt(index);
  }

  // ---------------------------------------------------------------------
  // Step 5 — 5 pourquoi
  // ---------------------------------------------------------------------
  ajouterPourquoi(): void {
    this.step5Pourquoi.push(
      this.fb.group({
        id: [uid()],
        causeInitiale: ['', Validators.required],
        pourquoi1: [''],
        pourquoi2: [''],
        pourquoi3: [''],
        pourquoi4: [''],
        pourquoi5: [''],
        causeRacine: [''],
      }),
    );
  }

  retirerPourquoi(index: number): void {
    this.step5Pourquoi.removeAt(index);
  }

  // ---------------------------------------------------------------------
  // Step 6 — plan d'action
  // ---------------------------------------------------------------------
  ajouterActionPlan(): void {
    this.step6Plan.push(
      this.fb.group({
        id: [uid()],
        action: ['', Validators.required],
        beneficeAttendu: ['', Validators.required],
        responsable: ['', Validators.required],
        dateLimite: ['', Validators.required],
        realisee: ['non'],
      }),
    );
  }

  retirerActionPlan(index: number): void {
    this.step6Plan.removeAt(index);
  }

  // ---------------------------------------------------------------------
  // Step 7 — contrôles
  // ---------------------------------------------------------------------
  ajouterControle(): void {
    this.step7Controles.push(
      this.fb.group({
        id: [uid()],
        equipe: ['', Validators.required],
        conforme: ['conforme', Validators.required],
        nom: ['', Validators.required],
        date: ['', Validators.required],
        heure: ['', Validators.required],
      }),
    );
  }

  retirerControle(index: number): void {
    this.step7Controles.removeAt(index);
  }

  // ---------------------------------------------------------------------
  // Persistence helpers
  // ---------------------------------------------------------------------
  private buildPatchForCurrentData(): import('../../core/models/qrqc.model').QrqcPatch {
    return this.buildPatchRaw() as unknown as import('../../core/models/qrqc.model').QrqcPatch;
  }

  private buildPatchRaw() {
    return {
      identification: this.step1Form.valid ? this.step1Form.getRawValue() : null,
      commentaires: this.step2Form.getRawValue(),
      ishikawa: {
        mainDoeuvre: this.ishikawaForms['mainDoeuvre'].getRawValue(),
        machine: this.ishikawaForms['machine'].getRawValue(),
        matiere: this.ishikawaForms['matiere'].getRawValue(),
        methode: this.ishikawaForms['methode'].getRawValue(),
        milieu: this.ishikawaForms['milieu'].getRawValue(),
        mesure: this.ishikawaForms['mesure'].getRawValue(),
      },
      actionsVerification: this.step4Actions.getRawValue(),
      cinqPourquoi: this.step5Pourquoi.getRawValue(),
      planAction: this.step6Plan.getRawValue(),
      mesureEfficacite: {
        metrique: this.step7Form.getRawValue().metrique ?? '',
        objectif: this.step7Form.getRawValue().objectif ?? '',
        controles: this.step7Controles.getRawValue(),
      },
      cloture: {
        commentairesFinaux: this.step8Form.getRawValue().commentairesFinaux ?? '',
        indicateursCommePrevu: this.step8Form.getRawValue().indicateursCommePrevu,
        actionsSensAttendu: this.step8Form.getRawValue().actionsSensAttendu,
        dateCloture: this.qrqc?.cloture.dateCloture ?? null,
      },
    };
  }

  enregistrer(afficherToast = true): void {
    if (!this.qrqc) {
      return;
    }
    this.enregistrement = true;
    this.qrqcService.update(this.qrqc.id, this.buildPatchForCurrentData()).subscribe({
      next: (updated) => {
        this.qrqc = updated;
        this.enregistrement = false;
        if (afficherToast) {
          this.snackBar.open('Dossier enregistré.', undefined, {
            duration: 2000,
            panelClass: 'qrqc-toast-success',
          });
        }
      },
      error: () => {
        this.enregistrement = false;
        this.snackBar.open("Erreur lors de l'enregistrement.", 'Fermer', {
          duration: 4000,
        });
      },
    });
  }

  suivant(stepNumber: number): void {
    if (!this.qrqc) {
      return;
    }
    this.enregistrement = true;
    const patch: Record<string, unknown> = {
      ...this.buildPatchForCurrentData(),
      etapeCourante: Math.max(this.qrqc.etapeCourante, stepNumber + 1),
    };
    this.qrqcService.update(this.qrqc.id, patch).subscribe({
      next: (updated) => {
        this.qrqc = updated;
        this.enregistrement = false;
        this.stepper?.next();
      },
      error: () => {
        this.enregistrement = false;
        this.snackBar.open('Erreur lors de la validation.', 'Fermer', {
          duration: 4000,
        });
      },
    });
  }

  cloturer(): void {
    if (!this.qrqc || this.step8Form.invalid) {
      this.step8Form.markAllAsTouched();
      return;
    }
    this.enregistrement = true;
    const values = this.step8Form.getRawValue();
    const patch = {
      ...this.buildPatchForCurrentData(),
      statut: 'Cloture' as const,
      cloture: {
        commentairesFinaux: values.commentairesFinaux ?? '',
        indicateursCommePrevu: values.indicateursCommePrevu,
        actionsSensAttendu: values.actionsSensAttendu,
        dateCloture: new Date().toISOString(),
      },
    };
    this.qrqcService.update(this.qrqc.id, patch).subscribe({
      next: (updated) => {
        this.qrqc = updated;
        this.enregistrement = false;
        this.snackBar.open('Dossier QRQC clôturé.', undefined, {
          duration: 3000,
          panelClass: 'qrqc-toast-success',
        });
        this.router.navigate(['/']);
      },
      error: () => {
        this.enregistrement = false;
        this.snackBar.open('Erreur lors de la clôture.', 'Fermer', {
          duration: 4000,
        });
      },
    });
  }

  isStepComplete(stepNumber: number): boolean {
    if (!this.qrqc) {
      return false;
    }
    return this.qrqc.etapeCourante > stepNumber || this.qrqc.statut === 'Cloture';
  }

  retour(): void {
    this.router.navigate(['/']);
  }

  asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
}
