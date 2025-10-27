import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Task,TaskStatus,TaskPriority } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class APIService {
  private readonly apiUrl = 'http://localhost:3000/tasks';
  // private readonly apiUrl = 'https://task-gestor-backend.onrender.com/tasks';
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

}
