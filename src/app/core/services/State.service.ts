import { Injectable, computed, signal } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { APIService } from './api.service';

type Filters = {
  search: string;
  status: 'all' | TaskStatus;
  priority: 'all' | TaskPriority;
};

@Injectable({ providedIn: 'root' })
export class StateService {
  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private filtersSignal = signal<Filters>({ search: '', status: 'all', priority: 'all' });

  tasks = this.tasksSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  filters = this.filtersSignal.asReadonly();

  filteredTasks = computed(() => {
    const { search, status, priority } = this.filtersSignal();
    return this.tasksSignal().filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase().trim());
      const matchesStatus = status === 'all' ? true : t.status === status;
      const matchesPriority = priority === 'all' ? true : t.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  });

  countPending = computed(() => this.tasksSignal().filter(t => t.status === TaskStatus.PENDING).length);
  countInProgress = computed(() => this.tasksSignal().filter(t => t.status === TaskStatus.IN_PROGRESS).length);
  countCompleted = computed(() => this.tasksSignal().filter(t => t.status === TaskStatus.COMPLETED).length);

  constructor(private api: APIService) {}

  setFilters(patch: Partial<Filters>) {
    this.filtersSignal.update(f => ({ ...f, ...patch }));
  }

  async loadAllTasks() {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);
      const tasks = await this.api.getAllTasks();
      this.tasksSignal.set(tasks);
    } catch (err: any) {
      this.errorSignal.set(err?.message ?? 'Error loading tasks');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createTask(task: Partial<Task>) {
    try {
      this.loadingSignal.set(true);
      const newTask = await this.api.createTask(task);
      this.tasksSignal.update(list => [newTask, ...list]);
    } catch (err: any) {
      this.errorSignal.set(err?.message ?? 'Error creating task');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateTask(id: number, patch: Partial<Task>) {
    try {
      this.loadingSignal.set(true);
      const updated = await this.api.updateTask(id, patch);
      this.tasksSignal.update(list => list.map(t => t.id === id ? updated : t));
    } catch (err: any) {
      this.errorSignal.set(err?.message ?? 'Error updating task');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteTask(id: number) {
    try {
      this.loadingSignal.set(true);
      await this.api.deleteTaskById(id);
      this.tasksSignal.update(list => list.filter(t => t.id !== id));
    } catch (err: any) {
      this.errorSignal.set(err?.message ?? 'Error deleting task');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async toggleStatus(id: number) {
    const task = this.tasksSignal().find(t => t.id === id);
    if (!task) return;
    const nextStatus: TaskStatus =
      task.status === TaskStatus.PENDING
        ? TaskStatus.IN_PROGRESS
        : task.status === TaskStatus.IN_PROGRESS
          ? TaskStatus.COMPLETED
          : TaskStatus.PENDING;

    await this.updateTask(id, { status: nextStatus });
  }
}