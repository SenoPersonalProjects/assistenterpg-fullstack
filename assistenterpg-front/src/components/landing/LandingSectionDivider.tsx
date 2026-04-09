import Image from 'next/image';
import { landingImages } from './landingAssets';

export function LandingSectionDivider() {
  return (
    <div className="landing-divider" aria-hidden="true">
      <span className="landing-divider__line" />
      <span className="landing-divider__icon">
        <Image
          src={landingImages.logoJjkJapones}
          alt=""
          fill
          sizes="72px"
          className="object-contain"
        />
      </span>
      <span className="landing-divider__line" />
    </div>
  );
}
