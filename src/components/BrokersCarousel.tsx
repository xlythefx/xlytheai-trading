import { type SVGProps } from "react";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { LogoCarousel, type Logo } from "@/components/ui/logo-carousel";
import ibkrLogo from "@/assets/ibkr-logo.png";
import capitalLogo from "@/assets/capital-logo.png";
import etoroLogo from "@/assets/etoro-logo.png";
import mt5Logo from "@/assets/mt5-logo.png";
import bybitLogo from "@/assets/bybit-logo.png";
import xmLogo from "@/assets/xm-logo.png";

function BinanceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 126.61 126.61" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="#f3ba2f">
        <path d="m38.73 53.2 24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.42 38.9l14.31 14.3z" />
        <path d="M0 63.31 14.3 49l14.31 14.31L14.3 77.61 0 63.31zM38.73 73.41l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88v-.03l14.31-14.28z" />
        <path d="m98.28 63.31 14.3-14.31L126.91 63.31 112.6 77.61l-14.32-14.3z" />
        <path d="M77.83 63.3 63.32 48.78 52.59 59.51l-1.246 1.25-2.465 2.46 14.51 14.52 14.51-14.52v.09.01z" />
      </g>
    </svg>
  );
}

function InteractiveBrokersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <img 
      src={ibkrLogo} 
      alt="Interactive Brokers" 
      className={props.className}
      style={{ objectFit: 'contain' }}
    />
  );
}

function CapitalComIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <img 
      src={capitalLogo} 
      alt="Capital.com" 
      className={props.className}
      style={{ objectFit: 'contain' }}
    />
  );
}

function EToroIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <img 
      src={etoroLogo} 
      alt="eToro" 
      className={props.className}
      style={{ objectFit: 'contain' }}
    />
  );
}


function XMIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <img 
      src={xmLogo} 
      alt="XM" 
      className={props.className}
      style={{ objectFit: 'contain' }}
    />
  );
}

function MT5Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <img 
      src={mt5Logo} 
      alt="MetaTrader 5" 
      className={props.className}
      style={{ objectFit: 'contain' }}
    />
  );
}

function BybitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <img 
      src={bybitLogo} 
      alt="Bybit" 
      className={props.className}
      style={{ objectFit: 'contain' }}
    />
  );
}

const brokerLogos: Logo[] = [
  { name: "Binance", id: 1, img: BinanceIcon },
  { name: "Interactive Brokers", id: 2, img: InteractiveBrokersIcon },
  { name: "Capital.com", id: 3, img: CapitalComIcon },
  { name: "eToro", id: 4, img: EToroIcon },
  { name: "XM", id: 5, img: XMIcon },
  { name: "MetaTrader 5", id: 6, img: MT5Icon },
  { name: "Bybit", id: 7, img: BybitIcon },
];

const BrokersCarousel = () => {
  return (
    <section className="py-16 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <GradientHeading variant="secondary" size="sm" className="mb-2">
            Trusted by traders worldwide
          </GradientHeading>
          <GradientHeading size="lg">
            Brokers Supported
          </GradientHeading>
        </div>
        
        <div className="flex justify-center">
          <LogoCarousel columnCount={4} logos={brokerLogos} />
        </div>
      </div>
    </section>
  );
};

export default BrokersCarousel;
