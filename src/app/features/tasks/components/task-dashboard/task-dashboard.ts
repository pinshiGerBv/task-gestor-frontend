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
  pending = 0;
  maxPending = 0;
  inp = 0;
  maxInp = 0;
  completed = 0;
  maxCompleted = 0;

  @ViewChildren('progressCircle') progressCircles!: QueryList<ElementRef<SVGCircleElement>>;

  tasks: any[] = [];
  error: string = '';
  private radius = 45;
  private circumference = 2 * Math.PI * this.radius;
  private dataLoaded = false;

  constructor(private cdr: ChangeDetectorRef, private tasksService: TasksService) {}

  transformDisplay() {
    let form = document.getElementsByTagName("form")[0];
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }

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
      console.log('Completed Tasks:', this.maxCompleted);
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
      console.log('InProgress Tasks:', this.maxInp);
    } catch (err) {
      this.error = 'Tasks Not Found or 0';
      console.error('Error al obtener las tareas en progreso:', err);
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadAllTasksByStatusPending();
    await this.loadAllTasksByStatusInProgress();
    await this.loadAllTasksByStatusCompleted();
    this.dataLoaded = true;
  }

  ngAfterViewInit() {
    // Esperar a que los datos estén cargados
    if (this.dataLoaded) {
      this.startAnimations();
    } else {
      // Si los datos no están listos, esperar un poco
      setTimeout(() => this.startAnimations(), 100);
    }
  }

  private startAnimations(): void {
    const totalTasks = this.maxPending + this.maxInp + this.maxCompleted;

    let percentPending = 0;
    let percentInProgress = 0;
    let percentCompleted = 0;
    
    if (totalTasks > 0) {
      percentPending = (this.maxPending / totalTasks) * 100;
      percentInProgress = (this.maxInp / totalTasks) * 100;
      percentCompleted = (this.maxCompleted / totalTasks) * 100;
    }

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
      } else {
        clearInterval(timec);
      }
    }, 100);
    
    this.animateCircle('progress-1', percentPending);
    this.animateCircle('progress-2', percentInProgress);
    this.animateCircle('progress-3', percentCompleted);
  }

  // Método helper para animar los círculos
  private animateCircle(circleId: string, targetPercent: number): void {
    const circleRef = this.progressCircles.find((circle) => circle.nativeElement.id === circleId);
    if (circleRef) {
      const circle = circleRef.nativeElement;
      let currentPercent = 0;
      
      circle.style.strokeDasharray = `${this.circumference}`;
      circle.style.strokeDashoffset = `${this.circumference}`;

      const timer = setInterval(() => {
        if (currentPercent <= targetPercent) {
          const percent = currentPercent / 100;
          const offset = this.circumference - percent * this.circumference;
          circle.style.strokeDashoffset = `${offset}`;
          currentPercent += 0.1;
        } else {
          clearInterval(timer);
        }
      }, 1);
    } else {
      console.warn(`Circle with id '${circleId}' not found`);
    }
  }
}
