import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-site-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>État du Site</h1>
        <p class="subtitle">Gérer la visibilité du site pour les visiteurs</p>
      </div>
    </div>

    <div class="status-grid">
      @for (mode of modes; track mode.value) {
        <div class="status-card" [class.active]="status.mode === mode.value" [style.--accent]="mode.color" (click)="selectMode(mode.value)">
          <div class="status-icon" [style.background]="mode.bg">
            <span>{{ mode.icon }}</span>
          </div>
          <h3>{{ mode.label }}</h3>
          <p>{{ mode.desc }}</p>
          @if (status.mode === mode.value) {
            <div class="active-badge">Actif</div>
          }
        </div>
      }
    </div>

    <div class="status-form" *ngIf="status.mode !== 'live'">
      <h2>Message personnalisé</h2>
      <div class="form-group">
        <label>Titre (optionnel)</label>
        <input [(ngModel)]="status.title" placeholder="Ex: Maintenance planifiée" class="form-input" />
      </div>
      <div class="form-group">
        <label>Message (optionnel)</label>
        <textarea [(ngModel)]="status.message" placeholder="Ex: Nous effectuons une mise à jour de nos serveurs..." class="form-textarea" rows="3"></textarea>
      </div>
      <div class="form-actions">
        <button class="btn-save" (click)="save()" [disabled]="saving">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <button class="btn-preview" (click)="preview()">Aperçu</button>
      </div>
      @if (saved) {
        <div class="save-success">✓ Enregistré avec succès</div>
      }
    </div>

    @if (showPreview) {
      <div class="preview-overlay" (click)="showPreview = false">
        <div class="preview-card" (click)="$event.stopPropagation()">
          <div class="preview-header">
            <h3>Aperçu du mode "{{ getModeLabel(status.mode) }}"</h3>
            <button class="close-btn" (click)="showPreview = false">✕</button>
          </div>
          <div class="preview-content" [style.background]="getModeBg(status.mode)">
            <div class="preview-icon">{{ getModeIcon(status.mode) }}</div>
            <h1>{{ status.title || getModeTitle(status.mode) }}</h1>
            <p>{{ status.message || getModeSubtitle(status.mode) }}</p>
            <div class="preview-logo">UNSI Céramique</div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 32px; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: #1A1D26; }
    .subtitle { color: #8B90A0; font-size: 14px; margin-top: 4px; }
    .status-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .status-card {
      background: white; border: 2px solid #E4E7ED; border-radius: 16px; padding: 24px;
      cursor: pointer; transition: all 0.2s; position: relative; text-align: center;
    }
    .status-card:hover { border-color: #C4C8D4; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
    .status-card.active { border-color: var(--accent); background: linear-gradient(135deg, white 0%, color-mix(in srgb, var(--accent) 5%, white) 100%); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .status-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 28px; }
    .status-card h3 { font-size: 16px; font-weight: 700; color: #1A1D26; margin-bottom: 6px; }
    .status-card p { font-size: 13px; color: #8B90A0; line-height: 1.4; }
    .active-badge { position: absolute; top: 12px; right: 12px; background: var(--accent); color: white; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
    .status-form { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .status-form h2 { font-size: 18px; font-weight: 700; color: #1A1D26; margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #4A4E5A; margin-bottom: 6px; }
    .form-input, .form-textarea { width: 100%; padding: 12px 16px; border: 1px solid #E4E7ED; border-radius: 10px; font-size: 14px; color: #1A1D26; outline: none; transition: border 0.2s; }
    .form-input:focus, .form-textarea:focus { border-color: #1565C0; }
    .form-textarea { resize: vertical; }
    .form-actions { display: flex; gap: 12px; margin-top: 20px; }
    .btn-save { background: #1565C0; color: white; border: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-save:hover { background: #0D47A1; }
    .btn-save:disabled { opacity: 0.6; }
    .btn-preview { background: #F4F6F9; color: #4A4E5A; border: 1px solid #E4E7ED; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .save-success { margin-top: 12px; color: #2E7D32; font-size: 14px; font-weight: 600; }
    .preview-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .preview-card { background: white; border-radius: 16px; overflow: hidden; width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .preview-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #E4E7ED; }
    .preview-header h3 { font-size: 14px; font-weight: 600; }
    .close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #8B90A0; }
    .preview-content { padding: 48px 32px; text-align: center; }
    .preview-icon { font-size: 64px; margin-bottom: 20px; }
    .preview-content h1 { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
    .preview-content p { font-size: 15px; color: #5E5A54; margin-bottom: 24px; }
    .preview-logo { font-size: 16px; font-weight: 700; color: #0D47A1; letter-spacing: 2px; }
    @media (max-width: 900px) { .status-grid { grid-template-columns: repeat(2, 1fr); } }
  `]
})
export class AdminSiteStatusComponent implements OnInit {
  private http = inject(HttpClient);

  status: any = { mode: 'live', title: '', message: '' };
  saving = false;
  saved = false;
  showPreview = false;

  modes = [
    { value: 'live', label: 'En ligne', desc: 'Site visible et opérationnel', icon: '🟢', color: '#2E7D32', bg: '#E8F5E9' },
    { value: 'maintenance', label: 'Maintenance', desc: 'Site temporairement indisponible', icon: '🔧', color: '#F57F17', bg: '#FFF8E1' },
    { value: 'coming_soon', label: 'Bientôt', desc: 'Page d\'attente pour un lancement', icon: '🚀', color: '#1565C0', bg: '#E3F2FD' },
    { value: 'vacation', label: 'Vacances', desc: 'Absence temporaire', icon: '🏖️', color: '#C4A265', bg: '#F5EFE0' },
  ];

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<any>('/api/admin/site-status').subscribe(data => {
      this.status = data;
    });
  }

  selectMode(mode: string) {
    this.status.mode = mode;
  }

  save() {
    this.saving = true;
    this.saved = false;
    this.http.put<any>('/api/admin/site-status', this.status).subscribe(data => {
      this.status = data;
      this.saving = false;
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    });
  }

  preview() {
    this.showPreview = true;
  }

  getModeLabel(mode: string) { return this.modes.find(m => m.value === mode)?.label || mode; }
  getModeIcon(mode: string) { return this.modes.find(m => m.value === mode)?.icon || ''; }
  getModeBg(mode: string) { return this.modes.find(m => m.value === mode)?.bg || '#F5F5F5'; }
  getModeTitle(mode: string) {
    const titles: any = { maintenance: 'Site en maintenance', coming_soon: 'Bientôt disponible', vacation: 'En vacances' };
    return titles[mode] || '';
  }
  getModeSubtitle(mode: string) {
    const subs: any = { maintenance: 'Nous revenons très bientôt', coming_soon: 'Quelque chose d\'incroyable arrive', vacation: 'Nous serons de retour bientôt' };
    return subs[mode] || '';
  }
}
