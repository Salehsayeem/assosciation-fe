import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

@NgModule({
    exports: [
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatCheckboxModule,
        MatSidenavModule,
        MatMenuModule,
        MatListModule,
        MatDividerModule,
        MatTooltipModule,
        MatBadgeModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatRippleModule,
        MatDialogModule,
        MatChipsModule,
        MatSelectModule,
        MatBottomSheetModule
    ]
})
export class MaterialModule { }
