import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

@Directive({
  selector: '[appTilt3d]',
  standalone: true
})
export class Tilt3dDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  readonly max = input(10, { alias: 'appTilt3dMax' });
  readonly glare = input(true, { alias: 'appTilt3dGlare' });

  private frame = 0;
  private reduced = false;

  private onMove = (e: PointerEvent): void => {
    if (this.reduced) return;
    const node = this.el.nativeElement;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * this.max();
    const ry = (px - 0.5) * this.max();

    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      node.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      if (this.glare()) {
        node.style.setProperty('--tilt-glare-x', `${px * 100}%`);
        node.style.setProperty('--tilt-glare-y', `${py * 100}%`);
        node.style.setProperty('--tilt-glare-opacity', '0.35');
      }
    });
  };

  private onLeave = (): void => {
    const node = this.el.nativeElement;
    cancelAnimationFrame(this.frame);
    node.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    node.style.setProperty('--tilt-glare-opacity', '0');
  };

  ngOnInit(): void {
    const node = this.el.nativeElement;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || window.matchMedia('(pointer: coarse)').matches;

    node.classList.add('tilt-3d');
    if (this.reduced) return;

    node.addEventListener('pointermove', this.onMove);
    node.addEventListener('pointerleave', this.onLeave);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
    const node = this.el.nativeElement;
    node.removeEventListener('pointermove', this.onMove);
    node.removeEventListener('pointerleave', this.onLeave);
  }
}
