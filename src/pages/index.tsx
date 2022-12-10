import { Carousel, Embla } from "@mantine/carousel";
import { createStyles } from "@mantine/core";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import Ait1Image1 from "../../assets/ait1.jpg";
import Ait1Image2 from "../../assets/ait2.jpg";
import Ait1Image3 from "../../assets/ait3.png";

const Home: NextPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const [embla, setEmbla] = useState<Embla | null>(null);

  const carouselStyle = useCarouselStyle();

  useEffect(() => {
    if (status == "authenticated") router.push("/dashboard");

    return () => {};
  }, [status, router]);

  const handleScroll = useCallback(() => {
    console.log("callback");
    if (!embla) return;
  }, [embla]);

  useEffect(() => {
    console.log("use effect");
    if (embla) {
      embla.on("scroll", handleScroll);
      handleScroll();
    }
  }, [embla, handleScroll]);

  return (
    <>
      <Carousel
        dragFree
        slideSize="70%"
        slideGap="sm"
        height={600}
        getEmblaApi={setEmbla}
        initialSlide={0}
        loop={true}
        classNames={carouselStyle.classes}
      >
        <Carousel.Slide style={{ overflow: "hidden" }}>
          <Image
            src={Ait1Image1}
            alt="ait-placements-1"
            fill
            objectFit="cover"
          />
        </Carousel.Slide>
        <Carousel.Slide>
          <Image
            src={Ait1Image2}
            alt="ait-placements-1"
            fill
            objectFit="cover"
          />
        </Carousel.Slide>
        <Carousel.Slide>
          <Image
            src={Ait1Image3}
            alt="ait-placements-1"
            fill
            objectFit="cover"
          />
        </Carousel.Slide>
      </Carousel>
    </>
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
