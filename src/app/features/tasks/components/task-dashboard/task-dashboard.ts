import {Component,ElementRef,ViewChildren,QueryList,AfterViewInit,ChangeDetectorRef,OnInit,signal,computed,effect} from '@angular/core';
import { CommonModule } from '@angular/common';
import { APIService } from '../../../../core/services/api.service';
import { StateService } from '../../../../core/services/State.service';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../core/models/task.model';
import { TaskList } from '../task-list/task-list';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [CommonModule, TaskList, FormsModule],
  templateUrl: './task-dashboard.html',
  styleUrls: ['./task-dashboard.css']
})
export class TaskDashboard implements AfterViewInit, OnInit {
  pending = signal(0);
  inp = signal(0);
  completed = signal(0);

  maxPending = computed(() => this.sharedData.countPending());
  maxInProgress = computed(() => this.sharedData.countInProgress());
  maxCompleted = computed(() => this.sharedData.countCompleted());
  private dataLoaded = false;
  private animationSub!: Subscription;

  @ViewChildren('progressCircle') progressCircles!: QueryList<ElementRef<SVGCircleElement>>;

  searchTerm: string = '';
  activeStatusFilter: string = 'all';
  activePriorityFilter: string = 'all';

  constructor(
    private cdr: ChangeDetectorRef,
    private tasksService: APIService,
    private sharedData: StateService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.sharedData.loadAllTasks();
    this.updateCounters();
    this.dataLoaded = true;
    this.cdr.detectChanges();
  
    effect(() => {
      this.updateCounters();
    });
  }

  ngOnDestroy(): void {
    this.animationSub?.unsubscribe();
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

  updateCounters() {
    this.pending.set(this.sharedData.countPending());
    this.inp.set(this.sharedData.countInProgress());
    this.completed.set(this.sharedData.countCompleted());

    setTimeout(() => {
      this.startAnimations();
    }, 100);
  }

  applyFilters() {
    this.sharedData.setFilters({
      search: this.searchTerm.trim(),
      status: this.activeStatusFilter as 'all' | Task['status'],
      priority: this.activePriorityFilter as 'all' | Task['priority']
    });

    this.cdr.detectChanges();
  }

  resetFilters() {
    this.activeStatusFilter = 'all';
    this.activePriorityFilter = 'all';
    this.searchTerm = '';
    this.sharedData.clearFilters();
    this.cdr.detectChanges();
  }

  filterByPriority(priority: string) {
    this.activePriorityFilter = priority;
    this.applyFilters();
  }

  filterByStatus(status: string) {
    this.activeStatusFilter = status;
    this.applyFilters();
  }

  searchTasks() {
    this.applyFilters();
  }

  public startAnimations(): void {
    const totalTasks = this.pending() + this.inp() + this.completed();
    
    let percentPending = (this.pending() / totalTasks) * 100;
    let percentInProgress = (this.inp() / totalTasks) * 100;
    let percentCompleted = (this.completed() / totalTasks) * 100;

    if (this.completed() === 0 && this.inp() === 0 && this.pending() === 0) {
      percentCompleted = 0;
      percentInProgress = 0;
      percentPending = 0;
    }
    if (this.completed() === 0) {
      percentCompleted = 0;
      percentPending = (this.pending() / totalTasks) * 100;
      percentInProgress = (this.inp() / totalTasks) * 100;
    }
    if (this.inp() === 0) {
      percentInProgress = 0;
      percentPending = (this.pending() / totalTasks) * 100;
      percentCompleted = (this.completed() / totalTasks) * 100;
    }
    if (this.pending() === 0) {
      percentPending = 0;
      percentInProgress = (this.inp() / totalTasks) * 100;
      percentCompleted = (this.completed() / totalTasks) * 100;
    }
    this.animateCounter('pending', this.pending());
    this.animateCounter('inp', this.inp());
    this.animateCounter('completed', this.completed());

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

      if (current >= maxValue) {
        this[type].set(maxValue);
        clearInterval(interval);
      } else {
        this[type].set(Math.floor(current));
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

  transformDisplay(formIndex = 0) {
    const form = document.getElementsByTagName('form')[formIndex];
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    this.cdr.detectChanges();
  }
}
