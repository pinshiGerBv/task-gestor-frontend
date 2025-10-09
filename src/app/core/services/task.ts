// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = 'http://localhost:3000/tasks'; // URL base de tu API

  constructor(private http: HttpClient) {}

  // ✅ Obtener todas las tareas
  async getAllTasks(): Promise<Task[]> {
    return await lastValueFrom(this.http.get<Task[]>(this.apiUrl));
  }

  // ✅ Obtener una tarea por ID
  async getTaskById(id: number): Promise<Task> {
    return await lastValueFrom(this.http.get<Task>(`${this.apiUrl}/${id}`));
  }

  // ✅ Crear una nueva tarea
  async createTask(task: Partial<Task>): Promise<Task> {
    return await lastValueFrom(this.http.post<Task>(this.apiUrl, task));
  }

  // ✅ Actualizar una tarea existente
  async updateTask(id: number, updatedTask: Partial<Task>): Promise<Task> {
    return await lastValueFrom(this.http.put<Task>(`${this.apiUrl}/${id}`, updatedTask));
  }

  // ✅ Eliminar una tarea
  async deleteTaskById(id: number): Promise<void> {
    await lastValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  // ✅ Obtener tareas pendientes
  async getPendingTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === TaskStatus.PENDING);
  }

  // ✅ Obtener tareas completadas
  async getCompletedTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === TaskStatus.COMPLETED);
  }

  // ✅ Obtener tareas en progreso
  async getInProgressTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  }

  // ✅ Utilidad para validar valores vacíos
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

  // 🔹 Comunicación de actualización de tareas (Dashboard <-> TaskList)
  private taskUpdatedSource = new BehaviorSubject<boolean>(false);
  taskUpdated$ = this.taskUpdatedSource.asObservable();

  notifyTaskUpdate(): void {
    this.taskUpdatedSource.next(true);
  }
}
