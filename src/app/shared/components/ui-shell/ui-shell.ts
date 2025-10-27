import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../core/services/task';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-ui-shell',
  templateUrl: './ui-shell.html',
})
export class UiShellComponent implements OnInit {
  tasks: Task[] = [];

  constructor(private APIService: APIService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.tasks = await this.APIService.getAllTasks(); // ✅ ya no .subscribe
    } catch (err) {
      console.error('Error al cargar las tareas:', err);
    }
  }
}
