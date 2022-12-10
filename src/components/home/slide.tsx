import { Box, Center, Text } from "@mantine/core";
import { StaticImageData } from "next/image";
import React from "react";

interface SlideProps {
  image: StaticImageData;
  text: string;
}

const Slide: React.FunctionComponent<SlideProps> = ({ image, text }) => {
  return (
    <Box mx="auto" sx={{ height: "100%" }}>
      <Center p="md" style={{ zIndex: 100 }}>
        <Text color="#fff">{text}</Text>
      </Center>
    </Box>
  );
};

export default Slide;
