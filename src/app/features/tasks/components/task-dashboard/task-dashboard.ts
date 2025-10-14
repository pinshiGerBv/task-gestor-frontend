import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskList } from '../task-list/task-list';
import { SharedDataService, TasksService } from '../../../../core/services/task';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [CommonModule, TaskList, FormsModule],
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
  private dataLoaded = false;

  @ViewChildren('progressCircle') progressCircles!: QueryList<ElementRef<SVGCircleElement>>;
  tasks: Task[] = [];
  allTasks: Task[] = [];
  error: string = '';

  searchTerm: string = '';
  activeStatusFilter: string = 'all';
  activePriorityFilter: string = 'all';

  constructor(
    private cdr: ChangeDetectorRef,
    private tasksService: TasksService,
    private sharedData: SharedDataService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadAllTasks();
    await this.updateStats();
    this.dataLoaded = true;
    this.cdr.detectChanges();
    
    // Notificar que los datos fueron cargados
    this.sharedData.notifyTaskUpdate();
  }
  
  ngAfterViewInit() {
    this.progressCircles.changes.subscribe(() => {
      if (this.dataLoaded) this.startAnimations();
    });

    setTimeout(() => {
      if (this.dataLoaded && this.progressCircles.length > 0) {
        this.startAnimations();
      }
    }, 400);
  }

  async loadAllTasks(): Promise<void> {
    try {
      this.allTasks = await this.tasksService.getAllTasks();
      this.tasks = [...this.allTasks];
      this.cdr.detectChanges();

      // Notificar que se cargaron las tareas
      this.sharedData.notifyTaskUpdate();

    } catch (err) {
      this.error = 'Tasks Not Found or 0';
      console.error('Error al cargar tareas:', err);
    }
  }

  async updateStats(): Promise<void> {
    try {
      const tasksp = await this.tasksService.getPendingTasks();
      const tasksi = await this.tasksService.getInProgressTasks();
      const tasksc = await this.tasksService.getCompletedTasks();

      this.maxPending = tasksp.length;
      this.maxInp = tasksi.length;
      this.maxCompleted = tasksc.length;

      this.cdr.detectChanges();

      setTimeout(() => {
        if (this.progressCircles && this.progressCircles.length > 0) {
          this.startAnimations();
        }
      }, 400);

      // Notificar que se actualizaron las estadísticas
      this.sharedData.notifyTaskUpdate();

    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
    }
  }

  searchTasks() {
    this.applyFilters();
  }

  filterByPriority(priority: string) {
    this.activePriorityFilter = priority;
    this.applyFilters();
    console.log("Filtro de prioridad aplicado:", priority);
  }

  async filterByStatus(status: string): Promise<void> {
    this.activeStatusFilter = status;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allTasks];

    if (this.activeStatusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === this.activeStatusFilter);
    }

    if (this.activePriorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === this.activePriorityFilter);
    }

    if (this.searchTerm.trim() !== '') {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.tasks = filtered;
    this.cdr.detectChanges();
  }

  resetFilters() {
    this.activeStatusFilter = 'all';
    this.activePriorityFilter = 'all';
    this.searchTerm = '';
    this.tasks = [...this.allTasks];
    this.cdr.detectChanges();
  }

  public startAnimations(): void {
    const totalTasks = this.maxPending + this.maxInp + this.maxCompleted;
    if (totalTasks === 0) return;

    const percentPending = (this.maxPending / totalTasks) * 100;
    const percentInProgress = (this.maxInp / totalTasks) * 100;
    const percentCompleted = (this.maxCompleted / totalTasks) * 100;

    this.animateCounter('pending', this.maxPending);
    this.animateCounter('inp', this.maxInp);
    this.animateCounter('completed', this.maxCompleted);

    setTimeout(() => {
      this.animateCircleById('progress-1', percentPending);
      this.animateCircleById('progress-2', percentInProgress);
      this.animateCircleById('progress-3', percentCompleted);
    }, 200);
  }

  private animateCounter(type: 'pending' | 'inp' | 'completed', maxValue: number): void {
    let current = 0;
    const duration = 800;
    const steps = 30;
    const stepValue = maxValue / steps;
    const stepTime = duration / steps;

    const interval = setInterval(() => {
      current += stepValue;
      this[type] = Math.floor(current);

      if (current >= maxValue) {
        this[type] = maxValue;
        clearInterval(interval);
      }

      this.cdr.detectChanges();
    }, stepTime);
  }

  private animateCircleById(circleId: string, targetPercent: number) {
    const circleRef = this.progressCircles.find(c => c.nativeElement.id === circleId);
    if (!circleRef) return;

    const circle = circleRef.nativeElement;
    const radius = parseFloat(circle.getAttribute('r') || '45');
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    let currentPercent = 0;

    const step = () => {
      if (currentPercent < targetPercent) {
        currentPercent += 1;
        const offset = circumference - (currentPercent / 100) * circumference;
        circle.style.strokeDashoffset = `${offset}`;
        requestAnimationFrame(step);
      } else {
        circle.style.strokeDashoffset = `${circumference - (targetPercent / 100) * circumference}`;
      }
    };

    requestAnimationFrame(step);
  }

  transformDisplay() {
    const form = document.getElementsByTagName("form")[0];
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
}
