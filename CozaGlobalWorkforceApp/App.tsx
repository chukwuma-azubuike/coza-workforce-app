import React from "react";
import {
  Center,
  Heading,
  HStack,
  NativeBaseProvider,
  VStack,
} from "native-base";
import { ToggleDarkMode } from "./src/components/utils/ToggleDarkMode";
import { Image } from "react-native";
const cozaIcon = require("./src/assets/images/COZA-Logo-black.png");

const App = () => {
  return (
    <NativeBaseProvider>
      <Center
        _dark={{ bg: "blueGray.900" }}
        _light={{ bg: "blueGray.50" }}
        px={4}
        flex={1}
      >
        <VStack space={5} alignItems="center">
          <HStack>
            <Image
              resizeMode="center"
              source={cozaIcon}
              style={{
                width: 150,
                height: 150,
              }}
            />
          </HStack>
          <Heading size="lg">COZA Workforce App</Heading>
          <ToggleDarkMode />
        </VStack>
      </Center>
    </NativeBaseProvider>
  );
};
export default App;
