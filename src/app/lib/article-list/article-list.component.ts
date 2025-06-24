import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent {
  @Input() entries: any[] = [];
  @Input() filter: string = '';
  @Input() settingsService: any;
  @Input() formatDateRelative: any;
  @Input() formatDateAsDay: any;
  @Input() openPreview: any;
  @Input() addBookmark: any;
  @Input() removeBookmark: any;

  @Output() bookmarkAdded = new EventEmitter<any>();
  @Output() bookmarkRemoved = new EventEmitter<any>();
}
