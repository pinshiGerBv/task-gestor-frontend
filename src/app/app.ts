import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class App {
  constructor (){
    console.log(' cargado desde APP');
  }

}


const startApplication = async () => {
  try {
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
  }
};

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', startApplication);
} else {

  startApplication();
}
