// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Task, TaskStatus } from '../models/task.model';
import { BehaviorSubject, Observable } from 'rxjs';

// TasksService Definition
@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = 'http://localhost:3000/tasks'; 

  constructor(public http: HttpClient) {}

  // Obtener todas las tareas
  async getAllTasks(): Promise<Task[]> {
    return await lastValueFrom(this.http.get<Task[]>(this.apiUrl));
  }

  // Obtener tarea por ID
  async getTaskById(id: number): Promise<Task> {
    return await lastValueFrom(this.http.get<Task>(`${this.apiUrl}/${id}`));
  }

  // Crear nueva tarea
  async createTask(task: Partial<Task>): Promise<Task> {
    return await lastValueFrom(this.http.post<Task>(this.apiUrl, task));
  }

  // Actualizar tarea
  async updateTask(id: number, updatedTask: Partial<Task>): Promise<Task> {
    return await lastValueFrom(this.http.put<Task>(`${this.apiUrl}/${id}`, updatedTask));
  }

  // Eliminar tarea
  async deleteTaskById(id: number): Promise<void> {
    await lastValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  // Obtener tareas pendientes
  async getPendingTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === TaskStatus.PENDING);
  }

  // Obtener tareas completadas
  async getCompletedTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === TaskStatus.COMPLETED);
  }

  // Obtener tareas en progreso
  async getInProgressTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  }

  // Validar si un valor está vacío
  isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && !Array.isArray(value)) {
      if (Object.keys(value).length === 0) return true;
    }
    if (typeof value === 'number' && isNaN(value)) return true;
    return false;
  }
}

// SharedDataService Definition
@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  
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
}
