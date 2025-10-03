import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskList } from '../task-list/task-list';
import { TasksService } from '../../../../core/services/task';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [CommonModule, TaskList],
  templateUrl: './task-dashboard.html',
  styleUrls: ['./task-dashboard.css']
})
export class TaskDashboard implements AfterViewInit, OnInit {
  constructor(private cdr: ChangeDetectorRef, private tasksService: TasksService) {}

  transformDisplay() {
    let form = document.getElementsByTagName("form")[0];
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }

  @ViewChildren('progressCircle') progressCircles!: QueryList<ElementRef<SVGCircleElement>>;

  tasks: any[] = []; // Aquí guardaremos las tareas obtenidas
  error: string = '';  // Para manejar errores
  private radius = 45;
  private circumference = 2 * Math.PI * this.radius;

  pending = 0;
  maxPending = 0;
  inp = 0;
  maxInp = 0;
  completed = 0;
  maxCompleted = 0;

  async loadAllTasksByStatusPending(): Promise<void> {
    try {
      const tasksp = await this.tasksService.getPendingTasks();
      this.maxPending = tasksp.length;
      this.tasks = tasksp;
      console.log('Pending Tasks:', tasksp);
      console.log(this.maxPending);  
    } catch (err) {
      this.error = 'Tasks Not Found or 0';
      console.error('Error al obtener las tareas pendientes:', err);
    }
  }

  async loadAllTasksByStatusCompleted(): Promise<void> {
    try {
      const tasksc = await this.tasksService.getCompletedTasks();
      this.tasks = tasksc;
      this.maxCompleted = tasksc.length;
      console.log('Completed Tasks:', tasksc);
      console.log(this.maxCompleted);
    } catch (err) {
      this.error = 'Tasks Not Found or 0';
      console.error('Error al obtener las tareas completadas:', err);
    }
  }

  async loadAllTasksByStatusInProgress(): Promise<void> {
    try {
      const tasksi = await this.tasksService.getInProgressTasks();
      this.tasks = tasksi;
      this.maxInp = tasksi.length;
      console.log('InProgress Tasks:', tasksi);
      console.log(this.maxInp);
    } catch (err) {
      this.error = 'Tasks Not Found or 0';
      console.error('Error al obtener las tareas en progreso:', err);
    }
  }
  loadPercent(){
    
  }
  async ngOnInit(): Promise<void> {
    await this.loadAllTasksByStatusPending();
    await this.loadAllTasksByStatusInProgress();
    await this.loadAllTasksByStatusCompleted();
  }
    
  ngAfterViewInit() {
    // Solo ejecutar esto después de que todas las tareas se hayan cargado
    const timep = setInterval(() => {
      if (this.pending < this.maxPending) {
        this.pending += 1;
        this.cdr.detectChanges();
      } else {
        clearInterval(timep);
      }
    }, 100);

    const timei = setInterval(() => {
      if (this.inp < this.maxInp) {
        this.inp += 1;
        this.cdr.detectChanges();
      } else {
        clearInterval(timei);
      }
    }, 100);

    const timec = setInterval(() => {
      if (this.completed < this.maxCompleted) {
        this.completed += 1;
        this.cdr.detectChanges();
        console.log("CompletewqfcdScrgfd:", this.maxCompleted);
      } else {
        clearInterval(timec);
      }
    }, 100);
    console.log("Max Completed:", this.maxCompleted);
    let percentcompleted = 0;
    if (this.maxPending + this.maxInp + this.maxCompleted > 0) {
      percentcompleted = (this.maxCompleted / (this.maxPending + this.maxInp + this.maxCompleted)) * 100;
    console.log("Percent Completed:", percentcompleted);
    }

    const circleRef = this.progressCircles.find((circle) => circle.nativeElement.id === 'progress-1');
    if (circleRef) {
      const circle = circleRef.nativeElement;
      const totalTasks = this.maxPending + this.maxInp + this.maxCompleted;
      let completed = this.completed;
      circle.style.strokeDasharray = `${this.circumference}`;
      circle.style.strokeDashoffset = `${this.circumference}`;

      const timerc = setInterval(() => {
      if (completed >= -50) {
        const percent = completed / 100;
        const offset = this.circumference - percent * this.circumference;
        circle.style.strokeDashoffset = `${offset}`;
        completed -= 0.1;
      } else {
        clearInterval(timerc);
      }
      }, 1);
    }


    const circleRef2 = this.progressCircles.find((circle) => circle.nativeElement.id === 'progress-2');
    if (circleRef2) {
      const circle = circleRef2.nativeElement;
      const totalTasks = this.maxPending + this.maxInp + this.maxCompleted;
      let completed = this.completed;
      circle.style.strokeDasharray = `${this.circumference}`;
      circle.style.strokeDashoffset = `${this.circumference}`;

      const timerc = setInterval(() => {
      if (completed >= -20) {
        const percent = completed / 100;
        const offset = this.circumference - percent * this.circumference;
        circle.style.strokeDashoffset = `${offset}`;
        completed -= 0.1;
      } else {
        clearInterval(timerc);
      }
      }, 1);
    }


    const circleRef3 = this.progressCircles.find((circle) => circle.nativeElement.id === 'progress-3');
    if (circleRef3) {
      const circle = circleRef3.nativeElement;
      const totalTasks = this.maxPending + this.maxInp + this.maxCompleted;
      let completed = this.completed;
      circle.style.strokeDasharray = `${this.circumference}`;
      circle.style.strokeDashoffset = `${this.circumference}`;

      const timerc = setInterval(() => {
      if (completed >= -percentcompleted) {
        const percent = completed / 100;
        const offset = this.circumference - percent * this.circumference;
        circle.style.strokeDashoffset = `${offset}`;
        completed -= 0.1;
      } else {
        clearInterval(timerc);
      }
      }, 1);
    }
  }
}
