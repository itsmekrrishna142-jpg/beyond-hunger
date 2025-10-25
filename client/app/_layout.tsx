import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="auth" 
        options={{ title: "Login / Register" }} 
      />
      <Stack.Screen 
        name="gallery" 
        options={{ title: "Photo Gallery" }} 
      />
      <Stack.Screen 
        name="services" 
        options={{ title: "Our Services" }} 
      />
      <Stack.Screen 
        name="booking" 
        options={{ title: "Book Session" }} 
      />
      <Stack.Screen 
        name="payment" 
        options={{ title: "Payment" }} 
      />
      <Stack.Screen 
        name="contact" 
        options={{ title: "Contact Support" }} 
      />
    </Stack>
  );
}