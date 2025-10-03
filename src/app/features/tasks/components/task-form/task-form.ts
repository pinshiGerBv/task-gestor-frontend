import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TasksService } from '../../../../core/services/task';
import Swal from 'sweetalert2';
import { identifierName } from '@angular/compiler';
import { Task, TaskStatus, TaskPriority } from '../../../../core/models/task.model';
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.css']
})
export class TaskForm {
  constructor(private taskService: TasksService, private cdr: ChangeDetectorRef) {}
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  task: Task = {
    id: 0, 
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    createdAt: new Date(),
    updatedAt: new Date()
  };


  resetForm() {
    this.task = {
      id: 0,
      title: '',
      description: '',
      status: this.task.status = TaskStatus.PENDING,
      priority: this.task.priority = TaskPriority.LOW,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cdr.detectChanges();
  }

  transformDisplay() {
    const form = document.getElementsByTagName("form")[0];
    form.style.display = (form.style.display === 'none') ? 'block' : 'none';
    this.cdr.detectChanges();
  }

    transformDisplayUpdate() {
    const form = document.getElementsByTagName("form")[1];
    form.style.display = (form.style.display === 'none') ? 'block' : 'none';
    this.cdr.detectChanges();
  }

  submitTask() {
    this.submit(this.task);
    this.cdr.detectChanges();
  }

  
  
  updateTask() {
  this.taskService.updateTask(this.task.id, this.task).then(() => {
    console.log('Tarea actualizada');
  });}

  private submit(task: any) {
    const url = 'http://localhost:3000/tasks';

    if (this.taskService.isEmpty(this.task.title) === true && this.taskService.isEmpty(this.task.description) === true) {
      Swal.fire({
        title: 'error to send',
        text: 'Task Title and description is empty',
        icon: 'warning',
        timer: 1000
      });
    } else if (this.taskService.isEmpty(this.task.title) === true) {
      Swal.fire({
        title: 'error to send',
        text: 'Task Title is empty',
        icon: 'warning',
        timer: 1000
      });
    } else if (this.taskService.isEmpty(this.task.description) === true) {
      Swal.fire({
        title: 'error to send',
        text: 'Task description is empty',
        icon: 'warning',
        timer: 1000
      });
    } else if (this.taskService.isEmpty(this.task.title) === false && this.taskService.isEmpty(this.task.description) === false) {
      this.taskService.http.post(url, task).subscribe({
        next: (response) => {
          console.log('Tarea enviada con éxito:', response);
        },
        error: (error) => {
          console.error('Error al enviar la tarea:', error);
        }
      });

      Swal.fire({
        title: 'Task Submitted',
        text: 'Task has been successfully submitted!',
        icon: 'success',
        timer: 1000
      });
      this.transformDisplay();
      this.resetForm();
      this.cdr.detectChanges();
    }
  }
}




/*
    Swal.fire({
      title: 'Task Submitted',
      text: 'Your task has been successfully submitted!',
      icon: 'success',
      confirmButtonText: 'OK'
    });
    */