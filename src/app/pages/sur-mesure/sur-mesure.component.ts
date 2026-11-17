import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  AmbientLight,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

export type VesselShape = 'mug' | 'coffee' | 'espresso' | 'bowl';

interface ShapeOption {
  id: VesselShape;
  labelKey: string;
  price: number;
}

const DEFAULT_SHAPES: ShapeOption[] = [
  { id: 'mug', labelKey: 'custom.shapeMug', price: 189 },
  { id: 'coffee', labelKey: 'custom.shapeCoffee', price: 249 },
  { id: 'espresso', labelKey: 'custom.shapeEspresso', price: 159 },
  { id: 'bowl', labelKey: 'custom.shapeBowl', price: 199 }
];

const LABEL_KEYS: Record<VesselShape, string> = {
  mug: 'custom.shapeMug',
  coffee: 'custom.shapeCoffee',
  espresso: 'custom.shapeEspresso',
  bowl: 'custom.shapeBowl'
};

@Component({
  selector: 'app-sur-mesure',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './sur-mesure.component.html',
  styleUrl: './sur-mesure.component.css'
})
export class SurMesureComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('viewport', { static: true }) viewport!: ElementRef<HTMLDivElement>;

  private seo = inject(SeoService);
  private cart = inject(CartService);
  private router = inject(Router);
  private http = inject(HttpClient);

  shapes = signal<ShapeOption[]>(DEFAULT_SHAPES.map((s) => ({ ...s })));

  shape = signal<VesselShape>('mug');
  cupColor = signal('#F6D6DE');
  logoScale = signal(0.42);
  logoOffsetX = signal(0);
  logoOffsetY = signal(0.08);
  autoRotate = signal(true);
  hasLogo = signal(false);
  fileName = signal('');
  adding = signal(false);
  added = signal(false);

  private renderer?: WebGLRenderer;
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private controls?: OrbitControls;
  private goblet?: Group;
  private bodyMesh?: Mesh;
  private frameId = 0;
  private resizeObs?: ResizeObserver;
  private logoImage: HTMLImageElement | null = null;
  private textureCanvas?: HTMLCanvasElement;
  private bodyTexture?: CanvasTexture;
  private disposed = false;

  get selectedShape(): ShapeOption {
    return this.shapes().find((s) => s.id === this.shape()) || this.shapes()[0];
  }

  ngOnInit(): void {
    this.http.get<{ id: string; price: number }[]>('/api/custom-shapes').subscribe({
      next: (data) => {
        if (!Array.isArray(data) || !data.length) return;
        const next = DEFAULT_SHAPES.map((shape) => {
          const match = data.find((s) => s.id === shape.id);
          const price = Number(match?.price);
          return {
            ...shape,
            labelKey: LABEL_KEYS[shape.id],
            price: Number.isFinite(price) && price >= 0 ? price : shape.price
          };
        });
        this.shapes.set(next);
      },
      error: () => {
        // Keep default prices if API is unavailable
      }
    });
  }

  ngAfterViewInit(): void {
    this.seo.updateTags({
      title: 'Sur mesure',
      description: 'Personnalisez votre pièce UNSI : mug, tasse à café, espresso ou bol — uploadez un logo et visualisez-le en 3D.',
      url: '/sur-mesure',
      keywords: 'UNSI, sur mesure, mug personnalisé, tasse café, logo'
    });

    if (typeof window === 'undefined') return;
    this.initScene();
    this.animate();
  }

  ngOnDestroy(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.resizeObs?.disconnect();
    this.controls?.dispose();
    this.disposeVessel();
    this.bodyTexture?.dispose();
    this.renderer?.dispose();
    this.viewport?.nativeElement?.replaceChildren();
  }

  setShape(id: VesselShape): void {
    if (this.shape() === id) return;
    this.shape.set(id);
    this.rebuildVessel();
    this.added.set(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.loadLogoFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.loadLogoFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  clearLogo(): void {
    this.logoImage = null;
    this.hasLogo.set(false);
    this.fileName.set('');
    this.paintTexture();
    this.added.set(false);
  }

  setCupColor(value: string): void {
    this.cupColor.set(value);
    this.paintTexture();
    this.added.set(false);
  }

  setLogoScale(value: number): void {
    this.logoScale.set(value);
    this.paintTexture();
  }

  setLogoOffsetX(value: number): void {
    this.logoOffsetX.set(value);
    this.paintTexture();
  }

  setLogoOffsetY(value: number): void {
    this.logoOffsetY.set(value);
    this.paintTexture();
  }

  toggleAutoRotate(): void {
    this.autoRotate.set(!this.autoRotate());
    if (this.controls) this.controls.autoRotate = this.autoRotate();
  }

  nextToCart(): void {
    if (this.adding()) return;
    this.adding.set(true);

    // Pause rotation for a clean snapshot
    if (this.controls) this.controls.autoRotate = false;
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    const preview = this.renderer?.domElement.toDataURL('image/png') || 'assets/products/mug.jpg';
    const shape = this.selectedShape;
    const product: Product = {
      id: -Date.now(),
      name: `Sur mesure — ${this.shapeLabel(shape.id)}`,
      description: `Pièce personnalisée UNSI (${this.shapeLabel(shape.id)}), couleur ${this.cupColor()}${this.hasLogo() ? ', avec logo' : ''}.`,
      price: shape.price,
      image: preview,
      category: 'Sur mesure',
      rating: 5,
      stock: 1,
      inStock: true
    };

    this.cart.addToCart(product);
    this.added.set(true);
    this.adding.set(false);

    if (this.controls) this.controls.autoRotate = this.autoRotate();
    this.router.navigate(['/cart']);
  }

  private shapeLabel(id: VesselShape): string {
    const map: Record<VesselShape, string> = {
      mug: 'Mug',
      coffee: 'Tasse & soucoupe',
      espresso: 'Espresso',
      bowl: 'Bol'
    };
    return map[id];
  }

  private loadLogoFile(file: File): void {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      this.logoImage = img;
      this.hasLogo.set(true);
      this.fileName.set(file.name);
      this.paintTexture();
      this.added.set(false);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  private initScene(): void {
    const host = this.viewport.nativeElement;
    const width = host.clientWidth || 640;
    const height = host.clientHeight || 520;

    const scene = new Scene();
    scene.background = new Color('#FFF7F9');
    this.scene = scene;

    const camera = new PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(2.15, 1.55, 2.85);
    this.camera = camera;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    host.replaceChildren(renderer.domElement);
    this.renderer = renderer;

    scene.add(new AmbientLight(0xffffff, 0.75));

    const key = new DirectionalLight(0xffe4ec, 1.25);
    key.position.set(4, 6, 3);
    scene.add(key);

    const fill = new DirectionalLight(0xffffff, 0.55);
    fill.position.set(-3, 2, -2);
    scene.add(fill);

    const rim = new PointLight(0xe85a7a, 18, 12);
    rim.position.set(-1.5, 2.2, 2.5);
    scene.add(rim);

    this.textureCanvas = document.createElement('canvas');
    this.textureCanvas.width = 1024;
    this.textureCanvas.height = 1024;
    this.bodyTexture = new CanvasTexture(this.textureCanvas);
    this.bodyTexture.colorSpace = 'srgb' as any;
    this.paintTexture();

    this.goblet = this.createVessel(this.shape());
    scene.add(this.goblet);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.8;
    controls.maxDistance = 5.5;
    controls.maxPolarAngle = Math.PI * 0.82;
    controls.target.set(0, 0.72, 0);
    controls.autoRotate = this.autoRotate();
    controls.autoRotateSpeed = 0.9;
    controls.update();
    this.controls = controls;

    this.resizeObs = new ResizeObserver(() => this.onResize());
    this.resizeObs.observe(host);
  }

  private rebuildVessel(): void {
    if (!this.scene) return;
    this.disposeVessel();
    this.goblet = this.createVessel(this.shape());
    this.scene.add(this.goblet);
    this.paintTexture();

    if (this.controls) {
      const targetY = this.shape() === 'bowl' ? 0.45 : this.shape() === 'espresso' ? 0.55 : 0.72;
      this.controls.target.set(0, targetY, 0);
      this.controls.update();
    }
  }

  private disposeVessel(): void {
    if (!this.goblet || !this.scene) return;
    this.scene.remove(this.goblet);
    this.goblet.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat && mat !== this.bodyMesh?.material) mat.dispose();
      }
    });
    this.goblet = undefined;
    this.bodyMesh = undefined;
  }

  private ceramicMat(color: string, opts: Partial<MeshPhysicalMaterial> = {}): MeshPhysicalMaterial {
    return new MeshPhysicalMaterial({
      color: new Color(color),
      roughness: 0.32,
      metalness: 0.02,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
      ...opts
    });
  }

  private tint(mesh: Mesh): void {
    (mesh as any).__tintable = true;
  }

  private createVessel(shape: VesselShape): Group {
    switch (shape) {
      case 'coffee':
        return this.createCoffeeSet();
      case 'espresso':
        return this.createEspressoSet();
      case 'bowl':
        return this.createBowl();
      default:
        return this.createMug();
    }
  }

  private createMug(): Group {
    const group = new Group();
    const ceramic = this.cupColor();

    const outerProfile: Vector2[] = [
      new Vector2(0.42, 0.0),
      new Vector2(0.5, 0.02),
      new Vector2(0.54, 0.06),
      new Vector2(0.52, 0.1),
      new Vector2(0.5, 0.16),
      new Vector2(0.5, 0.35),
      new Vector2(0.505, 0.7),
      new Vector2(0.52, 1.05),
      new Vector2(0.545, 1.28),
      new Vector2(0.56, 1.38),
      new Vector2(0.555, 1.42)
    ];

    const body = new Mesh(
      new LatheGeometry(outerProfile, 128),
      new MeshPhysicalMaterial({
        map: this.bodyTexture,
        color: 0xffffff,
        roughness: 0.34,
        metalness: 0.02,
        clearcoat: 0.35,
        clearcoatRoughness: 0.28,
        side: DoubleSide
      })
    );
    this.bodyMesh = body;
    group.add(body);

    const rim = new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.555, 1.42),
          new Vector2(0.57, 1.445),
          new Vector2(0.545, 1.46),
          new Vector2(0.5, 1.455),
          new Vector2(0.475, 1.43)
        ],
        96
      ),
      this.ceramicMat(ceramic)
    );
    this.tint(rim);
    group.add(rim);

    group.add(
      new Mesh(
        new LatheGeometry(
          [
            new Vector2(0.475, 1.43),
            new Vector2(0.46, 1.2),
            new Vector2(0.445, 0.75),
            new Vector2(0.44, 0.35),
            new Vector2(0.43, 0.18),
            new Vector2(0.01, 0.16)
          ],
          96
        ),
        new MeshStandardMaterial({ color: new Color('#FFF8FA'), roughness: 0.42, side: DoubleSide })
      )
    );

    const bottom = new Mesh(new CylinderGeometry(0.42, 0.42, 0.04, 64), this.ceramicMat(ceramic, { roughness: 0.45 }));
    bottom.position.y = 0.02;
    this.tint(bottom);
    group.add(bottom);

    const handle = new Mesh(
      new TubeGeometry(
        new CatmullRomCurve3([
          new Vector3(0.5, 1.18, 0),
          new Vector3(0.72, 1.2, 0),
          new Vector3(0.88, 1.05, 0),
          new Vector3(0.92, 0.78, 0),
          new Vector3(0.86, 0.52, 0),
          new Vector3(0.7, 0.4, 0),
          new Vector3(0.5, 0.42, 0)
        ]),
        64,
        0.048,
        20,
        false
      ),
      this.ceramicMat(ceramic)
    );
    this.tint(handle);
    group.add(handle);

    group.position.y = -0.05;
    return group;
  }

  private createCoffeeSet(): Group {
    const group = new Group();
    const ceramic = this.cupColor();

    // Wider, shorter coffee cup
    const outer: Vector2[] = [
      new Vector2(0.48, 0.55),
      new Vector2(0.55, 0.57),
      new Vector2(0.58, 0.62),
      new Vector2(0.56, 0.68),
      new Vector2(0.58, 0.95),
      new Vector2(0.62, 1.15),
      new Vector2(0.66, 1.28),
      new Vector2(0.68, 1.34)
    ];
    const body = new Mesh(
      new LatheGeometry(outer, 128),
      new MeshPhysicalMaterial({
        map: this.bodyTexture,
        color: 0xffffff,
        roughness: 0.34,
        metalness: 0.02,
        clearcoat: 0.35,
        clearcoatRoughness: 0.28,
        side: DoubleSide
      })
    );
    this.bodyMesh = body;
    group.add(body);

    const rim = new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.68, 1.34),
          new Vector2(0.7, 1.365),
          new Vector2(0.66, 1.38),
          new Vector2(0.6, 1.37),
          new Vector2(0.57, 1.34)
        ],
        96
      ),
      this.ceramicMat(ceramic)
    );
    this.tint(rim);
    group.add(rim);

    group.add(
      new Mesh(
        new LatheGeometry(
          [
            new Vector2(0.57, 1.34),
            new Vector2(0.54, 1.05),
            new Vector2(0.5, 0.8),
            new Vector2(0.48, 0.68),
            new Vector2(0.01, 0.66)
          ],
          96
        ),
        new MeshStandardMaterial({ color: new Color('#FFF8FA'), roughness: 0.42, side: DoubleSide })
      )
    );

    const handle = new Mesh(
      new TubeGeometry(
        new CatmullRomCurve3([
          new Vector3(0.58, 1.18, 0),
          new Vector3(0.82, 1.2, 0),
          new Vector3(0.95, 1.05, 0),
          new Vector3(0.96, 0.88, 0),
          new Vector3(0.86, 0.74, 0),
          new Vector3(0.58, 0.76, 0)
        ]),
        56,
        0.042,
        18,
        false
      ),
      this.ceramicMat(ceramic)
    );
    this.tint(handle);
    group.add(handle);

    // Saucer
    const saucer = new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.01, 0.42),
          new Vector2(0.35, 0.43),
          new Vector2(0.75, 0.46),
          new Vector2(0.95, 0.5),
          new Vector2(1.05, 0.54),
          new Vector2(1.08, 0.56),
          new Vector2(1.02, 0.57),
          new Vector2(0.7, 0.52),
          new Vector2(0.35, 0.5),
          new Vector2(0.01, 0.49)
        ],
        96
      ),
      this.ceramicMat(ceramic, { roughness: 0.36, clearcoat: 0.5 })
    );
    this.tint(saucer);
    group.add(saucer);

    group.position.y = -0.15;
    return group;
  }

  private createEspressoSet(): Group {
    const group = new Group();
    const ceramic = this.cupColor();

    const outer: Vector2[] = [
      new Vector2(0.28, 0.42),
      new Vector2(0.34, 0.44),
      new Vector2(0.36, 0.5),
      new Vector2(0.35, 0.58),
      new Vector2(0.38, 0.78),
      new Vector2(0.42, 0.92),
      new Vector2(0.44, 0.98)
    ];
    const body = new Mesh(
      new LatheGeometry(outer, 112),
      new MeshPhysicalMaterial({
        map: this.bodyTexture,
        color: 0xffffff,
        roughness: 0.34,
        metalness: 0.02,
        clearcoat: 0.35,
        clearcoatRoughness: 0.28,
        side: DoubleSide
      })
    );
    this.bodyMesh = body;
    group.add(body);

    const rim = new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.44, 0.98),
          new Vector2(0.46, 1.0),
          new Vector2(0.42, 1.01),
          new Vector2(0.36, 1.0),
          new Vector2(0.34, 0.97)
        ],
        80
      ),
      this.ceramicMat(ceramic)
    );
    this.tint(rim);
    group.add(rim);

    group.add(
      new Mesh(
        new LatheGeometry(
          [
            new Vector2(0.34, 0.97),
            new Vector2(0.32, 0.75),
            new Vector2(0.3, 0.58),
            new Vector2(0.01, 0.56)
          ],
          80
        ),
        new MeshStandardMaterial({ color: new Color('#FFF8FA'), roughness: 0.42, side: DoubleSide })
      )
    );

    const handle = new Mesh(
      new TubeGeometry(
        new CatmullRomCurve3([
          new Vector3(0.38, 0.88, 0),
          new Vector3(0.58, 0.9, 0),
          new Vector3(0.66, 0.78, 0),
          new Vector3(0.64, 0.62, 0),
          new Vector3(0.48, 0.56, 0),
          new Vector3(0.36, 0.58, 0)
        ]),
        48,
        0.032,
        16,
        false
      ),
      this.ceramicMat(ceramic)
    );
    this.tint(handle);
    group.add(handle);

    const saucer = new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.01, 0.34),
          new Vector2(0.25, 0.35),
          new Vector2(0.55, 0.38),
          new Vector2(0.72, 0.42),
          new Vector2(0.78, 0.45),
          new Vector2(0.74, 0.46),
          new Vector2(0.45, 0.42),
          new Vector2(0.01, 0.4)
        ],
        80
      ),
      this.ceramicMat(ceramic, { roughness: 0.36 })
    );
    this.tint(saucer);
    group.add(saucer);

    group.position.y = 0.05;
    return group;
  }

  private createBowl(): Group {
    const group = new Group();
    const ceramic = this.cupColor();

    const outer: Vector2[] = [
      new Vector2(0.2, 0.0),
      new Vector2(0.45, 0.02),
      new Vector2(0.7, 0.08),
      new Vector2(0.9, 0.2),
      new Vector2(1.05, 0.4),
      new Vector2(1.12, 0.62),
      new Vector2(1.14, 0.78)
    ];
    const body = new Mesh(
      new LatheGeometry(outer, 128),
      new MeshPhysicalMaterial({
        map: this.bodyTexture,
        color: 0xffffff,
        roughness: 0.34,
        metalness: 0.02,
        clearcoat: 0.35,
        clearcoatRoughness: 0.28,
        side: DoubleSide
      })
    );
    this.bodyMesh = body;
    group.add(body);

    const rim = new Mesh(
      new LatheGeometry(
        [
          new Vector2(1.14, 0.78),
          new Vector2(1.16, 0.8),
          new Vector2(1.1, 0.81),
          new Vector2(1.02, 0.78)
        ],
        96
      ),
      this.ceramicMat(ceramic)
    );
    this.tint(rim);
    group.add(rim);

    group.add(
      new Mesh(
        new LatheGeometry(
          [
            new Vector2(1.02, 0.78),
            new Vector2(0.95, 0.55),
            new Vector2(0.75, 0.28),
            new Vector2(0.45, 0.12),
            new Vector2(0.01, 0.08)
          ],
          96
        ),
        new MeshStandardMaterial({ color: new Color('#FFF8FA'), roughness: 0.42, side: DoubleSide })
      )
    );

    const bottom = new Mesh(new CylinderGeometry(0.22, 0.22, 0.04, 48), this.ceramicMat(ceramic, { roughness: 0.48 }));
    bottom.position.y = 0.02;
    this.tint(bottom);
    group.add(bottom);

    group.position.y = 0.05;
    return group;
  }

  private paintTexture(): void {
    if (!this.textureCanvas || !this.bodyTexture) return;
    const ctx = this.textureCanvas.getContext('2d');
    if (!ctx) return;

    const w = this.textureCanvas.width;
    const h = this.textureCanvas.height;
    const color = this.cupColor();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(255,255,255,0.22)');
    grad.addColorStop(0.45, 'rgba(255,255,255,0.04)');
    grad.addColorStop(1, 'rgba(184,50,88,0.07)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const bandX = w * 0.38;
    const bandW = w * 0.24;
    const bandY = h * 0.22;
    const bandH = h * 0.55;

    if (this.logoImage) {
      const scale = this.logoScale();
      const maxW = bandW * (0.55 + scale * 0.9);
      const maxH = bandH * (0.55 + scale * 0.9);
      const ratio = this.logoImage.width / Math.max(1, this.logoImage.height);
      let logoW = maxW;
      let logoH = logoW / ratio;
      if (logoH > maxH) {
        logoH = maxH;
        logoW = logoH * ratio;
      }
      const cx = bandX + bandW * 0.5 + this.logoOffsetX() * bandW * 0.35;
      const cy = bandY + bandH * 0.5 + this.logoOffsetY() * bandH * 0.35;
      ctx.save();
      ctx.beginPath();
      ctx.rect(bandX, bandY, bandW, bandH);
      ctx.clip();
      ctx.drawImage(this.logoImage, cx - logoW / 2, cy - logoH / 2, logoW, logoH);
      ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(184, 50, 88, 0.2)';
      ctx.font = '600 52px Outfit, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('UNSI', bandX + bandW * 0.5, bandY + bandH * 0.45);
      ctx.font = '400 22px Outfit, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(184, 50, 88, 0.32)';
      ctx.fillText('votre logo ici', bandX + bandW * 0.5, bandY + bandH * 0.58);
    }

    this.bodyTexture.needsUpdate = true;

    this.goblet?.traverse((obj) => {
      if ((obj as any).__tintable && obj instanceof Mesh) {
        const mat = obj.material as MeshPhysicalMaterial;
        mat.color.set(color);
        mat.needsUpdate = true;
      }
    });
  }

  private onResize(): void {
    if (!this.renderer || !this.camera || !this.viewport) return;
    const host = this.viewport.nativeElement;
    const width = host.clientWidth || 640;
    const height = host.clientHeight || 520;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.frameId = requestAnimationFrame(this.animate);
    this.controls?.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
