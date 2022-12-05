import { Carousel } from "@mantine/carousel";
import { createStyles } from "@mantine/core";
import Autoplay from "embla-carousel-autoplay";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import Ait1Image1 from "../../assets/ait1.jpg";
import Ait1Image2 from "../../assets/ait2.jpg";
import Ait1Image3 from "../../assets/ait3.png";

const Home: NextPage = () => {
  const autoplay = useRef(Autoplay({ delay: 2000 }));
  const carouselStyle = useCarouselStyle();
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status == "authenticated") router.push("/dashboard");

    return () => {};
  }, [status, router]);

  return (
    <Carousel
      withIndicators
      height={800}
      loop
      draggable
      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
      classNames={carouselStyle.classes}
    >
      <Carousel.Slide>
        <Image src={Ait1Image1} layout="fill" objectFit="cover" alt="ait" />
      </Carousel.Slide>
      <Carousel.Slide>
        <Image src={Ait1Image2} layout="fill" objectFit="cover" alt="ait" />
      </Carousel.Slide>
      <Carousel.Slide>
        <Image src={Ait1Image3} layout="fill" objectFit="cover" alt="ait" />
      </Carousel.Slide>
    </Carousel>
  );
};

export default Home;

const useCarouselStyle = createStyles((_theme, _params, getRef) => ({
  controls: {
    ref: getRef("controls"),
    transition: "opacity 150ms ease",
    opacity: 0,
  },

  root: {
    "&:hover": {
      [`& .${getRef("controls")}`]: {
        opacity: 1,
      },
    },
  },
  indicator: {
    width: 12,
    height: 4,
    transition: "width 250ms ease",

    "&[data-active]": {
      width: 40,
    },
  },
}));
