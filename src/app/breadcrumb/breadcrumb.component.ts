import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  host: { 'class': 'container d-flex flex-grow-1 flex-column', 'style': 'min-height: 0'},
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
