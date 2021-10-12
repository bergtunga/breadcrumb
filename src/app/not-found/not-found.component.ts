import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {
  currentUrl: string = "";
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.url.subscribe((url) => {
      this.currentUrl = url.join('/');
    });
  }

}
