import { Component, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StateService } from '../../../../core/services/State.service';
import Swal from 'sweetalert2';
import { Task, TaskStatus, TaskPriority } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.css']
})
export class TaskForm implements OnInit {
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  task = signal<Task>({
    id: 0,
    title: '',
    description: '',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  showForm = signal(true);

  constructor(private shared: StateService) {
    effect(() => {
      const selected = this.shared.selectedTask();
      if (selected) {
        this.task.set({ ...selected });
      } else {
        this.resetForm();
      }
    });
  }

  ngOnInit() {}

  resetForm() {
    this.task.set({
      id: 0,
      title: '',
      description: '',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  transformDisplay(formIndex = 0) {
    const form = document.getElementsByTagName('form')[formIndex];
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }

  async submitTask() {
    const currentTask = this.task();

    if (!currentTask.title.trim() || !currentTask.description.trim()) {
      Swal.fire('Error', 'Title and description are required', 'warning');
      return;
    }

    try {
      await this.shared.createTask(currentTask);

      Swal.fire({
        title: 'Task Submitted',
        text: 'The task has been created successfully!',
        icon: 'success',
        timer: 1000
      });

      this.transformDisplay(0);
      this.resetForm();

    } catch {
      Swal.fire('Error', 'Failed to create the task', 'error');
    }
  }

  async updateTask() {
    const currentTask = this.task();

    if (!currentTask.id) {
      Swal.fire('Error', 'No task selected', 'warning');
      return;
    }

    try {
      await this.shared.updateTask(currentTask.id, currentTask);

      Swal.fire({
        title: 'Task Updated',
        text: 'The task has been updated successfully!',
        icon: 'success',
        timer: 1500
      });
      this.transformDisplay(1);


      this.shared.selectedTask.set(null);
    } catch {
      Swal.fire('Error', 'Failed to update the task', 'error');
    }
  }
}
