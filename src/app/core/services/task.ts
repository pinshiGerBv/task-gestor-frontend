import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = 'http://localhost:3000/tasks'; 

  constructor(private http: HttpClient) {}

  async getAllTasks(): Promise<Task[]> {
    return await lastValueFrom(this.http.get<Task[]>(this.apiUrl));
  }

  async getTaskById(id: number): Promise<Task> {
    return await lastValueFrom(this.http.get<Task>(`${this.apiUrl}/${id}`));
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    return await lastValueFrom(this.http.post<Task>(this.apiUrl, task));
  }

  async updateTask(id: number, updatedTask: Partial<Task>): Promise<Task> {
    return await lastValueFrom(this.http.put<Task>(`${this.apiUrl}/${id}`, updatedTask));
  }

  async deleteTaskById(id: number): Promise<void> {
    await lastValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  async getPendingTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === TaskStatus.PENDING);
  }

  async getCompletedTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === TaskStatus.COMPLETED);
  }

  async getInProgressTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  }

  isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return true;
    if (typeof value === 'number' && isNaN(value)) return true;
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  // 🔹 Comunicación del ID seleccionado
  private taskIdSubject = new BehaviorSubject<number | null>(null);
  public taskId$: Observable<number | null> = this.taskIdSubject.asObservable();

  setTaskId(id: number): void {
    this.taskIdSubject.next(id);
    console.log('ID guardado en servicio:', id);
  }

  getTaskId(): number | null {
    return this.taskIdSubject.value;
  }

  clearTaskId(): void {
    this.taskIdSubject.next(null);
  }

  private taskUpdatedSource = new BehaviorSubject<boolean>(false);
  taskUpdated$ = this.taskUpdatedSource.asObservable();

  notifyTaskUpdate(): void {
    this.taskUpdatedSource.next(true);
  }
}
