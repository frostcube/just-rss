/* eslint-disable indent */
import { Component, Input} from '@angular/core';
import { BookmarkService } from 'src/app/services/bookmark.service';
import { PlatformService } from 'src/app/services/platform.service';
import { SettingsService } from 'src/app/services/settings.service';
import { formatDateRelative } from '../date-utils';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() entries: any[] = [];
  @Input() filter: string = '';

  public formatDateRelative = formatDateRelative;

  constructor(public bookmarkService: BookmarkService,
              public platformService: PlatformService, 
              public settingsService: SettingsService) { }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public addBookmark(event: Event, entry: any) {
        this.bookmarkService.addEntry(entry);
        event.stopPropagation();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public removeBookmark(event: Event, entry: any) {
        this.bookmarkService.removeEntry(entry);
        event.stopPropagation();
    }
}
