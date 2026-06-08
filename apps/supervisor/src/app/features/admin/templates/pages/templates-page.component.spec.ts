import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TemplatesPageComponent } from './templates-page.component';

describe('TemplatesPageComponent', () => {
  let fixture: ComponentFixture<TemplatesPageComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TemplatesPageComponent, TranslateModule.forRoot()],
      providers: [provideRouter([]), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplatesPageComponent);
    fixture.detectChanges();
  });

  it('renders seed templates in the table', () => {
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelectorAll('.table__row').length).toBeGreaterThan(0);
  });

  it('exposes both Chat and Email tabs', () => {
    const tabs = fixture.nativeElement.querySelectorAll('.tabs__tab');
    expect(tabs.length).toBe(2);
  });
});
