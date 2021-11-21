import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  host: { 'class': 'container d-flex flex-column h-100'},
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Breadcrumb';
}
 