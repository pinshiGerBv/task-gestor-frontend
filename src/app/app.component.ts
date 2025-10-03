import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,FormsModule],
  template: `<h1>Hola desde Angular Standalone!</h1>`
})
export class AppComponent {}
