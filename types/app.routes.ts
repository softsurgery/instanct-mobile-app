import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type StackParamList = {
  "auth/Signin": { reset?: boolean };
  "auth/Signup": { reset?: boolean };
};

export type NavigationProps = NativeStackNavigationProp<StackParamList>;
