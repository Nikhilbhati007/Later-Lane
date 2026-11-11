/**
 * Later Lane - GSAP Animation Controller
 * Smooth, calming, organic transitions that make the app feel alive and peaceful.
 * Supports reduced-motion accessibility preference.
 */

class LaneAnimations {
  constructor() {
    this.hasGSAP = typeof gsap !== 'undefined';
    this.breathingTween = null;
  }

  isReducedMotion() {
    return (
      (window.laneStorage && window.laneStorage.settings.reducedMotion) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  // Soft transition between views
  transitionScreens(oldScreenEl, newScreenEl, callback) {
    if (this.isReducedMotion() || !this.hasGSAP) {
      if (oldScreenEl) oldScreenEl.classList.add('hidden');
      if (newScreenEl) newScreenEl.classList.remove('hidden');
      if (callback) callback();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (callback) callback();
      }
    });

    if (oldScreenEl) {
      tl.to(oldScreenEl, {
        opacity: 0,
        y: -12,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: () => {
          oldScreenEl.classList.add('hidden');
        }
      });
    }

    if (newScreenEl) {
      newScreenEl.classList.remove('hidden');
      tl.fromTo(
        newScreenEl,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        '-=0.08'
      );
    }
  }

  // Calming breathing pulse on the timer ring
  startBreathingRing(ringElement, glowElement) {
    if (this.breathingTween) {
      this.breathingTween.kill();
      this.breathingTween = null;
    }
    if (this.isReducedMotion() || !this.hasGSAP || !ringElement) return;

    // 4-second gentle expansion and contraction (mimicking natural breath cycle)
    this.breathingTween = gsap.timeline({ repeat: -1, yoyo: true });
    this.breathingTween.to(ringElement, {
      scale: 1.025,
      transformOrigin: '50% 50%',
      duration: 3.8,
      ease: 'sine.inOut'
    });

    if (glowElement) {
      gsap.to(glowElement, {
        opacity: 0.65,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }

  stopBreathingRing(ringElement) {
    if (this.breathingTween) {
      this.breathingTween.kill();
      this.breathingTween = null;
    }
    if (this.hasGSAP && ringElement) {
      gsap.to(ringElement, { scale: 1, duration: 0.3 });
    }
  }

  // The Signature "Park This Urge" Animation:
  // The sheet/card glides smoothly down into the Later Lane shelf and docks
  parkUrgeAnimation(sourceElement, targetContainer, onComplete) {
    if (this.isReducedMotion() || !this.hasGSAP || !sourceElement) {
      if (onComplete) onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Gentle compression, slight tilt, then slide into the lane shelf
    tl.to(sourceElement, {
      scale: 0.88,
      opacity: 0.7,
      duration: 0.18,
      ease: 'power2.in'
    })
    .to(sourceElement, {
      y: 120,
      opacity: 0,
      scale: 0.7,
      duration: 0.32,
      ease: 'back.in(1.2)'
    });

    if (targetContainer) {
      // Shelf expands gently to welcome the new urge
      tl.fromTo(
        targetContainer,
        { scale: 0.97 },
        { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' },
        '-=0.15'
      );
    }
  }

  // Animate modal bottom sheet entrance
  openSheet(overlayEl, sheetEl) {
    if (!overlayEl || !sheetEl) return;
    overlayEl.classList.remove('hidden');

    if (this.isReducedMotion() || !this.hasGSAP) {
      overlayEl.style.opacity = '1';
      sheetEl.style.transform = 'translateY(0)';
      return;
    }

    gsap.fromTo(
      overlayEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.22, ease: 'power2.out' }
    );

    gsap.fromTo(
      sheetEl,
      { y: '100%', opacity: 0.6 },
      { y: '0%', opacity: 1, duration: 0.38, ease: 'power3.out' }
    );
  }

  // Animate modal close
  closeSheet(overlayEl, sheetEl, callback) {
    if (!overlayEl || !sheetEl) return;

    if (this.isReducedMotion() || !this.hasGSAP) {
      overlayEl.classList.add('hidden');
      if (callback) callback();
      return;
    }

    gsap.to(overlayEl, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in'
    });

    gsap.to(sheetEl, {
      y: '100%',
      duration: 0.26,
      ease: 'power3.in',
      onComplete: () => {
        overlayEl.classList.add('hidden');
        if (callback) callback();
      }
    });
  }

  // Subtle badge bump when an urge is parked
  bumpBadge(badgeEl) {
    if (this.isReducedMotion() || !this.hasGSAP || !badgeEl) return;
    gsap.fromTo(
      badgeEl,
      { scale: 1.25, color: '#2DD4BF' },
      { scale: 1, color: 'inherit', duration: 0.45, ease: 'power2.out' }
    );
  }
}

window.laneAnimations = new LaneAnimations();

