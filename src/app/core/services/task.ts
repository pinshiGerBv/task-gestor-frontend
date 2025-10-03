// src/app/core/services/task.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';  // Para convertir Observable -> Promise
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = 'http://localhost:3000/tasks'; 

  constructor(public http: HttpClient) {}

  async getAllTasks(): Promise<Task[]> {
    return await lastValueFrom(this.http.get<Task[]>(this.apiUrl));
  }

  async getTaskById(id: number): Promise<Task> {
    const task = await lastValueFrom(this.http.get<Task>(`${this.apiUrl}/${id}`));
    return task;
  }

  async getPendingTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === 'pending');
  }

  async getCompletedTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === 'completed');
  }

  async getInProgressTasks(): Promise<Task[]> {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === 'in-progress');
  }

  async deleteTaskById(id: number): Promise<void> {
    await lastValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
  }
  
  async updateTask(id: number, updatedTask: Partial<Task>): Promise<Task> {
    return await lastValueFrom(this.http.put<Task>(`${this.apiUrl}/${id}`, updatedTask));
  }

  isEmpty(value: any): boolean {
  // Null o undefined
  if (value === null || value === undefined) return true;

  // String vacío, solo espacios, tabs o saltos de línea
  if (typeof value === 'string' && value.trim() === '') return true;

  // Array vacío
  if (Array.isArray(value) && value.length === 0) return true;

  // Objeto vacío
  if (typeof value === 'object' && !Array.isArray(value)) {
    if (Object.keys(value).length === 0) return true;
  }

  // Número NaN
  if (typeof value === 'number' && isNaN(value)) return true;

  // Booleano falso (opcional, depende de si quieres considerar false como "vacío")
  if (typeof value === 'boolean' && value === false) return true;

  return false;
}

}