import { Color } from 'ngx-color'
import { Subject } from 'rxjs'
import { filter } from 'rxjs/operators/filter'
import { map } from 'rxjs/operators/map'

import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ColorPaletteService {
  private subject: Subject<{ path: string; color: Color }> = new Subject()

  public observeChanges(path: string) {
    return this.subject.asObservable().pipe(
      filter((v) => v.path === path),
      map((v) => v.color),
    )
  }

  public nextChange(path: string, color: Color) {
    this.subject.next({ path, color })
  }
}
